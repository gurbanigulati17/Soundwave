import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { PlayIcon } from "../components/Icons";
import { ErrorMessage, Hero, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import { formatDuration, pickImage, useAsync } from "../util";

export function Album() {
  const { id = "" } = useParams();
  const player = usePlayer();
  const { data: album, error, loading } = useAsync(() => api.album(id), [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  if (!album) return null;

  const totalMs = album.tracks.items.reduce((sum, t) => sum + t.duration_ms, 0);

  return (
    <div className="page">
      <Hero kind={album.album_type === "single" ? "Single" : "Album"} title={album.name} image={pickImage(album.images)}>
        <span>
          {album.artists.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ", "}
              <Link to={`/artist/${a.id}`}>
                <strong>{a.name}</strong>
              </Link>
            </span>
          ))}
          {" · "}
          {album.release_date?.slice(0, 4)} · {album.total_tracks} songs, {formatDuration(totalMs)}
        </span>
      </Hero>

      <div className="actions">
        <button className="big-play" onClick={() => player.playContext(album.uri)} aria-label="Play album">
          <PlayIcon size={28} />
        </button>
      </div>

      <TrackList tracks={album.tracks.items} contextUri={album.uri} showAlbum={false} showArt={false} />
      {album.label && <p className="muted small">℗ {album.label}</p>}
    </div>
  );
}
