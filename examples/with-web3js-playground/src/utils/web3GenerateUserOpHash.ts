import { encodeParameters } from "web3-eth-abi";
import { AbiInput } from "web3-types";
import { sha3 } from "web3-utils";

interface UserOperation {
  sender: string;
  nonce: string;
  init_code: string;
  call_data: string;
  call_gas_limit: string;
  verification_gas_limit: string;
  pre_verification_gas: string;
  max_fee_per_gas: string;
  max_priority_fee_per_gas: string;
  paymaster_and_data: string;
  signature: string;
}

const sha3Checked = (data: string): string => {
  const result = sha3(data);
  if (result === undefined) {
    throw new Error(`sha3 returned undefined for data: ${data}`);
  }
  return result;
};

const generateUserOpHash = (
  userOp: UserOperation,
  entryPoint: string,
  chainId: string
) => {
  try {
    const types: AbiInput[] = [
      "address",
      "uint256",
      "bytes32",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
    ];

    const values: (string | number)[] = [
      userOp.sender,
      userOp.nonce,
      sha3Checked(userOp.init_code),
      sha3Checked(userOp.call_data),
      userOp.call_gas_limit,
      userOp.verification_gas_limit,
      userOp.pre_verification_gas,
      userOp.max_fee_per_gas,
      userOp.max_priority_fee_per_gas,
      sha3Checked(userOp.paymaster_and_data),
    ];

    const packed: string = encodeParameters(types, values);

    const enctype: AbiInput[] = ["bytes32", "address", "uint256"];
    const encValues: string[] = [sha3Checked(packed), entryPoint, chainId];
    const enc = encodeParameters(enctype, encValues);

    return sha3Checked(enc);
  } catch (error) {
    console.error(error);
    return error;
  }
};

export default generateUserOpHash;
