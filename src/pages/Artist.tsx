import { useParams } from "react-router-dom";
import { Icon } from "../components/Icons";
import { ErrorMessage, Hero, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import { audius } from "../sources/audius";
import { compact, useAsync } from "../util";

export function Artist() {
  const { id = "" } = useParams();
  const player = usePlayer();
  const info = useAsync(() => audius.artist(id), [id]);
  const tracks = useAsync(() => audius.artistTracks(id), [id]);
  const ctx = `artist:${id}`;

  if (info.loading) return <Loading />;
  if (info.error) return <ErrorMessage error={info.error} what="this artist" />;
  const a = info.data!;
  const list = tracks.data ?? [];
  const live = player.contextId === ctx;

  return (
    <div className="view">
      {a.cover && <div className="artist-cover" style={{ backgroundImage: `url("${a.cover}")` }} />}
      <Hero kind="Artist" title={a.name} image={a.avatar} seed={a.id} round>
        {a.bio && <p>{a.bio}</p>}
        <span>
          {a.followers != null && `${compact(a.followers)} followers`}
          {a.trackCount ? ` · ${a.trackCount} tracks` : ""}
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
      <section className="shelf">
        <h2>Popular</h2>
        {tracks.loading && <Loading />}
        {tracks.error && <ErrorMessage error={tracks.error} what="the songs" />}
        {tracks.data && <TrackList tracks={list} contextId={ctx} showPlays />}
      </section>
    </div>
  );
}
