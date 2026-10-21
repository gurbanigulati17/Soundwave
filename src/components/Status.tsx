import type { ReactNode } from "react";
import { Art } from "./Art";
import type { IconName } from "./Icons";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="status">{label}</div>;
}

export function ErrorMessage({ error, what }: { error: Error; what: string }) {
  return (
    <div className="status error">
      Couldn't load {what}. Check your internet connection and try again. ({error.message})
    </div>
  );
}

interface HeroProps {
  kind: string;
  title: string;
  image?: string;
  seed: string;
  round?: boolean;
  icon?: IconName;
  children?: ReactNode;
}

/** The large header at the top of playlist, artist and collection pages. */
export function Hero({ kind, title, image, seed, round, icon, children }: HeroProps) {
  return (
    <header className="hero">
      <Art src={image} seed={seed} round={round} fallback={icon} className={`hero-art ${seed}-art`} />
      <div className="hero-text">
        <span className="eyebrow">{kind}</span>
        <h1 className={title.length > 22 ? "long" : ""}>{title}</h1>
        <div className="meta">{children}</div>
      </div>
    </header>
  );
}
