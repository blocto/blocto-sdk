declare global {
  interface Window {
    memoryStorage: MemoryStorage;
  }
}

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

if (typeof window !== 'undefined') {
  window.memoryStorage = memoryStorage;
}

export default memoryStorage;
export { MemoryStorage };
