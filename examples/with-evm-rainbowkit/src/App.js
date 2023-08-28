import "@rainbow-me/rainbowkit/styles.css";
import {
  ConnectButton,
} from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import SendTransaction from "./components/SendTransaction";
import SignMessage from "./components/SignMessage";
import SignTypedData from "./components/SignTypedData";



export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="main-wrap">
      <ConnectButton />
      <div className="login-wrap">
        {isConnected && (
          <>
            <SendTransaction />
            <SignMessage />
            <SignTypedData />
          </>
        )}
      </div>
    </div>
  );
}
