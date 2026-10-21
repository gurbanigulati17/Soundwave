import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shelf, StationCards } from "../components/Cards";
import { Icon } from "../components/Icons";
import { Hero } from "../components/Status";
import { TrackList } from "../components/TrackList";
import { usePlayer } from "../player/PlayerProvider";
import { useLibrary } from "../state/LibraryProvider";
import { songs } from "../util";

export function Library() {
  const lib = useLibrary();
  const navigate = useNavigate();

  return (
    <div className="view">
      <h1 className="greeting">Your Library</h1>
      <div className="lib-tiles">
        <button className="lib-tile liked-art" onClick={() => navigate("/liked")}>
          <Icon name="heart" size={28} />
          <b>Liked Songs</b>
          <span>{songs(lib.liked.length)}</span>
        </button>
        <button className="lib-tile files-art" onClick={() => navigate("/files")}>
          <Icon name="music" size={28} />
          <b>Your files</b>
          <span>{songs(lib.files.length)} on this device</span>
        </button>
      </div>
      {lib.stations.length > 0 ? (
        <Shelf title="Saved radio stations">
          <StationCards stations={lib.stations} />
        </Shelf>
      ) : (
        <p className="empty">Tap the heart on any radio station to keep it here.</p>
      )}
    </div>
  );
}

export function Liked() {
  const lib = useLibrary();
  const player = usePlayer();
  const live = player.contextId === "liked";
  return (
    <div className="view">
      <Hero kind="Playlist" title="Liked Songs" seed="liked" icon="heart">
        <span>{songs(lib.liked.length)}</span>
      </Hero>
      <div className="actions">
        <button
          className="big-play"
          aria-label={live && player.playing ? "Pause" : "Play"}
          onClick={() => (live ? player.toggle() : player.playTracks(lib.liked, 0, "liked"))}
          disabled={!lib.liked.length}
        >
          <Icon name={live && player.playing ? "pause" : "play"} size={26} />
        </button>
      </div>
      {lib.liked.length ? (
        <TrackList tracks={lib.liked} contextId="liked" />
      ) : (
        <p className="empty">Songs you like appear here. Tap the heart next to any song to save it.</p>
      )}
    </div>
  );
}

export function Files() {
  const lib = useLibrary();
  const player = usePlayer();
  const input = useRef<HTMLInputElement>(null);
  const live = player.contextId === "files";

  return (
    <div
      className="view"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) lib.addFiles(e.dataTransfer.files);
      }}
    >
      <Hero kind="On this device" title="Your files" seed="files">
        <p>Add MP3, M4A, WAV, OGG or FLAC files you own. They stay on this device and play offline.</p>
        <span>{songs(lib.files.length)}</span>
      </Hero>
      <div className="actions">
        <button
          className="big-play"
          aria-label={live && player.playing ? "Pause" : "Play"}
          onClick={() => (live ? player.toggle() : player.playTracks(lib.files, 0, "files"))}
          disabled={!lib.files.length}
        >
          <Icon name={live && player.playing ? "pause" : "play"} size={26} />
        </button>
        <button className="pill-btn outline" onClick={() => input.current?.click()}>
          <Icon name="plus" size={18} /> Add songs
        </button>
        <input
          ref={input}
          id="file-input"
          type="file"
          accept="audio/*,.mp3,.m4a,.aac,.ogg,.opus,.wav,.flac"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) lib.addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {lib.files.length ? (
        <TrackList tracks={lib.files} contextId="files" showArt={false} onRemove={(t) => lib.removeFile(t.id)} />
      ) : (
        <p className="empty">No files yet. Tap “Add songs”, or drag audio files onto this page.</p>
      )}
    </div>
  );
}
