import BloctoSDK from '../../main';
import AptosProvider from '../../providers/aptos';

describe('BloctoSDK Aptos', () => {
  it('should instantiate with AptosProvider when aptos config is provided', () => {
    const appId = 'your_app_id';
    const aptosConfig = {
      chainId: 2,
    };

    const bloctoSDK = new BloctoSDK({ appId, aptos: aptosConfig });

    expect(bloctoSDK.aptos).toBeInstanceOf(AptosProvider);
  });

  it('should not instantiate providers when their respective configs are not provided', () => {
    const appId = 'your_app_id';

    const bloctoSDK = new BloctoSDK({ appId });

    expect(bloctoSDK.ethereum).toBeUndefined();
    expect(bloctoSDK.aptos).toBeUndefined();
  });
});
