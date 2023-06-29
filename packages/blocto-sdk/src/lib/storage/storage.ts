import MemoryStorage from './memoryStorage';
import * as keys from './constants';
import { ProviderSession } from '../../providers/types/blocto';
import { LOGIN_PERSISTING_TIME, SDK_VERSION } from '../../constants';

export interface AccountStorage {
  expiry: number;
  v: string;
  data: ProviderSession;
}

const isSupported = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    window.sessionStorage.setItem('local_storage_supported', '1');
    const result = window.sessionStorage.getItem('local_storage_supported');
    window.sessionStorage.removeItem('local_storage_supported');
    return result === '1';
  } catch (error) {
    return false;
  }
};

const storage = isSupported() ? window.sessionStorage : MemoryStorage;

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

export const getItemWithExpiry = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  const rawExpiry: any = getItem(key, null);

  if (!rawExpiry) {
    return defaultValue;
  }

  // compare the expiry time of the item with the current time
  if (new Date().getTime() > rawExpiry.expiry) {
    // eslint-disable-next-line
    removeItem(key);
    return defaultValue;
  }

  return rawExpiry.value;
};

export const getRawItem = (key: string): string | null => storage.getItem(key);

export const setItem = (key: string, value: unknown): void =>
  storage.setItem(
    key,
    typeof value === 'string' ? value : JSON.stringify(value)
  );

export const setItemWithExpiry = (
  key: string,
  value: unknown,
  ttl: number
): void =>
  setItem(key, {
    value,
    expiry: new Date().getTime() + ttl,
  });

export const removeItem = (key: string): void => {
  setItem(key, ''); // Due to some versions of browser bug can't removeItem correctly.
  storage.removeItem(key);
};

/**
 * @param {keys.KEY_SESSION} key - key to retrieve the data
 * @returns {ProviderSession | null} ProviderSession | null
 * @description
 * Get ProviderSession from storage.
 * If the data is expired, will remove the data and return null
 */
export const getAccountStorage = (
  key: keys.KEY_SESSION
): ProviderSession | null => {
  const rawAccountStorage = getItem<AccountStorage>(key, null);
  if (!rawAccountStorage) return null;

  // compare the expiry time of the item with the current time
  if (new Date().getTime() > rawAccountStorage.expiry) {
    removeItem(key);
    return null;
  }

  return rawAccountStorage?.data;
};

/** 
  @param {keys.KEY_SESSION} key - key to store the data
  @param {ProviderSession} data - Only the part of ProviderSession that needs to be updated
  {
    connected?: boolean;
    code?: string | null;
    accounts: Record<string, string[] | undefined>;
  }
  @param {number} expiry - expiry time of the data
*/
export const setAccountStorage = (
  key: keys.KEY_SESSION,
  data: ProviderSession,
  expiry?: number
): void => {
  const rawAccountStorage = getItem<AccountStorage>(key);
  const newAccountStorage: AccountStorage = {
    data: {
      code: data?.code || rawAccountStorage?.data?.code,
      connected: data?.connected || rawAccountStorage?.data?.connected,
      accounts: {
        ...rawAccountStorage?.data?.accounts,
        ...data?.accounts,
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
  key: keys.KEY_SESSION,
  chain: string
): string[] | null => {
  if (!getAccountStorage(key)?.code) {
    removeItem(key);
    return null;
  }
  return getAccountStorage(key)?.accounts[chain] || null;
};

export const setChainAddress = (
  key: keys.KEY_SESSION,
  chain: string,
  account: string[]
): void => {
  setAccountStorage(key, { accounts: { [chain]: account } });
  return;
};

export const removeChainAddress = (
  key: keys.KEY_SESSION,
  chain: string
): void => {
  setAccountStorage(key, { accounts: { [chain]: undefined } });
  return;
};

export const isLatestLocalStorageVersion = (): boolean => {
  const LOCAL_STORAGE_VERSION = keys.LOCAL_STORAGE_VERSION;
  const localVersion = getItem(keys.KEY_LOCAL_STORAGE_VERSION);
  return LOCAL_STORAGE_VERSION === localVersion;
};

export const removeOutdatedKeys = (): void => {
  if (isLatestLocalStorageVersion()) return;

  setItem(keys.KEY_LOCAL_STORAGE_VERSION, keys.LOCAL_STORAGE_VERSION);

  const localDexscanKeys = Object.keys(sessionStorage).filter(
    (key) => key.indexOf('flow.') === 0
  );

  // Using 'Object.values()' fails unit testing because some browsers don't support it
  const dexscanKeys = Object.keys(keys).map((it) => (keys as any)[it]);

  localDexscanKeys.forEach((localCobKey) => {
    const hasMatch = dexscanKeys.some((key) => key === localCobKey);
    if (!hasMatch) {
      sessionStorage.removeItem(localCobKey);
    }
  });
};
