// The root class for all providers

import { EIP1193Provider, RequestArguments } from 'eip1193-provider';

import { EIP1193_EVENTS } from '../constants';
import { KEY_SESSION, getItemWithExpiry } from '../lib/localStorage';
import Session from '../lib/session.d';
import { ProviderSession } from './types/blocto.d';

class BloctoProvider implements EIP1193Provider {
  isBlocto = true;

  isConnecting = false;
  appId?: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eventListeners: { [key: string]: Array<(arg: any) => void> } = {};

  sessionKey = KEY_SESSION;

  session: ProviderSession;

  constructor(session: ProviderSession) {
    this.session = session;
    // init event listeners
    EIP1193_EVENTS.forEach((event) => {
      this.eventListeners[event] = [];
    });
  }

  protected formatAndSetSessionAccount(
    address: Record<string, string> = {}
  ): Record<string, string[]> | void {
    this.session.accounts = Object.keys(address).reduce<
      Record<string, string[]>
    >((initial, current) => {
      initial[current] = [address?.[current]];
      return initial;
    }, {});
  }

  protected tryRetrieveSessionFromStorage(chain: string): void {
    // load previous connected state
    const session = getItemWithExpiry<Session>(this.sessionKey, {});
    const sessionCode = session && session.code;
    const sessionAccount = session && session.address && session.address[chain];
    this.session.connected = Boolean(sessionCode && sessionAccount);
    this.session.code = sessionCode || null;
    this.formatAndSetSessionAccount(session ? session.address : {});
  }

  // implement by children
  // eslint-disable-next-line
  async request(payload: RequestArguments) {}

  on(event: string, listener: (arg: any) => void): void {
    if (!EIP1193_EVENTS.includes(event)) return;

    this.eventListeners[event].push(listener);
  }

  // @todo: implement it
  // eslint-disable-next-line
  once() {}

  removeListener(event: string, listener: (arg: any) => void): void {
    const listeners = this.eventListeners[event];
    const index = listeners.findIndex((item) => item === listener);
    if (index !== -1) {
      this.eventListeners[event].splice(index, 1);
    }
  }

  // alias removeListener
  off = this.removeListener;
}

export default BloctoProvider;
