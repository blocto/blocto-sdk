import invariant from 'invariant'
import dotenv from "dotenv";

dotenv.config();

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const IFRAME_STYLE = "width:100vw;height:100vh;position:fixed;top:0;left:0;z-index:1000;border:none;";

const CHAIN_ID_RPC_MAPPING = {
  // BSC mainnet
  56: "https://bsc-dataseed1.binance.org",
  // BSC testnet
  97: "https://data-seed-prebsc-1-s1.binance.org:8545",
};

const CHAIN_ID_CHAIN_MAPPING = {
  // Ethereum
  1: "ethereum",
  4: "ethereum",

  // BSC
  56: "bsc",
  97: "bsc",
};

const CHAIN_ID_NET_MAPPING = {
  // Ethereum
  1: "mainnet",
  4: "rinkeby",

  // BSC
  56: "mainnet",
  97: "testnet",
};

const CHAIN_ID_SERVER_MAPPING = {
  1: "https://wallet.blocto.app",
  4: "https://wallet-testnet.blocto.app",
  56: "https://wallet.blocto.app",
  97: "https://wallet-testnet.blocto.app",
}

const PERMITTED_EVENTS = ['connect', 'disconnect', 'message', 'chainChanged', 'accountsChanged']
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

  eventListeners = {}


  constructor({ chainId, rpc, server, appId } = {}) {
    invariant(chainId, "'chainId' is required");

    if (typeof chainId === 'number') {
      this.chainId = chainId;
    } else if (chainId.includes('0x')) {
      this.chainId = parseInt(chainId, 16)
    } else {
      this.chainId = parseInt(chainId, 10)
    }

    this.networkId = this.chainId;
    this.chain = CHAIN_ID_CHAIN_MAPPING[this.chainId]
    this.net = CHAIN_ID_NET_MAPPING[this.chainId]

    invariant(this.chain, `unsupported 'chainId': ${this.chainId}`);

    this.rpc = process.env.RPC || rpc || CHAIN_ID_RPC_MAPPING[this.chainId];

    invariant(this.rpc, "'rpc' is required for Ethereum")

    this.server = process.env.SERVER || server || CHAIN_ID_SERVER_MAPPING[this.chainId];
    this.appId = process.env.APP_ID || appId;

    // init event listeners
    PERMITTED_EVENTS.forEach(event => {
      this.eventListeners[event] = []
    })
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
        case "eth_requestAccounts":
        case "eth_accounts":
          result = await this.fetchAccounts();
          break;
        case "eth_coinbase":
          const accounts = await this.fetchAccounts();
          result = accounts[0];
          break;
        case "eth_chainId":
          result = this.chainId;
          result = "0x" + result.toString(16);
          break;
        case "net_version":
          result = this.networkId || this.chainId;
          result = "0x" + result.toString(16);
          break;
        case "eth_sign":
          result = await this.handleSign(payload);
          result = result.signature
          break
        case "eth_sendTransaction":
          result = await this.handleSendTransaction(payload);
          break;
        case "eth_signTransaction":
        case "eth_sendRawTransaction":
          result = null
          break;
        default:
          response = await this.handleReadRequests({ id: 1, jsonrpc:"2.0", ...payload });
      }
      if (response) return response.result;
      return result
    } catch (error) {
      console.error(error)
      // this.emit("error", error);
      throw error;
    }
  }

  // eip-1102 alias
  enable() {
    if (window.ethereum && window.ethereum.isBlocto) {
      return window.ethereum.enable();
    }

    return new Promise((resolve, reject) => {
      if (typeof window === "undefined")
        reject("Currently only supported in browser");
      const loginFrame = document.createElement("iframe");

      loginFrame.setAttribute(
        "src",
        `${this.server}/authn?l6n=${encodeURIComponent(window.location.origin)}&chain=${this.chain}`
      );
      loginFrame.setAttribute(
        "style",
        IFRAME_STYLE
      );

      document.body.appendChild(loginFrame);

      let eventListener = null;

      const loginEventHandler = (e) => {
        if (e.origin === this.server) {
          // @todo: try with another more general event types
          if (e.data.type === "FCL::CHALLENGE::RESPONSE") {
            window.removeEventListener("message", eventListener);
            loginFrame.parentNode.removeChild(loginFrame);
            this.code = e.data.code;
            this.connected = true;

            this.eventListeners['connect'].forEach(listener => listener(this.chainId));
            resolve([e.data.addr]);

          }

          if (e.data.type === "FCL::CHALLENGE::CANCEL") {
            window.removeEventListener("message", eventListener);
            loginFrame.parentNode.removeChild(loginFrame);
            reject();
          }
        }
      };
      eventListener = window.addEventListener("message", loginEventHandler);
    });
  }

  async fetchAccounts() {
    const { accounts } = await fetch(
      `${this.server}/api/${this.chain}/accounts?code=${this.code}`
    ).then((response) => response.json());
    return accounts;
  }

  async handleReadRequests(payload) {
    return await fetch(this.rpc, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((response) => response.json());
  }

  async handleSign({ params }) {
    return await fetch(`${this.server}/api/${this.chain}/sign?code=${this.code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: params[1],
      }),
    }).then((response) => response.json());
  }

  async handleSendTransaction({ params }) {
    // estimate point
    const { cost, error_code: estimatePointError } = await fetch(`${this.server}/api/${this.chain}/estimatePoint?code=${this.code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params[0]),
    }).then(response => response.json());

    const mayFail = estimatePointError === 'tx_may_fail';

    const { authorizationId } = await fetch(`${this.server}/api/${this.chain}/authz?code=${this.code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params[0], point: cost, mayFail }),
    }).then(response => response.json());
    
    if (typeof window === "undefined") {
      throw(new Error("Currently only supported in browser"));
    }

    const authzFrame = document.createElement("iframe");

    authzFrame.setAttribute(
      "src",
      `${this.server}/authz/${this.chain}/${authorizationId}`
    );
    authzFrame.setAttribute(
      "style",
      IFRAME_STYLE
    );

    document.body.appendChild(authzFrame);

    while(true) {
      const { status, transactionHash } = await fetch(`${this.server}/api/${this.chain}/authz?authorizationId=${authorizationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(response => response.json());

      if (status === 'APPROVED') {
        authzFrame.parentNode.removeChild(authzFrame);
        return transactionHash;
      }

      if (status === 'DECLINED') {
        authzFrame.parentNode.removeChild(authzFrame);
        throw(new Error("Transaction Canceled"));
      }

      await timeout(1000);
    }
  }

  on(event, listener) {
    if(!PERMITTED_EVENTS.includes(event))return;
    if(!listener instanceof Function)return;

    this.eventListeners[event].push(listener)
  }
  
  removeListener(event, listener) {
    const listeners = this.eventListeners[event]
    const index = listeners.findIndex(listener)
    if(index !== -1) {
      this.eventListener[event].splice(index, 1);
    }
  }
  // alias removeListener
  off = removeEventListener
}

export default BloctoProvider;
