import invariant from 'invariant';
import dotenv from 'dotenv';

dotenv.config();

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const IFRAME_STYLE = 'width:100vw;height:100vh;position:fixed;top:0;left:0;z-index:1000;border:none;';

const CHAIN_ID_RPC_MAPPING = {
  // BSC mainnet
  56: 'https://bsc-dataseed1.binance.org',
  // BSC testnet
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

const CHAIN_ID_CHAIN_MAPPING = {
  // Ethereum
  1: 'ethereum',
  4: 'ethereum',

  // BSC
  56: 'bsc',
  97: 'bsc',
};

const CHAIN_ID_NET_MAPPING = {
  // Ethereum
  1: 'mainnet',
  4: 'rinkeby',

  // BSC
  56: 'mainnet',
  97: 'testnet',
};

const CHAIN_ID_SERVER_MAPPING = {
  1: 'https://wallet.blocto.app',
  4: 'https://wallet-testnet.blocto.app',
  56: 'https://wallet.blocto.app',
  97: 'https://wallet-testnet.blocto.app',
};

const PERMITTED_EVENTS = ['connect', 'disconnect', 'message', 'chainChanged', 'accountsChanged'];
class BloctoProvider {
  isBlocto = true;

  isConnecting = false;
  connected = false;

  chainId = null;
  networkId = null;
  chain = null;
  net = null;
  rpc = null;
  server = null;
  appId = null;

  eventListeners = {};
  accounts = [];


  constructor({ chainId, rpc, server, appId } = {}) {
    invariant(chainId, "'chainId' is required");

    if (typeof chainId === 'number') {
      this.chainId = chainId;
    } else if (chainId.includes('0x')) {
      this.chainId = parseInt(chainId, 16);
    } else {
      this.chainId = parseInt(chainId, 10);
    }

    this.networkId = this.chainId;
    this.chain = CHAIN_ID_CHAIN_MAPPING[this.chainId];
    this.net = CHAIN_ID_NET_MAPPING[this.chainId];

    invariant(this.chain, `unsupported 'chainId': ${this.chainId}`);

    this.rpc = process.env.RPC || rpc || CHAIN_ID_RPC_MAPPING[this.chainId];

    invariant(this.rpc, "'rpc' is required for Ethereum");

    this.server = process.env.SERVER || server || CHAIN_ID_SERVER_MAPPING[this.chainId];
    this.appId = process.env.APP_ID || appId;

    // init event listeners
    PERMITTED_EVENTS.forEach((event) => {
      this.eventListeners[event] = [];
    });
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  async send(arg1, arg2) {
    switch (true) {
      // signature type 1: arg1 - JSON-RPC payload, arg2 - callback;
      case arg2 instanceof Function:
        return this.sendAsync(arg1, arg2);
      // signature type 2: arg1 - JSON-RPC method name, arg2 - params array;
      case typeof arg1 === 'string' && Array.isA:
        return this.sendAsync({ method: arg1, params: arg2 });
      // signature type 3: arg1 - JSON-RPC payload(should be synchronous methods)
      default:
        return this.sendAsync(arg1);
    }
  }

  // DEPRECATED API: see https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods implementation
  // web3 v1.x BatchRequest still depends on it so we need to implement anyway ¯\_(ツ)_/¯
  async sendAsync(payload, callback) {
    const handleRequest = new Promise((resolve) => {
      // web3 v1.x concat batched JSON-RPC requests to an array, handle it here
      if (Array.isArray(payload)) {
        // collect transactions and send batch with custom method
        const transactions = payload
          .filter(request => request.method === 'eth_sendTransaction')
          .map(request => request.params[0]);

        const idBase = parseInt(Math.random() * 10000, 10);

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
              error: response.status !== 'fulfilled' ? response.value : undefined,
            }))
          )
        );
      } else {
        this.request(payload).then(data => resolve(null, data));
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

  async request(payload) {
    if (window.ethereum && window.ethereum.isBlocto) {
      return window.ethereum.request(payload);
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
        case 'eth_sign': {
          result = await this.handleSign(payload);
          result = result.signature;
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
        default:
          response = await this.handleReadRequests({ id: 1, jsonrpc: '2.0', ...payload });
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
  enable() {
    if (window.ethereum && window.ethereum.isBlocto) {
      return window.ethereum.enable();
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') { reject('Currently only supported in browser'); }
      const loginFrame = document.createElement('iframe');

      loginFrame.setAttribute(
        'src',
        `${this.server}/authn?l6n=${encodeURIComponent(window.location.origin)}&chain=${this.chain}`
      );
      loginFrame.setAttribute(
        'style',
        IFRAME_STYLE
      );

      document.body.appendChild(loginFrame);

      let eventListener = null;

      const loginEventHandler = (e) => {
        if (e.origin === this.server) {
          // @todo: try with another more general event types
          if (e.data.type === 'FCL::CHALLENGE::RESPONSE') {
            window.removeEventListener('message', eventListener);
            loginFrame.parentNode.removeChild(loginFrame);
            this.code = e.data.code;
            this.connected = true;

            this.eventListeners.connect.forEach(listener => listener(this.chainId));
            resolve([e.data.addr]);
          }

          if (e.data.type === 'FCL::CHALLENGE::CANCEL') {
            window.removeEventListener('message', eventListener);
            loginFrame.parentNode.removeChild(loginFrame);
            reject();
          }
        }
      };
      eventListener = window.addEventListener('message', loginEventHandler);
    });
  }

  async fetchAccounts() {
    const { accounts } = await fetch(
      `${this.server}/api/${this.chain}/accounts?code=${this.code}`
    ).then(response => response.json());
    return accounts;
  }

  async handleReadRequests(payload) {
    return fetch(this.rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then(response => response.json());
  }

  async handleSign({ params }) {
    return fetch(`${this.server}/api/${this.chain}/sign?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: params[1],
      }),
    }).then(response => response.json());
  }

  async handleSendTransaction(payload) {
    const { authorizationId } = await fetch(`${this.server}/api/${this.chain}/authz?code=${this.code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload.params),
    }).then(response => response.json());

    if (typeof window === 'undefined') {
      throw (new Error('Currently only supported in browser'));
    }

    const authzFrame = document.createElement('iframe');

    authzFrame.setAttribute(
      'src',
      `${this.server}/authz/${this.chain}/${authorizationId}`
    );
    authzFrame.setAttribute(
      'style',
      IFRAME_STYLE
    );

    document.body.appendChild(authzFrame);

    // eslint-disable-next-line
    while (true) {
      // eslint-disable-next-line
      const { status, transactionHash } = await fetch(`${this.server}/api/${this.chain}/authz?authorizationId=${authorizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.json());

      if (status === 'APPROVED') {
        authzFrame.parentNode.removeChild(authzFrame);
        return transactionHash;
      }

      if (status === 'DECLINED') {
        authzFrame.parentNode.removeChild(authzFrame);
        throw (new Error('Transaction Canceled'));
      }

      // eslint-disable-next-line
      await timeout(1000);
    }
  }

  on(event, listener) {
    if (!PERMITTED_EVENTS.includes(event)) return;
    if (!(listener instanceof Function)) return;

    this.eventListeners[event].push(listener);
  }

  removeListener(event, listener) {
    const listeners = this.eventListeners[event];
    const index = listeners.findIndex(listener);
    if (index !== -1) {
      this.eventListener[event].splice(index, 1);
    }
  }
  // alias removeListener
  off = removeEventListener;
}

export default BloctoProvider;
