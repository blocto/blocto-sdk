import BloctoSDK from '../../main';
import EthereumProvider from '../../providers/ethereum';
import { enableFetchMocks } from 'jest-fetch-mock';
import { setAccountStorage } from '../../lib/storage';
import { KEY_SESSION } from '../../constants';

beforeAll(() => {
  enableFetchMocks();
  setAccountStorage(KEY_SESSION.dev, {
    code: 'some_code',
    accounts: {},
    evm: {
      bsc: ['0x123'],
    },
  });
});

describe('Testing BloctoSDK', () => {
  test('should be a class', () => {
    expect(BloctoSDK).toBeInstanceOf(Function);
  });
});

describe('Testing BloctoSDK ethereum provider', () => {
  it('should instantiate with AptosProvider when aptos config is provided', () => {
    const bloctoSDK = new BloctoSDK({
      ethereum: {
        chainId: 56,
        rpc: 'https://bsc-dataseed.binance.org',
      },
    });
    expect(bloctoSDK.ethereum).toBeInstanceOf(EthereumProvider);
  });

  it('should not instantiate providers when their respective configs are not provided', () => {
    const appId = 'your_app_id';
    const bloctoSDK = new BloctoSDK({ appId });
    expect(bloctoSDK.ethereum).toBeUndefined();
    expect(bloctoSDK.aptos).toBeUndefined();
  });
});

describe('Testing BloctoSDK ethereum provider functions', () => {
  const bloctoSDK = new BloctoSDK({
    ethereum: {
      chainId: 56,
      rpc: 'https://bsc-dataseed.binance.org',
    },
  });

  it('should not instantiate providers when their respective configs are not provided', () => {
    const appId = 'your_app_id';
    const bloctoSDK = new BloctoSDK({ appId });
    expect(bloctoSDK.ethereum).toBeUndefined();
    expect(bloctoSDK.aptos).toBeUndefined();
  });
});
