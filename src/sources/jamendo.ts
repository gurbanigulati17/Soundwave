// Jamendo: about 600,000 Creative Commons tracks (https://developer.jamendo.com).
// Needs a free client ID; without one this source is simply switched off.

import type { Track } from "../types";

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string | undefined;

/* eslint-disable @typescript-eslint/no-explicit-any */
function toTrack(t: any): Track {
  return {
    id: `jamendo:${t.id}`,
    source: "jamendo",
    title: t.name,
    artist: t.artist_name,
    artwork: t.album_image || t.image || undefined,
    duration: t.duration,
    genre: t.musicinfo?.tags?.genres?.[0],
    streamUrl: t.audio,
  };
}

async function tracks(params: Record<string, string>): Promise<Track[]> {
  if (!CLIENT_ID) return [];
  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    format: "json",
    limit: "20",
    audioformat: "mp32",
    imagesize: "300",
    include: "musicinfo",
    ...params,
  });
  const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?${query}`);
  if (!res.ok) throw new Error(`Jamendo returned ${res.status}`);
  const json = await res.json();
  return (json.results ?? []).filter((t: any) => t.audio).map(toTrack);
}

export const jamendo = {
  enabled: Boolean(CLIENT_ID),
  popular: () => tracks({ order: "popularity_week" }),
  search: (q: string) => tracks({ search: q, order: "relevance" }),
};
