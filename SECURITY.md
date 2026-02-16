# 🔐 Security Implementation Guide

## Overview

MaxBot Controller uses a **zero-secrets-to-client** architecture with GitHub OAuth and secure server-side API middleware.

### Key Security Principles

✅ **All secrets server-side only**
- Discord bot token (server environment variable)
- Discord webhook URL (server environment variable)
- GitHub OAuth secret (server environment variable)
- NextAuth session secret (server environment variable)

✅ **Secure authentication**
- GitHub OAuth 2.0 integration
- Collaborator verification on login
- JWT-based session management
- Automatic session expiration

✅ **Protected API routes**
- All endpoints require authentication (NextAuth)
- Rate limiting on all routes
- CSRF protection via NextAuth
- Request validation and sanitization

✅ **Security headers**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection enabled
- HSTS enabled
- Strict CSP on API routes

---

## GitHub OAuth Setup

### 1. Create GitHub OAuth Application

1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: MaxBot Controller
   - **Homepage URL**: `https://your-domain.com` (or `http://localhost:3000` for dev)
   - **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`
     - For local: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and generate **Client Secret**

### 2. Configure Environment Variables

Create `.env.local` in `apps/web/`:

```bash
GITHUB_ID=your_client_id_here
GITHUB_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Verify Collaborator Access

The system automatically checks if the user is a collaborator on `duper508/maxbot-controller` during login:

- ✅ User authenticates with GitHub
- ✅ System verifies collaborator status
- ✅ Collaborators get access
- ❌ Non-collaborators see `/unauthorized` page

---

## Discord Credentials Setup

### 1. Discord Webhook (for sending commands)

1. Go to your Discord server
2. Channel Settings > Integrations > Webhooks
3. Create New Webhook
4. Copy webhook URL: `https://discord.com/api/webhooks/{ID}/{TOKEN}`

### 2. Discord Bot Token (for polling responses)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a New Application
3. Go to Bot > Copy Token
4. Add bot to your server with:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History

### 3. Store in Environment

