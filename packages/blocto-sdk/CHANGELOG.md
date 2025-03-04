# @blocto/sdk

## 0.10.4

### Patch Changes

- 79dade9: fix story tesnet url, fix multiple chain setting, update polygon url
- ec87223: support Story testnet
- 2e2164e: fix multiple chain setting

## 0.10.4-beta.1

### Patch Changes

- 2e2164e: fix multiple chain setting

## 0.10.4-beta.0

### Patch Changes

- ec87223: support Story testnet

## 0.10.3

### Patch Changes

- e066144: support Merlin Chain (BTC L2)

## 0.10.3-beta.0

### Patch Changes

- e066144: support Merlin Chain (BTC L2)

## 0.10.2

### Patch Changes

- e8251f0: migration testnet polygon_mumbai to polygon_amoy

## 0.10.1

### Patch Changes

- 97ac7d7: deprecate goerli testnet info

## 0.10.0

### Minor Changes

- bd6b11c: passing dApp's urlParams to login & authz Iframe
- 74abbd7: Add L2 Blast & Blast Sepolia Testnet

## 0.10.0-beta.1

### Minor Changes

- bd6b11c: passing dApp's urlParams to login & authz Iframe

## 0.10.0-beta.0

### Minor Changes

- 74abbd7: Add L2 Blast & Blast Sepolia Testnet

## 0.9.1

### Patch Changes

- 48fa07a: fix: handle existedSDK handle window not defined
- 4ea8a07: fix web3-react-connector duplicate authn popup

## 0.9.1-beta.1

### Patch Changes

- 48fa07a: fix: handle existedSDK handle window not defined

## 0.9.1-beta.0

### Patch Changes

- 4ea8a07: fix web3-react-connector duplicate authn popup

## 0.9.0

### Minor Changes

- 55afe21: support web3js version 4
- 3017eb1: Support load multiple chain configs in evm provider
- d34fca2: Add RPC endpoints for the L2 chains (Sepolia, Arbitrum Sepolia, Optimism Sepolia, Base, Base Goerli, Base Sepolia, Zora, Zora Goerli, Zora Sepolia, Scroll, Scroll Goerli, Scroll Sepolia, Linea, Linea Goerli and zKatana Sepolia)

### Patch Changes

- b9dac7d: support web3js v4
- 8d0b5bf: enhance in-app-sdk event support
- 00a3832: sendAsync can send another requests
- aa28bf6: add accountChanged eventListeners

## 0.9.0-beta.3

### Minor Changes

- d34fca2: Add RPC endpoints for the L2 chains (Sepolia, Arbitrum Sepolia, Optimism Sepolia, Base, Base Goerli, Base Sepolia, Zora, Zora Goerli, Zora Sepolia, Scroll, Scroll Goerli, Scroll Sepolia, Linea, Linea Goerli and zKatana Sepolia)

## 0.9.0-beta.2

### Minor Changes

- 55afe21: support web3js version 4
- 3017eb1: Support load multiple chain configs in evm provider

### Patch Changes

- b9dac7d: support web3js v4
- 00a3832: sendAsync can send another requests

## 0.8.1-beta.1

### Patch Changes

- aa28bf6: add accountChanged eventListeners

## 0.8.1-beta.0

### Patch Changes

- 8d0b5bf: enhance in-app-sdk event support

## 0.8.0

### Minor Changes

- a4d3fbd: disable eth_sign method

## 0.7.2

### Patch Changes

- 3baa074: add missing break statement

## 0.7.1

### Patch Changes

- 58ef7a0: adjust eth_accounts to not require prior enable

## 0.7.1-beta.0

### Patch Changes

- 4835522: Fix export unreconize type for old typescript
- e742f66: AccountChange use addSelfRemovableHandler

## 0.7.0

### Minor Changes

- a3b0243: Seperate evm accounts from other chains in storage data structure

### Patch Changes

