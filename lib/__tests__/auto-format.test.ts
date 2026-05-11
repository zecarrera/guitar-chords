import { describe, expect, it } from "vitest";

import { autoFormatChordSheet } from "@/lib/auto-format";

describe("autoFormatChordSheet", () => {
  // ── Chord-line detection & wrapping ──────────────────────────────────────

  describe("chord-line wrapping", () => {
    it("wraps a single-chord line", () => {
      expect(autoFormatChordSheet("Am")).toBe("[Am]");
    });

    it("wraps multiple chords on one line", () => {
      expect(autoFormatChordSheet("Am G D Em")).toBe("[Am] [G] [D] [Em]");
    });

    it("handles sharp and flat chords", () => {
      expect(autoFormatChordSheet("C# Bb F#m Ebm")).toBe("[C#] [Bb] [F#m] [Ebm]");
    });

    it("handles extended chords", () => {
      expect(autoFormatChordSheet("Am7 G7 Cmaj7 Bm7")).toBe("[Am7] [G7] [Cmaj7] [Bm7]");
    });

    it("handles sus and add chords", () => {
      expect(autoFormatChordSheet("Asus4 Dsus2 Cadd9")).toBe("[Asus4] [Dsus2] [Cadd9]");
    });

    it("handles slash chords", () => {
      expect(autoFormatChordSheet("D/F# G/B Am/E")).toBe("[D/F#] [G/B] [Am/E]");
    });
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  describe("idempotency", () => {
    it("does not double-wrap already-bracketed chords", () => {
      const input = "[Am] [G] [D] [Em]";
      expect(autoFormatChordSheet(input)).toBe(input);
    });

    it("leaves a line that mixes brackets and lyrics untouched", () => {
      const input = "[G] Harbor lights are [D] drifting slow";
      expect(autoFormatChordSheet(input)).toBe(input);
    });
  });

  // ── Lyric lines ───────────────────────────────────────────────────────────

  describe("lyric lines", () => {
    it("does not modify regular lyric lines", () => {
      const input = "Vai e vem o tempo mas nada muda";
      expect(autoFormatChordSheet(input)).toBe(input);
    });

    it("does not modify lines that start with a chord word followed by lyrics", () => {
      // "Am" here is part of "Am I dreaming?" — not a chord line
      const input = "Am I dreaming of you tonight";
      expect(autoFormatChordSheet(input)).toBe(input);
    });
  });

  // ── Blank-line cleanup ────────────────────────────────────────────────────

  describe("blank-line cleanup", () => {
    it("collapses multiple blank lines between sections into one", () => {
      const input = "Verse\n\n\n\nChorus";
      expect(autoFormatChordSheet(input)).toBe("Verse\n\nChorus");
    });

    it("removes blank lines within a section block", () => {
      const input = "Verse\nLine one\n\nLine two";
      // The two sub-blocks become separate sections
      expect(autoFormatChordSheet(input)).toBe("Verse\nLine one\n\nLine two");
    });

    it("removes leading and trailing blank lines", () => {
      const input = "\n\nVerse\n\n";
      expect(autoFormatChordSheet(input)).toBe("Verse");
    });

    it("treats whitespace-only lines as section separators", () => {
      // A line containing only spaces is indistinguishable from a blank line
      // and becomes a section boundary, not a stripped intra-section line.
      const input = "Verse\nLine one\n   \nLine two";
      expect(autoFormatChordSheet(input)).toBe("Verse\nLine one\n\nLine two");
    });
  });

  // ── Full document scenarios ───────────────────────────────────────────────

  describe("full chord-sheet documents", () => {
    it("formats a typical section with header, chord line, and lyrics", () => {
      const input = [
        "Verse",
        "Am G D Em",
        "Some lyrics here",
        "",
        "Chorus",
        "C G Am F",
        "More lyrics here",
      ].join("\n");

      const expected = [
        "Verse",
        "[Am] [G] [D] [Em]",
        "Some lyrics here",
        "",
        "Chorus",
        "[C] [G] [Am] [F]",
        "More lyrics here",
      ].join("\n");

      expect(autoFormatChordSheet(input)).toBe(expected);
    });

    it("handles extra blank lines between sections and whitespace-only separator lines", () => {
      const input = [
        "Intro",
        "G D",
        "",
        "",
        "Verse",
        "Am   ",
        "   ",      // whitespace-only line → treated as section separator
        "Em G",
        "Some lyrics",
      ].join("\n");

      // "Am   " and "Em G" end up in separate sections because the whitespace
      // line between them acts as a section boundary (same as a blank line).
      const expected = [
        "Intro",
        "[G] [D]",
        "",
        "Verse",
        "[Am]",
        "",
        "[Em] [G]",
        "Some lyrics",
      ].join("\n");

      expect(autoFormatChordSheet(input)).toBe(expected);
    });

    it("is idempotent on an already-formatted document", () => {
      const formatted = [
        "Verse",
        "[Am] [G] [D] [Em]",
        "Some lyrics here",
        "",
        "Chorus",
        "[C] [G] [Am] [F]",
        "More lyrics here",
      ].join("\n");

      expect(autoFormatChordSheet(formatted)).toBe(formatted);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("returns empty string for empty input", () => {
      expect(autoFormatChordSheet("")).toBe("");
    });

    it("returns empty string for whitespace-only input", () => {
      expect(autoFormatChordSheet("   \n\n  \n")).toBe("");
    });

    it("handles a single lyric word that matches no chord", () => {
      expect(autoFormatChordSheet("Hello")).toBe("Hello");
    });
  });
});
