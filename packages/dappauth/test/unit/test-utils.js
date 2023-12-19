import { randomBytes } from 'crypto';
import { Buffer } from 'safe-buffer';
import { keccak, ecsign, toRpcSig, hashPersonalMessage, toBuffer, stripHexPrefix, bufferToHex, privateToAddress } from 'ethereumjs-util';

export function stringToHex(str) {
  return bufferToHex(Buffer.from(str, 'utf8'));
}

/**
 * @param {Buffer} message 
 * @param {String} address 
 * @returns {Buffer}
 */
export function generateErc191MessageHash(message, address) {
  const erc191Message = Buffer.concat([
    Buffer.from('19', 'hex'),
    Buffer.from('00', 'hex'),
    Buffer.from(stripHexPrefix(address), 'hex'),
    message,
  ]);
  const r = keccak(erc191Message)
  return r;
}


/**
 * @param {Buffer | String} message 
 * @param {String} key 
 * @param {String} address 
 * @returns {String} the address of the wallet (identity)
 */
export function signERC1654PersonalMessage(message, key, address) {
  // we hash once before erc191MessageHash as it will be transmitted to Ethereum nodes and potentially logged
  const messageHash = generateErc191MessageHash(keccak(toBuffer(stringToHex(message))), address);
  const signature = ecsign(messageHash, key);
  return toRpcSig(signature.v, signature.r, signature.s);
}

// emulates what EOA wallets like MetaMask perform
export function signEOAPersonalMessage(message, key) {
  const messageHash = hashPersonalMessage(toBuffer(stringToHex(message)));
  const signature = ecsign(messageHash, key);
  return toRpcSig(signature.v, signature.r, signature.s);
}


export function generateRandomKey() {
  return toBuffer(`0x${randomBytes(32).toString('hex')}`);
}

export function keyToAddress(key) {
  return bufferToHex(privateToAddress(key));
}
