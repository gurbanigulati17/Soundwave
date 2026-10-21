import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Spotify only accepts loopback redirect URIs as 127.0.0.1, not "localhost".
export default defineConfig({
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 5173, strictPort: true },
});
