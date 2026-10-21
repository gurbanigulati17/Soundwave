// The user's own audio files, kept in IndexedDB so they survive reloads.

import type { Track } from "../types";

const DB = "soundwave";
const STORE = "files";

interface StoredFile {
  id: string;
  name: string;
  blob: Blob;
  addedAt: number;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

const urls = new Map<string, string>();

/** "Artist - Title.mp3" becomes artist + title; anything else is just a title. */
function parseName(name: string): { title: string; artist: string } {
  const base = name.replace(/\.[^.]+$/, "").replace(/_/g, " ").trim();
  const parts = base.split(/\s+-\s+/);
  if (parts.length >= 2) return { artist: parts[0], title: parts.slice(1).join(" - ") };
  return { artist: "Your files", title: base };
}

function toTrack(f: StoredFile): Track {
  if (!urls.has(f.id)) urls.set(f.id, URL.createObjectURL(f.blob));
  return { id: `local:${f.id}`, source: "local", ...parseName(f.name), streamUrl: urls.get(f.id)! };
}

export const local = {
  async list(): Promise<Track[]> {
    const files = await tx<StoredFile[]>("readonly", (s) => s.getAll() as IDBRequest<StoredFile[]>);
    return files.sort((a, b) => b.addedAt - a.addedAt).map(toTrack);
  },
  async add(files: FileList | File[]): Promise<void> {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i.test(file.name)) continue;
      const entry: StoredFile = { id: crypto.randomUUID(), name: file.name, blob: file, addedAt: Date.now() };
      await tx("readwrite", (s) => s.put(entry));
    }
  },
  async remove(trackId: string): Promise<void> {
    const id = trackId.replace(/^local:/, "");
    await tx("readwrite", (s) => s.delete(id));
    const url = urls.get(id);
    if (url) URL.revokeObjectURL(url);
    urls.delete(id);
  },
};
