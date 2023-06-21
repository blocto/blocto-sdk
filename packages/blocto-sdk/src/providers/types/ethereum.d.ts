import { IEthereumProvider } from 'eip1193-provider';
import { BaseConfig } from '../../constants';
import BloctoProviderInterface from './blocto.d';
import { EvmSupportMapping } from '../../lib/getEvmSupport';
import { KEY_SESSION } from '../../lib/storage';

export interface EthereumProviderConfig extends BaseConfig {
  chainId: string | number | null;
  rpc?: string;
  walletServer?: string;
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
    sessionKey: KEY_SESSION;
    walletServer: string;
    blockchainName: string;
    networkType: string;
    supportNetworkList: EvmSupportMapping;
    switchableNetwork: SwitchableNetwork;
  };
  sendUserOperation(userOp: IUserOperation): Promise<string>;
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

/**
 *  A [[HexString]] whose length is even, which ensures it is a valid
 *  representation of binary data.
 */
export type DataHexString = string;

/**
 *  An object that can be used to represent binary data.
 */
export type BytesLike = DataHexString | Uint8Array;

/**
 *  Any type that can be used where a numeric value is needed.
 */
export type Numeric = number | bigint;

/**
 *  Any type that can be used where a big number is needed.
 */
export type BigNumberish = string | Numeric;

/**
 *  An interface for an ERC-4337 transaction object.
 *  Note: BloctoSDK do not need sender, nonce, initCode, signature to send userOperation.
 *  These parameters will be ignored.
 */
export interface IUserOperation {
  callData: BytesLike;
  callGasLimit?: BigNumberish;
  verificationGasLimit?: BigNumberish;
  preVerificationGas?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  paymasterAndData?: BytesLike;
  /**
   *  If provided, please ensure it is same as login account.
   */
  sender?: string;
  /**
   * BloctoSDK do not need nonce to send userOperation. Will be ignored.
   * */
  nonce?: BigNumberish;
  /**
   * BloctoSDK do not need initCode to send userOperation. Will be ignored.
   * */
  initCode?: BytesLike;
  /**
   * BloctoSDK do not need signature to send userOperation. Will be ignored.
   * */
  signature?: BytesLike;
}
