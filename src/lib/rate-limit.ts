import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
  error?: string;
};

type RateLimitEntry = { count: number; resetAt: number };

type RateLimitGlobal = typeof globalThis & {
  __rateLimitMap?: Map<string, RateLimitEntry>;
};

// Persist across Next.js dev hot-reloads; avoid background timers in serverless.
const rateLimitMap: Map<string, RateLimitEntry> =
  (globalThis as RateLimitGlobal).__rateLimitMap ?? new Map();
(globalThis as RateLimitGlobal).__rateLimitMap = rateLimitMap;

function pruneExpiredMemory(now: number) {
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) rateLimitMap.delete(key);
  }
}

function checkRateLimitMemory(
  key: string,
  { windowMs, maxRequests }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  pruneExpiredMemory(now);
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

async function checkRateLimitDb(
  key: string,
  { windowMs, maxRequests }: RateLimitOptions
): Promise<RateLimitResult> {
  const nowMs = Date.now();
  const resetAt = new Date(nowMs + windowMs);

  try {
    return await prisma.$transaction(
      async (tx) => {
        const existing = await tx.rateLimit.findUnique({
          where: { key },
          select: { count: true, resetAt: true },
        });

        if (!existing || existing.resetAt.getTime() <= nowMs) {
          await tx.rateLimit.upsert({
            where: { key },
            create: { key, count: 1, resetAt },
            update: { count: 1, resetAt },
          });
          return { allowed: true, retryAfterMs: 0 };
        }

        if (existing.count >= maxRequests) {
          return {
            allowed: false,
            retryAfterMs: existing.resetAt.getTime() - nowMs,
          };
        }

        await tx.rateLimit.update({
          where: { key },
          data: { count: { increment: 1 } },
        });

        return { allowed: true, retryAfterMs: 0 };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    logger.error("Rate limit DB check failed", {
      action: "checkRateLimit",
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      allowed: false,
      retryAfterMs: windowMs,
      error: "Rate limiting is not available. Please run database migrations.",
    };
  }
}

function getRateLimitStore(): "db" | "memory" {
  const env = process.env.RATE_LIMIT_STORE?.toLowerCase();
  if (env === "memory" || env === "db") return env;

  // Default: use DB in production (multi-instance), memory in dev.
  return process.env.NODE_ENV === "production" ? "db" : "memory";
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const store = getRateLimitStore();
  if (store === "db") return checkRateLimitDb(key, options);
  return checkRateLimitMemory(key, options);
}

