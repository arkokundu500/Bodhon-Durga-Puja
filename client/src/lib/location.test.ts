import { describe, expect, it, vi } from "vitest";
import { startLocationTracking } from "./location";

describe("startLocationTracking", () => {
  it("forwards live coordinates and stops the browser watch", () => {
    let success: ((position: { coords: { latitude: number; longitude: number } }) => void) | undefined;
    const clearWatch = vi.fn();
    const geolocation = {
      watchPosition: vi.fn((callback: (position: { coords: { latitude: number; longitude: number } }) => void) => {
        success = callback;
        return 42;
      }),
      clearWatch,
    };
    const onUpdate = vi.fn();

    const tracking = startLocationTracking(geolocation, onUpdate, vi.fn());
    success?.({ coords: { latitude: 22.5726, longitude: 88.3639 } });

    expect(onUpdate).toHaveBeenCalledWith({ lat: 22.5726, lng: 88.3639 });
    expect(geolocation.watchPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), expect.objectContaining({ enableHighAccuracy: true }));

    tracking?.stop();
    expect(clearWatch).toHaveBeenCalledWith(42);
  });
});
