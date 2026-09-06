import { PluginIntent, type PluginDef, type PluginRegisterResult } from "@bytm/src/types.js";
import pkg from "@root/package.json" with { type: "json" };

// #region pluginDef
/** This object contains all the metadata of your plugin that is used by BetterYTM to display information about your plugin */
export const pluginDef: PluginDef = {
  // The permissions of the plugin:
  intents: PluginIntent.ReadFeatureConfig | PluginIntent.CreateModalDialogs,
  // The metadata of the plugin:
  plugin: {
    name: pkg.userscriptName,
    namespace: pkg.namespace,
    description: {
      "en-US": pkg.description,
    },
    homepage: {
      source: pkg.homepage,
      bug: pkg.bugs.url,
    },
    version: pkg.version,
    license: {
      name: pkg.license,
      url: pkg.licenseUrl,
    },
    // If you have a logo, you can add it here - it should *ideally* be square and between 48x48 and 128x128:
    iconUrl: "https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/main/assets/plugin_icon_128x128.png",
  },
  // If you have contributors defined in package.json, you can add them here:
  // contributors,
} as const;

/** An event emitter instance that has all events BYTM emits on `window`, plus a few that are specifically for your plugin */
export let events: PluginRegisterResult["events"];
/** A token you can use to identify your plugin in BetterYTM's authenticated function calls */
export let token: PluginRegisterResult["token"];

/**
 * Call once after `bytm:registerPlugins` to try to register the plugin.  
 * Resolves as soon as `bytm:pluginsRegistered` was emitted.  
 * Throws if the {@linkcode pluginDef} is wrong.
 */
export function tryRegisterPlugin({ detail: registerPlugin }: WindowEventMap["bytm:registerPlugin"]) {
  const res = registerPlugin(pluginDef);
  events = res.events;
  token = res.token;

  return events.once("pluginRegistered");
}
