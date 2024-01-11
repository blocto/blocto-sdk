import invariant from '../lib/invariant';
import { ProviderAccounts } from 'eip1193-provider';
import BloctoProvider from './blocto';
import {
  EIP1193RequestPayload,
  EthereumProviderConfig,
  EthereumProviderInterface,
  AddEthereumChainParameter,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcCallback,
  SwitchableNetwork,
  IUserOperation,
  PromiseResponseItem,
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
import { getEvmSupport } from '../lib/getEvmSupport';
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
    unloadedNetwork?: AddEthereumChainParameter[];
    sessionKeyEnv: KEY_SESSION;
    walletServer: string;
    blockchainName: string;
    networkType: string;
    switchableNetwork: SwitchableNetwork;
  };

  private get existedSDK() {
    return (window as any).ethereum;
  }

  constructor(config: EthereumProviderConfig) {
    super();
    this.injectedWalletServer = config.walletServer;
    this._blocto = {
      sessionKeyEnv: KEY_SESSION.prod,
      walletServer: this.injectedWalletServer || '',
      blockchainName: '',
      networkType: '',
      switchableNetwork: {},
    };
    this.appId = config.appId || DEFAULT_APP_ID;
    if ('chainId' in config) {
      const { chainId, rpc } = config;
      invariant(chainId, "'chainId' is required");
      this.networkVersion = `${parseChainId(chainId)}`;
      this.chainId = `0x${parseChainId(chainId).toString(16)}`;
      // setup rpc
      this.rpc = rpc || ETH_RPC_LIST[this.networkVersion];
      invariant(this.rpc, "'rpc' is required");
    } else {
      const { defaultChainId, switchableChains } = config;
      invariant(defaultChainId, "'defaultChainId' is required");
      this.networkVersion = `${parseChainId(defaultChainId)}`;
      this.chainId = `0x${parseChainId(defaultChainId).toString(16)}`;
      // get config from switchableChains array
      const chainConfig = switchableChains.find(
        (chain) => parseChainId(chain.chainId) === parseChainId(defaultChainId)
      );
      if (!chainConfig) {
        throw ethErrors.provider.custom({
          code: 1001,
          message: `Chain ${defaultChainId} is not in switchableChains list`,
        });
      }
      this.rpc = chainConfig.rpcUrls?.[0] || ETH_RPC_LIST[this.networkVersion];
      invariant(this.rpc, "'rpc' is required");
      this._blocto.unloadedNetwork = switchableChains;
    }
  }

  async #getBloctoProperties(): Promise<EthereumProvider['_blocto']> {
    if (this._blocto?.unloadedNetwork) {
      await this.loadSwitchableNetwork(this._blocto.unloadedNetwork);
      delete this._blocto.unloadedNetwork;
    }
    if (
      this._blocto.sessionKeyEnv &&
      this._blocto.walletServer &&
      this._blocto.blockchainName &&
      this._blocto.networkType &&
      this._blocto.switchableNetwork
    ) {
      return this._blocto;
    }
    const supportNetworkList = await getEvmSupport().catch((e) => {
      throw ethErrors.provider.custom({
        code: 1001,
        message: `Get blocto server failed: ${e.message}`,
      });
    });
    const {
      chain_id,
      name,
      network_type,
      blocto_service_environment,
      display_name,
    } = supportNetworkList[this.networkVersion] ?? {};
    if (!chain_id) {
      throw ethErrors.provider.unsupportedMethod(
        `Get support chain failed: ${this.networkVersion} might not be supported yet.`
      );
    }
    const walletServer =
      this.injectedWalletServer ||
      ETH_ENV_WALLET_SERVER_MAPPING[blocto_service_environment];
    this._blocto = {
      ...this._blocto,
      sessionKeyEnv: ETH_SESSION_KEY_MAPPING[blocto_service_environment],
      walletServer,
      blockchainName: name,
      networkType: network_type,
      switchableNetwork: {
        ...this._blocto.switchableNetwork,
        [chain_id]: {
          name,
          display_name,
          network_type,
          wallet_web_url: walletServer,
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
    await this.#getBloctoProperties();
    const supportNetworkList = await getEvmSupport().catch((e) => {
      throw ethErrors.provider.custom({
        code: 1001,
        message: `Get blocto server failed: ${e.message}`,
      });
    });
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
    if (
      this.existedSDK?.isBlocto &&
      parseChainId(this.existedSDK.chainId) !== parseChainId(this.chainId)
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
    payload:
      | JsonRpcRequest
      | Array<JsonRpcRequest>
      | Array<EIP1193RequestPayload>,
    callback?: JsonRpcCallback
  ): Promise<JsonRpcResponse | Array<JsonRpcResponse> | void> {
    const separateRequests = (payload: Array<JsonRpcRequest>) => {
      return payload.reduce(
        (
          acc: {
            sendRequests: JsonRpcResponse[];
            otherRequests: Promise<JsonRpcResponse>[];
          },
          request: JsonRpcRequest
        ) => {
          if (request.method === 'eth_sendTransaction') {
            acc.sendRequests.push(request.params?.[0]);
          } else {
            acc.otherRequests.push(
              this.request(request as EIP1193RequestPayload)
            );
          }
          return acc;
        },
        { sendRequests: [], otherRequests: [] }
      );
    };

    function createBaseResponse(item: JsonRpcResponse): JsonRpcResponse {
      return {
        id: String(item.id),
        jsonrpc: '2.0',
        method: item.method,
      };
    }

    function processResponses(
      payload: JsonRpcRequest[],
      responses: PromiseResponseItem[]
    ): JsonRpcResponse[] {
      const processedResponses: JsonRpcResponse[] = [];
      let responseIndex = 1;
      payload.forEach((item) => {
        const baseResponse = createBaseResponse(item as JsonRpcResponse);
        if (item.method === 'eth_sendTransaction') {
          baseResponse.result = responses[0].value;
          baseResponse.error =
            responses[0].status !== 'fulfilled'
              ? responses[0].reason
              : undefined;
        } else {
          if (responseIndex < responses.length) {
            baseResponse.result = responses[responseIndex].value;
            baseResponse.error =
              responses[responseIndex].status !== 'fulfilled'
                ? responses[responseIndex].reason
                : undefined;
            responseIndex++;
          }
        }
        processedResponses.push(baseResponse);
      });

      return processedResponses;
    }

    const handleRequest: Promise<
      void | JsonRpcResponse | Array<JsonRpcResponse>
    > = new Promise((resolve) => {
      // web3 v1.x concat batched JSON-RPC requests to an array, handle it here
      if (Array.isArray(payload)) {
        const { sendRequests, otherRequests } = separateRequests(
          payload as Array<JsonRpcRequest>
        );

        // collect transactions and send batch with custom method
        const batchReqPayload = {
          method: 'wallet_sendMultiCallTransaction',
          params: [sendRequests, false],
        };
        const isSendRequestsEmpty = sendRequests.length === 0;
        const idBase = Math.floor(Math.random() * 10000);
        const allPromise = isSendRequestsEmpty
          ? [...otherRequests]
          : [this.request(batchReqPayload), ...otherRequests];

        // resolve response when all request are executed
        Promise.allSettled(allPromise)
          .then((responses) => {
            if (isSendRequestsEmpty) {
              return resolve(
                <Array<JsonRpcResponse>>responses.map((response, index) => {
                  return {
                    id: String(payload[index]?.id || idBase + index + 1),
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
              );
            }
            const originalLengthResponse = processResponses(
              payload as JsonRpcRequest[],
              responses
            );

            return resolve(<Array<JsonRpcResponse>>originalLengthResponse);
          })
          .catch((error) => {
            throw ethErrors.rpc.internal(error?.message);
          });
      } else {
        this.request({ ...payload, id: Number(payload.id) }).then(resolve);
      }
    });

    // execute callback or return promise, depdends on callback arg given or not
    if (typeof callback === 'function') {
      handleRequest
        .then((data) => {
          return callback(null, <JsonRpcResponse>(<unknown>data));
        })
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

  async request(
    payload: EIP1193RequestPayload | Array<EIP1193RequestPayload>
  ): Promise<any> {
    // web3.js v4 batch entry point
    if (Array.isArray(payload)) {
      return this.sendAsync(payload);
    }
    if (!payload?.method) throw ethErrors.rpc.invalidRequest();

    const { blockchainName, switchableNetwork, sessionKeyEnv } =
      await this.#getBloctoProperties();

    if (this.existedSDK?.isBlocto) {
      if (payload.method === 'wallet_switchEthereumChain') {
        if (!payload?.params?.[0]?.chainId) {
          throw ethErrors.rpc.invalidParams();
        }
        return this.existedSDK.request(payload).then(() => {
          this.networkVersion = `${parseChainId(payload?.params?.[0].chainId)}`;
          this.chainId = `0x${parseChainId(
            payload?.params?.[0].chainId
          ).toString(16)}`;
          this.rpc = switchableNetwork?.[this.networkVersion]?.rpc_url;
          return null;
        });
      }
      return this.existedSDK.request(payload);
    }

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
      case 'eth_blockNumber':
      case 'web3_clientVersion':
      case 'eth_call': {
        const response = await this.handleReadRequests(payload);
        if (!response || (response && !response.result && response.error)) {
          const errorMessage = response?.error?.message
            ? response.error.message
            : 'Request failed';
          throw ethErrors.rpc.internal(errorMessage);
        }
        if (typeof payload?.callback === 'function') {
          payload.callback(null, response.result);
        }
        return response.result;
      }
      case 'wallet_switchEthereumChain': {
        return this.handleSwitchChain(payload?.params?.[0]?.chainId);
      }
      case 'wallet_disconnect': {
        return this.handleDisconnect();
      }
      case 'eth_accounts': {
        return getEvmAddress(sessionKeyEnv, blockchainName) || [];
      }
    }

    // Method that requires user to be connected
    if (!getEvmAddress(sessionKeyEnv, blockchainName)) {
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
        case 'eth_requestAccounts': {
          result = await this.fetchAccounts();
          break;
        }
        // eslint-disable-next-line
        case 'eth_coinbase': {
          result = getEvmAddress(sessionKeyEnv, blockchainName)?.[0];
          break;
        }
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v4':
        case 'personal_sign': {
          result = await this.handleSign(payload);
          break;
        }
        case 'eth_sign':
          throw ethErrors.rpc.methodNotFound(
            'Method Not Supported: eth_sign has been disabled'
          );
        case 'eth_sendTransaction':
          result = await this.handleSendTransaction(payload);
          break;
        case 'wallet_sendMultiCallTransaction':
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
    const { walletServer, blockchainName, sessionKeyEnv } =
      await this.#getBloctoProperties();
    const sessionId = getAccountStorage(sessionKeyEnv)?.code || '';
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
        responseSessionGuard<T>(response, sessionKeyEnv, () => {
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
    const { walletServer, blockchainName, sessionKeyEnv } =
      await this.#getBloctoProperties();

    if (this.existedSDK?.isBlocto) {
      if (this.existedSDK.chainId !== this.chainId) {
        await this.existedSDK.request({
          method: 'wallet_addEthereumChain',
          params: [{ chainId: this.chainId }],
        });
        await this.existedSDK.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.chainId }],
        });
        setEvmAddress(sessionKeyEnv, blockchainName, [this.existedSDK.address]);
      }
      return new Promise((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(
          () => this.existedSDK.enable().then(resolve).catch(reject),
          10
        )
      );
    }

    const address = getEvmAddress(sessionKeyEnv, blockchainName);
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
                sessionKeyEnv,
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
                  const isAccountChanged =
                    messageEvent.data?.type === 'BLOCTO_SDK:ACCOUNT_CHANGED';
                  const isAnotherChain =
                    messageEvent.data?.originChain !== CHAIN.ETHEREUM;
                  if (isAccountChanged) {
                    this.eventListeners?.accountsChanged.forEach((listener) =>
                      listener([e.data.addr])
                    );
                  }
                  if (isAccountChanged && isAnotherChain) {
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
    const { blockchainName, sessionKeyEnv } = await this.#getBloctoProperties();
    const { accounts } = await this.bloctoApi<{ accounts: [] }>(`/accounts`);
    setEvmAddress(sessionKeyEnv, blockchainName, accounts);
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
      if (method === 'personal_sign') {
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
    const { walletServer, blockchainName, sessionKeyEnv, switchableNetwork } =
      await this.#getBloctoProperties();
    const oldAccount = getEvmAddress(sessionKeyEnv, blockchainName)?.[0];
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
    this._blocto = {
      ...this._blocto,
      blockchainName: '',
      networkType: '',
    };
    if (!oldAccount) {
      this.eventListeners?.chainChanged.forEach((listener) =>
        listener(this.chainId)
      );
      await this.#getBloctoProperties();
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
          this._blocto = {
            ...this._blocto,
            blockchainName: '',
            networkType: '',
          };
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
                  sessionKeyEnv,
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
                removeAllEvmAddress(sessionKeyEnv);
                this.eventListeners?.disconnect.forEach((listener) =>
                  listener(ethErrors.provider.disconnected())
                );
                this.#getBloctoProperties();
                resolve(null);
              } else {
                this.networkVersion = `${oldChainId}`;
                this.chainId = `0x${oldChainId.toString(16)}`;
                this.rpc = switchableNetwork[oldChainId].rpc_url;
                this._blocto = {
                  ...this._blocto,
                  blockchainName: '',
                  networkType: '',
                };
                this.#getBloctoProperties();
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

    let originalParams, revertFlag;
    if (Array.isArray(payload.params) && payload.params.length >= 2) {
      [originalParams, revertFlag] = payload.params;
    } else {
      originalParams = payload.params;
      revertFlag = false;
    }

    const revert = revertFlag ? revertFlag : false;

    const { isValid, invalidMsg } = isValidTransactions(originalParams);
    if (!isValid) {
      throw ethErrors.rpc.invalidParams(invalidMsg);
    }
    return this.#createAuthzFrame(originalParams, revert);
  }

  async #createAuthzFrame(
    params: EIP1193RequestPayload['params'],
    revert = true
  ) {
    const { authorizationId } = await this.bloctoApi<{
      authorizationId: string;
    }>(`/authz`, {
      method: 'POST',
      body: JSON.stringify([params, revert]),
    });
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
    if (this.existedSDK?.isBlocto) {
      return this.existedSDK.request({ method: 'wallet_disconnect' });
    }
    const { sessionKeyEnv } = await this.#getBloctoProperties();
    removeAllEvmAddress(sessionKeyEnv);
    this.eventListeners?.disconnect.forEach((listener) =>
      listener(ethErrors.provider.disconnected())
    );
  }

  async loadSwitchableNetwork(
    networkList: AddEthereumChainParameter[]
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

  async supportChainList(): Promise<{ chainId: string; chainName: string }[]> {
    const supportNetworkList = await getEvmSupport().catch((e) => {
      throw ethErrors.provider.custom({
        code: 1001,
        message: `Get blocto server failed: ${e.message}`,
      });
    });
    return Object.keys(supportNetworkList).map((chainId) => {
      const { display_name } = supportNetworkList[chainId];
      return {
        chainId,
        chainName: display_name,
      };
    });
  }

  override on(event: string, listener: (arg: any) => void): void {
    if (this.existedSDK?.isBlocto) this.existedSDK.on(event, listener);

    super.on(event, listener);
  }

  override removeListener(event: string, listener: (arg: any) => void): void {
    if (this.existedSDK?.isBlocto) this.existedSDK.off(event, listener);

    super.removeListener(event, listener);
  }

  off = this.removeListener;
}
