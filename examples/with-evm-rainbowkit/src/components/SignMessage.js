import { useSignMessage, useAccount } from "wagmi";

const SignMessage = () => {
    const { isConnected } = useAccount();
    const {
        data: signingData,
        error: signingError,
        signMessage
    } = useSignMessage({
        message: "wen token"
    });
    return (
        <div>
            <button
                disabled={!isConnected}
                onClick={() => signMessage()}
                type="button"
            >
                Sign Message
            </button>
            <div>
                {signingData && (
                    <div style={{ wordBreak: "break-all" }}>
                        Data Signature: {signingData}
                    </div>
                )}
                {signingError && <div>Error signing message</div>}
            </div>
        </div>
    );
};

export default SignMessage;
