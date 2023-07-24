import BloctoSDK from "@blocto/sdk";

const bloctoSDK = new BloctoSDK({
    solana: {
        net: "devnet"
    }
});

export { bloctoSDK };
