interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const developmentCounters = new Map<string, { count: number; resetAt: number }>();

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function checkUpstash(key: string, config: RateLimitConfig, upstash: { url: string; token: string }): Promise<RateLimitResult> {
  const response = await fetch(`${upstash.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${upstash.token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", key], ["EXPIRE", key, config.windowSeconds], ["TTL", key]]),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Rate-limit service unavailable.");
  const results = (await response.json()) as Array<{ result: number }>;
  const count = Number(results[0]?.result ?? config.maxRequests + 1);
  const ttl = Math.max(1, Number(results[2]?.result ?? config.windowSeconds));
  return { allowed: count <= config.maxRequests, retryAfterSeconds: ttl };
}

function checkDevelopment(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const current = developmentCounters.get(key);
  if (!current || current.resetAt <= now) {
    developmentCounters.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: config.windowSeconds };
  }
  current.count += 1;
  return { allowed: current.count <= config.maxRequests, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const upstash = getUpstashConfig();
  if (upstash) return checkUpstash(key, config, upstash);
  if (process.env.NODE_ENV === "production") throw new Error("Production rate limiting is not configured.");
  return checkDevelopment(key, config);
}

export function getRequestIdentifier(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
