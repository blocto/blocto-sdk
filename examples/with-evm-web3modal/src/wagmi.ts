import { configureChains, createConfig } from 'wagmi'
import { arbitrumGoerli, polygonMumbai } from 'wagmi/chains'

import { publicProvider } from 'wagmi/providers/public'
import { w3mConnectors } from '@web3modal/ethereum';
import { BloctoConnector } from '@blocto/web3modal-connector';

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
    ...w3mConnectors({
      chains,
      projectId: walletConnectProjectId,
      version: 2,
    })
  ],
  publicClient,
  webSocketPublicClient,
})

export { chains }