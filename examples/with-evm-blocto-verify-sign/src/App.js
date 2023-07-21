import { useState } from "react";
import "./App.css";
import { dappAuth } from "./services/ethereum";
import BLTButton from "./components/Button";

export default function App() {
  const [address, setAddress] = useState(
    "0x8278B30648D2e59c89E3ed17eEF3032D6A2352B4"
  );
  const [message, setMessage] = useState("icecream");
  const [signature, setSignature] = useState(
    "0x817b3e562969114f2fe277fa3917935c8ee3a9e33f525cd07fd0fb0cf7809fdd3eb4ac72e8ba0c64edaa723c06a35a6b744c5678f4d0734316a836801828f3d91c6f4a038d5526b634cf5741310d9c55e9fad4301f0a828afbe9918909e8963a3279a54edeab913d54568f885d77f95c689a1beb2e8680861ff411ef3a1130154e1c"
  );
  const [status, setStatus] = useState(null);

  const isAuthorizedSigner = async () => {
    if (!message || !signature || !address) return;
    try {
      const isAuthorizedSigner = await dappAuth.isAuthorizedSigner(
        message,
        signature,
        address
      );

      console.log(isAuthorizedSigner); // true
      setStatus(isAuthorizedSigner);
    } catch (e) {
      console.log(e);
      setStatus(false);
    }
  };

  return (
    <div className="App">
      personal message:&nbsp;
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <br />
      address:&nbsp;
      <input value={address} onChange={(e) => setAddress(e.target.value)} />
      <br />
      signature:&nbsp;
      <input value={signature} onChange={(e) => setSignature(e.target.value)} />
      <br />
      <BLTButton onClick={isAuthorizedSigner}>Verify</BLTButton>
      <br />
      Result: {status != null && status.toString()}
    </div>
  );
}
