# connectkit-connector

`integrateBloctoConfig` is used to integrate Blocto with ConnectKit.

## How to use

### Install package

```
yarn add @blocto/connectkit-connector
```

### Example

```typescript
import { getDefaultConfig, supportedConnectors } from 'connectkit';
import { integrateBloctoConfig } from '@blocto/connectkit-connector';

// ...

let config = integrateBloctoConfig(
  createConfig(
    getDefaultConfig({
      appName: 'ConnectKit CRA demo',
      autoConnect: false,
      chains: [mainnet, polygon, optimism, arbitrum],
      walletConnectProjectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID!,
    })
  ),
  supportedConnectors
);
```