export interface EvmSupportMapping {
  [id: string | number]: {
    chain_id: number
    name: string // backend defined chain name: ethereum, bsc, …
    display_name: string // human readable name: Ethereum, Polygon, …
    network_type: string // chain network type: mainnet / testnet / devnet
    blocto_service_environment: string // backend service env: prod / dev (may return staging in future)
    rpc_endpoint_domains: string[] // rpc endpoints whitelist
  }
}

export async function getEvmSupport(): Promise<EvmSupportMapping> {
  const { networks } = await fetch('https://api-dev.blocto.app/networks/evm').then(response => response.json());
  const evmSupportMap = networks.reduce((a: any, v: any) => ({ ...a, [v.chain_id]: v }), {});
  return evmSupportMap;
}
