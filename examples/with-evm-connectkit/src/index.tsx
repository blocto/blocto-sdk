import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { WagmiConfig } from 'wagmi'

import { ConnectKitProvider, supportedConnectors } from 'connectkit'
import { App } from './App'
import { config } from './wagmi'
import { BLOCTO_CONFIG } from '@blocto/connectkit-connector'

supportedConnectors.push(BLOCTO_CONFIG)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
