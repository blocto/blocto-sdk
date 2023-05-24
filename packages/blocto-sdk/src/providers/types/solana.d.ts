import type { Connection, Transaction } from '@solana/web3.js';
import { RequestArguments } from 'eip1193-provider';
import { BaseConfig } from '../../constants';
import BloctoProviderInterface, { ProviderSession } from './blocto.d';

export declare interface SolanaProviderConfig extends BaseConfig {
  net: string;
  server?: string;
  rpc?: string;
  session: ProviderSession;
}

export declare interface SolanaProviderInterface
  extends BloctoProviderInterface {
  net: string;
  rpc: string;
  server: string;
  appId: string;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request(params: RequestArguments): Promise<any>;

  signAndSendTransaction(
    transaction: Transaction,
    connection?: Connection
  ): Promise<string>;
  convertToProgramWalletTransaction(
    transaction: Transaction
  ): Promise<Transaction>;
}
