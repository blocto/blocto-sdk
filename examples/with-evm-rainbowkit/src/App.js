import "@rainbow-me/rainbowkit/styles.css";
import {
  connectorsForWallets,
  RainbowKitProvider,
  ConnectButton,
  getDefaultWallets
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig, useAccount } from "wagmi";
import { polygon, optimism, arbitrum, bsc } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import SendTransaction from "./components/SendTransaction";
import SignMessage from "./components/SignMessage";
import SignTypedData from "./components/SignTypedData";
import { bloctoWallet } from "@blocto/rainbowkit-connector";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon, optimism, arbitrum, bsc],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID || "" }), publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Others",
    wallets: [bloctoWallet({ chains })]
  }
]);

const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient
});

export default function App() {
  const { isConnected } = useAccount();

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <div className="main-wrap">
          <ConnectButton />
          <div className="login-wrap">
            {isConnected && (
              <>
                <SendTransaction />
                <SignMessage />
                <SignTypedData />
              </>
            )}
          </div>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
