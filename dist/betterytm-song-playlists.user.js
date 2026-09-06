// ==UserScript==
// @name         BetterYTM Song Playlists
// @namespace    https://github.com/eissar
// @version      0.2.2
// @author       eissar
// @description  Enumerates and shows which of your playlists contain the selected song in YouTube Music.
// @license      MIT
// @copyright    Copyright 2026 eissar
// @icon         https://raw.githubusercontent.com/eissar/betterytm-song-playlists/main/assets/plugin_icon_128x128.png#sha256=4GgH3wuDgVjYVPf1s6NURcDU0QvjnLCigrlKowsF6x8=
// @homepage     https://github.com/eissar/betterytm-song-playlists
// @homepageURL  https://github.com/eissar/betterytm-song-playlists
// @source       https://github.com/eissar/betterytm-song-playlists.git
// @supportURL   https://github.com/eissar/betterytm-song-playlists/issues
// @downloadURL  https://github.com/eissar/betterytm-song-playlists/releases/latest/download/betterytm-song-playlists.user.js
// @updateURL    https://github.com/eissar/betterytm-song-playlists/releases/latest/download/betterytm-song-playlists.user.js
// @match        https://youtube.com/*
// @match        https://music.youtube.com/*
// @resource     icon_1000  https://raw.githubusercontent.com/eissar/betterytm-song-playlists/main/assets/plugin_icon_1000x1000.png#sha256=IrFR29ZTCXuH5WsSVcmPn5FA+GvBopOyGR9lFSi4s5c=
// @resource     icon_128   https://raw.githubusercontent.com/eissar/betterytm-song-playlists/main/assets/plugin_icon_128x128.png#sha256=4GgH3wuDgVjYVPf1s6NURcDU0QvjnLCigrlKowsF6x8=
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
  const version = "0.2.2";
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
      iconUrl: "https://raw.githubusercontent.com/eissar/betterytm-song-playlists/main/assets/plugin_icon_128x128.png"
    }
    // If you have contributors defined in package.json, you can add them here:
    // contributors,
  };
  let token;
  function setRegisteredResult(res) {
    res.events;
    token = res.token;
  }
  function tryRegisterPlugin({ detail: registerPlugin }) {
    const res = registerPlugin(pluginDef);
    setRegisteredResult(res);
    return res;
  }
  const consPrefix = `[${packageJson.userscriptName}]`;
  function log(...args) {
    console.log(consPrefix, ...args);
  }
  const buildModeRaw = "production";
  const buildNumberRaw = "9f6caa3";
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
  async function showPlaylistListDialog(playlists) {
    const bytm = unsafeWindow.BYTM;
    log(`showPlaylistListDialog: BYTM=${typeof bytm}, token=${token ? "ok" : "missing"}, getBytmDialog=${typeof (bytm == null ? void 0 : bytm.getBytmDialog)}, legacy BytmDialog=${typeof (bytm == null ? void 0 : bytm.BytmDialog)}`);
    const BytmDialogClass = (typeof (bytm == null ? void 0 : bytm.getBytmDialog) === "function" ? bytm.getBytmDialog(token) : void 0) ?? (bytm == null ? void 0 : bytm.BytmDialog);
    if (BytmDialogClass) {
      const dialog = new BytmDialogClass({
        id: "song-playlists-dialog",
        width: 450,
        height: 520,
        closeBtnEnabled: true,
        closeOnBgClick: true,
        closeOnEscPress: true,
        destroyOnClose: true,
        removeListenersOnDestroy: true,
        small: true,
        verticalAlign: "center",
        renderHeader: () => {
          const headerEl = document.createElement("h2");
          headerEl.classList.add("bytm-dialog-title");
          headerEl.style.margin = "0";
          headerEl.style.fontSize = "1.2rem";
          headerEl.style.fontWeight = "600";
          headerEl.textContent = "Containing Playlists";
          return headerEl;
        },
        renderBody: () => buildPlaylistListBody(playlists, () => dialog.close())
      });
      await dialog.open();
      return dialog;
    }
    log("BytmDialog unavailable, using standalone dialog");
    return showStandalonePlaylistDialog(playlists);
  }
  function navigateToPlaylistInternal(playlistId) {
    const app = document.querySelector("ytmusic-app");
    if (!app) return false;
    const endpoint = {
      browseEndpoint: {
        browseId: `VL${playlistId}`,
        canonicalBaseUrl: `/playlist?list=${encodeURIComponent(playlistId)}`
      }
    };
    app.dispatchEvent(new CustomEvent("yt-navigate", { bubbles: true, composed: true, detail: { endpoint } }));
    return true;
  }
  function buildPlaylistListBody(playlists, onClose) {
    const cont = document.createElement("div");
    cont.style.display = "flex";
    cont.style.flexDirection = "column";
    cont.style.gap = "8px";
    cont.style.padding = "4px 0";
    cont.style.maxHeight = "380px";
    cont.style.overflowY = "auto";
    if (playlists.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.style.color = "var(--bytm-text-secondary, #aaa)";
      emptyMsg.style.margin = "16px 0";
      emptyMsg.style.textAlign = "center";
      emptyMsg.textContent = "This song is not in any of your playlists.";
      cont.appendChild(emptyMsg);
      return cont;
    }
    const countMsg = document.createElement("p");
    countMsg.style.color = "var(--bytm-text-secondary, #aaa)";
    countMsg.style.margin = "0 0 8px 0";
    countMsg.style.fontSize = "0.9rem";
    countMsg.textContent = `Song is in ${playlists.length} playlist${playlists.length === 1 ? "" : "s"}:`;
    cont.appendChild(countMsg);
    for (const pl of playlists) {
      const item = document.createElement("a");
      item.href = `/playlist?list=${encodeURIComponent(pl.playlistId)}`;
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "12px";
      item.style.padding = "10px 14px";
      item.style.borderRadius = "8px";
      item.style.textDecoration = "none";
      item.style.color = "var(--bytm-text, #fff)";
      item.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
      item.style.transition = "background-color 0.15s ease";
      item.style.cursor = "pointer";
      item.addEventListener("mouseenter", () => {
        item.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      });
      item.addEventListener("mouseleave", () => {
        item.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
      });
      const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      iconSvg.setAttribute("viewBox", "0 0 24 24");
      iconSvg.setAttribute("width", "20");
      iconSvg.setAttribute("height", "20");
      iconSvg.setAttribute("fill", "currentColor");
      iconSvg.style.flexShrink = "0";
      iconSvg.style.opacity = "0.8";
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", "M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z");
      iconSvg.appendChild(pathEl);
      const titleSpan = document.createElement("span");
      titleSpan.textContent = pl.title;
      titleSpan.style.flexGrow = "1";
      titleSpan.style.overflow = "hidden";
      titleSpan.style.textOverflow = "ellipsis";
      titleSpan.style.whiteSpace = "nowrap";
      titleSpan.style.fontSize = "0.95rem";
      item.appendChild(iconSvg);
      item.appendChild(titleSpan);
      item.addEventListener("click", (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClose();
        if (!navigateToPlaylistInternal(pl.playlistId)) {
          window.location.assign(`/playlist?list=${encodeURIComponent(pl.playlistId)}`);
        }
      });
      cont.appendChild(item);
    }
    return cont;
  }
  function showStandalonePlaylistDialog(playlists) {
    const overlay = document.createElement("div");
    overlay.id = "bytm-sp-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;";
    const panel = document.createElement("div");
    panel.style.cssText = "background:#212121;color:#fff;border-radius:12px;padding:20px 24px;width:420px;max-width:92vw;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.6);font-family:Roboto,Arial,sans-serif;";
    const header = document.createElement("h2");
    header.style.cssText = "margin:0 0 12px 0;font-size:1.2rem;font-weight:600;";
    header.textContent = "Containing Playlists";
    panel.appendChild(header);
    panel.appendChild(buildPlaylistListBody(playlists, close));
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText = "margin-top:14px;align-self:flex-end;background:transparent;color:#90caf9;border:1px solid #90caf9;border-radius:18px;padding:6px 18px;font-size:.9rem;cursor:pointer;";
    closeBtn.addEventListener("click", close);
    panel.appendChild(closeBtn);
    overlay.appendChild(panel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    const escHandler = (e) => {
      if (e.key === "Escape") close();
    };
    function close() {
      overlay.remove();
      document.removeEventListener("keydown", escHandler, true);
    }
    document.addEventListener("keydown", escHandler, true);
    document.body.appendChild(overlay);
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
    log("Initializing menu observer...");
    const onListboxFound = (listbox) => {
      if (listbox.querySelector(".bytm-song-playlists-item")) return;
      const sampleItem = listbox.querySelector(
        "ytmusic-menu-service-item-renderer, ytmusic-menu-navigation-item-renderer"
      );
      if (!sampleItem) return;
      const menuPopup = listbox.closest("ytmusic-menu-popup-renderer");
      const videoId = resolveVideoId(menuPopup || listbox);
      if (!videoId) return;
      log("Found song context menu for videoId:", videoId);
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
      menuItem.addEventListener("click", async (evt) => {
        var _a;
        evt.stopPropagation();
        evt.preventDefault();
        updateLabel("Checking playlists...");
        try {
          const playlists = await getContainingPlaylists(videoId);
          const dropdown = listbox.closest("tp-yt-iron-dropdown");
          if (dropdown && typeof dropdown.close === "function") {
            dropdown.close();
          }
          try {
            await showPlaylistListDialog(playlists);
          } catch (dialogErr) {
            log("Dialog display error, fallback to prompt:", dialogErr);
            const listText = playlists.length > 0 ? `This song is in ${playlists.length} playlist(s):

` + playlists.map((p) => `• ${p.title}`).join("\n") : "This song is not in any of your playlists.";
            if ((_a = unsafeWindow.BYTM) == null ? void 0 : _a.showPrompt) {
              await unsafeWindow.BYTM.showPrompt({
                title: "Containing Playlists",
                message: listText,
                type: "alert",
                confirmBtnText: "Close"
              });
            } else {
              alert(listText);
            }
          }
        } catch (err) {
          log("Error fetching playlists:", err);
          updateLabel("Error checking");
        }
      });
      listbox.appendChild(menuItem);
    };
    const observer = new MutationObserver(() => {
      const listboxes = document.querySelectorAll(
        "tp-yt-iron-dropdown ytmusic-menu-popup-renderer tp-yt-paper-listbox, ytmusic-popup-container tp-yt-paper-listbox"
      );
      listboxes.forEach(onListboxFound);
    });
    const attachObserver = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        const existing = document.querySelectorAll(
          "tp-yt-iron-dropdown ytmusic-menu-popup-renderer tp-yt-paper-listbox, ytmusic-popup-container tp-yt-paper-listbox"
        );
        existing.forEach(onListboxFound);
      } else {
        document.addEventListener("DOMContentLoaded", attachObserver, { once: true });
      }
    };
    attachObserver();
  }
  initMenuInjector();
  function onRegister(evt) {
    var _a;
    const customEvt = evt;
    try {
      tryRegisterPlugin(customEvt);
      log(
        `Registered with BetterYTM (v${((_a = unsafeWindow.BYTM) == null ? void 0 : _a.version) ?? "unknown"}, build ${buildNumber}, ${buildMode} mode)`
      );
    } catch (err) {
      console.error("[BetterYTM Song Playlists] Registration error:", err);
    }
  }
  unsafeWindow.addEventListener("bytm:registerPlugin", onRegister, { once: true });
  unsafeWindow.addEventListener("bytm:preInitPlugin", onRegister, { once: true });

})();