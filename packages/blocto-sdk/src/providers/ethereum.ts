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
  SwitchableNetwork,
  IUserOperation,
} from './types/ethereum.d';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import {
  setAccountStorage,
  getAccountStorage,
  getEvmAddress,
  setEvmAddress,
  removeAllEvmAddress,
} from '../lib/storage';
import responseSessionGuard, {
  ICustomError,
} from '../lib/responseSessionGuard';
import {
  ETH_RPC_LIST,
  ETH_ENV_WALLET_SERVER_MAPPING,
  DEFAULT_APP_ID,
  ETH_SESSION_KEY_MAPPING,
  SDK_VERSION,
  KEY_SESSION,
  CHAIN,
} from '../constants';
import { isEmail } from '../lib/isEmail';
import {
  isValidTransaction,
  isValidTransactions,
} from '../lib/isValidTransaction';
import { EvmSupportMapping, getEvmSupport } from '../lib/getEvmSupport';
import { ethErrors } from 'eth-rpc-errors';
import { isHexString, utf8ToHex } from '../lib/utf8toHex';

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
  networkVersion: `${number}` = '1'; // same as chainId but in decimal
  rpc: string;
  injectedWalletServer?: string;
  appId: string;
  _blocto: {
    sessionKey: KEY_SESSION;
    walletServer: string;
    blockchainName: string;
    networkType: string;
    supportNetworkList: EvmSupportMapping;
    switchableNetwork: SwitchableNetwork;
  };

  constructor({ chainId, rpc, walletServer, appId }: EthereumProviderConfig) {
    super();
    // setup chainId
    invariant(chainId, "'chainId' is required");
    this.networkVersion = `${parseChainId(chainId)}`;
    this.chainId = `0x${parseChainId(chainId).toString(16)}`;
    // setup rpc
    this.rpc = rpc || ETH_RPC_LIST[this.networkVersion];
    invariant(this.rpc, "'rpc' is required");
    // setup injectedWalletServer
    this.injectedWalletServer = walletServer;
    // NOTE: _blocto is not fully initialized yet at this point
    // Any function should call #getBloctoProperties() to get the full _blocto properties
    this._blocto = {
      sessionKey: KEY_SESSION.prod,
      walletServer: this.injectedWalletServer || '',
      blockchainName: '',
      networkType: '',
      supportNetworkList: {},
      switchableNetwork: {},
    };
    this.appId = appId || DEFAULT_APP_ID;
  }

  async #getBloctoProperties(): Promise<EthereumProvider['_blocto']> {
    if (!Object.keys(this._blocto.supportNetworkList).length) {
      await getEvmSupport()
        .then((result) => (this._blocto.supportNetworkList = result))
        .catch((e) => {
          throw ethErrors.provider.custom({
            code: 1001,
            message: `Get blocto server failed: ${e.message}`,
          });
        });
    }
    const {
      chain_id,
      name,
      network_type,
      blocto_service_environment,
      display_name,
    } = this._blocto.supportNetworkList[this.networkVersion] ?? {};
    if (!chain_id)
      throw ethErrors.provider.unsupportedMethod(
        `Get support chain failed: ${this.networkVersion} might not be supported yet.`
      );
    this._blocto = {
      ...this._blocto,
      sessionKey: ETH_SESSION_KEY_MAPPING[blocto_service_environment],
      walletServer:
        this.injectedWalletServer ||
        ETH_ENV_WALLET_SERVER_MAPPING[blocto_service_environment],
      blockchainName: name,
      networkType: network_type,
      switchableNetwork: {
        ...this._blocto.switchableNetwork,
        [chain_id]: {
          name,
          display_name,
          network_type,
          wallet_web_url: this._blocto.walletServer,
          rpc_url: this.rpc,
        },
      },
    };
    return this._blocto;
  }

  async #addToSwitchable({
    chainId,
    rpcUrls,
  }: {
    chainId: `${number}`;
    rpcUrls: string[];
  }): Promise<void> {
    const { supportNetworkList } = await this.#getBloctoProperties();
    const {
      chain_id,
      name,
      display_name,
      network_type,
      blocto_service_environment,
    } = supportNetworkList[chainId] ?? {};
    if (!chain_id)
      throw ethErrors.provider.unsupportedMethod(
        `Get support chain failed: ${chainId} might not be supported yet.`
      );
    const wallet_web_url =
      ETH_ENV_WALLET_SERVER_MAPPING[blocto_service_environment];
    this._blocto.switchableNetwork[chain_id] = {
      name,
      display_name,
      network_type,
      wallet_web_url,
      rpc_url: rpcUrls[0],
    };
  }

  #checkNetworkMatched(): void {
    const existedSDK = (window as any).ethereum;
    if (
      existedSDK &&
      existedSDK.isBlocto &&
      parseChainId(existedSDK.chainId) !== parseChainId(this.chainId)
    ) {
      throw ethErrors.provider.chainDisconnected();
    }
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
        Promise.allSettled(requests)
          .then((responses) =>
            resolve(
              <Array<JsonRpcResponse>>responses.map((response, index) => {
                return {
                  id: String(idBase + index + 1),
                  jsonrpc: '2.0',
                  method: payload[index].method,
                  result:
                    response.status === 'fulfilled'
                      ? response.value
                      : undefined,
                  error:
                    response.status !== 'fulfilled'
                      ? response.reason
                      : undefined,
                };
              })
            )
          )
          .catch((error) => {
            throw ethErrors.rpc.internal(error?.message);
          });
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

  /**
   * Sending userOperation using Blocto SDK.
   * @param {IUserOperation} userOp - userOperation object
   * @remarks No need to include nonce, initCode, and signature as parameters when using BloctoSDK to send userOperation.
   * These parameters will be ignored.
   * @returns {Promise<string>} - userOperation hash
   */
  async sendUserOperation(userOp: IUserOperation): Promise<string> {
    return this.request({
      method: 'eth_sendUserOperation',
      params: [userOp],
    });
  }

  async request(payload: EIP1193RequestPayload): Promise<any> {
    if (!payload?.method) throw ethErrors.rpc.invalidRequest();

    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      if (payload.method === 'wallet_switchEthereumChain') {
        if (!payload?.params?.[0]?.chainId) {
          throw ethErrors.rpc.invalidParams();
        }
        return existedSDK.request(payload).then(() => {
          this.networkVersion = `${parseChainId(payload?.params?.[0].chainId)}`;
          this.chainId = `0x${parseChainId(
            payload?.params?.[0].chainId
          ).toString(16)}`;
          this.rpc = switchableNetwork?.[this.networkVersion]?.rpc_url;
          return null;
        });
      }
      return existedSDK.request(payload);
    }

    const { blockchainName, switchableNetwork, sessionKey } =
      await this.#getBloctoProperties();

    // method that doesn't require user to be connected
    switch (payload.method) {
      case 'eth_chainId': {
        return this.chainId;
      }
      case 'net_version': {
        return this.networkVersion;
      }
      case 'wallet_addEthereumChain': {
        return this.loadSwitchableNetwork(payload?.params || []);
      }
      case 'eth_call': {
        const response = await this.handleReadRequests(payload);
        if (!response || (response && !response.result && response.error)) {
          const errorMessage = response?.error?.message
            ? response.error.message
            : 'Request failed';
          throw ethErrors.rpc.internal(errorMessage);
        }
        return response.result;
      }
      case 'wallet_switchEthereumChain': {
        return this.handleSwitchChain(payload?.params?.[0]?.chainId);
      }
      case 'wallet_disconnect': {
        return this.handleDisconnect();
      }
    }

    // Method that requires user to be connected
    if (!getEvmAddress(sessionKey, blockchainName)) {
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
          result = getEvmAddress(sessionKey, blockchainName);
          break;
        case 'eth_coinbase': {
          result = getEvmAddress(sessionKey, blockchainName)?.[0];
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
        case 'eth_sendTransaction':
          result = await this.handleSendTransaction(payload);
          break;
        case 'blocto_sendBatchTransaction':
          result = await this.handleSendBatchTransaction(payload);
          break;
        case 'eth_signTransaction':
        case 'eth_sendRawTransaction': {
          throw ethErrors.rpc.methodNotSupported(
            'Method Not Supported: ' + payload.method
          );
        }
        case 'eth_sendUserOperation':
          result = await this.handleSendUserOperation(payload);
          break;
        case 'eth_estimateUserOperationGas':
        case 'eth_getUserOperationByHash':
        case 'eth_getUserOperationReceipt':
        case 'eth_supportedEntryPoints':
          result = await this.handleBundler(payload);
          break;
        default:
          response = await this.handleReadRequests(payload);
      }

      if (response && !response.result && response.error) {
        const errorMessage = response.error.message
          ? response.error.message
          : 'Request failed';
        throw ethErrors.rpc.internal(errorMessage);
      }

      if (response) return response.result;
      return result;
    } catch (error: any) {
      throw ethErrors.rpc.internal(error?.message);
    }
  }

  async bloctoApi<T>(url: string, options?: RequestInit): Promise<T> {
    const { walletServer, blockchainName, sessionKey } =
      await this.#getBloctoProperties();
    const sessionId = getAccountStorage(sessionKey)?.code || '';
    if (!sessionId) {
      throw ethErrors.provider.unauthorized();
    }
    return fetch(`${walletServer}/api/${blockchainName}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': sessionId,
      },
      ...options,
    })
      .then((response) =>
        responseSessionGuard<T>(response, sessionKey, () => {
          this.eventListeners?.disconnect.forEach((listener) =>
            listener(ethErrors.provider.disconnected())
          );
        })
      )
      .catch((e: ICustomError) => {
        if (e?.error_code === 'unsupported_method') {
          throw ethErrors.rpc.methodNotSupported(
            'Method Not Supported: ' + e.message
          );
        } else {
          throw ethErrors.rpc.server({
            code: -32005,
            message: `Blocto server error: ${e.message}`,
          });
        }
      });
  }

  async responseListener(
    frame: HTMLIFrameElement,
    objectKey: string
  ): Promise<any> {
    const { walletServer } = await this.#getBloctoProperties();
    return new Promise((resolve, reject) =>
      addSelfRemovableHandler(
        'message',
        (event: Event, removeEventListener: () => void) => {
          const e = event as MessageEvent;
          if (
            e.origin === walletServer &&
            e.data.type === 'ETH:FRAME:RESPONSE'
          ) {
            if (e.data.status === 'APPROVED') {
              removeEventListener();
              detatchFrame(frame);
              resolve(e.data[objectKey]);
            }

            if (e.data.status === 'DECLINED') {
              removeEventListener();
              detatchFrame(frame);
              if (e.data.errorCode === 'incorrect_session_id') {
                this.handleDisconnect();
              }
              reject(
                ethErrors.provider.userRejectedRequest(e.data.errorMessage)
              );
            }
          }
          if (e.data.type === 'ETH:FRAME:CLOSE') {
            removeEventListener();
            detatchFrame(frame);
            reject(
              ethErrors.provider.userRejectedRequest(
                'User declined the request'
              )
            );
          }
        }
      )
    );
  }

  async setIframe(
    url: string,
    blockchain?: string
  ): Promise<HTMLIFrameElement> {
    if (typeof window === 'undefined') {
      throw ethErrors.provider.custom({
        code: 1001,
        message: 'Blocto SDK only works in browser environment',
      });
    }
    const { walletServer, blockchainName } = await this.#getBloctoProperties();
    const frame = createFrame(
      `${walletServer}/${this.appId}/${blockchain || blockchainName}${url}`
    );
    attachFrame(frame);
    return frame;
  }

  // eip-1102 alias
  // DEPRECATED API: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md
  async enable(email?: string): Promise<ProviderAccounts> {
    const { walletServer, blockchainName, sessionKey } =
      await this.#getBloctoProperties();

    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      if (existedSDK.chainId !== this.chainId) {
        await existedSDK.request({
          method: 'wallet_addEthereumChain',
          params: [{ chainId: this.chainId }],
        });
        await existedSDK.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.chainId }],
        });
        setEvmAddress(sessionKey, blockchainName, [existedSDK.address]);
      }
      return new Promise((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(() => existedSDK.enable().then(resolve).catch(reject), 10)
      );
    }

    const address = getEvmAddress(sessionKey, blockchainName);
    if (address) {
      return new Promise((resolve) => {
        resolve(address);
      });
    }

    const params = new URLSearchParams();
    params.set('l6n', window.location.origin);
    params.set('v', SDK_VERSION);
    const emailParam = email && isEmail(email) ? `/${email}` : '';
    const loginFrame = await this.setIframe(
      `/authn${emailParam}?${params.toString()}`
    );

    return new Promise((resolve, reject) => {
      addSelfRemovableHandler(
        'message',
        (event: Event, removeListener: () => void) => {
          const e = event as MessageEvent;
          if (e.origin === walletServer) {
            if (e.data.type === 'ETH:FRAME:RESPONSE') {
              removeListener();
              detatchFrame(loginFrame);
              this.eventListeners?.connect.forEach((listener) =>
                listener({ chainId: this.chainId })
              );
              setAccountStorage(
                sessionKey,
                {
                  code: e.data.code,
                  evm: {
                    [blockchainName]: [e.data.addr],
                  },
                },
                e.data.exp
              );
              if (e.data?.isAccountChanged) {
                postMessage({
                  originChain: CHAIN.ETHEREUM,
                  type: 'BLOCTO_SDK:ACCOUNT_CHANGED',
                });
              }
              addSelfRemovableHandler(
                'message',
                (event: Event, removeListener: () => void) => {
                  const messageEvent = event as MessageEvent;
                  if (
                    messageEvent.data?.type === 'BLOCTO_SDK:ACCOUNT_CHANGED' &&
                    messageEvent.data?.originChain !== CHAIN.ETHEREUM
                  ) {
                    this.handleDisconnect();
                    removeListener();
                  }
                }
              );
              resolve([e.data.addr]);
            }

            if (e.data.type === 'ETH:FRAME:CLOSE') {
              removeListener();
              detatchFrame(loginFrame);
              reject(ethErrors.provider.userRejectedRequest());
            }
          }
        }
      );
    });
  }

  async fetchAccounts(): Promise<ProviderAccounts> {
    this.#checkNetworkMatched();
    const { blockchainName, sessionKey } = await this.#getBloctoProperties();
    const { accounts } = await this.bloctoApi<{ accounts: [] }>(`/accounts`);
    setEvmAddress(sessionKey, blockchainName, accounts);
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
    })
      .then((response) => response.json())
      .catch((e) => {
        throw ethErrors.rpc.internal(e);
      });
  }

  async handleSign({ method, params }: EIP1193RequestPayload): Promise<string> {
    let message = '';
    if (Array.isArray(params)) {
      if (method === 'eth_sign') {
        message = isHexString(params[1])
          ? params[1].slice(2)
          : utf8ToHex(params[1]);
      } else if (method === 'personal_sign') {
        message = isHexString(params[0])
          ? params[0].slice(2)
          : utf8ToHex(params[0]);
      } else if (
        [
          'eth_signTypedData',
          'eth_signTypedData_v3',
          'eth_signTypedData_v4',
        ].includes(method)
      ) {
        message = params[1];
        const { domain } = JSON.parse(message);
        if (isHexString(domain.chainId)) {
          throw ethErrors.rpc.invalidParams(
            `Provided chainId "${domain.chainId}" must be a number`
          );
        }
        if (parseChainId(domain.chainId) !== parseChainId(this.chainId)) {
          throw ethErrors.rpc.invalidParams(
            `Provided chainId "${
              domain.chainId
            }" must match the active chainId "${parseChainId(this.chainId)}"`
          );
        }
      }
    }

    this.#checkNetworkMatched();
    const { signatureId } = await this.bloctoApi<{ signatureId: string }>(
      `/user-signature`,
      { method: 'POST', body: JSON.stringify({ method, message }) }
    );
    const signFrame = await this.setIframe(`/user-signature/${signatureId}`);
    return this.responseListener(signFrame, 'signature');
  }

  private async handleSwitchChain(
    targetChainId: string | number
  ): Promise<null> {
    if (!targetChainId) {
      throw ethErrors.rpc.invalidParams();
    }
    const { walletServer, blockchainName, sessionKey, switchableNetwork } =
      await this.#getBloctoProperties();
    const oldAccount = getEvmAddress(sessionKey, blockchainName)?.[0];
    const oldChainId = parseChainId(this.chainId);
    const newChainId = parseChainId(targetChainId);
    if (oldChainId === newChainId) {
      return null;
    }
    if (!switchableNetwork[newChainId]) {
      throw ethErrors.provider.custom({
        code: 4902, // To-be-standardized "unrecognized chain ID" error
        message: `Unrecognized chain ID "${newChainId}". Try adding the chain using wallet_addEthereumChain first.`,
      });
    }
    this.networkVersion = `${newChainId}`;
    this.chainId = `0x${newChainId.toString(16)}`;
    this.rpc = switchableNetwork[newChainId].rpc_url;
    if (!oldAccount) {
      this.eventListeners?.chainChanged.forEach((listener) =>
        listener(this.chainId)
      );
      this.#getBloctoProperties();
      return null;
    }
    // Go login flow when switching to a different blocto server
    if (
      switchableNetwork[newChainId].wallet_web_url !==
      switchableNetwork[oldChainId].wallet_web_url
    ) {
      return this.enable()
        .then(([newAccount]) => {
          if (newAccount !== oldAccount) {
            this.eventListeners?.accountsChanged.forEach((listener) =>
              listener([newAccount])
            );
          }
          this.eventListeners.chainChanged.forEach((listener) =>
            listener(this.chainId)
          );
          return null;
        })
        .catch((error) => {
          this.networkVersion = `${oldChainId}`;
          this.chainId = `0x${oldChainId.toString(16)}`;
          this.rpc = switchableNetwork[oldChainId].rpc_url;
          this.#getBloctoProperties();
          throw error;
        });
    }

    const switchChainFrame = await this.setIframe(
      `/switch-chain?to=${switchableNetwork[newChainId].name}`,
      switchableNetwork[oldChainId].name
    );
    return new Promise((resolve, reject) => {
      addSelfRemovableHandler(
        'message',
        (event: Event, removeListener: () => void) => {
          const e = event as MessageEvent;
          if (e.origin === walletServer) {
            if (e.data.type === 'ETH:FRAME:RESPONSE') {
              removeListener();
              detatchFrame(switchChainFrame);
              if (e.data?.addr && oldAccount) {
                setAccountStorage(
                  sessionKey,
                  {
                    code: e.data?.code,
                    evm: {
                      [switchableNetwork[newChainId].name]: [e.data.addr],
                    },
                  },
                  e.data?.exp
                );
                if (e.data.addr !== oldAccount) {
                  this.eventListeners?.accountsChanged.forEach((listener) =>
                    listener([e.data.addr])
                  );
                }
              }
              this.eventListeners?.chainChanged.forEach((listener) =>
                listener(this.chainId)
              );
              this.#getBloctoProperties();
              resolve(null);
            }

            if (e.data.type === 'ETH:FRAME:CLOSE') {
              removeListener();
              detatchFrame(switchChainFrame);
              if (e.data?.hasApprovedSwitchChain) {
                this.eventListeners?.chainChanged.forEach((listener) =>
                  listener(this.chainId)
                );
                removeAllEvmAddress(sessionKey);
                this.eventListeners?.disconnect.forEach((listener) =>
                  listener(ethErrors.provider.disconnected())
                );
                this.#getBloctoProperties();
                resolve(null);
              } else {
                this.networkVersion = `${oldChainId}`;
                this.chainId = `0x${oldChainId.toString(16)}`;
                this.rpc = switchableNetwork[oldChainId].rpc_url;
                reject(ethErrors.provider.userRejectedRequest());
              }
            }
          }
        }
      );
    });
  }

  async handleSendTransaction(payload: EIP1193RequestPayload): Promise<string> {
    this.#checkNetworkMatched();
    const { isValid, invalidMsg } = isValidTransaction(payload.params?.[0]);
    if (!isValid) {
      throw ethErrors.rpc.invalidParams(invalidMsg);
    }
    return this.#createAuthzFrame(payload.params);
  }

  async handleSendBatchTransaction(
    payload: EIP1193RequestPayload
  ): Promise<string> {
    this.#checkNetworkMatched();

    const extractParams = (params: Array<any>): Array<any> =>
      params.map((param) =>
        'params' in param
          ? param.params[0] // handle passing web3.eth.sendTransaction.request(...) as a parameter with params
          : param
      );
    const formatParams = extractParams(payload.params as Array<any>);
    const copyPayload = { ...payload, params: formatParams };

    const { isValid, invalidMsg } = isValidTransactions(copyPayload.params);
    if (!isValid) {
      throw ethErrors.rpc.invalidParams(invalidMsg);
    }

    return this.#createAuthzFrame(copyPayload.params);
  }

  async #createAuthzFrame(params: EIP1193RequestPayload['params']) {
    const { authorizationId } = await this.bloctoApi<{
      authorizationId: string;
    }>(`/authz`, { method: 'POST', body: JSON.stringify(params) });
    const authzFrame = await this.setIframe(`/authz/${authorizationId}`);
    return this.responseListener(authzFrame, 'txHash');
  }

  async handleSendUserOperation(
    payload: EIP1193RequestPayload
  ): Promise<string> {
    this.#checkNetworkMatched();
    const { authorizationId } = await this.bloctoApi<{
      authorizationId: string;
    }>(`/user-operation`, {
      method: 'POST',
      body: JSON.stringify(payload.params),
    });
    const userOPFrame = await this.setIframe(
      `/user-operation/${authorizationId}`
    );
    return this.responseListener(userOPFrame, 'userOpHash');
  }

  async handleBundler(payload: EIP1193RequestPayload): Promise<JSON> {
    this.#checkNetworkMatched();
    return this.bloctoApi<JSON>(`/rpc/bundler`, {
      method: 'POST',
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    });
  }

  async handleDisconnect(): Promise<void> {
    const existedSDK = (window as any).ethereum;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.disconnect();
    }
    const { sessionKey } = await this.#getBloctoProperties();
    removeAllEvmAddress(sessionKey);
    this.eventListeners?.disconnect.forEach((listener) =>
      listener(ethErrors.provider.disconnected())
    );
  }

  async loadSwitchableNetwork(
    networkList: {
      chainId: string;
      rpcUrls?: string[];
    }[]
  ): Promise<null> {
    // setup switchable list if user set networkList
    if (networkList?.length) {
      const listToAdd = networkList.map(({ chainId, rpcUrls }) => {
        if (!chainId) throw ethErrors.rpc.invalidParams('Empty chainId');
        const parsedChainId: `${number}` = `${parseChainId(chainId)}`;
        // skip if chainId already exists
        if (this._blocto.switchableNetwork[parsedChainId]) return null;
        const parsedRpc = rpcUrls?.[0] || ETH_RPC_LIST[parsedChainId];
        if (!parsedRpc) throw ethErrors.rpc.invalidParams('rpcUrls required');
        return this.#addToSwitchable({
          chainId: parsedChainId,
          rpcUrls: [parsedRpc],
        });
      });
      return Promise.all(listToAdd).then(() => null);
    } else {
      throw ethErrors.rpc.invalidParams('Empty networkList');
    }
  }
}
