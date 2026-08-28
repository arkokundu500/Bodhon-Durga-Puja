import type { Express } from "express";
import fs from "fs";
import path from "path";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  const publicDir = path.resolve(import.meta.dirname, "../../client/public");

  app.get("/manus-storage/*", async (req, res) => {
    const rawKey = (req.params as Record<string, string>)[0];
    if (!rawKey) {
      res.status(400).send("Missing storage key");
      return;
    }

    // Clean the key (remove leading slashes or directories)
    const fileName = path.basename(rawKey);
    const localFilePath = path.join(publicDir, fileName);

    // 1. Direct file check in client/public
    if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
      return res.sendFile(localFilePath);
    }

    // 2. Check with alternative extensions (.webp <-> .png <-> .jpg)
    const baseNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const possibleExtensions = [".webp", ".png", ".jpg", ".jpeg", ".mp3", ".mp4"];
    for (const ext of possibleExtensions) {
      const candidatePath = path.join(publicDir, `${baseNameWithoutExt}${ext}`);
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        return res.sendFile(candidatePath);
      }
    }

    // 3. Fallback to external Forge API if credentials are provided
    if (ENV.forgeApiUrl && ENV.forgeApiKey) {
      try {
        const forgeUrl = new URL(
          "v1/storage/presign/get",
          ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
        );
        forgeUrl.searchParams.set("path", rawKey);

        const forgeResp = await fetch(forgeUrl, {
          headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
        });

        if (forgeResp.ok) {
          const { url } = (await forgeResp.json()) as { url: string };
          if (url) {
            res.set("Cache-Control", "no-store");
            return res.redirect(307, url);
          }
        }
      } catch (err) {
        console.error("[StorageProxy] External fetch failed:", err);
      }
    }

    // 4. If not found locally or remotely, send 404
    res.status(404).send("Media asset not found");
  });
}
