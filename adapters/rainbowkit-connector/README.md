# Blocto RainbowKit wallet connector

[Blocto SDK](https://docs.blocto.app/blocto-sdk/javascript-sdk) connector for [RainbowKit](https://www.rainbowkit.com/) React library.

## How to use

### Install package

`yarn add @blocto/blocto-rainbowkit-connector`

### Use it in your code

```TSX
import {
  ConnectButton,
  connectorsForWallets,
  wallet,
} from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { chain, configureChains, createClient } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { bloctoWallet } from '@blocto/blocto-rainbowkit-connector';

const defaultProvider = alchemyProvider({
  apiKey: process.env.ALCHEMY_APIKEY,
});

export const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygonMumbai],
  [defaultProvider],
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      bloctoWallet({ chains }),
      wallet.metaMask({ chains }),
      wallet.rainbow({ chains }),
      wallet.walletConnect({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: () => [...connectors()],
  provider,
  webSocketProvider,
});

export const App = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider>
        <ConnectButton />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

```
