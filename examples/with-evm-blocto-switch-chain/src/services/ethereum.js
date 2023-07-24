import Web3 from "web3";
import BloctoSDK from "@blocto/sdk";

const bloctoSDK = new BloctoSDK({
    ethereum: {
        chainId: "0x1", // (required) chainId to be used
        rpc: `https://eth.llamarpc.com` // (required for Ethereum) JSON RPC endpoint
    }
});

const web3 = new Web3(bloctoSDK.ethereum);

export { web3, bloctoSDK };
