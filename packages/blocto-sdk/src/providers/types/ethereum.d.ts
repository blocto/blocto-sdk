import { IEthereumProvider } from 'eip1193-provider';
import { BaseConfig } from '../../constants';
import BloctoProviderInterface, { ProviderSession } from './blocto.d';
import { EvmSupportMapping } from '../../lib/getEvmSupport';

export interface EthereumProviderConfig extends BaseConfig {
  chainId: string | number | null;
  rpc?: string;
  walletServer?: string;
  session: ProviderSession;
}

export interface EIP1193RequestPayload {
  id?: number;
  jsonrpc?: string;
  method: string;
  params?: Array<any>;
}

interface SwitchableNetwork {
  [id: number | string]: {
    name: string;
    display_name: string;
    network_type: string;
    wallet_web_url: string;
    rpc_url: string;
  };
}

export interface EthereumProviderInterface
  extends BloctoProviderInterface,
    IEthereumProvider {
  chainId: string | number;
  networkVersion: string | number;
  rpc: string;
  _blocto: {
    session: ProviderSession;
    walletServer: string;
    blockchainName: string;
    networkType: string;
    supportNetworkList: EvmSupportMapping;
    switchableNetwork: SwitchableNetwork;
  };
  request(args: EIP1193RequestPayload): Promise<any>;
  loadSwitchableNetwork(
    networkList: {
      chainId: string;
      rpcUrls?: string[];
    }[]
  ): Promise<null>;
  injectedWalletServer?: string;
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
