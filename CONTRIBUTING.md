# Contributing

Everyone's contributions are welcome. Anything from bug reports to spelling corrections to bug fixes to implementing new features is needed. It takes a village to raise a Foundry module.

GitHub has a number of documents describing [how to collaborate with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests) that are a good starting point. It looks like a lot, but it's straight forward once you get the hang of it.

If you would like to report a bug then the GitHub [Quickstart for GitHub Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/quickstart) is a good starting point.

## Downloading

You can download the GitHub repository from `https://github.com/dmdorman/hero6e-foundryvtt`.

## Setup

Install the npm packages used for building the project:

```bash
npm ci
```

## Building the Module

This Foundry VTT module can be built using:

```bash
npm run build
```

This will automatically leave `gulp` in watch mode which means that any of your changes will automatically rebuilt.
