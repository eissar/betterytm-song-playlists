import { tryRegisterPlugin } from "@utils/plugin.js";
import { log } from "@utils/logging.js";
import { buildNumber, buildMode } from "@utils/constants.js";
import { initMenuInjector } from "@/menu.js";
import "@/types.js";

// Always start the menu injector right away
initMenuInjector();

let isRegistered = false;

async function onRegister(evt: Event) {
  if (isRegistered) return;
  isRegistered = true;

  const customEvt = evt as CustomEvent<(def: unknown) => unknown>;
  try {
    await tryRegisterPlugin(customEvt as unknown as WindowEventMap["bytm:registerPlugin"]);
    log(
      `Registered with BetterYTM (v${unsafeWindow.BYTM?.version ?? "unknown"}, build ${buildNumber}, ${buildMode} mode)`
    );
  } catch (err) {
    console.error("[BetterYTM Song Playlists] Registration error:", err);
  }
}

// In userscripts, unsafeWindow is the shared page window between scripts
unsafeWindow.addEventListener("bytm:registerPlugin", onRegister, { once: true });




