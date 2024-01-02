import invariant from '../lib/invariant';
import type { Types as AptosTypes } from 'aptos';
import BloctoProvider from './blocto';
import {
  AptosProviderConfig,
  AptosProviderInterface,
  NetworkInfo,
  PublicAccount,
  WalletAdapterNetwork,
  TxOptions,
  SignMessagePayload,
  SignMessageResponse,
} from './types/aptos.d';
import { createFrame, attachFrame, detachFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import {
  setAccountStorage,
  getAccountStorage,
  removeChainAddress,
  getChainAddress,
  setChainAddress,
} from '../lib/storage';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  APT_CHAIN_ID_SERVER_MAPPING,
  APT_CHAIN_ID_NAME_MAPPING,
  APT_CHAIN_ID_RPC_MAPPING,
  DEFAULT_APP_ID,
  APT_SESSION_KEY_MAPPING,
  SDK_VERSION,
  KEY_SESSION,
  CHAIN,
} from '../constants';

const checkMessagePayloadFormat = (payload: SignMessagePayload) => {
  const formattedPayload: Partial<SignMessagePayload> = { ...payload };
  const { message, nonce, address, application, chainId } = payload;

  if (typeof message !== 'string') {
    formattedPayload.message = String(message) ?? '';
  }
  if (typeof nonce !== 'string') {
    formattedPayload.nonce = String(nonce) ?? '';
  }
  if (address && typeof address !== 'boolean') {
    formattedPayload.address = !!address;
  }
  if (application && typeof application !== 'boolean') {
    formattedPayload.application = !!application;
  }
  if (chainId && typeof chainId !== 'boolean') {
    formattedPayload.chainId = !!chainId;
  }
  return formattedPayload;
};

