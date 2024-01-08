import { fromRpcSig, ecrecover, publicToAddress } from 'ethereumjs-util';
import abi from 'ethereumjs-abi';
import { Buffer } from 'safe-buffer';
import { generateErc191MessageHash } from './test-utils.js';

const { rawDecode } = abi;
// bytes4(keccak256("isValidSignature(bytes32,bytes)")
const ERC1271_METHOD_SIG = '1626ba7e';

export default class MockContract {
  constructor(options) {
    this.authorizedKey = options.authorizedKey;
    this.address = options.address;
    this.errorIsValidSignature = options.errorIsValidSignature;
  }

  static _true() {
    return `0x${ERC1271_METHOD_SIG}00000000000000000000000000000000000000000000000000000000`; // a.k.a the "magic value".
  }

  static _false() {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  // @param {String} methodCall
  // @param {String} methodParams
  // @return {String}
  run(methodCall, methodParams) {
    switch (methodCall) {
      case ERC1271_METHOD_SIG: {
        const [hash, signature] = rawDecode(
          ['bytes32', 'bytes'],
          Buffer.from(methodParams, 'hex'),
          );
          return this._1626ba7e(hash, signature);
        }
      default:
        throw new Error(`Unexpected method ${methodCall}`);
    }
  }

  // "isValidSignature" method call
  // @param {Buffer} hash
  // @param {Buffer} signature
  // @return {String}
  _1626ba7e(hash, signature) {
    if (this.errorIsValidSignature) {
      throw new Error('isValidSignature call returned an error');
    }
    // split to 65 bytes (130 hex) chunks
    const multi_sigs = signature.toString('hex').match(/.{1,130}/g);

    // TODO: is it first or last?
    const expected_authrorised_sig = multi_sigs[0];

    // Get the address of whoever signed this message
    const { v, r, s } = fromRpcSig(`0x${expected_authrorised_sig}`);
    const erc191MessageHash = generateErc191MessageHash(hash, this.address);
    const recoveredKey = ecrecover(erc191MessageHash, v, r, s);
    const recoveredAddress = publicToAddress(recoveredKey);

    const expectedAddress = publicToAddress(this.authorizedKey);

    if (recoveredAddress.toString() === expectedAddress.toString()) {
      return MockContract._true();
    }

    return MockContract._false();
  }
}
