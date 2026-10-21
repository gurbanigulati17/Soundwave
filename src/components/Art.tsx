import { useState } from "react";
import { Icon, type IconName } from "./Icons";

// Deterministic fallback colour so missing artwork still looks intentional.
const COLORS = ["#8d67ab", "#e8115b", "#1e64d6", "#27856a", "#e1730c", "#477d95", "#ba5d07", "#503750"];
const colorFor = (s: string) => COLORS[[...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % COLORS.length];

interface Props {
  src?: string;
  seed: string;
  round?: boolean;
  className?: string;
  fallback?: IconName;
}

export function Art({ src, seed, round, className = "", fallback = "music" }: Props) {
  const [failed, setFailed] = useState(false);
  const cls = `art ${round ? "round" : ""} ${className}`;
  if (!src || failed) {
    return (
      <span className={`${cls} art-fallback`} style={{ background: `linear-gradient(135deg, ${colorFor(seed)}, #111513)` }}>
        <Icon name={fallback} size={28} />
      </span>
    );
  }
  return <img className={cls} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
