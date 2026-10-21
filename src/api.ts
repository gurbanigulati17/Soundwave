import { getAccessToken } from "./auth";
import type {
  Album,
  Artist,
  Paging,
  PlayHistory,
  Playlist,
  PlaylistItem,
  SavedAlbum,
  SavedTrack,
  SearchResults,
  Track,
  User,
} from "./types";

const BASE = "https://api.spotify.com/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(path.startsWith("http") ? path : `${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (res.status === 429) {
    const wait = Number(res.headers.get("Retry-After") ?? "1");
    await new Promise((r) => setTimeout(r, wait * 1000));
    return request(path, init);
  }
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      // body was not JSON
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204 || res.headers.get("Content-Length") === "0") return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Normalises a playlist entry across Spotify's `track` / `item` field names. */
export function playlistTrack(entry: PlaylistItem): Track | null {
  return entry.item ?? entry.track ?? null;
}

/** Normalises a playlist's track collection across `tracks` / `items`. */
export function playlistItems(playlist: Playlist): Paging<PlaylistItem> | { total: number } | undefined {
  return playlist.items ?? playlist.tracks;
}

export const api = {
  me: () => request<User>("/me"),

  recentlyPlayed: () => request<{ items: PlayHistory[] }>("/me/player/recently-played?limit=20"),
  topTracks: () => request<Paging<Track>>("/me/top/tracks?limit=20&time_range=short_term"),
  topArtists: () => request<Paging<Artist>>("/me/top/artists?limit=20&time_range=medium_term"),

  myPlaylists: (offset = 0) => request<Paging<Playlist>>(`/me/playlists?limit=50&offset=${offset}`),
  savedAlbums: () => request<Paging<SavedAlbum>>("/me/albums?limit=50"),
  savedTracks: (offset = 0) => request<Paging<SavedTrack>>(`/me/tracks?limit=50&offset=${offset}`),

  playlist: (id: string) => request<Playlist>(`/playlists/${id}`),
  album: (id: string) => request<Album>(`/albums/${id}`),
  artist: (id: string) => request<Artist>(`/artists/${id}`),
  artistTopTracks: (id: string) => request<{ tracks: Track[] }>(`/artists/${id}/top-tracks`),
  artistAlbums: (id: string) =>
    request<Paging<Album>>(`/artists/${id}/albums?include_groups=album,single&limit=20`),

  next: <T>(url: string) => request<Paging<T>>(url),

  search: (q: string) =>
    request<SearchResults>(
      `/search?${new URLSearchParams({ q, type: "track,artist,album,playlist", limit: "10" })}`,
    ),

  play: (deviceId: string, body: { context_uri?: string; uris?: string[]; offset?: { uri: string } }) =>
    request<void>(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  transfer: (deviceId: string) =>
    request<void>("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    }),
  shuffle: (state: boolean, deviceId: string) =>
    request<void>(`/me/player/shuffle?state=${state}&device_id=${encodeURIComponent(deviceId)}`, {
      method: "PUT",
    }),
  repeat: (state: "off" | "context" | "track", deviceId: string) =>
    request<void>(`/me/player/repeat?state=${state}&device_id=${encodeURIComponent(deviceId)}`, {
      method: "PUT",
    }),
};
