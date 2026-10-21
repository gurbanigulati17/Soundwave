# Soundwave

A free music player for the web and Android. It streams real songs from
independent artists, live radio stations from around the world, and your own
music files. It needs no accounts and no paid APIs.

![Home screen](docs/home.png)

## Where the music comes from

| Source | What it provides | Setup |
| --- | --- | --- |
| [Audius](https://audius.co) | Full tracks, trending charts, playlists and artist pages from independent artists, through Audius's open API | None |
| [Radio Browser](https://www.radio-browser.info) | 50,000+ live radio stations, including Bollywood, Punjabi and chart-hits stations | None |
| [Jamendo](https://www.jamendo.com) | About 600,000 Creative Commons tracks | Optional free client ID |
| Your files | MP3, M4A, WAV, OGG or FLAC files you add. Stored on the device and playable offline | None |

Mainstream label releases are only available through licensed radio stations.
No source offers them on demand for free.

## Features

- **Home:** trending songs with play counts, popular playlists, live Bollywood radio, rising artists
- **Genres:** Audius charts per genre for this week, this month or all time
- **Search:** songs, artists, playlists, radio stations and Creative Commons tracks in one search
- **Radio:** stations by category (Bollywood, Punjabi, Hindi, Top Hits, Pop, Lo-fi and more); save favourites
- **Your Library:** Liked Songs, saved stations and your own files
- **Player:** play/pause, next/previous, seek, shuffle, repeat all/one and volume, with lock-screen controls
- Phone layout with a bottom tab bar and a mini player
- Installable as a web app (PWA) or as an Android APK

## Get the app

Once this repo is on GitHub, both builds run automatically on every push to `main`:

- **Web app:** published to GitHub Pages at `https://<your-username>.github.io/<repo>/`.
  Enable it once under **Settings → Pages → Source: GitHub Actions**.
- **Android APK:** attached to the **latest** release under **Releases**. On your phone,
  download `Soundwave.apk`, open it, and allow "Install unknown apps" for your browser
  when Android asks.

To add Jamendo, create a free client ID at <https://devportal.jamendo.com> and add it under
**Settings → Secrets and variables → Actions → Variables** as `JAMENDO_CLIENT_ID`.

## Run it locally

```sh
npm install
cp .env.example .env   # optional: add VITE_JAMENDO_CLIENT_ID
npm run dev            # http://127.0.0.1:5173
```

## Build the Android app yourself

Requires Android Studio (or the Android SDK) and JDK 17.

```sh
npm run android:project     # generates android/ with the app icon
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

After changing the web code, run `npm run android:sync` to copy it into the Android project.

## Project layout

```
src/
  sources/        audius.ts, radio.ts, jamendo.ts, local.ts (one module per music source)
  player/         PlayerProvider: queue, shuffle, repeat, media-session controls
  state/          LibraryProvider: liked songs, saved stations, local files
  components/     Sidebar, player bar, tab bar, track table, cards
  pages/          Home, Search, Genre, Radio, Playlist, Artist, Library, Liked, Files
capacitor.config.ts   Android app id and name
assets/               Icon sources for the Android launcher icon
.github/workflows/    web.yml (GitHub Pages) and android.yml (APK release)
```

## Credits

Music and metadata come from Audius, Jamendo and the stations listed on Radio
Browser. All rights stay with the artists and stations. Soundwave is an independent
project and is not affiliated with any of these services.
