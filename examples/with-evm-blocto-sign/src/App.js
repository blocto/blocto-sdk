import { useState } from "react";
import { web3, bloctoSDK } from "./services/ethereum";
import BLTButton from "./components/Button";
import './App.css';

export default function App() {
  const [address, setAddress] = useState(null);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");

  const loginHandler = async () => {
    const accounts = await bloctoSDK?.ethereum?.enable();
    console.log("accounts", accounts[0]);
    setAddress(accounts[0]);
  };

  const logoutHandler = async () => {
    await bloctoSDK?.ethereum?.request({ method: "wallet_disconnect" });
    localStorage.removeItem("sdk.session");
    setAddress(null);
  };

  const handleSignMessage = async () => {
    try {
      let evmAddress = address;
      if (!evmAddress) {
        evmAddress = await loginHandler();
      }
      const signature = await web3.eth.personal.sign(message, address);
      setSignature(signature);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      {address ? (
        <>
          <BLTButton onClick={logoutHandler}>Logout</BLTButton>
          <BLTButton onClick={handleSignMessage}>Sign</BLTButton>
          <br />
          sign message:
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <p>address: {address}</p>
          <p>signature: {signature}</p>
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
