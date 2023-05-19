# Blocto JavaScript SDK

[![npm (lastest)](https://img.shields.io/npm/v/@blocto/sdk/latest)](https://www.npmjs.com/package/@blocto/sdk)
[![npm (beta)](https://img.shields.io/npm/v/@blocto/sdk/beta)](https://www.npmjs.com/package/@blocto/sdk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@blocto/sdk)](https://www.npmjs.com/package/@blocto/sdk)
[![Github Checks](https://github.com/portto/blocto-sdk/actions/workflows/test.yml/badge.svg)](https://github.com/portto/blocto-sdk/actions/workflows/test.yml)
[![npm downloads](https://img.shields.io/npm/dw/@blocto/sdk)](https://www.npmjs.com/package/@blocto/sdk)
[![LICENSE](https://img.shields.io/github/license/portto/blocto-sdk)](https://github.com/portto/blocto-sdk/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/720454370650619984.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.com/invite/QRZTr6yHmY)

Use Blocto SDK in your dApp to provide excellent user experience!

## Looking for the documentation?

[https://docs.blocto.app/blocto-sdk/javascript-sdk](https://docs.blocto.app/blocto-sdk/javascript-sdk)

## What can I do with Blocto SDK?

- Interact with multiple blockchains
  - Interact with Ethereum-compatible blockchains  
    Ethereum Mainnet & Goerli Testnet  
    Arbitrum Mainnet & Arbitrum Goerli Testnet  
    Optimism Mainnet & Optimism Goerli Testnet  
    Polygon Mainnet & Testnet  
    BNB Smart Chain Mainnet & Tetsnet  
    Avalanche Mainnet & Testnet
  - Interact with Aptos and Solana
  - Sign messages
  - Send transactions
  - ... and a lot more
- Seamless onboarding experience  
  Users can sign up easily with email and start exploring you dApp in seconds.
- Fee subsidization  
  You have the option to pay transaction fee for your users and provide a better experience. In that case, we will generate daily fee reports for you to review.
- Integrated payment  
  Get paid easily with our payment APIs. Users can pay easily with credit cards or other crypto currencies like Bitcoin, Ethereum, Tron, USDT, ...
- Connected to Blocto App  
  Once you've integrated with Blocto SDK, your users can manage their assets easily and securely through Blocto App. Your dApp can tap into the vast blockchain ecosystem instantly.

## Installing

```bash
$ yarn add @blocto/sdk
# or
$ npm i @blocto/sdk
```

## Usage

```ts
import BloctoSDK from '@blocto/sdk';

const bloctoSDK = new BloctoSDK({
  // advance settings please refer to docs
  ethereum: {
    // (required) chainId to be used
    chainId: '0x5',
    // (required for Ethereum) JSON RPC endpoint
    rpc: 'https://mainnet.infura.io/v3/YOUR_INFURA_ID',
  },

  // (optional) Blocto app ID
  appId: 'YOUR_BLOCTO_APP_ID',
});
```

## Testing on local

```
yarn

# generate local https cert
brew install mkcert
mkcert -install
cd dev-cert
mkcert localhost

# make dev directory
mkdir dev
ln -s src/main.js dev/main.js
```

## Scripts

`build`: build dist  
`start`: run live-reload dev server on `https://localhost:7777`

## Develop

open browser and navigate to `https://localhost:7777/test.html`
