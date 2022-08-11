export function openNewTab(url: string): Window | void {
  if (window && window.open) {
    const tabHandler = window.open(url, '_blank');

    if (tabHandler) {
      tabHandler.focus();
      return tabHandler;
    }
  }
}
