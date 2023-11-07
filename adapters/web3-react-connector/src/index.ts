import type {
  Actions,
  AddEthereumChainParameter,
  ProviderConnectInfo,
  ProviderRpcError,
} from '@web3-react/types';
import { Connector } from '@web3-react/types';
import BloctoSDK from '@blocto/sdk';

function parseChainId(chainId: string | number): number {
  return typeof chainId === 'number'
    ? chainId
    : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
}

/**
 * @param options - Options to pass to Blocto SDK.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface BloctoConstructorArgs {
  actions: Actions;
  options: {
    chainId: number;
    rpc: string;
  };
  onError?: (error: Error) => void;
}

export class BloctoConnector extends Connector {
  public provider: any;
  private bloctoSDK: BloctoSDK;

  constructor({ actions, options, onError }: BloctoConstructorArgs) {
    super(actions, onError);
    this.bloctoSDK = new BloctoSDK({
      ethereum: {
        chainId: options.chainId,
        rpc: options.rpc,
      },
    });
    this.provider = this.bloctoSDK.ethereum;
  }

  private async isomorphicInitialize(): Promise<void> {
    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
      this.actions.update({ chainId: parseChainId(chainId) });
    });
    this.provider.on('disconnect', (error: ProviderRpcError): void => {
      this.actions.resetState();
      this.onError?.(error);
    });
    this.provider.on('chainChanged', (chainId: string): void => {
      this.actions.update({ chainId: parseChainId(chainId) });
    });
    this.provider.on('accountsChanged', (accounts: string[]): void => {
      if (accounts.length === 0) this.actions.resetState();
      else this.actions.update({ accounts });
    });
  }

  public async activate(
    desiredChainIdOrChainParameters?: number | AddEthereumChainParameter
  ): Promise<void> {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId;
    await this.isomorphicInitialize();
    if (!this.provider) throw new Error('No provider');
    if (
      !desiredChainId ||
      parseChainId(desiredChainId) === parseChainId(this.provider.chainId)
    ) {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
      return this.actions.update({
        chainId: parseChainId(this.provider.chainId),
        accounts,
      });
    } else if (typeof desiredChainIdOrChainParameters === 'number') {
      await this.provider
        .request({
          method: 'wallet_addEthereumChain',
          params: [{ chainId: desiredChainId }],
        })
        .then(() => {
          this.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainId }],
          });
        });
      await this.activate(desiredChainId);
    } else {
      // AddEthereumChainParameter
      await this.provider
        .request({
          method: 'wallet_addEthereumChain',
          params: [desiredChainIdOrChainParameters],
        })
        .then(() => {
          this.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainId }],
          });
        });
      await this.activate(desiredChainId);
    }
  }

  public deactivate(): void {
    this.provider?.handleDisconnect();
    this.actions.resetState();
  }
}
