import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  connectorsForWallets,
  RainbowKitProvider,
  getDefaultWallets
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";

import { polygonMumbai, polygon, optimism, arbitrum, bsc } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { bloctoWallet } from "@blocto/rainbowkit-connector";

const root = ReactDOM.createRoot(document.getElementById('root'));

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, polygon, optimism, arbitrum, bsc],
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
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

root.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>

        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
