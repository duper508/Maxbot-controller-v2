/** @type {import('next').NextConfig} */

// Validate required environment variables at build/startup time
const requiredEnvVars = [
  'DISCORD_WEBHOOK_URL',
  'DISCORD_BOT_TOKEN',
  'DISCORD_CHANNEL_ID',
  'GITHUB_PAT',
  'GITHUB_ID',
  'GITHUB_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`);
  });
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

console.log('✅ All required environment variables are configured');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/commands', '@repo/config'],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
    NEXT_PUBLIC_DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      // CSP for API routes (no inline scripts)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; script-src 'none'; style-src 'none'",
          },
        ],
      },
    ];
  },

  // Redirect rules for authentication
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
