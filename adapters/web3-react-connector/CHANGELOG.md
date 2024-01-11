# @blocto/web3-react-connector

## 1.0.6-beta.0

### Patch Changes

- 4ea8a07: fix web3-react-connector duplicate authn popup
- Updated dependencies [4ea8a07]
  - @blocto/sdk@0.9.1-beta.0

## 1.0.5

### Patch Changes

- b9dac7d: support web3js v4
- 8d0b5bf: enhance in-app-sdk event support
- 00a3832: sendAsync can send another requests
- eb72d1c: fix unhandle user reject error
- Updated dependencies [b9dac7d]
- Updated dependencies [8d0b5bf]
- Updated dependencies [55afe21]
- Updated dependencies [3017eb1]
- Updated dependencies [00a3832]
- Updated dependencies [aa28bf6]
- Updated dependencies [d34fca2]
  - @blocto/sdk@0.9.0

## 1.0.5-beta.2

### Patch Changes

- b9dac7d: support web3js v4
- 00a3832: sendAsync can send another requests
- Updated dependencies [b9dac7d]
- Updated dependencies [55afe21]
- Updated dependencies [3017eb1]
- Updated dependencies [00a3832]
  - @blocto/sdk@0.9.0-beta.2

## 1.0.5-beta.1

### Patch Changes

- eb72d1c: fix unhandle user reject error
- Updated dependencies [aa28bf6]
  - @blocto/sdk@0.8.1-beta.1

## 1.0.5-beta.0

### Patch Changes

- 8d0b5bf: enhance in-app-sdk event support
- Updated dependencies [8d0b5bf]
  - @blocto/sdk@0.8.1-beta.0

## 1.0.4

### Patch Changes

- Updated dependencies [a4d3fbd]
  - @blocto/sdk@0.8.0

## 1.0.3

### Patch Changes

- 4835522: Fix export unreconize type for old typescript
- 1d05082: refactor: adjust web3-react-connector's activate method to comply with @blocto/sdk's changes
- Updated dependencies [58ef7a0]
- Updated dependencies [4835522]
- Updated dependencies [e742f66]
  - @blocto/sdk@0.7.1

## 1.0.3-beta.0

### Patch Changes

- 4835522: Fix export unreconize type for old typescript
- Updated dependencies [4835522]
- Updated dependencies [e742f66]
  - @blocto/sdk@0.7.1-beta.0

## 1.0.2

### Patch Changes

- 2515a8f: Fix wrongly disconnect chain when account not changed
- b40fbed: Fix skip calling enable() when request wallet_disconnect method
- 4c769f9: Clear error message when add not supported chain
- 0c915f5: Fix clear error if active with mismatch chainId
- bbf2160: Make loadSwitchableNetwork rpcUrls optional
- 9c7abcc: Fix attempt to add chain even only chain id is passed
- a3b0243: Seperate evm accounts from other chains in storage data structure
- Updated dependencies [2515a8f]
- Updated dependencies [b40fbed]
- Updated dependencies [4c769f9]
- Updated dependencies [bbf2160]
- Updated dependencies [a3b0243]
- Updated dependencies [1288bd1]
  - @blocto/sdk@0.7.0

## 1.0.2-beta.1

### Patch Changes

- 2515a8f: Fix wrongly disconnect chain when account not changed
- Updated dependencies [2515a8f]
  - @blocto/sdk@0.7.0-beta.1

## 1.0.2-beta.0

### Patch Changes

- b40fbed: Fix skip calling enable() when request wallet_disconnect method
- 4c769f9: Clear error message when add not supported chain
- 0c915f5: Fix clear error if active with mismatch chainId
- bbf2160: Make loadSwitchableNetwork rpcUrls optional
- 9c7abcc: Fix attempt to add chain even only chain id is passed
- a3b0243: Seperate evm accounts from other chains in storage data structure
- Updated dependencies [b40fbed]
- Updated dependencies [4c769f9]
- Updated dependencies [bbf2160]
- Updated dependencies [a3b0243]
- Updated dependencies [1288bd1]
  - @blocto/sdk@0.7.0-beta.0

## 1.0.1

### Patch Changes

- 21097d9: Fix switch chain is connected logic
- e0e8fb7: Add switch chain hint ui for evm-provider
- 55f3395: Fix go login flow when switching to a different blocto server
- 3ceb547: Fix skip switch chain if provide same id as current
- 21097d9: Fix disconnect all evm chains when disconnect
- 21097d9: Fix wrong switch chain url
- 21097d9: Fix switch chain login logic
- 21097d9: Fix emit disconnect event when switch chain approved but failed
- Updated dependencies [21097d9]
- Updated dependencies [e0e8fb7]
- Updated dependencies [6e427b1]
- Updated dependencies [34a23e4]
- Updated dependencies [55f3395]
- Updated dependencies [3ceb547]
- Updated dependencies [21097d9]
- Updated dependencies [21097d9]
- Updated dependencies [21097d9]
- Updated dependencies [21097d9]
- Updated dependencies [494ded1]
  - @blocto/sdk@0.6.0

