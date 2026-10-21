import { useSearchParams } from "react-router-dom";
import { StationCards } from "../components/Cards";
import { ErrorMessage, Loading } from "../components/Status";
import { radio, RADIO_CATEGORIES } from "../sources/radio";
import { useAsync } from "../util";

export function Radio() {
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") ?? RADIO_CATEGORIES[0].id;
  const category = RADIO_CATEGORIES.find((c) => c.id === tag);
  const { data, error, loading } = useAsync(() => radio.byTag(tag, 30), [tag]);

  return (
    <div className="view">
      <header className="page-head">
        <span className="eyebrow">Live radio</span>
        <h1>{category?.label ?? tag}</h1>
        <p className="muted">
          Real stations streaming live, including chart hits. Tap a station to tune in, or the heart to keep it in Your Library.
        </p>
      </header>
      <div className="chips">
        {RADIO_CATEGORIES.map((c) => (
          <button key={c.id} className={`chip ${c.id === tag ? "on" : ""}`} onClick={() => setParams({ tag: c.id }, { replace: true })}>
            {c.label}
          </button>
        ))}
      </div>
      {loading && <Loading label="Finding stations…" />}
      {error && <ErrorMessage error={error} what="radio stations" />}
      {data && data.length === 0 && <p className="empty">No stations are online for this category right now. Try another one.</p>}
      {data && data.length > 0 && <div className="cards grid">{<StationCards stations={data} />}</div>}
    </div>
  );
}
