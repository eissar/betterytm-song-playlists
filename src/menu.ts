import { getContainingPlaylists } from "@/playlists.js";
import { showPlaylistListDialog } from "@/dialog.js";
import { token } from "@utils/plugin.ts";
import { log } from "@utils/logging.js";

/**
 * Resolves the videoId of the song associated with the open three-dot menu.
 */
function resolveVideoId(menuPopup: HTMLElement): string | null {
  // 1. Check polymer data attached to ancestors/dataHost
  let el: HTMLElement | null = menuPopup;
  while (el && el !== document.body) {
    const dataObj = (el as unknown as { data?: { videoId?: string }; __data?: { videoId?: string } });
    if (dataObj.data?.videoId) return dataObj.data.videoId;
    if (dataObj.__data?.videoId) return dataObj.__data.videoId;
    el = el.parentElement;
  }

  // 2. Inspect menu items for watch/queue endpoints
  const items = menuPopup.querySelectorAll("ytmusic-menu-service-item-renderer, ytmusic-menu-navigation-item-renderer");
  for (const item of items) {
    const data = (item as unknown as {
      data?: {
        serviceEndpoint?: {
          watchEndpoint?: { videoId?: string };
          queueAddEndpoint?: { queueTarget?: { videoId?: string } };
          shareEntityEndpoint?: { serializedShareEntity?: string };
        };
        navigationEndpoint?: {
          watchEndpoint?: { videoId?: string };
        };
      };
    }).data;

    const ep = data?.serviceEndpoint || data?.navigationEndpoint;
    const vid =
      ep?.watchEndpoint?.videoId ||
      ep?.queueAddEndpoint?.queueTarget?.videoId ||
      ep?.shareEntityEndpoint?.serializedShareEntity;

    if (vid && vid.length === 11) return vid;
  }

  return null;
}

/**
 * Sets up menu injection using BetterYTM's selector listener on popupContainer.
 */
export function initMenuInjector() {
  log("Initializing menu observer...");

  const onListboxFound = (listbox: HTMLElement) => {
    if (listbox.querySelector(".bytm-song-playlists-item")) return;

    // Verify this is a song/track popup menu by checking for common menu items
    const sampleItem = listbox.querySelector(
      "ytmusic-menu-service-item-renderer, ytmusic-menu-navigation-item-renderer"
    );
    if (!sampleItem) return;

    const menuPopup = listbox.closest("ytmusic-menu-popup-renderer") as HTMLElement | null;
    const videoId = resolveVideoId(menuPopup || listbox);
    if (!videoId) return;

    log("Found song context menu for videoId:", videoId);

    // Clone an existing item to keep native Polymer shadow DOM, styling, and ripple effects intact
    const menuItem = sampleItem.cloneNode(true) as HTMLElement;
    menuItem.classList.add("bytm-song-playlists-item");
    menuItem.removeAttribute("id");

    const updateLabel = (text: string) => {
      const itemPolymer = menuItem as unknown as { data?: { text?: { runs?: Array<{ text: string }> } } };
      if (itemPolymer.data) {
        itemPolymer.data = { ...itemPolymer.data, text: { runs: [{ text }] } };
      }
      const label =
        menuItem.shadowRoot?.querySelector("#text") ||
        menuItem.querySelector("yt-formatted-string");
      if (label) label.textContent = text;
    };

    // Initialize label & icon
    const itemWithData = menuItem as unknown as {
      data?: {
        text?: { runs?: Array<{ text: string }> };
        icon?: { iconType: string };
        serviceEndpoint?: null;
      };
    };
    itemWithData.data = {
      text: { runs: [{ text: "In which playlists?" }] },
      icon: { iconType: "QUEUE_MUSIC" },
      serviceEndpoint: null,
    };
    updateLabel("In which playlists?");

    menuItem.addEventListener("click", async (evt) => {
      evt.stopPropagation();
      evt.preventDefault();

      updateLabel("Checking playlists...");

      try {
        const playlists = await getContainingPlaylists(videoId);

        // Close dropdown
        const dropdown = listbox.closest("tp-yt-iron-dropdown") as (HTMLElement & { close?: () => void }) | null;
        if (dropdown && typeof dropdown.close === "function") {
          dropdown.close();
        }

        try {
          await showPlaylistListDialog(playlists);
        } catch (dialogErr) {
          log("Dialog display error, fallback to prompt:", dialogErr);
          const listText =
            playlists.length > 0
              ? `This song is in ${playlists.length} playlist(s):\n\n` + playlists.map((p) => `• ${p.title}`).join("\n")
              : "This song is not in any of your playlists.";

          if (unsafeWindow.BYTM?.showPrompt) {
            await unsafeWindow.BYTM.showPrompt(token, {
              title: "Containing Playlists",
              message: listText,
              type: "alert",
              confirmBtnText: "Close",
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

  // Observe the document body for any popup iron-dropdown opening
  const observer = new MutationObserver(() => {
    const listboxes = document.querySelectorAll<HTMLElement>(
      "tp-yt-iron-dropdown ytmusic-menu-popup-renderer tp-yt-paper-listbox, ytmusic-popup-container tp-yt-paper-listbox"
    );
    listboxes.forEach(onListboxFound);
  });

  const attachObserver = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      // Run once for already opened elements
      const existing = document.querySelectorAll<HTMLElement>(
        "tp-yt-iron-dropdown ytmusic-menu-popup-renderer tp-yt-paper-listbox, ytmusic-popup-container tp-yt-paper-listbox"
      );
      existing.forEach(onListboxFound);
    } else {
      document.addEventListener("DOMContentLoaded", attachObserver, { once: true });
    }
  };

  attachObserver();
}
