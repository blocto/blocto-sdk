import { useRef } from "react";
import { ethers } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import SendTransaction from "./component/SendTransaction";
import SignMessage from "./component/SignMessage";
import SignTypedData from "./component/SignTypedData";
import './App.css';

export default function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  // create an ethers provider
  const ethersProviderRef = useRef();
  if (wallet && !ethersProviderRef.current) {
    // if using ethers v6 this is:
    // ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any')
    ethersProviderRef.current = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );
  }

  return (
    <div className="main-wrap">
      <button
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        <span>
          {connecting ? "Connecting" : wallet ? "Disconnect" : "Connect"}
        </span>
      </button>
      <div className="login-wrap">
        {wallet && (
          <>
            <SendTransaction provider={ethersProviderRef.current} />
            <SignMessage provider={ethersProviderRef.current} />
            <SignTypedData provider={ethersProviderRef.current.provider} />
          </>
        )}
      </div>
    </div>
  );
}
