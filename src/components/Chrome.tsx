import { Link, NavLink, useNavigate } from "react-router-dom";
import { usePlayer } from "../player/PlayerProvider";
import { useLibrary } from "../state/LibraryProvider";
import { formatTime, songs } from "../util";
import { Art } from "./Art";
import { Icon, type IconName } from "./Icons";

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/search", label: "Search", icon: "search" },
  { to: "/radio", label: "Radio", icon: "radio" },
  { to: "/library", label: "Your Library", icon: "library" },
];

export function Sidebar() {
  const lib = useLibrary();
  const navigate = useNavigate();
  const player = usePlayer();

  return (
    <aside className="sidebar">
      <nav className="panel nav" aria-label="Main">
        <div className="brand">
          <Icon name="logo" size={28} /> Soundwave
        </div>
        {NAV.slice(0, 3).map((n) => (
          <NavLink key={n.to} to={n.to} end className="nav-btn">
            <Icon name={n.icon} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <section className="panel library">
        <NavLink to="/library" className="nav-btn">
          <Icon name="library" /> Your Library
        </NavLink>
        <div className="lib-list">
          <button className="lib-item" onClick={() => navigate("/liked")}>
            <span className="art liked-art">
              <Icon name="heart" size={18} />
            </span>
            <span className="lib-text">
              <b className={player.contextId === "liked" ? "playing" : ""}>Liked Songs</b>
              <span>Playlist · {songs(lib.liked.length)}</span>
            </span>
          </button>
          <button className="lib-item" onClick={() => navigate("/files")}>
            <span className="art files-art">
              <Icon name="music" size={18} />
            </span>
            <span className="lib-text">
              <b className={player.contextId === "files" ? "playing" : ""}>Your files</b>
              <span>On this device · {songs(lib.files.length)}</span>
            </span>
          </button>
          {lib.stations.map((s) => (
            <button key={s.id} className="lib-item" onClick={() => (player.station?.id === s.id ? player.toggle() : player.playStation(s))}>
              <Art src={s.favicon} seed={s.id} fallback="radio" />
              <span className="lib-text">
                <b className={player.station?.id === s.id ? "playing" : ""}>{s.name}</b>
                <span>Radio station</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

export function TabBar() {
  return (
    <nav className="tabs" aria-label="Main">
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} end className="tab">
          <Icon name={n.icon} size={22} />
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

const fill = (frac: number) => ({ "--fill": `${Math.max(0, Math.min(1, frac)) * 100}%` }) as React.CSSProperties;

export function PlayerBar() {
  const p = usePlayer();
  const lib = useLibrary();
  const t = p.track;
  const st = p.station;
  const hasMedia = Boolean(t || st);
  const frac = p.duration ? p.position / p.duration : 0;

  return (
    <footer className="player">
      <div className="np">
        {t ? (
          <>
            <Art src={t.artwork} seed={t.id} />
            <div className="np-text">
              <b>{t.title}</b>
              <span>{t.artistId ? <Link className="link" to={`/artist/${t.artistId}`}>{t.artist}</Link> : t.artist}</span>
            </div>
            {t.source !== "local" && (
              <button
                className={`icon-btn heart ${lib.isLiked(t.id) ? "on" : ""}`}
                onClick={() => lib.toggleLike(t)}
                aria-label={lib.isLiked(t.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
              >
                <Icon name={lib.isLiked(t.id) ? "heart" : "heartLine"} size={18} />
              </button>
            )}
          </>
        ) : st ? (
          <>
            <Art src={st.favicon} seed={st.id} fallback="radio" />
            <div className="np-text">
              <b>{st.name}</b>
              <span>
                <span className="live-dot" /> Live radio{st.country ? ` · ${st.country}` : ""}
              </span>
            </div>
          </>
        ) : (
          <div className="np-text">
            <b>Nothing playing</b>
            <span>Pick a song or a radio station</span>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="buttons">
          <button className={`icon-btn side ${p.shuffle ? "on" : ""}`} onClick={p.toggleShuffle} aria-label="Shuffle" disabled={!t}>
            <Icon name="shuffle" size={18} />
          </button>
          <button className="icon-btn side" onClick={p.previous} aria-label="Previous" disabled={!t}>
            <Icon name="prev" size={20} />
          </button>
          <button className={`play-btn ${p.loading && p.playing ? "loading" : ""}`} onClick={p.toggle} aria-label={p.playing ? "Pause" : "Play"} disabled={!hasMedia}>
            <Icon name={p.playing ? "pause" : "play"} size={18} />
          </button>
          <button className="icon-btn" onClick={p.next} aria-label="Next" disabled={!t}>
            <Icon name="next" size={20} />
          </button>
          <button
            className={`icon-btn side ${p.repeat !== "off" ? "on" : ""}`}
            onClick={p.cycleRepeat}
            aria-label={`Repeat: ${p.repeat}`}
            disabled={!t}
          >
            <Icon name="repeat" size={18} />
            {p.repeat === "one" && <span className="repeat-one">1</span>}
          </button>
        </div>
        <div className="progress tnum">
          {st ? (
            <span className="live-label">{p.error ?? (p.loading ? "Connecting…" : "Live")}</span>
          ) : (
            <>
              <span>{formatTime(p.position)}</span>
              <input
                type="range"
                min={0}
                max={p.duration || 1}
                step={0.5}
                value={Math.min(p.position, p.duration || 1)}
                onChange={(e) => p.seek(Number(e.target.value))}
                disabled={!t}
                aria-label="Seek"
                style={fill(frac)}
              />
              <span>{formatTime(p.duration)}</span>
            </>
          )}
        </div>
      </div>

      <div className="right">
        {p.error && !st && <span className="player-error">{p.error}</span>}
        <button className="icon-btn" onClick={() => p.setVolume(p.volume === 0 ? 0.8 : 0)} aria-label={p.volume === 0 ? "Unmute" : "Mute"}>
          <Icon name={p.volume === 0 ? "mute" : "volume"} size={18} />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={p.volume}
          onChange={(e) => p.setVolume(Number(e.target.value))}
          aria-label="Volume"
          style={fill(p.volume)}
        />
      </div>
      <div className="m-progress">
        <i style={{ width: st ? "100%" : `${frac * 100}%` }} />
      </div>
    </footer>
  );
}
