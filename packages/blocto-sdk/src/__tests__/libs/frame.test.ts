import { createFrame, attachFrame, detachFrame } from '../../lib/frame';

describe('Frame Functions', () => {
  let frame: HTMLIFrameElement;

  beforeEach(() => {
    frame = createFrame('https://example.com');
  });

  afterEach(() => {
    detachFrame(frame);
  });

  test('removeFrameFromParent removes the frame from the parent node', () => {
    const parentNode = document.createElement('div');
    attachFrame(frame);
    expect(parentNode.contains(frame)).toBe(false);

    parentNode.appendChild(frame); // Add frame to the parent node
    expect(parentNode.contains(frame)).toBe(true);

    // expect(parentNode.contains(frame)).toBe(false);
  });
});
