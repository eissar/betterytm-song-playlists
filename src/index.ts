import { events, tryRegisterPlugin } from "@utils/plugin.js";
import { log } from "@utils/logging.js";
import { buildNumber, buildMode } from "@utils/constants.js";
import { examplePreInit } from "@/example/preInit.js";
import { exampleMainEntrypoint } from "@/example/main.js";
import { jsdocPow, plainJsSetFactor } from "@/example/plainJs.mjs";
import "@/types.js";

// #region register plugin

// this is the entry point of your plugin:
unsafeWindow.addEventListener("bytm:registerPlugin", async (registerPlugin) => {
  try {
    // call a few functions that need to be run as soon as possible:
    preInit();

    try {
      // register the plugin with BetterYTM to be able to call authenticated API functions:
      await tryRegisterPlugin(registerPlugin);
      log(`Registered plugin successfully!\nUsing the BetterYTM API v${unsafeWindow.BYTM.version}\nPlugin build number: ${buildNumber} (${buildMode} mode)`);

      // run the main code of your plugin once BYTM and the DOM are ready:
      events.once("bytm:ready", run);
    }
    catch(err) {
      alert("Couldn't register the plugin. Refer to the console for more information.");
      console.error("Couldn't register plugin due to error:", err);
      return;
    }
  }
  catch(err) {
    console.error("A generic error occurred:", err);
  }
});

// #region preInit
/** You can do anything in here that needs to be done as soon as the page loads, except modifying the DOM. */
function preInit() {
  // check out this example code in src/example/preInit.ts:
  examplePreInit();

  // here are some examples involving the plain JS module 'src/example/plainJs.mjs'
  // hover over the functions to see how the IDE can help you with types, even without TypeScript:

  // this one accepts any type, making it prone to bugs:
  const foo = plainJsSetFactor("hello");
  //    ^?: string

  const factor = plainJsSetFactor(2);
  //    ^?: number

  // this one has its argument and return value typed via JSDoc, so the IDE gives hints about the expected types:
  const result = jsdocPow(9);
  //    ^?: number

  log(`factor: ${factor}, result: ${result}`); // factor: 2, result: 81

  void foo;
}

// #region main
/** This function gets called whenever the plugin is fully registered and the DOM is available. */
async function run() {
  // this is where you can modify the DOM, add event listeners, etc.

  // check out this example code in src/example/main.ts:
  await exampleMainEntrypoint();
}
