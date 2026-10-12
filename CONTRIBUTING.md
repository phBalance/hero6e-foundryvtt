# Contributing

Everyone's contributions are welcome. Everything from bug reports to spelling corrections to bug fixes to implementing new features is needed. It takes a village to raise a Foundry package!

## So I'm Interested in Helping! What do I need?

### Contributing Bug Reports

If you would like to report a bug then the GitHub [Quickstart for GitHub Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/quickstart) is a good starting point. To do so, you won't need anything more than a web browser, a keen eye, and a willingness to help others reproduce your problem by providing as detailed a description of the problem as you can. Learning how to use your browser's developer tools can be invaluable to look for related log messages can really make life easier and bug reports more specific.

### Contributing Source Changes

To contribute to the source you will likely need a number of things:

- A licensed copy of [FoundryVTT](https://foundryvtt.com/purchase/). Be sure to follow the [license](https://foundryvtt.com/article/license/) while developing.
- A [GitHub](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github) account.
- A way of editing the software and interacting with [git](https://git-scm.com/). [VSCode](https://code.visualstudio.com/download) is a free possibility but certainly not the only choice that will allow you to do both.
- A copy of at least the 5e and 6e basic rule books or the ability to ask others for your answers. Submitted code should support both 5e and 6e and usually the rules aren't too different.
- A licensed copy of [Hero Designer](https://www.herogames.com/store/product/1-hero-designer/) so that you can create test characters.
- An installed copy of [Node.js](https://nodejs.org).

#### How We Work Together

GitHub has a number of documents describing [how to collaborate with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests) that are a good starting point. It looks like a lot, but it's straight forward once you get the hang of it.

In essence, you create changes in your fork and then generate a pull request to share with the main repository. A developer with write access with then ensure that it meets the the formatting and correctness criteria. This may require some back and forth as you get used to the project's requirements. Feel free to reach out with discussion questions on GitHub or Discord.

## How to Contribute Source Changes

All later steps assume you have installed the software listed above.

### Setting up FoundryVTT

There are lots of resources to help online. [Here's a starter resource focusing on the configuration and command line](https://foundryvtt.com/article/configuration/).

### Running FoundryVTT

If you plan to use both the release version and the development version of the system, then you'll want to clone into a directory that is separate from (i.e. not within) your FoundryVTT install. This is suggested approach because FoundryVTT requires that all system names are unique. You should clone into the `Data/systems` directory after you have configured your FoundryVTT and run it with the `dataPath` option as suggested below.

If you don't plan on running the release version you can clone into the `Data/systems` directory of your install. You can always move it later on if you change your mind and decide that you'd like to be able to run the released versions of the system.

You can run FoundryVTT with:

```bash
node resources/app/main.js --dataPath=<the path to the data directory or the development data directory you want to use>
```

### Downloading/Cloning for Development

You can clone the GitHub repository from `https://github.com/dmdorman/hero6e-foundryvtt` as mentioned in the [README](./README.md). The source code is made up of JavaScript, Sass, and Handlebars/HTML and documentation, such as this, is written in Markdown. You'll want to put it into a directory that is appropriate for how you're going to develop that you probably decided in an above step.

```bash
git clone https://github.com/dmdorman/hero6e-foundryvtt <your FoundryVTT data directory as above>/Data/systems/hero6efoundryvttv2
```

### Setup for Development

Open a command shell, navigate to your cloned hero6efoundryvttv2 repository, and install the npm packages used for building the project:

```bash
npm ci
```

Setup your local git repository to use the `.git-blame-ignore-revs` file so that you can ignore specific changes which made large non functional modifications to the source when using `git blame`. As documented in the `.git-blame-ignore-revs` file, you want to run:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

### Building the System

This Foundry VTT system can be built using:

```bash
npm run build
```

This will automatically leave `gulp` in watch mode which means that any of your changes will automatically rebuilt.

The build compiles the CSS files, then stays in watch mode. The watch loop checks only the files you changed. It prints every finding and keeps running. A finding never stops the build.

CI still enforces the standards. Run `npm run validate` before you open a pull request, and fix every finding.

One this step successful executes, you should be able to run worlds using this system.

### Testing

This package can be tested using the [Quench](https://foundryvtt.com/packages/quench) FoundryVTT module. Once added, make sure it's enabled and you should get a "Quench" button at the bottom of your expanded side bar. Push the button and you can choose what tests to run but ultimately all should pass.

You should be able to find the appropriate labeled tests in the `module/testing` directory. As you add new functionality or make bug fixes, you should add corresponding tests.

### Code Formatting

We have standardized the look of the code and making it harder to write incorrect code. Each file type has one owner. oxlint and oxfmt handle JavaScript and Markdown. stylelint handles SCSS for both formatting and linting. oxfmt and oxlint skip `.scss` files. To validate the code, using `oxlint`, `stylelint`, and `oxfmt`, you can run the following command:

```bash
npm run validate
```

#### Lint

Linting does a static analysis on the code to find code mistakes like using a variable name that is not defined. The oxlint rules live in [`.oxlintrc.json`](./.oxlintrc.json) at the root of the repository. The stylelint rules live in [`stylelint.config.mjs`](./stylelint.config.mjs). To check the lint status you can run and check the number of errors provided at the very end.

```bash
npm run lint
```

#### Formatting

oxfmt enforces the formatting standard for JavaScript and Markdown. The rules live in [`.oxfmtrc.json`](./.oxfmtrc.json) at the root of the repository. stylelint enforces SCSS formatting through [`@stylistic/stylelint-config`](https://github.com/stylelint-stylistic/stylelint-stylistic). To check the number of code formatting errors:

```bash
npm run format
```

#### oxfmt in your code editor

Most code editors support oxfmt through an extension, so the editor formats your code as you develop. With VS Code, install the [Oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode). That extension runs `oxfmt --lsp` from this project and also reports oxlint findings. Set the extension as the default formatter and enable format on save so your code always matches the standard.

This repository ships [`.vscode/settings.json`](./.vscode/settings.json) and [`.vscode/extensions.json`](./.vscode/extensions.json). VS Code reads them when you open the folder and prompts you to install both extensions. Install the recommendations, or the editor falls back to its built-in formatters and writes 2 space indents.

SCSS needs the [VS Code stylelint extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint). That extension provides no formatter. It fixes SCSS through a code action, so the shipped settings disable `formatOnSave` for SCSS and run `source.fixAll.stylelint` on save instead. oxfmt ignores `.scss` files, so the Oxc extension leaves them alone.

#### Working in WSL

Run VS Code, the extensions, and the tools inside WSL. Do not open the repo from Windows through
the `\\wsl$\` UNC path.

Windows reaches WSL files over `\\wsl$\`. VS Code then reports URIs like `file://wsl%24/Ubuntu/home/...`.
The Oxc extension runs on the Windows host and uses a Windows binary. That binary cannot read the
Linux config, so oxfmt silently formats with its 2 space, 80 column defaults.

Open the folder in the remote first. Run `Ctrl+Shift+P` then `Remote-WSL: Reopen Folder in WSL`.
The status bar must read `WSL: Ubuntu`. Opening `\\wsl$\Ubuntu\...` as a Windows folder is not the
same thing.

Then install the extensions into the remote. In the Extensions view, use `Install in WSL: <name>`.
Uninstall the local copies so they cannot shadow the remote ones. Or from a WSL terminal:

```bash
code --install-extension oxc.oxc-vscode
code --install-extension stylelint.vscode-stylelint
```

Install the dependencies from inside WSL too. A `node_modules` tree installed from Windows holds only
Windows native bindings, so `npm run format` cannot run in WSL.

```bash
cd ~/repos/hero6efoundryvttv2_slaughterhouse
rm -rf node_modules
npm ci
ls node_modules/@oxfmt/ node_modules/@oxlint/
```

Each listing must include a `binding-linux-x64-gnu` entry.

Verify the setup. Set `oxc.trace.server` to `verbose`, format a file, then read
`Output > Oxc (Formatter)`. URIs must read `file:///home/...`, not `file://wsl%24/...`.
Indentation must stay at 4 spaces.

Do not set `oxc.fmt.configPath` to a relative path on any platform. VS Code records this file as a
workspace folder setting, so the extension skips path resolution and sends the raw string. oxfmt then
falls back to its defaults. The extension substitutes only `${userHome}` and `${env:NAME}`. It has no
`${workspaceFolder}`. Leave the setting `null` and let oxfmt discover `.oxfmtrc.json` from the file it
formats.

#### Auto Fixing

If you don't want to setup your editor to auto format on save, `oxlint`, `stylelint`, and `oxfmt` can fix the formatting of your files on an as needed basis. To let them do their thing:

```bash
npm run autoFix
```

Alternatively you can run one type of fixing or the other explicitly:

```bash
npm run lint:fix
npm run format:fix
```
