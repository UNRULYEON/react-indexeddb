# react-indexeddb

React hooks to use IndexedDB.

## Contributing

This project uses [changeset](https://github.com/changesets/changesets) to keep track of changes and publish new versions. Once you've made your change, make sure to run the following command to describe and finalize your changes:

```bash
pnpm changeset
```

Your changes and description will be included in the changelog once a new version is released.

## Publishing

A new version is published to NPM and Github Releases automatically with Github Actions. The workflow will look for new changes in the `main` branch and create a PR for it. Once that PR is merged, a new version is released. You can find the action [here](./.github/workflows/release.yml).

## Developing locally

### Pre-requisites

- Node
- pnpm

Install dependencies with `pnpm install`

### Linking the project

First, navigate to `react-indexeddb`:

```bash
cd packages/react-indexeddb
```

Create a link:

```bash
npm link
yarn link
pnpm link --global
bun link
```

### Installing the link in a project

Link the package in your local project:

```bash
npm link @unrulyeon/react-indexeddb
yarn link @unrulyeon/react-indexeddb
pnpm link --global @unrulyeon/react-indexeddb
bun link @unrulyeon/react-indexeddb
```

## ⌘ Commands

| Command        | Description                                             |
| -------------- | ------------------------------------------------------- |
| `pnpm dev`     | Watches and builds everything when you make changes     |
| `pnpm build`   | Build all packages                                      |
| `lint:check`   | Lints in all packages                                   |
| `lint:fix`     | Lints and fixes problems if possible in all packages    |
| `format:check` | Checks formatting in all packages                       |
| `format:fix`   | Checks and fixes formatting if possible in all packages |
| `prepare`      | Install Husky hooks                                     |
