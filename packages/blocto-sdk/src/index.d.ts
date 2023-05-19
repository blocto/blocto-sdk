// eslint-disable-next-line spaced-comment
/// <reference types="typescript" />

import { BaseConfig } from './constants';
import {
  EthereumProviderConfig,
  EthereumProviderInterface,
} from './providers/types/ethereum.d';
import {
  SolanaProviderConfig,
  SolanaProviderInterface,
} from './providers/types/solana.d';
import {
  AptosProviderConfig,
  AptosProviderInterface,
} from './providers/types/aptos.d';
import * as AptosTypes from './providers/types/aptos.d'
import * as SolanaTypes from './providers/types/solana.d'
import * as EthereumTypes from './providers/types/ethereum.d'

export * from './providers/types/blocto.d';
export {
  BaseConfig,
  EthereumProviderConfig,
  EthereumProviderInterface,
  SolanaProviderConfig,
  SolanaProviderInterface,
  AptosProviderConfig,
  AptosProviderInterface,
  // Keep above types for backward compatibility
  AptosTypes,
  SolanaTypes,
  EthereumTypes,
};
export declare interface BloctoSDKConfig extends BaseConfig {
  ethereum?: Omit<EthereumProviderConfig, 'appId' | 'session'>;
  solana?: Omit<SolanaProviderConfig, 'appId' | 'session'>;
  aptos?: Omit<AptosProviderConfig, 'session'>;
}
declare class BloctoSDK {
  ethereum?: EthereumProviderInterface;
  solana?: SolanaProviderInterface;
  aptos?: AptosProviderInterface;
  constructor(config: BloctoSDKConfig);
}

export default BloctoSDK;
