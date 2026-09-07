# TODO - 0.2.0

## Feature: "Find in Playlists" / Show Playlists Containing Song
1. **Modal / UI Prompt**: Investigate if it is possible to open a modal similar to the "Save to playlist" prompt that lists all playlists currently containing the selected track/song. [Completed - Implemented via `BytmDialog` in `src/dialog.ts`]
2. **Navigation**: Clicking on one of these listed playlists should navigate to / open that playlist directly (rather than toggling add/remove from playlist). [Completed - Integrated into `BytmDialog` playlist items via `/playlist?list=...` links]
3. **Action Icon**: Improve appearance with a dedicated action icon (can reuse/copy the "Save to playlist" icon for now). [Pending]
4. **Navigation method is wrong for playlist items**: We currently use plain `<a href="/playlist?list=...">` links, which triggers full document navigation — going **back** in history interrupts/reloads playback. Need to use whatever YTM uses internally for client-side navigation (Polymer router / `ytm-navigate`-style data endpoints / the app's internal `navigateTo`), so history back/forward keeps continuous playback. Investigate how YTM's own menu items navigate (e.g. `watchEndpoint`/`browseEndpoint` + the page's navigation service) and reuse that. [Completed - v0.2.1 fires YTM's internal bubbling `yt-navigate` CustomEvent on `ytmusic-app` with `browseEndpoint: { browseId: "VL<id>", canonicalBaseUrl: "/playlist?list=<id>" }`, grounded in YTM's own `music_polymer_inlined_html.js`]
5. **Remove URL `?v=` fallback in `resolveVideoId`**: [Completed in v0.2.3]
   - In `src/menu.ts`, `resolveVideoId` checks:
     1. Walk up the DOM tree from the popup checking Polymer's private instance state (`el.data.videoId` or `el.__data.videoId`).
     2. If not found, inspect sibling menu items (like "Add to playlist" or "Start radio") which contain navigation endpoints with the video ID:
        ```typescript
        item.data?.serviceEndpoint?.queueAddEndpoint?.queueTarget?.videoId
        ```
     3. If neither matches, safely returns `null` instead of falling back to the current URL.

## Research Notes & Findings

### 1. Modal Options ("Save to playlist" look & feel)
- **Option A: Custom `BytmDialog` (Implemented)**
  - The plugin requests `PluginIntent.CreateModalDialogs`.
  - Obtained `BytmDialog` via `unsafeWindow.BYTM.getBytmDialog(token)`.
  - Configured dark-theme modal popup with scrollable list of playlists containing the song, custom playlist icons, and hover styles.
  - Clicking any playlist closes the dialog and navigates directly to `/playlist?list=...`.
- **Option B: Hijacking native YTM `ytmusic-playlist-add-to-option-renderer` / native dialog**
  - Native list items are check/toggle boxes wired to mutate playlist state (`playlistEditEndpoint`). Intercepting click events without triggering playlist modifications is brittle. `BytmDialog` avoids these side-effects.

### 2. Dynamic Loading via Local Dev Server (Violentmonkey / Tampermonkey)
- Tampermonkey supports loading userscripts dynamically during development via `http://localhost:...` using `@require` pointing to the dev server or through Tampermonkey's "Track local files / Update URL" mechanism.
- Tampermonkey also allows resources to be served locally from `http://localhost:8767/...` when running `npm run dev` / `npm run serve`.


