export type Source = "audius" | "jamendo" | "local";

export interface Track {
  /** Unique across sources, e.g. "audius:Kz8x1". */
  id: string;
  source: Source;
  title: string;
  artist: string;
  /** Audius user id, when the artist has a page in the app. */
  artistId?: string;
  artwork?: string;
  /** Seconds. */
  duration?: number;
  genre?: string;
  plays?: number;
  streamUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  handle?: string;
  avatar?: string;
  cover?: string;
  bio?: string;
  followers?: number;
  trackCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  artwork?: string;
  owner: string;
  ownerId?: string;
  description?: string;
  trackCount?: number;
}

export interface Station {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  tags: string[];
  country?: string;
  bitrate?: number;
}
