interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const developmentCounters = new Map<string, { count: number; resetAt: number }>();

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
  return checkDevelopment(key, config);
}

export function getRequestIdentifier(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}