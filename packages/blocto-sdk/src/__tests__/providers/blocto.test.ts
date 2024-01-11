import BloctoProvider from '../../providers/blocto';
import { EIP1193_EVENTS } from '../../constants';

describe('BloctoProvider', () => {
  let provider: BloctoProvider;

  beforeEach(() => {
    provider = new BloctoProvider();
  });

  it('should initialize properties correctly', () => {
    expect(provider.isBlocto).toBe(true);
    expect(provider.isConnecting).toBe(false);
    expect(provider.appId).toBe('00000000-0000-0000-0000-000000000000');

    expect(Object.keys(provider.eventListeners).sort()).toEqual(
      EIP1193_EVENTS.sort()
    );
    EIP1193_EVENTS.forEach((event) => {
      expect(provider.eventListeners[event]).toEqual([]);
    });
  });

  it('should add event listener correctly', () => {
    const event = EIP1193_EVENTS[0];
    const listener = jest.fn();

    provider.on(event, listener);
    expect(provider.eventListeners[event]).toContain(listener);
  });

  it('should remove event listener correctly', () => {
    const event = EIP1193_EVENTS[0];
    const listener = jest.fn();
    provider.eventListeners[event].push(listener);

    provider.removeListener(event, listener);
    expect(provider.eventListeners[event]).not.toContain(listener);
  });
});