- 2515a8f: Fix wrongly disconnect chain when account not changed
- b40fbed: Fix skip calling enable() when request wallet_disconnect method
- 4c769f9: Clear error message when add not supported chain
- bbf2160: Make loadSwitchableNetwork rpcUrls optional
- 1288bd1: Seperate evm accounts from other chains in storage data structure

## 0.7.0-beta.1

### Patch Changes

- 2515a8f: Fix wrongly disconnect chain when account not changed

## 0.7.0-beta.0

### Minor Changes

- a3b0243: Disconnect other provider when receive account changed event

### Patch Changes

- b40fbed: Fix skip calling enable() when request wallet_disconnect method
- 4c769f9: Clear error message when add not supported chain
- bbf2160: Make loadSwitchableNetwork rpcUrls optional
- 1288bd1: Seperate evm accounts from other chains in storage data structure

## 0.6.0

### Minor Changes

- e0e8fb7: Add switch chain hint ui for evm-provider
- 34a23e4: DEPRECATED: Solana provider no longer supported and removed.

### Patch Changes

- 21097d9: Fix switch chain is connected logic
- 6e427b1: handle potential undefined when passing unsupported chainId into bloctoSDK
- 55f3395: Fix go login flow when switching to a different blocto server
- 3ceb547: Fix skip switch chain if provide same id as current
- 21097d9: Fix disconnect all evm chains when disconnect
- 21097d9: Fix wrong switch chain url
- 21097d9: Fix switch chain login logic
- 21097d9: Fix emit disconnect event when switch chain approved but failed
- 494ded1: enhance tx params check

## 0.6.0-beta.7

### Patch Changes

- 6e427b1: handle potential undefined when passing unsupported chainId into bloctoSDK
- 55f3395: Fix go login flow when switching to a different blocto server
- 494ded1: enhance tx params check

## 0.6.0-beta.6

### Minor Changes

- 34a23e4: DEPRECATED: Solana provider no longer supported and removed.

### Patch Changes

- 3ceb547: Fix skip switch chain if provide same id as current

## 0.6.0-beta.5

### Patch Changes

- 39754e5: Fix disconnect all evm chains when disconnect

## 0.6.0-beta.4

### Patch Changes

- 6acf18d: Fix switch chain is connected logic

## 0.6.0-beta.3

### Patch Changes

- 84d6727: Fix emit disconnect event when switch chain approved but failed

## 0.6.0-beta.2

### Patch Changes

- a0cc54c: Fix switch chain login logic

## 0.6.0-beta.1

### Patch Changes

- 0d5bfd5: Fix wrong switch chain url

## 0.6.0-beta.0

### Minor Changes

- e0e8fb7: Add switch chain hint ui for evm-provider

## 0.5.5

### Patch Changes

- abd96b2: Update aptos dependency to 1.15.0
- fec7693: Seperate EVM provider read-only methods
- dca87b8: Fix 'connect' event handler payload type
- b9f1eca: Handle EVM switch chain if not connected.
- 2cacc63: Fix evm switch chain is connected logic

## 0.5.5-beta.4

### Patch Changes

- dca87b8: Fix 'connect' event handler payload type

## 0.5.5-beta.3

### Patch Changes

- Update aptos dependency to 1.15.0

## 0.5.5-beta.2

### Patch Changes

- Fix evm switch chain is connected logic

## 0.5.5-beta.1

### Patch Changes

- Handle EVM switch chain if not connected.

## 0.5.5-beta.0

### Patch Changes

- fec7693: Seperate EVM provider read-only methods

## 0.5.4

### Patch Changes

- 6ae5c63: blocto wagmi connector enhancements
- 438b66e: feat: enhance detail error for evm provider
- a21d79b: Fix handleBundler send header without session id

## 0.5.4-beta.0

### Patch Changes

- 6ae5c63: blocto wagmi connector enhancements
- 438b66e: feat: enhance detail error for evm provider
- a21d79b: Fix handleBundler send header without session id

## 0.5.3

### Patch Changes

- dcc764b: hotfix: add jsonrpc in body when handling 4337 bundler request

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
