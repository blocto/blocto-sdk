const jsonAbi = `[
  {
    "inputs": [],
    "name": "addDeposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "authVersion",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "authorizations",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
    "name": "delegates",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_authorizedAddress",
        "type": "address"
      },
      { "internalType": "uint256", "name": "_cosigner", "type": "uint256" }
    ],
    "name": "emergencyRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_authorizedAddress",
        "type": "address"
      },
      { "internalType": "uint256", "name": "_cosigner", "type": "uint256" },
      {
        "internalType": "address",
        "name": "_recoveryAddress",
        "type": "address"
      }
    ],
    "name": "emergencyRecovery2",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "entryPoint",
    "outputs": [
      { "internalType": "contract IEntryPoint", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
  {
    "inputs": [],
    "name": "getDeposit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNonce",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_authorizedAddress",
        "type": "address"
      },
      { "internalType": "uint256", "name": "_cosigner", "type": "uint256" },
      {
        "internalType": "address",
        "name": "_recoveryAddress",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "_mergedKeyIndexWithParity",
        "type": "uint8"
      },
      { "internalType": "bytes32", "name": "_mergedKey", "type": "bytes32" }
    ],
    "name": "init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "initialized",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "data", "type": "bytes" }],
    "name": "invoke0",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "v", "type": "uint8" },
      { "internalType": "bytes32", "name": "r", "type": "bytes32" },
      { "internalType": "bytes32", "name": "s", "type": "bytes32" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      {
        "internalType": "address",
        "name": "authorizedAddress",
        "type": "address"
      },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "invoke1CosignerSends",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "v", "type": "uint8" },
      { "internalType": "bytes32", "name": "r", "type": "bytes32" },
      { "internalType": "bytes32", "name": "s", "type": "bytes32" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "invoke1SignerSends",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint8[2]", "name": "v", "type": "uint8[2]" },
      { "internalType": "bytes32[2]", "name": "r", "type": "bytes32[2]" },
      { "internalType": "bytes32[2]", "name": "s", "type": "bytes32[2]" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      {
        "internalType": "address",
        "name": "authorizedAddress",
        "type": "address"
      },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "invoke2",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" },
      { "internalType": "bytes", "name": "_signature", "type": "bytes" }
    ],
    "name": "isValidSignature",
    "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "mergedKeys",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "nonces",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" },
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "name": "onERC1155Received",
    "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "name": "onERC721Received",
    "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_version", "type": "uint256" },
      { "internalType": "address[]", "name": "_keys", "type": "address[]" }
    ],
    "name": "recoverGas",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "recoveryAddress",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_authorizedAddress",
        "type": "address"
      },
      { "internalType": "uint256", "name": "_cosigner", "type": "uint256" },
      {
        "internalType": "uint8",
        "name": "_mergedIndexWithParity",
        "type": "uint8"
      },
      { "internalType": "bytes32", "name": "_mergedKey", "type": "bytes32" }
    ],
    "name": "setAuthorized",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes4", "name": "_interfaceId", "type": "bytes4" },
      { "internalType": "address", "name": "_delegate", "type": "address" }
    ],
    "name": "setDelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recoveryAddress",
        "type": "address"
      }
    ],
    "name": "setRecoveryAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }
    ],
    "name": "supportsInterface",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "bytes", "name": "", "type": "bytes" },
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "name": "tokensReceived",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      }
    ],
    "name": "upgradeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "sender", "type": "address" },
          { "internalType": "uint256", "name": "nonce", "type": "uint256" },
          { "internalType": "bytes", "name": "initCode", "type": "bytes" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" },
          {
            "internalType": "uint256",
            "name": "callGasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "verificationGasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "preVerificationGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "paymasterAndData",
            "type": "bytes"
          },
          { "internalType": "bytes", "name": "signature", "type": "bytes" }
        ],
        "internalType": "struct UserOperation",
        "name": "userOp",
        "type": "tuple"
      },
      { "internalType": "bytes32", "name": "userOpHash", "type": "bytes32" },
      {
        "internalType": "uint256",
        "name": "missingAccountFunds",
        "type": "uint256"
      }
    ],
    "name": "validateUserOp",
    "outputs": [
      { "internalType": "uint256", "name": "validationData", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "withdrawAddress",
        "type": "address"
      },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "withdrawDepositTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "stateMutability": "payable", "type": "receive" }
]`;

export default jsonAbi;
