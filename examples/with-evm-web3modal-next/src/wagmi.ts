import { BloctoConnector } from '@blocto/web3modal-connector'
import { w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig } from 'wagmi'
import { arbitrumGoerli, polygonMumbai } from 'wagmi/chains'

export const walletConnectProjectId = 'c1642a0a861332fe7ac8b5820f347dd4'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, arbitrumGoerli],
  [w3mProvider({ projectId: walletConnectProjectId })],
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
