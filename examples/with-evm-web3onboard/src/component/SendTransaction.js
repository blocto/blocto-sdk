import { useState } from "react";

const SendTransaction = ({ provider }) => {
    const [transactionData, setTransactionData] = useState("");
    const [transactionError, setTransactionError] = useState("");

    const sendTransactionHandler = async () => {
        try {
            const signer = provider.getSigner();

            const popTransaction = await signer.populateTransaction({
                to: "0x0000000000000000000000000000000000000000", // address
                value: 100000000000000 // amount
            });
            const txn = await signer.sendTransaction(popTransaction);
            const receipt = await txn.wait();
            setTransactionData(receipt);
            setTransactionError("");
        } catch (error) {
            setTransactionError(error);
        }
    };

    return (
        <div>
            <button
                className="btn"
                onClick={() => sendTransactionHandler()}
                type="button"
            >
                <span>Send Transaction</span>
            </button>
            <div>
                {transactionData && (
                    <code>Transaction: {JSON.stringify(transactionData)}</code>
                )}
                {transactionError && <div>Error sending transaction</div>}
            </div>
        </div>
    );
};
export default SendTransaction;
