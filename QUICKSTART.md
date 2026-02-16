# ⚡ Quick Start Guide

Get MaxBot Controller running with GitHub OAuth in 10 minutes.

## Prerequisites

- Node.js 18+ and npm
- GitHub account
- Discord bot + webhook URL

---

## 1. Set Up GitHub OAuth (2 min)

### Create GitHub OAuth Application

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: MaxBot Controller
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Copy **Client ID** and generate **Client Secret**

---

## 2. Get Discord Credentials (2 min)

### Discord Webhook URL

1. Go to your Discord server
2. Channel Settings > Integrations > Webhooks
3. Create New Webhook
4. Copy the URL

### Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create New Application
3. Go to Bot > Copy Token

---

## 3. Configure Environment (1 min)

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# GitHub
GITHUB_ID=your_client_id_here
GITHUB_SECRET=your_client_secret_here
NEXTAUTH_SECRET=openssl rand -base64 32  # Generate this!
NEXTAUTH_URL=http://localhost:3000

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
DISCORD_BOT_TOKEN=your_bot_token_here

# Public
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

---

## 4. Install & Run (3 min)

```bash
# From repo root
npm install

# Start dev server
npm run dev

# Or just the web app:
cd apps/web
npm run dev
```

Visit **http://localhost:3000**

---

## 5. Test (2 min)

1. ✅ Should redirect to /login
2. ✅ Click "SIGN IN WITH GITHUB"
3. ✅ Authorize the app
4. ✅ Should see dashboard
5. ✅ Should see your email in top right

---

## Troubleshooting

### "Unauthorized" after login
- You need to be a collaborator on `duper508/maxbot-controller`
- Ask @duper508 to add you

### Secrets showing in console
- Check .env.local is in .gitignore
- Restart dev server after env changes

### Discord webhook not working
- Verify webhook URL format
- Check bot has "Send Messages" permission

---

## Next Steps

1. Read [SECURITY.md](SECURITY.md) for security details
2. Read [API.md](API.md) for API usage
3. Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

---

## Key Files

- **Authentication**: `src/pages/api/auth/[...nextauth].ts`
- **API Routes**: `src/pages/api/{execute-command,commands,history,poll-response}.ts`
- **Config**: `.env.local` (copy from `.env.example`)
- **Dashboard**: `src/pages/index.tsx`

---

## Commands

```bash
# Development
npm run dev                    # Start dev server
npm run type-check            # Check TypeScript
npm run lint                  # Lint code
npm run build                 # Build for production

# Production
npm run build && npm start    # Build and run
```

---

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Vercel setup
- Environment variables
- Custom domains
- Monitoring

---

## Done! 🎉

You now have a secure MaxBot Controller with:
- ✅ GitHub OAuth authentication
- ✅ Collaborator access control
- ✅ Secure API routes (secrets server-only)
- ✅ Rate limiting
- ✅ Full documentation

---

## Support

- 🔐 **Security questions?** → [SECURITY.md](SECURITY.md)
- 📡 **API questions?** → [API.md](API.md)
- 🚀 **Deployment?** → [DEPLOYMENT.md](DEPLOYMENT.md)
- 🧪 **Testing?** → [TESTING.md](TESTING.md)
