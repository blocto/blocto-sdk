import * as React from "react";
import { useSignMessage } from "wagmi";
import { useAccount } from "wagmi";
import Web3 from "web3";
import DappAuth from "@blocto/dappauth";

export default function SignMessage() {
  const dappAuth = new DappAuth(new Web3.providers.HttpProvider('https://rpc.ankr.com/eth_goerli'));
  // const dappAuth = new DappAuth(new Web3.providers.HttpProvider('https://rpc.ankr.com/eth'));
  
  const { address } = useAccount();
  const [isAuthorizedSigner, setIsAuthorizedSigner] = React.useState(false);
  const { data, error, isLoading, signMessage } = useSignMessage({
    async onSuccess(data, variables) {
      const _isAuthorizedSigner = await dappAuth.isAuthorizedSigner(
        variables.message,
        data,
        address
      );

      setIsAuthorizedSigner(_isAuthorizedSigner);
    }
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const message = formData.get("message");
    signMessage({ message });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <label htmlFor="message">Enter a message to sign</label>
      <input id="message" name="message" placeholder="Icecream" />
      <button disabled={isLoading}>
        {isLoading ? "Check Wallet" : "Sign Message"}
      </button>

      {data && (
        <div>
          <div>Signature: {data}</div>
          <div>
            Verify Signature Result: {isAuthorizedSigner ? "True" : "False"}
          </div>
        </div>
      )}

      {error && <div>{error.message}</div>}
    </form>
  );
}