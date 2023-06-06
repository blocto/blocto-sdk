const IFRAME_STYLE =
  'width:100vw;height:100%;position:fixed;top:0;left:0;z-index:2147483646;border:none;box-sizing:border-box;color-scheme:light;inset:0px;display:block;';

export function createFrame(url: string): HTMLIFrameElement {
  const frame = document.createElement('iframe');

  frame.setAttribute('src', url);
  frame.setAttribute('style', IFRAME_STYLE);

  return frame;
}

export function attachFrame(frame: HTMLIFrameElement): void {
  document.body.appendChild(frame);
}

export function detatchFrame(frame: HTMLIFrameElement): void {
  const parentNode = frame && frame.parentNode;
  if (parentNode && parentNode.removeChild instanceof Function) {
    parentNode.removeChild(frame);
  }
}
