/**
 * @vitest-environment jsdom
 */

import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { createConfig } from '@wagmi/core';
import { polygonMumbai, arbitrumGoerli } from '@wagmi/chains';
import * as viem from 'viem';
import { normalizeChainId } from '@wagmi/core';
import { blocto } from './index';

vi.mock('viem');

describe('blocto-connector', () => {
  let connector: any;
  beforeEach(() => {
    const config = createConfig({
      chains: [polygonMumbai, arbitrumGoerli],
      pollingInterval: 100,
      storage: null,
      transports: {
        [polygonMumbai.id]: viem.http(),
        [arbitrumGoerli.id]: viem.http(),
      },
    });

    const connectorFn = blocto();
    connector = config._internal.connectors.setup(connectorFn);
  });

  afterEach(() => {
    connector = null;
  });

  test('setup', () => {
    expect(connector.name).toEqual('Blocto');
  });

  test('connect', async () => {
    const chainId = 1;
    const accounts = ['0xc61B4Aa62E5FD40cceB08C602Eb5D157b257b49a'];
    const provider = {
      request: vi.fn().mockResolvedValue(accounts),
    };
    connector.getProvider = vi.fn().mockResolvedValue(provider);
    connector.getAccounts = vi.fn().mockResolvedValue(accounts);
    connector.getChainId = vi.fn().mockResolvedValue(chainId);

    const result = await connector.connect({ chainId });

    expect(result).toEqual({ accounts, chainId });
    expect(connector.getProvider).toHaveBeenCalledWith({ chainId });
    expect(provider.request).toHaveBeenCalledWith({
      method: 'eth_requestAccounts',
    });
  });

  test('disconnect', async () => {
    const provider = {
      request: vi.fn().mockResolvedValue(undefined),
    };
    connector.getProvider = vi.fn().mockResolvedValue(provider);

    await connector.disconnect();

    expect(connector.getProvider).toHaveBeenCalled();
    expect(provider.request).toHaveBeenCalledWith({
      method: 'wallet_disconnect',
    });
  });

  test('getAccounts', async () => {
    const accounts = ['0xc61B4Aa62E5FD40cceB08C602Eb5D157b257b49a'];
    const provider = {
      request: vi.fn().mockResolvedValue(accounts),
    };
    connector.getProvider = vi.fn().mockResolvedValue(provider);
    vi.spyOn(viem, 'getAddress').mockImplementation((x) => x as `0x${string}`);

    const result = await connector.getAccounts();

    expect(result).toEqual(['0xc61B4Aa62E5FD40cceB08C602Eb5D157b257b49a']);
    expect(connector.getProvider).toHaveBeenCalled();
    expect(provider.request).toHaveBeenCalledWith({ method: 'eth_accounts' });
  });

  test('getChainId', async () => {
    const chainId = '0x1';
    const provider = {
      chainId: undefined,
      request: vi.fn().mockResolvedValue(chainId),
    };
    connector.getProvider = vi.fn().mockResolvedValue(provider);

    const result = await connector.getChainId();

    expect(result).toEqual(normalizeChainId(chainId));
    expect(connector.getProvider).toHaveBeenCalled();
    expect(provider.request).toHaveBeenCalledWith({ method: 'eth_chainId' });
  });

  test('isAuthorized', async () => {
    const accounts = ['0xc61B4Aa62E5FD40cceB08C602Eb5D157b257b49a'];
    connector.getAccounts = vi.fn().mockResolvedValue(accounts);

    const result = await connector.isAuthorized();

    expect(result).toEqual(false);
  });

  test('switchChain', async () => {
    const chainId = arbitrumGoerli.id;
    const provider = {
      request: vi.fn().mockResolvedValue(undefined),
      supportChainList: vi.fn().mockResolvedValue(
        [polygonMumbai, arbitrumGoerli].map(({ id, name }) => ({
          chainId: id,
          chainName: name,
        }))
      ),
    };
    connector.getProvider = vi.fn().mockResolvedValue(provider);
    vi.spyOn(viem, 'numberToHex').mockReturnValue(viem.numberToHex(chainId));

    const chain = await connector.switchChain({ chainId });

    expect(connector.getProvider).toHaveBeenCalled();
    expect(provider.request).toHaveBeenCalledWith({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: viem.numberToHex(chainId),
          rpcUrls: arbitrumGoerli.rpcUrls.default.http,
        },
      ],
    });
    expect(provider.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: viem.numberToHex(chainId),
        },
      ],
    });
    expect(chain.id).toEqual(chainId);
  });
});
