import { IEthereumProvider } from 'eip1193-provider';
import { BaseConfig } from '../../constants';
import BloctoProviderInterface, { ProviderSession } from './blocto.d';

export interface EthereumProviderConfig extends BaseConfig {
  chainId: string | number | null;
  rpc?: string;
  server?: string;
  session: ProviderSession;
}

export interface EIP1193RequestPayload {
  id?: number;
  jsonrpc?: string;
  method: string;
  params?: Array<any>;
}

export interface EthereumProviderInterface
  extends BloctoProviderInterface,
    IEthereumProvider {
  chainId: string | number;
  networkVersion: string | number;
  chain: string;
  net: string;
  rpc: string;
  server: string;
  request(args: EIP1193RequestPayload): Promise<any>;
  loadSwitchableNetwork(
    networkList: {
      chainId: string;
      rpcUrls?: string[];
    }[]
  ): Promise<null>;
}

export interface AddEthereumChainParameter {
  chainId: string;
  rpcUrls: string[];
}

export interface JsonRpcRequest {
  id?: string | undefined;
  jsonrpc: '2.0';
  method: string;
  params?: Array<any>;
}

export interface JsonRpcResponse {
  id: string | undefined;
  jsonrpc: '2.0';
  method: string;
  result?: unknown;
  error?: Error;
}

export type JsonRpcCallback = (
  error: Error | null,
  response?: JsonRpcResponse
) => unknown;
