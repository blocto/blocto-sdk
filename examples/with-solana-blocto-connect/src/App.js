import { useState } from "react";
import { bloctoSDK } from "./services/solana";
import BLTButton from "./components/Button";
import "./App.css";

export default function App() {
  const [address, setAddress] = useState(null);

  const loginHandler = async () => {
    const accounts = await bloctoSDK?.solana?.request({ method: "connect" });
    setAddress(accounts[0]);
  };

  const logoutHandler = async () => {
    try {
      await bloctoSDK?.solana?.request({ method: "disconnect" });
      localStorage.removeItem("sdk.session");
      setAddress(null);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="App">
      {!address ? (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      ) : (
        <>
          <BLTButton onClick={logoutHandler}>Logout</BLTButton>
          <br />
          <p>address: {address}</p>
        </>
      )}
    </div>
  );
}
