import { useState } from "react";

const SignMessage = ({ provider }) => {
    const [signingData, setSigningData] = useState("");
    const [signingError, setSigningError] = useState("");

    const signMessageHandler = async (address) => {
        try {
            const ethersProvider = provider;
            const signer = ethersProvider?.getSigner();
            const signature = await signer?.signMessage("hello blocto"); // message
            setSigningData(signature);
            setSigningError("");
        } catch (error) {
            setSigningError(error);
        }
    };
    return (
        <div>
            <button type="button" onClick={signMessageHandler}>
                <span>Sign Message</span>
            </button>
            <div>
                {signingData && (
                    <div style={{ wordBreak: "break-all" }}>
                        <code>Data Signature: {signingData}</code>
                    </div>
                )}
                {signingError && <div>Error signing message</div>}
            </div>
        </div>
    );
};

export default SignMessage;
