import {
    useSendTransaction,
    usePrepareSendTransaction,
    useAccount
} from "wagmi";

const SendTransaction = () => {
    const { address, isConnected } = useAccount();

    const { config: sendTransactionConfig } = usePrepareSendTransaction({
        enabled: !!address,
        to: "0x945de2DeaDb397Da7005cC5FE37d36e4c674E83d", // send to address
        value: 0n
    });

    const {
        data: transactionData,
        error: transactionError,
        sendTransaction
    } = useSendTransaction(sendTransactionConfig);

    return (
        <div>
            <button
                disabled={!isConnected || !sendTransaction}
                onClick={() => sendTransaction?.()}
                type="button"
            >
                Send Transaction
            </button>
            <div>
                {transactionData && (
                    <div>Transaction: {JSON.stringify(transactionData)}</div>
                )}
                {transactionError && <div>Error sending transaction</div>}
            </div>
        </div>
    );
};
export default SendTransaction;
