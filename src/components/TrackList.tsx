import { Link } from "react-router-dom";
import { usePlayer } from "../player/PlayerProvider";
import type { Track } from "../types";
import { formatDuration, pickImage } from "../util";
import { ClockIcon, PlayIcon } from "./Icons";

interface Props {
  tracks: Track[];
  /** When set, plays within this context (playlist/album) so next/previous follow it. */
  contextUri?: string;
  showAlbum?: boolean;
  showArt?: boolean;
}

export function TrackList({ tracks, contextUri, showAlbum = true, showArt = true }: Props) {
  const player = usePlayer();

  const play = (track: Track) => {
    if (contextUri) player.playContext(contextUri, track.uri);
    else player.playTracks(tracks.map((t) => t.uri), track.uri);
  };

  return (
    <table className="tracks">
      <thead>
        <tr>
          <th className="num">#</th>
          <th>Title</th>
          {showAlbum && <th className="hide-sm">Album</th>}
          <th className="dur">
            <ClockIcon />
          </th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((t, i) => {
          const current = player.track?.uri === t.uri || player.track?.id === t.id;
          return (
            <tr key={`${t.id}-${i}`} className={current ? "current" : ""} onDoubleClick={() => play(t)}>
              <td className="num">
                <span className="idx">{i + 1}</span>
                <button className="row-play" onClick={() => play(t)} aria-label={`Play ${t.name}`}>
                  <PlayIcon size={14} />
                </button>
              </td>
              <td>
                <div className="track-title">
                  {showArt && t.album && <img src={pickImage(t.album.images, 64)} alt="" />}
                  <div>
                    <div className="title">{t.name}</div>
                    <div className="sub">
                      {t.explicit && <span className="explicit">E</span>}
                      {t.artists.map((a, j) => (
                        <span key={a.id ?? j}>
                          {j > 0 && ", "}
                          <Link to={`/artist/${a.id}`}>{a.name}</Link>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
              {showAlbum && (
                <td className="hide-sm sub">{t.album && <Link to={`/album/${t.album.id}`}>{t.album.name}</Link>}</td>
              )}
              <td className="dur sub">{formatDuration(t.duration_ms)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
