export interface EvmSupportMapping {
  [id: string | number]: {
    chain_id: number
    name: string // backend defined chain name: ethereum, bsc, …
    display_name: string // human readable name: Ethereum, Polygon, …
    network_type: string // chain network type: mainnet / testnet / devnet
    blocto_service_enviroment: string // backend service env: prod / dev (may return staging in future)
    rpc_endpoint_domains: string[] // rpc endpoints whitelist
  }
}

export async function getEvmSupport(): Promise<EvmSupportMapping> {
  const networks = [
    {
      chain_id: 1,
      name: 'ethereum',
      display_name: 'Ethereum',
      network_type: 'mainnet',
      blocto_service_enviroment: 'staging',
      rpc_endpoint_domains: [],
    },
  ];
  const evmSupportMap = networks.reduce((a, v) => ({ ...a, [v.chain_id]: v }), {});
  return evmSupportMap;
}
