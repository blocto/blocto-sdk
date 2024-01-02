import responseSessionGuard, {
  ICustomError,
} from '../../lib/responseSessionGuard';
import { removeItem } from '../../lib//storage';
import { KEY_SESSION } from '../../constants';

// Mock the SessionStorage module
jest.mock('../../lib//storage', () => ({
  removeItem: jest.fn(),
}));

describe('responseSessionGuard function', () => {
  it('should call disconnectHandler and removeItem if response status is 403', async () => {
    const responseMock = {
      status: 403,
      ok: false,
      json: jest
        .fn()
        .mockResolvedValue({ message: 'Forbidden', error_code: '403' }),
    };
    const disconnectHandlerMock = jest.fn();

    try {
      await responseSessionGuard(
        responseMock as unknown as Response,
        KEY_SESSION.dev,
        disconnectHandlerMock
      );
    } catch (error: any) {
      expect(error.message).toBe('Forbidden');
      expect(error.error_code).toBe('403');
    }

    expect(disconnectHandlerMock).toHaveBeenCalled();
    expect(removeItem).toHaveBeenCalledWith(KEY_SESSION.dev);
  });

  it('should throw custom error if response status is not OK', async () => {
    const responseMock = {
      status: 500,
      ok: false,
      json: jest
        .fn()
        .mockResolvedValue({ message: 'Some error', error_code: '500' }),
    };

    try {
      await responseSessionGuard(
        responseMock as unknown as Response,
        KEY_SESSION.dev
      );
      fail('The error was not thrown as expected');
    } catch (error: any) {
      expect(error.message).toBe('Some error');
      expect(error.error_code).toBe('500');
    }
  });

  it('should return response JSON if response status is OK', async () => {
    const responseData = { key: 'value' };
    const responseMock = {
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue(responseData),
    };

    const result = await responseSessionGuard(
      responseMock as unknown as Response,
      KEY_SESSION.dev
    );

    expect(result).toEqual(responseData);
  });
});
