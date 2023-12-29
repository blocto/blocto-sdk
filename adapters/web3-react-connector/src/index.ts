import type {
  Actions,
  AddEthereumChainParameter,
  Provider,
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
  private options: BloctoOptions;

  constructor({ actions, options, onError }: BloctoConstructorArgs) {
    super(actions, onError);
    this.options = options;
  }

  private getProvider() {
    if (!this.provider) {
      const bloctoSDK = new BloctoSDK({
        ethereum: {
          chainId: this.options.chainId,
          rpc: this.options.rpc,
        },
      });
      this.provider = (bloctoSDK.ethereum as unknown) as Provider;
    }

    if (!this.provider) throw new Error('Blocto Provider not found');

    return this.provider;
  }

  private async getChainId(): Promise<string> {
    return (await this.provider?.request({ method: 'eth_chainId' })) as string;
  }

  public async activate(
    desiredChainIdOrChainParameters?: AddEthereumChainParameter
  ): Promise<void> {
    const desiredChainId = desiredChainIdOrChainParameters?.chainId;
    const provider = this.getProvider();
    const chainId = await this.getChainId();

    if (
      !desiredChainId ||
      parseChainId(desiredChainId) === parseChainId(chainId)
    ) {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      return this.actions.update({
        chainId: parseChainId(chainId),
        accounts,
      });
    }

    // switch chain
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [desiredChainIdOrChainParameters],
    });

    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: desiredChainId }],
    });
  }

  public deactivate(): void {
    const provider = this.getProvider();

    provider.request({ method: 'wallet_disconnect' });
    this.actions.resetState();
  }
}
