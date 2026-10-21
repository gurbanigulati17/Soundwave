import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";
import { pickImage, useAsync } from "../util";
import { HeartIcon, HomeIcon, LibraryIcon, MusicIcon, SearchIcon } from "./Icons";

export function Sidebar() {
  const playlists = useAsync(() => api.myPlaylists(), []);
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <nav className="panel nav">
        <div className="brand">
          <MusicIcon size={28} /> Soundwave
        </div>
        <NavLink to="/" end className="nav-link">
          <HomeIcon /> Home
        </NavLink>
        <NavLink to="/search" className="nav-link">
          <SearchIcon /> Search
        </NavLink>
      </nav>

      <section className="panel library">
        <NavLink to="/library" className="nav-link">
          <LibraryIcon /> Your Library
        </NavLink>

        <ul className="library-list">
          <li>
            <button className="library-item" onClick={() => navigate("/collection/tracks")}>
              <span className="thumb liked">
                <HeartIcon size={18} />
              </span>
              <span>
                <span className="title">Liked Songs</span>
                <span className="sub">Playlist</span>
              </span>
            </button>
          </li>
          {playlists.data?.items.filter(Boolean).map((p) => (
            <li key={p.id}>
              <button className="library-item" onClick={() => navigate(`/playlist/${p.id}`)}>
                {pickImage(p.images, 64) ? (
                  <img className="thumb" src={pickImage(p.images, 64)} alt="" />
                ) : (
                  <span className="thumb">
                    <MusicIcon size={18} />
                  </span>
                )}
                <span>
                  <span className="title">{p.name}</span>
                  <span className="sub">Playlist · {p.owner.display_name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {playlists.error && <p className="muted small">Couldn't load playlists.</p>}
      </section>
    </aside>
  );
}
