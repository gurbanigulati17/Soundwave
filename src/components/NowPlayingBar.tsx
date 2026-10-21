import { Link } from "react-router-dom";
import { usePlayer } from "../player/PlayerProvider";
import { formatDuration } from "../util";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon, ShuffleIcon, VolumeIcon } from "./Icons";

const idFromUri = (uri: string) => uri.split(":").pop() ?? "";

export function NowPlayingBar() {
  const p = usePlayer();
  const track = p.track;

  return (
    <footer className="now-playing">
      <div className="np-track">
        {track ? (
          <>
            <img src={track.album.images[0]?.url} alt="" />
            <div>
              <Link className="title" to={`/album/${idFromUri(track.album.uri)}`}>
                {track.name}
              </Link>
              <div className="sub">
                {track.artists.map((a, i) => (
                  <span key={a.uri}>
                    {i > 0 && ", "}
                    <Link to={`/artist/${idFromUri(a.uri)}`}>{a.name}</Link>
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <span className="muted small">
            {p.error ?? (p.ready ? "Pick something to play" : "Connecting web player…")}
          </span>
        )}
      </div>

      <div className="np-controls">
        <div className="np-buttons">
          <button
            className={`icon-btn ${p.shuffle ? "active" : ""}`}
            onClick={p.toggleShuffle}
            aria-label="Shuffle"
            disabled={!track}
          >
            <ShuffleIcon size={18} />
          </button>
          <button className="icon-btn" onClick={p.previous} aria-label="Previous" disabled={!track}>
            <PrevIcon size={20} />
          </button>
          <button className="play-btn" onClick={p.togglePlay} aria-label={p.paused ? "Play" : "Pause"} disabled={!track}>
            {p.paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
          </button>
          <button className="icon-btn" onClick={p.next} aria-label="Next" disabled={!track}>
            <NextIcon size={20} />
          </button>
          <button
            className={`icon-btn repeat ${p.repeat !== "off" ? "active" : ""}`}
            onClick={p.cycleRepeat}
            aria-label={`Repeat: ${p.repeat}`}
            disabled={!track}
          >
            <RepeatIcon size={18} />
            {p.repeat === "track" && <span className="repeat-one">1</span>}
          </button>
        </div>
        <div className="np-progress">
          <span>{formatDuration(p.position)}</span>
          <input
            type="range"
            min={0}
            max={p.duration || 1}
            value={p.position}
            onChange={(e) => p.seek(Number(e.target.value))}
            disabled={!track}
            aria-label="Seek"
            style={{ "--fill": `${(p.position / (p.duration || 1)) * 100}%` } as React.CSSProperties}
          />
          <span>{formatDuration(p.duration)}</span>
        </div>
      </div>

      <div className="np-volume">
        <VolumeIcon size={18} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={p.volume}
          onChange={(e) => p.setVolume(Number(e.target.value))}
          aria-label="Volume"
          style={{ "--fill": `${p.volume * 100}%` } as React.CSSProperties}
        />
      </div>
    </footer>
  );
}
