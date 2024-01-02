import {
  MemoryStorage,
  isStorageSupported,
} from '../../lib/storage/memoryStorage';

describe('MemoryStorage', () => {
  it('should set key-value', () => {
    const mockKey = 'mockKey';
    const mockData = 'mockData';

    const storage = new MemoryStorage();
    storage.setItem(mockKey, mockData);
  });

  it('should set and get key-value', () => {
    const mockKey = 'mockKey';
    const mockData = 'mockData';

    const storage = new MemoryStorage();
    storage.setItem(mockKey, mockData);
    const retrieved = storage.getItem(mockKey);

    expect(retrieved).toBe(mockData);
  });

  it('should set and delete key-value', () => {
    const mockKey = 'mockKey';
    const mockData = 'mockData';

    const storage = new MemoryStorage();
    storage.setItem(mockKey, mockData);
    storage.removeItem(mockKey);
    const retrieved = storage.getItem(mockKey);

    expect(retrieved).toBe(null);
  });

  it('should check if browser supports storage', () => {
    expect(isStorageSupported()).toBe(true);
  });
});
