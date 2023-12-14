import Web3 from 'web3';
import { fromRpcSig, ecrecover, publicToAddress, bufferToHex, hashPersonalMessage, keccak } from 'ethereumjs-util';
import ERC1271 from './ABIs/ERC1271.js';
import { mergeErrors, isHexString, removeHexPrefix } from './utils.js';

// bytes4(keccak256("isValidSignature(bytes32,bytes)")
const ERC1271_MAGIC_VALUE = '0x1626ba7e';

export default class DappAuth {
  constructor(web3Provider) {
    this.web3 = new Web3(web3Provider);
  }

  async isAuthorizedSigner(challenge, signature, address) {
    const eoaChallengeHash = this._hashEOAPersonalMessage(challenge);
    let isAuthorizedDirectKey;
    let errEOA;

    // try direct-keyed wallet
    try {
      // Get the address of whoever signed this message
      const { v, r, s } = fromRpcSig(signature);
      const recoveredKey = ecrecover(eoaChallengeHash, v, r, s);
      const recoveredAddress = publicToAddress(recoveredKey);

      if (
        address.toLowerCase() ===
        bufferToHex(recoveredAddress).toLowerCase()
      ) {
        isAuthorizedDirectKey = true;
      }
    } catch (err) {
      errEOA = err;
      // if either direct-keyed auth flow threw an error, or it did not conclude to be authorized, proceed to try smart-contract wallet.
    }
    try {
      if (isAuthorizedDirectKey === true) return isAuthorizedDirectKey;
      // try smart-contract wallet
      const erc1271CoreContract = new this.web3.eth.Contract(ERC1271, address);

      // check persoonalSign hash first
      const magicValue = await erc1271CoreContract.methods
        .isValidSignature(eoaChallengeHash, signature)
        .call();
      if (magicValue === ERC1271_MAGIC_VALUE) {
        return true;
      } else {
        // then check SCMessage hash (ERC-1654)
        const magicValue2 = await erc1271CoreContract.methods
          .isValidSignature(this._hashSCMessage(challenge), signature)
          .call();

        return magicValue2 === ERC1271_MAGIC_VALUE;
      }
    } catch (err) {
      throw mergeErrors(errEOA, err);
    }
  }

  _hashEOAPersonalMessage(challenge) {
    return hashPersonalMessage(this._decodeChallenge(challenge));
  }

  // This is a hash just over the challenge. The smart contract takes this result and hashes on top to an erc191 hash.
  _hashSCMessage(challenge) {
    return keccak(this._decodeChallenge(challenge));
  }

  // See https://github.com/MetaMask/eth-sig-util/issues/60
  _decodeChallenge(challenge) {
    return isHexString(challenge)
      ? Buffer.from(removeHexPrefix(challenge), 'hex')
      : Buffer.from(challenge);
  }
}
