import { removeItem } from './storage';
import { KEY_SESSION } from './storage/constants';

export default async function responseSessionGuard<T>(
  response: Response,
  key: KEY_SESSION,
  disconnectHandler?: () => void
): Promise<T> {
  if (response.status === 403) {
    if (disconnectHandler) {
      disconnectHandler();
    }
    removeItem(key);
    throw new Error('[Blocto SDK]: Session expired!');
  }
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }
  return response.json();
}
