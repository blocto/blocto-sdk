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

window.memoryStorage = window.memoryStorage || new MemoryStorage();

export default window.memoryStorage;
export { MemoryStorage };
