import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { PlayerBar, Sidebar, TabBar } from "./components/Chrome";
import { Icon } from "./components/Icons";
import { Artist } from "./pages/Artist";
import { Genre } from "./pages/Genre";
import { Home } from "./pages/Home";
import { Files, Library, Liked } from "./pages/Library";
import { Playlist } from "./pages/Playlist";
import { Radio } from "./pages/Radio";
import { Search } from "./pages/Search";
import { PlayerProvider } from "./player/PlayerProvider";
import { LibraryProvider, useLibrary } from "./state/LibraryProvider";

export function App() {
  return (
    <LibraryProvider>
      <PlayerProvider>
        <Shell />
      </PlayerProvider>
    </LibraryProvider>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { toast } = useLibrary();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <Sidebar />
      <main className="panel main" ref={mainRef} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}>
        <div className="main-glow" />
        <div className={`topbar ${scrolled ? "solid" : ""}`}>
          <button className="round-btn" onClick={() => navigate(-1)} aria-label="Go back" disabled={pathname === "/"}>
            <Icon name="back" size={20} />
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/radio" element={<Radio />} />
          <Route path="/library" element={<Library />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/files" element={<Files />} />
          <Route path="/genre/:name" element={<Genre />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="credits">
          Music from <a href="https://audius.co" target="_blank" rel="noreferrer">Audius</a>,{" "}
          <a href="https://www.jamendo.com" target="_blank" rel="noreferrer">Jamendo</a> and stations listed on{" "}
          <a href="https://www.radio-browser.info" target="_blank" rel="noreferrer">Radio Browser</a>.
        </footer>
      </main>
      <PlayerBar />
      <TabBar />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
