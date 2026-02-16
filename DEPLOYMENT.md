# 🚀 Deployment Guide

## Local Development

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy environment template**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   # Copy output to NEXTAUTH_SECRET in .env.local
   ```

4. **Configure credentials** (see [SECURITY.md](SECURITY.md)):
   - GitHub OAuth (Client ID, Secret)
   - Discord webhook URL
   - Discord bot token

5. **Start development server**
   ```bash
   npm run dev
   
   # Or just the web app:
   npm run -w apps/web dev
   ```

6. **Visit** `http://localhost:3000`

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Run production build locally
npm run -w apps/web start
```

---

## Vercel Deployment

### Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository connected to Vercel
- All credentials ready

### Step 1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select your GitHub repository
4. Set root directory to `apps/web`
5. Skip build settings (auto-detected)

### Step 2: Configure Environment Variables

1. Go to project Settings > Environment Variables
2. Add each variable:

**GitHub OAuth**
```
GITHUB_ID = your_client_id
GITHUB_SECRET = your_client_secret  (mark as sensitive)
NEXTAUTH_SECRET = generated_secret   (mark as sensitive)
NEXTAUTH_URL = https://your-domain.vercel.app
```

**Discord**
```
DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/...  (mark as sensitive)
DISCORD_BOT_TOKEN = your_bot_token   (mark as sensitive)
```

**Public**
```
NEXT_PUBLIC_API_BASE = https://your-domain.vercel.app/api
```

### Step 3: Update GitHub OAuth

1. Go to [GitHub OAuth Settings](https://github.com/settings/developers)
2. Edit your OAuth application
3. Update **Authorization callback URL**:
   ```
   https://your-domain.vercel.app/api/auth/callback/github
   ```

### Step 4: Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for deployment to complete
3. Visit your deployment URL
4. Test login with GitHub

### Step 5: Custom Domain (Optional)

1. In Vercel project Settings > Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Update `NEXTAUTH_URL` to custom domain

---

## Environment Variables Cheat Sheet

### Development (.env.local)
```bash
GITHUB_ID=github_client_id
GITHUB_SECRET=github_client_secret_xxxxx
NEXTAUTH_SECRET=openssl_rand_secret_xxxxx
NEXTAUTH_URL=http://localhost:3000
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx/xxxxx
DISCORD_BOT_TOKEN=discord_bot_token_xxxxx
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

### Production (Vercel)
```
GitHub OAuth settings → Production environment
Discord credentials → Production environment
NEXTAUTH_URL → https://your-domain.vercel.app
NEXT_PUBLIC_API_BASE → https://your-domain.vercel.app/api
```

### Mark as Sensitive in Vercel
- ✅ GITHUB_SECRET
- ✅ NEXTAUTH_SECRET
- ✅ DISCORD_BOT_TOKEN
- ✅ DISCORD_WEBHOOK_URL

---

## Troubleshooting

### Login redirects to /unauthorized

**Cause**: User is not a collaborator on the repository

**Fix**:
1. Add user as collaborator:
   - Go to `duper508/maxbot-controller` on GitHub
   - Settings > Collaborators > Add collaborators
2. User needs to accept invitation
3. Try login again

### "GITHUB_ID not configured"

**Cause**: Environment variables not set

**Fix**:
1. Check Vercel Settings > Environment Variables
2. Verify variables are set for correct environment (Production/Preview/Development)
3. Redeploy after adding variables

### Discord webhook fails

**Cause**: Invalid webhook URL or permissions

**Fix**:
1. Verify webhook URL format: `https://discord.com/api/webhooks/{ID}/{TOKEN}`
2. Check bot has "Send Messages" permission in channel
3. Webhook may have expired - regenerate in Discord

### API returns 401 (Unauthorized)

**Cause**: Session expired or not authenticated

**Fix**:
1. User needs to login via GitHub
2. Check browser cookies (should have `next-auth.session-token`)
3. Try incognito/private mode to rule out stale cookies

### Rate limit errors (429)

**Cause**: Too many requests in short time

