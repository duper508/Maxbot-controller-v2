/**
 * Rate limiting for API routes
 * Prevents abuse and ensures fair usage
 */

import rateLimit from 'express-rate-limit';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * In-memory store for rate limiting
 * In production, use Redis or similar
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Get IP address from request
 */
function getIpAddress(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded?.[0];
  return ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Rate limit configuration
 */
const defaultLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  keyGenerator: (req: NextApiRequest) => getIpAddress(req),
};

/**
 * Apply rate limiting to a request
 * Returns true if request is allowed, false if rate limited
 */
export function applyRateLimit(
  req: NextApiRequest,
  windowMs: number = 60 * 1000,
  maxRequests: number = 60
): boolean {
  const key = getIpAddress(req);
  const now = Date.now();

  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    // New window or expired
    requestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  windowMs: number = 60 * 1000,
  maxRequests: number = 60
): Promise<void> {
  if (!applyRateLimit(req, windowMs, maxRequests)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    });
  }

  return handler(req, res);
}

/**
 * Parse rate limit config from environment variables
 */
function getRateLimitConfig(
  envPrefix: string,
  defaultRequests: number,
  defaultWindowMs: number = 60 * 1000
) {
  return {
    windowMs: parseInt(process.env[`${envPrefix}_WINDOW_MS`] || String(defaultWindowMs), 10),
    maxRequests: parseInt(process.env[`${envPrefix}_MAX_REQUESTS`] || String(defaultRequests), 10),
  };
}

/**
 * Stricter rate limit for execute command
 * Env: RATE_LIMIT_EXECUTE_WINDOW_MS (default: 60000), RATE_LIMIT_EXECUTE_MAX_REQUESTS (default: 10)
 */
export const EXECUTE_LIMIT = getRateLimitConfig('RATE_LIMIT_EXECUTE', 10);

/**
 * Standard rate limit for other routes
 * Env: RATE_LIMIT_STANDARD_WINDOW_MS (default: 60000), RATE_LIMIT_STANDARD_MAX_REQUESTS (default: 60)
 */
export const STANDARD_LIMIT = getRateLimitConfig('RATE_LIMIT_STANDARD', 60);

/**
 * Loose rate limit for read-only routes
 * Env: RATE_LIMIT_LOOSE_WINDOW_MS (default: 60000), RATE_LIMIT_LOOSE_MAX_REQUESTS (default: 120)
 */
export const LOOSE_LIMIT = getRateLimitConfig('RATE_LIMIT_LOOSE', 120);
