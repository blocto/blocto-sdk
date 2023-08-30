import { useEffect, useState } from 'react'
import { recoverTypedDataAddress } from 'viem'
import { type Address, useSignTypedData, useNetwork } from 'wagmi'

const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const

const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  },
  contents: 'Hello, Bob!',
} as const

export function SignTypedData() {
  const { chain: activeChain } = useNetwork();
  const { data, error, isLoading, signTypedData } = useSignTypedData({
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: activeChain?.id,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    types,
    message,
    primaryType: 'Mail',
  })

  const [recoveredAddress, setRecoveredAddress] = useState<Address>()
  useEffect(() => {
    if (!data) return
    ;(async () => {
      setRecoveredAddress(
        await recoverTypedDataAddress({
          domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: activeChain?.id,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          },
          types,
          message,
          primaryType: 'Mail',
          signature: data,
        }),
      )
    })()
  }, [activeChain?.id, data])

  return (
    <>
      <button disabled={isLoading} onClick={() => signTypedData()}>
        {isLoading ? 'Check Wallet' : 'Sign Message'}
      </button>

      {data && (
        <div>
          <div>Signature: {data}</div>
          <div>Recovered address {recoveredAddress}</div>
        </div>
      )}
      {error && <div>Error: {error?.message}</div>}
    </>
  )
}
