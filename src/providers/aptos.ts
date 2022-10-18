import invariant from 'invariant';
import { HexEncodedBytes, SubmitTransactionRequest } from 'aptos';
import type { SignMessagePayload, SignMessageResponse } from 'aptos';
import BloctoProvider from './blocto';
import Session from '../lib/session.d';
import { AptosProviderConfig, AptosProviderInterface, NetworkInfo, PublicAccount, WalletAdapterNetwork } from './types/aptos.d';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import {
  getItemWithExpiry,
  setItemWithExpiry,
} from '../lib/localStorage';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  APT_CHAIN_ID_SERVER_MAPPING,
  APT_CHAIN_ID_NAME_MAPPING,
  APT_CHAIN_ID_RPC_MAPPING,
  LOGIN_PERSISTING_TIME,
} from '../constants';

export default class AptosProvider extends BloctoProvider implements AptosProviderInterface {
  publicKey: string[] = [];
  address?: string;
  authKey = '';
  server: string;
  chainId: number;
  networkName: WalletAdapterNetwork;
  api?: string;

  private tryRetrieveSessionFromStorage(): void {
    // load previous connected state
    const session: Session | null = getItemWithExpiry<Session>(this.sessionKey, {});

    const sessionCode = session && session.code;
    const sessionAccount = session && session.address && session.address[this.chainId];
    this.code = sessionCode || null;
    this.address = sessionAccount || undefined;
  }

  constructor({ chainId, server, appId }: AptosProviderConfig) {
    super();
    invariant(chainId, "'chainId' is required");
    this.chainId = chainId;
    this.networkName = APT_CHAIN_ID_NAME_MAPPING[chainId];
    this.api = APT_CHAIN_ID_RPC_MAPPING[chainId];

    const defaultServer = APT_CHAIN_ID_SERVER_MAPPING[chainId];

    this.appId = appId || process.env.APP_ID;
    this.server = server || defaultServer || process.env.SERVER || '';
  }

  get publicAccount(): PublicAccount {
    return {
      address: this.address || null,
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

  async isConnected(): Promise<boolean> { return !!this.address; }

  async signTransaction(transaction: any): Promise<SubmitTransactionRequest> {
    const existedSDK = (window as any).bloctoAptos;
    if (existedSDK) {
      return existedSDK.signTransaction(transaction);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!this.address) {
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
    this.code = null;
    this.address = undefined;
  }

  async signAndSubmitTransaction(transaction: any): Promise<{ hash: HexEncodedBytes }> {
    const existedSDK = (window as any).bloctoAptos;
    if (existedSDK) {
      return existedSDK.signAndSubmitTransaction(transaction);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!this.address) {
      throw new Error('Fail to get account');
    }

    const { authorizationId } = await fetch(`${this.server}/api/aptos/authz?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    }).then(response => responseSessionGuard<{ authorizationId: string }>(response, this));

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const authzFrame = createFrame(`${this.server}/authz/aptos/${authorizationId}`);

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'APTOS:FRAME:RESPONSE') {
          if (e.data.status === 'APPROVED') {
            removeEventListener();
            detatchFrame(authzFrame);
            resolve({ hash: e.data.txHash });
          }

          if (e.data.status === 'DECLINED') {
            removeEventListener();
            detatchFrame(authzFrame);
            reject(new Error('User declined to send the transaction'));
          }
        }
      })
    );
  }

  async signMessage(payload: SignMessagePayload): Promise<SignMessageResponse> {
    const existedSDK = (window as any).bloctoAptos;

    if (existedSDK) {
      return existedSDK.signMessage(payload);
    }

    const hasConnected = await this.isConnected();
    if (!hasConnected) {
      await this.connect();
    }
    if (!this.address) {
      throw new Error('Fail to get account');
    }

    const url = `${this.server}/user-signature/aptos`;
    const signFrame = createFrame(url);

    attachFrame(signFrame);

    addSelfRemovableHandler('message', (event: Event, removeListener: () => void) => {
      const e = event as MessageEvent;
      if (e.origin === this.server && e.data.type === 'APTOS:FRAME:READY') {
        if (signFrame.contentWindow) {
          signFrame.contentWindow.postMessage({
            type: 'APTOS:FRAME:READY:RESPONSE',
            ...payload,
          }, url);
        }
        removeListener();
      }
    });

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler('message', (event: Event, removeEventListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server && e.data.type === 'APTOS:FRAME:RESPONSE') {
          if (e.data.status === 'APPROVED') {
            removeEventListener();
            detatchFrame(signFrame);
            resolve({
              address: e.data.address,
              application: e.data.application,
              chainId: e.data.chainId,
              fullMessage: e.data.fullMessage,
              message: payload.message,
              nonce: payload.nonce,
              prefix: 'APTOS', // Should always be APTOS
              signature: e.data.signature,
              bitmap: e.data.bitmap,
            });
          }

          if (e.data.status === 'DECLINED') {
            removeEventListener();
            detatchFrame(signFrame);
            reject(new Error('User declined the signing request'));
          }
        }
      })
    );
  }

  async connect(): Promise<PublicAccount> {
    const existedSDK = (window as any).bloctoAptos;
    if (existedSDK) {
      return new Promise(((resolve, reject) =>
        // add a small delay to make sure the network has been switched
        setTimeout(() => existedSDK.connect().then(resolve).catch(reject), 10))
      );
    }

    this.tryRetrieveSessionFromStorage();

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') { reject('Currently only supported in browser'); }

      if (this.connected && this.address) {
        resolve({ address: this.address, publicKey: this.publicKey, authKey: null, minKeysRequired: 2 });
      }

      const location = encodeURIComponent(window.location.origin);
      const loginFrame = createFrame(`${this.server}/authn?l6n=${location}&chain=aptos`);

      attachFrame(loginFrame);

      addSelfRemovableHandler('message', async (event: Event, removeListener: () => void) => {
        const e = event as MessageEvent;
        if (e.origin === this.server) {
          if (e.data.type === 'APTOS:FRAME:RESPONSE') {
            removeListener();
            detatchFrame(loginFrame);

            this.code = e.data.code;
            this.connected = true;

            const address = e.data.address;
            this.address = address ? address.aptos : undefined;

            if (this.address) {
              try {
                const { public_keys: publicKeys } = await fetch(`${this.server}/blocto/aptos/accounts/${this.address}`)
                  .then(response => response.json());
                this.publicKey = publicKeys || [];

                resolve({ address: this.address || '', publicKey: this.publicKey, authKey: null, minKeysRequired: 2 });
              } catch (err: any) { reject(e); }
            } else {
              // @todo: better error
              return reject();
            }

            setItemWithExpiry(this.sessionKey, {
              code: this.code,
              address,
            }, LOGIN_PERSISTING_TIME);
          }

          if (e.data.type === 'APTOS:FRAME:CLOSE') {
            removeListener();
            detatchFrame(loginFrame);
            reject(new Error('User declined the login request'));
          }
        }
      });
    });
  }

  async fetchAddress() {
    const { accounts } = await fetch(
      `${this.server}/api/aptos/accounts?code=${this.code}`
    ).then(response => responseSessionGuard<{ accounts: string[] }>(response, this));
    this.address = accounts[0] || undefined;
    return this.address;
  }
}
