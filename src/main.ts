
import EthereumProvider from './providers/ethereum';
// eslint-disable-next-line
import dotenv from 'dotenv';
dotenv.config();
interface BloctoSDKConfig {
  appId: string | null;
  ethereum: {
    chainId: string | number;
    rpc?: string;
    server?: string;
  }
}
class BloctoSDK {
  ethereum: EthereumProvider;

  constructor({ appId = null, ethereum }: BloctoSDKConfig) {
    this.ethereum = new EthereumProvider({ ...ethereum, appId });
  }
}

export default BloctoSDK;
