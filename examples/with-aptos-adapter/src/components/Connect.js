import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function Connect() {

    const { wallets, connect, connected, disconnect } = useWallet();

    const onWalletSelect = (walletName) => {
        connect(walletName);
    };

    return (
        <div>
            {
                wallets.map((wallet) => (
                    <div key={wallet.name}>
                        {
                            !connected ? (
                                <button className="btn" onClick={() => onWalletSelect(wallet.name)}>
                                    <span>Connect {wallet.name}</span>
                                </button>
                            ) : (
                                <button className="btn" onClick={() => disconnect(wallet.name)}>
                                    <span>
                                        disconnect
                                    </span>
                                </button>
                            )
                        }
                    </div>

                ))
            }
        </div>

    )
}