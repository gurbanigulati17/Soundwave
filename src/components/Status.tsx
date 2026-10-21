import type { ReactNode } from "react";
import { MusicIcon } from "./Icons";

export function Loading() {
  return <div className="status">Loading…</div>;
}

export function ErrorMessage({ error }: { error: Error }) {
  return <div className="status error">Something went wrong: {error.message}</div>;
}

interface HeroProps {
  kind: string;
  title: string;
  image?: string;
  round?: boolean;
  children?: ReactNode;
}

/** The large header at the top of album, playlist and artist pages. */
export function Hero({ kind, title, image, round, children }: HeroProps) {
  return (
    <header className="hero">
      <div className={`hero-art ${round ? "round" : ""}`}>
        {image ? <img src={image} alt="" /> : <MusicIcon size={64} />}
      </div>
      <div className="hero-text">
        <span className="small">{kind}</span>
        <h1 className={title.length > 24 ? "long" : ""}>{title}</h1>
        <div className="hero-meta">{children}</div>
      </div>
    </header>
  );
}
