import { describe, expect, it } from "vitest";
import { getMapMarkerLayerState } from "./map-marker-state";

describe("map marker visibility", () => {
  it("uses exactly one green live-location owner when the SDK map is ready", () => {
    const state = getMapMarkerLayerState(true, true);

    expect(state.sdkUser).toBe(true);
    expect(state.fallbackUser).toBe(false);
    expect(Number(state.sdkUser) + Number(state.fallbackUser)).toBe(1);
  });

  it("uses exactly one green live-location owner while the fallback is active", () => {
    const state = getMapMarkerLayerState(false, true);

    expect(state.sdkUser).toBe(false);
    expect(state.fallbackUser).toBe(true);
    expect(Number(state.sdkUser) + Number(state.fallbackUser)).toBe(1);
  });

  it("keeps the red selected-pandal marker independent of live location", () => {
    const withSdkAndUser = getMapMarkerLayerState(true, true);
    const withFallbackAndUser = getMapMarkerLayerState(false, true);
    const withSdkWithoutUser = getMapMarkerLayerState(true, false);

    expect(withSdkAndUser.sdkSelected).toBe(true);
    expect(withSdkAndUser.sdkUser).toBe(true);
    expect(withFallbackAndUser.fallbackSelected).toBe(true);
    expect(withFallbackAndUser.fallbackUser).toBe(true);
    expect(withSdkWithoutUser.sdkSelected).toBe(true);
    expect(withSdkWithoutUser.sdkUser).toBe(false);
  });

  it("renders no green marker without a user position", () => {
    const state = getMapMarkerLayerState(true, false);

    expect(state.sdkUser).toBe(false);
    expect(state.fallbackUser).toBe(false);
  });
});
