import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../player/PlayerProvider";
import { useLibrary } from "../state/LibraryProvider";
import type { Artist, Playlist, Station, Track } from "../types";
import { compact } from "../util";
import { Art } from "./Art";
import { Icon } from "./Icons";

interface CardProps {
  title: string;
  subtitle?: string;
  image?: string;
  seed: string;
  round?: boolean;
  live?: boolean;
  onOpen: () => void;
  onPlay?: () => void;
}

export function Card({ title, subtitle, image, seed, round, live, onOpen, onPlay }: CardProps) {
  return (
    <div
      className={`card ${live ? "live" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="card-art">
        <Art src={image} seed={seed} round={round} fallback={round ? "music" : "music"} />
        {onPlay && (
          <button
            className="mini-play"
            aria-label={`Play ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Icon name={live ? "pause" : "play"} size={20} />
          </button>
        )}
      </div>
      <b>{title}</b>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

export function Shelf({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="shelf">
      <div className="shelf-head">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="cards">{children}</div>
    </section>
  );
}

/** Track cards play the shelf's tracks starting at the tapped one. */
export function TrackCards({ tracks, contextId }: { tracks: Track[]; contextId: string }) {
  const player = usePlayer();
  return (
    <>
      {tracks.map((t, i) => {
        const live = player.track?.id === t.id && player.contextId === contextId && player.playing;
        const play = () => (player.track?.id === t.id && player.contextId === contextId ? player.toggle() : player.playTracks(tracks, i, contextId));
        return (
          <Card key={t.id} title={t.title} subtitle={t.artist} image={t.artwork} seed={t.id} live={live} onOpen={play} onPlay={play} />
        );
      })}
    </>
  );
}

export function PlaylistCards({ playlists }: { playlists: Playlist[] }) {
  const navigate = useNavigate();
  return (
    <>
      {playlists.map((p) => (
        <Card
          key={p.id}
          title={p.name}
          subtitle={`By ${p.owner}`}
          image={p.artwork}
          seed={p.id}
          onOpen={() => navigate(`/playlist/${p.id}`)}
        />
      ))}
    </>
  );
}

export function ArtistCards({ artists }: { artists: Artist[] }) {
  const navigate = useNavigate();
  return (
    <>
      {artists.map((a) => (
        <Card
          key={a.id}
          title={a.name}
          subtitle={a.followers != null ? `${compact(a.followers)} followers` : "Artist"}
          image={a.avatar}
          seed={a.id}
          round
          onOpen={() => navigate(`/artist/${a.id}`)}
        />
      ))}
    </>
  );
}

export function StationCards({ stations }: { stations: Station[] }) {
  const player = usePlayer();
  const lib = useLibrary();
  return (
    <>
      {stations.map((s) => {
        const current = player.station?.id === s.id;
        const play = () => (current ? player.toggle() : player.playStation(s));
        const saved = lib.isSaved(s.id);
        return (
          <div key={s.id} className={`card station ${current && player.playing ? "live" : ""}`} role="button" tabIndex={0} onClick={play}
            onKeyDown={(e) => e.key === "Enter" && play()}>
            <div className="card-art">
              <Art src={s.favicon} seed={s.id} fallback="radio" className="station-art" />
              <span className="live-badge">LIVE</span>
              <button
                className="mini-play"
                aria-label={`Play ${s.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  play();
                }}
              >
                <Icon name={current && player.playing ? "pause" : "play"} size={20} />
              </button>
            </div>
            <div className="station-title">
              <b>{s.name}</b>
              <button
                className={`icon-btn heart ${saved ? "on" : ""}`}
                aria-label={saved ? "Remove station from Your Library" : "Save station to Your Library"}
                onClick={(e) => {
                  e.stopPropagation();
                  lib.toggleStation(s);
                }}
              >
                <Icon name={saved ? "heart" : "heartLine"} size={16} />
              </button>
            </div>
            <span>{[s.country, ...s.tags.slice(0, 2)].filter(Boolean).join(" · ")}</span>
          </div>
        );
      })}
    </>
  );
}
