import { bloctoWallet } from '../index';

describe('rainbowkit-connector', () => {
  const chains = [
    {
      name: 'Ethereum',
      id: 1,
      network: 'mainnet',
      nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
      rpcUrls: {
        default: { http: ['https://mainnet.infura.io/v3/'] },
        public: { http: ['https://mainnet.infura.io/v3/'] },
      },
    },
  ];
  const wallet = bloctoWallet({ chains });

  test('defines name', () => {
    expect(typeof wallet.name).toBe('string');
  });

  test('defines id', () => {
    expect(typeof wallet.id).toBe('string');
  });

  test('defines icon', () => {
    expect(typeof wallet.iconUrl).toBe('string');
  });

  test('defines connect()', () => {
    expect(typeof wallet.createConnector).toBe('function');
  });

  const { connector } = wallet.createConnector();

  test('defines account()', () => {
    expect(typeof connector.connect).toBe('function');
  });

  test('defines disconnect()', () => {
    expect(typeof connector.disconnect).toBe('function');
  });

  test('defines getAccount()', () => {
    expect(typeof connector.getAccount).toBe('function');
  });

  test('defines getChainId()', () => {
    expect(typeof connector.getChainId).toBe('function');
  });

  test('defines getProvider()', () => {
    expect(typeof connector.getProvider).toBe('function');
  });

  test('defines switchChain()', () => {
    expect(typeof connector.switchChain).toBe('function');
  });
});
