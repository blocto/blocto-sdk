
const IFRAME_STYLE = 'width:100vw;height:100vh;position:fixed;top:0;left:0;z-index:1000;border:none;';

export function createFrame(url: string) {
  const frame = document.createElement('iframe');

  frame.setAttribute('src', url);
  frame.setAttribute('style', IFRAME_STYLE);

  return frame;
}

export function attachFrame(frame: HTMLIFrameElement) {
  document.body.appendChild(frame);
}

export function detatchFrame(frame: HTMLIFrameElement) {
  frame.parentNode && frame.parentNode.removeChild(frame);
}
