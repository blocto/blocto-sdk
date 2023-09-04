import { useState } from 'react'

import { TESTNET_CHAINS } from '../../chains'
import { bloctoSDK, hooks } from '../../connectors/bloctoSdk'
import { Card } from '../Card'

const CHAIN_IDS = Object.keys(TESTNET_CHAINS).map(Number)

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function WalletConnectV2Card() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  return (
    <Card
      connector={bloctoSDK}
      activeChainId={chainId}
      chainIds={CHAIN_IDS}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  )
}
