import {
  getItem,
  removeItem,
  setItem,
  getAccountStorage,
  setAccountStorage,
  getChainAddress,
  setChainAddress,
  removeChainAddress,
  getEvmAddress,
  setEvmAddress,
  removeAllEvmAddress,
} from '../../lib/storage';
import { SDK_VERSION, KEY_SESSION, CHAIN } from '../../constants';

describe('LocalStorage', () => {
  it('should set key-value', () => {
    const mockKey = 'mockKey';
    const mockData = 'mockData';

    setItem(mockKey, mockData);
  });

  it('should set and get key-value', () => {
    const mockKey = 'mockKey';
    const mockData = 'mockData';

    setItem(mockKey, mockData);
    const retrieved = getItem(mockKey);

    expect(retrieved).toBe(mockData);
  });

  it('should set and delete key-value', () => {
    const mockKey = 'mockKey';
    const mockData = 'mockData';

    setItem(mockKey, mockData);
    removeItem(mockKey);
    const retrieved = getItem(mockKey);

    expect(retrieved).toBe(null);
  });

  it('should return null when JSON.parse has error', () => {
    const mockKey = 'mockKey';

    const retrieved = getItem(mockKey);

    expect(retrieved).toBe(null);
  });
});

describe('accountStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('getAccountStorage should return null for non-existent key', () => {
    const nonExistentKey = 'nonExistentKey';
    const result = getAccountStorage(nonExistentKey as KEY_SESSION);
    expect(result).toBe(null);
  });

  it('getAccountStorage should return null if data is expired', () => {
    const mockKey = KEY_SESSION.dev;
    const expiredData = {
      data: 'expiredData',
      expiry: new Date().getTime() - 1000,
      v: SDK_VERSION,
    };
    setItem(mockKey, expiredData);

    const result = getAccountStorage(mockKey);

    expect(result).toBe(null);
    expect(localStorage.getItem(mockKey)).toBe(null);
  });

  it('getAccountStorage should return null if SDK version does not match', () => {
    const mockKey = KEY_SESSION.dev;
    const dataWithDifferentSDKVersion = {
      data: 'dataWithDifferentSDKVersion',
      expiry: new Date().getTime() + 1000,
      v: 'differentSDKVersion',
    };
    setItem(mockKey, dataWithDifferentSDKVersion);

    const result = getAccountStorage(mockKey);

    expect(result).toBe(null);
    expect(localStorage.getItem(mockKey)).toBe(null);
  });

  it('getAccountStorage should return valid data if not expired and SDK version matches', () => {
    const mockKey = KEY_SESSION.dev;
    const validData = {
      data: 'validData',
      expiry: new Date().getTime() + 1000,
      v: SDK_VERSION,
    };
    setItem(mockKey, validData);

    const result = getAccountStorage(mockKey);

    expect(result).toEqual(validData.data);
  });

  it('getAccountStorage should remove item if data is expired', () => {
    const mockKey = KEY_SESSION.dev;
    const expiredData = {
      data: 'expiredData',
      expiry: new Date().getTime() - 1000,
      v: SDK_VERSION,
    };
    setItem(mockKey, expiredData);

    getAccountStorage(mockKey);

    expect(localStorage.getItem(mockKey)).toBe(null);
  });

  it('getAccountStorage should remove item if SDK version does not match', () => {
    const mockKey = KEY_SESSION.dev;
    const dataWithDifferentSDKVersion = {
      data: 'dataWithDifferentSDKVersion',
      expiry: new Date().getTime() + 1000,
      v: 'differentSDKVersion',
    };
    setItem(mockKey, dataWithDifferentSDKVersion);

    getAccountStorage(mockKey);

    expect(localStorage.getItem(mockKey)).toBe(null);
  });

  it('setAccountStorage should set account storage with valid data', () => {
    const key = KEY_SESSION.dev;
    const initialData = {
      code: 'test_code',
      accounts: {},
      evm: {
        ethereum: ['eth_address_1', 'eth_address_2'],
      },
    };
    const expiry = Date.now() + 3600000;
    setAccountStorage(key, initialData, expiry);
    const storedData = getAccountStorage(key);
    expect(storedData).toEqual(initialData);
  });

  it('setAccountStorage should update specific fields of account storage', () => {
    const key = KEY_SESSION.dev;
    const initialData = {
      code: 'test_code',
      accounts: {},
      evm: {
        ethereum: ['eth_address_1', 'eth_address_2'],
      },
    };
    const expiry = Date.now() + 3600000;

    setAccountStorage(key, initialData, expiry);

    const updatedData = {
      evm: {
        ethereum: ['updated_eth_address_1'],
      },
    };
    setAccountStorage(key, updatedData);
    const storedData = getAccountStorage(key);
    const expectedData = {
      code: 'test_code',
      accounts: {},
      evm: {
        ethereum: ['updated_eth_address_1'],
      },
    };
    expect(storedData).toEqual(expectedData);
  });

  it('setChainAddress should set chain address for a specific key and chain', () => {
    const key = KEY_SESSION.dev;
    const chain = CHAIN.APTOS;
    const addresses = ['aptos_address'];
    setChainAddress(key, chain, addresses);
    const storedData = getAccountStorage(key);
    expect(storedData?.accounts?.[chain]).toEqual(addresses);
  });

  it('setChainAddress should update chain address for an existing key and chain', () => {
    const key = KEY_SESSION.dev;
    const chain = CHAIN.APTOS;
    const initialAddresses = ['aptos_address'];
    setChainAddress(key, chain, initialAddresses);
    const storedDataBeforeUpdate = getAccountStorage(key);
    const updatedAddresses = ['updated_aptos_address'];
    setChainAddress(key, chain, updatedAddresses);
    const storedDataAfterUpdate = getAccountStorage(key);
    expect(storedDataAfterUpdate?.accounts?.[chain]).toEqual(updatedAddresses);
    expect(storedDataBeforeUpdate?.accounts?.[chain]).not.toEqual(
      updatedAddresses
    );
  });

  it('getChainAddress should return null if account storage does not exist', () => {
    const nonExistentKey = 'nonExistentKey';
    const chain = CHAIN.ETHEREUM;
    const result = getChainAddress(nonExistentKey as KEY_SESSION, chain);
    expect(result).toBe(null);
  });

  it('getChainAddress should return null if account storage code is missing', () => {
    const mockKey = KEY_SESSION.dev;
    const mockData = {
      accounts: {},
      evm: {
        [CHAIN.ETHEREUM]: ['address1', 'address2'],
      },
    };
    setItem(mockKey, mockData);
    const chain = CHAIN.ETHEREUM;
    const result = getChainAddress(mockKey, chain);
    expect(result).toBe(null);
    expect(localStorage.getItem(mockKey)).toBe(null);
  });

  it('getChainAddress should return null if chain address does not exist', () => {
    const mockKey = KEY_SESSION.dev;
    const chain = CHAIN.ETHEREUM;
    const mockData = {
      code: 'someCode',
      accounts: {},
      evm: {
        [chain]: ['address1', 'address2'],
      },
    };
    setItem(mockKey, mockData);

    const result = getChainAddress(mockKey, chain);

    expect(result).toBe(null);
  });

  it('should return chain addresses if valid data exists', () => {
    const mockKey = KEY_SESSION.dev;
    const chain = CHAIN.APTOS;

    const mockData = {
      code: 'someCode',
      accounts: {
        [chain]: ['address1'],
      },
      evm: {},
    };
    setAccountStorage(mockKey, mockData);
    const result = getChainAddress(mockKey, chain);

    expect(result).toEqual(mockData.accounts[chain]);
  });

  it('getChainAddress should remove item if account storage code is missing', () => {
    const mockKey = KEY_SESSION.dev;
    const chain = CHAIN.APTOS;
    const mockData = {
      accounts: {
        [chain]: ['0x0', '0x1'],
      },
    };
    setAccountStorage(mockKey, mockData);

    getChainAddress(mockKey, chain);

    expect(localStorage.getItem(mockKey)).toBe(null);
  });

  it('removeChainAddress should remove chain address for a specific key and chain', () => {
    const key = KEY_SESSION.dev;
    const chain = CHAIN.APTOS;
    const addresses = ['aptos_address_1', 'aptos_address_2'];
    setChainAddress(key, chain, addresses);
    removeChainAddress(key, chain);
    const storedData = getAccountStorage(key);
    // Assert that the stored data does not contain the removed chain addresses
    expect(storedData?.accounts?.[chain]).toBeUndefined();
  });

  it('removeChainAddress should not throw an error when removing non-existing chain address', () => {
    const key = KEY_SESSION.dev;
    const chain = CHAIN.APTOS;
    removeChainAddress(key, chain);
    const storedData = getAccountStorage(key);
    const defaultValue = {
      code: 'someCode',
      accounts: {},
      evm: {},
    };
    expect(storedData).toEqual(defaultValue);
  });

  it('setEvmAddress should set EVM addresses for a specific key and chain', () => {
    const key = KEY_SESSION.dev;
    const chain = CHAIN.ETHEREUM;
    const addresses = ['eth_address_1', 'eth_address_2'];

    setEvmAddress(key, chain, addresses);
    const storedAddresses = getEvmAddress(key, chain);
    expect(storedAddresses).toEqual(addresses);
  });

  it('setEvmAddress should update EVM addresses for an existing key and chain', () => {
    const key = KEY_SESSION.dev;
    const chain = 'bsc';
    const initialAddresses = ['bsc_address_1', 'bsc_address_2'];

    setEvmAddress(key, chain, initialAddresses);
    const storedAddressesBeforeUpdate = getEvmAddress(key, chain);
    const updatedAddresses = ['updated_bsc_address_1'];
    setEvmAddress(key, chain, updatedAddresses);
    const storedAddressesAfterUpdate = getEvmAddress(key, chain);
    expect(storedAddressesAfterUpdate).toEqual(updatedAddresses);
    expect(storedAddressesBeforeUpdate).not.toEqual(updatedAddresses);
  });

  it('getEvmAddress should get EVM addresses for a specific key and chain', () => {
    const key = KEY_SESSION.dev;
    const chain = 'ethereum';
    const addresses = ['eth_address_1', 'eth_address_2'];
    setEvmAddress(key, chain, addresses);
    const storedAddresses = getEvmAddress(key, chain);

    expect(storedAddresses).toEqual(addresses);
  });

  it('getEvmAddress should return null for non-existing key or chain', () => {
    const key = KEY_SESSION.dev;
    const chain = 'bsc';
    removeAllEvmAddress(key);
    const storedAddresses = getEvmAddress(key, chain);
    expect(storedAddresses).toBeNull();
  });

  it('getEvmAddress should return null when code is not present', () => {
    const key = KEY_SESSION.dev;
    const chain = 'ethereum';
    const addresses = ['eth_address_1', 'eth_address_2'];
    setEvmAddress(key, chain, addresses);
    removeItem(key);
    const storedAddresses = getEvmAddress(key, chain);
    expect(storedAddresses).toBeNull();
  });

  it('getEvmAddress should return EVM addresses when code is present', () => {
    const key = KEY_SESSION.dev;
    const chain = 'ethereum';
    const addresses = ['eth_address_1', 'eth_address_2'];
    setAccountStorage(key, { code: 'someCode' });
    setEvmAddress(key, chain, addresses);
    const storedAddresses = getEvmAddress(key, chain);

    expect(storedAddresses).toEqual(addresses);
  });
});
