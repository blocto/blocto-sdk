import { privateToPublic, stripHexPrefix } from 'ethereumjs-util';
import { equal } from 'assert';
import DappAuth from '../src/index.js';
import { removeHexPrefix } from '../src/utils/index.js';
import ProviderMock from './provider-mock.js';
import ContractMock from './contract-mock.js';
import { generateRandomKey, keyToAddress, signEOAPersonalMessage, signERC1654PersonalMessage } from './test-utils.js';

describe('DappAuth', function() {
  const keyA = generateRandomKey();
  const keyB = generateRandomKey();
  const keyC = generateRandomKey();

  const testCases = [
    {
      title: 'External wallets should be authorized signers over their address',
      isEOA: true,
      challenge: 'foo',
      challengeSign: 'foo',
      signingKeys: [keyA],
      authAddr: keyToAddress(keyA),
      mockContract: {
        authorizedKey: null,
        address: null,
        errorIsValidSignature: false,
      },
      expectedAuthorizedSignerError: false,
      expectedAuthorizedSigner: true,
    },
    {
      title:
        'External wallets should NOT be authorized signers when signing the wrong challenge',
      isEOA: true,
      challenge: 'foo',
      challengeSign: 'bar',
      signingKeys: [keyA],
      authAddr: keyToAddress(keyA),
      mockContract: {
        authorizedKey: privateToPublic(keyC),
        address: keyToAddress(keyA),
        errorIsValidSignature: false,
      },
      expectedAuthorizedSignerError: false,
      expectedAuthorizedSigner: false,
    },
    {
      title:
        'External wallets should NOT be authorized signers over OTHER addresses',
      isEOA: true,
      challenge: 'foo',
      challengeSign: 'foo',
      signingKeys: [keyA],
      authAddr: keyToAddress(keyB),
      mockContract: {
        authorizedKey: privateToPublic(keyC),
        address: keyToAddress(keyB),
        errorIsValidSignature: false,
      },
      expectedAuthorizedSignerError: false,
      expectedAuthorizedSigner: false,
    },
    {
      title:
        'Smart-contract wallets with a 1-of-1 correct internal key should be authorized signers over their address',
      isEOA: false,
      challenge: 'foo',
      challengeSign: 'foo',
      signingKeys: [keyB],
      authAddr: keyToAddress(keyA),
      mockContract: {
        authorizedKey: privateToPublic(keyB),
        address: keyToAddress(keyA),
        errorIsValidSignature: false,
      },
      expectedAuthorizedSignerError: false,
      expectedAuthorizedSigner: true,
    },
    {
      title:
        'Smart-contract wallets with a 1-of-2 (multi-sig) correct internal key should be authorized signers over their address',
      isEOA: false,
      challenge: 'foo',
      challengeSign: 'foo',
      signingKeys: [keyB, keyC],
      authAddr: keyToAddress(keyA),
      mockContract: {
        authorizedKey: privateToPublic(keyB),
        address: keyToAddress(keyA),
        errorIsValidSignature: false,
      },
      expectedAuthorizedSignerError: false,
      expectedAuthorizedSigner: true,
    },
    {
      title:
        'Smart-contract wallets with a 1-of-1 incorrect internal key should NOT be authorized signers over their address',
      isEOA: false,
      challenge: 'foo',
      challengeSign: 'foo',
      signingKeys: [keyB],
      authAddr: keyToAddress(keyA),
      mockContract: {
        authorizedKey: privateToPublic(keyC),
        address: keyToAddress(keyA),
        errorIsValidSignature: false,
      },
      expectedAuthorizedSignerError: false,
      expectedAuthorizedSigner: false,
    },
    {
      title: 'isAuthorizedSigner should error when smart-contract call errors',
      isEOA: false,
      challenge: 'foo',
      challengeSign: 'foo',
      signingKeys: [keyB],
      authAddr: keyToAddress(keyA),
      mockContract: {
        authorizedKey: privateToPublic(keyB),
        address: keyToAddress(keyA),
        errorIsValidSignature: true,
      },
      expectedAuthorizedSignerError: true,
      expectedAuthorizedSigner: false,
    },
  ];

  testCases.forEach((test) =>
    it(test.title, async () => {
      const dappAuth = new DappAuth(
        new ProviderMock(new ContractMock(test.mockContract)),
      );

      const signatureFunc = test.isEOA
        ? signEOAPersonalMessage
        : signERC1654PersonalMessage;

      const signatures = `0x${test.signingKeys
        .map((signingKey) =>
          stripHexPrefix(
            signatureFunc(test.challengeSign, signingKey, test.authAddr),
          ),
        )
        .join('')}`;

      let isError = false;
      let isAuthorizedSigner = false;
      try {
        isAuthorizedSigner = await dappAuth.isAuthorizedSigner(
          test.challenge,
          signatures,
          test.authAddr,
        );
      } catch (error) {
        isError = true;
      }

      equal(isError, test.expectedAuthorizedSignerError);
      equal(isAuthorizedSigner, test.expectedAuthorizedSigner);
    }),
  );

  it('It should decode challenge as utf8 by default when decoding challenges', async function() {
    const dappAuth = new DappAuth(
      new ProviderMock(
        new ContractMock({
          authorizedKey: null,
          address: null,
          errorIsValidSignature: false,
        }),
      ),
    );

    const eoaHash = dappAuth._hashEOAPersonalMessage('foo');
    equal(
      `0x${eoaHash.toString('hex')}`,
      '0x76b2e96714d3b5e6eb1d1c509265430b907b44f72b2a22b06fcd4d96372b8565',
    );

    const scHash = dappAuth._hashSCMessage('foo');
    equal(
      `0x${scHash.toString('hex')}`,
      '0x41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d',
    );
  });

  // See https://github.com/MetaMask/eth-sig-util/issues/60
  it('It should decode challenge as hex if hex is detected when decoding challenges', async function() {
    const dappAuth = new DappAuth(
      new ProviderMock(
        new ContractMock({
          authorizedKey: null,
          address: null,
          errorIsValidSignature: false,
        }),
      ),
    );

    // result if 0xffff is decoded as hex:  13a6aa3102b2d639f36804a2d7c31469618fd7a7907c658a7b2aa91a06e31e47
    // result if 0xffff is decoded as utf8: 247aefb5d2e5b17fca61f786c779f7388485460c13e51308f88b2ff84ffa6851
    const eoaHash = dappAuth._hashEOAPersonalMessage('0xffff');
    equal(
      `0x${eoaHash.toString('hex')}`,
      '0x13a6aa3102b2d639f36804a2d7c31469618fd7a7907c658a7b2aa91a06e31e47',
    );

    // result if 0xffff is decoded as hex:  06d41322d79dfed27126569cb9a80eb0967335bf2f3316359d2a93c779fcd38a
    // result if 0xffff is decoded as utf8: f0443ea82539c5136844b0a175f544b7ee7bc0fc5ce940bad19f08eaf618af71
    const scHash = dappAuth._hashSCMessage('0xffff');
    equal(
      `0x${scHash.toString('hex')}`,
      '0x06d41322d79dfed27126569cb9a80eb0967335bf2f3316359d2a93c779fcd38a',
    );
  });

  // This test is needed for 100% coverage
  it('Invalid signature should fail', async function() {
    const dappAuth = new DappAuth(
      new ProviderMock(
        new ContractMock({
          authorizedKey: null,
          address: null,
          errorIsValidSignature: false,
        }),
      ),
    );

    const signatures = '0xinvalid-signature';

    let isError = false;
    let isAuthorizedSigner = false;
    try {
      isAuthorizedSigner = await dappAuth.isAuthorizedSigner(
        'foo',
        signatures,
        keyToAddress(keyA),
      );
    } catch (error) {
      isError = true;
    }

    equal(isError, true);
    equal(isAuthorizedSigner, false);
  });
});

describe('utils', function() {
  it('Should remove hex prefix if value is hex prefixed', function() {
    const value = 'foo';
    equal(removeHexPrefix(value), 'foo');
  });
});
