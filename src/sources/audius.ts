// Audius: an open music platform with a free public API (https://docs.audius.org).
// Full tracks stream straight from /v1/tracks/{id}/stream; no key is needed,
// only an app_name identifying this app.

import type { Artist, Playlist, Track } from "../types";

const APP_NAME = "Soundwave";
const GATEWAY = "https://api.audius.co";

let hostPromise: Promise<string> | null = null;

/** Picks a discovery node from Audius's published list, falling back to the gateway. */
function host(): Promise<string> {
  hostPromise ??= (async () => {
    try {
      const res = await fetch(GATEWAY);
      const json = await res.json();
      const hosts: unknown = json?.data;
      if (Array.isArray(hosts) && hosts.length && typeof hosts[0] === "string") {
        return hosts[Math.floor(Math.random() * hosts.length)];
      }
    } catch {
      // fall through to the gateway
    }
    return GATEWAY;
  })();
  return hostPromise;
}

async function get<T>(path: string, params: Record<string, string | number> = {}, retried = false): Promise<T> {
  const base = await host();
  const query = new URLSearchParams({ app_name: APP_NAME, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  try {
    const res = await fetch(`${base}/v1${path}?${query}`);
    if (!res.ok) throw new Error(`Audius returned ${res.status}`);
    return (await res.json()).data as T;
  } catch (e) {
    // A single node can be down; retry once through the gateway.
    if (retried) throw e;
    hostPromise = Promise.resolve(GATEWAY);
    return get<T>(path, params, true);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

const art = (a: Raw, size = "480x480"): string | undefined => a?.[size] ?? a?.["150x150"] ?? a?.["1000x1000"] ?? undefined;

function toTrack(t: Raw, base: string): Track {
  return {
    id: `audius:${t.id}`,
    source: "audius",
    title: t.title,
    artist: t.user?.name ?? "Unknown artist",
    artistId: t.user?.id,
    artwork: art(t.artwork),
    duration: t.duration,
    genre: t.genre || undefined,
    plays: t.play_count,
    streamUrl: `${base}/v1/tracks/${t.id}/stream?app_name=${APP_NAME}`,
  };
}

// Gated (paid or follow-only) and unstreamable tracks would fail to play.
const playable = (t: Raw) => t && !t.stream_conditions && t.is_streamable !== false && !t.is_delete;

async function tracks(path: string, params: Record<string, string | number> = {}): Promise<Track[]> {
  const data = await get<Raw[]>(path, params);
  const base = await host();
  return (data ?? []).filter(playable).map((t) => toTrack(t, base));
}

function toArtist(u: Raw): Artist {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    avatar: art(u.profile_picture),
    cover: u.cover_photo?.["2000x"] ?? u.cover_photo?.["640x"],
    bio: u.bio ?? undefined,
    followers: u.follower_count,
    trackCount: u.track_count,
  };
}

function toPlaylist(p: Raw): Playlist {
  return {
    id: p.id,
    name: p.playlist_name,
    artwork: art(p.artwork),
    owner: p.user?.name ?? "",
    ownerId: p.user?.id,
    description: p.description ?? undefined,
    trackCount: p.track_count,
  };
}

export const GENRES = [
  "Electronic",
  "Hip-Hop/Rap",
  "Pop",
  "Lo-Fi",
  "R&B/Soul",
  "Alternative",
  "House",
  "Ambient",
  "Rock",
  "Jazz",
  "Acoustic",
  "Latin",
  "World",
  "Classical",
];

export const audius = {
  trending: (genre?: string, time: "week" | "month" | "allTime" = "week") =>
    tracks("/tracks/trending", { time, ...(genre ? { genre } : {}) }),
  underground: () => tracks("/tracks/trending/underground", { limit: 20 }),
  searchTracks: (query: string) => tracks("/tracks/search", { query, limit: 20 }),

  searchArtists: async (query: string) => (await get<Raw[]>("/users/search", { query, limit: 12 })).map(toArtist),
  artist: async (id: string) => toArtist(await get<Raw>(`/users/${id}`)),
  artistTracks: (id: string) => tracks(`/users/${id}/tracks`, { limit: 50, sort: "plays" }),

  trendingPlaylists: async () => (await get<Raw[]>("/playlists/trending", { time: "week", limit: 20 })).map(toPlaylist),
  searchPlaylists: async (query: string) => (await get<Raw[]>("/playlists/search", { query, limit: 12 })).map(toPlaylist),
  playlist: async (id: string) => {
    const data = await get<Raw[] | Raw>(`/playlists/${id}`);
    return toPlaylist(Array.isArray(data) ? data[0] : data);
  },
  playlistTracks: (id: string) => tracks(`/playlists/${id}/tracks`),
};
