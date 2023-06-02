import BloctoSDK from '@blocto/sdk';
import type { EthereumProviderInterface } from '@blocto/sdk';
import { Chain, Wallet } from '@rainbow-me/rainbowkit';
import { ConnectorNotFoundError } from 'wagmi';
import { SwitchChainError, UserRejectedRequestError } from 'viem';
import { InjectedConnector } from 'wagmi/connectors/injected';
export interface BloctoWalletOptions {
  chains: Chain[];
}

declare global {
  interface Window {
    ethereum: any;
    blocto: any;
  }
}

export class BloctoConnector extends InjectedConnector {
  readonly ready = typeof window !== 'undefined';
  readonly id = 'blocto';
  readonly name = 'Blocto';

  private blocto: BloctoSDK | any;
  private provider: EthereumProviderInterface | undefined;

  #chains: Chain[];

  constructor({ chains }: BloctoWalletOptions) {
    super({
      chains,
      options: {
        getProvider: (): any => {
          const getBlocto = (blocto?: any): any =>
            blocto?.isBlocto ? blocto : undefined;
          if (typeof window === 'undefined') return;
          return getBlocto(window.blocto);
        },
      },
    });
    this.#chains = chains;
  }

  async connect(): Promise<any> {
    const res = super.connect();
    const blocto = await this.getBlocto();
    if (!blocto) throw new ConnectorNotFoundError();
    blocto?.ethereum?.enable();
    return res;
  }

  async disconnect(): Promise<any> {
    super.disconnect();
    const blocto = await this.getBlocto();
    if (!blocto) throw new ConnectorNotFoundError();
    await blocto?.ethereum?.request({ method: 'wallet_disconnect' });
  }
  async getBlocto(): Promise<any> {
    if (!this.blocto) {
      const [defaultChain] = this.#chains ?? [];
      this.blocto = new BloctoSDK({
        ethereum: {
          chainId: defaultChain.id,
          rpc: defaultChain.rpcUrls?.default?.http[0],
        },
      });
    }
    return this.blocto;
  }
  async getProvider(): Promise<any> {
    const blocto = this.blocto ?? (await this.getBlocto());
    if (!this.provider) {
      this.provider = blocto.ethereum;
    }
    return this.provider;
  }

  async getAccount(): Promise<any> {
    const blocto = await this.getBlocto();
    if (!blocto) throw new ConnectorNotFoundError();
    const accounts = await blocto?.ethereum?.request({
      method: 'eth_requestAccounts',
    });
    if (!accounts?.length) throw new ConnectorNotFoundError();
    return accounts[0];
  }
  async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return provider
      .request({ method: 'eth_chainId' })
      .then((chainId: string): number => parseInt(chainId));
  }
  /**
   * @see https://docs.blocto.app/blocto-sdk/javascript-sdk/evm-sdk/switch-ethereum-chain
   */
  async switchChain(chainId: number): Promise<Chain> {
    const defaultChainData = {
      id: chainId,
      name: `Chain ${chainId}`,
      network: `${chainId}`,
      nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
      rpcUrls: { default: { http: [''] }, public: { http: [''] } },
    };
    const chain =
      this.#chains.find((x) => x.id === chainId) ?? defaultChainData;
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    try {
      const providerRpcurl = provider.switchableNetwork[chainId]?.rpc_url;
      const chainUrl = chain.rpcUrls?.default?.http[0];
      if (providerRpcurl !== chainUrl) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              rpcUrls: [chainUrl],
            },
          ],
        });
      }
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return chain;
    } catch (error: any) {
      const chain = this.chains.find((x) => x.id === chainId);
      if (!chain) {
        throw new ConnectorNotFoundError('chain not found');
      }
      if (this.isUserRejectedRequestError(error)) {
        throw new UserRejectedRequestError(error);
      }
      throw new SwitchChainError(error);
    }
  }
}

