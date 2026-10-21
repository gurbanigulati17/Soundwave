import { useEffect, useState } from "react";
import { api } from "../api";
import { HeartIcon, PlayIcon } from "../components/Icons";
import { ErrorMessage, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import type { SavedTrack, Track } from "../types";

export function LikedSongs() {
  const player = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.savedTracks().then(
      (page) => {
        setTracks(page.items.map((i) => i.track));
        setTotal(page.total);
        setNextUrl(page.next);
        setLoading(false);
      },
      (e: Error) => {
        setError(e);
        setLoading(false);
      },
    );
  }, []);

  const loadMore = async () => {
    if (!nextUrl) return;
    const page = await api.next<SavedTrack>(nextUrl);
    setTracks((t) => [...t, ...page.items.map((i) => i.track)]);
    setNextUrl(page.next);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-art liked">
          <HeartIcon size={72} />
        </div>
        <div className="hero-text">
          <span className="small">Playlist</span>
          <h1>Liked Songs</h1>
          <div className="hero-meta">{total} songs</div>
        </div>
      </header>

      <div className="actions">
        <button
          className="big-play"
          onClick={() => tracks.length && player.playTracks(tracks.map((t) => t.uri))}
          aria-label="Play liked songs"
        >
          <PlayIcon size={28} />
        </button>
      </div>

      <TrackList tracks={tracks} />
      {nextUrl && (
        <button className="pill-btn outline" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
