# Contributing to Blocto JavaScript SDK

Thanks for showing interest to contribute to Blocto JavaScript SDK, you rock!

## When it comes to open source, there are different ways you can contribute, all of which are valuable. Here's a few guidelines that should help you as you prepare your contribution.

## Setup the Project

The following steps will get you up and running to contribute to Chakra UI:

1. Fork the repo (click the <kbd>Fork</kbd> button at the top right of
   [this page](https://github.com/portto/blocto-sdk))

2. Clone your fork locally

```sh
git clone https://github.com/<your_github_username>/blocto-sdk.git
cd blocto-sdk
```

3. Setup all the dependencies and packages by running `yarn`. This
   command will install dependencies.

## Development

To improve our development process, we've set up tooling and systems. Blocto JavaScript SDK is a monorepo built with [turbo](https://turbo.build/repo/docs) and follows its file structure convention. The repo has 2 workspaces `adapters` and `packages`.

### Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat`: all changes that introduce completely new code or new
  features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for
  usage of a lib or cli usage)
- `build`: all changes regarding the build of the software, changes to
  dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e.
  github actions, ci system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/ or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

### Creating a Pull Request

You are welcome to create a pull reuqest against the `develop` branch. The beta release channel goes here. When it's stable, we will pack it all and release in stable channel.

Before creating a PR

1. Make sure your branch is up to date with the `develop` branch
2. On the `root` folder, run `yarn`
3. On the `root` folder, run `yarn build`
4. If a pull request created needs to bump a package version, please see [Changesets](#Changesets) part and add a changesets.

If everything passes, you should be able to create a PR.

#### Changesets

We use [changesets](https://github.com/changesets/changesets) to handle any changes in the `changelog`.
If a pull request created needs to bump a package version, please follow those steps to create a `changelog`

1. On the `root` folder, run `yarn changeset` and follow the prompt instructions (we follow [SemVer](https://semver.org/))
   > Tips: Skip Major and Minor in prompt means a Patch update
2. Under `.changeset/` you will notice a new markdown file (its name is randomly generated), with the change-type and summary.
3. Push the file along with the rest of the changes

Once your PR will be merged, our Github action will create a new PR with that generated changelog for us to merge, once the generated PR is merged a new version will be published to npm.
