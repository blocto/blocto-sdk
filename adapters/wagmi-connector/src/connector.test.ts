/**
 * @vitest-environment jsdom
 */

import { expect, test, describe } from 'vitest';
import { createConfig } from '@wagmi/core';
import { polygonMumbai, arbitrumGoerli } from '@wagmi/chains';
import { http } from 'viem';
import { blocto } from './index';

describe('blocto-connector', () => {
  const config = createConfig({
    chains: [polygonMumbai, arbitrumGoerli],
    pollingInterval: 100,
    storage: null,
    transports: {
      [polygonMumbai.id]: http(),
      [arbitrumGoerli.id]: http(),
    },
  });

  const connectorFn = blocto();
  const connector = config._internal.connectors.setup(connectorFn);

  test('setup', () => {
    expect(connector.name).toEqual('Blocto');
  });
});
