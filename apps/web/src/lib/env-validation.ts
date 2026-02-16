/**
 * Environment variable validation
 * Validates all required environment variables at startup
 * Fails fast if any required env var is missing
 */

/**
 * List of required environment variables
 */
const REQUIRED_ENV_VARS = [
  'DISCORD_WEBHOOK_URL',
  'DISCORD_BOT_TOKEN',
  'DISCORD_CHANNEL_ID',
  'GITHUB_PAT',
  'GITHUB_ID',
  'GITHUB_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

/**
 * Validate all required environment variables exist
 * Throws error if any are missing
 */
export function validateEnvironmentVariables(): void {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error('❌ Environment Configuration Error:');
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log('✅ All required environment variables are configured');
}

/**
 * Get all configured environment variables (for logging/debugging)
 * Only returns safe values (not secrets)
 */
export function getEnvironmentStatus(): Record<string, string> {
  const status: Record<string, string> = {};

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (value) {
      // Don't expose actual secret values
      status[envVar] = '✓ Configured';
    } else {
      status[envVar] = '✗ Missing';
    }
  }

  return status;
}

/**
 * Optional environment variables with defaults
 */
export const OPTIONAL_ENV_VARS = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;
