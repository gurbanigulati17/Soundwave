import { api } from "../api";
import { Shelf, type CardItem } from "../components/Shelf";
import { TrackList } from "../components/TrackList";
import { greeting, pickImage, useAsync } from "../util";

export function Home() {
  const recent = useAsync(() => api.recentlyPlayed(), []);
  const topTracks = useAsync(() => api.topTracks(), []);
  const topArtists = useAsync(() => api.topArtists(), []);
  const playlists = useAsync(() => api.myPlaylists(), []);
  const albums = useAsync(() => api.savedAlbums(), []);

  // Recently played tracks, de-duplicated into their albums.
  const recentAlbums: CardItem[] = [];
  const seen = new Set<string>();
  for (const { track } of recent.data?.items ?? []) {
    if (!track.album || seen.has(track.album.id)) continue;
    seen.add(track.album.id);
    recentAlbums.push({
      id: track.album.id,
      title: track.album.name,
      subtitle: track.artists.map((a) => a.name).join(", "),
      image: pickImage(track.album.images),
      href: `/album/${track.album.id}`,
      uri: track.album.uri,
    });
  }

  return (
    <div className="page">
      <h1 className="greeting">{greeting()}</h1>

      <Shelf title="Recently played" items={recentAlbums.slice(0, 12)} />

      <Shelf
        title="Your playlists"
        items={(playlists.data?.items ?? []).filter(Boolean).slice(0, 12).map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `By ${p.owner.display_name ?? "Unknown"}`,
          image: pickImage(p.images),
          href: `/playlist/${p.id}`,
          uri: p.uri,
        }))}
      />

      <Shelf
        title="Your top artists"
        items={(topArtists.data?.items ?? []).slice(0, 12).map((a) => ({
          id: a.id,
          title: a.name,
          subtitle: "Artist",
          image: pickImage(a.images),
          href: `/artist/${a.id}`,
          uri: a.uri,
          round: true,
        }))}
      />

      {topTracks.data && topTracks.data.items.length > 0 && (
        <section className="shelf">
          <h2>On repeat lately</h2>
          <TrackList tracks={topTracks.data.items.slice(0, 10)} />
        </section>
      )}

      <Shelf
        title="Saved albums"
        items={(albums.data?.items ?? []).slice(0, 12).map(({ album }) => ({
          id: album.id,
          title: album.name,
          subtitle: album.artists.map((a) => a.name).join(", "),
          image: pickImage(album.images),
          href: `/album/${album.id}`,
          uri: album.uri,
        }))}
      />

      {[recent, topTracks, topArtists, playlists, albums].every((s) => s.loading) && (
        <div className="status">Loading…</div>
      )}
    </div>
  );
}
