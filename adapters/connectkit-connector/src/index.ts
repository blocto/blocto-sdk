/* eslint-disable @typescript-eslint/no-unused-vars */
import { supportedConnectors } from 'connectkit';
import { BloctoOptions, default as BloctoConnector } from './bloctoConnector';
import { BLOCTO_CONFIG } from './constants';
import { createConfig } from 'wagmi';

type Config = ReturnType<typeof createConfig>;
type Spc = typeof supportedConnectors;
type Options = {
  /**
   * The sorting order of Blocto in the connectkit UI.
   */
  order?: number;
} & Pick<BloctoOptions, 'appId'>;

type IntegrateBloctoConfig = (
  config: Config,
  supportedConnector: Spc,
  opts?: Options
) => Config;

/**
 * Integrate Blocto into wagmi's config and connectkit.
 *
 * @param {Config} config The configuration object obtained from `createConfig` function of wagmi.
 * @param {Spc} supportedConnector An array exported from connectkit, used to configure Blocto wallet display in the connectkit UI.
 * @param {Options} opts Additional options for configuring BloctoConnector. Refer to the `Options` type for detailed information.
 * @returns {object} A configuration object for wagmi and a connectkit UI with Blocto integrated.
 */
const integrateBloctoConfig: IntegrateBloctoConfig = (
  config,
  supportedConnector,
  { order = 0, ...options } = {}
) => {
  supportedConnector.push(BLOCTO_CONFIG);
  config.connectors.splice(
    order,
    0,
    new BloctoConnector({ chains: config.publicClient.chains, options })
  );
  return config;
};

export { default as BloctoConnector } from './bloctoConnector';
export type * from './bloctoConnector';
export { integrateBloctoConfig };
export type { Options };
