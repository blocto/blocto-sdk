// The root class for all providers

import { EIP1193Provider, RequestArguments } from 'eip1193-provider';
import { EIP1193_EVENTS } from '../constants';
import { DEFAULT_APP_ID } from '../constants';

class BloctoProvider implements EIP1193Provider {
  isBlocto = true;

  isConnecting = false;
  appId: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eventListeners: { [key: string]: Array<(arg: any) => void> } = {};

  constructor() {
    // init event listeners
    EIP1193_EVENTS.forEach((event) => {
      this.eventListeners[event] = [];
    });
    this.appId = DEFAULT_APP_ID;
  }

  // implement by children
  // eslint-disable-next-line
  async request(payload: RequestArguments | Array<RequestArguments>) {}

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
