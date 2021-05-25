import dotenv from "dotenv";
import ProviderEngine from "web3-provider-engine";
import CacheSubprovider from "web3-provider-engine/subproviders/cache";
import FixtureSubprovider from "web3-provider-engine/subproviders/fixture";
import FilterSubprovider from "web3-provider-engine/subproviders/filters";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import NonceSubprovider from "web3-provider-engine/subproviders/nonce-tracker";
import SubscriptionsSubprovider from "web3-provider-engine/subproviders/subscriptions";

dotenv.config();

const noop = (_) => _;

const formatResponse = (payload, result) => ({
  id: payload.id,
  jsonrpc: payload.jsonrpc,
  result,
});

class BloctoProvider extends ProviderEngine {
  isBlocto = true;

  isConnecting = false;
  connected = false;
  server = process.env.SERVER;

  constructor() {
    super({});
    this.setup();
  }

  setup() {
    // static results
    this.addProvider(
      new FixtureSubprovider({
        web3_clientVersion: "Blocto/v0.0.0/javascript",
        net_listening: true,
        eth_hashrate: "0x00",
        eth_mining: false,
        eth_syncing: true,
      })
    );

    // cache layer
    this.addProvider(new CacheSubprovider());

    // filters
    this.addProvider(new FilterSubprovider());

    // pending nonce
    this.addProvider(new NonceSubprovider());
    this.addProvider(new SubscriptionsSubprovider());

    // id mgmt
    this.addProvider(
      new HookedWalletSubprovider({
        getAccounts: async (cb) => {
          try {
            const accounts = await this.fetchAccounts();
            if (accounts && accounts.length) {
              cb(null, accounts);
            } else {
              cb(new Error("Failed to get accounts"));
            }
          } catch (error) {
            cb(error);
          }
        },
      })
    );

    this.addProvider({
      handleRequest: async (payload, next, end) => {
        try {
          const { result } = await this.handleRequest(payload);
          end(null, result);
        } catch (error) {
          end(error);
        }
      },
      setEngine: noop,
    });

    // network connectivity error
    this.on("error", function (err) {
      // report connectivity errors
      console.error(err.stack);
    });

    // start polling for blocks
    this.start();
  }

  async handleRequest(payload) {
    try {
      let response = null;
      let result = null;
      switch (payload.method) {
        case "eth_accounts":
          const accounts = await this.fetchAccounts();
          result = accounts;
        case "eth_blockNumber":
        case "eth_getBlockByNumber":
        case "eth_protocolVersion":
        case "eth_syncing":
        case "eth_coinbase":
        case "eth_gasPrice":
        case "eth_getBalance":
        case "eth_getStorageAt":
        case "eth_getTransactionCount":
        case "eth_getBlockTransactionCountByHash":
        case "eth_getBlockTransactionCountByNumber":
        case "eth_getUncleCountByBlockHash":
        case "eth_getUncleCountByBlockNumber":
        case "eth_getCode":
        case "eth_sign":
        case "eth_signTransaction":
        case "eth_sendTransaction":
        case "eth_sendRawTransaction":
        case "eth_call":
        case "eth_estimateGas":
        case "eth_getBlockByHash":
        case "eth_getTransactionByHash":
        case "eth_getTransactionByBlockHashAndIndex":
        case "eth_getTransactionByBlockNumberAndIndex":
        case "eth_getTransactionReceipt":
        case "eth_getUncleByBlockHashAndIndex":
        case "eth_getUncleByBlockNumberAndIndex":
        case "eth_getCompilers":
        case "eth_compileLLL":
        case "eth_compileSolidity":
        case "eth_compileSerpent":
        case "eth_newFilter":
        case "eth_newBlockFilter":
        case "eth_newPendingTransactionFilter":
        case "eth_uninstallFilter":
        case "eth_getFilterChanges":
        case "eth_getFilterLogs":
        case "eth_getLogs":
        case "eth_getWork":
        case "eth_submitWork":
        case "eth_submitHashrate":
        default:
          result = "Unsupported method";
      }
      if (response) return response;
      return formatResponse(payload, result);
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  enable() {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") reject("Currently ");
      const loginFrame = document.createElement("iframe");

      loginFrame.setAttribute(
        "src",
        `${this.server}/authn?l6n=${encodeURIComponent(window.location.origin)}`
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
            document.body.removeChild(loginFrame);
            this.code = e.data.code;
            resolve();
          }

          if (e.data.type === "FCL::CHALLENGE::CANCEL") {
            window.removeEventListener("message", eventListener);
            document.body.removeChild(loginFrame);
            reject();
          }
        }
      };
      eventListener = window.addEventListener("message", loginEventHandler);
    });
  }
  async fetchAccounts() {
    const { accounts } = await fetch(
      `${this.server}/api/ethereum/accounts?code=${this.code}`
    ).then((response) => response.json());
    return accounts;
  }
}

export default BloctoProvider;
