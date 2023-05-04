# rainbowkit-connector

[Blocto SDK](https://docs.blocto.app/blocto-sdk/javascript-sdk) connector for [RainbowKit](https://www.rainbowkit.com/) React library.

## How to use

### Install package

`yarn add @blocto/rainbowkit-connector`

### Use it in your code

```TSX
import {
  getDefaultWallets,
  connectorsForWallets,
  RainbowKitProvider,
  ConnectButton
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { bloctoWallet } from '@blocto/rainbowkit-connector';

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      bloctoWallet({ chains }), // add BloctoWallet
    ]
  }
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

export const App = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ConnectButton />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

```
