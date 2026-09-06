// ==UserScript==
// @name         BetterYTM Plugin Template
// @namespace    https://github.com/Sv443
// @version      0.1.0
// @author       Sv443
// @description  Example and template for creating a plugin using BetterYTM's existing API to further improve YouTube and YouTube Music.
// @license      WTFPL
// @copyright    Copyright 2024 Sv443
// @icon         https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/07ed72c/assets/plugin_icon_128x128.png#sha256=4GgH3wuDgVjYVPf1s6NURcDU0QvjnLCigrlKowsF6x8=
// @homepage     https://github.com/Sv443/BetterYTM-Plugin-Template
// @homepageURL  https://github.com/Sv443/BetterYTM-Plugin-Template
// @source       https://github.com/Sv443/BetterYTM-Plugin-Template.git
// @supportURL   https://github.com/Sv443/BetterYTM-Plugin-Template/issues
// @match        https://youtube.com/*
// @match        https://music.youtube.com/*
// @resource     doc_license     https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/07ed72c/LICENSE.txt
// @resource     icon_1000       https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/07ed72c/assets/plugin_icon_1000x1000.png#sha256=IrFR29ZTCXuH5WsSVcmPn5FA+GvBopOyGR9lFSi4s5c=
// @resource     icon_128        https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/07ed72c/assets/plugin_icon_128x128.png#sha256=4GgH3wuDgVjYVPf1s6NURcDU0QvjnLCigrlKowsF6x8=
// @resource     library_lodash  https://cdn.jsdelivr.net/npm/lodash@4.17.21#sha256=qXBd/EfAdjOA2FGrGAG+b3YBn2tn5A6bhz+LSgYD96k=
// @resource     script_example  https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/07ed72c/assets/resourceExample.js#sha256=2pnooQQ8m6WU1xPIgSJ4bI4ilHjIWg/BxaPX7eIshS0=
// @connect      i.ytimg.com
// @connect      youtube.com
// @connect      github.com
// @connect      raw.githubusercontent.com
// @grant        GM.getResourceUrl
// @grant        unsafeWindow
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
    LogLevel2[LogLevel2["Debug"] = 0] = "Debug";
    LogLevel2[LogLevel2["Info"] = 1] = "Info";
    return LogLevel2;
  })(LogLevel || {});
  var PluginIntent = /* @__PURE__ */ ((PluginIntent2) => {
    PluginIntent2[PluginIntent2["ReadFeatureConfig"] = 1] = "ReadFeatureConfig";
    PluginIntent2[PluginIntent2["WriteFeatureConfig"] = 2] = "WriteFeatureConfig";
    PluginIntent2[PluginIntent2["SeeHiddenConfigValues"] = 4] = "SeeHiddenConfigValues";
    PluginIntent2[PluginIntent2["WriteLyricsCache"] = 8] = "WriteLyricsCache";
    PluginIntent2[PluginIntent2["WriteTranslations"] = 16] = "WriteTranslations";
    PluginIntent2[PluginIntent2["CreateModalDialogs"] = 32] = "CreateModalDialogs";
    PluginIntent2[PluginIntent2["ReadAutoLikeData"] = 64] = "ReadAutoLikeData";
    PluginIntent2[PluginIntent2["WriteAutoLikeData"] = 128] = "WriteAutoLikeData";
    return PluginIntent2;
  })(PluginIntent || {});
  const name = "betterytm-plugin-template";
  const userscriptName = "BetterYTM Plugin Template";
  const description = "Example and template for creating a plugin using BetterYTM's existing API to further improve YouTube and YouTube Music.";
  const version = "0.1.0";
  const homepage = "https://github.com/Sv443/BetterYTM-Plugin-Template";
  const namespace = "https://github.com/Sv443";
  const license = "WTFPL";
  const licenseUrl = "https://github.com/Sv443/BetterYTM-Plugin-Template/blob/main/LICENSE.txt";
  const author = {
    name: "Sv443",
    url: "https://github.com/Sv443"
  };
  const type = "module";
  const bugs = {
    url: "https://github.com/Sv443/BetterYTM-Plugin-Template/issues"
  };
  const repository = {
    type: "git",
    url: "git+https://github.com/Sv443/BetterYTM-Plugin-Template.git"
  };
  const scripts = {
    dev: 'concurrently "nodemon --exec pnpm run build-dev" "pnpm run serve"',
    "build-dev": "vite build --mode development",
    build: "vite build --mode production",
    serve: "pnpm run node-ts ./src/tools/serve.ts",
    "node-ts": "node --no-warnings=ExperimentalWarning --enable-source-maps --loader ts-node/esm",
    lint: "eslint ./src",
    format: "eslint --fix ./src"
  };
  const nodemonConfig = {
    watch: [
      "src/**",
      "assets/**",
      "vite.config.ts",
      ".env",
      "changelog.md",
      "package.json"
    ],
    ext: "ts,mts,js,jsx,mjs,json,html,css,svg,png",
    ignore: [
      "node_modules/**",
      "dist/**"
    ]
  };
  const dependencies = {
    "@sv443-network/userutils": "^8.0.2",
    "compare-versions": "^6.1.1",
    nanoevents: "^9.0.0",
    tslib: "^2.7.0"
  };
  const devDependencies = {
    "@eslint/eslintrc": "^3.1.0",
    "@eslint/js": "^9.10.0",
    "@types/express": "^4.17.21",
    "@types/greasemonkey": "^4.0.7",
    "@types/node": "^22.5.4",
    "@typescript-eslint/eslint-plugin": "^8.4.0",
    "@typescript-eslint/parser": "^8.4.0",
    concurrently: "^8.2.2",
    dotenv: "^16.4.5",
    eslint: "^9.10.0",
    express: "^4.19.2",
    globals: "^15.9.0",
    nodemon: "^3.1.4",
    "ts-node": "^10.9.2",
    typescript: "^5.5.3",
    vite: "^5.4.1",
    "vite-plugin-monkey": "^4.0.6",
    "vite-tsconfig-paths": "^5.0.1"
  };
  const packageJson = {
    name,
    userscriptName,
    description,
    version,
    homepage,
    namespace,
    license,
    licenseUrl,
    author,
    "private": true,
    type,
    bugs,
    repository,
    scripts,
    nodemonConfig,
    dependencies,
    devDependencies
  };
  const pluginDef = {
    // The permissions of the plugin:
    intents: PluginIntent.ReadFeatureConfig | PluginIntent.CreateModalDialogs,
    // The metadata of the plugin:
    plugin: {
      name: userscriptName,
      namespace,
      description: {
        "en-US": description
      },
      homepage: {
        source: homepage,
        bug: bugs.url
      },
      version,
      license: {
        name: license,
        url: licenseUrl
      },
      // If you have a logo, you can add it here - it should *ideally* be square and between 48x48 and 128x128:
      iconUrl: "https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/main/assets/plugin_icon_128x128.png"
    }
    // If you have contributors defined in package.json, you can add them here:
    // contributors,
  };
  let events;
  let token;
  function tryRegisterPlugin({ detail: registerPlugin }) {
    const res = registerPlugin(pluginDef);
    events = res.events;
    token = res.token;
    return events.once("pluginRegistered");
  }
  const consPrefix = `[${packageJson.userscriptName}]`;
  function log(...args) {
    console.log(consPrefix, ...args);
  }
  const buildModeRaw = "production";
  const buildNumberRaw = "07ed72c";
  const buildMode = buildModeRaw.startsWith("#{{") ? "BUILD_ERROR" : buildModeRaw;
  const buildNumber = buildNumberRaw.startsWith("#{{") ? "BUILD_ERROR" : buildNumberRaw;
  function examplePreInit() {
    unsafeWindow.BYTM.UserUtils.interceptWindowEvent("beforeunload", () => true);
  }
  async function exampleMainEntrypoint() {
    const button = document.createElement("button");
    button.id = "my-plugin-button";
    button.textContent = "Click me!";
    unsafeWindow.BYTM.addSelectorListener("playerBar", ".middle-controls-buttons", {
      listener: (btnsContainerElement) => btnsContainerElement.appendChild(button),
      debounce: 100
    });
    unsafeWindow.BYTM.onInteraction(button, async (evt) => {
      if (document.querySelector("#rainbowfill-style"))
        return;
      let confirmed = true;
      if (!evt.shiftKey) {
        confirmed = await unsafeWindow.BYTM.showPrompt({
          message: "Hello from my cool plugin!\nAre you sure you want to continue?",
          type: "confirm",
          confirmBtnText: "Continue",
          confirmBtnTooltip: "Click to continue"
        });
      }
      if (confirmed) {
        const styleElem = unsafeWindow.BYTM.UserUtils.addGlobalStyle(
          `@keyframes rainbowfill {
  0%      { fill: #ff0000; }
  16.666% { fill: #ff7f00; }
  33.333% { fill: #ffff00; }
  50%     { fill: #00ff00; }
  66.666% { fill: #3535ff; }
  83.333% { fill: #7b23dd; }
  100%    { fill: #ff0000; }
}
tp-yt-iron-icon, svg path, .bytm-adorn-icon svg path, .bytm-toast-icon svg path {
  animation: rainbowfill 7s linear infinite;
}`
        );
        styleElem.id = "rainbowfill-style";
      }
    });
    const features = unsafeWindow.BYTM.getFeatures(token);
    if (features) {
      log("BYTM's locale is", features.locale);
      log("BYTM's log level is", features.logLevel, `(${LogLevel[features.logLevel]})`);
    }
    const exampleScript = await unsafeWindow.BYTM.UserUtils.fetchAdvanced(await GM.getResourceUrl("script_example"), {
      timeout: 5e3
    });
    try {
      eval(await exampleScript.text());
    } catch (err) {
      log("Failed to eval the fetched example script:", err);
    }
  }
  function someJsdocFunction(arg) {
    console.log("Hello from JS!", Math.pow(arg, 2));
    return 1;
  }
  function somePlainFunction(arg) {
    console.log("Hello from JS!", arg);
    return 1;
  }
  unsafeWindow.addEventListener("bytm:registerPlugin", async (registerPlugin) => {
    try {
      preInit();
      try {
        await tryRegisterPlugin(registerPlugin);
        log(`Registered plugin successfully!
Using the BetterYTM API v${unsafeWindow.BYTM.version}
Plugin build number: ${buildNumber} (${buildMode} mode)`);
      } catch (err) {
        console.error("Couldn't register plugin:", err);
      }
      events.once("bytm:ready", run);
    } catch (err) {
      console.error("A generic error occurred:", err);
    }
  });
  function preInit() {
    examplePreInit();
    const foo = someJsdocFunction(9);
    const bar = somePlainFunction("any type is allowed");
    log("foo:", foo, "bar:", bar);
  }
  async function run() {
    await exampleMainEntrypoint();
  }

})();