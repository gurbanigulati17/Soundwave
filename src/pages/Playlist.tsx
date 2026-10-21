import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icons";
import { ErrorMessage, Hero, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import { audius } from "../sources/audius";
import { songs, useAsync } from "../util";

export function Playlist() {
  const { id = "" } = useParams();
  const player = usePlayer();
  const info = useAsync(() => audius.playlist(id), [id]);
  const tracks = useAsync(() => audius.playlistTracks(id), [id]);
  const ctx = `playlist:${id}`;

  if (info.loading) return <Loading />;
  if (info.error) return <ErrorMessage error={info.error} what="this playlist" />;
  const p = info.data!;
  const list = tracks.data ?? [];
  const total = list.reduce((s, t) => s + (t.duration ?? 0), 0);
  const live = player.contextId === ctx;

  return (
    <div className="view">
      <Hero kind="Playlist" title={p.name} image={p.artwork} seed={p.id}>
        {p.description && <p>{p.description}</p>}
        <span>
          {p.ownerId ? (
            <Link to={`/artist/${p.ownerId}`}>
              <b>{p.owner}</b>
            </Link>
          ) : (
            <b>{p.owner}</b>
          )}
          {list.length > 0 && ` · ${songs(list.length)}, ${Math.max(1, Math.round(total / 60))} min`}
        </span>
      </Hero>
      <div className="actions">
        <button
          className="big-play"
          aria-label={live && player.playing ? "Pause" : "Play"}
          onClick={() => (live ? player.toggle() : player.playTracks(list, 0, ctx))}
          disabled={!list.length}
        >
          <Icon name={live && player.playing ? "pause" : "play"} size={26} />
        </button>
      </div>
      {tracks.loading && <Loading />}
      {tracks.error && <ErrorMessage error={tracks.error} what="the songs" />}
      {tracks.data && <TrackList tracks={list} contextId={ctx} />}
    </div>
  );
}
