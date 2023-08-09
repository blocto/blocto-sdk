import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import './index.css';
import App from './App';

import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import {
  ConnectKitProvider,
  getDefaultConfig,
  supportedConnectors,
} from 'connectkit';
import { integrateBloctoConfig } from '@blocto/connectkit-connector';

const config = integrateBloctoConfig(
  createConfig(
    getDefaultConfig({
      appName: 'ConnectKit CRA demo',
      autoConnect: false,
      chains: [mainnet, polygon, optimism, arbitrum],
      walletConnectProjectId: 'c1642a0a861332fe7ac8b5820f347dd4',
    })
  ),
  supportedConnectors,
  {}
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <ConnectKitProvider debugMode>
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
