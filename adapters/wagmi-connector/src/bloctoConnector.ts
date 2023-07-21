import { Connector, Chain, ConnectorData, WalletClient, ConnectorNotFoundError } from '@wagmi/core';
import { SwitchChainError, Address, createWalletClient, custom, UserRejectedRequestError } from 'viem';
import type {
  EthereumProviderConfig,
  EthereumProviderInterface as BloctoProvider,
} from '@blocto/sdk';
import BloctoSDK from '@blocto/sdk';
import { providers } from 'ethers';
import { hexValue } from 'ethers/lib/utils.js';
import { normalizeChainId } from './util/normalizeChainId';

type BloctoWalletSigner = providers.JsonRpcSigner;
type BloctoOptions = Omit<EthereumProviderConfig, 'walletServer'>;

class BloctoConnector extends Connector<
  BloctoProvider,
  BloctoOptions
> {
  readonly id = 'bloctoWallet';
  readonly name = 'Blocto Wallet';
  readonly ready = true;

  #provider?: BloctoProvider;
  #onAccountsChangedBind: typeof this.onAccountsChanged;
  #onChainChangedBind: typeof this.onChainChanged;
  #onDisconnectBind: typeof this.onDisconnect;

  constructor(config: { chains?: Chain[]; options: BloctoOptions }) {
    super(config);
    this.#onAccountsChangedBind = this.onAccountsChanged.bind(this);
    this.#onChainChangedBind = this.onChainChanged.bind(this);
    this.#onDisconnectBind = this.onDisconnect.bind(this);
  }

  getProvider({ chainId }: { chainId?: number } = {}): Promise<BloctoProvider> {
    if (!this.#provider) {
      // TODO: valid constructor options.chainId is equal to options.chainId
      const { appId, ...rests } = this.options;
      const config = { ...rests, chainId: chainId ?? rests.chainId };
      this.#provider = new BloctoSDK({ ethereum: config, appId })?.ethereum;
    }

    if (!this.#provider) {
      throw new ConnectorNotFoundError();
    }

    return Promise.resolve(this.#provider);
  }

  async connect(
    config?: { chainId?: number }
  ): Promise<Required<ConnectorData>> {
    try {
      const provider = await this.getProvider(config);
      this.#setupListeners();
      await provider?.enable();
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
    this.#removeListeners();
    await provider?.request({ method: 'wallet_disconnect' });
  }

  async getAccount(): Promise<Address> {
    const provider = await this.getProvider();

    return provider
      .request({ method: 'eth_requestAccounts' })
      .then((accounts): `0x${string}` => accounts[0]);
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider();

    return provider
      .request({ method: 'eth_chainId' })
      .then((chainId): number => parseInt(chainId));
  }

  async getSigner(
    config?: { chainId?: number | undefined } | undefined
  ): Promise<BloctoWalletSigner> {
    const provider = await this.getProvider();
    const account = await this.getAccount();

    return new providers.Web3Provider(provider).getSigner(account);
  }

  async isAuthorized(): Promise<boolean> {
    const account = await this.getAccount();
    return Promise.resolve(!!account);
  }

  async switchChain(chainId: number): Promise<Chain> {
    const provider = await this.getProvider();
    const id = hexValue(chainId);
    const chain = this.chains.find((x) => x.id === chainId);
    
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          { chainId: id, rpcUrls: [chain?.rpcUrls.infura?.http[0] ?? ''] },
        ],
      });
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      });

      return (
        chain ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
          rpcUrls: { default: { http: [''] }, public: { http: [''] } },
        }
      );
    } catch (error: unknown) {
      throw new SwitchChainError(error as Error);
    }
  }

  async getWalletClient({ chainId }: { chainId?: number }): Promise<WalletClient> {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ])
    const chain = this.chains.find((x) => x.id === chainId)
    if (!provider) throw new Error('provider is required.')
    return createWalletClient({
      account,
      chain,
      transport: custom(provider),
    })
  }

  protected onAccountsChanged(accounts: string[]): void {
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

    provider.on("accountsChanged", this.#onAccountsChangedBind);
    provider.on("chainChanged", this.#onChainChangedBind);
    provider.on("disconnect", this.#onDisconnectBind);
  }

  async #removeListeners(): Promise<void> {
    const provider = await this.getProvider();

    provider.off("accountsChanged", this.#onAccountsChangedBind);
    provider.off("chainChanged", this.#onChainChangedBind);
    provider.off("disconnect", this.#onDisconnectBind);
  }

  #handleConnectReset() {
    this.#provider = undefined;
  }
}


export default BloctoConnector;
export type { BloctoOptions };