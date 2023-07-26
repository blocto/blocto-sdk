import { useState } from "react";
import "./App.css";
import { bloctoSDK, web3, contract } from "./services/ethereum";
import BLTButton from "./components/Button";

export default function App() {
  const [address, setAddress] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const loginHandler = async () => {
    const accounts = await bloctoSDK?.ethereum?.request({
      method: "eth_requestAccounts"
    });
    setAddress(accounts[0]);
  };

  const sendBatchTransactionHandler = async () => {
    try {
      const recipient = "0xc61B4Aa62E5FD40cceB08C602Eb5D157b257b49a"; // replace with the recipient's address

      const _txHash = await bloctoSDK.ethereum.request({
        method: "blocto_sendBatchTransaction",
        params: [
          ...web3.eth.sendTransaction.request({
            from: address,
            to: recipient,
            data: contract.methods.setValue(123).encodeABI()
          }).params,
          ...web3.eth.sendTransaction.request({
            from: address,
            to: recipient,
            data: contract.methods.setValue(123).encodeABI()
          }).params
        ]
      });

      setTxHash(_txHash);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      {address ? (
        <>
          <BLTButton onClick={sendBatchTransactionHandler}>Send</BLTButton>
          <p>txHash: {txHash}</p>
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
