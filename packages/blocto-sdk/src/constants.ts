export enum KEY_SESSION {
  prod = 'BLOCTO_SDK',
  dev = 'BLOCTO_SDK_DEV',
  staging = 'BLOCTO_SDK_STAGING',
}
export enum CHAIN {
  ETHEREUM = 'ethereum',
  APTOS = 'aptos',
}

export interface BaseConfig {
  appId?: string;
}

type Mapping = Record<number | string, string>;

/* eth series constants begin */

export const ETH_RPC_LIST: Mapping = {
  // This is the list of public RPC endpoints that we known to be working
  // Used to help developers did not set up their own RPC endpoints

  // BSC mainnet
  56: 'https://bsc-dataseed1.binance.org',
  // BSC testnet
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',

  // Polygon Mainnet
  137: 'https://rpc-mainnet.maticvigil.com/',
  // Polygon Testnet
  80001: 'https://rpc-mumbai.matic.today/',

  // Avalanche Mainnet
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  // Avalanche Fuji Testnet
  43113: 'https://api.avax-test.network/ext/bc/C/rpc',

  // Arbitrum Mainnet
  42161: 'https://arb1.arbitrum.io/rpc',
  // Arbitrum Testnet
  421613: 'https://endpoints.omniatech.io/v1/arbitrum/goerli/public',

  // Optimism Mainnet
  10: 'https://mainnet.optimism.io',
  // Optimism Goerli Testnet
  420: 'https://goerli.optimism.io',
};

export const ETH_ENV_WALLET_SERVER_MAPPING: Mapping = {
  prod: 'https://wallet-v2.blocto.app',
  staging: 'https://wallet-v2-staging.blocto.app',
  dev: 'https://wallet-v2-dev.blocto.app',
};

export const ETH_SESSION_KEY_MAPPING: Record<string, KEY_SESSION> = {
  prod: KEY_SESSION.prod,
  staging: KEY_SESSION.staging,
  dev: KEY_SESSION.dev,
};

/* eth series constants end */

/* aptos constants begin */

export const APT_SESSION_KEY_MAPPING: Record<number | string, KEY_SESSION> = {
  1: KEY_SESSION.prod,
  2: KEY_SESSION.dev,
  3: KEY_SESSION.dev,
  4: KEY_SESSION.dev,
  5: KEY_SESSION.staging,
};

export const APT_CHAIN_ID_SERVER_MAPPING: Mapping = {
  // MAINNET
  1: 'https://wallet-v2.blocto.app',
  // TESTNET
  2: 'https://wallet-v2-dev.blocto.app',
  // DEVNET
  3: 'https://wallet-v2-dev.blocto.app',
  // TESTING
  4: 'https://wallet-v2-dev.blocto.app',
  // PREMAINNET
  5: 'https://wallet-v2-staging.blocto.app',
};

export enum WalletAdapterNetwork {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Testing = 'testing',
  Premainnet = 'premainnet',
}

export const APT_CHAIN_ID_NAME_MAPPING: Record<number, WalletAdapterNetwork> = {
  1: WalletAdapterNetwork.Mainnet,
  2: WalletAdapterNetwork.Testnet,
  3: WalletAdapterNetwork.Devnet,
  4: WalletAdapterNetwork.Testing,
  5: WalletAdapterNetwork.Premainnet,
};

export const APT_CHAIN_ID_RPC_MAPPING: Mapping = {
  1: 'https://fullnode.mainnet.aptoslabs.com/v1',
  2: 'https://fullnode.testnet.aptoslabs.com/v1',
  3: 'https://fullnode.devnet.aptoslabs.com/v1',
  4: '',
  5: 'https://premainnet.aptosdev.com/v1',
};

/* aptos constants end */

export const EIP1193_EVENTS: Array<string> = [
  'connect',
  'disconnect',
  'message',
  'chainChanged',
  'accountsChanged',
];

// Preserve login for 1 day
export const LOGIN_PERSISTING_TIME = 86400 * 1000;
export const DEFAULT_APP_ID = '00000000-0000-0000-0000-000000000000';

// Will inject the version of the SDK by rollup versionInjector during build time
export const SDK_VERSION = '[VI]{version}[/VI]';
