/* eslint-disable @typescript-eslint/no-unused-vars */
import { Connector, Chain, ConnectorData, WalletClient } from 'wagmi';
import { SwitchChainError, Address, createWalletClient, custom } from 'viem';
import type {
  EthereumProviderConfig as BloctoOptions,
  EthereumProviderInterface as BloctoProvider,
} from '@blocto/sdk';
import BloctoSDK from '@blocto/sdk';
import { providers } from 'ethers';
import { ConnectorNotFoundError } from 'wagmi';
import { hexValue } from 'ethers/lib/utils.js';
import { normalizeChainId } from './util/normalizeChainId';

type BloctoWalletSigner = providers.JsonRpcSigner;

class BloctoConnector extends Connector<
  BloctoProvider,
  BloctoOptions
> {
  readonly id = 'bloctoWallet';
  readonly name = 'Blocto Wallet';
  readonly ready = true;

  #provider?: BloctoProvider;

  constructor(config: { chains?: Chain[]; options: BloctoOptions }) {
    super(config);
  }

  getProvider(): Promise<BloctoProvider> {
    if (!this.#provider) {
      this.#provider = new BloctoSDK({ ethereum: this.options })?.ethereum;
    }

    if (!this.#provider) {
      throw new ConnectorNotFoundError();
    }

    return Promise.resolve(this.#provider);
  }

  async connect(
    config?: { chainId?: number }
  ): Promise<Required<ConnectorData>> {
    const provider = await this.getProvider();
    this.#setupListeners();
    await provider?.enable();
    const account = await this.getAccount();
    const id = await this.getChainId();
    const unsupported = this.isChainUnsupported(id);

    return {
      account,
      chain: { id, unsupported },
    };
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

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  }
  protected onDisconnect(): void {
    this.emit('disconnect');
  }

  #onAccountsChangedBind: typeof this.onAccountsChanged = this.onAccountsChanged.bind(this);
  #onChainChangedBind: typeof this.onChainChanged = this.onChainChanged.bind(this);
  #onDisconnectBind: typeof this.onDisconnect = this.onDisconnect.bind(this);
  
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
}


export default BloctoConnector;
