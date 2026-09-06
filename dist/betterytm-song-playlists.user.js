// ==UserScript==
// @name         BetterYTM Song Playlists
// @namespace    https://github.com/eissar
// @version      0.1.0
// @author       eissar
// @description  Enumerates and shows which of your playlists contain the selected song in YouTube Music.
// @license      MIT
// @copyright    Copyright 2026 eissar
// @icon         https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/65df5a3/assets/plugin_icon_128x128.png#sha256=4GgH3wuDgVjYVPf1s6NURcDU0QvjnLCigrlKowsF6x8=
// @homepage     https://github.com/eissar/betterytm-song-playlists
// @homepageURL  https://github.com/eissar/betterytm-song-playlists
// @source       https://github.com/eissar/betterytm-song-playlists.git
// @supportURL   https://github.com/eissar/betterytm-song-playlists/issues
// @match        https://youtube.com/*
// @match        https://music.youtube.com/*
// @resource     doc_license     https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/65df5a3/LICENSE.txt
// @resource     icon_1000       https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/65df5a3/assets/plugin_icon_1000x1000.png#sha256=IrFR29ZTCXuH5WsSVcmPn5FA+GvBopOyGR9lFSi4s5c=
// @resource     icon_128        https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/65df5a3/assets/plugin_icon_128x128.png#sha256=4GgH3wuDgVjYVPf1s6NURcDU0QvjnLCigrlKowsF6x8=
// @resource     library_lodash  https://cdn.jsdelivr.net/npm/lodash@4.17.21#sha256=qXBd/EfAdjOA2FGrGAG+b3YBn2tn5A6bhz+LSgYD96k=
// @resource     script_example  https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/65df5a3/assets/resourceExample.js#sha256=2pnooQQ8m6WU1xPIgSJ4bI4ilHjIWg/BxaPX7eIshS0=
// @connect      i.ytimg.com
// @connect      youtube.com
// @connect      github.com
// @connect      raw.githubusercontent.com
// @grant        unsafeWindow
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  var PluginIntent = /* @__PURE__ */ ((PluginIntent2) => {
    PluginIntent2[PluginIntent2["ReadFeatureConfig"] = 1] = "ReadFeatureConfig";
    PluginIntent2[PluginIntent2["WriteFeatureConfig"] = 2] = "WriteFeatureConfig";
    PluginIntent2[PluginIntent2["SeeHiddenConfigValues"] = 4] = "SeeHiddenConfigValues";
    PluginIntent2[PluginIntent2["WriteLyricsCache"] = 8] = "WriteLyricsCache";
    PluginIntent2[PluginIntent2["WriteTranslations"] = 16] = "WriteTranslations";
    PluginIntent2[PluginIntent2["CreateModalDialogs"] = 32] = "CreateModalDialogs";
    PluginIntent2[PluginIntent2["ReadAutoLikeData"] = 64] = "ReadAutoLikeData";
    PluginIntent2[PluginIntent2["WriteAutoLikeData"] = 128] = "WriteAutoLikeData";
    PluginIntent2[PluginIntent2["InternalAccess"] = 256] = "InternalAccess";
    PluginIntent2[PluginIntent2["FullAccess"] = 512] = "FullAccess";
    return PluginIntent2;
  })(PluginIntent || {});
  const userscriptName = "BetterYTM Song Playlists";
  const description = "Enumerates and shows which of your playlists contain the selected song in YouTube Music.";
  const version = "0.1.0";
  const homepage = "https://github.com/eissar/betterytm-song-playlists";
  const namespace = "https://github.com/eissar";
  const license = "MIT";
  const licenseUrl = "https://github.com/eissar/betterytm-song-playlists/blob/main/LICENSE.txt";
  const bugs = {
    url: "https://github.com/eissar/betterytm-song-playlists/issues"
  };
  const packageJson = {
    userscriptName,
    description,
    version,
    homepage,
    namespace,
    license,
    licenseUrl,
    bugs
  };
  const pluginDef = {
    // The permissions of the plugin:
    intents: PluginIntent.ReadFeatureConfig | PluginIntent.CreateModalDialogs,
    // The metadata of the plugin:
    plugin: {
      name: packageJson.userscriptName,
      namespace: packageJson.namespace,
      description: {
        "en-US": packageJson.description
      },
      homepage: {
        source: packageJson.homepage,
        bug: packageJson.bugs.url
      },
      version: packageJson.version,
      license: {
        name: packageJson.license,
        url: packageJson.licenseUrl
      },
      // If you have a logo, you can add it here - it should *ideally* be square and between 48x48 and 128x128:
      iconUrl: "https://raw.githubusercontent.com/Sv443/BetterYTM-Plugin-Template/main/assets/plugin_icon_128x128.png"
    }
    // If you have contributors defined in package.json, you can add them here:
    // contributors,
  };
  let events;
  function tryRegisterPlugin({ detail: registerPlugin }) {
    const res = registerPlugin(pluginDef);
    events = res.events;
    res.token;
    return events.once("pluginRegistered");
  }
  const consPrefix = `[${packageJson.userscriptName}]`;
  function log(...args) {
    console.log(consPrefix, ...args);
  }
  const buildModeRaw = "production";
  const buildNumberRaw = "65df5a3";
  const buildMode = buildModeRaw.startsWith("#{{") ? "BUILD_ERROR" : buildModeRaw;
  const buildNumber = buildNumberRaw.startsWith("#{{") ? "BUILD_ERROR" : buildNumberRaw;
  async function getSapisidHash(origin) {
    const match = document.cookie.match(/(?:^|;\s*)(?:SAPISID|__Secure-3PAPISID)=([^;]*)/);
    const sapisid = match ? match[1] : null;
    if (!sapisid) {
      throw new Error("SAPISID cookie not found - user may not be logged in.");
    }
    const now = Math.floor(Date.now() / 1e3);
    const buffer = await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(`${now} ${sapisid} ${origin}`)
    );
    const hash = Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${now}_${hash}`;
  }
  async function getContainingPlaylists(videoId) {
    const ytcfg = unsafeWindow.ytcfg;
    const apiKey = ytcfg == null ? void 0 : ytcfg.get("INNERTUBE_API_KEY");
    if (!apiKey) {
      throw new Error("INNERTUBE_API_KEY not found in ytcfg.");
    }
    const origin = location.origin;
    const sapisidHash = await getSapisidHash(origin);
    const res = await fetch(`/youtubei/v1/playlist/get_add_to_playlist?key=${apiKey}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `SAPISIDHASH ${sapisidHash}`,
        "X-Origin": origin,
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20250101.00.00"
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20250101.00.00",
            hl: "en",
            gl: "US"
          }
        },
        videoIds: [videoId],
        excludeWatchLater: false
      })
    });
    if (!res.ok) {
      throw new Error(`InnerTube request failed: HTTP ${res.status}`);
    }
    const json = await res.json();
    const renderers = [];
    const walk = (o) => {
      if (!o || typeof o !== "object") return;
      const rec = o;
      if (rec.playlistAddToOptionRenderer) {
        renderers.push(rec.playlistAddToOptionRenderer);
      }
      for (const v of Object.values(rec)) walk(v);
    };
    walk(json);
    return renderers.filter((r) => r.containsSelectedVideos === "ALL").map((r) => {
      var _a, _b, _c, _d;
      return {
        title: ((_c = (_b = (_a = r.title) == null ? void 0 : _a.runs) == null ? void 0 : _b[0]) == null ? void 0 : _c.text) || ((_d = r.title) == null ? void 0 : _d.simpleText) || "Untitled Playlist",
        playlistId: r.playlistId
      };
    });
  }
  function resolveVideoId(menuPopup) {
    var _a, _b, _c, _d, _e, _f;
    let el = menuPopup;
    while (el && el !== document.body) {
      const dataObj = el;
      if ((_a = dataObj.data) == null ? void 0 : _a.videoId) return dataObj.data.videoId;
      if ((_b = dataObj.__data) == null ? void 0 : _b.videoId) return dataObj.__data.videoId;
      el = el.parentElement;
    }
    const items = menuPopup.querySelectorAll("ytmusic-menu-service-item-renderer, ytmusic-menu-navigation-item-renderer");
    for (const item of items) {
      const data = item.data;
      const ep = (data == null ? void 0 : data.serviceEndpoint) || (data == null ? void 0 : data.navigationEndpoint);
      const vid = ((_c = ep == null ? void 0 : ep.watchEndpoint) == null ? void 0 : _c.videoId) || ((_e = (_d = ep == null ? void 0 : ep.queueAddEndpoint) == null ? void 0 : _d.queueTarget) == null ? void 0 : _e.videoId) || ((_f = ep == null ? void 0 : ep.shareEntityEndpoint) == null ? void 0 : _f.serializedShareEntity);
      if (vid && vid.length === 11) return vid;
    }
    return new URLSearchParams(location.search).get("v");
  }
  function initMenuInjector() {
    const { addSelectorListener, onInteraction, showPrompt } = unsafeWindow.BYTM;
    addSelectorListener(
      "popupContainer",
      "tp-yt-iron-dropdown ytmusic-menu-popup-renderer tp-yt-paper-listbox",
      {
        listener: (listbox) => {
          if (listbox.querySelector(".bytm-song-playlists-item")) return;
          const menuPopup = listbox.closest("ytmusic-menu-popup-renderer");
          const videoId = resolveVideoId(menuPopup || listbox);
          if (!videoId) return;
          const sampleItem = listbox.querySelector(
            "ytmusic-menu-service-item-renderer, ytmusic-menu-navigation-item-renderer"
          );
          if (!sampleItem) return;
          const menuItem = sampleItem.cloneNode(true);
          menuItem.classList.add("bytm-song-playlists-item");
          menuItem.removeAttribute("id");
          const updateLabel = (text) => {
            var _a;
            const itemPolymer = menuItem;
            if (itemPolymer.data) {
              itemPolymer.data = { ...itemPolymer.data, text: { runs: [{ text }] } };
            }
            const label = ((_a = menuItem.shadowRoot) == null ? void 0 : _a.querySelector("#text")) || menuItem.querySelector("yt-formatted-string");
            if (label) label.textContent = text;
          };
          const itemWithData = menuItem;
          itemWithData.data = {
            text: { runs: [{ text: "In which playlists?" }] },
            icon: { iconType: "QUEUE_MUSIC" },
            serviceEndpoint: null
          };
          updateLabel("In which playlists?");
          onInteraction(menuItem, async (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            updateLabel("Checking playlists...");
            try {
              const playlists = await getContainingPlaylists(videoId);
              const dropdown = listbox.closest(
                "tp-yt-iron-dropdown"
              );
              if (dropdown && typeof dropdown.close === "function") {
                dropdown.close();
              }
              if (playlists.length > 0) {
                const listText = playlists.map((p) => `• ${p.title}`).join("\n");
                await showPrompt({
                  title: "Containing Playlists",
                  message: `This song is in ${playlists.length} playlist(s):

${listText}`,
                  type: "alert",
                  confirmBtnText: "Close"
                });
              } else {
                await showPrompt({
                  title: "Containing Playlists",
                  message: "This song is not in any of your playlists.",
                  type: "alert",
                  confirmBtnText: "Close"
                });
              }
            } catch (err) {
              log("Error fetching playlists:", err);
              updateLabel("Error checking");
            }
          });
          listbox.appendChild(menuItem);
        }
      }
    );
  }
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

})();