import { CAN_USE_WINDOW } from "../../constants";

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

const memoryStorage = CAN_USE_WINDOW ? window.memoryStorage : new MemoryStorage();

if (CAN_USE_WINDOW) {
  window.memoryStorage = memoryStorage;
}

export default memoryStorage;
export { MemoryStorage };
