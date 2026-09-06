import { events, tryRegisterPlugin } from "@utils/plugin.js";
import { log } from "@utils/logging.js";
import { buildNumber, buildMode } from "@utils/constants.js";
import { initMenuInjector } from "@/menu.js";
import "@/types.js";

// Plugin registration
unsafeWindow.addEventListener("bytm:registerPlugin", async (registerPlugin) => {
  try {
    await tryRegisterPlugin(registerPlugin);
    log(
      `Registered plugin successfully! (v${unsafeWindow.BYTM.version}, build ${buildNumber}, ${buildMode} mode)`
    );

    events.once("bytm:ready", run);
  } catch (err) {
    alert("Couldn't register BetterYTM Song Playlists plugin. See console for details.");
    console.error("Plugin registration error:", err);
  }
});

function run() {
  log("Initializing Song Playlists menu injector...");
  initMenuInjector();
}
