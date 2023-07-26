import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import CustomButton from "./component/CustomButton";
import SendTransaction from "./component/SendTransaction";
import SignMessage from "./component/SignMessage";
import { useAccount } from "wagmi";

export default function HomePage() {
  const { isConnected } = useAccount();

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
