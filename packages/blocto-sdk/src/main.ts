import EthereumProvider from './providers/ethereum';
import SolanaProvider from './providers/solana';
import AptosProvider from './providers/aptos';
import { BloctoSDKConfig } from './index.d';

const sharedSession = { connected: false, code: null, accounts: {} };

export default class BloctoSDK {
  ethereum?: EthereumProvider;
  solana?: SolanaProvider;
  aptos?: AptosProvider;

  constructor({ appId, ethereum, solana, aptos }: BloctoSDKConfig) {
    if (ethereum) {
      this.ethereum = new EthereumProvider({
        ...ethereum,
        appId,
        session: sharedSession,
      });
    }
    if (solana) {
      this.solana = new SolanaProvider({
        ...solana,
        appId,
        session: sharedSession,
      });
    }
    if (aptos) {
      this.aptos = new AptosProvider({
        ...aptos,
        appId,
        session: sharedSession,
      });
    }
  }
}
