import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./index";

describe("rate limiting", () => {
  it("allows requests up to the development limit and blocks the next one", async () => {
    const key = `test:${crypto.randomUUID()}`;
    const config = { windowSeconds: 60, maxRequests: 2 };
    expect((await checkRateLimit(key, config)).allowed).toBe(true);
    expect((await checkRateLimit(key, config)).allowed).toBe(true);
    expect((await checkRateLimit(key, config)).allowed).toBe(false);
  });
});
