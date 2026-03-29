type PlaybackHistoryEntry = {
  artist: string;
  lastPlayedAt: string;
  slug: string;
  title: string;
};

const playbackHistoryKey = "guitar-chords:last-played-songs";
const maximumPlaybackHistoryItems = 8;

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function parsePlaybackHistory(storedValue: string | null) {
  try {
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        (entry): entry is PlaybackHistoryEntry =>
          typeof entry === "object" &&
          entry !== null &&
          typeof entry.slug === "string" &&
          typeof entry.title === "string" &&
          typeof entry.artist === "string" &&
          typeof entry.lastPlayedAt === "string",
      )
      .slice(0, maximumPlaybackHistoryItems);
  } catch {
    return [];
  }
}

export function getPlaybackHistoryStorageSnapshot() {
  if (!canUseBrowserStorage()) {
    return "";
  }

  return window.localStorage.getItem(playbackHistoryKey) ?? "";
}

export function readPlaybackHistory() {
  return parsePlaybackHistory(getPlaybackHistoryStorageSnapshot());
}

export function writePlaybackHistory(entries: PlaybackHistoryEntry[]) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(
    playbackHistoryKey,
    JSON.stringify(entries.slice(0, maximumPlaybackHistoryItems)),
  );
  window.dispatchEvent(new Event("guitar-chords:playback-history"));
}

export function recordSongPlayback(song: {
  artist: string;
  slug: string;
  title: string;
}) {
  const nextEntries = [
    {
      ...song,
      lastPlayedAt: new Date().toISOString(),
    },
    ...readPlaybackHistory().filter((entry) => entry.slug !== song.slug),
  ];

  writePlaybackHistory(nextEntries);
}

export type { PlaybackHistoryEntry };
