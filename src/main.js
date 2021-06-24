import dotenv from "dotenv";
dotenv.config();

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const CHAIN_ID_RPC_MAPPING = {
  // BSC mainnet
  56: "https://bsc-dataseed1.binance.org",
  // BSC testnet
  97: "https://data-seed-prebsc-1-s1.binance.org:8545",
};

const CHAIN_ID_NET_MAPPING = {
  1: "mainnet",
  3: "ropsten",
  4: "rinkeby",
  5: "goerli",
  42: "kovan",
};

class BloctoProvider {
  isBlocto = true;

  isConnecting = false;
  connected = false;
  server = process.env.SERVER;
  infuraId = process.env.INFURA;

  chain = null;
  net = null;
  rpc = null;
  chainId = null;
  networkId = null;

  constructor({ chain = "ethereum", net = "rinkeby", rpc } = {}) {
    // resolve rpc
    if (rpc) {
      this.rpc = rpc;
      for (let id of Object.keys(CHAIN_ID_RPC_MAPPING)) {
        if (CHAIN_ID_RPC_MAPPING[id].includes(rpc)) {
          this.chainId = id;
          this.chain = "bsc";
        }
      }
    } else {
      this.chain = chain || "ethereum";
      this.net = net || "ropsten";
      for (let id of Object.keys(CHAIN_ID_NET_MAPPING)) {
        if (CHAIN_ID_NET_MAPPING[id] === net) this.chainId = id;
      }
      this.rpc = `https://${net}.infura.io/v3/${this.infuraId}`;
    }
    this.networkId = this.chainId;
  }

  async request(payload) {
    try {
      let response = null;
      let result = null;
      switch (payload.method) {
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

  enable() {
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
        "width:100vw;height:100vh;position:fixed;top:0;left:0"
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
            resolve();
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
    const { cost } = await fetch(`${this.server}/api/${this.chain}/estimatePoint?code=${this.code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params[0]),
    }).then(response => response.json());

    const { authorizationId } = await fetch(`${this.server}/api/${this.chain}/authz?code=${this.code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params[0], point: cost }),
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
      "width:100vw;height:100vh;position:fixed;top:0;left:0"
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
        console.log(transactionHash)
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
}

export default BloctoProvider;
