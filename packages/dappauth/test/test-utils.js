const crypto = require('crypto');
const Buffer = require('safe-buffer').Buffer;
const ethUtil = require('ethereumjs-util');

// @param {Buffer/String} message
// @param {String} key the signing key
// @return {String} the address of the wallet (identity)
function signERC1654PersonalMessage(message, key, address) {
  // we hash once before erc191MessageHash as it will be transmitted to Ethereum nodes and potentially logged
  const messageHash = erc191MessageHash(ethUtil.keccak(message), address);
  const signature = ethUtil.ecsign(messageHash, key);
  return ethUtil.toRpcSig(signature.v, signature.r, signature.s);
}

// emulates what EOA wallets like MetaMask perform
function signEOAPersonalMessage(message, key) {
  const messageHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(message));
  const signature = ethUtil.ecsign(messageHash, key);
  return ethUtil.toRpcSig(signature.v, signature.r, signature.s);
}

// @param {Buffer} message
// @param {String} address
// @return {Buffer}
function erc191MessageHash(message, address) {
  const erc191Message = Buffer.concat([
    Buffer.from('19', 'hex'),
    Buffer.from('00', 'hex'),
    Buffer.from(ethUtil.stripHexPrefix(address), 'hex'),
    message,
  ]);
  return ethUtil.keccak(erc191Message);
}

function generateRandomKey() {
  return ethUtil.toBuffer(`0x${crypto.randomBytes(32).toString('hex')}`);
}

function keyToAddress(key) {
  return ethUtil.bufferToHex(ethUtil.privateToAddress(key));
}

module.exports = {
  signERC1654PersonalMessage,
  signEOAPersonalMessage,
  erc191MessageHash,
  generateRandomKey,
  keyToAddress,
};
