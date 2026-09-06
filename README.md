<div style="text-align: center;" align="center">

<img src="./assets/plugin_icon_128x128.png" width="80" height="80" alt="default icon of this template">
<h2>BetterYTM Plugin Template</h2>
<h4 style="margin-top: 0;">– compatible with BYTM v3.0.0 <sup><a href="https://github.com/Sv443/BetterYTM/tree/v3.0.0" target="_blank">⧉</a></sup> –</h4>

</div>
<br>

### Table of Contents:
- [**Introduction**](#introduction)
- [**Prerequisites**](#prerequisites)
- [**Setup for local development**](#setup)
- [**Inner Workings of this template**](#inner-workings)
  - [File structure](#file-structure)
  - [Tips and notes](#tips-and-notes)
- [**Terminal commands**](#commands)
- [**License**](#license)

<br>

## Introduction:
BetterYTM is a UserScript that enhances the YouTube and YouTube Music experience by adding features and fixing bugs. It has a plugin system that allows you to create your own plugins to further customize the experience and make use of its API.  
This template is perfect for anyone who wants to create a plugin for BetterYTM but doesn't want to deal with the hassle of setting up a working development environment.  
  
BetterYTM (BYTM for short) is included as a Git submodule to ensure that both projects' versions stay compatible until you decide to update your plugin.  
This also conveniently allows you to inspect BetterYTM's code for finding specific details about the API and even more conveniently, allows you to navigate through to the BYTM API by ctrl+clicking on imported members.  
Just make sure to [read the plugin sublicense](https://github.com/Sv443/BetterYTM/blob/main/license-for-plugins.txt) to find out which parts you are allowed to include in your plugin's bundle in `dist/`.  
If you only import with the `type` keyword (or without, when importing `enum`s), you should be fine.  
  
The plugin will be built with [Vite](https://vitejs.dev/) and [pnpm](https://pnpm.io/) and written in [TypeScript](https://www.typescriptlang.org/) to provide a modern and lightning fast development experience.  
You may also import plain JavaScript files (with the extension .mjs) if you prefer that instead.  
  
It is also set up to be easily hosted on a local server for testing and to be built for production with a single command.  
If you use a UserScript manager extension such as [Violentmonkey](https://violentmonkey.github.io/), you can easily test the plugin by opening the local server URL in your browser.  
The extension will keep updating the userscript automatically when any changes are made, as long as you clicked the "track external edits" button.  
Configure this behavior in the `nodemonConfig` object in `package.json` and `src/tools/serve.ts`.  
  
The library [UserUtils](https://github.com/Sv443-Network/UserUtils) is also included to provide a plethora of useful functions and classes for UserScripts.  
I highly recommend checking it out! It is included on the BYTM API via `unsafeWindow.BYTM.UserUtils`.  
  
> [!NOTE]  
> If your plugin is published, send me a quick [E-Mail](https://sv443.net/) or message on [Discord](https://dc.sv443.net/) so I can add it to the [BetterYTM Plugin List.](https://github.com/Sv443/BetterYTM#plugins)  
> You can also contact me for questions and help or to request features to be exposed on the API.  
  
Have fun creating your plugin!

<br>

## Prerequisites
- Reading the [BetterYTM Contributing Guide](https://github.com/Sv443/BetterYTM/blob/main/contributing.md) (or the latest in-dev version [here](https://github.com/Sv443/BetterYTM/blob/develop/contributing.md)).  
  It contains all the information you need to know about the BYTM API and how to create a plugin.
- Having basic knowledge of writing UserScripts with JavaScript and ideally also having basic TypeScript knowledge.
- Installing a powerful IDE like [VS Code](https://code.visualstudio.com/) to get extension recommendations, be able to inspect TS types and BYTM-internal code and to get auto-completion for the members of the BYTM API.
- Reading this whole document to understand how to set up and use this template correctly.
- Reading the [BetterYTM plugin sublicense](https://github.com/Sv443/BetterYTM/blob/main/license-for-plugins.txt)

<br>

## Setup
1. [Install Node.js](https://nodejs.org/) (current version or LTS, has to be at least v22) and [pnpm](https://pnpm.io/) (can be done with `npm i -g pnpm@latest`)
2. [Create a repository based on this template.](https://github.com/new?template_name=BetterYTM-Plugin-Template&template_owner=Sv443)
3. Clone your new repository to your local machine.
4. Use `git submodule update --init --recursive` to clone the BetterYTM submodule.
5. Copy `.env.template` to `.env` and modify it to your needs.
6. Make sure you [installed a compatible version of BetterYTM from the releases page.](https://github.com/Sv443/BetterYTM/releases)  
  If you wanna prepare your code for the latest version that's still in development, [check out the latest pull request](https://github.com/Sv443/BetterYTM/pulls) for the download and changelog.
7. Open a terminal in the project root and run `pnpm i` to install dependencies.
8. Run `pnpm dev` to build the plugin and host it on a local server for testing.  
  Open this URL with your UserScript manager extension to easily test the plugin.  
  I recommend using [the Violentmonkey extension](https://violentmonkey.github.io/), which will automatically update the userscript when any changes are made.

- [Check out the inner workings section](#inner-workings) to understand [how the template is structured and how files are organized](#file-structure) and [some tips and notes on the internals.](#tips-and-notes)
- [Refer to the commands section for info on all other commands](#commands), like how to build for production or how to lint your code.

<br>

## Inner Workings:
### File structure:
- The root folder of the project (import prefix: `@root/`) contains the following:
  - `.env.template` is an example file for an environment configuration.  
    Copy the file to `.env` and modify it to your needs to change the behavior of the build process.
  - `.gitmodules` contains the submodule configuration, where the BetterYTM repository is linked. Only modify this via terminal commands.
  - `changelog.md` documents all changes between your plugin's versions. It is recommended to keep this up to date.
  - `eslint.config.mjs` contains the ESLint configuration in the new v9 format. Feel free to modify this to your liking.  
    The default settings include 2-space indentation, double quotes, trailing commas, and more.  
    Things to look out for:
    - The rule `@typescript-eslint/no-empty-object-type` is turned off, which means you can use the type `{}`, but be careful since this *doesn't* mean "empty object" and is a [common pitfall](https://www.totaltypescript.com/the-empty-object-type-in-typescript)
    - Unused function arguments will yield a warning, unless they start with an underscore
  - `package.json` is the single source of truth for lots of your plugin's metadata, like the name, version, description, etc.  
    Make sure to update this file to match your plugin's details.
  - `tsconfig.json` contains the TypeScript configuration. Feel free to modify this to your needs.
  - `vite.config.ts` contains the Vite build configuration. This is where your userscript metadata and some default values are defined.  
    It is also where resources are parsed, the SRI hash is calculated and where you can add your own tweaks to the build process.
- The `src/` folder contains the source code of the plugin (import prefix: `@/`).
  - `index.ts` is the main file that will be compiled into the userscript. In there, hook all the functions you want to run when the plugin is loaded.
  - `types.ts` makes sure that the BYTM API is available in your code by providing its global types.  
    If you need more global events, you will need to manually enter them in the `interface WindowEventMap` by following the format of the other entries and cross-referencing the BYTM API documentation.
  - `example/` contains example code to show you how to interact with the BYTM API.
  - `utils/` contains utility functions for better organization of your code (import prefix: `@utils/`).
    - `constants.ts` contains constants that are used throughout the plugin.  
      The example values that are in there (build mode and number) are inserted by the custom vite plugin in `vite.config.ts`.  
      You can add your own constants in there and use them throughout your code as a single source of truth.
    - `logging.ts` has shorthand functions for logging stuff to the console. This has the benefit of adding a common prefix to all log messages and in here you can hook your own functions to improve the logging system.
    - `plugin.ts` contains the plugin definition object, the plugin registration logic and constants exposed by the registration (token and event emitter instance).
- The `assets/` folder contains all the assets that are used in the plugin, think image, audio, video files, HTML, CSS, markdown, whatever.  
  These assets can be linked to a `@resource` directive by editing the `vite.config.ts` file, where you can then use `GM.getResourceUrl()` to get the URL of the asset, which you can then `fetch()` or point to in an img, video, audio, etc. tag.
  - `resources.json` is where you define the `@resource` directives for your plugin, which can then be fetched with `GM.getResourceUrl()` and `GM.getResourceText()`.  
    The keys of this object are the identifiers you use to fetch the resources and the values are the paths to the resources, or an options object.  
    If a string path is given and it starts with a slash, it will be resolved relative to the root of the project, otherwise relative to the `assets/` folder.  
    If an object is given, it has to have the keys `path` (follows the same logic as above) and an optional `integrity` key, which will by default automatically calculate the SRI hash for the asset and append it to the URL in the metadata block, unless explicitly set to `false`.  
    If you include files that can change outside your influence like libraries, make sure you use a CDN with versioned URLs, so the file doesn't change (because the hash will only be calculated once at build time). An example of this can be found in the `resources.json` file.
- The `bytm` folder contains BetterYTM's entire repository as a submodule (import prefix: `@bytm/`).  
  The branch of this submodule dictates which version of BetterYTM your plugin is compatible with.  
  `main` is the latest release version, `develop` is the latest in-dev version.  
  I recommend you read up on Git submodules to understand how they work and how to update them.  
  This folder is also where you can find the BYTM API documentation and inspect the code to find out how to use the API.  
  You can also quickly navigate through the BYTM API's internal code via ctrl+clicking.
- In the `dist/` folder, the final build of your userscript will be created by vite.  
  This is the file you will want to publish on platforms like GitHub, GreasyFork, OpenUserJS or your own website.

<br>

### Tips and Notes:
- All TypeScript file imports you encounter will end in `.js`. This is deliberate, because it is part of the NodeNext module format. Just think of it as if you are trying to import the file that will exist ***after*** TypeScript has compiled it.  
  If you are using VS Code, the IntelliSense imports will automatically follow this format (configured in `.vscode/settings.json`).  
  - All file imports use prefixed paths (starting with `@`), which are defined in the `tsconfig.json` file.
  - JSON imports also have the extended syntax `with { type: "json" }`, which too is part of the NodeNext module standard.
- You need to publish your userscript on at least one (but ideally as many as possible) of the following platforms:
  - GitHub
  - [GreasyFork](https://greasyfork.org/)
  - [OpenUserJS](https://openuserjs.org/)
  - Your own website
- [Subresource Integrity](https://www.tampermonkey.net/documentation.php?locale=en#api:Subresource_Integrity) for `@resource` directives is supported out of the box by this template.  
  This is to combat the risk of your externally loaded in assets being tampered with by a third party, reducing the possibility of MITM and XSS-type attacks.  
  By default, each asset's `integrity` property is `true` in `assets/resources.json`, making the plugin automatically calculate the SRI hash and add it to the asset's URL.  
  Note that this means you will have to rebuild the plugin every time you change an asset that has SRI enabled.  
  If you mess up the strict build and commit order, the hash will be wrong and people will not be able to install your userscript.
- Make sure to retain the notice [at the bottom of this file](#license) that your plugin contains code from BetterYTM in the readme and/or in a `console.log()` that is called on each page load.
- If you're using VS Code, for showing linter errors and to get automatic code formatting you can install the extension `dbaeumer.vscode-eslint`.  
  Then you can add the following to your `User Settings (JSON)` or the `.vscode/settings.json` file to automatically format your code on manual saves:  
  ```json
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
  },
  ```
  Alternatively if you want a manual keybind for this, press F1, enter `Preferences: Open Keyboard Shortcuts`, search for `@command:eslint.executeAutofix` and bind it to a key of your choice.

<br>

## Commands
- `pnpm run dev` - Builds the plugin using the `build-dev` command and hosts it on a local server for testing using the `serve` command on default settings (or whatever is set in `.env`).  
  This will also watch for changes and automatically rebuild the plugin, so the browser extension may automatically refresh it too.  
  The default URL is `http://localhost:8767/betterytm-plugin-template.user.js` (file name is created from `userscriptName` in `package.json`).
- `pnpm run build` - Builds the plugin for production into the `dist` folder.  
  This should be committed for easy inspection and universal installation. This then also allows you to easily permalink to every version's code for users to install.
- `pnpm run build-dev` - Builds the plugin for development into the `dist` folder.  
  By default this only changes where assets are served from, but you can add your own tweaks in `vite.config.ts`.
- `pnpm run serve` - Serves a few folders including `dist` and `assets` on a locally hosted HTTP server.  
  This is useful for development and testing purposes.  
  Use `--port=n` to specify a different port (8767 by default) and `--auto-exit-time=n` to auto-shutdown the server after n seconds.
- `pnpm run lint` - Lints the code with ESLint.  
  Feel free to modify the config at `eslint.config.mjs` to your liking.
- `pnpm run format` - Formats all auto-fixable problems in the code with ESLint, according to the config.

<br>

## License
This project (minus Git submodules) is licensed under the [Unlicense](./LICENSE.txt) - do whatever you want with it.  
It is based on [BetterYTM](https://github.com/Sv443/BetterYTM), which itself is mostly licensed under the [AGPL-3.0 license.](https://github.com/Sv443/BetterYTM/blob/main/LICENSE.txt)  
  
<sup>Make sure to include this in your plugin's readme to comply with [BetterYTM's plugin sublicense.](https://github.com/Sv443/BetterYTM/blob/main/license-for-plugins.txt)</sup>
