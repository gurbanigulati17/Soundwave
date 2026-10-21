import { api } from "../api";
import { Shelf } from "../components/Shelf";
import { ErrorMessage, Loading } from "../components/Status";
import { pickImage, useAsync } from "../util";

export function Library() {
  const playlists = useAsync(() => api.myPlaylists(), []);
  const albums = useAsync(() => api.savedAlbums(), []);
  const artists = useAsync(() => api.topArtists(), []);

  if (playlists.loading && albums.loading) return <Loading />;

  return (
    <div className="page">
      <h1>Your Library</h1>
      {playlists.error && <ErrorMessage error={playlists.error} />}

      <Shelf
        title="Playlists"
        items={[
          { id: "liked", title: "Liked Songs", subtitle: "Your saved tracks", href: "/collection/tracks" },
          ...(playlists.data?.items ?? []).filter(Boolean).map((p) => ({
            id: p.id,
            title: p.name,
            subtitle: `By ${p.owner.display_name ?? "Unknown"}`,
            image: pickImage(p.images),
            href: `/playlist/${p.id}`,
            uri: p.uri,
          })),
        ]}
      />
      <Shelf
        title="Albums"
        items={(albums.data?.items ?? []).map(({ album }) => ({
          id: album.id,
          title: album.name,
          subtitle: album.artists.map((a) => a.name).join(", "),
          image: pickImage(album.images),
          href: `/album/${album.id}`,
          uri: album.uri,
        }))}
      />
      <Shelf
        title="Artists you listen to"
        items={(artists.data?.items ?? []).map((a) => ({
          id: a.id,
          title: a.name,
          subtitle: "Artist",
          image: pickImage(a.images),
          href: `/artist/${a.id}`,
          uri: a.uri,
          round: true,
        }))}
      />
    </div>
  );
}
