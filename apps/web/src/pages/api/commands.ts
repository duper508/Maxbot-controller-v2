/**
 * Secure API route: List available commands
 * 
 * Authentication: Required (NextAuth)
 * Method: GET
 * Rate limit: 120 requests per minute
 * 
 * Query params:
 * - search: Optional search query
 * - category: Optional category filter
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { commandManager, type Command } from '@repo/commands';
import { withAuth } from '@/lib/auth-middleware';
import { withRateLimit, LOOSE_LIMIT } from '@/lib/rate-limit';

interface CommandsResponse {
  success: boolean;
  commands?: Command[];
  total?: number;
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommandsResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { search, category } = req.query;

    let commands = commandManager.getAllCommands();

    // Apply search filter
    if (search && typeof search === 'string') {
      commands = commandManager.searchCommands(search);
    }

    // Apply category filter
    if (category && typeof category === 'string') {
      commands = commands.filter((cmd) => cmd.category === category);
    }

    return res.status(200).json({
      success: true,
      commands,
      total: commands.length,
    });
  } catch (error) {
    console.error('Commands list error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Wrap with auth and rate limiting
 */
export default async function commandsHandler(
  req: NextApiRequest,
  res: NextApiResponse<CommandsResponse>
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
