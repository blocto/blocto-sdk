export function openNewTab(url: string): Window | void {
  if (window && window.open) {
    const tabHandler = window.open(url, '_blank');

    if (tabHandler) {
      tabHandler.focus();
      return tabHandler;
    }
  }
}


export function popupWindow(url:string, windowName:string, w:number, h:number) :Window | void {
  if (!(window && window.top)) return;

  const halfX = w / 2;
  const halfY = h / 2;
  const y = ((window.top.outerHeight / 2) + window.top.screenY) - halfY;
  const x = ((window.top.outerWidth / 2) + window.top.screenX) - halfX;

  const popup = window.open(
    url,
    windowName,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
  );
  if (!popup) { throw new Error('Popup failed to open, it might be blocked by a popup blocker.)'); }

  return popup;
}
