import { useEffect, useState } from "react";

export function formatTime(seconds: number | undefined): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function compact(n: number | undefined): string {
  if (n == null) return "";
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

/** Runs `fn` whenever `deps` change and tracks its result. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, loading: true });
  useEffect(() => {
    let active = true;
    setState({ data: undefined, error: undefined, loading: true });
    fn().then(
      (data) => active && setState({ data, error: undefined, loading: false }),
      (error: Error) => active && setState({ data: undefined, error, loading: false }),
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const songs = (n: number) => `${n} ${n === 1 ? "song" : "songs"}`;
