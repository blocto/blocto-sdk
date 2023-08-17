import EthereumProvider from './providers/ethereum';
import AptosProvider from './providers/aptos';
import { BloctoSDKConfig } from './index.d';

export default class BloctoSDK {
  ethereum?: EthereumProvider;
  aptos?: AptosProvider;

  constructor({ appId, ethereum, aptos }: BloctoSDKConfig) {
    if (ethereum) {
      this.ethereum = new EthereumProvider({
        ...ethereum,
        appId,
      });
    }
    if (aptos) {
      this.aptos = new AptosProvider({
        ...aptos,
        appId,
      });
    }
  }
}
