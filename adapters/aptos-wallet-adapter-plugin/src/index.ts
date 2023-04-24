import type { AptosProviderInterface as IBloctoAptos } from '@blocto/sdk';
import BloctoSDK from '@blocto/sdk';
import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import {
  NetworkName,
  WalletReadyState
} from "@aptos-labs/wallet-adapter-core";
import type { Types } from "aptos";

interface BloctoWindow extends Window {
  bloctoAptos?: IBloctoAptos;
}

declare const window: BloctoWindow;

export const BloctoWalletName = "Blocto" as WalletName<"Blocto">;

export interface BloctoWalletAdapterConfig {
  network?: NetworkName.Mainnet | NetworkName.Testnet
  bloctoAppId: string;
}

export const APTOS_NETWORK_CHAIN_ID_MAPPING = {
  // MAINNET
  [NetworkName.Mainnet]: 1,
  // TESTNET
  [NetworkName.Testnet]: 2
};

export class BloctoWallet implements AdapterPlugin {
  readonly name = BloctoWalletName;
  readonly url =
    'https://blocto.app'
  readonly icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI2LjkwMjggMTIuMzAyNEMyMi4zOTEyIDEyLjMwMjQgMTcuOTg3NCAxNC4wNDIgMTQuNjk1MiAxNy4xMjhDMTEuMDg0NCAyMC41MTM3IDguNzk5MiAyNS41MTM4IDcuNDg5MzIgMzAuMjE3M0M2LjYzMTQgMzMuMjk1MyA2LjIwMTY0IDM2LjQ4NzYgNi4yMDE2NCAzOS42ODE0QzYuMjAxNjQgNDAuNjQ3MiA2LjI0MTI5IDQxLjYwNSA2LjMxNzQxIDQyLjU1MTdDNi40MTA5NyA0My43MDMgNy41MzIxNCA0NC41MDA3IDguNjQ4NTUgNDQuMTk5NEM5LjYyMjI0IDQzLjkzNzcgMTAuNjQ2NyA0My43OTY2IDExLjcwMjggNDMuNzk2NkMxMy44NzIyIDQzLjc5NjYgMTUuOTA1MiA0NC4zODY1IDE3LjY0OCA0NS40MTczQzE3LjY5MDggNDUuNDQyNiAxNy43MzIxIDQ1LjQ2OCAxNy43NzQ5IDQ1LjQ5MThDMjAuNjA3MiA0Ny4xODA3IDIzLjk0ODUgNDguMTA4NCAyNy41MTE4IDQ3Ljk4OTVDMzYuODA2MiA0Ny42ODE4IDQ0LjM5OTEgNDAuMTE5MSA0NC43NDE2IDMwLjgyNjJDNDUuMTE1OSAyMC42NTk2IDM2Ljk4NyAxMi4zMDA4IDI2LjkwNDQgMTIuMzAwOEwyNi45MDI4IDEyLjMwMjRaTTI2LjkwMjggMzguMzA4MUMyMi4zOTc1IDM4LjMwODEgMTguNzQ1NCAzNC42NTYgMTguNzQ1NCAzMC4xNTIzQzE4Ljc0NTQgMjUuNjQ4NiAyMi4zOTc1IDIxLjk5NDggMjYuOTAyOCAyMS45OTQ4QzMxLjQwODEgMjEuOTk0OCAzNS4wNjAyIDI1LjY0NyAzNS4wNjAyIDMwLjE1MjNDMzUuMDYwMiAzNC42NTc1IDMxLjQwODEgMzguMzA4MSAyNi45MDI4IDM4LjMwODFaIiBmaWxsPSIjMTRBQUZGIi8+CjxwYXRoIGQ9Ik0xOS41NjM3IDYuNjgyNjFDMTkuNTYzNyA5LjAzNDM2IDE4LjMzMTUgMTEuMjE2NCAxNi4zMDggMTIuNDE1M0MxNS4wMzc4IDEzLjE2ODYgMTMuODQ2OCAxNC4wNTgyIDEyLjc2ODUgMTUuMDcxNUMxMC4zNzU1IDE3LjMxMzkgOC41ODk4NSAyMC4wNjUzIDcuMjY3MjggMjIuNzkyOUM3LjAwNzIxIDIzLjMzMDQgNi4yMDAwMyAyMy4xNDAyIDYuMjAwMDMgMjIuNTQyM1Y2LjY4MjYxQzYuMjAwMDMgMi45OTI0MiA5LjE5MjQ1IDAgMTIuODgyNiAwQzE2LjU3MjggMCAxOS41NjUyIDIuOTkyNDIgMTkuNTY1MiA2LjY4MjYxSDE5LjU2MzdaIiBmaWxsPSIjMDA3NUZGIi8+Cjwvc3ZnPgo=';

  readonly providerName = "bloctoAptos"

  provider: IBloctoAptos | undefined =
    typeof window !== "undefined" ? window.bloctoAptos : undefined;

  readyState?: WalletReadyState = WalletReadyState.Loadable;

  protected _network: NetworkName.Mainnet | NetworkName.Testnet

  constructor({
    network = NetworkName.Mainnet,
    bloctoAppId
  }: BloctoWalletAdapterConfig) {
    const sdk = new BloctoSDK({
      aptos: {
        chainId: APTOS_NETWORK_CHAIN_ID_MAPPING[network]
      },
      appId: bloctoAppId
    });

    this.provider = sdk.aptos
    this._network = network;
  }

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) throw `${BloctoWalletName} Address Info Error`;
      if (!accountInfo.address) throw `${BloctoWalletName} address null`;
      if (!accountInfo.publicKey) throw `${BloctoWalletName} publicKey null`;
      if (!accountInfo.minKeysRequired) throw `${BloctoWalletName} minKeysRequired null`;
      return {
        address: accountInfo.address,
        publicKey: accountInfo.publicKey,
        minKeysRequired: accountInfo.minKeysRequired
      };
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    const response = await this.provider?.publicAccount;
    if (!response) throw `${BloctoWalletName} Account Error`;
    if (!response.address) throw `${BloctoWalletName} address null`;
    if (!response.publicKey) throw `${BloctoWalletName} publicKey null`;
    if (!response.minKeysRequired) throw `${BloctoWalletName} minKeysRequired null`;
    return {
      address: response.address,
      publicKey: response.publicKey,
      minKeysRequired: response.minKeysRequired
    };
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect();
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      try {
        const provider = this.provider;
        const response = await provider?.signAndSubmitTransaction(transaction, options);
        if (response) {
          return { hash: response.hash };
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        throw new Error(error.message || error);
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${BloctoWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.signMessage(message);
      if (response) {
        return response;
      } else {
        throw `${BloctoWalletName} Sign Message failed`;
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.network();
      if (!response) throw `${BloctoWalletName} Network Error`;
      const name = response.name as unknown
      return {
        name: name as NetworkName,
        chainId: response.chainId,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      // not supported yet
      return Promise.resolve();
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      // not supported yet
      return Promise.resolve();
    } catch (error: any) {
      console.log(error);
      const errMsg = error.message;
      throw errMsg;
    }
  }
}
