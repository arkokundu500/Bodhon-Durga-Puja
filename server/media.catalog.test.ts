import { describe, expect, it } from "vitest";
import { TRACKS } from "../client/src/lib/bodhon-data";

describe("Bodhon Radio media catalog", () => {
  it("contains exactly four managed-storage track and cover pairs", () => {
    expect(TRACKS).toHaveLength(4);
    expect(TRACKS.map((track) => track.id)).toEqual([
      "dhak-baja-kashor-baja",
      "dhaker-taley",
      "dugga-ma",
      "dugga-elo",
    ]);

    TRACKS.forEach((track) => {
      expect(track.cover).toMatch(/^\/.*\.jpg$/);
      expect(track.src).toMatch(/^\/.*\.mp3$/);
      expect(track.title.length).toBeGreaterThan(0);
      expect(track.subtitle.length).toBeGreaterThan(0);
    });
  });
});
