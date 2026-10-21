import { useEffect, useRef, useState } from "react";
import { handleCallback } from "../auth";

export function Callback() {
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // React StrictMode runs effects twice in dev; the auth code is single-use.
    if (started.current) return;
    started.current = true;
    handleCallback(window.location.search).then(
      () => window.location.replace("/"),
      (e: Error) => setError(e.message),
    );
  }, []);

  return (
    <div className="login">
      {error ? (
        <>
          <div className="status error">{error}</div>
          <a className="pill-btn" href="/">
            Back to login
          </a>
        </>
      ) : (
        <p className="muted">Logging you in…</p>
      )}
    </div>
  );
}
