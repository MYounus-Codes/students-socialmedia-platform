import { NextResponse } from "next/server";
import type { RateLimitResult } from "./index";

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    { success: false, data: null, error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." } },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
