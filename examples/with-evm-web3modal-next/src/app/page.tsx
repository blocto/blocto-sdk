import { Connected } from '../components/Connected'
import { NetworkSwitcher } from '../components/NetworkSwitcher'
import { SendTransaction } from '../components/SendTransaction'
import { SignMessage } from '../components/SignMessage'
import { SignTypedData } from '../components/SignTypedData'
import { Web3Button } from '../components/Web3Button'

export function Page() {
  return (
    <>
      <h1>wagmi + Web3Modal + Next.js</h1>

      <Web3Button />

      <Connected>
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
      </Connected>
    </>
  )
}

export default Page
