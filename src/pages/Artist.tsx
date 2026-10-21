import { useParams } from "react-router-dom";
import { api } from "../api";
import { PlayIcon } from "../components/Icons";
import { Shelf } from "../components/Shelf";
import { ErrorMessage, Hero, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import { pickImage, useAsync } from "../util";

export function Artist() {
  const { id = "" } = useParams();
  const player = usePlayer();
  const { data: artist, error, loading } = useAsync(() => api.artist(id), [id]);
  // These endpoints may be restricted for newer Spotify apps; the page still works without them.
  const topTracks = useAsync(() => api.artistTopTracks(id), [id]);
  const albums = useAsync(() => api.artistAlbums(id), [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  if (!artist) return null;

  return (
    <div className="page">
      <Hero kind="Artist" title={artist.name} image={pickImage(artist.images)} round>
        {artist.followers && <span>{artist.followers.total.toLocaleString()} followers</span>}
        {artist.genres && artist.genres.length > 0 && (
          <span className="muted"> · {artist.genres.slice(0, 3).join(", ")}</span>
        )}
      </Hero>

      <div className="actions">
        <button className="big-play" onClick={() => player.playContext(artist.uri)} aria-label="Play artist">
          <PlayIcon size={28} />
        </button>
      </div>

      {topTracks.data && topTracks.data.tracks.length > 0 && (
        <section className="shelf">
          <h2>Popular</h2>
          <TrackList tracks={topTracks.data.tracks.slice(0, 10)} showAlbum={false} />
        </section>
      )}

      <Shelf
        title="Discography"
        items={(albums.data?.items ?? []).map((a) => ({
          id: a.id,
          title: a.name,
          subtitle: `${a.release_date?.slice(0, 4) ?? ""} · ${a.album_type ?? "album"}`,
          image: pickImage(a.images),
          href: `/album/${a.id}`,
          uri: a.uri,
        }))}
      />
    </div>
  );
}