**For local development** (`.env.local`):
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=your_bot_token_here
```

**For Vercel deployment**:
1. Go to Project Settings > Environment Variables
2. Add both variables
3. Mark as sensitive (if available)
4. Set for Production environment

---

## API Authentication & Rate Limiting

### Protected Routes

All API routes (except `/api/auth/*`) require authentication:

```
POST   /api/execute-command      (10 req/min)
GET    /api/poll-response        (120 req/min)
GET    /api/commands             (120 req/min)
GET    /api/history              (120 req/min)
DELETE /api/history/:id          (120 req/min)
```

### How Authentication Works

1. **Client**: Redirected to login if no session
2. **Login**: User authenticates with GitHub
3. **Session**: NextAuth creates JWT token
4. **API Calls**: Client cookie automatically sent with requests
5. **Server**: Middleware verifies session before executing

### Rate Limiting

In-memory rate limiting by IP address:

- **Execute Command**: 10 requests/minute (strict)
- **Other routes**: 60-120 requests/minute (standard)

**Production tip**: Use Redis for distributed rate limiting.

---

## CSRF Protection

NextAuth.js provides built-in CSRF protection via:

- Secure session tokens
- SameSite cookie attribute
- CSRF token validation on state-changing operations

No additional setup required.

---

## Environment Variables Reference

### Server-Only (NEVER expose to client)

```bash
# GitHub
GITHUB_ID=... (contains secret)
GITHUB_SECRET=... ⚠️ SECRET
NEXTAUTH_SECRET=... ⚠️ SECRET

# Discord
DISCORD_WEBHOOK_URL=... ⚠️ SECRET
DISCORD_BOT_TOKEN=... ⚠️ SECRET

# NextAuth
NEXTAUTH_URL=... (no secret, but identifies environment)
```

### Public (Safe with NEXT_PUBLIC_ prefix)

```bash
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
NEXT_PUBLIC_DISCORD_WEBHOOK_BASE=https://discord.com/api/webhooks
```

---

## Security Checklist

### Development

- [ ] Create `.env.local` from `.env.example`
- [ ] Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`
- [ ] Set up GitHub OAuth application
- [ ] Add bot to Discord and get token/webhook
- [ ] Verify `.env.local` in `.gitignore`
- [ ] Test login with GitHub
- [ ] Test unauthorized access redirects to `/unauthorized`
- [ ] Verify secrets NOT in browser console

### Testing Secrets Not Exposed

```javascript
// Open browser console (F12)
// Run these checks:

// ✅ Should be undefined (secrets server-only)
console.log(process.env.DISCORD_BOT_TOKEN)
console.log(process.env.DISCORD_WEBHOOK_URL)
console.log(process.env.GITHUB_SECRET)
console.log(process.env.NEXTAUTH_SECRET)

// ✅ Session should work (JWT cookie)
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### Vercel Deployment

- [ ] Set all environment variables in Project Settings
- [ ] Mark sensitive vars appropriately
- [ ] Set correct `NEXTAUTH_URL` for production domain
- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Test login on production
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Monitor CloudWatch logs for errors

### Code Review

- [ ] No `process.env.DISCORD_*` in client code
- [ ] No `process.env.GITHUB_SECRET` in client code
- [ ] No secrets in localStorage/sessionStorage
- [ ] API routes validate session on every request
- [ ] Rate limiting active on all endpoints
- [ ] Security headers set in `next.config.js`

---

## Common Security Issues & Fixes

### Issue: Secrets exposed in browser

**Wrong** ❌
```typescript
// Client-side - NEVER DO THIS
const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL; // Exposes secrets!
```

**Right** ✅
```typescript
// Server-side only
const webhookUrl = process.env.DISCORD_WEBHOOK_URL; // Only in API routes
```

### Issue: Missing authentication

**Wrong** ❌
```typescript
// No auth check
export default async function handler(req, res) {
  // Unauthenticated! Anyone can call this
}
```

**Right** ✅
```typescript
// With auth check
export default async function handler(req, res) {
  return withAuth(req, res, handler);
}
```

### Issue: No rate limiting

**Wrong** ❌
```typescript
// No rate limit - vulnerable to DoS
const result = await sendCommandToDiscord(payload);
```

**Right** ✅
```typescript
// With rate limit
export default async function handler(req, res) {
  return withRateLimit(req, res, handler, LIMIT.windowMs, LIMIT.maxRequests);
}
```

---

## Monitoring & Logging

### Key Events to Monitor

```typescript
// Suspicious login attempt
console.warn(`User not a collaborator: ${username}`);

// Dangerous command execution
console.warn(`Dangerous command executed: ${commandId} by ${email}`);

// Rate limit exceeded
console.warn(`Rate limit exceeded: ${ip}`);
```

### Recommended Monitoring

- Track failed login attempts
- Log all dangerous command executions
- Alert on unusual API activity
- Monitor rate limit violations
- Set up error tracking (Sentry)

---

## Regular Maintenance

### Monthly

- [ ] Rotate Discord bot token
- [ ] Verify GitHub OAuth app still has access
- [ ] Review collaborator list
- [ ] Check rate limit statistics

### Quarterly

- [ ] Update dependencies for security patches
- [ ] Review security headers
- [ ] Audit logs for suspicious activity

### Yearly

- [ ] Security audit of entire system
- [ ] Penetration testing (if applicable)
- [ ] Review and update security documentation

---

## Support & Questions

For security issues:
1. **Do NOT** post in public issues
2. Email or DM @duper508 with details
3. Include environment details and reproduction steps

For general help:
- Check this guide first
- Review API route implementations
- Check `next-auth` documentation

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OWASP Security Guidelines](https://owasp.org/)
- [Discord API Security](https://discord.com/developers/docs)
- [GitHub OAuth Guide](https://docs.github.com/en/apps/oauth-apps)
