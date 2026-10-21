const PATHS = {
  home: "M12 3 2 11h3v9h5v-6h4v6h5v-9h3L12 3z",
  search: "M10 3a7 7 0 1 0 4.2 12.6l5.1 5.1 1.4-1.4-5.1-5.1A7 7 0 0 0 10 3zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z",
  library: "M4 3h2v18H4V3zm5 0h2v18H9V3zm4.6 1.2 1.9-.7 6 16.9-1.9.7-6-16.9z",
  radio:
    "M3.2 6.2 17.6 1l.7 1.9L8.6 6.5H20a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.1l.2-.9zM5 8.5V19h14V8.5H5zm9.5 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM6.5 11h4v2h-4v-2zm0 3h4v2h-4v-2z",
  play: "M7 4.5v15l13-7.5-13-7.5z",
  pause: "M6 4h4v16H6V4zm8 0h4v16h-4V4z",
  next: "M5 5v14l10-7L5 5zm11 0h3v14h-3V5z",
  prev: "M19 5v14L9 12l10-7zM5 5h3v14H5V5z",
  shuffle:
    "M16 4h4v4l-1.5-1.5-3.6 3.6-1.4-1.4 3.6-3.6L16 4zM4 6.6 5.4 5.2l13.1 13.1L20 16.8V21h-4.2l1.3-1.3L4 6.6zm6.1 7.3 1.4 1.4-6.1 6.1L4 20l6.1-6.1z",
  repeat: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
  heart:
    "M12 20.5s-7.5-4.6-9.6-9.2C.9 7.9 3 4 6.7 4c2.1 0 3.6 1.2 4.3 2.5h2C13.7 5.2 15.2 4 17.3 4c3.7 0 5.8 3.9 4.3 7.3-2.1 4.6-9.6 9.2-9.6 9.2z",
  heartLine:
    "M6.7 4C3 4 .9 7.9 2.4 11.3c2.1 4.6 9.6 9.2 9.6 9.2s7.5-4.6 9.6-9.2C23.1 7.9 21 4 17.3 4c-2.1 0-3.6 1.2-4.3 2.5h-2C10.3 5.2 8.8 4 6.7 4zm0 2c1.5 0 2.5 1 3 2.2l.4.8h3.8l.4-.8c.5-1.2 1.5-2.2 3-2.2 2.2 0 3.6 2.4 2.5 4.5-1.5 3.3-6.2 6.7-7.8 7.7-1.6-1-6.3-4.4-7.8-7.7C3.1 8.4 4.5 6 6.7 6z",
  back: "M15.5 4.5 8 12l7.5 7.5 1.4-1.4L10.8 12l6.1-6.1-1.4-1.4z",
  clock:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3v6l5 3 1-1.7-4-2.3V7h-2z",
  volume:
    "M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z",
  mute: "M3 9v6h4l5 5V4L7 9H3zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7z",
  plus: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z",
  trash: "M9 3h6l1 2h4v2H4V5h4l1-2zM6 8h12l-1 13H7L6 8zm4 2v9h1.5v-9H10zm3.5 0v9H15v-9h-1.5z",
  music: "M9 3v11.6A3.5 3.5 0 1 0 11 18V8h8V3H9z",
  logo: "M3 12h2v3H3zm4-4h2v11H7zm4-5h2v18h-2zm4 6h2v9h-2zm4 3h2v3h-2z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
