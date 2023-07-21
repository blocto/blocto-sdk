import { useState } from "react";
import { bloctoSDK } from "./services/solana";
import * as BufferLayout from "@solana/buffer-layout";
import { PublicKey } from "@solana/web3.js";
import BLTButton from "./components/Button";
import "./App.css";

export default function App() {
  const [address, setAddress] = useState(null);
  const [programId, setProgramId] = useState(
    "G4YkbRN4nFQGEUg4SXzPsrManWzuk8bNq9JaMhXepnZ6"
  );
  const [accountPubKey, setAccountPubKey] = useState(
    "4AXy5YYCXpMapaVuzKkz25kVHzrdLDgKN3TiQvtf1Eu8"
  );
  const [struct, setStruct] = useState(
    '[{"name":"is_init","type":"u8"},{"name":"value","type":"u32"}]'
  );
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

  const formatProgramStruct = (data) => {
    const withBufferLayout = data.map((attribute) =>
      BufferLayout?.[attribute.type]?.(attribute.name)
    );
    return BufferLayout.struct(withBufferLayout);
  };

  const getContract = async () => {
    try {
      const key = new PublicKey(accountPubKey);
      // Different response type than the type of the response from getAccountInfo in @solana/web3.js
      const accountInfo = await bloctoSDK?.solana?.request({
        method: "getAccountInfo",
        params: [
          key,
          {
            encoding: "base64"
          }
        ]
      });

      if (!accountInfo) {
        setResponse("Error: Program not found.");
      }
      const layout = formatProgramStruct(JSON.parse(struct));
      const info = layout.decode(accountInfo?.data);
      setResponse(info);
    } catch (error) {
      console.error("error", error);
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
          <h3>Cintract info</h3>
          <p>
            Program Id :
            <input
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            />
          </p>
          <p>
            Account Pub Key :
            <input
              value={accountPubKey}
              onChange={(e) => setAccountPubKey(e.target.value)}
            />
          </p>
          <p>
            Struct :
            <input value={struct} onChange={(e) => setStruct(e.target.value)} />
          </p>
          <BLTButton onClick={() => getContract()}>Run</BLTButton>
          {response && <p>Response of tx: {JSON.stringify(response)}</p>}
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
