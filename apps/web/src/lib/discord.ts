/**
 * Discord integration utilities
 */

import { DISCORD } from '@repo/config';

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

export async function sendToDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(DISCORD.WEBHOOK_TIMEOUT_MS),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send webhook:', error);
    return false;
  }
}

export function formatCommandEmbed(
  commandName: string,
  commandId: string,
  parameters: Record<string, unknown>
): DiscordWebhookPayload {
  const paramFields = Object.entries(parameters).map(([key, value]) => ({
    name: key,
    value: String(value),
    inline: true,
  }));

  return {
    embeds: [
      {
        title: `🎮 Command Executed: ${commandName}`,
        description: `Command ID: \`${commandId}\``,
        color: 0x00ff41,
        fields: paramFields.length > 0 ? paramFields : undefined,
        footer: {
          text: new Date().toLocaleString(),
        },
      },
    ],
  };
}

export function formatResponseEmbed(
  commandName: string,
  status: 'success' | 'error' | 'timeout',
  output?: string,
  error?: string
): DiscordWebhookPayload {
  const colorMap = {
    success: 0x00ff41,
    error: 0xff0000,
    timeout: 0xffaa00,
  };

  return {
    embeds: [
      {
        title: `Response: ${commandName}`,
        description: status.toUpperCase(),
        color: colorMap[status],
        fields: [
          {
            name: 'Output',
            value: output ? output.substring(0, 1024) : 'No output',
            inline: false,
          },
          ...(error
            ? [
                {
                  name: 'Error',
                  value: error.substring(0, 1024),
                  inline: false,
                },
              ]
            : []),
        ],
        footer: {
          text: new Date().toLocaleString(),
        },
      },
    ],
  };
}

export async function fetchDiscordMessages(
  botToken: string,
  channelId: string,
  options?: { limit?: number; after?: string }
): Promise<Array<{ id: string; content: string; author: { username: string } }>> {
  try {
    const url = new URL(`${DISCORD.DISCORD_API_BASE}/channels/${channelId}/messages`);
    if (options?.limit) url.searchParams.set('limit', String(options.limit));
    if (options?.after) url.searchParams.set('after', options.after);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      signal: AbortSignal.timeout(DISCORD.WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
}
