/**
 * Configuration and constants for MaxBot Controller
 */

export const THEME = {
  // Fallout Pip-Boy aesthetic
  PRIMARY_GREEN: '#00FF41',
  DARK_BG: '#001A00',
  BORDER_COLOR: '#003300',
  TEXT_COLOR: '#00FF41',
  ACCENT_GREEN: '#00DD00',
  MUTED_TEXT: '#00AA00',
  ERROR_RED: '#FF0000',
  SUCCESS_GREEN: '#00FF41',
} as const;

export const TYPOGRAPHY = {
  FONT_FAMILY: "'Courier New', 'OCR-A', monospace",
  FONT_SIZE_SMALL: '12px',
  FONT_SIZE_BASE: '14px',
  FONT_SIZE_LARGE: '16px',
  FONT_SIZE_TITLE: '20px',
  LETTER_SPACING: '0.05em',
  LINE_HEIGHT: '1.6',
} as const;

export const SPACING = {
  XS: '4px',
  SM: '8px',
  MD: '16px',
  LG: '24px',
  XL: '32px',
  XXL: '48px',
} as const;

export const ANIMATION = {
  DURATION_FAST: '150ms',
  DURATION_NORMAL: '300ms',
  DURATION_SLOW: '500ms',
  EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

export const DISCORD = {
  WEBHOOK_TIMEOUT_MS: 5000,
  POLL_INTERVAL_MS: 2000,
  MAX_MESSAGE_LENGTH: 2000,
  COMMAND_PREFIX: '/',
} as const;

export const STORAGE = {
  HISTORY_MAX_ITEMS: 100,
  FAVORITES_KEY: 'clawdbot:favorites',
  HISTORY_KEY: 'clawdbot:history',
  SETTINGS_KEY: 'clawdbot:settings',
} as const;

export const API_ENDPOINTS = {
  DISCORD_WEBHOOK_BASE: 'https://discordapp.com/api/webhooks',
  DISCORD_API_BASE: 'https://discord.com/api/v10',
} as const;

export const STATUS = {
  PENDING: 'pending',
  EXECUTING: 'executing',
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout',
} as const;

export type CommandStatus = (typeof STATUS)[keyof typeof STATUS];

export interface ExecutionResult {
  id: string;
  commandId: string;
  commandName: string;
  status: CommandStatus;
  output?: string;
  error?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface CommandHistoryEntry extends ExecutionResult {
  timestamp: number;
}