## 1.0.1-beta.7

### Patch Changes

- 55f3395: Fix go login flow when switching to a different blocto server
- Updated dependencies [6e427b1]
- Updated dependencies [55f3395]
- Updated dependencies [494ded1]
  - @blocto/sdk@0.6.0-beta.7

## 1.0.1-beta.6

### Patch Changes

- 3ceb547: Fix skip switch chain if provide same id as current
- Updated dependencies [34a23e4]
- Updated dependencies [3ceb547]
  - @blocto/sdk@0.6.0-beta.6

## 1.0.1-beta.5

### Patch Changes

- 39754e5: Fix disconnect all evm chains when disconnect
- Updated dependencies [39754e5]
  - @blocto/sdk@0.6.0-beta.5

## 1.0.1-beta.4

### Patch Changes

- 6acf18d: Fix switch chain is connected logic
- Updated dependencies [6acf18d]
  - @blocto/sdk@0.6.0-beta.4

## 1.0.1-beta.3

### Patch Changes

- 84d6727: Fix emit disconnect event when switch chain approved but failed
- Updated dependencies [84d6727]
  - @blocto/sdk@0.6.0-beta.3

## 1.0.1-beta.2

### Patch Changes

- a0cc54c: Fix switch chain login logic
- Updated dependencies [a0cc54c]
  - @blocto/sdk@0.6.0-beta.2

## 1.0.1-beta.1

### Patch Changes

- 0d5bfd5: Fix wrong switch chain url
- Updated dependencies [0d5bfd5]
  - @blocto/sdk@0.6.0-beta.1

## 1.0.1-beta.0

### Patch Changes

- e0e8fb7: Add switch chain hint ui for evm-provider
- Updated dependencies [e0e8fb7]
  - @blocto/sdk@0.6.0-beta.0

## 1.0.0

### Major Changes

- 36c10c5: Update web3-react-connector to support web3-react v8

### Patch Changes

- fec7693: Seperate EVM provider read-only methods
- dca87b8: Fix 'connect' event handler payload type
- 5e67333: Change building tool to tsup
- b9f1eca: Handle EVM switch chain if not connected.
- 2cacc63: Fix evm switch chain is connected logic
- Updated dependencies [abd96b2]
- Updated dependencies [fec7693]
- Updated dependencies [dca87b8]
- Updated dependencies [b9f1eca]
- Updated dependencies [2cacc63]
  - @blocto/sdk@0.5.5

## 1.0.0-beta.4

### Patch Changes

- Change building tool to tsup

## 1.0.0-beta.3

### Major Changes

- 36c10c5: Update web3-react-connector to support web3-react v8

## 0.5.4-beta.2

### Patch Changes

- Fix evm switch chain is connected logic
- Updated dependencies
  - @blocto/sdk@0.5.5-beta.2

## 0.5.4-beta.1

### Patch Changes

- Handle EVM switch chain if not connected.
- Updated dependencies
  - @blocto/sdk@0.5.5-beta.1

## 0.5.4-beta.0

### Patch Changes

- fec7693: Seperate EVM provider read-only methods
- Updated dependencies [fec7693]
  - @blocto/sdk@0.5.5-beta.0

## 0.5.3

### Patch Changes

- Updated dependencies [6ae5c63]
- Updated dependencies [438b66e]
- Updated dependencies [a21d79b]
  - @blocto/sdk@0.5.4

## 0.5.3-beta.0

### Patch Changes

- Updated dependencies [6ae5c63]
- Updated dependencies [438b66e]
- Updated dependencies [a21d79b]
  - @blocto/sdk@0.5.4-beta.0

## 0.5.2

### Patch Changes

- 7d24f77: fix: handle if switch chain rejected
- Updated dependencies [7d24f77]
  - @blocto/sdk@0.5.2

## 0.5.1

### Patch Changes

- f019a52: feat: help disconnect providers when get "incorrect_session_id" event
- 80590d9: Emit accountChanged event if switch chain return different account
- Updated dependencies [f019a52]
- Updated dependencies [80590d9]
- Updated dependencies [2c598f5]
  - @blocto/sdk@0.5.1

## 0.5.0

### Minor Changes

- 9329e0a: Update core SDK dependency

### Patch Changes

