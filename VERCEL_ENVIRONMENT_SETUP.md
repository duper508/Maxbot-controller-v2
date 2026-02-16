# Vercel Environment Setup Guide

This guide explains how to configure all environment variables in Vercel so the MaxBot Controller can access Discord and GitHub credentials securely.

## Overview

The MaxBot Controller requires **8 environment variables** to function:

| Variable | Type | Purpose | Example |
|----------|------|---------|---------|
| `GITHUB_ID` | Public | GitHub OAuth Client ID | `abc123xyz` |
| `GITHUB_SECRET` | Secret | GitHub OAuth Client Secret | `ghp_xxx...` |
| `GITHUB_PAT` | Secret | GitHub token for auth checks | `ghp_xxx...` |
| `NEXTAUTH_SECRET` | Secret | JWT signing secret | `base64string==` |
| `NEXTAUTH_URL` | Public | OAuth callback URL | `https://yourdomain.vercel.app` |
| `DISCORD_CHANNEL_ID` | Public | Channel ID for commands | `1472555271166623775` |
| `DISCORD_WEBHOOK_URL` | Secret | Webhook for sending commands | `https://discord.com/api/webhooks/xxx/yyy` |
| `DISCORD_BOT_TOKEN` | Secret | Bot token for polling responses | `MzA0MzE3... ` |

---

## Step-by-Step Setup

### 1. Gather Required Values

Before going to Vercel, collect all these values:

#### GitHub OAuth Credentials
1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** MaxBot Controller
   - **Homepage URL:** `https://yourdomain.vercel.app`
   - **Authorization callback URL:** `https://yourdomain.vercel.app/api/auth/callback/github`
4. Copy:
   - `Client ID` → `GITHUB_ID`
   - `Client Secret` → `GITHUB_SECRET` (keep secret!)

