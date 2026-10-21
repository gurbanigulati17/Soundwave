import { Link } from "react-router-dom";
import { PlaylistCards, Shelf, StationCards, TrackCards } from "../components/Cards";
import { ErrorMessage, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { audius, GENRES } from "../sources/audius";
import { jamendo } from "../sources/jamendo";
import { radio } from "../sources/radio";
import { greeting, useAsync } from "../util";

export function Home() {
  const trending = useAsync(() => audius.trending(), []);
  const playlists = useAsync(() => audius.trendingPlaylists(), []);
  const underground = useAsync(() => audius.underground(), []);
  const bollywood = useAsync(() => radio.byTag("bollywood", 12), []);
  const cc = useAsync(() => jamendo.popular(), []);

  return (
    <div className="view">
      <h1 className="greeting">{greeting()}</h1>

      <div className="chips" role="list" aria-label="Genres">
        {GENRES.map((g) => (
          <Link key={g} className="chip" role="listitem" to={`/genre/${encodeURIComponent(g)}`}>
            {g}
          </Link>
        ))}
      </div>

      <section className="shelf">
        <div className="shelf-head">
          <h2>Trending this week</h2>
          <Link className="see-all" to="/genre/All">
            Show all
          </Link>
        </div>
        {trending.loading && <Loading />}
        {trending.error && <ErrorMessage error={trending.error} what="trending songs" />}
        {trending.data && <TrackList tracks={trending.data.slice(0, 10)} contextId="trending" showPlays />}
      </section>

      {playlists.data && playlists.data.length > 0 && (
        <Shelf title="Popular playlists">
          <PlaylistCards playlists={playlists.data.slice(0, 12)} />
        </Shelf>
      )}

      {bollywood.data && bollywood.data.length > 0 && (
        <Shelf title="Live Bollywood radio" action={<Link className="see-all" to="/radio">Show all</Link>}>
          <StationCards stations={bollywood.data.slice(0, 6)} />
        </Shelf>
      )}

      {underground.data && underground.data.length > 0 && (
        <Shelf title="Rising artists">
          <TrackCards tracks={underground.data.slice(0, 12)} contextId="underground" />
        </Shelf>
      )}

      {cc.data && cc.data.length > 0 && (
        <Shelf title="Free to share (Creative Commons)">
          <TrackCards tracks={cc.data.slice(0, 12)} contextId="jamendo" />
        </Shelf>
      )}
    </div>
  );
}
