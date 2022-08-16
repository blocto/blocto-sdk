import { BaseConfig } from '../../constants';
import BloctoProviderInterface from './blocto.d';

export declare interface AptosProviderConfig extends BaseConfig {
  // @todo: support different network
  chainId: number;
  server?: string;
}

export declare interface PublicAccount {
  address: string | null
  publicKey: string[] | null
  authKey: string | null
  minKeysRequired?: number
}

export declare interface AptosProviderInterface extends BloctoProviderInterface {
  publicAccount: PublicAccount;
  connect: () => Promise<PublicAccount>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any): Promise<{ hash: HexEncodedBytes }>;
  signTransaction(transaction: any): Promise<SubmitTransactionRequest>;
  disconnect(): Promise<void>;
}

