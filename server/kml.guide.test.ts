import { describe, expect, it } from "vitest";
import { BUS_STOPS, METRO_STATIONS, PANDALS } from "../client/src/lib/bodhon-data";
import { aStarRoute } from "../client/src/lib/a-star";

describe("CSV-backed pandal guide", () => {
  it("keeps the full deduplicated source inventory", () => {
    expect(PANDALS).toHaveLength(317);
    expect(new Set(PANDALS.map((pandal) => pandal.id)).size).toBe(317);
    expect(new Set(PANDALS.map((pandal) => pandal.name.trim().toLowerCase())).size).toBe(317);
    expect(METRO_STATIONS.length).toBeGreaterThan(0);
    expect(BUS_STOPS.length).toBeGreaterThan(0);
    expect(new Set(PANDALS.map((pandal) => pandal.category)).size).toBe(1);
    expect(PANDALS.every((pandal) => Number.isFinite(pandal.lat) && Number.isFinite(pandal.lng))).toBe(true);
  });

  it("returns a shortest-path guide route between current location and a pandal", () => {
    const origin = { id: "user", lat: 22.5726, lng: 88.3639 };
    const destination = { id: PANDALS[0].id, lat: PANDALS[0].lat, lng: PANDALS[0].lng };
    const googleSteps = [
      { id: "step-1", lat: 22.578, lng: 88.363 },
      { id: "step-2", lat: 22.586, lng: 88.360 },
      { id: "step-3", lat: 22.592, lng: 88.358 },
    ];
    const result = aStarRoute(origin, destination, googleSteps);
    expect(result.path[0]?.id).toBe("user");
    expect(result.path.at(-1)?.id).toBe(destination.id);
    expect(result.distanceKm).toBeGreaterThan(0);
  });
});
