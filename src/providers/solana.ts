import invariant from 'invariant';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import BloctoProvider from "./blocto";
import {
  SOL_NET_SERVER_MAPPING,
  SOL_NET,
} from '../constants';

interface SolanaProviderConfig {
  net: string | null;
  server?: string;
  appId: string | null;
}

interface SolanaRequest {
  method: string;
  params?: Object;
}

class SolanaProvider extends BloctoProvider {
  code: string | null = null;
  net: string;
  rpc: string;
  server: string;
  accounts: Array<string> = [];

  constructor({ net = null, server, appId }: SolanaProviderConfig) {
    super();

    invariant(net, "'net' is required");
    invariant(SOL_NET.includes(net), "unsupported net");
    this.net = net;

    this.rpc = `https://api.${net}.solana.com`;

    this.server = server || process.env.SERVER || SOL_NET_SERVER_MAPPING[this.net];
    this.appId = process.env.APP_ID || appId;
  }

  async request(payload: SolanaRequest) {

    if (!this.connected) {
      await this.connect();
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'connect':
          result = await this.fetchAccounts();
          break;
        case 'getAccounts':
          result = this.accounts.length ? this.accounts : await this.fetchAccounts();
          break;
        // custom JSON-RPC method
        case 'convertToProgramWalletTransaction':
          // @todo: implementation
          break;
        // custom JSON-RPC method
        case 'signAndSendTransaction':
          result = await this.handleSignAndSendTransaction(payload);
          break;
        // block user from using traditional methods
        case 'signTransaction':
        case 'signAllTransactions':
          throw new Error(`Blocto is program wallet, which doesn\'t support ${payload.method}. Use signAndSendTransaction instead.`);
        default:
          response =  await this.handleReadRequests(payload)
      }
      if (response) return response.result;
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') { reject('Currently only supported in browser'); }
      const location = encodeURIComponent(window.location.origin);
      const loginFrame = createFrame(`${this.server}/authn?l6n=${location}&chain=solana`);

      attachFrame(loginFrame);

      addSelfRemovableHandler('message', (event: Event, removeListener: Function) => {
        const e = event as MessageEvent;
        if (e.origin === this.server) {
          // @todo: try with another more general event types
          if (e.data.type === 'FCL::CHALLENGE::RESPONSE') {
            removeListener();
            detatchFrame(loginFrame);

            this.code = e.data.code;
            this.connected = true;

            this.accounts = [e.data.addr];
            resolve(this.accounts);
          }

          if (e.data.type === 'FCL::CHALLENGE::CANCEL') {
            removeListener();
            detatchFrame(loginFrame);
            reject();
          }
        }
      })
    });
  }

  async fetchAccounts() {
    const { accounts } = await fetch(
      `${this.server}/api/solana/accounts?code=${this.code}`
    ).then(response => response.json());
    this.accounts = accounts;
    return accounts
  }

  async handleReadRequests(payload: SolanaRequest) {
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then(response => response.json());
  }

  async handleSignAndSendTransaction(payload: SolanaRequest) {
    const { authorizationId } = await fetch(`${this.server}/api/solana/authz?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: this.code,
        ...payload.params
      }),
    }).then(response => response.json());

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const authzFrame = createFrame(`${this.server}/authz/solana/${authorizationId}`);

    attachFrame(authzFrame);

    return new Promise((resolve, reject) => {
      let pollingId: ReturnType<typeof setTimeout>;
      const pollAuthzStatus = () => fetch(
        `${this.server}/api/solana/authz?authorizationId=${authorizationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => response.json())
        .then(({ status, transactionHash }) => {
          if (status === 'APPROVED') {
            detatchFrame(authzFrame);
            clearInterval(pollingId);

            resolve(transactionHash);
          }

          if (status === 'DECLINED') {
            detatchFrame(authzFrame);
            clearInterval(pollingId);

            reject('Transaction Canceled');
          }
        });

      pollingId = setInterval(pollAuthzStatus, 1000);
    });
  }
}

export default SolanaProvider;