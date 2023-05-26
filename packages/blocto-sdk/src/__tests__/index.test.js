import BloctoSDK from '../main';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

describe('Testing BloctoSDK', () => {
  test('should be a class', () => {
    expect(BloctoSDK).toBeInstanceOf(Function);
  });
});

function ethereumProviderTest(ethereum) {
  fetch.mockResponse((req) => {
    if (req.url === 'https://api.blocto.app/networks/evm') {
      return new Promise((resolve) => {
        resolve({
          status: 200,
          body: JSON.stringify({
            networks: [
              {
                chain_id: 5,
                name: 'ethereum',
                display_name: 'Ethereum',
                network_type: 'testnet',
                blocto_service_environment: 'dev',
                rpc_endpoint_domains: [],
              },
              {
                chain_id: 56,
                name: 'bsc',
                display_name: 'Smart Chain',
                network_type: 'mainnet',
                blocto_service_environment: 'prod',
                rpc_endpoint_domains: [],
              },
            ],
          }),
        });
      });
    }
    return new Promise((resolve) => {
      resolve({
        status: 200,
        body: JSON.stringify({
          test: 'pass',
        }),
      });
    });
  });
  test('should have ethereum provider', () => {
    expect(ethereum).toBeInstanceOf(Object);
  });
  test('should have isBlocto', () => {
    expect(ethereum.isBlocto).toBe(true);
  });
  test('converted chainId should be hexdecimal', () => {
    expect(ethereum.chainId).toBe('0x38');
  });
  test('should have ethereum provider with rpc', () => {
    expect(ethereum.rpc).toBe('https://bsc-dataseed.binance.org');
  });
  ethereum.loadSwitchableNetwork([
    { chainId: '0x5', rpcUrls: ['https://goerli.infura.io/v3/'] },
  ]);
  test('should setup _blocto', () => {
    expect(ethereum._blocto.networkType).toBe('mainnet');
  });
  ethereum.session.connected = true;
  test('should ethereum.request chainId work', () => {
    ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
      expect(chainId).toBe('0x38');
    });
  });
  test('should ethereum.request eth_estimateUserOperationGas works', () => {
    ethereum
      .request({ method: 'eth_estimateUserOperationGas' })
      .then((response) => {
        expect(JSON.parse(fetch.mock.lastCall[1].body).method).toBe(
          'eth_estimateUserOperationGas'
        );
        expect(response.test).toBe('pass');
      });
  });
}

describe('Testing BloctoSDK providers without appId', () => {
  const bloctoSDK = new BloctoSDK({
    ethereum: {
      chainId: 56,
      rpc: 'https://bsc-dataseed.binance.org',
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
      chainId: 56,
      rpc: 'https://bsc-dataseed.binance.org',
    },
    appId: '6f6b97c5-d97b-4799-8ad7-d7e8426d3369',
  });
  test('should be a object', () => {
    expect(bloctoSDK).toBeInstanceOf(Object);
  });
  ethereumProviderTest(bloctoSDK.ethereum);
});
