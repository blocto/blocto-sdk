import { useSignMessage } from "wagmi";
import { FormEvent } from "react";


export default function SignMessage() {
  const { data, error, isLoading, signMessage } = useSignMessage();

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const message = formData.get("message") as string;
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
          <div>
            Signature:
            <br />
            <p style={{ maxWidth: "75vw", wordBreak: "break-all" }}>{data}</p>
          </div>
        </div>
      )}

      {error && <div>{error.message}</div>}
    </form>
  );
}
