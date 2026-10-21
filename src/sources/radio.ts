// Radio Browser: an open directory of internet radio stations (https://www.radio-browser.info).
// Licensed stations play mainstream music, so this is how the app offers chart hits legally.

import type { Station } from "../types";

const SERVERS = [
  "https://de1.api.radio-browser.info",
  "https://fi1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
];

let preferred = 0;

async function get(path: string, params: Record<string, string> = {}): Promise<unknown[]> {
  const query = new URLSearchParams({ hidebroken: "true", ...params });
  let lastError: unknown;
  for (let i = 0; i < SERVERS.length; i++) {
    const idx = (preferred + i) % SERVERS.length;
    try {
      const res = await fetch(`${SERVERS[idx]}/json${path}?${query}`);
      if (!res.ok) throw new Error(`Radio Browser returned ${res.status}`);
      preferred = idx;
      return await res.json();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toStations(list: unknown[]): Station[] {
  const seen = new Set<string>();
  const out: Station[] = [];
  for (const s of list as any[]) {
    // The app is served over HTTPS, so plain-HTTP streams would be blocked.
    if (!s.url_resolved?.startsWith("https://")) continue;
    const key = s.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: s.stationuuid,
      name: s.name.trim(),
      url: s.url_resolved,
      favicon: s.favicon?.startsWith("https://") ? s.favicon : undefined,
      tags: String(s.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean).slice(0, 3),
      country: s.country || undefined,
      bitrate: s.bitrate || undefined,
    });
  }
  return out;
}

const search = (params: Record<string, string>, limit = 24) =>
  get("/stations/search", { order: "clickcount", reverse: "true", is_https: "true", limit: String(limit * 2), ...params }).then(
    (l) => toStations(l).slice(0, limit),
  );

export const RADIO_CATEGORIES = [
  { id: "bollywood", label: "Bollywood", color: "#e1730c" },
  { id: "punjabi", label: "Punjabi", color: "#c2185b" },
  { id: "hindi", label: "Hindi", color: "#8d67ab" },
  { id: "hits", label: "Top Hits", color: "#1e64d6" },
  { id: "pop", label: "Pop", color: "#e8115b" },
  { id: "lofi", label: "Lo-fi", color: "#477d95" },
  { id: "chillout", label: "Chill", color: "#27856a" },
  { id: "hiphop", label: "Hip-Hop", color: "#ba5d07" },
  { id: "jazz", label: "Jazz", color: "#503750" },
  { id: "classical", label: "Classical", color: "#7d4b32" },
];

export const radio = {
  byTag: (tag: string, limit?: number) => search({ tag }, limit),
  byName: (name: string, limit?: number) => search({ name }, limit),
  popular: (limit = 24) => search({}, limit),
  /** Tells Radio Browser a station was played, which keeps its popularity ranking honest. */
  reportClick: (id: string) => {
    fetch(`${SERVERS[preferred]}/json/url/${id}`).catch(() => undefined);
  },
};
