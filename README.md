# PLEASE NOTE, THIS PROJECT IS NO LONGER BEING MAINTAINED

<p align="center">
   <a href="https://github.com/portto/blocto-sdk">
    <img src="https://github.com/portto/blocto-sdk/assets/4176802/0de20f6e-4733-4970-b442-3344e44cc6a2" alt="Blocto logo" />
   </a>
</p>

# Blocto JavaScript SDK

> ⚠️ **Deprecation Notice**
>
> This repository is **no longer maintained** and has been officially deprecated.
>
> We recommend NOT using this SDK in new projects.
>
> For existing integrations, please be aware that no further updates, bug fixes, or support will be provided.
>
> **IMPORTANT**: As of June 11, 2025, all services associated with this SDK will be completely discontinued and existing integrations will cease to function.
>
> Thank you for your support and for being part of the Blocto developer community.

This is a monorepo of Blocto JavaScript SDK.

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
