# @blocto/sdk

## 0.5.2

### Patch Changes

- 7d24f77: fix: handle if switch chain rejected

## 0.5.1

### Patch Changes

- f019a52: feat: help disconnect providers when get "incorrect_session_id" event
- 80590d9: Emit accountChanged event if switch chain return different account
- 2c598f5: adjust iframe style

## 0.5.0

### Minor Changes

- e180c58: Refactor ethereum provider to support EIP4337
- 9630860: Migrate this.session to sessionStorage

### Patch Changes

- 22ed496: fix: handle if sendUserOp call before enable
- 68e1e82: Add a helper function ethereum.sendUserOperation with type-safe parameters
- 2f87cbf: Update dependencies
- a83376b: Fix session id not updated when set storage
- 448c667: Send sdk version to authn url params
- 9285453: fix: remove storage if version unmet
- d495e61: Fix: clean session storage in aptos and solana when disconnect
- a4d99b1: Throw error if response not ok in responseSessionGuard
- 37e7db3: Add support for native ES6 import
- 652eefb: Throw error when user-operation api fail
- 17340c0: Fix internal rpc error code
- c8a3b32: Fix eth_sendTransaction function
- 5ea9bdd: Add ethereum chainChanged and disconnect event listener
- f078a5f: Change @metamask/rpc-errors to eth-rpc-errors
- c3485b6: fix: ethereum provider should emits ProviderRpcError when disconnect
- 9c2d4bc: fix: handle switchEthereumChain with existedSDK
- a94fdba: Support multiple params of wallet_addEthereumChain method
- 26cc3e9: blocto_batchTransaction support web3 sendTx type
- 8a5b40b: fix: wrong chainId after switch chain
- cd1f781: Move session id to session storage
- 7830573: Help convert eth_sign and personal_sign msg to hex if is string
- 17cf594: Fix unstandard errors in ethereum provider
- 05848f8: Replace rollup polyfill plugin with rollup-plugin-polyfill-node

## 0.5.0-beta.14

### Patch Changes

- 22ed496: fix: handle if sendUserOp call before enable

## 0.5.0-beta.13

### Patch Changes

- 9285453: fix: remove storage if version unmet

## 0.5.0-beta.12

### Patch Changes

- 8a5b40b: fix: wrong chainId after switch chain

## 0.5.0-beta.11

### Patch Changes

- Replace rollup polyfill plugin with rollup-plugin-polyfill-node

## 0.5.0-beta.10

### Patch Changes

- Add support for native ES6 import

## 0.5.0-beta.9

### Patch Changes

- 9c2d4bc: fix: handle switchEthereumChain with existedSDK

## 0.5.0-beta.8

### Patch Changes

- c3485b6: fix: ethereum provider should emits ProviderRpcError when disconnect

## 0.5.0-beta.7

### Patch Changes

- a83376b: Fix session id not updated when set storage

## 0.5.0-beta.6

### Patch Changes

- Throw error if response not ok in responseSessionGuard

## 0.5.0-beta.5

### Patch Changes

- 652eefb: Throw error when user-operation api fail
- 5ea9bdd: Add ethereum chainChanged and disconnect event listener
- 17cf594: Fix unstandard errors in ethereum provider

## 0.5.0-beta.3

### Patch Changes

- 17340c0: Fix internal rpc error code

## 0.5.0-beta.1

### Patch Changes

- a94fdba: Support multiple params of wallet_addEthereumChain method

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

## 0.4.9

### Patch Changes

- 17ead9c: aptos login condition

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
