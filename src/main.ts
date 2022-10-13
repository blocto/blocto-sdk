import EthereumProvider from './providers/ethereum';
import SolanaProvider from './providers/solana';
import AptosProvider from './providers/aptos';
import { BloctoSDKConfig } from './index.d';

// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export default class BloctoSDK {
  ethereum?: EthereumProvider;
  solana?: SolanaProvider;
  aptos?: AptosProvider;

  constructor({ appId, ethereum, solana, aptos }: BloctoSDKConfig) {
    if (ethereum) {
      this.ethereum = new EthereumProvider({ ...ethereum, appId });
    }
    if (solana) {
      this.solana = new SolanaProvider({ ...solana, appId });
    }
    if (aptos) {
      this.aptos = new AptosProvider({ ...aptos, appId });
    }
  }
}
