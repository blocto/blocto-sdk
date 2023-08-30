declare global {
  interface Window {
    memoryStorage: MemoryStorage;
  }
}

export const isStorageSupported = () => {
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

class MemoryStorage {
  storage = {};

  getItem(key: string): string | null {
    return (this as any)[key] || null;
  }

  setItem(key: string, value: unknown): void {
    (this.storage as any)[key] = value;
  }

  removeItem(key: string): void {
    delete (this.storage as any)[key];
  }
}

const memoryStorage =
  typeof window !== 'undefined' ? window.memoryStorage : new MemoryStorage();

export default memoryStorage;
export { MemoryStorage };
