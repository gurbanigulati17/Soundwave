import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { radio } from "../sources/radio";
import type { Station, Track } from "../types";

type Repeat = "off" | "all" | "one";

interface PlayerState {
  queue: Track[];
  /** Index into `queue` of the current track. */
  index: number;
  station: Station | null;
  playing: boolean;
  loading: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: Repeat;
  volume: number;
  error: string | null;
  /** Identifies where playback started (a playlist id, "liked", …) for highlighting. */
  contextId: string | null;
}

interface Player extends PlayerState {
  track: Track | null;
  playTracks: (tracks: Track[], startIndex?: number, contextId?: string) => void;
  playStation: (station: Station) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const Ctx = createContext<Player | null>(null);

function readVolume(): number {
  try {
    const v = Number(localStorage.getItem("sw.volume"));
    return Number.isFinite(v) && localStorage.getItem("sw.volume") !== null ? v : 0.8;
  } catch {
    return 0.8;
  }
}

function shuffled(n: number, first: number): number[] {
  const rest = [...Array(n).keys()].filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  // Play order over queue indices; differs from 0..n-1 only while shuffling.
  const orderRef = useRef<number[]>([]);
  const [s, setS] = useState<PlayerState>({
    queue: [],
    index: -1,
    station: null,
    playing: false,
    loading: false,
    position: 0,
    duration: 0,
    shuffle: false,
    repeat: "off",
    volume: readVolume(),
    error: null,
    contextId: null,
  });
  const stateRef = useRef(s);
  stateRef.current = s;

  const load = useCallback((url: string) => {
    const audio = audioRef.current;
    audio.src = url;
    audio.play().catch((e: Error) => {
      if (e.name !== "AbortError") setS((p) => ({ ...p, error: "This song couldn't be played.", loading: false }));
    });
  }, []);

  const playIndex = useCallback(
    (index: number) => {
      const track = stateRef.current.queue[index];
      if (!track) return;
      setS((p) => ({ ...p, index, station: null, position: 0, duration: track.duration ?? 0, loading: true, error: null }));
      load(track.streamUrl);
    },
    [load],
  );

  const step = useCallback(
    (dir: 1 | -1, auto: boolean) => {
      const { queue, index, repeat } = stateRef.current;
      if (!queue.length) return;
      if (auto && repeat === "one") return playIndex(index);
      const order = orderRef.current;
      let pos = order.indexOf(index) + dir;
      if (pos >= order.length) {
        if (auto && repeat === "off") {
          setS((p) => ({ ...p, playing: false, position: 0 }));
          return;
        }
        pos = 0;
      }
      if (pos < 0) pos = order.length - 1;
      playIndex(order[pos]);
    },
    [playIndex],
  );

  // Wire up the <audio> element once.
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = "auto";
    audio.volume = stateRef.current.volume;
    const on = (type: string, fn: () => void) => audio.addEventListener(type, fn);
    on("play", () => setS((p) => ({ ...p, playing: true })));
    on("pause", () => setS((p) => ({ ...p, playing: false })));
    on("playing", () => setS((p) => ({ ...p, loading: false, error: null })));
    on("waiting", () => setS((p) => ({ ...p, loading: true })));
    on("timeupdate", () => setS((p) => ({ ...p, position: audio.currentTime })));
    on("durationchange", () => {
      if (Number.isFinite(audio.duration)) setS((p) => ({ ...p, duration: audio.duration }));
    });
    on("ended", () => step(1, true));
    on("error", () => {
      if (!audio.src) return;
      const station = stateRef.current.station;
      setS((p) => ({
        ...p,
        loading: false,
        playing: false,
        error: station ? `${station.name} is offline right now.` : "This song couldn't be played. Skipping…",
      }));
      if (!station) setTimeout(() => step(1, true), 1500);
    });
  }, [step]);

  // Lock-screen and notification controls.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const track = s.station ? null : s.queue[s.index];
    const title = s.station?.name ?? track?.title;
    if (!title) return;
    const artwork = s.station?.favicon ?? track?.artwork;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: s.station ? "Live radio" : track?.artist,
      artwork: artwork ? [{ src: artwork, sizes: "480x480" }] : [],
    });
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", () => audioRef.current.play());
    ms.setActionHandler("pause", () => audioRef.current.pause());
    ms.setActionHandler("nexttrack", s.station ? null : () => step(1, false));
    ms.setActionHandler("previoustrack", s.station ? null : () => step(-1, false));
  }, [s.station, s.queue, s.index, step]);

  const playTracks = useCallback(
    (tracks: Track[], startIndex = 0, contextId?: string) => {
      if (!tracks.length) return;
      const start = Math.max(0, Math.min(startIndex, tracks.length - 1));
      orderRef.current = stateRef.current.shuffle ? shuffled(tracks.length, start) : [...tracks.keys()];
      stateRef.current = { ...stateRef.current, queue: tracks };
      setS((p) => ({ ...p, queue: tracks, contextId: contextId ?? null }));
      playIndex(start);
    },
    [playIndex],
  );

  const playStation = useCallback(
    (station: Station) => {
      setS((p) => ({ ...p, station, contextId: `station:${station.id}`, position: 0, duration: 0, loading: true, error: null }));
      load(station.url);
      radio.reportClick(station.id);
    },
    [load],
  );

  const player = useMemo<Player>(() => {
    const audio = audioRef.current;
    return {
      ...s,
      track: s.station ? null : (s.queue[s.index] ?? null),
      playTracks,
      playStation,
      toggle: () => {
        if (!audio.src) return;
        if (audio.paused) audio.play().catch(() => undefined);
        else audio.pause();
      },
      next: () => step(1, false),
      previous: () => {
        if (audio.currentTime > 3) audio.currentTime = 0;
        else step(-1, false);
      },
      seek: (seconds) => {
        if (s.station) return;
        audio.currentTime = seconds;
        setS((p) => ({ ...p, position: seconds }));
      },
      setVolume: (v) => {
        audio.volume = v;
        try {
          localStorage.setItem("sw.volume", String(v));
        } catch {
          // storage unavailable
        }
        setS((p) => ({ ...p, volume: v }));
      },
      toggleShuffle: () => {
        const on = !s.shuffle;
        orderRef.current = on ? shuffled(s.queue.length, Math.max(0, s.index)) : [...s.queue.keys()];
        setS((p) => ({ ...p, shuffle: on }));
      },
      cycleRepeat: () => setS((p) => ({ ...p, repeat: p.repeat === "off" ? "all" : p.repeat === "all" ? "one" : "off" })),
    };
  }, [s, playTracks, playStation, step]);

  return <Ctx.Provider value={player}>{children}</Ctx.Provider>;
}

export function usePlayer(): Player {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
