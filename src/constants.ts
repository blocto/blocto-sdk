interface Mapping {
  [key: number]: string;
}

export const CHAIN_ID_RPC_MAPPING: Mapping = {
  // BSC mainnet
  56: 'https://bsc-dataseed1.binance.org',
  // BSC testnet
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

export const CHAIN_ID_CHAIN_MAPPING: Mapping = {
  // Ethereum
  1: 'ethereum',
  4: 'ethereum',

  // BSC
  56: 'bsc',
  97: 'bsc',
};

export const CHAIN_ID_NET_MAPPING: Mapping = {
  // Ethereum
  1: 'mainnet',
  4: 'rinkeby',

  // BSC
  56: 'mainnet',
  97: 'testnet',
};

export const CHAIN_ID_SERVER_MAPPING: Mapping = {
  1: 'https://wallet.blocto.app',
  4: 'https://wallet-testnet.blocto.app',
  56: 'https://wallet.blocto.app',
  97: 'https://wallet-testnet.blocto.app',
};

export const EIP1193_EVENTS: Array<string> = ['connect', 'disconnect', 'message', 'chainChanged', 'accountsChanged'];
