import { useEffect, useState } from "react";
import type { Image } from "./types";

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Picks the smallest image at least `min` px wide, falling back to the largest. */
export function pickImage(images: Image[] | null | undefined, min = 300): string | undefined {
  if (!images?.length) return undefined;
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((i) => (i.width ?? 0) >= min) ?? sorted[sorted.length - 1]).url;
}

/** Strips the HTML Spotify embeds in playlist descriptions. */
export function plainText(html: string | null | undefined): string {
  if (!html) return "";
  return new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
