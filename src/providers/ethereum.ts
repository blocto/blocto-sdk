import invariant from 'invariant';
import { ProviderAccounts } from 'eip1193-provider';
import BloctoProvider from './blocto';
import Session from '../lib/session.d';
import {
  EIP1193RequestPayload,
  EthereumProviderConfig,
  EthereumProviderInterface,
  AddEthereumChainParameter,
} from './types/ethereum.d';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import {
  getItemWithExpiry,
  removeItem,
  setItemWithExpiry,
} from '../lib/localStorage';
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
import { EvmSupportMapping, getEvmSupport } from '../lib/getEvmSupport';

interface SwitchableNetwork {
  [id: number | string]: {
    name: string
    display_name: string
    network_type: string
    wallet_web_url: string
    rpc_url: string
  }
}

function parseChainId(chainId: string | number): number {
  if (typeof chainId === 'number') {
    return chainId;
  } else if (chainId.includes('0x')) {
    return parseInt(chainId, 16);
  }
  return parseInt(chainId, 10);
}

export default class EthereumProvider extends BloctoProvider implements EthereumProviderInterface {
  chainId: string | number; // current network id e.g.1
  networkId: string | number; // same as chainId
  chain: string; // network name "ethereum"
  net: string;
  rpc: string;
  server: string;
  accounts: Array<string> = [];
  supportNetwork: EvmSupportMapping = {};
  switchableNetwork: SwitchableNetwork = {};

  constructor({ chainId, rpc, server, appId }: EthereumProviderConfig) {
    super();
    invariant(chainId, "'chainId' is required");

    this.chainId = parseChainId(chainId);
    this.networkId = this.chainId;
    this.chain = ETH_CHAIN_ID_CHAIN_MAPPING[this.chainId];
    this.net = ETH_CHAIN_ID_NET_MAPPING[this.chainId];

    invariant(this.chain, `unsupported 'chainId': ${this.chainId}`);

    this.rpc = rpc || ETH_CHAIN_ID_RPC_MAPPING[this.chainId] || process.env.RPC || '';

    invariant(this.rpc, "'rpc' is required for Ethereum");

    this.server = server || ETH_CHAIN_ID_SERVER_MAPPING[this.chainId] || process.env.SERVER || '';
    this.appId = appId || process.env.APP_ID || DEFAULT_APP_ID;

    this.switchableNetwork[this.chainId] = {
      name: this.chain,
      display_name: this.chain,
      network_type: this.net,
      wallet_web_url: this.server,
      rpc_url: this.rpc,
    }
  }

