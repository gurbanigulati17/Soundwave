import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { SearchIcon } from "../components/Icons";
import { Shelf } from "../components/Shelf";
import { ErrorMessage } from "../components/Status";
import { TrackList } from "../components/TrackList";
import type { SearchResults } from "../types";
import { pickImage } from "../util";

export function Search() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const query = params.get("q") ?? "";

  // Debounce typing into the URL so results are linkable and back/forward works.
  useEffect(() => {
    const id = setTimeout(() => {
      if (input.trim() !== query) setParams(input.trim() ? { q: input.trim() } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [input, query, setParams]);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let active = true;
    setError(null);
    api.search(query).then(
      (r) => active && setResults(r),
      (e: Error) => active && setError(e),
    );
    return () => {
      active = false;
    };
  }, [query]);

  return (
    <div className="page">
      <label className="search-box">
        <SearchIcon size={20} />
        <input
          autoFocus
          placeholder="What do you want to listen to?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </label>

      {error && <ErrorMessage error={error} />}
      {!query && <p className="muted">Search for songs, artists, albums and playlists.</p>}

      {results && (
        <>
          {results.tracks && results.tracks.items.length > 0 && (
            <section className="shelf">
              <h2>Songs</h2>
              <TrackList tracks={results.tracks.items} />
            </section>
          )}
          <Shelf
            title="Artists"
            items={(results.artists?.items ?? []).map((a) => ({
              id: a.id,
              title: a.name,
              subtitle: "Artist",
              image: pickImage(a.images),
              href: `/artist/${a.id}`,
              uri: a.uri,
              round: true,
            }))}
          />
          <Shelf
            title="Albums"
            items={(results.albums?.items ?? []).map((a) => ({
              id: a.id,
              title: a.name,
              subtitle: a.artists.map((x) => x.name).join(", "),
              image: pickImage(a.images),
              href: `/album/${a.id}`,
              uri: a.uri,
            }))}
          />
          <Shelf
            title="Playlists"
            items={(results.playlists?.items ?? [])
              .filter((p) => p !== null)
              .map((p) => ({
                id: p.id,
                title: p.name,
                subtitle: `By ${p.owner.display_name ?? "Unknown"}`,
                image: pickImage(p.images),
                href: `/playlist/${p.id}`,
                uri: p.uri,
              }))}
          />
        </>
      )}
    </div>
  );
}
