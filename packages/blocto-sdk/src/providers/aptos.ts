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
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import { removeItem, setItemWithExpiry } from '../lib/localStorage';
import { KEY_SESSION } from '../lib/localStorage/constants';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  APT_CHAIN_ID_SERVER_MAPPING,
  APT_CHAIN_ID_NAME_MAPPING,
  APT_CHAIN_ID_RPC_MAPPING,
  LOGIN_PERSISTING_TIME,
  DEFAULT_APP_ID,
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

  constructor({ chainId, server, appId, session }: AptosProviderConfig) {
    super(session);

    invariant(chainId, "'chainId' is required");
    invariant(
      appId,
      'It is necessary to interact with Blocto wallet via your app id. Please visit https://developers.blocto.app for more details.'
    );

    this.chainId = chainId;
    this.networkName = APT_CHAIN_ID_NAME_MAPPING[chainId];
    this.api = APT_CHAIN_ID_RPC_MAPPING[chainId];

    const defaultServer = APT_CHAIN_ID_SERVER_MAPPING[chainId];

    this.appId = appId || DEFAULT_APP_ID;
    this.server = server || defaultServer || '';
  }

  get publicAccount(): PublicAccount {
    return {
      address: this.session.accounts.aptos[0] || null,
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
    return this.session.connected;
  }

  async signTransaction(
    transaction: unknown
  ): Promise<AptosTypes.SubmitTransactionRequest> {
    const existedSDK = (window as any).bloctoAptos;
    if (existedSDK) {
      return existedSDK.signTransaction(transaction);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!this.session.accounts.aptos.length) {
      throw new Error('Fail to get account');
    }
    throw new Error('signTransaction method not supported.');
  }

  async disconnect(): Promise<void> {
    const existedSDK = (window as any).bloctoAptos;
    if (existedSDK) {
      await existedSDK.disconnect();
      return;
    }
    this.session.code = null;
    this.session.accounts = {};
    this.session.connected = false;
    removeItem(KEY_SESSION);
  }

  async signAndSubmitTransaction(
    transaction: AptosTypes.TransactionPayload,
    txOptions: TxOptions = {}
  ): Promise<{ hash: AptosTypes.HexEncodedBytes }> {
    const existedSDK = (window as any).bloctoAptos;

    if (existedSDK) {
      return existedSDK.signAndSubmitTransaction(transaction, txOptions);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!this.session.accounts.aptos.length) {
      throw new Error('Fail to get account');
    }

    const { authorizationId } = await fetch(`${this.server}/api/aptos/authz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': this.session.code!,
      },
      body: JSON.stringify({ ...transaction, ...txOptions }),
    }).then((response) =>
      responseSessionGuard<{ authorizationId: string }>(response, this)
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
              detatchFrame(authzFrame);
              resolve({ hash: e.data.txHash });
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

  async signMessage(payload: SignMessagePayload): Promise<SignMessageResponse> {
    const existedSDK = (window as any).bloctoAptos;

    const formattedPayload = checkMessagePayloadFormat(payload);

    if (existedSDK) {
      return existedSDK.signMessage(formattedPayload);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!this.session.accounts.aptos.length) {
      throw new Error('Fail to get account');
    }

    if (typeof window === 'undefined') {
      throw new Error('Currently only supported in browser');
    }

    const { signatureId } = await fetch(
      `${this.server}/api/aptos/user-signature`,
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
        body: JSON.stringify(formattedPayload),
      }
    ).then((response) =>
      responseSessionGuard<{ signatureId: string }>(response, this)
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
              detatchFrame(signFrame);
              resolve(e.data);
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

  async connect(): Promise<PublicAccount> {
    const existedSDK = (window as any).bloctoAptos;
    if (existedSDK) {
      return new Promise((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(() => existedSDK.connect().then(resolve).catch(reject), 10)
      );
    }

    this.tryRetrieveSessionFromStorage('aptos');

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject('Currently only supported in browser');
      }

      if (this.session.connected && this.session.accounts.aptos.length) {
        return resolve({
          address: this.session.accounts.aptos[0],
          publicKey: this.publicKey,
          authKey: null,
          minKeysRequired: 2,
        });
      }

      const location = encodeURIComponent(window.location.origin);
      // [VI]{version}[/VI] will inject the version of the SDK by versionInjector
      const loginFrame = createFrame(
        `${this.server}/${this.appId}/aptos/authn?l6n=${location}&v=[VI]{version}[/VI]`
      );

      attachFrame(loginFrame);

      addSelfRemovableHandler(
        'message',
        async (event: Event, removeListener: () => void) => {
          const e = event as MessageEvent;
          if (e.origin === this.server) {
            if (e.data.type === 'APTOS:FRAME:RESPONSE') {
              removeListener();
              detatchFrame(loginFrame);

              this.session.code = e.data.code;
              this.session.connected = true;

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

              if (this.session.accounts.aptos.length) {
                try {
                  const { public_keys: publicKeys } = await fetch(
                    `${this.server}/blocto/aptos/accounts/${this.session.accounts.aptos[0]}`
                  ).then((response) => response.json());
                  this.publicKey = publicKeys || [];

                  resolve({
                    address: this.session.accounts.aptos[0] || '',
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
              detatchFrame(loginFrame);
              reject(new Error('User declined the login request'));
            }
          }
        }
      );
    });
  }

  async fetchAddress(): Promise<string> {
    const { accounts } = await fetch(`${this.server}/api/aptos/accounts`, {
      headers: {
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': this.session.code!,
      },
    }).then((response) =>
      responseSessionGuard<{ accounts: string[] }>(response, this)
    );
    this.session.accounts.aptos = accounts || [];
    return this.session.accounts.aptos[0];
  }
}
