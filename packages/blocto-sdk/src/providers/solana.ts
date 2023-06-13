import invariant from '../lib/invariant';
import { Buffer } from 'buffer';
import { RequestArguments } from 'eip1193-provider';
// @todo: in the long run we want to remove the dependency of solana web3
import type {
  Transaction,
  Message,
  TransactionSignature,
  Connection,
} from '@solana/web3.js';
import bs58 from 'bs58';
import BloctoProvider from './blocto';
import {
  SolanaProviderConfig,
  SolanaProviderInterface,
} from './types/solana.d';
import { createFrame, attachFrame, detatchFrame } from '../lib/frame';
import addSelfRemovableHandler from '../lib/addSelfRemovableHandler';
import { removeItem, setItemWithExpiry } from '../lib/localStorage';
import { KEY_SESSION } from '../lib/localStorage/constants';
import responseSessionGuard from '../lib/responseSessionGuard';
import {
  SOL_NET_SERVER_MAPPING,
  SOL_NET,
  LOGIN_PERSISTING_TIME,
  DEFAULT_APP_ID,
} from '../constants';

let Solana: any;
try {
  Solana = require('@solana/web3.js');
} catch {
  // prevent crash if there is no @solana/web3.js.
}

export default class SolanaProvider
  extends BloctoProvider
  implements SolanaProviderInterface
{
  net: string;
  rpc: string;
  server: string;

  constructor({
    net = 'mainnet-beta',
    server,
    appId,
    rpc,
    session,
  }: SolanaProviderConfig) {
    super(session);

    invariant(net, "'net' is required");
    invariant(SOL_NET.includes(net), 'unsupported net');
    this.net = net;

    this.rpc =
      rpc ||
      (net === 'mainnet-beta'
        ? 'https://free.rpcpool.com'
        : `https://api.${net}.solana.com`);

    this.server = server || SOL_NET_SERVER_MAPPING[this.net] || '';
    this.appId = appId || DEFAULT_APP_ID;

    if (!Solana) {
      throw new Error(
        'No @solana/web3.js installed. Please install it to interact with Solana.'
      );
    }
  }

  async request(payload: RequestArguments): Promise<any> {
    if (!this.session.connected) {
      await this.connect();
    }

    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case 'connect':
          result = await this.fetchAccounts();
          break;
        case 'disconnect':
          this.disconnect();
          break;
        case 'getAccounts':
          result = this.session.accounts.solana.length
            ? this.session.accounts.solana
            : await this.fetchAccounts();
          break;
        case 'getAccountInfo': {
          // Format the data as the same format returning from Connection.getAccountInfo from @solana/web3.js
          // ref: https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getAccountInfo
          const accountInfo = await this.handleReadRequests(payload);
          const [bufferData, encoding] = accountInfo.result.value.data;
          result = {
            ...accountInfo.result.value,
            data: Buffer.from(bufferData, encoding),
            owner: new Solana.PublicKey(accountInfo.result.value.owner),
          };
          break;
        }
        // custom JSON-RPC method
        case 'convertToProgramWalletTransaction':
          result = await this.handleConvertTransaction(payload);
          break;
        // custom JSON-RPC method
        case 'signAndSendTransaction':
          result = await this.handleSignAndSendTransaction(payload);
          break;
        // block user from using traditional methods
        case 'signTransaction':
        case 'signAllTransactions':
          throw new Error(
            `Blocto is program wallet, which doesn't support ${payload.method}. Use signAndSendTransaction instead.`
          );
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
      throw error;
    }
  }

  async connect(): Promise<void> {
    const existedSDK = (window as any).solana;

    if (existedSDK && existedSDK.isBlocto) {
      return new Promise((resolve) => {
        existedSDK.on('connect', () => {
          this.session.accounts.solana = [existedSDK.publicKey.toBase58()];
          resolve();
        });
        existedSDK.connect();
      });
    }

    this.tryRetrieveSessionFromStorage('solana');

    return new Promise((resolve: () => void, reject) => {
      if (typeof window === 'undefined') {
        return reject('Currently only supported in browser');
      }

      if (this.session.connected) {
        return resolve();
      }

      const location = encodeURIComponent(window.location.origin);
      // [VI]{version}[/VI] will inject the version of the SDK by versionInjector
      const loginFrame = createFrame(
        `${this.server}/${this.appId}/solana/authn?l6n=${location}&v=[VI]{version}[/VI]`
      );

      attachFrame(loginFrame);

      addSelfRemovableHandler(
        'message',
        (event: Event, removeListener: () => void) => {
          const e = event as MessageEvent;
          if (e.origin === this.server) {
            if (e.data.type === 'SOL:FRAME:RESPONSE') {
              removeListener();
              detatchFrame(loginFrame);

              this.session.code = e.data.code;
              this.session.connected = true;

              this.eventListeners.connect.forEach((listener) =>
                listener(this.net)
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

              resolve();
            }

            if (e.data.type === 'SOL:FRAME:CLOSE') {
              removeListener();
              detatchFrame(loginFrame);
              reject(new Error('User declined the login request'));
            }
          }
        }
      );
    });
  }

  async disconnect(): Promise<void> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      await existedSDK.disconnect();
      return;
    }
    this.session.code = null;
    this.session.accounts = {};
    this.eventListeners.disconnect.forEach((listener) => listener(null));
    this.session.connected = false;
    removeItem(KEY_SESSION);
  }

  async fetchAccounts(): Promise<string[]> {
    const { accounts } = await fetch(`${this.server}/api/solana/accounts`, {
      headers: {
        // We already check the existence in the constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Application-Identifier': this.appId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        'Blocto-Session-Identifier': this.session.code!,
      },
    }).then((response) => response.json());
    this.session.accounts.solana = accounts;
    return accounts;
  }

  async handleReadRequests(payload: RequestArguments): Promise<any> {
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', ...payload }),
    }).then((response) => response.json());
  }

  // solana web3 utility
  async convertToProgramWalletTransaction(
    transaction: Transaction
  ): Promise<Transaction> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.convertToProgramWalletTransaction(transaction);
    }
    const message = await this.request({
      method: 'convertToProgramWalletTransaction',
      params: {
        message: transaction.serializeMessage().toString('hex'),
      },
    });
    return this.toTransaction(message, []);
  }

  // solana web3 utility
  async signAndSendTransaction(
    transaction: Transaction,
    connection?: Connection
  ): Promise<string> {
    const existedSDK = (window as any).solana;
    if (existedSDK && existedSDK.isBlocto) {
      return existedSDK.signAndSendTransaction(transaction);
    }
    const extra: any = {};
    if (connection) {
      if (connection.commitment) extra.commitment = connection.commitment;
      // if the connection object passed-in has different rpc endpoint, reconnect to it
      // eslint-disable-next-line no-underscore-dangle
      const rpc = connection ? (connection as any)._rpcEndpoint : null;
      if (rpc && rpc !== this.rpc) {
        this.rpc = rpc;
        this.disconnect();
        await this.connect();
      }
    }

    return this.request({
      method: 'signAndSendTransaction',
      params: {
        signatures: await this.collectSignatures(transaction),
        message: transaction.serializeMessage().toString('hex'),
        ...extra,
      },
    });
  }

  // solana web3 utility
  // eslint-disable-next-line class-methods-use-this
  async toTransaction(
    raw: string,
    signatures: TransactionSignature[]
  ): Promise<Transaction> {
    const message: Message = Solana.Message.from(Buffer.from(raw, 'hex'));
    const transaction = new Solana.Transaction();
    transaction.recentBlockhash = message.recentBlockhash;
    if (message.header.numRequiredSignatures > 0) {
      transaction.feePayer = message.accountKeys[0];
    }
    signatures.forEach((signature, index) => {
      const sigPubkeyPair = {
        signature:
          signature === Solana.PublicKey.default.toBase58()
            ? null
            : bs58.decode(signature),
        publicKey: message.accountKeys[index],
      };
      transaction.signatures.push(sigPubkeyPair);
    });
    message.instructions.forEach((instruction) => {
      const keys = instruction.accounts.map((account) => {
        const pubkey = message.accountKeys[account];
        return {
          pubkey,
          isSigner: account < message.header.numRequiredSignatures,
          isWritable: message.isAccountWritable(account),
        };
      });
      transaction.instructions.push(
        new Solana.TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: bs58.decode(instruction.data),
        })
      );
    });
    return transaction;
  }

  // solana web3 utility
  // eslint-disable-next-line class-methods-use-this
  async collectSignatures(
    transaction: Transaction
  ): Promise<{ [key: string]: string }> {
    return transaction.signatures.reduce((acc, cur) => {
      if (cur.signature) {
        acc[cur.publicKey.toBase58()] = cur.signature.toString('hex');
      }
      return acc;
    }, {} as { [key: string]: string });
  }

  async handleConvertTransaction(payload: RequestArguments): Promise<unknown> {
    return fetch(`${this.server}/api/solana/convertToWalletTx`, {
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
    }).then((response) => responseSessionGuard(response, this));
  }

  async handleSignAndSendTransaction(
    payload: RequestArguments
  ): Promise<string> {
    const { authorizationId } = await fetch(`${this.server}/api/solana/authz`, {
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
    }).then((response) =>
      responseSessionGuard<{ authorizationId: string }>(response, this)
    );

    if (typeof window === 'undefined') {
      throw new Error('Currently only supported in browser');
    }

    const authzFrame = createFrame(
      `${this.server}/${this.appId}/solana/authz/${authorizationId}`
    );

    attachFrame(authzFrame);

    return new Promise((resolve, reject) =>
      addSelfRemovableHandler(
        'message',
        (event: Event, removeEventListener: () => void) => {
          const e = event as MessageEvent;
          if (
            e.origin === this.server &&
            e.data.type === 'SOL:FRAME:RESPONSE'
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
}
