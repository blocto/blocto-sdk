import { ethers, BigNumberish, BytesLike } from 'ethers';
const bloctoAccountAbi = [
  'function execute(address dest, uint256 value, bytes func)',
  'function executeBatch(address[] dest, uint256[] value, bytes[] func)',
];

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
