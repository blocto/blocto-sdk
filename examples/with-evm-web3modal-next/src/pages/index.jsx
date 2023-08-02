import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import CustomButton from "../components/CustomButton";
import SendTransaction from "../components/SendTransaction";
import SignMessage from "../components/SignMessage";
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { isConnected } = useAccount()
  
  return (
    <>
      {/* Predefined button  */}
      <Web3Button icon="show" label="Connect Wallet" balance="show" />
      <br />

      {/* Network Switcher Button */}
      <Web3NetworkSwitch />
      <br />

      {isConnected && (
        <>
          <SendTransaction />
          <SignMessage />
        </>
      )}

      {/* Custom button */}
      <CustomButton />
    </>
  );
}
