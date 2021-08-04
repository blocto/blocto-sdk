
interface RemovableEventHandler {
  // eslint-disable-next-line
  (e: Event, callback: Function): void;
}

export default (eventType: string, handler: RemovableEventHandler, target: any = window) => {
  function listener(e: Event) {
    const removeEventListener = () => target.removeEventListener(eventType, listener);
    handler(e, removeEventListener);
  }
  target.addEventListener(eventType, listener);
};
