import { configureChains, createConfig } from 'wagmi'
import { arbitrumGoerli, polygonMumbai } from 'wagmi/chains'

import { publicProvider } from 'wagmi/providers/public'
import { BloctoConnector } from '@blocto/connectkit-connector';
import { getDefaultConnectors } from 'connectkit';

export const walletConnectProjectId = 'c1642a0a861332fe7ac8b5820f347dd4'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, arbitrumGoerli],
  [
    publicProvider(),
  ],
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new BloctoConnector({ chains }),
    ...getDefaultConnectors({
      chains,
      app: { name: 'My wagmi + ConnectKit App' },
      walletConnectProjectId
    })
  ],
  publicClient,
  webSocketPublicClient,
})

export { chains }