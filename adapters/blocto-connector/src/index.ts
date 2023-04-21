import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'
import BloctoSDK from '@blocto/sdk'

interface BloctoConnectorArguments {
  chainId: number
  rpc: string
}

const chainIdToNetwork: { [network: number]: string } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  56: 'bsc', // BSC Mainnet
  97: 'chapel', // BSC Testnet
  137: 'polygon', // Polygon Mainnet
  80001: 'mumbai', // Polygon Testnet
  43114: 'avalanche', // Avalanche Mainnet
  43113: 'fuji', // Avalanche Testnet
}

export class BloctoConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly rpc: string
  public blocto: any

  constructor({ chainId, rpc }: BloctoConnectorArguments) {
    invariant(Object.keys(chainIdToNetwork).includes(chainId.toString()), `Unsupported chainId ${chainId}`)
    super({ supportedChainIds: [chainId] })
    this.chainId = chainId
    this.rpc = rpc
  }

  public async activate(): Promise<ConnectorUpdate> {
    const bloctoSDK = new BloctoSDK({
      ethereum: {
        chainId: this.chainId,
        rpc: this.rpc
      }
    })

    this.blocto = bloctoSDK.ethereum

    const [account] = await this.blocto.enable();

    return { provider: this.blocto, chainId: this.chainId, account: account }
  }

  public async getProvider(): Promise<any> {
    return this.blocto
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.blocto.request({ method: 'eth_accounts' }).then((accounts: string[]): string => accounts[0])
  }

  public deactivate() { }
}
