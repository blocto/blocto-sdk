import { attachFrame, createFrame, detatchFrame } from './frame';
import { popupWindow } from '../lib/popup';
import { isSafari } from './browser';

export function openWalletView(url:string) {
  let childFrame:HTMLIFrameElement|null = null;
  let childTab:Window|null = null;
  let messageTarget:Window|null = null;


  if (isSafari()) {
    childTab = popupWindow(
      url,
      'BLOCTO_POP',
      640,
      770
    ) || null;
    messageTarget = childTab || null;
  } else {
    childFrame = createFrame(url);
    attachFrame(childFrame);
    messageTarget = childFrame && childFrame.contentWindow;
  }

  const closeWalletView = () => {
    if (childFrame || childTab) {
      if (isSafari() && childTab) {
        childTab.close();
      } else if (childFrame) {
        detatchFrame(childFrame);
      }
    }
  };

  return {
    messageTarget,
    closeWalletView,
    isSafari: isSafari(),
  };
}
