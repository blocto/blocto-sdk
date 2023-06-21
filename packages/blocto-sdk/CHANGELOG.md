# @blocto/sdk

## 0.5.0-beta.0

### Minor Changes

- e180c58: Refactor ethereum provider to support EIP4337
- 0351fca: Migrate this.session to sessionStorage

### Patch Changes

- 68e1e82: Add a helper function ethereum.sendUserOperation with type-safe parameters
- 2f87cbf: Update dependencies
- 448c667: Send sdk version to authn url params
- d495e61: Fix: clean session storage in aptos and solana when disconnect
- c8a3b32: Fix eth_sendTransaction function
- f078a5f: Change @metamask/rpc-errors to eth-rpc-errors
- 26cc3e9: blocto_batchTransaction support web3 sendTx type
- cd1f781: Move session id to session storage
- 7830573: Help convert eth_sign and personal_sign msg to hex if is string

## 0.4.8

### Patch Changes

- 105381a: Fix insert iframe styles

## 0.4.7

### Patch Changes

- ebfb0da: Fix TypeScript types and eslint errors
- 0570b1e: Export types from Blocto SDK

## 0.4.7-beta.1

### Patch Changes

- 0570b1e: Export types from Blocto SDK

## 0.4.7-beta.0

### Patch Changes

- ebfb0da: Fix TypeScript types and eslint errors

## 0.4.6

### Patch Changes

- 76a1b11: Add goerli support

## 0.4.5

### Patch Changes

- 8313b19: Format signing message payload for Aptos
- 6e2cd2c: iframe z-index adjust to the highest
- 8188f4f: Remove invariant lib prevent process undefined
- 4da58d8: Fix incorrect session id error when the user logs in/out on the different chains
- 655d1ca: Fix the formatting funciton for Aptos signing message

## 0.4.5-beta.0

### Patch Changes

- 8188f4f: Remove invariant lib prevent process undefined

## 0.4.4

### Patch Changes

- f45f39e: signTypeData condition
- 8285743: Migrate with monorepo and changeset
- 4cd7b21: switchChain handler

## 0.4.4-beta.2

### Patch Changes

- f45f39e: signTypeData condition

## 0.4.4-beta.1

### Patch Changes

- 4cd7b21: switchChain handler

## 0.4.4-beta.0

### Patch Changes

- 8285743: Migrate with monorepo and changeset
