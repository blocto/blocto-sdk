import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  ThirdwebProvider,
  bloctoWallet,
} from '@thirdweb-dev/react';
import {
  Ethereum, Polygon, Arbitrum, Optimism, Avalanche, Binance, // Mainnets 
  Goerli,Mumbai,ArbitrumGoerli,OptimismGoerli,AvalancheFuji,BinanceTestnet // Testnets
} from "@thirdweb-dev/chains";
import './styles/globals.css';

const BLOCTO_SUPPORTED_MAINNET_CHAIN = [Ethereum, Polygon, Arbitrum, Optimism, Avalanche, Binance];
const BLOCTO_SUPPORTED_TESTNET_CHAIN = [Goerli, Mumbai, ArbitrumGoerli, OptimismGoerli, AvalancheFuji, BinanceTestnet];

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain={Mumbai}
      supportedChains={BLOCTO_SUPPORTED_TESTNET_CHAIN}
      supportedWallets={[bloctoWallet()]}
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