  private checkAndAddNetwork({ chainId, rpcUrls }:{ chainId: number; rpcUrls: string[] }): void {
    const domain = new URL(rpcUrls[0]).hostname;
    const { chain_id, name, display_name, network_type, blocto_service_environment, rpc_endpoint_domains } =
      this.supportNetwork[chainId];
    if (rpc_endpoint_domains.includes(domain)) {
      const wallet_web_url = ETH_ENV_WALLET_SERVER_MAPPING[blocto_service_environment]
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

  private tryRetrieveSessionFromStorage(): void {
    // load previous connected state
    const session: Session | null = getItemWithExpiry<Session>(this.sessionKey, {});

    const sessionCode = session && session.code;
    const sessionAccount = session && session.address && session.address[this.chain];
    this.connected = Boolean(sessionCode && sessionAccount);
    this.code = sessionCode || null;
    this.accounts = sessionAccount ? [sessionAccount] : [];
  }

  private checkNetworkMatched() {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto && parseInt(existedSDK.chainId, 16) !== this.chainId) {
      throw new Error('Blocto SDK network mismatched');
    }
  }

  async loadSwitchableNetwork(
    networkList: {
      chainId: string
      rpcUrls?: string[]
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
          this.checkAndAddNetwork({ chainId: parseChainId(chain_id), rpcUrls });
        });
      }
      return null;
    });
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  async send(arg1: any, arg2: any) {
    switch (true) {
      // signature type 1: arg1 - JSON-RPC payload, arg2 - callback;
      case arg2 instanceof Function:
        return this.sendAsync(arg1, arg2);
      // signature type 2: arg1 - JSON-RPC method name, arg2 - params array;
      case typeof arg1 === 'string' && Array.isArray(arg2):
        return this.sendAsync({ method: arg1, params: arg2 });
      // signature type 3: arg1 - JSON-RPC payload(should be synchronous methods)
      default:
        return this.sendAsync(arg1);
    }
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  // web3 v1.x BatchRequest still depends on it so we need to implement anyway ¯\_(ツ)_/¯
  async sendAsync(payload: any, callback?: (argOrError: any, arg?: any) => any) {
    const handleRequest = new Promise((resolve) => {
      // web3 v1.x concat batched JSON-RPC requests to an array, handle it here
      if (Array.isArray(payload)) {
        // collect transactions and send batch with custom method
        const transactions = payload
          .filter(request => request.method === 'eth_sendTransaction')
          .map(request => request.params[0]);

        const idBase = Math.floor(Math.random() * 10000);

        const batchedRequestPayload = {
          method: 'blocto_sendBatchTransaction',
          params: transactions,
        };

        const batchResponsePromise = this.request(batchedRequestPayload);

        const requests = payload.map(({ method, params }, index) => (
          method === 'eth_sendTransaction'
            ? batchResponsePromise
            : this.request({
              id: idBase + index + 1,
              jsonrpc: '2.0',
              method,
              params,
            })));

        // resolve response when all request are executed
        Promise.allSettled(requests).then(responses =>
          resolve(
            responses.map((response, index) => ({
              id: idBase + index + 1,
              jsonrpc: '2.0',
              result: response.status === 'fulfilled' ? response.value : undefined,
              error: response.status !== 'fulfilled' ? response.reason : undefined,
            }))
          )
        );
      } else {
        this.request(payload).then(resolve);
      }
    });

    // execute callback or return promise, depdends on callback arg given or not
    if (callback) {
      handleRequest
        .then(data => callback(null, data))
        .catch(error => callback(error));
    } else {
      return handleRequest;
    }
  }

  async request(payload: EIP1193RequestPayload) {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.request(payload);
    }

    if (!this.connected) {
      await this.enable();
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'eth_requestAccounts':
          this.accounts = await this.fetchAccounts();
        // eslint-disable-next-line
        case 'eth_accounts':
          result = this.accounts;
          break;
        case 'eth_coinbase': {
          // eslint-disable-next-line
          result = this.accounts[0];
          break;
        }
        case 'eth_chainId': {
          result = this.chainId;
          result = `0x${result.toString(16)}`;
          break;
        }
        case 'net_version': {
          result = this.networkId || this.chainId;
          result = `0x${result.toString(16)}`;
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
          if (!payload?.params?.[0]?.chainId || !payload?.params?.[0]?.rpcUrls.length) {
            throw new Error('Invalid params');
          }
          await getEvmSupport().then((supportNetwork) => {
            this.supportNetwork = supportNetwork;
            this.checkAndAddNetwork({
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

          if (!this.switchableNetwork[parseChainId(payload.params[0].chainId)]) {
            const error: any = new Error(
              'This chain has not been added to SDK. Please try wallet_addEthereumChain first.'
            );
            error.code = 4902;
            throw error;
          }

          this.chainId = parseChainId(payload.params[0].chainId);
          this.networkId = this.chainId;
          this.chain = this.switchableNetwork[this.chainId].name;
          this.net = this.switchableNetwork[this.chainId].network_type;

          invariant(this.chain, `unsupported 'chainId': ${this.chainId}`);

          this.rpc = this.switchableNetwork[this.chainId].rpc_url;

          invariant(this.rpc, "'rpc' is required");

          this.server = this.switchableNetwork[this.chainId].wallet_web_url;
          this.accounts = await this.fetchAccounts()

          result = null;
          break;
        default:
          response = await this.handleReadRequests(payload);
      }

      if (response && !response.result && response.error) {
        const errorMessage = response.error.message ? response.error.message : 'Request failed';
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
  async enable(): Promise<ProviderAccounts> {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      if (parseInt(existedSDK.chainId, 16) !== this.chainId) {
        try {
          await existedSDK.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: `0x${this.chainId.toString(16)}` }],
          });
          this.accounts = [existedSDK.address];
        } catch (e) {
          console.error(e);
        }
      }
      return new Promise(((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(() => existedSDK.enable().then(resolve).catch(reject), 10))
      );
    }

    this.tryRetrieveSessionFromStorage();

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') { reject('Currently only supported in browser'); }

      if (this.connected) {
        return resolve(this.accounts);
      }

      const location = encodeURIComponent(window.location.origin);
      const loginFrame = createFrame(`${this.server}/${this.appId}/${this.chain}/authn?l6n=${location}`);

      attachFrame(loginFrame);

      addSelfRemovableHandler('message', (event: Event, removeListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server) {
          if (e.data.type === 'ETH:FRAME:RESPONSE') {
            removeListener();
            detatchFrame(loginFrame);

            this.code = e.data.code;
            this.connected = true;

            this.eventListeners.connect.forEach(listener => listener(this.chainId));
            const address = e.data.address;
            this.accounts = address ? [address[this.chain]] : [];

            setItemWithExpiry(this.sessionKey, {
              code: this.code,
              address,
            }, LOGIN_PERSISTING_TIME);

            resolve(this.accounts);
          }

          if (e.data.type === 'ETH:FRAME:CLOSE') {
            removeListener();
            detatchFrame(loginFrame);
            reject(new Error('User declined the login request'));
          }
        }
      });
    });
  }

  async fetchAccounts() {
    this.checkNetworkMatched();
    const { accounts } = await fetch(`${this.server}/api/${this.chain}/accounts`, {
      headers: {
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': this.code!,
      },
    }).then(response => responseSessionGuard<{ accounts: [] }>(response, this));
    this.accounts = accounts;
    return accounts;
  }

  async handleReadRequests(payload: EIP1193RequestPayload) {
    this.checkNetworkMatched();
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then(response => response.json());
  }

  async handleSign({ method, params }: EIP1193RequestPayload) {
    let message = '';
    if (Array.isArray(params)) {
      if (method === 'eth_sign') {
        message = params[1].slice(2);
      } else if (method === 'personal_sign') {
        message = params[0].slice(2);
      } else if (['eth_signTypedData', 'eth_signTypedData_v3', 'eth_signTypedData_v4'].includes(method)) {
        message = params[1];
        const { domain } = JSON.parse(message);
        if (domain.chainId !== this.chainId) {
          throw (new Error(`Provided chainId "${domain.chainId}" must match the active chainId "${this.chainId}"`));
        }
      }
    }

    this.checkNetworkMatched();
    const { signatureId } = await fetch(`${this.server}/api/${this.chain}/user-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': this.code!,
      },
      body: JSON.stringify({ method, message }),
    }).then(response => responseSessionGuard<{ signatureId: string }>(response, this));

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const url = `${this.server}/${this.appId}/${this.chain}/user-signature/${signatureId}`;
    const signFrame = createFrame(url);
    attachFrame(signFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'ETH:FRAME:RESPONSE') {
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
      })
    );
  }

  async handleSendTransaction(payload: EIP1193RequestPayload) {
    this.checkNetworkMatched();
    const { authorizationId } = await fetch(`${this.server}/api/${this.chain}/authz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': this.code!,
      },
      body: JSON.stringify(payload.params),
    }).then(response => responseSessionGuard<{ authorizationId: string }>(response, this));

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const authzFrame = createFrame(`${this.server}/${this.appId}/${this.chain}/authz/${authorizationId}`);

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'ETH:FRAME:RESPONSE') {
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
      })
    );
  }
  async handleDisconnect() : Promise<void> {
    this.connected = false;
    this.code = null;
    this.accounts = [];
    removeItem(KEY_SESSION);
  }
}