- 22ed496: fix: handle if sendUserOp call before enable
- 2f87cbf: Update dependencies
- 37e7db3: Add support for native ES6 import
- c8a3b32: Fix eth_sendTransaction function
- 8a5b40b: fix: wrong chainId after switch chain
- cd1f781: Move session id to session storage
- 05848f8: Replace rollup polyfill plugin with rollup-plugin-polyfill-node
- Updated dependencies [22ed496]
- Updated dependencies [68e1e82]
- Updated dependencies [2f87cbf]
- Updated dependencies [a83376b]
- Updated dependencies [448c667]
- Updated dependencies [9285453]
- Updated dependencies [d495e61]
- Updated dependencies [a4d99b1]
- Updated dependencies [37e7db3]
- Updated dependencies [652eefb]
- Updated dependencies [17340c0]
- Updated dependencies [c8a3b32]
- Updated dependencies [5ea9bdd]
- Updated dependencies [f078a5f]
- Updated dependencies [e180c58]
- Updated dependencies [c3485b6]
- Updated dependencies [9c2d4bc]
- Updated dependencies [a94fdba]
- Updated dependencies [26cc3e9]
- Updated dependencies [8a5b40b]
- Updated dependencies [9630860]
- Updated dependencies [cd1f781]
- Updated dependencies [7830573]
- Updated dependencies [17cf594]
- Updated dependencies [05848f8]
  - @blocto/sdk@0.5.0

## 0.5.0-beta.5

### Patch Changes

- 22ed496: fix: handle if sendUserOp call before enable
- Updated dependencies [22ed496]
  - @blocto/sdk@0.5.0-beta.14

## 0.5.0-beta.4

### Patch Changes

- 8a5b40b: fix: wrong chainId after switch chain
- Updated dependencies [8a5b40b]
  - @blocto/sdk@0.5.0-beta.12

## 0.5.0-beta.3

### Patch Changes

- Replace rollup polyfill plugin with rollup-plugin-polyfill-node
- Updated dependencies
  - @blocto/sdk@0.5.0-beta.11

## 0.5.0-beta.2

### Patch Changes

- Add support for native ES6 import
- Updated dependencies
  - @blocto/sdk@0.5.0-beta.10

## 0.5.0-beta.1

### Minor Changes

- Update core SDK dependency

## 0.4.4-beta.0

### Patch Changes

- 2f87cbf: Update dependencies
- c8a3b32: Fix eth_sendTransaction function
- cd1f781: Move session id to session storage
- Updated dependencies [68e1e82]
- Updated dependencies [2f87cbf]
- Updated dependencies [448c667]
- Updated dependencies [d495e61]
- Updated dependencies [c8a3b32]
- Updated dependencies [f078a5f]
- Updated dependencies [e180c58]
- Updated dependencies [26cc3e9]
- Updated dependencies [0351fca]
- Updated dependencies [cd1f781]
- Updated dependencies [7830573]
  - @blocto/sdk@0.5.0-beta.0

## 0.4.3

### Patch Changes

- ebfb0da: Fix TypeScript types and eslint errors
- Updated dependencies [ebfb0da]
- Updated dependencies [0570b1e]
  - @blocto/sdk@0.4.7

## 0.4.3-beta.0

### Patch Changes

- ebfb0da: Fix TypeScript types and eslint errors
- Updated dependencies [ebfb0da]
  - @blocto/sdk@0.4.7-beta.0

## 0.4.2

### Patch Changes

- 76a1b11: Add goerli support
- Updated dependencies [76a1b11]
  - @blocto/sdk@0.4.6

## 0.4.1

### Patch Changes

- 8313b19: Format signing message payload for Aptos
- 8188f4f: Remove invariant lib prevent process undefined
- 4da58d8: Fix incorrect session id error when the user logs in/out on the different chains
- 655d1ca: Fix the formatting funciton for Aptos signing message
- Updated dependencies [8313b19]
- Updated dependencies [6e2cd2c]
- Updated dependencies [8188f4f]
- Updated dependencies [4da58d8]
- Updated dependencies [655d1ca]
  - @blocto/sdk@0.4.5

## 0.4.1-beta.0

### Patch Changes

- 8188f4f: Remove invariant lib prevent process undefined
- Updated dependencies [8188f4f]
  - @blocto/sdk@0.4.5-beta.0

## 0.4.0

### Patch Changes

- 8285743: Migrate with monorepo and changeset
- 53fbf7f: Changed to newest @blocto/sdk dependencies
- Updated dependencies [f45f39e]
- Updated dependencies [8285743]
- Updated dependencies [4cd7b21]
  - @blocto/sdk@0.4.4

## 0.4.0-beta.1

### Patch Changes

- 53fbf7f: Changed to newest @blocto/sdk dependencies

## 0.4.0-beta.0

### Patch Changes

- 8285743: Migrate with monorepo and changeset
- Updated dependencies [8285743]
  - @blocto/sdk@0.4.4-beta.0
