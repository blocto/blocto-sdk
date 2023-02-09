type Mapping = Record<number | string, string>

export interface BaseConfig {
  appId?: string;
}

/* eth series constants begin */

export const ETH_CHAIN_ID_RPC_MAPPING: Mapping = {
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
};

export const ETH_CHAIN_ID_CHAIN_MAPPING: Mapping = {
  // Ethereum
  1: 'ethereum',
  4: 'ethereum',

  // BSC
  56: 'bsc',
  97: 'bsc',

  // Polygon
  137: 'polygon',
  80001: 'polygon',

  // Avalanche
  43114: 'avalanche',
  43113: 'avalanche',
};

export const ETH_CHAIN_ID_NET_MAPPING: Mapping = {
  // Ethereum
  1: 'mainnet',
  4: 'rinkeby',

  // BSC
  56: 'mainnet',
  97: 'testnet',

  // Polygon
  137: 'mainnet',
  80001: 'testnet',

  // Avalanche
  43114: 'mainnet',
  43113: 'testnet',
};

export const ETH_CHAIN_ID_SERVER_MAPPING: Mapping = {
  1: 'https://wallet.blocto.app',
  4: 'https://wallet-v2.blocto.app',
  56: 'https://wallet.blocto.app',
  97: 'https://wallet-v2.blocto.app',
  137: 'https://wallet.blocto.app',
  80001: 'https://wallet-v2.blocto.app',
  43114: 'https://wallet.blocto.app',
  43113: 'https://wallet-v2.blocto.app',
};

/* eth series constants end */

/* sol constants begin */

export const SOL_NET_SERVER_MAPPING: Mapping = {
  devnet: 'https://wallet-v2.blocto.app',
  testnet: 'https://wallet-v2.blocto.app',
  'mainnet-beta': 'https://wallet.blocto.app',
};

export const SOL_NET = ['devnet', 'testnet', 'mainnet-beta'];

/* sol constants end */

/* aptos constants begin */

export const APT_CHAIN_ID_SERVER_MAPPING: Mapping = {
  // MAINNET
  1: 'https://wallet.blocto.app',
  // TESTNET
  2: 'https://wallet-v2.blocto.app',
  // DEVNET
  3: 'https://wallet-v2.blocto.app',
  // TESTING
  4: 'https://wallet-v2.blocto.app',
  // PREMAINNET
  5: 'https://wallet.blocto.app',
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

export const EIP1193_EVENTS: Array<string> = ['connect', 'disconnect', 'message', 'chainChanged', 'accountsChanged'];

// Preserve login for 1 day
export const LOGIN_PERSISTING_TIME = 86400 * 1000;
export const DEFAULT_APP_ID = '00000000-0000-0000-0000-000000000000';
