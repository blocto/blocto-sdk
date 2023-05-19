import invariant from '../lib/invariant';
import { ProviderAccounts } from 'eip1193-provider';
import BloctoProvider from './blocto';
import {
  EIP1193RequestPayload,
  EthereumProviderConfig,
  EthereumProviderInterface,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcCallback,
} from './types/ethereum.d';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import { removeItem, setItemWithExpiry } from '../lib/localStorage';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  ETH_CHAIN_ID_RPC_MAPPING,
  ETH_CHAIN_ID_CHAIN_MAPPING,
  ETH_CHAIN_ID_NET_MAPPING,
  ETH_CHAIN_ID_SERVER_MAPPING,
  ETH_ENV_WALLET_SERVER_MAPPING,
  LOGIN_PERSISTING_TIME,
  DEFAULT_APP_ID,
} from '../constants';
import { KEY_SESSION } from '../lib/localStorage/constants';
import { isEmail } from '../lib/is';
import { EvmSupportMapping, getEvmSupport } from '../lib/getEvmSupport';

interface SwitchableNetwork {
  [id: number | string]: {
    name: string;
    display_name: string;
    network_type: string;
    wallet_web_url: string;
    rpc_url: string;
  };
}

function parseChainId(chainId: string | number | null): number {
  if (!chainId) {
    return 1;
  }
  if (typeof chainId === 'number') {
    return chainId;
  } else if (chainId.startsWith('0x')) {
    return parseInt(chainId, 16);
  }
  return parseInt(chainId, 10);
}

