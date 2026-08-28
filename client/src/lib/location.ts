export type Coordinates = { lat: number; lng: number };

export type LocationWatcher = {
  watchPosition: (success: (position: { coords: { latitude: number; longitude: number } }) => void, error?: () => void, options?: PositionOptions) => number;
  clearWatch: (watchId: number) => void;
};

export function startLocationTracking(
  geolocation: LocationWatcher | undefined,
  onUpdate: (position: Coordinates) => void,
  onError: () => void,
) {
  if (!geolocation) return null;
  const watchId = geolocation.watchPosition(
    ({ coords }) => onUpdate({ lat: coords.latitude, lng: coords.longitude }),
    onError,
    { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
  );
  return { watchId, stop: () => geolocation.clearWatch(watchId) };
}
