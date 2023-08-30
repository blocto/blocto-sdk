import { configureChains, createConfig } from 'wagmi'
import { arbitrumGoerli, polygonMumbai } from 'wagmi/chains'
import { BloctoConnector } from '@blocto/wagmi-connector';

import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrumGoerli, polygonMumbai],
  [
    publicProvider(),
  ],
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new BloctoConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
})
