import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { api } from "./api";
import { isLoggedIn, logout } from "./auth";
import { NowPlayingBar } from "./components/NowPlayingBar";
import { Sidebar } from "./components/Sidebar";
import { Album } from "./pages/Album";
import { Artist } from "./pages/Artist";
import { Callback } from "./pages/Callback";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { LikedSongs } from "./pages/LikedSongs";
import { Login } from "./pages/Login";
import { Playlist } from "./pages/Playlist";
import { Search } from "./pages/Search";
import { PlayerProvider } from "./player/PlayerProvider";
import { pickImage, useAsync } from "./util";

export function App() {
  const { pathname } = useLocation();
  if (pathname === "/callback") return <Callback />;
  if (!isLoggedIn()) return <Login />;
  return (
    <PlayerProvider>
      <Shell />
    </PlayerProvider>
  );
}

function Shell() {
  const me = useAsync(() => api.me(), []);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <Sidebar />
      <main className="panel main" ref={mainRef}>
        <div className="topbar">
          {me.data && (
            <div className="user">
              {pickImage(me.data.images, 32) && <img src={pickImage(me.data.images, 32)} alt="" />}
              <span>{me.data.display_name}</span>
              <button className="pill-btn outline small" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/collection/tracks" element={<LikedSongs />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/album/:id" element={<Album />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <NowPlayingBar />
    </div>
  );
}
