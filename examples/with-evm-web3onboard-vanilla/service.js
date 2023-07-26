import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import bloctoModule from "@web3-onboard/blocto";

const wallets = [injectedModule(), bloctoModule()];

const chains = [
    {
        id: "0x13881",
        token: "MATIC",
        label: "Polygon",
        rpcUrl: "https://rpc-mumbai.maticvigil.com"
    }
];

let onboard;
if (!onboard) {
    onboard = Onboard({
        wallets,
        chains
    });
}

export default onboard;
