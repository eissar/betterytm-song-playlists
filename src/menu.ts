import { getContainingPlaylists } from "@/playlists.js";
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

  // 3. Fallback: video ID from current URL
  return new URLSearchParams(location.search).get("v");
}

/**
 * Sets up menu injection using BetterYTM's selector listener on popupContainer.
 */
export function initMenuInjector() {
  const { addSelectorListener, onInteraction, showPrompt } = unsafeWindow.BYTM;

  addSelectorListener(
    "popupContainer",
    "tp-yt-iron-dropdown ytmusic-menu-popup-renderer tp-yt-paper-listbox",
    {
      listener: (listbox: HTMLElement) => {
        if (listbox.querySelector(".bytm-song-playlists-item")) return;

        const menuPopup = listbox.closest("ytmusic-menu-popup-renderer") as HTMLElement | null;
        const videoId = resolveVideoId(menuPopup || listbox);
        if (!videoId) return;

        const sampleItem = listbox.querySelector(
          "ytmusic-menu-service-item-renderer, ytmusic-menu-navigation-item-renderer"
        );
        if (!sampleItem) return;

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

        onInteraction(menuItem, async (evt) => {
          evt.stopPropagation();
          evt.preventDefault();

          updateLabel("Checking playlists...");

          try {
            const playlists = await getContainingPlaylists(videoId);

            // Close the dropdown popup
            const dropdown = listbox.closest(
              "tp-yt-iron-dropdown"
            ) as (HTMLElement & { close?: () => void }) | null;
            if (dropdown && typeof dropdown.close === "function") {
              dropdown.close();
            }

            if (playlists.length > 0) {
              const listText = playlists.map((p) => `• ${p.title}`).join("\n");
              await showPrompt({
                title: "Containing Playlists",
                message: `This song is in ${playlists.length} playlist(s):\n\n${listText}`,
                type: "alert",
                confirmBtnText: "Close",
              });
            } else {
              await showPrompt({
                title: "Containing Playlists",
                message: "This song is not in any of your playlists.",
                type: "alert",
                confirmBtnText: "Close",
              });
            }
          } catch (err) {
            log("Error fetching playlists:", err);
            updateLabel("Error checking");
          }
        });

        listbox.appendChild(menuItem);
      },
    }
  );
}
