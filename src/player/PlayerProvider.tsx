import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "../api";
import { getAccessToken } from "../auth";

type RepeatMode = "off" | "context" | "track";
const REPEAT_MODES: RepeatMode[] = ["off", "context", "track"];

interface PlayerState {
  ready: boolean;
  error: string | null;
  deviceId: string | null;
  track: Spotify.Track | null;
  paused: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
}

interface PlayerControls extends PlayerState {
  /** Play a context (album/playlist/artist), optionally starting at a track. */
  playContext: (contextUri: string, startUri?: string) => Promise<void>;
  /** Play an explicit list of track URIs, starting at `startUri`. */
  playTracks: (uris: string[], startUri?: string) => Promise<void>;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (ms: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerControls | null>(null);

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

function loadSdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve();
  return new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => reject(new Error("Could not load the Spotify Web Playback SDK"));
    document.body.appendChild(script);
  });
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const [state, setState] = useState<PlayerState>({
    ready: false,
    error: null,
    deviceId: null,
    track: null,
    paused: true,
    position: 0,
    duration: 0,
    shuffle: false,
    repeat: "off",
    volume: 0.7,
  });

  useEffect(() => {
    let cancelled = false;

    loadSdk()
      .then(() => {
        if (cancelled) return;
        const player = new window.Spotify.Player({
          name: "Soundwave Web Player",
          getOAuthToken: (cb) => {
            getAccessToken().then(cb, () => undefined);
          },
          volume: 0.7,
        });
        playerRef.current = player;

        const fail = (message: string) => setState((s) => ({ ...s, error: message }));
        player.addListener("initialization_error", ({ message }) => fail(message));
        player.addListener("authentication_error", ({ message }) => fail(`Authentication failed: ${message}`));
        player.addListener("account_error", () =>
          fail("Playback needs a Spotify Premium account. Browsing still works."),
        );
        player.addListener("playback_error", ({ message }) => fail(message));

        player.addListener("ready", ({ device_id }) => {
          setState((s) => ({ ...s, ready: true, deviceId: device_id, error: null }));
        });
        player.addListener("not_ready", () => setState((s) => ({ ...s, ready: false })));

        player.addListener("player_state_changed", (ps) => {
          if (!ps) return;
          setState((s) => ({
            ...s,
            track: ps.track_window.current_track,
            paused: ps.paused,
            position: ps.position,
            duration: ps.duration,
            shuffle: ps.shuffle,
            repeat: REPEAT_MODES[ps.repeat_mode] ?? "off",
          }));
        });

        player.connect();
      })
      .catch((e: Error) => setState((s) => ({ ...s, error: e.message })));

    return () => {
      cancelled = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, []);

  // The SDK only reports position on state changes, so advance it locally while playing.
  useEffect(() => {
    if (state.paused) return;
    const id = window.setInterval(() => {
      setState((s) => ({ ...s, position: Math.min(s.position + 500, s.duration) }));
    }, 500);
    return () => window.clearInterval(id);
  }, [state.paused]);

  const withDevice = useCallback(
    async (fn: (deviceId: string) => Promise<void>) => {
      if (!state.deviceId) {
        setState((s) => ({ ...s, error: s.error ?? "The web player is still connecting…" }));
        return;
      }
      try {
        // Browsers block audio until a user gesture activates the player element.
        await playerRef.current?.activateElement();
        await fn(state.deviceId);
      } catch (e) {
        setState((s) => ({ ...s, error: (e as Error).message }));
      }
    },
    [state.deviceId],
  );

  const playContext = useCallback(
    (contextUri: string, startUri?: string) =>
      withDevice((id) =>
        api.play(id, { context_uri: contextUri, ...(startUri ? { offset: { uri: startUri } } : {}) }),
      ),
    [withDevice],
  );

  const playTracks = useCallback(
    (uris: string[], startUri?: string) =>
      withDevice((id) => api.play(id, { uris, ...(startUri ? { offset: { uri: startUri } } : {}) })),
    [withDevice],
  );

  const controls: PlayerControls = {
    ...state,
    playContext,
    playTracks,
    togglePlay: () => {
      playerRef.current?.activateElement();
      playerRef.current?.togglePlay();
    },
    next: () => playerRef.current?.nextTrack(),
    previous: () => playerRef.current?.previousTrack(),
    seek: (ms) => {
      playerRef.current?.seek(ms);
      setState((s) => ({ ...s, position: ms }));
    },
    setVolume: (v) => {
      playerRef.current?.setVolume(v);
      setState((s) => ({ ...s, volume: v }));
    },
    toggleShuffle: () => withDevice((id) => api.shuffle(!state.shuffle, id)),
    cycleRepeat: () =>
      withDevice((id) => api.repeat(REPEAT_MODES[(REPEAT_MODES.indexOf(state.repeat) + 1) % 3], id)),
  };

  return <PlayerContext.Provider value={controls}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerControls {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
