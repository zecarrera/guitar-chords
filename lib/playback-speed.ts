type PlaybackSpeedState = {
  wasPlaying: boolean;
  isPlaying: boolean;
  speed: number;
  defaultSpeed: number;
};

export function getCurrentPlaybackSpeed(
  defaultSpeed: number,
  manualSpeed: number | null,
) {
  return manualSpeed ?? defaultSpeed;
}

export function getSpeedToPersistOnPlaybackEnd({
  wasPlaying,
  isPlaying,
  speed,
  defaultSpeed,
}: PlaybackSpeedState) {
  return wasPlaying && !isPlaying && speed !== defaultSpeed ? speed : null;
}
