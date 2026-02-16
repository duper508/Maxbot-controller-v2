/**
 * Secure API route: Execute command via Discord webhook
 * 
 * Authentication: Required (NextAuth)
 * Method: POST
 * Rate limit: 10 requests per minute
 * 
 * Payload:
 * {
 *   "commandId": "sys_status",
 *   "parameters": { ... }
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { commandManager } from '@repo/commands';
import { withAuth, withAuthAndCsrf } from '@/lib/auth-middleware';
import { withRateLimit, EXECUTE_LIMIT } from '@/lib/rate-limit';
import { sendCommandToDiscord } from '@/lib/discord-server';

interface ExecuteCommandRequest {
  commandId: string;
  parameters: Record<string, unknown>;
}

interface ExecuteCommandResponse {
  success: boolean;
  requestId?: string;
  message?: string;
  error?: string;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format command embed for Discord
 */
function formatCommandEmbed(
  commandName: string,
  commandId: string,
  parameters: Record<string, unknown>
): any {
  const paramFields = Object.entries(parameters)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      name: key,
      value: String(value).substring(0, 1024),
      inline: true,
    }));

  return {
    embeds: [
      {
        title: `🎮 Command Executed: ${commandName}`,
        description: `Request ID: \`${commandId}\``,
        color: 0x00ff41, // Pip-Boy green
        fields: paramFields.length > 0 ? paramFields : undefined,
        footer: {
          text: new Date().toLocaleString(),
        },
      },
    ],
  };
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecuteCommandResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { commandId, parameters } = req.body as ExecuteCommandRequest;

    // Validate inputs
    if (!commandId) {
      return res.status(400).json({
        success: false,
        error: 'Missing commandId',
      });
    }

    // Get command
    const command = commandManager.getCommand(commandId);
    if (!command) {
      return res.status(404).json({
        success: false,
        error: 'Command not found',
      });
    }

    // Validate parameters
    const validation = commandManager.validateParameters(command, parameters || {});
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join('; '),
      });
    }

    // Check if command is marked as dangerous
    if (command.dangerous) {
      // In production, you might want to require additional confirmation
      // or log this action for audit purposes
      console.warn(`Dangerous command executed: ${commandId} by user ${(req as any).session?.user?.email}`);
    }

    // Generate request ID
    const requestId = generateRequestId();

    // Format embed
    const payload = formatCommandEmbed(command.name, requestId, parameters || {});

    // Send to Discord
    const result = await sendCommandToDiscord(payload);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send command to Discord',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Command sent successfully',
      requestId,
    });
  } catch (error) {
    console.error('Execute command error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Wrap with auth, CSRF protection, and rate limiting
 */
export default async function executeCommandHandler(
  req: NextApiRequest,
  res: NextApiResponse<ExecuteCommandResponse>
): Promise<void> {
  return withAuthAndCsrf(req, res, async (req, res) => {
    return withRateLimit(
      req,
      res,
      handler,
      EXECUTE_LIMIT.windowMs,
      EXECUTE_LIMIT.maxRequests
    );
  });
}
