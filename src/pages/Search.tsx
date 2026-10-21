import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArtistCards, PlaylistCards, Shelf, StationCards, TrackCards } from "../components/Cards";
import { Icon } from "../components/Icons";
import { Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { audius, GENRES } from "../sources/audius";
import { jamendo } from "../sources/jamendo";
import { radio } from "../sources/radio";
import type { Artist, Playlist, Station, Track } from "../types";

interface Results {
  tracks: Track[];
  artists: Artist[];
  playlists: Playlist[];
  stations: Station[];
  cc: Track[];
}

const GENRE_COLORS = ["#e8115b", "#1e64d6", "#8d67ab", "#27856a", "#e1730c", "#477d95", "#ba5d07", "#503750", "#148a08", "#af2896"];

// Each source can fail independently; one being down shouldn't blank the page.
const settle = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);

export function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      const q = input.trim();
      if (q !== query) setParams(q ? { q } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(id);
  }, [input, query, setParams]);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([
      settle(audius.searchTracks(query)),
      settle(audius.searchArtists(query)),
      settle(audius.searchPlaylists(query)),
      settle(radio.byName(query, 6)),
      settle(jamendo.search(query)),
    ]).then(([tracks, artists, playlists, stations, cc]) => {
      if (!active) return;
      setResults({ tracks, artists, playlists, stations, cc });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [query]);

  const nothing =
    results && !results.tracks.length && !results.artists.length && !results.playlists.length && !results.stations.length && !results.cc.length;

  return (
    <div className="view">
      <label className="search-box">
        <Icon name="search" size={20} />
        <input
          id="search"
          type="search"
          autoFocus
          placeholder="Songs, artists, playlists or radio stations"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
        />
      </label>

      {!query && (
        <section className="shelf">
          <h2>Browse all</h2>
          <div className="genres">
            {GENRES.map((g, i) => (
              <Link key={g} className="genre" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} to={`/genre/${encodeURIComponent(g)}`}>
                {g}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading && <Loading label="Searching…" />}
      {nothing && <p className="empty">No results for “{query}”. Check the spelling, or try an artist, a genre or a city name for radio.</p>}

      {results && !loading && (
        <>
          {results.tracks.length > 0 && (
            <section className="shelf">
              <h2>Songs</h2>
              <TrackList tracks={results.tracks.slice(0, 8)} contextId={`search:${query}`} />
            </section>
          )}
          {results.artists.length > 0 && (
            <Shelf title="Artists">
              <ArtistCards artists={results.artists} />
            </Shelf>
          )}
          {results.playlists.length > 0 && (
            <Shelf title="Playlists">
              <PlaylistCards playlists={results.playlists} />
            </Shelf>
          )}
          {results.stations.length > 0 && (
            <Shelf title="Radio stations">
              <StationCards stations={results.stations} />
            </Shelf>
          )}
          {results.cc.length > 0 && (
            <Shelf title="Creative Commons">
              <TrackCards tracks={results.cc} contextId={`cc:${query}`} />
            </Shelf>
          )}
        </>
      )}
    </div>
  );
}
