import { tryRegisterPlugin } from "@utils/plugin.js";
import { log } from "@utils/logging.js";
import { buildNumber, buildMode } from "@utils/constants.js";
import { initMenuInjector } from "@/menu.js";
import "@/types.js";

// Always start the menu injector right away
initMenuInjector();

function onRegister(evt: Event) {
  const customEvt = evt as CustomEvent<(def: unknown) => unknown>;
  try {
    tryRegisterPlugin(customEvt as unknown as WindowEventMap["bytm:registerPlugin"]);
    log(
      `Registered with BetterYTM (v${unsafeWindow.BYTM?.version ?? "unknown"}, build ${buildNumber}, ${buildMode} mode)`
    );
  } catch (err) {
    console.error("[BetterYTM Song Playlists] Registration error:", err);
  }
}

// In userscripts, unsafeWindow is the shared page window between scripts
unsafeWindow.addEventListener("bytm:registerPlugin", onRegister, { once: true });
unsafeWindow.addEventListener("bytm:preInitPlugin", onRegister, { once: true });




