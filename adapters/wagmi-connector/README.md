# wagmi-connector

The `BloctoConnector` extends from the [wagmi](https://wagmi.sh/) `Connector`, allowing Blocto to be used with the most popular **Connect Wallet kits** (such as Web3Modal, ConnectKit, etc.) as solutions.

For usage, please refer to below links:
- [Blocto SDK Integrate with Web3Modal](https://docs.blocto.app/blocto-sdk/javascript-sdk/evm-sdk/integrate-with-web3modal)
- [Blocto SDK Integrate with RainbowKit](https://docs.blocto.app/blocto-sdk/javascript-sdk/evm-sdk/integrate-with-rainbowkit)
- [Blocto SDK Integrate with thirdweb](https://docs.blocto.app/blocto-sdk/javascript-sdk/evm-sdk/integrate-with-thirdweb)

## Migration Guide
If you are coming from an earlier version of `@blocto/wagmi-connector`,
you can see breaking changes in the list below.

### 1.2.0 Breaking Changes
1. Removed `BloctoWeb3modalConfig` exported; instead, we use `@blocto/web3modal-connector` to replace support for **Web3Modal**

```bash
npm uninstall @blocto/wagmi-connector
npm install @blocto/web3modal-connector
```

2. Removed `chainId` & `rpc` parameters from `BloctoConnector` constructor.

```diff
- new BloctoConnector({ chains, options: { appId, chainId, rpc } })
+ new BloctoConnector({ chains, options: { appId } })
```

## Usage

```
yarn add @blocto/wagmi-connector
```

## Development

### Install Dependencies

```bash
yarn
```

### Build

```
yarn build
```
