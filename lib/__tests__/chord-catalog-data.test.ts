import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: new Proxy({}, {
    get() { throw new Error("Catalog loading must not access Prisma"); },
  }),
}));

import { getChordCatalog } from "@/lib/data";
import { chordCatalog } from "@/lib/chord-library";

describe("server catalog loading", () => {
  it.each(["true", "false"])("is independent of ENABLE_DATABASE_READS=%s", (enabled) => {
    vi.stubEnv("ENABLE_DATABASE_READS", enabled);
    try {
      expect(getChordCatalog()).toBe(chordCatalog);
      expect(getChordCatalog()).toHaveLength(828);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
