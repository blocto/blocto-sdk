import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli, polygonMumbai, arbitrumGoerli, bscTestnet, avalancheFuji, optimismGoerli } from "wagmi/chains";
import { BloctoConnector, BloctoWeb3ModalConfig } from '@blocto/wagmi-connector';
import "../styles.css";

// 1. Get projectID at https://cloud.walletconnect.com
export const projectId = "c1642a0a861332fe7ac8b5820f347dd4";

// 2. Configure wagmi client
const chains = [goerli, polygonMumbai, arbitrumGoerli, bscTestnet, avalancheFuji, optimismGoerli];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: [
    new BloctoConnector({ chains }),
    ...w3mConnectors({ version: 1, chains, projectId })
  ],
  publicClient,
});

// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiConfig>
      ) : null}

      <Web3Modal {...BloctoWeb3ModalConfig} defaultChain={polygonMumbai} projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
