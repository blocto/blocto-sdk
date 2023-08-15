import type { AppProps } from 'next/app';
import React from 'react';
import {
  getDefaultWallets,
  connectorsForWallets,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import RainbowkitAuthProvider from '@/component/RainbowkitAuthProvider';
import { createConfig, WagmiConfig } from 'wagmi';
import { bloctoWallet } from '@blocto/rainbowkit-connector';
import {
  chains,
  publicClient,
  webSocketPublicClient,
} from '@/config/web3ContextConfig';

const { wallets } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '1d2d5b3f3fb927e59f5fd12c5def7d12',
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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowkitAuthProvider>
        <ConnectButton />
        <Component {...pageProps} />
      </RainbowkitAuthProvider>
    </WagmiConfig>
  );
}
