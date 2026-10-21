// The subset of Spotify Web API objects this app reads.

export interface Image {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface ArtistRef {
  id: string;
  name: string;
  uri: string;
}

export interface Artist extends ArtistRef {
  images?: Image[];
  genres?: string[];
  followers?: { total: number };
}

export interface AlbumRef {
  id: string;
  name: string;
  uri: string;
  images: Image[];
  artists: ArtistRef[];
  release_date?: string;
  album_type?: string;
}

export interface Album extends AlbumRef {
  tracks: Paging<Track>;
  total_tracks: number;
  label?: string;
}

export interface Track {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  artists: ArtistRef[];
  album?: AlbumRef;
  is_playable?: boolean;
}

export interface Paging<T> {
  items: T[];
  total: number;
  next: string | null;
  offset: number;
  limit: number;
}

export interface PlaylistItem {
  added_at: string;
  // Spotify renamed `track` to `item` on newer playlist endpoints; accept both.
  track?: Track | null;
  item?: Track | null;
}

export interface Playlist {
  id: string;
  name: string;
  uri: string;
  description: string | null;
  images: Image[] | null;
  owner: { id: string; display_name: string | null };
  tracks?: Paging<PlaylistItem> | { total: number };
  items?: Paging<PlaylistItem> | { total: number };
}

export interface User {
  id: string;
  display_name: string | null;
  images?: Image[];
  product?: string;
  country?: string;
}

export interface SavedTrack {
  added_at: string;
  track: Track;
}

export interface SavedAlbum {
  added_at: string;
  album: AlbumRef;
}

export interface PlayHistory {
  played_at: string;
  track: Track;
}

export interface SearchResults {
  tracks?: Paging<Track>;
  artists?: Paging<Artist>;
  albums?: Paging<AlbumRef>;
  playlists?: Paging<Playlist | null>;
}
