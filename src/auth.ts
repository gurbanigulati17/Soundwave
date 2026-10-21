// Spotify Authorization Code flow with PKCE. Runs entirely in the browser,
// so no client secret or backend is needed.

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
const REDIRECT_URI =
  (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined) ??
  `${window.location.origin}/callback`;

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
].join(" ");

const TOKEN_KEY = "soundwave.token";
const VERIFIER_KEY = "soundwave.verifier";
const STATE_KEY = "soundwave.state";

interface StoredToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function isConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function login(): Promise<void> {
  if (!CLIENT_ID) throw new Error("VITE_SPOTIFY_CLIENT_ID is not set");
  const verifier = randomString(64);
  const state = randomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier),
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

async function requestToken(body: Record<string, string>): Promise<StoredToken> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID ?? "", ...body }),
  });
  if (!res.ok) throw new Error(`Token request failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  const token: StoredToken = {
    accessToken: json.access_token,
    // Spotify may omit refresh_token on refresh; keep the previous one then.
    refreshToken: json.refresh_token ?? readToken()?.refreshToken ?? "",
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  return token;
}

export async function handleCallback(search: string): Promise<void> {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  if (error) throw new Error(`Spotify login was cancelled or failed: ${error}`);

  const code = params.get("code");
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!code || !verifier) throw new Error("Missing authorization code; please log in again.");
  if (params.get("state") !== sessionStorage.getItem(STATE_KEY)) {
    throw new Error("Login state mismatch; please log in again.");
  }
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  await requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
}

function readToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredToken) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return readToken() !== null;
}

let refreshing: Promise<StoredToken> | null = null;

/** Returns a valid access token, refreshing it if it has expired. */
export async function getAccessToken(): Promise<string> {
  const token = readToken();
  if (!token) throw new Error("Not logged in");
  if (Date.now() < token.expiresAt) return token.accessToken;

  refreshing ??= requestToken({
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  }).finally(() => {
    refreshing = null;
  });
  return (await refreshing).accessToken;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.location.assign("/");
}
