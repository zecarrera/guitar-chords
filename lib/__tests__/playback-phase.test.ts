import { describe, expect, it } from "vitest";

import { getPhaseWhenLayoutReady } from "@/lib/playback-phase";

describe("getPhaseWhenLayoutReady", () => {
  it("moves straight from preparing to scrolling once layout is ready", () => {
    expect(getPhaseWhenLayoutReady("preparing", true)).toBe("scrolling");
  });

  it("keeps preparing until layout is ready", () => {
    expect(getPhaseWhenLayoutReady("preparing", false)).toBe("preparing");
  });

  it("does not change idle or scrolling phases", () => {
    expect(getPhaseWhenLayoutReady("idle", true)).toBe("idle");
    expect(getPhaseWhenLayoutReady("scrolling", true)).toBe("scrolling");
  });
});
