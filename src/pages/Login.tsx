import { isConfigured, login } from "../auth";
import { MusicIcon } from "../components/Icons";

export function Login() {
  return (
    <div className="login">
      <MusicIcon size={64} />
      <h1>Soundwave</h1>
      <p className="muted">Your Spotify music, in a fresh web player.</p>
      {isConfigured() ? (
        <button className="pill-btn" onClick={() => login()}>
          Log in with Spotify
        </button>
      ) : (
        <div className="status error">
          Set <code>VITE_SPOTIFY_CLIENT_ID</code> in <code>.env</code> and restart the dev server. See README.md.
        </div>
      )}
      <p className="muted small">Playback requires Spotify Premium. Browsing works on any account.</p>
    </div>
  );
}
