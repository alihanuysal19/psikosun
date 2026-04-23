import { NextRequest } from "next/server";

type Bucket = { ts: number[] };
const buckets = new Map<string, Bucket>();

const SWEEP_MS = 60_000;
let lastSweep = 0;

function sweepExpired(now: number, maxWindow: number) {
  if (now - lastSweep < SWEEP_MS) return;
  lastSweep = now;
  const cutoff = now - maxWindow;
  for (const [key, b] of buckets) {
    const remaining = b.ts.filter((t) => t > cutoff);
    if (remaining.length === 0) buckets.delete(key);
    else b.ts = remaining;
  }
}

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

export interface RateLimitRule {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
  rule?: RateLimitRule;
}

export function checkRateLimit(
  key: string,
  rules: RateLimitRule[],
): RateLimitResult {
  const now = Date.now();
  const maxWindow = Math.max(...rules.map((r) => r.windowMs));
  sweepExpired(now, maxWindow);

  const bucket = buckets.get(key) ?? { ts: [] };
  const cutoff = now - maxWindow;
  bucket.ts = bucket.ts.filter((t) => t > cutoff);

  for (const rule of rules) {
    const cnt = bucket.ts.filter((t) => t > now - rule.windowMs).length;
    if (cnt >= rule.max) {
      const oldest = bucket.ts.filter((t) => t > now - rule.windowMs)[0]!;
      const retryAfterSec = Math.max(
        1,
        Math.ceil((oldest + rule.windowMs - now) / 1000),
      );
      return { allowed: false, retryAfterSec, rule };
    }
  }

  bucket.ts.push(now);
  buckets.set(key, bucket);
  return { allowed: true };
}
