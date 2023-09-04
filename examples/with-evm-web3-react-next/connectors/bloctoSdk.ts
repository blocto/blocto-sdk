import { BloctoConnector } from '@blocto/web3-react-connector'
import { initializeConnector } from '@web3-react/core'

import { URLS } from '../chains'

export const [bloctoSDK, hooks] = initializeConnector<BloctoConnector>(
  (actions) =>
    new BloctoConnector({
      actions,
      options: {
        chainId: 1,
        rpc: URLS[1][0],
      },
    })
)
