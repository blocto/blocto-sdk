import { bloctoWallet } from '../index';

describe('rainbowkit-connector', () => {

  const wallet = bloctoWallet();

  test('defines name', () => {
    expect(typeof wallet.name).toBe('string');
  });

  test('defines id', () => {
    expect(typeof wallet.id).toBe('string');
  });

  test('defines icon', () => {
    expect(typeof wallet.iconUrl).toBe('string');
  });

  test('defines connect()', () => {
    expect(typeof wallet.createConnector).toBe('function');
  });

  const { connector } = wallet.createConnector({
    rkDetails: {
      id: 'blocto',
      name: 'Blocto',
      shortName: 'Blocto',
      rdns: 'io.blocto',
      iconBackground: '#ffffff',
      iconUrl:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjhweCIgaGVpZ2h0PSIyOHB4IiB2aWV3Qm94PSIwIDAgMjggMjgiIHZlcnNpb249IjEuMSI+CjxnIGlkPSJzdXJmYWNlMSI+CjxyZWN0IHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgZmlsbD0id2hpdGUiLz4KPHBhdGggc3R5bGU9IiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOnJnYig3Ljg0MzEzNyUsNjYuNjY2NjY3JSwxMDAlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gMTUuMzU1NDY5IDguNTQyOTY5IEMgMTMuMjUgOC41NDI5NjkgMTEuMTk1MzEyIDkuMzU1NDY5IDkuNjU2MjUgMTAuNzkyOTY5IEMgNy45NzI2NTYgMTIuMzc1IDYuOTA2MjUgMTQuNzA3MDMxIDYuMjk2ODc1IDE2LjkwMjM0NCBDIDUuODk0NTMxIDE4LjMzOTg0NCA1LjY5NTMxMiAxOS44MjgxMjUgNS42OTUzMTIgMjEuMzIwMzEyIEMgNS42OTUzMTIgMjEuNzY5NTMxIDUuNzEwOTM4IDIyLjIxODc1IDUuNzUgMjIuNjYwMTU2IEMgNS43OTI5NjkgMjMuMTk1MzEyIDYuMzE2NDA2IDIzLjU3MDMxMiA2LjgzNTkzOCAyMy40Mjk2ODggQyA3LjI4OTA2MiAyMy4zMDQ2ODggNy43Njk1MzEgMjMuMjM4MjgxIDguMjYxNzE5IDIzLjIzODI4MSBDIDkuMjczNDM4IDIzLjIzODI4MSAxMC4yMjI2NTYgMjMuNTE1NjI1IDExLjAzNTE1NiAyMy45OTYwOTQgQyAxMS4wNTQ2ODggMjQuMDA3ODEyIDExLjA3NDIxOSAyNC4wMTk1MzEgMTEuMDkzNzUgMjQuMDMxMjUgQyAxMi40MTc5NjkgMjQuODIwMzEyIDEzLjk3NjU2MiAyNS4yNTM5MDYgMTUuNjQwNjI1IDI1LjE5NTMxMiBDIDE5Ljk3NjU2MiAyNS4wNTQ2ODggMjMuNTE5NTMxIDIxLjUyMzQzOCAyMy42Nzk2ODggMTcuMTg3NSBDIDIzLjg1NTQ2OSAxMi40NDE0MDYgMjAuMDYyNSA4LjU0Mjk2OSAxNS4zNTU0NjkgOC41NDI5NjkgWiBNIDE1LjM1NTQ2OSAyMC42Nzk2ODggQyAxMy4yNTM5MDYgMjAuNjc5Njg4IDExLjU0Njg3NSAxOC45NzY1NjIgMTEuNTQ2ODc1IDE2Ljg3MTA5NCBDIDExLjU0Njg3NSAxNC43Njk1MzEgMTMuMjUzOTA2IDEzLjA2NjQwNiAxNS4zNTU0NjkgMTMuMDY2NDA2IEMgMTcuNDU3MDMxIDEzLjA2NjQwNiAxOS4xNjAxNTYgMTQuNzY5NTMxIDE5LjE2MDE1NiAxNi44NzEwOTQgQyAxOS4xNjAxNTYgMTguOTc2NTYyIDE3LjQ1NzAzMSAyMC42Nzk2ODggMTUuMzU1NDY5IDIwLjY3OTY4OCBaIE0gMTUuMzU1NDY5IDIwLjY3OTY4OCAiLz4KPHBhdGggc3R5bGU9IiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOnJnYigwJSw0NS44ODIzNTMlLDEwMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSAxMS45Mjk2ODggNS45MTc5NjkgQyAxMS45Mjk2ODggNy4wMTU2MjUgMTEuMzU1NDY5IDguMDM1MTU2IDEwLjQxMDE1NiA4LjU5Mzc1IEMgOS44MTY0MDYgOC45NDUzMTIgOS4yNjE3MTkgOS4zNTkzNzUgOC43NTc4MTIgOS44MzIwMzEgQyA3LjY0MDYyNSAxMC44Nzg5MDYgNi44MDg1OTQgMTIuMTY0MDYyIDYuMTkxNDA2IDEzLjQzNzUgQyA2LjA3MDMxMiAxMy42ODc1IDUuNjkxNDA2IDEzLjU5NzY1NiA1LjY5MTQwNiAxMy4zMjAzMTIgTCA1LjY5MTQwNiA1LjkxNzk2OSBDIDUuNjkxNDA2IDQuMTk1MzEyIDcuMDg5ODQ0IDIuODAwNzgxIDguODEyNSAyLjgwMDc4MSBDIDEwLjUzNTE1NiAyLjgwMDc4MSAxMS45Mjk2ODggNC4xOTUzMTIgMTEuOTI5Njg4IDUuOTE3OTY5IFogTSAxMS45Mjk2ODggNS45MTc5NjkgIi8+CjwvZz4KPC9zdmc+Cg==',
      downloadUrls: {
        ios: 'https://apps.apple.com/app/blocto/id1481181682',
        android:
          'https://play.google.com/store/apps/details?id=com.portto.blocto',
      },
      installed: true,
      index: 4,
      groupIndex: 2,
      groupName: 'Other',
      isRainbowKitConnector: true,
    },
  });

  test('defines account()', () => {
    expect(typeof connector.connect).toBe('function');
  });

  test('defines disconnect()', () => {
    expect(typeof connector.disconnect).toBe('function');
  });

  test('defines getAccount()', () => {
    expect(typeof connector.getAccount).toBe('function');
  });

  test('defines getChainId()', () => {
    expect(typeof connector.getChainId).toBe('function');
  });

  test('defines getProvider()', () => {
    expect(typeof connector.getProvider).toBe('function');
  });

  test('defines switchChain()', () => {
    expect(typeof connector.switchChain).toBe('function');
  });
});
