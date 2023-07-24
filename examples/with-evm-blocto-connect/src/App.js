import { useState } from 'react';
import { bloctoSDK } from "./services/ethereum";
import BLTButton from "./components/Button";
import './App.css';

function App() {
  const [address, setAddress] = useState(null);

  const loginHandler = async () => {
    const accounts = await bloctoSDK?.ethereum?.request({
      method: "eth_requestAccounts"
    });
    setAddress(accounts[0]);
  };

  const logoutHandler = async () => {
    try {
      await bloctoSDK?.ethereum?.request({ method: "wallet_disconnect" });
      localStorage.removeItem("sdk.session");
      setAddress(null);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="App">
      {address ? (
        <>
          <BLTButton onClick={logoutHandler}>Logout</BLTButton>
          <p>address: {address}</p>
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}

export default App;
