import EthereumProvider from './providers/ethereum';
import SolanaProvider from './providers/solana';

// eslint-disable-next-line
import dotenv from 'dotenv';
dotenv.config();
interface BloctoSDKConfig {
  appId: string | null;
  ethereum: {
    chainId: string | number;
    rpc?: string;
    server?: string;
  };
  solana: {
    net: string;
  }
}
class BloctoSDK {
  ethereum: EthereumProvider;
  solana: SolanaProvider;

  constructor({ appId = null, ethereum, solana }: BloctoSDKConfig) {
    this.ethereum = new EthereumProvider({ ...ethereum, appId });
    this.solana = new SolanaProvider({ ...solana, appId });
  }
}

export default BloctoSDK;
