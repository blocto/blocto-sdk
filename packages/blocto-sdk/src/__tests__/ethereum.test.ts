import EthereumProvider from '../providers/ethereum';
import { getEvmSupport } from '../lib/getEvmSupport';
import { getEvmSupportList } from './fixtures/getEvmSupport';
jest.mock('../lib/getEvmSupport');

describe('Testing BloctoSDK ethereum provider initialization and network loading', () => {
  beforeEach(() => {
    (getEvmSupport as jest.Mock).mockResolvedValue(getEvmSupportList);
  });

  test('should initialize with unloadedNetwork', () => {
    const ethereumWithSwitchable = new EthereumProvider({
      defaultChainId: '0xaa36a7',
      switchableChains: [
        {
          chainId: '0xaa36a7',
          rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
        },
        {
          chainId: '0x61',
          rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        },
      ],
    });

    expect(ethereumWithSwitchable['_blocto'].unloadedNetwork).toBeDefined();
    expect(
      ethereumWithSwitchable['_blocto']?.unloadedNetwork?.[0].chainId
    ).toBe('0xaa36a7');
    expect(
      ethereumWithSwitchable['_blocto']?.unloadedNetwork?.[1].chainId
    ).toBe('0x61');
    expect(ethereumWithSwitchable['_blocto'].unloadedNetwork?.length).toBe(2);
  });

  test('get support chain list', async () => {
    const ethereum = new EthereumProvider({
      chainId: '0xaa36a7',
      rpc: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
    });
    const supportedChains = await ethereum.supportChainList();
    expect(supportedChains).toContainEqual({
      chainId: '11155111',
      chainName: 'Sepolia',
    });
  });

  test('should add chain and switch to it', async () => {
    const ethereum = new EthereumProvider({
      chainId: '0xaa36a7',
      rpc: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
    });
    await expect(
      ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }],
      })
    ).rejects.toThrow(
      'Unrecognized chain ID "97". Try adding the chain using wallet_addEthereumChain first.'
    );

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x61',
          rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        },
      ],
    });
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x61' }],
    });
    expect(ethereum.chainId).toBe('0x61');
  });

  test('create sdk instance with switchableChains and switch to it', async () => {
    const ethereum = new EthereumProvider({
      defaultChainId: '0xaa36a7',
      switchableChains: [
        {
          chainId: '0xaa36a7',
          rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
        },
        {
          chainId: '0x61',
          rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        },
      ],
    });
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x61' }],
    });
    expect(ethereum.chainId).toBe('0x61');
  });
  test('create sdk instance with switchableChains and call eth_accounts', async () => {
    const ethereum = new EthereumProvider({
      defaultChainId: '0xaa36a7',
      switchableChains: [
        {
          chainId: '0xaa36a7',
          rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
        },
        {
          chainId: '0x61',
          rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
        },
      ],
    });
    // Trigger the loading of switchable networks
    await ethereum.request({
      method: 'eth_accounts',
    });
    expect(ethereum.chainId).toBe('0xaa36a7');
    // should remove unloadedNetwork after loading
    expect(ethereum['_blocto'].unloadedNetwork).toBeUndefined();
  });

    test('should not call loadSwitchableNetwork if unloadedNetwork is empty', async () => {
        const ethereum = new EthereumProvider({
            chainId: '0xaa36a7',
            rpc: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
      });
      const loadSwitchableNetworkSpy = jest.spyOn(ethereum, 'loadSwitchableNetwork');

    await ethereum.request({ method: 'eth_accounts' });

    expect(loadSwitchableNetworkSpy).not.toHaveBeenCalled();
  });
});
