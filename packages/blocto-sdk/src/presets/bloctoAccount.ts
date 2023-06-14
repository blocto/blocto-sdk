import { ethers, BigNumberish, BytesLike } from 'ethers';
import bloctoAccountAbi from '../lib/BloctoAccountABI';

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
