import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  getDefaultWallets,
  connectorsForWallets,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import RainbowkitAuthProvider from './components/RainbowkitAuthProvider';
import { createConfig, WagmiConfig } from 'wagmi';
import { bloctoWallet } from '@blocto/rainbowkit-connector';
import {
  chains,
  publicClient,
  webSocketPublicClient,
} from './config/web3ContextConfig';

const { wallets } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Others',
    wallets: [
      bloctoWallet({ chains }), // add BloctoWallet
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowkitAuthProvider>
        <ConnectButton />
        <App />
      </RainbowkitAuthProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
