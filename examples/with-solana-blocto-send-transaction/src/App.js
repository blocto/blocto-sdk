import { useState } from "react";
import { bloctoSDK } from "./services/solana";
import { Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
import BLTButton from "./components/Button";
import "./App.css";

export default function App() {
  const [address, setAddress] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [response, setResponse] = useState(null);

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
      console.error("error", error);
    }
  };

  const sendToken = async () => {
    if (!recipient) return;
    try {
      const {
        value: { blockhash }
      } = await bloctoSDK?.solana?.request({
        method: "getRecentBlockhash"
      });

      const transaction = new Transaction();
      const publicKey = new PublicKey(address);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: Number(amount)
        })
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;
      const transactionId = await bloctoSDK?.solana?.signAndSendTransaction(
        transaction
      );
      setResponse(transactionId);
    } catch (error) {
      console.error(error);
      setResponse(error);
    }
  };

  return (
    <div className="App">
      {address ? (
        <>
          <BLTButton onClick={logoutHandler}>Logout</BLTButton>
          <br />
          <p>address: {address}</p>
          <p>
            Amount:
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </p>
          <p>
            Recipient:
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </p>
          <BLTButton onClick={() => sendToken()}>Sent</BLTButton>
          {response && <p>Response of tx: {response}</p>}
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
