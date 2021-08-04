class MemoryStorage {
    storage = {};

    getItem(key: String) {
      return this[key] || null;
    }

    setItem(key: String, value: any) {
      this.storage[key] = value;
    }

    removeItem(key: String) {
      delete this.storage[key];
    }
}

window.memoryStorage = window.memoryStorage || new MemoryStorage();

export default window.memoryStorage;
export { MemoryStorage };
