import fs from "fs";
import path from "path";

const STATS_FILE = path.resolve(import.meta.dirname, "../data/visitor-stats.json");
const BASELINE_COUNT = 14820;

type VisitorData = {
  totalVisitors: number;
  lastUpdated: string;
};

function ensureDataDir(): void {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadStats(): VisitorData {
  ensureDataDir();
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, "utf-8");
      const data = JSON.parse(raw) as VisitorData;
      if (typeof data.totalVisitors === "number" && !isNaN(data.totalVisitors)) {
        return data;
      }
    }
  } catch {
    // Ignore read errors and fallback to baseline
  }

  const initial: VisitorData = {
    totalVisitors: BASELINE_COUNT,
    lastUpdated: new Date().toISOString(),
  };
  saveStats(initial);
  return initial;
}

function saveStats(stats: VisitorData): void {
  ensureDataDir();
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("[VisitorStats] Failed to save stats:", err);
  }
}

let cachedStats: VisitorData = loadStats();

export function getVisitorStats(): { count: number; lastUpdated: string } {
  return {
    count: cachedStats.totalVisitors,
    lastUpdated: cachedStats.lastUpdated,
  };
}

export function incrementVisitorCount(): { count: number; lastUpdated: string } {
  cachedStats.totalVisitors += 1;
  cachedStats.lastUpdated = new Date().toISOString();
  saveStats(cachedStats);
  return {
    count: cachedStats.totalVisitors,
    lastUpdated: cachedStats.lastUpdated,
  };
}
