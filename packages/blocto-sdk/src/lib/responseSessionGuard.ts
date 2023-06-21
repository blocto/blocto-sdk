import { removeItem } from './storage';
import { KEY_SESSION } from './storage/constants';

export default async function responseSessionGuard<T>(
  response: Response,
  key: KEY_SESSION
): Promise<T> {
  if (response.status === 403) {
    removeItem(key);
    throw new Error('[Blocto SDK]: Session expired!');
  }
  return response.json();
}
