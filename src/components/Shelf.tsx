import { useNavigate } from "react-router-dom";
import { usePlayer } from "../player/PlayerProvider";
import { MusicIcon, PlayIcon } from "./Icons";

export interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  /** Context URI to play from the card's play button. */
  uri?: string;
  round?: boolean;
}

export function Card({ item }: { item: CardItem }) {
  const navigate = useNavigate();
  const player = usePlayer();

  return (
    <div className="card" onClick={() => navigate(item.href)} role="link" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(item.href)}>
      <div className={`card-art ${item.round ? "round" : ""}`}>
        {item.image ? <img src={item.image} alt="" loading="lazy" /> : <MusicIcon size={40} />}
        {item.uri && (
          <button
            className="card-play"
            aria-label={`Play ${item.title}`}
            onClick={(e) => {
              e.stopPropagation();
              player.playContext(item.uri!);
            }}
          >
            <PlayIcon size={20} />
          </button>
        )}
      </div>
      <div className="title">{item.title}</div>
      {item.subtitle && <div className="sub clamp">{item.subtitle}</div>}
    </div>
  );
}

export function Shelf({ title, items }: { title: string; items: CardItem[] }) {
  if (!items.length) return null;
  return (
    <section className="shelf">
      <h2>{title}</h2>
      <div className="grid">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
