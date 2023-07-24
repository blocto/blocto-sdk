import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  AptosWalletAdapterProvider,
  NetworkName,
} from '@aptos-labs/wallet-adapter-react';
import { BloctoWallet } from '@blocto/aptos-wallet-adapter-plugin';

const wallets = [
  new BloctoWallet({
    network: NetworkName.Testnet,
    // please register your app id at https://developers.blocto.app/
    bloctoAppId: "85d8d5db-e481-44f6-9363-7f7f4809eb39"
  })
];

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      onError={(error) => {
        console.log('Handle Error Message', error);
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
