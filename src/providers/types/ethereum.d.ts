import { BaseConfig } from '../../constants';
import BloctoProviderInterface from './blocto.d';

export declare interface EthereumProviderConfig extends BaseConfig {
  chainId: string | number | null;
  rpc?: string;
  server?: string;
}

export declare interface EthereumProviderInterface extends BloctoProviderInterface {
  code: string | null;
  chainId: string | number;
  networkId: string | number;
  chain: string;
  net: string;
  rpc: string;
  server: string;
  sessionKey: string;
  accounts: Array<string>;
}