export default class EthereumProvider
  extends BloctoProvider
  implements EthereumProviderInterface
{
  chainId: `0x${string}`; // current chain id in hexadecimal
  networkVersion: string = '1'; // same as chainId but in decimal
  chain: string; // network name "ethereum"
  net: string;
  rpc: string;
  server: string;
  supportNetwork: EvmSupportMapping = {};
  switchableNetwork: SwitchableNetwork = {};

  constructor({
    chainId,
    rpc,
    server,
    appId,
    session,
  }: EthereumProviderConfig) {
    super(session);
    invariant(chainId, "'chainId' is required");

    this.networkVersion = String(parseChainId(chainId));
    this.chainId = `0x${parseInt(this.networkVersion, 16)}`;
    this.chain = ETH_CHAIN_ID_CHAIN_MAPPING[this.networkVersion];
    this.net = ETH_CHAIN_ID_NET_MAPPING[this.networkVersion];

    invariant(this.chain, `unsupported 'chainId': ${this.networkVersion}`);

    this.rpc = rpc || ETH_CHAIN_ID_RPC_MAPPING[this.networkVersion] || '';

    invariant(this.rpc, "'rpc' is required for Ethereum");

    this.server =
      server || ETH_CHAIN_ID_SERVER_MAPPING[this.networkVersion] || '';
    this.appId = appId || DEFAULT_APP_ID;

    this.switchableNetwork[this.networkVersion] = {
      name: this.chain,
      display_name: this.chain,
      network_type: this.net,
      wallet_web_url: this.server,
      rpc_url: this.rpc,
    };
  }

  #checkAndAddNetwork({
    chainId,
    rpcUrls,
  }: {
    chainId: number;
    rpcUrls: string[];
  }): void {
    const domain = new URL(rpcUrls[0]).hostname;
    const {
      chain_id,
      name,
      display_name,
      network_type,
      blocto_service_environment,
      rpc_endpoint_domains,
    } = this.supportNetwork[chainId];
    if (rpc_endpoint_domains.includes(domain)) {
      const wallet_web_url =
        ETH_ENV_WALLET_SERVER_MAPPING[blocto_service_environment];
      this.switchableNetwork[chain_id] = {
        name,
        display_name,
        network_type,
        wallet_web_url,
        rpc_url: rpcUrls[0],
      };
    } else {
      console.warn(`The rpc url ${rpcUrls[0]} is not supported.`);
    }
  }

  #checkNetworkMatched(): void {
    const existedSDK = (window as any).ethereum;
    if (
      existedSDK &&
      existedSDK.isBlocto &&
      existedSDK.chainId !== this.chainId
    ) {
      throw new Error('Blocto SDK network mismatched');
    }
  }

  async loadSwitchableNetwork(
    networkList: {
      chainId: string;
      rpcUrls?: string[];
    }[]
  ): Promise<null> {
    return getEvmSupport().then((result) => {
      // setup supported network
      this.supportNetwork = result;
      // setup switchable list if user set networkList
      if (networkList?.length) {
        networkList.forEach(({ chainId: chain_id, rpcUrls }) => {
          invariant(rpcUrls, 'rpcUrls is required for networksList');
          if (!rpcUrls?.length) throw new Error('Empty rpcUrls array');
          this.#checkAndAddNetwork({
            chainId: parseChainId(chain_id),
            rpcUrls,
          });
        });
      }
      return null;
    });
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#ethereum-send-deprecated
  async send(
    methodOrPayload: string | JsonRpcRequest,
    paramsOrCallback: Array<unknown> | JsonRpcCallback
  ): Promise<void | JsonRpcResponse> {
    switch (true) {
      // signature type 1: arg1 - JSON-RPC payload, arg2 - callback;
      // ethereum.send(payload: JsonRpcRequest, callback: JsonRpcCallback): void;
      // This signature is exactly like ethereum.sendAsync()
      case paramsOrCallback instanceof Function:
        return this.sendAsync(
          <JsonRpcRequest>methodOrPayload,
          <JsonRpcCallback>paramsOrCallback
        ) as Promise<void | JsonRpcResponse>;
      // signature type 2: arg1 - JSON-RPC method name, arg2 - params array;
      // ethereum.send(method: string, params?: Array<unknown>): Promise<JsonRpcResponse>;
      // This signature is like an async ethereum.sendAsync() with method and params as arguments,
      // instead of a JSON-RPC payload and callback
      case typeof methodOrPayload === 'string' &&
        Array.isArray(paramsOrCallback):
        return this.sendAsync({
          jsonrpc: '2.0',
          method: <string>methodOrPayload,
          params: <Array<any>>paramsOrCallback,
        }) as Promise<void | JsonRpcResponse>;
      // signature type 3: arg1 - JSON-RPC payload(should be synchronous methods)
      // ethereum.send(payload: JsonRpcRequest): unknown;
      // This signature enables you to call some type of RPC methods synchronously
      default:
        return this.sendAsync(
          <JsonRpcRequest>methodOrPayload
        ) as Promise<void | JsonRpcResponse>;
    }
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  // web3 v1.x BatchRequest still depends on it so we need to implement anyway ¯\_(ツ)_/¯
  async sendAsync(
    payload: JsonRpcRequest | Array<JsonRpcRequest>,
    callback?: JsonRpcCallback
  ): Promise<JsonRpcResponse | Array<JsonRpcResponse> | void> {
    const handleRequest: Promise<
      void | JsonRpcResponse | Array<JsonRpcResponse>
    > = new Promise((resolve) => {
      // web3 v1.x concat batched JSON-RPC requests to an array, handle it here
      if (Array.isArray(payload)) {
        // collect transactions and send batch with custom method
        const transactions = payload
          .filter((request) => request.method === 'eth_sendTransaction')
          .map((request) => request.params?.[0]);

        const idBase = Math.floor(Math.random() * 10000);

        const batchedRequestPayload = {
          method: 'blocto_sendBatchTransaction',
          params: transactions,
        };

        const batchResponsePromise = this.request(batchedRequestPayload);

        const requests = payload.map(({ method, params }, index) =>
          method === 'eth_sendTransaction'
            ? batchResponsePromise
            : this.request({
                id: idBase + index + 1,
                jsonrpc: '2.0',
                method,
                params,
              })
        );

        // resolve response when all request are executed
        Promise.allSettled(requests).then((responses) =>
          resolve(
            <Array<JsonRpcResponse>>responses.map((response, index) => {
              return {
                id: String(idBase + index + 1),
                jsonrpc: '2.0',
                method: payload[index].method,
                result:
                  response.status === 'fulfilled' ? response.value : undefined,
                error:
                  response.status !== 'fulfilled' ? response.reason : undefined,
              };
            })
          )
        );
      } else {
        this.request({ ...payload, id: Number(payload.id) }).then(resolve);
      }
    });

    // execute callback or return promise, depdends on callback arg given or not
    if (callback) {
      handleRequest
        .then((data) => callback(null, <JsonRpcResponse>(<unknown>data)))
        .catch((error) => callback(error));
    } else {
      return <JsonRpcResponse>(<unknown>handleRequest);
    }
  }

  async request(payload: EIP1193RequestPayload): Promise<any> {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.request(payload);
    }

    if (!this.session.connected) {
      const email = payload?.params?.[0];
      if (payload.method === 'eth_requestAccounts' && isEmail(email)) {
        await this.enable(email);
      } else {
        await this.enable();
      }
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'eth_requestAccounts':
          await this.fetchAccounts();
        // eslint-disable-next-line
        case 'eth_accounts':
          result = this.session.accounts[this.chain];
          break;
        case 'eth_coinbase': {
          // eslint-disable-next-line
          result = this.session.accounts[this.chain][0];
          break;
        }
        case 'eth_chainId': {
          result = this.chainId;
          break;
        }
        case 'net_version': {
          result = this.networkVersion;
          break;
        }
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v4':
        case 'personal_sign':
        case 'eth_sign': {
          result = await this.handleSign(payload);
          break;
        }
        case 'wallet_disconnect': {
          this.handleDisconnect();
          result = null;
          break;
        }
        case 'blocto_sendBatchTransaction':
        case 'eth_sendTransaction':
          result = await this.handleSendTransaction(payload);
          break;
        case 'eth_signTransaction':
        case 'eth_sendRawTransaction':
          result = null;
          break;
        case 'wallet_addEthereumChain':
          if (
            !payload?.params?.[0]?.chainId ||
            !payload?.params?.[0]?.rpcUrls.length
          ) {
            throw new Error('Invalid params');
          }
          await getEvmSupport().then((supportNetwork) => {
            this.supportNetwork = supportNetwork;
            this.#checkAndAddNetwork({
              chainId: parseChainId(payload?.params?.[0]?.chainId),
              rpcUrls: payload?.params?.[0].rpcUrls,
            });
          });
          result = null;
          break;
        case 'wallet_switchEthereumChain':
          if (!payload?.params?.[0]?.chainId) {
            throw new Error('Invalid params');
          }

          if (
            !this.switchableNetwork[parseChainId(payload.params[0].chainId)]
          ) {
            const error: any = new Error(
              'This chain has not been added to SDK. Please try wallet_addEthereumChain first.'
            );
            // Follows MetaMask return 4902, see https://docs.metamask.io/guide/rpc-api.html#wallet-switchethereumchain
            error.code = 4902;
            throw error;
          }

          this.networkVersion = String(parseChainId(payload.params[0].chainId));
          this.chainId = `0x${parseInt(this.networkVersion, 16)}`;
          this.chain = ETH_CHAIN_ID_CHAIN_MAPPING[this.networkVersion];
          this.net = ETH_CHAIN_ID_NET_MAPPING[this.networkVersion];

          invariant(
            this.chain,
            `unsupported 'chainId': ${this.networkVersion}`
          );

          this.rpc = this.switchableNetwork[this.networkVersion].rpc_url;

          invariant(this.rpc, "'rpc' is required");

          this.server =
            this.switchableNetwork[this.networkVersion].wallet_web_url;
          await this.fetchAccounts();
          this.eventListeners.chainChanged.forEach((listener) =>
            listener(this.networkVersion)
          );
          result = null;
          break;
        default:
          response = await this.handleReadRequests(payload);
      }

      if (response && !response.result && response.error) {
        const errorMessage = response.error.message
          ? response.error.message
          : 'Request failed';
        throw new Error(errorMessage);
      }

      if (response) return response.result;
      return result;
    } catch (error) {
      console.error(error);
      // this.emit("error", error);
      throw error;
    }
  }

  // eip-1102 alias
  // DEPRECATED API: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md
  async enable(email?: string): Promise<ProviderAccounts> {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      if (existedSDK.chainId !== this.chainId) {
        try {
          await existedSDK.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: this.chainId }],
          });
          this.session.accounts[this.chain] = [existedSDK.address];
        } catch (e) {
          console.error(e);
        }
      }
      return new Promise((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(() => existedSDK.enable().then(resolve).catch(reject), 10)
      );
    }

    this.tryRetrieveSessionFromStorage(this.chain);

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject('Currently only supported in browser');
      }

      if (this.session.connected) {
        return resolve(this.session.accounts[this.chain]);
      }

      const params = new URLSearchParams();
      params.set('l6n', window.location.origin);
      const emailParam = email && isEmail(email) ? `/${email}` : '';

      const loginFrame = createFrame(
        `${this.server}/${this.appId}/${
          this.chain
        }/authn${emailParam}?${params.toString()}`
      );

      attachFrame(loginFrame);

      addSelfRemovableHandler(
        'message',
        (event: Event, removeListener: () => void) => {
          const e = event as MessageEvent;
          if (e.origin === this.server) {
            if (e.data.type === 'ETH:FRAME:RESPONSE') {
              removeListener();
              detatchFrame(loginFrame);

              this.session.code = e.data.code;
              this.session.connected = true;

              this.eventListeners.connect.forEach((listener) =>
                listener(this.networkVersion)
              );
              const address = e.data.address;
              this.formatAndSetSessionAccount(address);

              setItemWithExpiry(
                this.sessionKey,
                {
                  code: this.session.code,
                  address,
                },
                LOGIN_PERSISTING_TIME
              );

              resolve(this.session.accounts[this.chain]);
            }

            if (e.data.type === 'ETH:FRAME:CLOSE') {
              removeListener();
              detatchFrame(loginFrame);
              reject(new Error('User declined the login request'));
            }
          }
        }
      );
    });
  }

  async fetchAccounts(): Promise<ProviderAccounts> {
    this.#checkNetworkMatched();
    const { accounts } = await fetch(
      `${this.server}/api/${this.chain}/accounts`,
      {
        headers: {
          // We already check the existence in the constructor
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Application-Identifier': this.appId!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Session-Identifier': this.session.code!,
        },
      }
    ).then((response) =>
      responseSessionGuard<{ accounts: [] }>(response, this)
    );
    this.session.accounts[this.chain] = accounts;
    return accounts;
  }

  async handleReadRequests(payload: EIP1193RequestPayload): Promise<any> {
    this.#checkNetworkMatched();
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then((response) => response.json());
  }

  async handleSign({ method, params }: EIP1193RequestPayload): Promise<string> {
    let message = '';
    if (Array.isArray(params)) {
      if (method === 'eth_sign') {
        message = params[1].slice(2);
      } else if (method === 'personal_sign') {
        message = params[0].slice(2);
      } else if (
        [
          'eth_signTypedData',
          'eth_signTypedData_v3',
          'eth_signTypedData_v4',
        ].includes(method)
      ) {
        message = params[1];
        const { domain } = JSON.parse(message);
        if (parseChainId(domain.chainId) !== parseChainId(this.chainId)) {
          throw new Error(
            `Provided chainId "${domain.chainId}" must match the active chainId "${this.chainId}"`
          );
        }
      }
    }

    this.#checkNetworkMatched();
    const { signatureId } = await fetch(
      `${this.server}/api/${this.chain}/user-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // We already check the existence in the constructor
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Application-Identifier': this.appId!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Session-Identifier': this.session.code!,
        },
        body: JSON.stringify({ method, message }),
      }
    ).then((response) =>
      responseSessionGuard<{ signatureId: string }>(response, this)
    );

    if (typeof window === 'undefined') {
      throw new Error('Currently only supported in browser');
    }

    const url = `${this.server}/${this.appId}/${this.chain}/user-signature/${signatureId}`;
    const signFrame = createFrame(url);
    attachFrame(signFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler(
        'message',
        (event: Event, removeEventListener: () => void) => {
          const e = event as MessageEvent;
          if (
            e.origin === this.server &&
            e.data.type === 'ETH:FRAME:RESPONSE'
          ) {
            if (e.data.status === 'APPROVED') {
              removeEventListener();
              detatchFrame(signFrame);
              resolve(e.data.signature);
            }

            if (e.data.status === 'DECLINED') {
              removeEventListener();
              detatchFrame(signFrame);
              reject(new Error(e.data.errorMessage));
            }
          }
        }
      )
    );
  }

  async handleSendTransaction(payload: EIP1193RequestPayload): Promise<string> {
    this.#checkNetworkMatched();
    const { authorizationId } = await fetch(
      `${this.server}/api/${this.chain}/authz`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // We already check the existence in the constructor
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Application-Identifier': this.appId!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Session-Identifier': this.session.code!,
        },
        body: JSON.stringify(payload.params),
      }
    ).then((response) =>
      responseSessionGuard<{ authorizationId: string }>(response, this)
    );

    if (typeof window === 'undefined') {
      throw new Error('Currently only supported in browser');
    }

    const authzFrame = createFrame(
      `${this.server}/${this.appId}/${this.chain}/authz/${authorizationId}`
    );

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler(
        'message',
        (event: Event, removeEventListener: () => void) => {
          const e = event as MessageEvent;
          if (
            e.origin === this.server &&
            e.data.type === 'ETH:FRAME:RESPONSE'
          ) {
            if (e.data.status === 'APPROVED') {
              removeEventListener();
              detatchFrame(authzFrame);
              resolve(e.data.txHash);
            }

            if (e.data.status === 'DECLINED') {
              removeEventListener();
              detatchFrame(authzFrame);
              reject(new Error(e.data.errorMessage));
            }
          }
        }
      )
    );
  }
  async handleDisconnect(): Promise<void> {
    this.session.connected = false;
    this.session.code = null;
    this.session.accounts = {};
    removeItem(KEY_SESSION);
  }
}
