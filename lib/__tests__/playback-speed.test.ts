import { describe, expect, it, vi } from "vitest";

import {
  getCurrentPlaybackSpeed,
  getSpeedToPersistOnPlaybackEnd,
} from "@/lib/playback-speed";

describe("getCurrentPlaybackSpeed", () => {
  it("uses each song's own default when there is no manual adjustment", () => {
    expect(getCurrentPlaybackSpeed(18, null)).toBe(18);
    expect(getCurrentPlaybackSpeed(30, null)).toBe(30);
  });

  it("uses the current manual adjustment without changing another song's default", () => {
    expect(getCurrentPlaybackSpeed(18, 21)).toBe(21);
    expect(getCurrentPlaybackSpeed(30, null)).toBe(30);
  });
});

describe("playback-end speed persistence", () => {
  it.each(["manual stop", "natural completion"])(
    "persists only the final selected speed once after %s",
    () => {
      const persistSpeed = vi.fn();
      let wasPlaying = false;
      let isPlaying = false;
      const defaultSpeed = 24;
      let speed = defaultSpeed;

      function updatePersistence() {
        const speedToPersist = getSpeedToPersistOnPlaybackEnd({
          wasPlaying,
          isPlaying,
          speed,
          defaultSpeed,
        });

        if (speedToPersist !== null) {
          persistSpeed(speedToPersist);
        }

        wasPlaying = isPlaying;
      }

      isPlaying = true;
      updatePersistence();
      speed = 26;
      updatePersistence();
      speed = 29;
      updatePersistence();
      expect(persistSpeed).not.toHaveBeenCalled();

      isPlaying = false;
      updatePersistence();
      updatePersistence();

      expect(persistSpeed).toHaveBeenCalledTimes(1);
      expect(persistSpeed).toHaveBeenCalledWith(29);
    },
  );

  it("does not persist when playback ends at the default speed", () => {
    expect(
      getSpeedToPersistOnPlaybackEnd({
        wasPlaying: true,
        isPlaying: false,
        speed: 24,
        defaultSpeed: 24,
      }),
    ).toBeNull();
  });
});
