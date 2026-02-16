/**
 * Secure API route: Get execution history
 * 
 * Authentication: Required (NextAuth)
 * Method: GET, DELETE
 * Rate limit: 120 requests per minute
 * 
 * GET Query params:
 * - limit: Max entries to return (default: 50, max: 100)
 * 
 * DELETE Query params:
 * - id: History entry ID to delete
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { STATUS, type CommandHistoryEntry } from '@repo/config';
import { withAuth, withAuthAndCsrf } from '@/lib/auth-middleware';
import { withRateLimit, LOOSE_LIMIT } from '@/lib/rate-limit';
import {
  getExecutionHistory,
  deleteHistoryEntry,
  saveExecutionHistory,
  getHistoryStats,
} from '@/lib/history';

interface HistoryResponse {
  success: boolean;
  history?: CommandHistoryEntry[];
  stats?: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    pendingExecutions: number;
  };
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryResponse>
): Promise<void> {
  const session = (req as any).session;
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return res.status(401).json({ success: false, error: 'User email not found in session' });
  }

  // GET - Retrieve history
  if (req.method === 'GET') {
    try {
      const { limit = '50' } = req.query;

      const parsedLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
      const history = getExecutionHistory(userEmail, parsedLimit);
      const stats = getHistoryStats(userEmail);

      return res.status(200).json({
        success: true,
        history,
        stats,
      });
    } catch (error) {
      console.error('Get history error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // DELETE - Remove history entry
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing history entry ID',
        });
      }

      const deleted = deleteHistoryEntry(userEmail, id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'History entry not found',
        });
      }

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error('Delete history error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

/**
 * Wrap with auth, CSRF protection (for DELETE), and rate limiting
 */
export default async function historyHandler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryResponse>
): Promise<void> {
  // Use CSRF protection for state-changing DELETE method
  const middleware = req.method === 'DELETE' ? withAuthAndCsrf : withAuth;
  
  return middleware(req, res, async (req, res) => {
    return withRateLimit(
      req,
      res,
      handler,
      LOOSE_LIMIT.windowMs,
      LOOSE_LIMIT.maxRequests
    );
  });
}
