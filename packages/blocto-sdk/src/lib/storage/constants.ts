// local storage version naming rule: [milestone].[patch]
export const LOCAL_STORAGE_VERSION = '0.0.1';
export const KEY_LOCAL_STORAGE_VERSION = 'sdk.version';
export enum KEY_SESSION {
  prod = 'BLOCTO_SDK',
  dev = 'BLOCTO_SDK_DEV',
  staging = 'BLOCTO_SDK_STAGING',
}
export enum CHAIN {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  APTOS = 'aptos',
}