#### GitHub Personal Access Token
1. Go to [GitHub Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scope: `repo` (for private repo access)
4. Generate token and copy → `GITHUB_PAT` (keep secret!)

#### Discord Webhook
1. Go to your Discord server
2. Right-click channel → Edit Channel
3. Go to Integrations → Webhooks → New Webhook
4. Copy the webhook URL → `DISCORD_WEBHOOK_URL` (keep secret!)

#### Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on your bot application
3. Go to "Token" → Copy → `DISCORD_BOT_TOKEN` (keep secret!)

#### Discord Channel ID
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click the channel → Copy ID → `DISCORD_CHANNEL_ID`

#### NEXTAUTH Secret
Generate a random secret:
```bash
openssl rand -base64 32
```
Copy output → `NEXTAUTH_SECRET`

#### NEXTAUTH_URL
This is your Vercel domain:
```
https://maxbot-controller.vercel.app
# or your custom domain
https://your-custom-domain.com
```

---

### 2. Add to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **maxbot-controller** project
3. Click **Settings** → **Environment Variables**

#### Add Each Variable

For each of the 8 variables, click "Add Environment Variable" and:

1. Enter the **Name** (e.g., `GITHUB_ID`)
2. Enter the **Value** (e.g., `abc123xyz`)
3. Check which environments it applies to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **Save**

**Repeat for all 8 variables.**

---

### 3. Environment Variable Configuration

#### Public Variables (Safe to expose)
These don't contain secrets:
- `GITHUB_ID` - OK to expose
- `DISCORD_CHANNEL_ID` - OK to expose
- `NEXTAUTH_URL` - OK to expose

#### Secret Variables (Server-only)
These contain sensitive data—**NEVER expose to browser**:
- `GITHUB_SECRET` ⚠️
- `GITHUB_PAT` ⚠️
- `NEXTAUTH_SECRET` ⚠️
- `DISCORD_WEBHOOK_URL` ⚠️
- `DISCORD_BOT_TOKEN` ⚠️

**All API routes use `process.env.XXXX` to access these—they never go to the browser.**

---

### 4. Verify Configuration

After adding all variables:

1. Go to **Deployments**
2. Click the latest deployment
3. Go to **Environment Variables** tab
4. Verify all 8 variables are listed

The deployment should show:
```
✅ GITHUB_ID
✅ GITHUB_SECRET
✅ GITHUB_PAT
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ DISCORD_CHANNEL_ID
✅ DISCORD_WEBHOOK_URL
✅ DISCORD_BOT_TOKEN
```

---

### 5. Deploy to Vercel

Option A: **GitHub Auto-Deploy (Recommended)**
1. Push code to GitHub
2. Vercel automatically deploys with the env vars

Option B: **Manual Vercel CLI Deploy**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd maxbot-controller
vercel --prod
```

---

## Troubleshooting

### "Missing required environment variable"

**Problem:** App fails to start with message like `Missing DISCORD_BOT_TOKEN`

**Solution:**
1. Go to Vercel Settings → Environment Variables
2. Check all 8 variables are listed
3. For each secret, verify it's checked for "Production"
4. Redeploy: Go to Deployments → Click latest → "Redeploy"

### "Authentication failed"

**Problem:** GitHub OAuth login fails

**Solution:**
1. Verify `GITHUB_ID` and `GITHUB_SECRET` match your OAuth app
2. Check `NEXTAUTH_URL` matches your domain exactly (including https://)
3. Verify OAuth app's "Authorization callback URL" is set to `https://yourdomain.vercel.app/api/auth/callback/github`

### "Invalid Discord token"

**Problem:** Bot can't poll responses from Discord

**Solution:**
1. Verify `DISCORD_BOT_TOKEN` is correct
2. Check bot has permissions in the Discord server:
   - Read Messages
   - Read Message History
3. Verify `DISCORD_CHANNEL_ID` matches the actual channel ID

### "Invalid webhook URL"

**Problem:** Commands aren't sent to Discord

**Solution:**
1. Verify `DISCORD_WEBHOOK_URL` is complete (copy full URL)
2. Check webhook still exists in Discord (Server Settings → Integrations → Webhooks)
3. Verify webhook points to correct channel

---

## Security Checklist

- ✅ `.env.local` added to `.gitignore` (never commit secrets)
- ✅ All secrets stored in Vercel (not in repo)
- ✅ GITHUB_SECRET, GITHUB_PAT, NEXTAUTH_SECRET marked as "Secret" in Vercel
- ✅ DISCORD_WEBHOOK_URL, DISCORD_BOT_TOKEN marked as "Secret" in Vercel
- ✅ NEXTAUTH_URL matches your actual domain
- ✅ GitHub OAuth app's callback URL matches NEXTAUTH_URL
- ✅ All env vars set to Production environment
- ✅ Discord bot only has minimum required permissions

---

## Quick Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Test local setup (before deploying to Vercel)
cp apps/web/.env.example apps/web/.env.local
# Fill in all values in .env.local
npm run dev
# Should work locally before pushing to Vercel

# View Vercel environment
vercel env list

# See logs for deployment issues
vercel logs
```

---

## Variables Summary

| Variable | Where to Get | Keep Secret | Used By |
|----------|-------------|------------|---------|
| GITHUB_ID | GitHub Developer Settings | No | Browser + Server |
| GITHUB_SECRET | GitHub Developer Settings | **YES** | Server OAuth |
| GITHUB_PAT | GitHub Personal Tokens | **YES** | Server auth check |
| NEXTAUTH_SECRET | Generate with `openssl` | **YES** | Server session |
| NEXTAUTH_URL | Your domain | No | Browser OAuth |
| DISCORD_CHANNEL_ID | Discord (right-click) | No | Server polling |
| DISCORD_WEBHOOK_URL | Discord Webhooks | **YES** | Server commands |
| DISCORD_BOT_TOKEN | Discord Developer Portal | **YES** | Server polling |

---

## Next Steps

1. ✅ Gather all 8 values (see "Gather Required Values" above)
2. ✅ Add to Vercel Environment Variables
3. ✅ Push code to GitHub
4. ✅ Vercel auto-deploys
5. ✅ Visit your domain and test login
6. ✅ Try executing a command

Done! 🚀
