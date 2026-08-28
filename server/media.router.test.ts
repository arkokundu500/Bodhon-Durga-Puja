import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("media router", () => {
  it("lists persisted media metadata for public radio clients", async () => {
    const result = await appRouter.createCaller(createPublicContext()).media.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires admin authentication before accepting uploads", async () => {
    await expect(
      appRouter.createCaller(createPublicContext()).media.upload({
        kind: "audio",
        slug: "test-audio",
        title: "Test audio",
        subtitle: "Test subtitle",
        filename: "test.mp3",
        mimeType: "audio/mpeg",
        base64: "data:audio/mpeg;base64,AA==",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
