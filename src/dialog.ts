import { token } from "@utils/plugin.js";
import { log } from "@utils/logging.js";
import type { PlaylistResult } from "@/playlists.js";

/**
 * Shows a custom BytmDialog listing all playlists that contain the song.
 */
export async function showPlaylistListDialog(playlists: PlaylistResult[]) {
  const bytm = unsafeWindow.BYTM;
  log(`showPlaylistListDialog: BYTM=${typeof bytm}, token=${token ? "ok" : "missing"}, getBytmDialog=${typeof bytm?.getBytmDialog}`);

  const BytmDialogClass =
    (typeof bytm?.getBytmDialog === "function" ? bytm.getBytmDialog(token) : undefined);

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
      renderBody: () => buildPlaylistListBody(playlists, () => dialog.close()),
    });
    await dialog.open();
    return dialog;
  }

  log("BytmDialog unavailable, using standalone dialog");
  return showStandalonePlaylistDialog(playlists);
}

/**
 * Navigates using YTM's internal SPA router by firing a bubbling `yt-navigate` CustomEvent with a browse endpoint.
 * This is the same mechanism YTM's own components use (Polymer `uR("yt-navigate")` -> `onYtNavigate_`),
 * keeping playback alive when going back in history. Falls back to false if the app element is missing.
 */
function navigateToPlaylistInternal(playlistId: string): boolean {
  const app = document.querySelector("ytmusic-app");
  if (!app) return false;
  const endpoint = {
    browseEndpoint: {
      browseId: `VL${playlistId}`,
      canonicalBaseUrl: `/playlist?list=${encodeURIComponent(playlistId)}`,
    },
  };
  app.dispatchEvent(new CustomEvent("yt-navigate", { bubbles: true, composed: true, detail: { endpoint } }));
  return true;
}

/** Builds the scrollable playlist list body, shared between the BytmDialog and standalone dialog paths */
function buildPlaylistListBody(playlists: PlaylistResult[], onClose: () => void) {
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

    // Icon
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
      // Middle-click / modified clicks keep native new-tab behavior via the href
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

      // Plain left click: use YTM's internal SPA navigation so history back doesn't interrupt playback
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

/** Self-contained modal dialog that does not depend on any BYTM internals */
function showStandalonePlaylistDialog(playlists: PlaylistResult[]) {
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
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  function close() {
    overlay.remove();
    document.removeEventListener("keydown", escHandler, true);
  }

  document.addEventListener("keydown", escHandler, true);
  document.body.appendChild(overlay);
}
