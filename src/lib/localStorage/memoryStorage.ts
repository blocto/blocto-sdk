class MemoryStorage {
    storage = {};

    getItem(key: string) {
      return this[key] || null;
    }

    setItem(key: string, value: any) {
      this.storage[key] = value;
    }

    removeItem(key: string) {
      delete this.storage[key];
    }
}

const memoryStorage = typeof window === 'undefined' ? new MemoryStorage() : window.memoryStorage;

if (typeof window !== 'undefined') {
  window.memoryStorage = memoryStorage;
}

export default memoryStorage;
export { MemoryStorage };
