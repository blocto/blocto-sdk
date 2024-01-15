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
type BloctoOptions = {
  chainId: number;
  rpc: string;
};

export interface BloctoConstructorArgs {
  actions: Actions;
  options: BloctoOptions;
  onError?: (error: Error) => void;
}

export class BloctoConnector extends Connector {
  public provider: any;

  constructor({ actions, options, onError }: BloctoConstructorArgs) {
    super(actions, onError);
    const bloctoSDK = new BloctoSDK({
      ethereum: {
        chainId: options.chainId,
        rpc: options.rpc,
      },
    });

    this.provider = bloctoSDK.ethereum;

    this.provider.on(
      'connect',
      async ({ chainId }: ProviderConnectInfo): Promise<void> => {
        const accounts = await this.provider.request({
          method: 'eth_requestAccounts',
        });
        this.actions.update({ chainId: parseChainId(chainId), accounts });
      }
    );
    this.provider.on('disconnect', (error: ProviderRpcError): void => {
      this.actions.resetState();
      this.onError?.(error);
    });
    this.provider.on('chainChanged', async (chainId: string): Promise<void> => {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });
      this.actions.update({ chainId: parseChainId(chainId), accounts });
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

    if (!this.provider) throw new Error('No provider');
    if (
      !desiredChainId ||
      parseChainId(desiredChainId) === parseChainId(this.provider.chainId)
    ) {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });

      return this.actions.update({
        chainId: parseChainId(this.provider.chainId),
        accounts,
      });
    }
    const addEthereumChainParameters =
      typeof desiredChainIdOrChainParameters === 'number'
        ? { chainId: desiredChainId }
        : desiredChainIdOrChainParameters;

    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [addEthereumChainParameters],
    });
    await this.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: desiredChainId }],
    });
  }

  public deactivate(): void {
    this.provider.request({ method: 'wallet_disconnect' });
    this.actions.resetState();
  }
}
