import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { local } from "../sources/local";
import type { Station, Track } from "../types";

interface Library {
  liked: Track[];
  isLiked: (id: string) => boolean;
  toggleLike: (track: Track) => void;
  stations: Station[];
  isSaved: (id: string) => boolean;
  toggleStation: (station: Station) => void;
  files: Track[];
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  toast: string | null;
}

const Ctx = createContext<Library | null>(null);

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode); the session still works
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Track[]>(() => load("sw.liked"));
  const [stations, setStations] = useState<Station[]>(() => load("sw.stations"));
  const [files, setFiles] = useState<Track[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<number>();
  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(() => {
    local.list().then(setFiles, () => undefined);
  }, []);

  const toggleLike = useCallback(
    (track: Track) => {
      setLiked((prev) => {
        const has = prev.some((t) => t.id === track.id);
        const next = has ? prev.filter((t) => t.id !== track.id) : [track, ...prev];
        save("sw.liked", next);
        notify(has ? "Removed from Liked Songs" : "Added to Liked Songs");
        return next;
      });
    },
    [notify],
  );

  const toggleStation = useCallback(
    (station: Station) => {
      setStations((prev) => {
        const has = prev.some((s) => s.id === station.id);
        const next = has ? prev.filter((s) => s.id !== station.id) : [station, ...prev];
        save("sw.stations", next);
        notify(has ? "Removed from Your Library" : "Station saved to Your Library");
        return next;
      });
    },
    [notify],
  );

  const addFiles = useCallback(
    async (list: FileList | File[]) => {
      await local.add(list);
      setFiles(await local.list());
      notify("Added to Your files");
    },
    [notify],
  );

  const removeFile = useCallback(async (id: string) => {
    await local.remove(id);
    setFiles(await local.list());
  }, []);

  const value = useMemo<Library>(
    () => ({
      liked,
      isLiked: (id) => liked.some((t) => t.id === id),
      toggleLike,
      stations,
      isSaved: (id) => stations.some((s) => s.id === id),
      toggleStation,
      files,
      addFiles,
      removeFile,
      toast,
    }),
    [liked, stations, files, toast, toggleLike, toggleStation, addFiles, removeFile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary(): Library {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
