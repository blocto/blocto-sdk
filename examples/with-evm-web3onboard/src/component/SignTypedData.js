import { useState } from "react";
import { useWallets } from "@web3-onboard/react";

let typedMsg = JSON.stringify(
    {
        domain: {
            chainId: "0x13881",
            name: "Web3-Onboard Test App",
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
            version: "1"
        },
        message: {
            contents: "Hello, Bob!",
            from: {
                name: "Cow",
                wallets: [
                    "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                    "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"
                ]
            },
            to: [
                {
                    name: "Bob",
                    wallets: [
                        "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                        "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
                        "0xB0B0b0b0b0b0B000000000000000000000000000"
                    ]
                }
            ]
        },
        primaryType: "Message",
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" }
            ],
            Message: [
                { name: "from", type: "Person" },
                { name: "to", type: "Person[]" },
                { name: "contents", type: "string" }
            ],
            Person: [
                { name: "name", type: "string" },
                { name: "wallets", type: "address[]" }
            ]
        }
    },
    undefined,
    2
);

const SignTypedData = ({ provider }) => {
    const [typedData, setTypedData] = useState("");
    const [typedError, setTypedError] = useState("");
    // see more https://onboard.blocknative.com/docs/modules/react#usewallets
    const [{ accounts }] = useWallets();
    const walletAddress = accounts?.[0]?.address || "";

    const signTypedDataHandler = async () => {
        try {
            const params = [walletAddress, typedMsg];
            const signature = await provider.request({
                method: "eth_signTypedData_v4",
                params
            });
            setTypedData(signature);
            setTypedError("");
        } catch (error) {
            setTypedError(error);
        }
    };

    return (
        <div>
            <button onClick={signTypedDataHandler} type="button">
                <span>Sign Typed Data</span>
            </button>
            <div>
                {typedData && <code>Typed Data Signature: {typedData}</code>}
                {typedError && <div>Error signing typed message</div>}
            </div>
        </div>
    );
};

export default SignTypedData;
