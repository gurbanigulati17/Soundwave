// Simple stroke/fill icons drawn for this app.

type P = { size?: number };

const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);

export const HomeIcon = ({ size = 24 }: P) =>
  svg(size, <path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3L12 3z" />);

export const SearchIcon = ({ size = 24 }: P) =>
  svg(
    size,
    <path d="M10 3a7 7 0 1 0 4.2 12.6l5.1 5.1 1.4-1.4-5.1-5.1A7 7 0 0 0 10 3zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />,
  );

export const LibraryIcon = ({ size = 24 }: P) =>
  svg(size, <path d="M4 3h2v18H4V3zm5 0h2v18H9V3zm4.6 1.2 1.9-.7 6 16.9-1.9.7-6-16.9z" />);

export const PlayIcon = ({ size = 24 }: P) => svg(size, <path d="M7 4.5v15l13-7.5-13-7.5z" />);

export const PauseIcon = ({ size = 24 }: P) => svg(size, <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />);

export const NextIcon = ({ size = 24 }: P) => svg(size, <path d="M5 5v14l10-7L5 5zm11 0h3v14h-3V5z" />);

export const PrevIcon = ({ size = 24 }: P) => svg(size, <path d="M19 5v14L9 12l10-7zM5 5h3v14H5V5z" />);

export const ShuffleIcon = ({ size = 24 }: P) =>
  svg(
    size,
    <path d="M16 4h4v4l-1.5-1.5-3.6 3.6-1.4-1.4 3.6-3.6L16 4zM4 6.6 5.4 5.2l13.1 13.1L20 16.8V21h-4.2l1.3-1.3L4 6.6zm6.1 7.3 1.4 1.4-6.1 6.1L4 20l6.1-6.1z" />,
  );

export const RepeatIcon = ({ size = 24 }: P) =>
  svg(
    size,
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />,
  );

export const VolumeIcon = ({ size = 24 }: P) =>
  svg(
    size,
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />,
  );

export const HeartIcon = ({ size = 24 }: P) =>
  svg(
    size,
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.5h2c.7-1.3 2.2-2.5 4.3-2.5 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />,
  );

export const ClockIcon = ({ size = 16 }: P) =>
  svg(
    size,
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3v6l5 3 1-1.7-4-2.3V7h-2z" />,
  );

export const MusicIcon = ({ size = 24 }: P) =>
  svg(size, <path d="M9 3v11.6A3.5 3.5 0 1 0 11 18V8h8V3H9z" />);
