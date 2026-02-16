/**
 * Secure API route: Poll for bot response
 * 
 * Authentication: Required (NextAuth)
 * Method: GET
 * Rate limit: 120 requests per minute
 * 
 * Query params:
 * - channelId: Discord channel ID to poll
 * - limit: Max messages to fetch (default: 10)
 * - after: Message ID to fetch after (for pagination)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth-middleware';
import { withRateLimit, LOOSE_LIMIT } from '@/lib/rate-limit';
import { pollDiscordForResponse } from '@/lib/discord-server';

interface PollResponseRequest {
  channelId?: string;
  limit?: number;
  after?: string;
}

interface PollResponseResponse {
  success: boolean;
  messages?: any[];
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PollResponseResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get configured channel ID from environment
    const configuredChannelId = process.env.DISCORD_CHANNEL_ID;
    if (!configuredChannelId) {
      console.error('DISCORD_CHANNEL_ID not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    const { channelId, limit = 10, after } = req.query as PollResponseRequest;

    // Validate inputs
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Missing channelId',
      });
    }

    // SECURITY: Only allow polling from the configured channel (prevent IDOR)
    if (String(channelId) !== configuredChannelId) {
      return res.status(403).json({
        success: false,
        error: 'Invalid channel',
      });
    }

    // Validate channel ID format (should be numeric string)
    if (!/^\d+$/.test(String(channelId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid channelId format',
      });
    }

    // Ensure reasonable limit
    const parsedLimit = Math.min(Math.max(1, Number(limit) || 10), 100);

    // Poll Discord
    const result = await pollDiscordForResponse(String(channelId), undefined, {
      limit: parsedLimit,
      after: String(after),
    });

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      messages: result.messages || [],
    });
  } catch (error) {
    console.error('Poll response error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Wrap with auth and rate limiting
 */
export default async function pollResponseHandler(
  req: NextApiRequest,
  res: NextApiResponse<PollResponseResponse>
): Promise<void> {
  return withAuth(req, res, async (req, res) => {
    return withRateLimit(
      req,
      res,
      handler,
      LOOSE_LIMIT.windowMs,
      LOOSE_LIMIT.maxRequests
    );
  });
}
