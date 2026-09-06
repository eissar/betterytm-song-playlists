/**
 * YouTube InnerTube dynamic playlist containment checker
 */

export interface PlaylistResult {
  title: string;
  playlistId: string;
}

/**
 * Derives the SAPISIDHASH required for YouTube's 1st-party CORS requests.
 */
async function getSapisidHash(origin: string): Promise<string> {
  const match = document.cookie.match(/(?:^|;\s*)(?:SAPISID|__Secure-3PAPISID)=([^;]*)/);
  const sapisid = match ? match[1] : null;
  if (!sapisid) {
    throw new Error("SAPISID cookie not found - user may not be logged in.");
  }
  const now = Math.floor(Date.now() / 1000);
  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${now} ${sapisid} ${origin}`)
  );
  const hash = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${now}_${hash}`;
}

/**
 * Checks which user playlists contain the specified video in a single POST call.
 */
export async function getContainingPlaylists(videoId: string): Promise<PlaylistResult[]> {
  const ytcfg = (unsafeWindow as unknown as { ytcfg?: { get: (k: string) => unknown } }).ytcfg;
  const apiKey = ytcfg?.get("INNERTUBE_API_KEY") as string | undefined;
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
      "X-YouTube-Client-Version": "2.20250101.00.00",
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20250101.00.00",
          hl: "en",
          gl: "US",
        },
      },
      videoIds: [videoId],
      excludeWatchLater: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`InnerTube request failed: HTTP ${res.status}`);
  }

  const json = await res.json();
  const renderers: Array<{
    containsSelectedVideos?: string;
    playlistId: string;
    title?: { runs?: Array<{ text: string }>; simpleText?: string };
  }> = [];

  const walk = (o: unknown) => {
    if (!o || typeof o !== "object") return;
    const rec = o as Record<string, unknown>;
    if (rec.playlistAddToOptionRenderer) {
      renderers.push(rec.playlistAddToOptionRenderer as (typeof renderers)[0]);
    }
    for (const v of Object.values(rec)) walk(v);
  };
  walk(json);

  return renderers
    .filter((r) => r.containsSelectedVideos === "ALL")
    .map((r) => ({
      title: r.title?.runs?.[0]?.text || r.title?.simpleText || "Untitled Playlist",
      playlistId: r.playlistId,
    }));
}
