<div style="text-align: center;" align="center">

<h2>BetterYTM - Song Playlists</h2>
<p>Dynamically shows which of your playlists contain the currently selected song in YouTube Music.</p>

</div>

> ⚡ *Vibecoded using Gemini 3.8 Flash.*

---

## Overview

This plugin injects an **"In which playlists?"** action directly into YouTube Music's native 3-dot context menu for any song.

Unlike approaches that scrape and paginate across every playlist, this plugin leverages YouTube's dynamic InnerTube endpoint (`/youtubei/v1/playlist/get_add_to_playlist`) with web client headers. It determines playlist containment across your entire library in a **single server-side request**.

## Installation

Install the built userscript via Violentmonkey or Tampermonkey:
- [Download / Install UserScript](https://github.com/eissar/betterytm-song-playlists/releases/latest/download/betterytm-song-playlists.user.js)

## Development

```bash
# Install dependencies
npm install

# Build userscript
npm run build
```

## License

MIT
