import { BaseConfig, WalletAdapterNetwork } from '../../constants';
import BloctoProviderInterface from './blocto.d';

export { WalletAdapterNetwork } from '../../constants';

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

export type NetworkInfo = {
  api?: string;
  chainId?: string;
  name: WalletAdapterNetwork | undefined;
};

export type TxOptions ={
  max_gas_amount?: string,
  gas_unit_price?: string,
  [key: string]: any
}

export declare interface AptosProviderInterface extends BloctoProviderInterface {
  publicAccount: PublicAccount;
  network(): Promise<NetworkInfo>;
  connect: () => Promise<PublicAccount>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction(transaction: any, txOptions?:TxOptions): Promise<{ hash: HexEncodedBytes }>;
  signTransaction(transaction: any): Promise<SubmitTransactionRequest>;
  signMessage(payload: SignMessagePayload): Promise<SignMessageResponse>;
  disconnect(): Promise<void>;
}

