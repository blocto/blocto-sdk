import BloctoSDK from '../main';
import { enableFetchMocks } from 'jest-fetch-mock';

beforeAll(() => {
  enableFetchMocks();
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
});

describe('Testing BloctoSDK', () => {
  test('should be a class', () => {
    expect(BloctoSDK).toBeInstanceOf(Function);
  });
});

describe('Testing BloctoSDK ethereum provider', () => {
  const bloctoSDK = new BloctoSDK({
    ethereum: {
      chainId: 56,
      rpc: 'https://bsc-dataseed.binance.org',
    },
  });
  const ethereum = bloctoSDK.ethereum;
  ethereum.session.connected = true;
  ethereum.setIframe = jest.fn();
  ethereum.responseListener = jest.fn();

  test('should be a object', () => {
    expect(bloctoSDK).toBeInstanceOf(Object);
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
  test('should setup rpc', () => {
    expect(ethereum.rpc).toBe('https://bsc-dataseed.binance.org');
  });
  test('should setup _blocto', async () => {
    await ethereum.loadSwitchableNetwork([
      { chainId: '0x5', rpcUrls: ['https://goerli.infura.io/v3/'] },
    ]);
    expect(ethereum._blocto.networkType).toBe('mainnet');
  });
  test('should request chainId work', async () => {
    return ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
      expect(chainId).toBe('0x38');
    });
  });
  test('should request eth_estimateUserOperationGas works', async () => {
    return ethereum
      .request({ method: 'eth_estimateUserOperationGas' })
      .then((response) => {
        expect(JSON.parse(fetch.mock.lastCall[1].body).method).toBe(
          'eth_estimateUserOperationGas'
        );
        expect(response.test).toBe('pass');
      });
  });
  test('should request personal_sign send right param', async () => {
    const exampleMessage = 'Test `personal_sign` message.';
    return ethereum
      .request({
        method: 'personal_sign',
        params: [exampleMessage, '0x123'],
      })
      .then(() => {
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/user-signature'
        );
        expect(fetch.mock.lastCall[1].body).toBe(
          JSON.stringify({
            method: 'personal_sign',
            message:
              '546573742060706572736f6e616c5f7369676e60206d6573736167652e',
          })
        );
      });
  });
  test('should request eth_signTypedData call right api', async () => {
    const msgParams = JSON.stringify({
      domain: {
        chainId: 56,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
      },
    });
    return ethereum
      .request({
        method: 'eth_signTypedData',
        params: ['0x123', msgParams],
      })
      .then(() => {
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/user-signature'
        );
        expect(fetch.mock.lastCall[1].body).toBe(
          JSON.stringify({ method: 'eth_signTypedData', message: msgParams })
        );
      });
  });
  test('should request eth_sendTransaction call right api', async () => {
    return ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: '0x123',
            to: '0x123',
            value: '0x29a2241af62c0000',
          },
        ],
      })
      .then(() => {
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/authz'
        );
        expect(fetch.mock.lastCall[1].body).toBe(
          '[{"from":"0x123","to":"0x123","value":"0x29a2241af62c0000"}]'
        );
      });
  });
  test('should request blocto_sendBatchTransaction in EIP-1193 way has right payload', async () => {
    return ethereum
      .request({
        method: 'blocto_sendBatchTransaction',
        params: [
          {
            from: '0x123',
            to: '0x123',
            value: '0x01abc',
          },
          {
            from: '0x456',
            to: '0x456',
            value: '0x02def',
          },
        ],
      })
      .then(() => {
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/authz'
        );
        expect(fetch.mock.lastCall[1].body).toBe(
          '[{"from":"0x123","to":"0x123","value":"0x01abc"},{"from":"0x456","to":"0x456","value":"0x02def"}]'
        );
      });
  });
  test('should request blocto_sendBatchTransaction in Web3 Batch Request way has right payload', async () => {
    return ethereum
      .sendAsync([
        {
          method: 'eth_sendTransaction',
          params: [
            {
              from: '0x123',
              to: '0x123',
              value: '0x01abc',
            },
          ],
        },
        {
          method: 'eth_sendTransaction',
          params: [
            {
              from: '0x456',
              to: '0x456',
              value: '0x02def',
            },
          ],
        },
      ])
      .then(() => {
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/authz'
        );
        expect(fetch.mock.lastCall[1].body).toBe(
          '[{"from":"0x123","to":"0x123","value":"0x01abc"},{"from":"0x456","to":"0x456","value":"0x02def"}]'
        );
      });
  });
  test('should request eth_sendUserOperation call right api', async () => {
    return ethereum
      .request({
        method: 'eth_sendUserOperation',
        params: [
          {
            callData: '0x123',
          },
        ],
      })
      .then(() => {
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/user-operation'
        );
        expect(fetch.mock.lastCall[1].body).toBe('[{"callData":"0x123"}]');
      });
  });
});

describe('Testing BloctoSDK providers with appId', () => {
  const bloctoSDK = new BloctoSDK({
    ethereum: {
      chainId: 56,
      rpc: 'https://bsc-dataseed.binance.org',
    },
    appId: '6f6b97c5-d97b-4799-8ad7-d7e8426d3369',
  });
  const ethereum = bloctoSDK.ethereum;
  ethereum.session.connected = true;
  ethereum.setIframe = jest.fn();
  ethereum.responseListener = jest.fn();
  test('should be a object', () => {
    expect(bloctoSDK).toBeInstanceOf(Object);
  });
  test('should eth_sendTransaction has right appId in header', async () => {
    return ethereum
      .request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: '0x123',
            to: '0x123',
            value: '0x29a2241af62c0000',
          },
        ],
      })
      .then(() => {
        expect(
          fetch.mock.lastCall[1].headers['Blocto-Application-Identifier']
        ).toBe('6f6b97c5-d97b-4799-8ad7-d7e8426d3369');
        expect(fetch.mock.lastCall[0]).toBe(
          'https://wallet-v2.blocto.app/api/bsc/authz'
        );
        expect(fetch.mock.lastCall[1].body).toBe(
          '[{"from":"0x123","to":"0x123","value":"0x29a2241af62c0000"}]'
        );
      });
  });
});
