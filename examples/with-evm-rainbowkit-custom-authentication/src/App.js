import { useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  connectorsForWallets,
  RainbowKitProvider,
  ConnectButton,
  getDefaultWallets,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig, useAccount } from "wagmi";
import { polygonMumbai, optimism, arbitrum, bsc } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SiweMessage } from "siwe";
import { bloctoWallet } from "@blocto/rainbowkit-connector";
import simulateFetch from "./api";
// component
import SendTransaction from "./components/SendTransaction";
import SignMessage from "./components/SignMessage";
import SignTypedData from "./components/SignTypedData";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, optimism, arbitrum, bsc],
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
    wallets: [
      bloctoWallet({ chains }) // add BloctoWallet
    ]
  }
]);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient
});

export default function App() {
  const { isConnected } = useAccount();
  const [authStatus, setAuthStatus] = useState("unauthenticated");

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      await new Promise((r) => setTimeout(r, 100));
      const nonce = "mockNonce"; // mock nonce
      return nonce;
    },
    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce
      });
    },
    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },
    verify: async ({ signature, message }) => {
      const verifyResult = await simulateFetch();
      if (verifyResult.data.status === "SUCCESS") {
        setAuthStatus("authenticated");
        return true;
      }
      return false;
    },
    signOut: async () => {
      console.log("singout handler");
    }
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={authStatus}
      >
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
      </RainbowKitAuthenticationProvider>
    </WagmiConfig>
  );
}
