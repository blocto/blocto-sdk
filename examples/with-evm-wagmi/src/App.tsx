import { useAccount } from 'wagmi'

import { Connect } from './components/Connect'
import { NetworkSwitcher } from './components/NetworkSwitcher'
import { SendTransaction } from './components/SendTransaction'
import { SignMessage } from './components/SignMessage'
import { SignTypedData } from './components/SignTypedData'

export function App() {
  const { isConnected } = useAccount()

  return (
    <>
      <h1>wagmi</h1>

      <Connect />

      {isConnected && (
        <>
          <hr />
          <h2>Network</h2>
          <NetworkSwitcher />
          <br />
          <hr />
          <h2>Send Transaction</h2>
          <SendTransaction />
          <br />
          <hr />
          <h2>Sign Message</h2>
          <SignMessage />
          <br />
          <hr />
          <h2>Sign Typed Data</h2>
          <SignTypedData />
        </>
      )}
    </>
  )
}
