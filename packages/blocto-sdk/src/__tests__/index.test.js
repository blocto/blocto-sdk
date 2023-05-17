import BloctoSDK from '../main';

describe('Testing BloctoSDK', () => {
  test('should be a class', () => {
    expect(BloctoSDK).toBeInstanceOf(Function);
  });
});

function ethereumProviderTest(ethereum) {
  test('should have ethereum provider', () => {
    expect(ethereum).toBeInstanceOf(Object);
  });
  test('should have ethereum provider with chainId', () => {
    expect(ethereum.chainId).toBe(5);
  });
  test('should have ethereum provider with rpc', () => {
    expect(ethereum.rpc).toBe('https://rpc.ankr.com/eth_goerli');
  });
}

describe('Testing BloctoSDK providers without appId', () => {
  test.each([
    {
      chainId: 1,
      rpc: 'https://mainnet.infura.io/v3/',
    },
    { chainId: 5, rpc: 'https://rpc.ankr.com/eth_goerli' },
    { chainId: 56, rpc: 'https://bsc-dataseed.binance.org/' },
    { chainId: 97, rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/' },
    { chainId: 137, rpc: 'https://rpc-mainnet.maticvigil.com/' },
    { chainId: 80001, rpc: 'https://rpc-mumbai.maticvigil.com/' },
    { chainId: 43114, rpc: 'https://api.avax.network/ext/bc/C/rpc' },
    { chainId: 43113, rpc: 'https://api.avax-test.network/ext/bc/C/rpc' },
    { chainId: 42161, rpc: 'https://arb1.arbitrum.io/rpc' },
    {
      chainId: 421613,
      rpc: 'https://endpoints.omniatech.io/v1/arbitrum/goerli/public',
    },
  ])(
    'should have ethereum provider with chainId $chainId',
    ({ chainId, rpc }) => {
      const bloctoSDK = new BloctoSDK({
        ethereum: {
          chainId,
          rpc,
        },
      });
      expect(bloctoSDK.ethereum.chainId).toBe(chainId);
      expect(bloctoSDK.ethereum.rpc).toBe(rpc);
    }
  );

  const bloctoSDK = new BloctoSDK({
    ethereum: {
      chainId: '0x5',
      rpc: 'https://rpc.ankr.com/eth_goerli',
    },
  });
  test('should be a object', () => {
    expect(bloctoSDK).toBeInstanceOf(Object);
  });
  ethereumProviderTest(bloctoSDK.ethereum);
});

describe('Testing BloctoSDK providers with appId', () => {
  const bloctoSDK = new BloctoSDK({
    ethereum: {
      chainId: '0x5',
      rpc: 'https://rpc.ankr.com/eth_goerli',
    },
    appId: '6f6b97c5-d97b-4799-8ad7-d7e8426d3369',
  });
  test('should be a object', () => {
    expect(bloctoSDK).toBeInstanceOf(Object);
  });
  ethereumProviderTest(bloctoSDK.ethereum);
});
