import { removeItem } from './storage';
import { KEY_SESSION } from './storage/constants';

export interface ICustomError extends Error {
  error_code?: string;
}

export default async function responseSessionGuard<T>(
  response: Response,
  key: KEY_SESSION,
  disconnectHandler?: () => void
): Promise<T> {
  if (response.status === 403 || response.status === 401) {
    if (disconnectHandler) {
      disconnectHandler();
    }
    removeItem(key);
  }
  if (!response.ok) {
    const data = await response.json();
    const e: ICustomError = new Error(data?.message || 'unknown error');
    e.error_code = data?.error_code;
    throw e;
  }
  return response.json();
}
