import {
  Connector,
  Chain,
  ConnectorData,
  WalletClient,
  ConnectorNotFoundError,
} from '@wagmi/core';
import {
  SwitchChainError,
  Address,
  createWalletClient,
  custom,
  numberToHex,
} from 'viem';
import type {
  EthereumProviderConfig,
  EthereumProviderInterface as BloctoProvider,
} from '@blocto/sdk';
import BloctoSDK from '@blocto/sdk';
import { normalizeChainId } from './util/normalizeChainId';

type BloctoOptions = {
  /**
   * Your app’s unique identifier that can be obtained at https://developers.blocto.app,
   * To get advanced features and support with Blocto.
   *
   * https://docs.blocto.app/blocto-sdk/register-app-id
   */
  appId?: string;
};

class BloctoConnector extends Connector<BloctoProvider, BloctoOptions> {
  readonly id = 'blocto';
  readonly name = 'Blocto';
  readonly ready = true;
  #provider?: BloctoProvider;
  #onAccountsChangedBind: typeof this.onAccountsChanged;
  #onChainChangedBind: typeof this.onChainChanged;
  #onDisconnectBind: typeof this.onDisconnect;

  constructor({
    chains,
    options = {},
  }: {
    chains?: Chain[];
    options?: BloctoOptions;
  }) {
    super({ chains, options });
    this.#onAccountsChangedBind = this.onAccountsChanged.bind(this);
    this.#onChainChangedBind = this.onChainChanged.bind(this);
    this.#onDisconnectBind = this.onDisconnect.bind(this);
  }

  getProvider({ chainId }: { chainId?: number } = {}): Promise<BloctoProvider> {
    if (!this.#provider) {
      const { appId } = this.options;
      const _chainId = chainId ?? this.chains[0]?.id;
      const config: EthereumProviderConfig = {
        chainId: _chainId,
        rpc: this.chains.find((x) => x.id === _chainId)?.rpcUrls.default
          .http?.[0],
      };
      this.#provider = new BloctoSDK({ ethereum: config, appId })?.ethereum;
    }

    if (!this.#provider) {
      throw new ConnectorNotFoundError();
    }

    return Promise.resolve(this.#provider);
  }

  async connect(config?: {
    chainId?: number;
  }): Promise<Required<ConnectorData>> {
    try {
      const provider = await this.getProvider(config);

      this.#setupListeners();
      this.emit('message', { type: 'connecting' });

      await provider.request({
        method: 'eth_requestAccounts',
      });

      const account = await this.getAccount();
      const id = await this.getChainId();
      const unsupported = this.isChainUnsupported(id);

      return {
        account,
        chain: { id, unsupported },
      };
    } catch (error: unknown) {
      this.#handleConnectReset();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    const provider = await this.getProvider();
    await provider.request({ method: 'wallet_disconnect' });
    this.#removeListeners();
    this.#handleConnectReset();
  }

  async getAccount(): Promise<Address> {
    const provider = await this.getProvider();
    const accounts = await provider.request({
      method: 'eth_accounts',
    });
    const [address] = accounts || [];

    if (!address) {
      throw new Error('No accounts found');
    }

    return address;
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    const chainId = await provider.request({ method: 'eth_chainId' });

    return normalizeChainId(chainId);
  }

  async isAuthorized(): Promise<boolean> {
    const walletName = this.storage?.getItem('wallet');
    const connected = Boolean(this.storage?.getItem('connected'));
    const isConnect = walletName === 'blocto' && connected;
    return Promise.resolve(isConnect);
  }

  async switchChain(chainId: number): Promise<Chain> {
    try {
      const provider = await this.getProvider();
      const id = numberToHex(chainId);
      const chain = this.chains.find((x) => x.id === chainId);
      const networks = await provider.supportChainList();
      const evmSupportMap = networks.reduce(
        (a: any, v: any) => ({ ...a, [v.chainId]: v }),
        {}
      );
      const isBloctoSupportChain = evmSupportMap[`${chainId}`];

      if (!chain || !isBloctoSupportChain) {
        throw new SwitchChainError(
          new Error(`Blocto unsupported chain: ${id}`)
        );
      }

      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: id, rpcUrls: chain?.rpcUrls.default.http }],
      });
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      });

      return chain;
    } catch (error: unknown) {
      if (this.#isUserRejectedRequestError(error)) {
        throw error;
      }
      throw new SwitchChainError(error as Error);
    }
  }

  async getWalletClient({
    chainId,
  }: {
    chainId?: number;
  }): Promise<WalletClient> {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);
    const chain = this.chains.find((x) => x.id === chainId);
    if (!provider) throw new Error('provider is required.');
    return createWalletClient({
      account,
      chain,
      transport: custom(provider),
    }) as WalletClient;
  }

  protected onAccountsChanged(): void {
    // not supported yet
  }

  protected async onChainChanged(chainId: string | number): Promise<void> {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    const account = await this.getAccount();
    this.emit('change', { chain: { id, unsupported }, account });
  }
  protected onDisconnect(): void {
    this.emit('disconnect');
  }

  async #setupListeners(): Promise<void> {
    const provider = await this.getProvider();

    provider.on('accountsChanged', this.#onAccountsChangedBind);
    provider.on('chainChanged', this.#onChainChangedBind);
    provider.on('disconnect', this.#onDisconnectBind);
  }

  async #removeListeners(): Promise<void> {
    const provider = await this.getProvider();

    provider.off('accountsChanged', this.#onAccountsChangedBind);
    provider.off('chainChanged', this.#onChainChangedBind);
    provider.off('disconnect', this.#onDisconnectBind);
  }

  #handleConnectReset(): void {
    this.#provider = undefined;
  }

  #isUserRejectedRequestError(error: unknown): boolean {
    return /(user rejected)/i.test((error as Error).message);
  }
}

export default BloctoConnector;
export type { BloctoOptions };