export const bloctoWallet = ({ chains }: BloctoWalletOptions): Wallet => ({
  id: 'blocto',
  name: 'Blocto',
  iconBackground: '#ffffff',
  iconUrl:
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjhweCIgaGVpZ2h0PSIyOHB4IiB2aWV3Qm94PSIwIDAgMjggMjgiIHZlcnNpb249IjEuMSI+CjxnIGlkPSJzdXJmYWNlMSI+CjxyZWN0IHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgZmlsbD0id2hpdGUiLz4KPHBhdGggc3R5bGU9IiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOnJnYig3Ljg0MzEzNyUsNjYuNjY2NjY3JSwxMDAlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gMTUuMzU1NDY5IDguNTQyOTY5IEMgMTMuMjUgOC41NDI5NjkgMTEuMTk1MzEyIDkuMzU1NDY5IDkuNjU2MjUgMTAuNzkyOTY5IEMgNy45NzI2NTYgMTIuMzc1IDYuOTA2MjUgMTQuNzA3MDMxIDYuMjk2ODc1IDE2LjkwMjM0NCBDIDUuODk0NTMxIDE4LjMzOTg0NCA1LjY5NTMxMiAxOS44MjgxMjUgNS42OTUzMTIgMjEuMzIwMzEyIEMgNS42OTUzMTIgMjEuNzY5NTMxIDUuNzEwOTM4IDIyLjIxODc1IDUuNzUgMjIuNjYwMTU2IEMgNS43OTI5NjkgMjMuMTk1MzEyIDYuMzE2NDA2IDIzLjU3MDMxMiA2LjgzNTkzOCAyMy40Mjk2ODggQyA3LjI4OTA2MiAyMy4zMDQ2ODggNy43Njk1MzEgMjMuMjM4MjgxIDguMjYxNzE5IDIzLjIzODI4MSBDIDkuMjczNDM4IDIzLjIzODI4MSAxMC4yMjI2NTYgMjMuNTE1NjI1IDExLjAzNTE1NiAyMy45OTYwOTQgQyAxMS4wNTQ2ODggMjQuMDA3ODEyIDExLjA3NDIxOSAyNC4wMTk1MzEgMTEuMDkzNzUgMjQuMDMxMjUgQyAxMi40MTc5NjkgMjQuODIwMzEyIDEzLjk3NjU2MiAyNS4yNTM5MDYgMTUuNjQwNjI1IDI1LjE5NTMxMiBDIDE5Ljk3NjU2MiAyNS4wNTQ2ODggMjMuNTE5NTMxIDIxLjUyMzQzOCAyMy42Nzk2ODggMTcuMTg3NSBDIDIzLjg1NTQ2OSAxMi40NDE0MDYgMjAuMDYyNSA4LjU0Mjk2OSAxNS4zNTU0NjkgOC41NDI5NjkgWiBNIDE1LjM1NTQ2OSAyMC42Nzk2ODggQyAxMy4yNTM5MDYgMjAuNjc5Njg4IDExLjU0Njg3NSAxOC45NzY1NjIgMTEuNTQ2ODc1IDE2Ljg3MTA5NCBDIDExLjU0Njg3NSAxNC43Njk1MzEgMTMuMjUzOTA2IDEzLjA2NjQwNiAxNS4zNTU0NjkgMTMuMDY2NDA2IEMgMTcuNDU3MDMxIDEzLjA2NjQwNiAxOS4xNjAxNTYgMTQuNzY5NTMxIDE5LjE2MDE1NiAxNi44NzEwOTQgQyAxOS4xNjAxNTYgMTguOTc2NTYyIDE3LjQ1NzAzMSAyMC42Nzk2ODggMTUuMzU1NDY5IDIwLjY3OTY4OCBaIE0gMTUuMzU1NDY5IDIwLjY3OTY4OCAiLz4KPHBhdGggc3R5bGU9IiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOnJnYigwJSw0NS44ODIzNTMlLDEwMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSAxMS45Mjk2ODggNS45MTc5NjkgQyAxMS45Mjk2ODggNy4wMTU2MjUgMTEuMzU1NDY5IDguMDM1MTU2IDEwLjQxMDE1NiA4LjU5Mzc1IEMgOS44MTY0MDYgOC45NDUzMTIgOS4yNjE3MTkgOS4zNTkzNzUgOC43NTc4MTIgOS44MzIwMzEgQyA3LjY0MDYyNSAxMC44Nzg5MDYgNi44MDg1OTQgMTIuMTY0MDYyIDYuMTkxNDA2IDEzLjQzNzUgQyA2LjA3MDMxMiAxMy42ODc1IDUuNjkxNDA2IDEzLjU5NzY1NiA1LjY5MTQwNiAxMy4zMjAzMTIgTCA1LjY5MTQwNiA1LjkxNzk2OSBDIDUuNjkxNDA2IDQuMTk1MzEyIDcuMDg5ODQ0IDIuODAwNzgxIDguODEyNSAyLjgwMDc4MSBDIDEwLjUzNTE1NiAyLjgwMDc4MSAxMS45Mjk2ODggNC4xOTUzMTIgMTEuOTI5Njg4IDUuOTE3OTY5IFogTSAxMS45Mjk2ODggNS45MTc5NjkgIi8+CjwvZz4KPC9zdmc+Cg==',
  downloadUrls: {
    ios: 'https://apps.apple.com/app/blocto/id1481181682',
    android: 'https://play.google.com/store/apps/details?id=com.portto.blocto',
  },
  installed: true,
  createConnector: (): any => {
    const connector = new BloctoConnector({ chains });
    return {
      connector,
    };
  },
});