**Fix**:
1. Wait a minute and retry
2. Check if there's automated polling
3. Implement exponential backoff in client

---

## Scaling & Performance

### Current Limitations

- **In-memory history**: Lost on restart
- **In-memory rate limiting**: Per-instance only
- **No caching**: Every request hits API

### Production Improvements

```typescript
// Use Redis for distributed rate limiting
import redis from 'redis';

// Use database for execution history
import { PrismaClient } from '@prisma/client';

// Add caching
import NodeCache from 'node-cache';
```

### Database Setup (Optional)

For persistent history:

1. **Add Prisma**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Create schema** (prisma/schema.prisma)
   ```prisma
   model ExecutionHistory {
     id        String   @id @default(cuid())
     userEmail String
     commandId String
     status    String
     output    String?
     createdAt DateTime @default(now())
   }
   ```

3. **Update `lib/history.ts`** to use Prisma instead of Map

### Caching Strategy

```typescript
// Cache commands list (rarely changes)
const commandCache = new NodeCache({ stdTTL: 3600 });

// Cache user sessions (managed by NextAuth)

// Cache Discord channel info (TTL: 15 min)
```

---

## Monitoring

### Key Metrics to Track

- **Login success/failure rate**
- **API endpoint response times**
- **Rate limit violations**
- **Discord webhook failures**
- **Failed collaborator checks**

### Tools

- **Vercel Analytics**: Built-in monitoring
- **Sentry**: Error tracking
- **Datadog**: Comprehensive monitoring
- **LogRocket**: Session replay

### Example Error Tracking Setup (Sentry)

```bash
npm install @sentry/nextjs
```

In `next.config.js`:
```javascript
const withSentry = require("@sentry/nextjs/withSentry");

module.exports = withSentry(nextConfig);
```

---

## Updates & Maintenance

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific
npm update next next-auth

# Check security
npm audit
```

### Deploying Updates

1. Push to main/production branch
2. Vercel auto-deploys
3. Monitor build logs
4. Test on staging first (optional)

### Rollback

If something breaks:

1. Go to Vercel Deployments
2. Find last known good deployment
3. Click three dots > Promote to Production

---

## Security Checklist for Deployment

- [ ] All secrets in environment variables (not code)
- [ ] NEXTAUTH_URL set correctly for domain
- [ ] GitHub OAuth callback URL updated
- [ ] Discord webhook URL valid
- [ ] Discord bot token valid and permissions set
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Collaborator check working
- [ ] No console errors about missing secrets
- [ ] Session cookies secure (Secure + HttpOnly flags)
- [ ] CORS not overly permissive

---

## Disaster Recovery

### Lost .env.local

1. Create new `.env.local` from `.env.example`
2. Regenerate `NEXTAUTH_SECRET`
3. Get credentials from:
   - GitHub Settings for OAuth
   - Discord for webhook/token
4. Restart dev server

### Compromised Discord Token

1. Go to Discord Developer Portal
2. Regenerate bot token
3. Update `DISCORD_BOT_TOKEN` everywhere
4. No other action needed (only affects new requests)

### Compromised GitHub Secret

1. Go to GitHub OAuth app settings
2. Regenerate Client Secret
3. Update `GITHUB_SECRET` in all environments
4. Users need to login again (old sessions invalid)

### Lost Vercel Access

1. Use GitHub to sign in to Vercel
2. Verify repository access
3. Reconnect to repository
4. Restore environment variables from backup

---

## Getting Help

- **Vercel**: https://vercel.com/support
- **NextAuth**: https://next-auth.js.org/
- **Discord API**: https://discord.com/developers/docs
- **GitHub**: https://github.com/duper508/maxbot-controller/issues

---

## Version History

### v1.0.0 (Current)

Initial release with:
- GitHub OAuth authentication
- Secure API middleware
- Rate limiting
- Discord integration
- Collaborator verification

---

## Quick Links

- [SECURITY.md](SECURITY.md) - Security implementation details
- [README.md](README.md) - Project overview
- [.env.example](apps/web/.env.example) - Environment variables template
