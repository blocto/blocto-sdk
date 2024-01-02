import addEventListener from '../../lib/addSelfRemovableHandler';

describe('addEventListener', () => {
  let mockTarget: { addEventListener: any; removeEventListener: any };
  let mockEventType: string;
  let mockHandler: any;

  beforeEach(() => {
    mockTarget = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    mockEventType = 'click';
    mockHandler = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add event listener to target', () => {
    const mockTarget = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const eventType = 'click';
    const handler = jest.fn();
    addEventListener(eventType, handler, mockTarget);
    expect(mockTarget.addEventListener).toHaveBeenCalledWith(
      eventType,
      expect.any(Function)
    );
  });
  it('should remove event listener when removeEventListener is called', () => {
    addEventListener(mockEventType, mockHandler, mockTarget);
    const mockEvent = new Event(mockEventType);
    mockTarget.addEventListener.mock.calls[0][1](mockEvent);

    const removeEventListenerFn = mockHandler.mock.calls[0][1];
    removeEventListenerFn();
    expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
      mockEventType,
      expect.any(Function)
    );
  });
});
