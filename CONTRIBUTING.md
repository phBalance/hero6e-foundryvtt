# Contributing

Everyone's contributions are welcome. Everything from bug reports to spelling corrections to bug fixes to implementing new features is needed. It takes a village to raise a Foundry package!

GitHub has a number of documents describing [how to collaborate with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests) that are a good starting point. It looks like a lot, but it's straight forward once you get the hang of it.

If you would like to report a bug then the GitHub [Quickstart for GitHub Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/quickstart) is a good starting point.

## Downloading

You can download the GitHub repository from `https://github.com/dmdorman/hero6e-foundryvtt` as mentioned in the [README](./README.md).

## Setup for Development

Install the npm packages used for building the project:

```bash
npm ci
```

## Building the Module

This Foundry VTT system can be built using:

```bash
npm run build
```

This will automatically leave `gulp` in watch mode which means that any of your changes will automatically rebuilt.

## Testing

This package can be tested using the [Quench](https://foundryvtt.com/packages/quench) Foundry module. Once added, make sure it's enabled and you should get a "Quench" button at the bottom of your expanded side bar. Push the button and you can choose what tests to run but ultimately all should pass.

You should be able to find the appropriate labeled tests in the `module/testing` directory. As you add new functionality or make bug fixes, you should add corresponding tests.

## Code Formatting

We are in the process of trying to standardize the look of the code and making it harder to write incorrect code. We are doing this using [eslint](https://eslint.org/) and [prettier](https://prettier.io/). While the code is not yet totally lintified or prettied, every little bit helps. Try to leave the code in a better state than when you started. To validate the code, using eslint and prettier, you can run the following command:

```bash
npm run validate
```

### Lint

Linting does a static analysis on the code to find code mistakes. To check the lint status you can run and check the number of errors provided at the very end.

```bash
npm run lint
```

### Prettier

Prettier enforces a code standard. To check the status of your files you can run and check the number of errors provided:

```bash
npm run prettier
```

#### Prettier in your code editor

Additionally, most likely your code editor will support the prettier enabling you to automatically pretty your code. For instance, with VSCode you can use [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). It should, out of the box, use the same project settings for its rules. The only thing you will have to do is to setup your editor to auto format your code.

### Auto Fixing

Eslint and Prettier can do a reasonable job of fixing the formatting of your files themselves. To let them do their thing:

```bash
npm run autoFix
```