export default class AptosProvider
  extends BloctoProvider
  implements AptosProviderInterface
{
  publicKey: string[] = [];
  authKey = '';
  server: string;
  chainId: number;
  networkName: WalletAdapterNetwork;
  api?: string;
  sessionKey: KEY_SESSION;

  private get existedSDK() {
    return (window as any).bloctoAptos;
  }

  constructor({ chainId, server, appId }: AptosProviderConfig) {
    super();

    invariant(chainId, "'chainId' is required");
    invariant(
      appId,
      'It is necessary to interact with Blocto wallet via your app id. Please visit https://developers.blocto.app for more details.'
    );

    this.chainId = chainId;
    this.networkName = APT_CHAIN_ID_NAME_MAPPING[chainId];
    this.api = APT_CHAIN_ID_RPC_MAPPING[chainId];
    this.sessionKey = APT_SESSION_KEY_MAPPING[chainId];

    const defaultServer = APT_CHAIN_ID_SERVER_MAPPING[chainId];

    this.appId = appId || DEFAULT_APP_ID;
    this.server = server || defaultServer || '';
  }

  get publicAccount(): PublicAccount {
    return {
      address: getChainAddress(this.sessionKey, CHAIN.APTOS)?.[0] || null,
      publicKey: this.publicKey.length ? this.publicKey : null,
      // @todo: provide authkey
      authKey: null,
      minKeysRequired: 2,
    };
  }

  async network(): Promise<NetworkInfo> {
    return {
      name: this.networkName,
      api: this.api,
      chainId: this.chainId.toString(),
    };
  }

  async isConnected(): Promise<boolean> {
    return !!getChainAddress(this.sessionKey, CHAIN.APTOS)?.length;
  }

  async signTransaction(
    transaction: unknown
  ): Promise<AptosTypes.SubmitTransactionRequest> {
    if (this.existedSDK) {
      return this.existedSDK.signTransaction(transaction);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!getChainAddress(this.sessionKey, CHAIN.APTOS)?.length) {
      throw new Error('Fail to get account');
    }
    throw new Error('signTransaction method not supported.');
  }

  async disconnect(): Promise<void> {
    if (this.existedSDK) {
      await this.existedSDK.disconnect();
      return;
    }
    removeChainAddress(this.sessionKey, CHAIN.APTOS);
    this.eventListeners?.disconnect.forEach((listener) =>
      listener({
        code: 4900,
        message: 'Wallet disconnected',
      })
    );
  }

  async signAndSubmitTransaction(
    transaction: AptosTypes.TransactionPayload,
    txOptions: TxOptions = {}
  ): Promise<{ hash: AptosTypes.HexEncodedBytes }> {
    if (this.existedSDK) {
      return this.existedSDK.signAndSubmitTransaction(transaction, txOptions);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!getChainAddress(this.sessionKey, CHAIN.APTOS)?.length) {
      throw new Error('Fail to get account');
    }
    const sessionId = getAccountStorage(this.sessionKey)?.code || '';
    const { authorizationId } = await fetch(`${this.server}/api/aptos/authz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        'Blocto-Session-Identifier': sessionId,
      },
      body: JSON.stringify({ ...transaction, ...txOptions }),
    }).then((response) =>
      responseSessionGuard<{ authorizationId: string }>(
        response,
        this.sessionKey
      )
    );

    if (typeof window === 'undefined') {
      throw new Error('Currently only supported in browser');
    }

    const authzFrame = createFrame(
      `${this.server}/${this.appId}/aptos/authz/${authorizationId}`
    );

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler(
        'message',
        (event: Event, removeEventListener: () => void) => {
          const e = event as MessageEvent;
          if (
            e.origin === this.server &&
            e.data.type === 'APTOS:FRAME:RESPONSE'
          ) {
            if (e.data.status === 'APPROVED') {
              removeEventListener();
              detachFrame(authzFrame);
              resolve({ hash: e.data.txHash });
            }

            if (e.data.status === 'DECLINED') {
              removeEventListener();
              detachFrame(authzFrame);
              if (e.data.errorCode === 'incorrect_session_id') {
                this.disconnect();
              }
              reject(new Error(e.data.errorMessage));
            }
          }
        }
      )
    );
  }

  async signMessage(payload: SignMessagePayload): Promise<SignMessageResponse> {
    const formattedPayload = checkMessagePayloadFormat(payload);

    if (this.existedSDK) {
      return this.existedSDK.signMessage(formattedPayload);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!getChainAddress(this.sessionKey, CHAIN.APTOS)?.length) {
      throw new Error('Fail to get account');
    }

    if (typeof window === 'undefined') {
      throw new Error('Currently only supported in browser');
    }
    const sessionId = getAccountStorage(this.sessionKey)?.code || '';
    const { signatureId } = await fetch(
      `${this.server}/api/aptos/user-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // We already check the existence in the constructor
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          'Blocto-Application-Identifier': this.appId!,
          'Blocto-Session-Identifier': sessionId,
        },
        body: JSON.stringify(formattedPayload),
      }
    ).then((response) =>
      responseSessionGuard<{ signatureId: string }>(response, this.sessionKey)
    );

    const url = `${this.server}/${this.appId}/aptos/user-signature/${signatureId}`;
    const signFrame = createFrame(url);

    attachFrame(signFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler(
        'message',
        (event: Event, removeEventListener: () => void) => {
          const e = event as MessageEvent;
          if (
            e.origin === this.server &&
            e.data.type === 'APTOS:FRAME:RESPONSE'
          ) {
            if (e.data.status === 'APPROVED') {
              removeEventListener();
              detachFrame(signFrame);
              resolve(e.data);
            }

            if (e.data.status === 'DECLINED') {
              removeEventListener();
              detachFrame(signFrame);
              if (e.data.errorCode === 'incorrect_session_id') {
                this.disconnect();
              }
              reject(new Error(e.data.errorMessage));
            }
          }
        }
      )
    );
  }

  async connect(): Promise<PublicAccount> {
    if (this.existedSDK) {
      return new Promise((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(
          () => this.existedSDK.connect().then(resolve).catch(reject),
          10
        )
      );
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject('Currently only supported in browser');
      }

      if (getChainAddress(this.sessionKey, CHAIN.APTOS)?.length) {
        return resolve({
          address: getChainAddress(this.sessionKey, CHAIN.APTOS)?.[0] || null,
          publicKey: this.publicKey,
          authKey: null,
          minKeysRequired: 2,
        });
      }

      const location = encodeURIComponent(window.location.origin);
      const loginFrame = createFrame(
        `${this.server}/${this.appId}/aptos/authn?l6n=${location}&v=${SDK_VERSION}}`
      );

      attachFrame(loginFrame);

      addSelfRemovableHandler(
        'message',
        async (event: Event, removeListener: () => void) => {
          const e = event as MessageEvent;
          if (e.origin === this.server) {
            if (e.data.type === 'APTOS:FRAME:RESPONSE') {
              removeListener();
              detachFrame(loginFrame);
              setAccountStorage(
                this.sessionKey,
                {
                  code: e.data.code,
                  accounts: {
                    [CHAIN.APTOS]: [e.data.addr],
                  },
                },
                e.data.exp
              );
              if (e.data?.isAccountChanged) {
                postMessage({
                  originChain: CHAIN.APTOS,
                  type: 'BLOCTO_SDK:ACCOUNT_CHANGED',
                });
              }
              addSelfRemovableHandler(
                'message',
                (event: Event, removeListener: () => void) => {
                  const messageEvent = event as MessageEvent;
                  if (
                    messageEvent.data?.type === 'BLOCTO_SDK:ACCOUNT_CHANGED' &&
                    messageEvent.data?.originChain !== CHAIN.APTOS
                  ) {
                    this.disconnect();
                    removeListener();
                  }
                }
              );
              if (getChainAddress(this.sessionKey, CHAIN.APTOS)?.length) {
                try {
                  const { public_keys: publicKeys } = await fetch(
                    `${this.server}/blocto/aptos/accounts/${
                      getChainAddress(this.sessionKey, CHAIN.APTOS)?.[0]
                    }`
                  ).then((response) => response.json());
                  this.publicKey = publicKeys || [];

                  resolve({
                    address:
                      getChainAddress(this.sessionKey, CHAIN.APTOS)?.[0] || '',
                    publicKey: this.publicKey,
                    authKey: null,
                    minKeysRequired: 2,
                  });
                } catch (err: any) {
                  return reject(e);
                }
              } else {
                // @todo: better error
                return reject();
              }
            }

            if (e.data.type === 'APTOS:FRAME:CLOSE') {
              removeListener();
              detachFrame(loginFrame);
              reject(new Error('User declined the login request'));
            }
          }
        }
      );
    });
  }

  async fetchAddress(): Promise<string> {
    const sessionId = getAccountStorage(this.sessionKey)?.code || '';
    const { accounts } = await fetch(`${this.server}/api/aptos/accounts`, {
      headers: {
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        'Blocto-Session-Identifier': sessionId,
      },
    }).then((response) =>
      responseSessionGuard<{ accounts: string[] }>(response, this.sessionKey)
    );
    setChainAddress(this.sessionKey, CHAIN.APTOS, accounts);
    return accounts?.[0] || '';
  }

  override on(event: string, listener: (arg: any) => void): void {
    if (this.existedSDK) this.existedSDK.on(event, listener);

    super.on(event, listener);
  }

  override removeListener(event: string, listener: (arg: any) => void): void {
    if (this.existedSDK) this.existedSDK.off(event, listener);

    super.removeListener(event, listener);
  }

  off = this.removeListener;
}
