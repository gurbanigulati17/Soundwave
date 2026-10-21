import { useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorMessage, Loading } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { audius } from "../sources/audius";
import { useAsync } from "../util";

const RANGES = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "allTime", label: "All time" },
] as const;

export function Genre() {
  const { name = "All" } = useParams();
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("week");
  const genre = name === "All" ? undefined : name;
  const { data, error, loading } = useAsync(() => audius.trending(genre, range), [genre, range]);

  return (
    <div className="view">
      <header className="page-head">
        <span className="eyebrow">Trending</span>
        <h1>{genre ?? "All genres"}</h1>
      </header>
      <div className="chips">
        {RANGES.map((r) => (
          <button key={r.id} className={`chip ${range === r.id ? "on" : ""}`} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      {loading && <Loading />}
      {error && <ErrorMessage error={error} what="this chart" />}
      {data && <TrackList tracks={data} contextId={`genre:${name}:${range}`} showPlays />}
    </div>
  );
}
