import { useState } from "react";
import nacl from "tweetnacl";
import "./App.css";
import BloctoSDK from "@blocto/sdk";
import BLTButton from "./components/Button";

export default function App() {
  const [bloctoSDK, setBloctSDK] = useState(null);
  const [publicAccount, setPublicAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [verified, setVerified] = useState(null);

  const loginHandler = async () => {
    const bloctoSDK = new BloctoSDK({
      aptos: {
        chainId: 2 // mainnet 1, testnet 2
      },
      // please register your app id at https://developers.blocto.app/
      appId: "85d8d5db-e481-44f6-9363-7f7f4809eb39"
    });
    const publicAccount = await bloctoSDK.aptos.connect();
    console.log("accounts", publicAccount);
    setPublicAccount(publicAccount);
    setBloctSDK(bloctoSDK);
  };

  const handleSignMessage = async () => {
    // a unique identifier for the request
    const nonce = "eab0a194-a56f-4a93-ba84-a7f4533ad914";
    const response = await bloctoSDK.aptos.signMessage({
      message: message,
      nonce: nonce
    });
    console.log(response);
    setResponse(response);
  };

  const handleVerifySignature = async () => {
    // a 4-byte (32 bits) bit-vector of length N
    const { bitmap } = response;
    const { publicKey, minKeysRequired } = publicAccount;

    const input = new Uint8Array(bitmap);
    // Getting an array which marks the keys signing the message with 1, while marking 0 for the keys not being used.
    const bits = Array.from(input).flatMap((n) =>
      Array.from({ length: 8 }).map((_, i) => (n >> i) & 1)
    );
    // Filter out indexes of the keys we need
    const index = bits.map((_, i) => i).filter((i) => bits[i]);

    // The filter result is an array of the keys which we need for verifying the signatures
    const publicKeys = publicKey.filter((_, i) => index.includes(i));

    const { fullMessage, signature } = response;

    const result = [];
    for (let i = 0; i < minKeysRequired; i++) {
      const isVerfied = nacl.sign.detached.verify(
        Buffer.from(fullMessage),
        Buffer.from(signature[i], "hex"),
        Buffer.from(publicKeys[i], "hex")
      );
      result.push(isVerfied);
    }
    console.log(result);
    const isVerfied = result.every((e) => e === true);
    setVerified(isVerfied);
  };

  return (
    <div className="App">
      {publicAccount ? (
        <>
          <BLTButton onClick={handleSignMessage}>Sign</BLTButton>
          <br />
          sign message:
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <p>address: {publicAccount.address}</p>
          {response && (
            <div>
              <p>{JSON.stringify(response)}</p>
              <BLTButton onClick={handleVerifySignature}>Verify</BLTButton>
              <p>verified: {verified != null ? verified.toString() : ""}</p>
            </div>
          )}
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
