import invariant from 'invariant';
import { RequestArguments } from 'eip1193-provider';
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

    this.server = process.env.SERVER || server || SOL_NET_SERVER_MAPPING[this.net];
    this.appId = process.env.APP_ID || appId;
  }

  async request(payload: RequestArguments) {

    if (!this.connected) {
      await this.connect();
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'sol_requestAccounts':
          result = await this.fetchAccounts();
          break;
        case 'getAccounts':
          result = this.accounts.length ? this.accounts : await this.fetchAccounts();
          break;
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

  async handleReadRequests(payload: RequestArguments) {
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then(response => response.json());
  }
}

export default SolanaProvider;