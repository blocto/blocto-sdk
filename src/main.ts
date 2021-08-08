import { BaseConfig } from './constants';
import EthereumProvider, { EthereumProviderConfig } from './providers/ethereum';
import SolanaProvider, { SolanaProviderConfig } from './providers/solana';

// eslint-disable-next-line
import dotenv from 'dotenv';
dotenv.config();

export interface BloctoSDKConfig extends BaseConfig {
  ethereum: Omit<EthereumProviderConfig, 'appId'>;
  solana: Omit<SolanaProviderConfig, 'appId'>;
}

export default class BloctoSDK {
  ethereum: EthereumProvider;
  solana: SolanaProvider;

  constructor({ appId = null, ethereum, solana }: BloctoSDKConfig) {
    this.ethereum = new EthereumProvider({ ...ethereum, appId });
    this.solana = new SolanaProvider({ ...solana, appId });
  }
}
