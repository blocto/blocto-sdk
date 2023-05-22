<p align="center">
   <a href="https://github.com/portto/blocto-sdk">
    <img src="https://github.com/portto/blocto-sdk/assets/4176802/0de20f6e-4733-4970-b442-3344e44cc6a2" alt="Blocto logo" />
   </a>
</p>

# Blocto JavaScript SDK

[![npm (lastest)](https://img.shields.io/npm/v/@blocto/sdk/latest)](https://www.npmjs.com/package/@blocto/sdk)
[![npm (beta)](https://img.shields.io/npm/v/@blocto/sdk/beta)](https://www.npmjs.com/package/@blocto/sdk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@blocto/sdk)](https://www.npmjs.com/package/@blocto/sdk)
[![Github Checks](https://github.com/portto/blocto-sdk/actions/workflows/test.yml/badge.svg)](https://github.com/portto/blocto-sdk/actions/workflows/test.yml)
[![npm downloads](https://img.shields.io/npm/dw/@blocto/sdk)](https://www.npmjs.com/package/@blocto/sdk)
[![LICENSE](https://img.shields.io/github/license/portto/blocto-sdk)](https://github.com/portto/blocto-sdk/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/720454370650619984.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.com/invite/QRZTr6yHmY)

This is a monorepo of Blocto JavaScript SDK. Check out the docs here: [docs.blocto.app](https://docs.blocto.app/).

There are some adapters to make it easier to integrate:
|lib name|npm|
|-|-|
|[@blocto/aptos-wallet-adapter-plugin](./adapters/aptos-wallet-adapter-plugin/)|[![npm (lastest)](https://img.shields.io/npm/v/@blocto/aptos-wallet-adapter-plugin/latest)](https://www.npmjs.com/package/@blocto/aptos-wallet-adapter-plugin)|
|[@blocto/web3-react-connector](./adapters/web3-react-connector/)|[![npm (lastest)](https://img.shields.io/npm/v/@blocto/web3-react-connector/latest)](https://www.npmjs.com/package/@blocto/web3-react-connector)|
|[@blocto/wagmi-connector](./adapters/wagmi-connector/)|[![npm (lastest)](https://img.shields.io/npm/v/@blocto/wagmi-connector/latest)](https://www.npmjs.com/package/@blocto/wagmi-connector)|
|[@blocto/rainbowkit-connector](./adapters/rainbowkit-connector/)|[![npm (lastest)](https://img.shields.io/npm/v/@blocto/rainbowkit-connector/latest)](https://www.npmjs.com/package/@blocto/rainbowkit-connector)|

## What's inside?

This repo includes the following packages/apps:

### Apps and Packages

- `packages`: shared packages
- `adapters`: adapters using Blocto JavaScript SDK
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Repo structure

```
blocto-sdk
├─ packages
│  ├─ @blocto/sdk
│  │  └─ package.json
│  ├─ tsconfig
│  │  └─ package.json
│  └─ eslint-config-custom
│     └─ package.json
├─ adapters
│  ├─ @blocto/aptos-wallet-adapter-plugin
│  │  └─ package.json
│  ├─ @blocto/rainbowkit-connector
│  │  └─ package.json
│  └─ @blocto/wagmi-connector
│  │  └─ package.json
│  ├─ @blocto/web3-react-connector
│  │  └─ package.json
└─ package.json
```

## Build

To build all apps and packages, run the following command:

```
yarn build
```

## Contributing

Feel like contributing? That's awesome! We have a
[contributing guide](./CONTRIBUTING.md) to help guide you.

## Add changeset

1. Run the command line script `yarn changeset`.
2. Select the packages you want to include in the changeset using ↑ and ↓ to navigate to packages, and space to select a package. Hit enter when all desired packages are selected.
3. You will be prompted to select a bump type for each selected package. Select an appropriate bump type for the changes made. See [here](https://semver.org/) for information on semver versioning
4. Your final prompt will be to provide a message to go alongside the changeset. This will be written into the changelog when the next release occurs.
   After this, a new changeset will be added which is a markdown file with YAML front matter.

```
-| .changeset/
-|-| UNIQUE_ID.md
```

The message you typed can be found in the markdown file. If you want to expand on it, you can write as much markdown as you want, which will all be added to the changelog on publish. If you want to add more packages or change the bump types of any packages, that's also fine.

While not every changeset is going to need a huge amount of detail, a good idea of what should be in a changeset is:

- WHAT the change is
- WHY the change was made
- HOW a consumer should update their code

5. Once you are happy with the changeset, commit the file to your branch.

### Tips on adding changesets

#### You can add more than one changeset to a pull request

Changesets are designed to stack, so there's no problem with adding multiple. You might want to add more than one changeset when:

- You want to release multiple packages with different changelog entries
- You have made multiple changes to a package that should each be called out separately


