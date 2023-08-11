import { supportedConnectors } from 'connectkit';
import { BloctoLogo } from '../components/BloctoLogo';

type Spc = typeof supportedConnectors;

const BLOCTO_CONFIG: Spc[number] = {
  id: 'bloctoWallet',
  name: 'Blocto Wallet',
  shortName: 'Blocto',
  logos: {
    default: <BloctoLogo />,
  },
  appUrls: {
    ios: 'https://apps.apple.com/app/blocto/id1481181682',
    android: 'https://play.google.com/store/apps/details?id=com.portto.blocto',
  },
  scannable: false,
  extensionIsInstalled: () => true,
};

export { BLOCTO_CONFIG };
