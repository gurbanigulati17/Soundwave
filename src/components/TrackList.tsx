import { Link } from "react-router-dom";
import { usePlayer } from "../player/PlayerProvider";
import { useLibrary } from "../state/LibraryProvider";
import type { Track } from "../types";
import { compact, formatTime } from "../util";
import { Art } from "./Art";
import { Icon } from "./Icons";

interface Props {
  tracks: Track[];
  contextId: string;
  showArt?: boolean;
  showPlays?: boolean;
  onRemove?: (track: Track) => void;
}

export function Equalizer({ paused }: { paused: boolean }) {
  return (
    <span className={`eq ${paused ? "paused" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function TrackList({ tracks, contextId, showArt = true, showPlays = false, onRemove }: Props) {
  const player = usePlayer();
  const lib = useLibrary();

  if (!tracks.length) return <p className="empty">No songs here yet.</p>;

  return (
    <div className="table-wrap">
      <table className="tracks">
        <thead>
          <tr>
            <th className="c-num">#</th>
            <th>Title</th>
            {showPlays && <th className="c-plays">Plays</th>}
            <th className="c-like" />
            <th className="c-dur">
              <Icon name="clock" size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((t, i) => {
            const current = player.track?.id === t.id && player.contextId === contextId;
            const play = () => (current ? player.toggle() : player.playTracks(tracks, i, contextId));
            const liked = lib.isLiked(t.id);
            return (
              <tr key={`${t.id}-${i}`} className={current ? "current" : ""} onClick={play}>
                <td className="c-num">
                  <span className="idx">{current ? <Equalizer paused={!player.playing} /> : i + 1}</span>
                  <span className="row-play">
                    <Icon name={current && player.playing ? "pause" : "play"} size={14} />
                  </span>
                </td>
                <td>
                  <div className="t-cell">
                    {showArt && <Art src={t.artwork} seed={t.id} className="t-art" />}
                    <div>
                      <b>{t.title}</b>
                      <span>
                        {t.source !== "audius" && <span className="tag">{t.source === "local" ? "File" : "CC"}</span>}
                        {t.artistId ? (
                          <Link className="link" to={`/artist/${t.artistId}`} onClick={(e) => e.stopPropagation()}>
                            {t.artist}
                          </Link>
                        ) : (
                          t.artist
                        )}
                      </span>
                    </div>
                  </div>
                </td>
                {showPlays && <td className="c-plays tnum">{compact(t.plays)}</td>}
                <td className="c-like">
                  {onRemove ? (
                    <button
                      className="icon-btn"
                      aria-label={`Remove ${t.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(t);
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  ) : (
                    t.source !== "local" && (
                      <button
                        className={`icon-btn heart ${liked ? "on" : ""}`}
                        aria-label={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
                        onClick={(e) => {
                          e.stopPropagation();
                          lib.toggleLike(t);
                        }}
                      >
                        <Icon name={liked ? "heart" : "heartLine"} size={16} />
                      </button>
                    )
                  )}
                </td>
                <td className="c-dur tnum">{t.duration ? formatTime(t.duration) : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
