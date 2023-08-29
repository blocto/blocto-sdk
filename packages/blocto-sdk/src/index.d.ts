// eslint-disable-next-line spaced-comment
/// <reference types="typescript" />

import { BaseConfig } from './constants';
import {
  EthereumProviderConfig,
  EthereumProviderInterface,
} from './providers/types/ethereum.d';
import {
  AptosProviderConfig,
  AptosProviderInterface,
} from './providers/types/aptos.d';
import * as AptosTypes from './providers/types/aptos.d';
import * as EthereumTypes from './providers/types/ethereum.d';

export * from './providers/types/blocto.d';
export {
  BaseConfig,
  EthereumProviderConfig,
  EthereumProviderInterface,
  AptosProviderConfig,
  AptosProviderInterface,
  // Keep above types for backward compatibility
  AptosTypes,
  EthereumTypes,
};
export declare interface BloctoSDKConfig extends BaseConfig {
  ethereum?: Omit<EthereumProviderConfig, 'appId'>;
  aptos?: Omit<AptosProviderConfig>;
}
declare class BloctoSDK {
  ethereum?: EthereumProviderInterface;
  aptos?: AptosProviderInterface;
  constructor(config: BloctoSDKConfig);
}

export default BloctoSDK;
