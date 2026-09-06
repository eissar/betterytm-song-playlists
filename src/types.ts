import type { BytmObject, PluginDef, PluginRegisterResult } from "@bytm/src/types.js";

declare global {
  interface Window {
    BYTM: BytmObject;
  }

  // Enter BYTM's custom events you need in here so they are available on the `window` object and typed correctly.
  // When adding new events, you can basically copy them from `type InterfaceEvents` in `bytm/src/interface.ts` after wrapping them in `CustomEvent`:
  interface WindowEventMap {
    "bytm:registerPlugin": CustomEvent<(def: PluginDef) => PluginRegisterResult>;
  }
}
