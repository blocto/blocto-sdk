import React, { useState, useEffect } from 'react';
import { SiweMessage } from 'siwe';
import {
  RainbowKitProvider,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useAccount } from 'wagmi';
import { simulateFetch } from '../utils';
import { chains } from '../config/web3ContextConfig';

export default function RainbowkitAuthProvider({
  children,
}) {
  const [authStatus, setAuthStatus] =
    useState('unauthenticated');
  const { isConnected } = useAccount();

  useEffect(() => {
    setAuthStatus(isConnected ? 'authenticated' : 'unauthenticated');
  }, [isConnected]);

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      await new Promise((r) => setTimeout(r, 100));
      const nonce = 'mockNonce'; // mock nonce
      return nonce;
    },
    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },
    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },
    verify: async ({ signature, message }) => {
      const verifyResult = await simulateFetch();
      if (verifyResult.data.status === 'SUCCESS') {
        setAuthStatus('authenticated');
        return true;
      }
      return false;
    },
    signOut: async () => {
      console.log('singout handler');
    },
  });
  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={authStatus}
    >
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}
