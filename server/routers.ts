import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createMediaAsset, listMediaAssets } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { makeRequest, type DirectionsResult } from "./_core/map";
import metroStations from "../client/src/data/metro-stations.json";
import busStops from "../client/src/data/bus-stops.json";
import { getVisitorStats, incrementVisitorCount } from "./visitor";

type TransitPoint = { id: string; name: string; nameBn?: string; lat: number; lng: number };
const METRO_STATIONS = metroStations as TransitPoint[];
const BUS_STOPS = busStops as TransitPoint[];

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const latitude = ((aLat + bLat) / 2) * (Math.PI / 180);
  return Math.hypot((bLat - aLat) * 111.32, (bLng - aLng) * 111.32 * Math.cos(latitude));
}

function nearestTransitPoint(lat: number, lng: number, points: TransitPoint[]) {
  return points.reduce<TransitPoint | null>((nearest, point) => !nearest || distanceKm(lat, lng, point.lat, point.lng) < distanceKm(lat, lng, nearest.lat, nearest.lng) ? point : nearest, null);
}

const mediaUploadInput = z.object({
  kind: z.enum(["audio", "cover"]),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(255),
  subtitle: z.string().min(1).max(2000),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  base64: z.string().min(1),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  guide: router({
    route: publicProcedure.input(z.object({ originLat: z.number(), originLng: z.number(), destinationLat: z.number(), destinationLng: z.number() })).query(async ({ input }) => {
      const destination = `${input.destinationLat},${input.destinationLng}`;
      const origin = `${input.originLat},${input.originLng}`;
      const metroPoint = nearestTransitPoint(input.destinationLat, input.destinationLng, METRO_STATIONS);
      const busPoint = nearestTransitPoint(input.destinationLat, input.destinationLng, BUS_STOPS);

      let directions: DirectionsResult | null = null;
      let metroWalk: DirectionsResult | null = null;
      let busWalk: DirectionsResult | null = null;

      try {
        [directions, metroWalk, busWalk] = await Promise.all([
          makeRequest<DirectionsResult>("/maps/api/directions/json", { origin, destination, mode: "transit", alternatives: false }).catch(() => null),
          metroPoint ? makeRequest<DirectionsResult>("/maps/api/directions/json", { origin: `${metroPoint.lat},${metroPoint.lng}`, destination, mode: "walking", alternatives: false }).catch(() => null) : Promise.resolve(null),
          busPoint ? makeRequest<DirectionsResult>("/maps/api/directions/json", { origin: `${busPoint.lat},${busPoint.lng}`, destination, mode: "walking", alternatives: false }).catch(() => null) : Promise.resolve(null),
        ]);
      } catch (err) {
        console.warn("[guide.route] Live Google API request failed, using local transit calculation:", err);
      }

      const transitResult = (point: TransitPoint | null, walking: DirectionsResult | null) => {
        if (!point) return null;
        const leg = walking?.routes?.[0]?.legs?.[0];
        return { name: point.name, address: point.nameBn ?? point.name, lat: point.lat, lng: point.lng, distance: leg?.distance?.text ?? `${distanceKm(point.lat, point.lng, input.destinationLat, input.destinationLng).toFixed(2)} km straight-line`, duration: leg?.duration?.text ?? "Walking time unavailable" };
      };
      const metro = transitResult(metroPoint, metroWalk);
      const bus = transitResult(busPoint, busWalk);
      const leg = directions?.routes?.[0]?.legs?.[0];
      return { status: directions?.status ?? "OK", route: leg ? { distance: leg.distance.text, duration: leg.duration.text, startAddress: leg.start_address, endAddress: leg.end_address, steps: leg.steps.map((step, index) => ({ id: `step-${index + 1}`, lat: step.end_location.lat, lng: step.end_location.lng })) } : null, metro, bus };
    }),
  }),
  media: router({
    list: publicProcedure.query(() => listMediaAssets()),
    upload: adminProcedure.input(mediaUploadInput).mutation(async ({ input }) => {
      const rawBase64 = input.base64.replace(/^data:[^;]+;base64,/, "");
      const data = Buffer.from(rawBase64, "base64");
      if (!data.length) throw new Error("The uploaded file is empty");
      if (data.length > 30 * 1024 * 1024) throw new Error("Media uploads must be 30MB or smaller");
      if (input.kind === "audio" && !input.mimeType.startsWith("audio/")) throw new Error("Audio uploads need an audio MIME type");
      if (input.kind === "cover" && !input.mimeType.startsWith("image/")) throw new Error("Cover uploads need an image MIME type");

      const extension = input.filename.split(".").pop()?.toLowerCase() || "bin";
      const stored = await storagePut(`bodhon-media/${input.kind}/${input.slug}.${extension}`, data, input.mimeType);
      return createMediaAsset({
        kind: input.kind,
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        storageKey: stored.key,
        url: stored.url,
        mimeType: input.mimeType,
      });
    }),
  }),
  visitor: router({
    stats: publicProcedure.query(() => getVisitorStats()),
    recordVisit: publicProcedure.mutation(() => incrementVisitorCount()),
  }),
});

export type AppRouter = typeof appRouter;
