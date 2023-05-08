import { removeItem } from './localStorage';

export default async function responseSessionGuard<T>(
  response: Response,
  instance: { session: { code: string | null }; sessionKey: string }
): Promise<T> {
  if (response.status === 403) {
    // eslint-disable-next-line
    instance.session.code = null;
    removeItem(instance.sessionKey);
    throw new Error('[Blocto SDK]: Session expired!');
  }
  return response.json();
}
