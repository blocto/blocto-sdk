import { ethers, BigNumberish, BytesLike } from 'ethers';
const bloctoAccountAbi = `[
    {
    "inputs": [
      { "internalType": "address", "name": "dest", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "bytes", "name": "func", "type": "bytes" }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "dest", "type": "address[]" },
      { "internalType": "uint256[]", "name": "value", "type": "uint256[]" },
      { "internalType": "bytes[]", "name": "func", "type": "bytes[]" }
    ],
    "name": "executeBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
]`;

const account = new ethers.Interface(bloctoAccountAbi);

export const bloctoAccount = {
  execute: (to: string, value: BigNumberish, data: BytesLike) => {
    return account.encodeFunctionData('execute', [to, value, data]);
  },
  executeBatch: (
    to: Array<string>,
    value: Array<BigNumberish>,
    data: Array<BytesLike>
  ) => {
    return account.encodeFunctionData('executeBatch', [to, value, data]);
  },
};
export default bloctoAccount;
