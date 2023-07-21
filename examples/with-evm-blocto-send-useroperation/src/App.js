import { useState } from "react";
import { web3, bloctoSDK } from "./services/ethereum";
import BLTButton from "./components/Button";
import SeaDropABI from "./abi/SeaDrop";
import BloctoWalletABI from "./abi/BloctoWallet";
import "./App.css";

const seaDropAddress = "0x00005EA00Ac477B1030CE78506496e8C2dE24bf5";

export default function App() {
  const [address, setAddress] = useState(null);
  const [userOpHash, setUserOpHash] = useState(null);
  const [userOpReceipt, setUserOpReceipt] = useState(null);

  const loginHandler = async () => {
    const accounts = await bloctoSDK?.ethereum?.enable();
    setAddress(accounts[0]);
  };

  const logoutHandler = async () => {
    await bloctoSDK?.ethereum?.request({ method: "wallet_disconnect" });
    setAddress(null);
    setUserOpHash(null);
  };

  const handleUserOperation = async () => {
    try {
      let evmAddress = address;
      if (!evmAddress) {
        evmAddress = await loginHandler();
      }
      const seaDropContract = new web3.eth.Contract(SeaDropABI, seaDropAddress);
      const data = seaDropContract.methods
        .mintPublic(
          "0xfD8EC18d48AC1f46B600e231da07D1Da8209CeeF",
          "0x0000a26b00c1F0DF003000390027140000fAa719",
          "0x0000000000000000000000000000000000000000",
          1
        )
        .encodeABI();
      const accountContract = new web3.eth.Contract(
        BloctoWalletABI,
        evmAddress
      );
      const callData = accountContract.methods
        .execute(seaDropAddress, 0, data)
        .encodeABI();

      const userOpHash = await bloctoSDK?.ethereum?.sendUserOperation({
        callData: callData.slice(2)
      });
      setUserOpHash(userOpHash);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserOperationReceipt = async (userOpHash) => {
    setUserOpReceipt(null);
    const userOpReceipt = await bloctoSDK.ethereum.request({
      method: "eth_getUserOperationReceipt",
      jsonrpc: "2.0",
      id: 1,
      params: [userOpHash]
    });
    setUserOpReceipt(userOpReceipt);
  };

  return (
    <div className="App">
      {address ? (
        <>
          <BLTButton onClick={logoutHandler}>Logout</BLTButton>
          <br />
          <p>
            address: {address}{" "}
            <a
              href={"https://testnets.opensea.io/" + address}
              target="_blank"
              rel="noreferrer"
            >
              OpenSea
            </a>
          </p>
          <hr />
          <BLTButton onClick={handleUserOperation}>
            Send UserOperation
          </BLTButton>
          {userOpHash && (
            <div>
              userOpHash:{" "}
              <a
                href={
                  "https://www.jiffyscan.xyz/userOpHash/" +
                  userOpHash +
                  "?network=mumbai"
                }
                target="_blank"
                rel="noreferrer"
              >
                {userOpHash}
              </a>
              <hr />
              <BLTButton
                onClick={() => {
                  handleUserOperationReceipt(userOpHash);
                }}
              >
                Get userOP Receipt
              </BLTButton>
            </div>
          )}
          {userOpReceipt && (
            <p>
              userOpReceipt:
              {JSON.stringify(userOpReceipt)}
            </p>
          )}
        </>
      ) : (
        <BLTButton onClick={loginHandler}>Login</BLTButton>
      )}
    </div>
  );
}
