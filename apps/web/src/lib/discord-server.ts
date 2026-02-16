/**
 * Server-side Discord integration
 * All sensitive operations use environment variables
 * NEVER expose bot token or webhook URL to client
 */

import { DISCORD } from '@repo/config';

/**
 * Validate required environment variables at startup
 */
function validateEnvironmentVariables(): void {
  const requiredVars = [
    'DISCORD_WEBHOOK_URL',
    'DISCORD_BOT_TOKEN',
    'DISCORD_CHANNEL_ID',
    'GITHUB_PAT',
    'NEXTAUTH_SECRET',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`[CRITICAL] ${message}`);
    throw new Error(message);
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnvironmentVariables();
    console.log('[Discord Server] All required environment variables configured');
  } catch (error) {
    console.error('[Discord Server] Startup validation failed:', error);
    // In production, you might want to exit the process here
    // process.exit(1);
  }
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: {
      text: string;
    };
  }>;
}

/**
 * Send command to Discord webhook (server-side only)
 */
export async function sendCommandToDiscord(
  payload: DiscordWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      success: false,
      error: 'Discord webhook not configured',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(DISCORD.WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Discord webhook error:', response.status, text);
      return {
        success: false,
        error: `Discord error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Poll Discord for bot response (server-side only, uses bot token)
 */
export async function pollDiscordForResponse(
  channelId: string,
  messageId?: string,
  options?: { limit?: number; after?: string }
): Promise<{ messages: any[]; error?: string }> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return {
      messages: [],
      error: 'Bot token not configured',
    };
  }

  try {
    const url = new URL(
      `https://discord.com/api/v10/channels/${channelId}/messages`
    );
    if (options?.limit) url.searchParams.set('limit', String(options.limit));
    if (options?.after) url.searchParams.set('after', options.after);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(DISCORD.WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error('Discord API error:', response.status);
      return {
        messages: [],
        error: `Discord API error: ${response.status}`,
      };
    }

    const messages = await response.json();
    return { messages };
  } catch (error) {
    console.error('Failed to poll Discord:', error);
    return {
      messages: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get Discord channel info (server-side only)
 */
export async function getDiscordChannelInfo(channelId: string): Promise<{
  id?: string;
  name?: string;
  error?: string;
}> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return {
      error: 'Bot token not configured',
    };
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(DISCORD.WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        error: `Discord API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
    };
  } catch (error) {
    console.error('Failed to get channel info:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test Discord webhook connection
 */
export async function testDiscordWebhook(): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '🟢 MaxBot Controller connection test successful',
      }),
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Test Discord bot token
 */
export async function testDiscordBot(): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return false;
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch {
    return false;
  }
}
