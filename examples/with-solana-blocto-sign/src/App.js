import { useState } from "react";
import { bloctoSDK } from "./services/solana";
import {
  Transaction,
  PublicKey,
  TransactionInstruction,
  Keypair
} from "@solana/web3.js";
import BLTButton from "./components/Button";
import "./App.css";

export default function App() {
  const [address, setAddress] = useState(null);
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

  // PartialSign
  const signHandler = async () => {
    try {
      const {
        value: { blockhash }
      } = await bloctoSDK?.solana?.request({
        method: "getRecentBlockhash"
      });

      const transaction = new Transaction();
      const publicKey = new PublicKey(address);

      const newKeypair = new Keypair();
      const newAccountKey = newKeypair.publicKey;

      const memoInstruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: false, isWritable: true },
          { pubkey: newAccountKey, isSigner: true, isWritable: true }
        ],
        data: Buffer.from("Data to send in transaction", "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
      });
      transaction.add(memoInstruction);

      const createdPublicKey = newAccountKey.toBase58();

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;

      const converted = await bloctoSDK?.solana?.convertToProgramWalletTransaction(
        transaction
      );

      if (converted) {
        converted?.partialSign(newKeypair);
        const transactionId = await bloctoSDK?.solana?.signAndSendTransaction(
          converted
        );
        setResponse({
          transactionId,
          createdPublicKey
        });
      }
    } catch (error) {
      console.error(error);
      setResponse(error);
    }
  };
  // PartialSignAndWrap

  const PartialSignAndWrap = async () => {
    try {
      const {
        value: { blockhash }
      } = await bloctoSDK?.solana?.request({
        method: "getRecentBlockhash"
      });

      const transaction = new Transaction();
      const publicKey = new PublicKey(address);

      const newKeypair = new Keypair();
      const newAccountKey = newKeypair.publicKey;

      const memoInstruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: false, isWritable: true },
          { pubkey: newAccountKey, isSigner: true, isWritable: true }
        ],
        data: Buffer.from("Data to send in transaction", "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
      });
      // at least 2 instructions to make them wrapped by backend
      transaction.add(memoInstruction);
      transaction.add(memoInstruction);

      const createdPublicKey = newAccountKey.toBase58();

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;

      const converted = await bloctoSDK?.solana?.convertToProgramWalletTransaction(
        transaction
      );

      if (converted) {
        converted?.partialSign(newKeypair);
        const transactionId = await bloctoSDK?.solana?.signAndSendTransaction(
          converted
        );
        setResponse({
          transactionId,
          transaction: `Created account successfully with PubKey as ${createdPublicKey}.`
        });
      }
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
          <p>address: {address}</p>
          <br />
          <BLTButton onClick={() => signHandler()}>Partial Sign</BLTButton>
          <BLTButton onClick={() => PartialSignAndWrap()}>
            Sign And Wrap
          </BLTButton>
          {response && (
            <>
              <p>Response of tx: {response?.transactionId}</p>
              <p>
                Created account successfully with PubKey as{" "}
                {response?.createdPublicKey}.
              </p>
            </>
          )}
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
