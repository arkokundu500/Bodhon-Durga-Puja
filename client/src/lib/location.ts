export type Coordinates = { lat: number; lng: number };

export type LocationWatcher = {
  getCurrentPosition: (success: (position: GeolocationPosition) => void, error?: (error: GeolocationPositionError) => void, options?: PositionOptions) => void;
  watchPosition: (success: (position: GeolocationPosition) => void, error?: (error: GeolocationPositionError) => void, options?: PositionOptions) => number;
  clearWatch: (watchId: number) => void;
};

function distanceMeters(a: Coordinates, b: Coordinates): number {
  const radius = 6371000; // meters
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const val = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
}

export function getCurrentCoordinates(
  geolocation: Geolocation | LocationWatcher | undefined,
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(new Error("Geolocation not supported by browser."));
      return;
    }
    geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      options
    );
  });
}

export function startLocationTracking(
  geolocation: Geolocation | LocationWatcher | undefined,
  onUpdate: (position: Coordinates) => void,
  onError: (error?: Error | GeolocationPositionError) => void,
  minThresholdMeters = 20
) {
  if (!geolocation) {
    onError(new Error("Geolocation not available"));
    return null;
  }

  let lastReportedPosition: Coordinates | null = null;

  // First fetch current position immediately
  geolocation.getCurrentPosition(
    ({ coords }) => {
      const pos = { lat: coords.latitude, lng: coords.longitude };
      lastReportedPosition = pos;
      onUpdate(pos);
    },
    (err) => {
      console.warn("[Location] Initial position lookup failed", err);
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 }
  );

  // Then watch for significant movement without micro-jitter
  const watchId = geolocation.watchPosition(
    ({ coords }) => {
      const currentPos = { lat: coords.latitude, lng: coords.longitude };
      if (!lastReportedPosition || distanceMeters(lastReportedPosition, currentPos) >= minThresholdMeters) {
        lastReportedPosition = currentPos;
        onUpdate(currentPos);
      }
    },
    onError,
    { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 }
  );

  return { watchId, stop: () => geolocation.clearWatch(watchId) };
}
