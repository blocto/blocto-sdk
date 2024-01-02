import MemoryStorage, { isStorageSupported } from './memoryStorage';
import {
  LOGIN_PERSISTING_TIME,
  SDK_VERSION,
  KEY_SESSION,
  CHAIN,
} from '../../constants';

export interface ProviderSession {
  code?: string | null;
  accounts: Partial<Record<CHAIN, string[] | undefined>>;
  evm: {
    [chainName: string]: string[] | undefined;
  };
}

export interface AccountStorage {
  expiry: number;
  v: string;
  data: ProviderSession;
}

const storage = isStorageSupported() ? window.sessionStorage : MemoryStorage;

export const getItem = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  const value = storage.getItem(key);
  try {
    return (value && JSON.parse(value)) || defaultValue;
  } catch (SyntaxError) {
    return (value as T) || defaultValue;
  }
};

export const getRawItem = (key: string): string | null => storage.getItem(key);

export const setItem = (key: string, value: unknown): void =>
  storage.setItem(
    key,
    typeof value === 'string' ? value : JSON.stringify(value)
  );

export const removeItem = (key: string): void => {
  setItem(key, ''); // Due to some versions of browser bug can't removeItem correctly.
  storage.removeItem(key);
};

/**
 * @param {KEY_SESSION} key - key to retrieve the data
 * @returns {ProviderSession | null} ProviderSession | null
 * @description
 * Get ProviderSession from storage.
 * If the data is expired, will remove the data and return null
 */
export const getAccountStorage = (key: KEY_SESSION): ProviderSession | null => {
  const rawAccountStorage = getItem<AccountStorage>(key, null);
  if (!rawAccountStorage) return null;

  // compare the expiry time of the item with the current time
  if (
    new Date().getTime() > rawAccountStorage.expiry ||
    rawAccountStorage.v !== SDK_VERSION
  ) {
    removeItem(key);
    return null;
  }

  return rawAccountStorage?.data;
};

/** 
  @param {KEY_SESSION} key - key to store the data
  @param {ProviderSession} data - Only the part of ProviderSession that needs to be updated
  @param {number} expiry - expiry time of the data
*/
export const setAccountStorage = (
  key: KEY_SESSION,
  data: Partial<ProviderSession>,
  expiry?: number
): void => {
  const rawAccountStorage = getItem<AccountStorage>(key);
  const newAccountStorage: AccountStorage = {
    data: {
      code: data?.code || rawAccountStorage?.data?.code,
      accounts: {
        ...rawAccountStorage?.data?.accounts,
        ...data?.accounts,
      },
      evm: {
        ...rawAccountStorage?.data?.evm,
        ...data?.evm,
      },
    },
    expiry:
      expiry ||
      rawAccountStorage?.expiry ||
      new Date().getTime() + LOGIN_PERSISTING_TIME,
    v: SDK_VERSION,
  };
  setItem(key, newAccountStorage);
  return;
};

export const getChainAddress = (
  key: KEY_SESSION,
  chain: CHAIN
): string[] | null => {
  if (!getAccountStorage(key)?.code) {
    removeItem(key);
    return null;
  }
  return getAccountStorage(key)?.accounts?.[chain] || null;
};

export const setChainAddress = (
  key: KEY_SESSION,
  chain: CHAIN,
  account: string[]
): void => {
  setAccountStorage(key, { accounts: { [chain]: account } });
  return;
};

export const removeChainAddress = (key: KEY_SESSION, chain: string): void => {
  setAccountStorage(key, { accounts: { [chain]: undefined } });
  return;
};

export const getEvmAddress = (
  key: KEY_SESSION,
  chain: string
): string[] | null => {
  if (!getAccountStorage(key)?.code) {
    removeItem(key);
    return null;
  }
  return getAccountStorage(key)?.evm?.[chain] || null;
};

export const setEvmAddress = (
  key: KEY_SESSION,
  chain: string,
  accounts: string[]
): void => {
  setAccountStorage(key, { evm: { [chain]: accounts } });
  return;
};

export const removeAllEvmAddress = (key: KEY_SESSION): void => {
  const newAccountStorage = getItem<AccountStorage>(key);
  if (!newAccountStorage) return;
  newAccountStorage.data.evm = {};
  setItem(key, newAccountStorage);
  return;
};
