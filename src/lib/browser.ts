export function isSafari() {
  const safariAgent = navigator && navigator.userAgent.includes('Safari');
  const chromeAgent = navigator && navigator.userAgent.includes('Chrome');

  // Discard Safari since it also matches Chrome
  return !chromeAgent && safariAgent;
}
