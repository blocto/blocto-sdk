import Web3 from "web3";
import DappAuth from "@blocto/dappauth";

const rpc = "https://rpc.ankr.com/polygon_mumbai";

const web3 = new Web3(rpc);
const dappAuth = new DappAuth(new Web3.providers.HttpProvider(rpc));

export { web3, dappAuth };
