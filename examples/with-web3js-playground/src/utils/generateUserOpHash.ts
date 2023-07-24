import { encodeParameters } from "web3-eth-abi";
import { Keccak as SHA3 } from "sha3";

const sha3Hash = (msg: string | Buffer) => {
  const sha = new SHA3(256);
  sha.update(typeof msg === "string" ? Buffer.from(msg, "hex") : msg);
  const hashed = sha.digest("hex");
  return hashed;
};

const strip0x = (str: string) => str.replace(/^0x/, "");
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

const generateUserOpHash = (
  userOp: UserOperation,
  entryPoint: string,
  chainId: string
) => {
  try {
    const packed = encodeParameters(
      [
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
      ],
      [
        userOp.sender,
        userOp.nonce,
        `0x${sha3Hash(strip0x(userOp.init_code))}`,
        `0x${sha3Hash(strip0x(userOp.call_data))}`,
        userOp.call_gas_limit,
        userOp.verification_gas_limit,
        userOp.pre_verification_gas,
        userOp.max_fee_per_gas,
        userOp.max_priority_fee_per_gas,
        `0x${sha3Hash(strip0x(userOp.paymaster_and_data))}`,
      ]
    );

    const enc = encodeParameters(
      ["bytes32", "address", "uint256"],
      [`0x${sha3Hash(strip0x(packed))}`, entryPoint, chainId]
    );

    return sha3Hash(strip0x(enc));
  } catch (error) {
    console.error(error);
    return error;
  }
};
export default generateUserOpHash;
