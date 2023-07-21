import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import bloctoModule from "@web3-onboard/blocto";

const polygonTestnet = {
    id: "0x13881",
    token: "MATIC",
    label: "Polygon",
    rpcUrl: "https://rpc-mumbai.maticvigil.com"
};

const chains = [polygonTestnet];
const blocto = bloctoModule();
const wallets = [injectedModule(), blocto];

const web3Onboard = init({
    wallets,
    chains,
    appMetadata: {
        name: "Web3-Onboard Demo",
        icon: "<svg>My App Icon</svg>",
        description: "A demo of Web3-Onboard."
    }
});

export { web3Onboard };
