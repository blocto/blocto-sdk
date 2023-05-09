declare global {
  interface Window {
    memoryStorage: MemoryStorage;
  }
}

class MemoryStorage {
  storage = {};

  getItem(key: string) {
    return (this as any)[key] || null;
  }

  setItem(key: string, value: any) {
    (this.storage as any)[key] = value;
  }

  removeItem(key: string) {
    delete (this.storage as any)[key];
  }
}

const memoryStorage =
  typeof window !== 'undefined' ? window.memoryStorage : new MemoryStorage();

if (typeof window !== 'undefined') {
  window.memoryStorage = memoryStorage;
}

export default memoryStorage;
export { MemoryStorage };
