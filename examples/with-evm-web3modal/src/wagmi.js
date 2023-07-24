import {
    EthereumClient,
    w3mConnectors,
    w3mProvider
} from "@web3modal/ethereum";
import { configureChains, createConfig } from "wagmi";
import { goerli, polygonMumbai } from "wagmi/chains";
import { BloctoConnector } from "@blocto/wagmi-connector";

export const projectId = "c1642a0a861332fe7ac8b5820f347dd4";
export const rpc = "https://rpc.ankr.com/eth_goerli";
export const chains = [goerli, polygonMumbai];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

export const wagmiConfig = createConfig({
    autoConnect: false,
    connectors: [
        new BloctoConnector({
            chains,
            options: {
                chainId: goerli.id,
                rpc
            }
        }),
        ...w3mConnectors({ version: 1, chains, projectId })
    ],
    publicClient
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
