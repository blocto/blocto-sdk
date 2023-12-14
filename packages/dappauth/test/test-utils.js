import { randomBytes } from 'crypto';
import { Buffer } from 'safe-buffer';
import { keccak, ecsign, toRpcSig, hashPersonalMessage, toBuffer, stripHexPrefix, bufferToHex, privateToAddress } from 'ethereumjs-util';

// @param {Buffer/String} message
// @param {String} key the signing key
// @return {String} the address of the wallet (identity)
function signERC1654PersonalMessage(message, key, address) {
  // we hash once before erc191MessageHash as it will be transmitted to Ethereum nodes and potentially logged
  const messageHash = erc191MessageHash(keccak(message), address);
  const signature = ecsign(messageHash, key);
  return toRpcSig(signature.v, signature.r, signature.s);
}

// emulates what EOA wallets like MetaMask perform
function signEOAPersonalMessage(message, key) {
  const messageHash = hashPersonalMessage(toBuffer(message));
  const signature = ecsign(messageHash, key);
  return toRpcSig(signature.v, signature.r, signature.s);
}

// @param {Buffer} message
// @param {String} address
// @return {Buffer}
function erc191MessageHash(message, address) {
  const erc191Message = Buffer.concat([
    Buffer.from('19', 'hex'),
    Buffer.from('00', 'hex'),
    Buffer.from(stripHexPrefix(address), 'hex'),
    message,
  ]);
  return keccak(erc191Message);
}

function generateRandomKey() {
  return toBuffer(`0x${randomBytes(32).toString('hex')}`);
}

function keyToAddress(key) {
  return bufferToHex(privateToAddress(key));
}

export default {
  signERC1654PersonalMessage,
  signEOAPersonalMessage,
  erc191MessageHash,
  generateRandomKey,
  keyToAddress,
};
