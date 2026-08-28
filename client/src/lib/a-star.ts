export type RoutePoint = { id: string; lat: number; lng: number };

function distanceKm(a: RoutePoint, b: RoutePoint) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

/** Run A* over an ordered Google Directions step graph. The graph edges are only consecutive route endpoints returned by Google; no road links are fabricated from straight-line proximity. */
export function aStarRoute(origin: RoutePoint, destination: RoutePoint, orderedGoogleSteps: RoutePoint[]) {
  const nodes = [origin, ...orderedGoogleSteps.filter((point) => point.id !== origin.id && point.id !== destination.id), destination];
  const open = new Set([0]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map(nodes.map((_, index) => [index, Number.POSITIVE_INFINITY]));
  const fScore = new Map(nodes.map((_, index) => [index, Number.POSITIVE_INFINITY]));
  gScore.set(0, 0);
  fScore.set(0, distanceKm(origin, destination));

  while (open.size) {
    const current = Array.from(open).sort((a, b) => (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity))[0];
    if (current === nodes.length - 1) {
      const path: RoutePoint[] = [];
      let cursor: number | undefined = current;
      while (cursor !== undefined) {
        path.unshift(nodes[cursor]);
        cursor = cameFrom.get(cursor);
      }
      return { path, distanceKm: gScore.get(current) ?? 0 };
    }
    open.delete(current);
    for (const next of [current - 1, current + 1]) {
      if (next < 0 || next >= nodes.length) continue;
      const tentative = (gScore.get(current) ?? Infinity) + distanceKm(nodes[current], nodes[next]);
      if (tentative < (gScore.get(next) ?? Infinity)) {
        cameFrom.set(next, current);
        gScore.set(next, tentative);
        fScore.set(next, tentative + distanceKm(nodes[next], destination));
        open.add(next);
      }
    }
  }
  return { path: [origin, destination], distanceKm: distanceKm(origin, destination) };
}
