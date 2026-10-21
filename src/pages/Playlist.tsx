import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, playlistItems, playlistTrack } from "../api";
import { PlayIcon } from "../components/Icons";
import { ErrorMessage, Hero, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import type { Paging, PlaylistItem, Track } from "../types";
import { pickImage, plainText, useAsync } from "../util";

export function Playlist() {
  const { id = "" } = useParams();
  const player = usePlayer();
  const { data: playlist, error, loading } = useAsync(() => api.playlist(id), [id]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  useEffect(() => {
    const page = playlist && playlistItems(playlist);
    if (!page || !("items" in page)) {
      setTracks([]);
      setNextUrl(null);
      return;
    }
    setTracks(page.items.map(playlistTrack).filter((t): t is Track => !!t?.id));
    setNextUrl(page.next);
  }, [playlist]);

  const loadMore = async () => {
    if (!nextUrl) return;
    const page: Paging<PlaylistItem> = await api.next<PlaylistItem>(nextUrl);
    setTracks((t) => [...t, ...page.items.map(playlistTrack).filter((x): x is Track => !!x?.id)]);
    setNextUrl(page.next);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  if (!playlist) return null;

  const total = playlistItems(playlist)?.total ?? tracks.length;

  return (
    <div className="page">
      <Hero kind="Playlist" title={playlist.name} image={pickImage(playlist.images, 300)}>
        {playlist.description && <p className="muted">{plainText(playlist.description)}</p>}
        <span>
          <strong>{playlist.owner.display_name}</strong> · {total} songs
        </span>
      </Hero>

      <div className="actions">
        <button className="big-play" onClick={() => player.playContext(playlist.uri)} aria-label="Play playlist">
          <PlayIcon size={28} />
        </button>
      </div>

      {tracks.length === 0 ? (
        <p className="muted">
          Spotify didn't return the tracks for this playlist. It may be empty, or one your app isn't allowed to read.
        </p>
      ) : (
        <TrackList tracks={tracks} contextUri={playlist.uri} />
      )}
      {nextUrl && (
        <button className="pill-btn outline" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
