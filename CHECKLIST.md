# ✅ Implementation Checklist

## Before You Start

- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Read [SECURITY.md](SECURITY.md) 
- [ ] Understand zero-secrets-to-client architecture

## GitHub OAuth Setup

- [ ] Go to https://github.com/settings/developers
- [ ] Create new OAuth App
- [ ] Copy Client ID to GITHUB_ID
- [ ] Copy Client Secret to GITHUB_SECRET
- [ ] Set callback URL: http://localhost:3000/api/auth/callback/github (dev)
- [ ] Set callback URL: https://your-domain.vercel.app/api/auth/callback/github (prod)

## Discord Setup

- [ ] Get Discord Bot Token
  - [ ] Go to https://discord.com/developers/applications
  - [ ] Create new application
  - [ ] Create bot
  - [ ] Copy token to DISCORD_BOT_TOKEN
  - [ ] Enable "Message Content Intent"
  - [ ] Add bot to server

- [ ] Get Webhook URL
  - [ ] Go to Discord server > Channel Settings
  - [ ] Integrations > Webhooks > Create Webhook
  - [ ] Copy URL to DISCORD_WEBHOOK_URL

## Local Setup

- [ ] `cd apps/web`
- [ ] `cp .env.example .env.local`
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Fill in .env.local:
  - [ ] GITHUB_ID
  - [ ] GITHUB_SECRET
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL=http://localhost:3000
  - [ ] DISCORD_WEBHOOK_URL
  - [ ] DISCORD_BOT_TOKEN
  - [ ] NEXT_PUBLIC_API_BASE=http://localhost:3000/api

- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Visit http://localhost:3000

## Testing Locally

### Security Tests
- [ ] Open browser console (F12)
- [ ] Verify: `process.env.DISCORD_BOT_TOKEN` → undefined
- [ ] Verify: `process.env.DISCORD_WEBHOOK_URL` → undefined
- [ ] Verify: `process.env.GITHUB_SECRET` → undefined
- [ ] Verify: `process.env.NEXTAUTH_SECRET` → undefined

### Authentication Tests
- [ ] Can redirect to /login
- [ ] Can click "SIGN IN WITH GITHUB"
- [ ] Can authorize on GitHub
- [ ] Redirects to dashboard (/)
- [ ] Shows user email in header
- [ ] Can click LOGOUT
- [ ] Redirected back to /login

### Authorization Tests
- [ ] Add test account as collaborator
- [ ] Can login with that account
- [ ] Remove collaborator on GitHub
- [ ] Clear browser cookies
- [ ] Try login again
- [ ] See /unauthorized page
- [ ] Cannot bypass to dashboard

### API Tests
- [ ] Unauthenticated GET /api/commands → 401
- [ ] Authenticated GET /api/commands → 200
- [ ] Authenticated POST /api/execute-command → 200
- [ ] Unauthenticated POST /api/execute-command → 401
- [ ] Execute command appears in Discord

### Rate Limiting Tests
- [ ] Make 11 requests to /api/execute-command
- [ ] 11th request returns 429
- [ ] Can retry after 1 minute

## Before Deploying to Vercel

- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (builds successfully)
- [ ] All local tests pass
- [ ] Verified no secrets in code
- [ ] Verified no secrets in browser

## Vercel Deployment

- [ ] Create Vercel project or connect existing
- [ ] Set root directory to `apps/web`
- [ ] Add environment variables:
  - [ ] GITHUB_ID
  - [ ] GITHUB_SECRET (mark sensitive)
  - [ ] NEXTAUTH_SECRET (mark sensitive)
  - [ ] NEXTAUTH_URL=https://your-domain.vercel.app
  - [ ] DISCORD_WEBHOOK_URL (mark sensitive)
  - [ ] DISCORD_BOT_TOKEN (mark sensitive)
  - [ ] NEXT_PUBLIC_API_BASE=https://your-domain.vercel.app/api

- [ ] Update GitHub OAuth callback URL to: https://your-domain.vercel.app/api/auth/callback/github
- [ ] Click Deploy
- [ ] Wait for deployment

## Post-Deployment Testing

- [ ] Visit deployment URL
- [ ] Should redirect to /login
- [ ] Can login with GitHub
- [ ] Can execute commands
- [ ] Can view history
- [ ] Can logout
- [ ] Verified no secrets in browser

## Custom Domain Setup (Optional)

- [ ] Add custom domain in Vercel Settings > Domains
- [ ] Update DNS records
- [ ] Update NEXTAUTH_URL to https://custom-domain.com
- [ ] Update GitHub OAuth callback URL
- [ ] Redeploy

## Documentation Review

- [ ] Read [API.md](API.md) for API details
- [ ] Read [SECURITY.md](SECURITY.md) for security details
- [ ] Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment tips
- [ ] Read [TESTING.md](TESTING.md) for testing procedures

## Ongoing Maintenance

### Weekly
- [ ] Check deployment status
- [ ] Monitor for errors in logs

### Monthly
- [ ] Review security checklist
- [ ] Check for dependency updates
- [ ] Verify Discord webhook still works

### Quarterly
- [ ] Update dependencies
- [ ] Security audit
- [ ] Review access logs

## Troubleshooting Checklist

If something isn't working:

### Login Issues
- [ ] GitHub OAuth callback URL correct?
- [ ] GITHUB_ID and GITHUB_SECRET correct?
- [ ] User is collaborator on repository?
- [ ] Check browser console for errors
- [ ] Check server logs

### Secrets Exposed
- [ ] .env.local in .gitignore?
- [ ] Restarted dev server after env changes?
- [ ] Clear browser cache/cookies?
- [ ] Check next.config.js has no NEXT_PUBLIC_ for secrets?

### Discord Not Working
- [ ] Webhook URL correct format?
- [ ] Bot token valid?
- [ ] Bot has "Send Messages" permission?
- [ ] Channel ID correct in poll request?

### API Not Working
- [ ] Logged in? (should have session cookie)
- [ ] Check browser DevTools > Network > API calls
- [ ] Check server logs for errors
- [ ] Rate limited? (429 status)

## Final Verification

- [ ] ✅ GitHub OAuth working
- [ ] ✅ Collaborator check working
- [ ] ✅ API routes secured
- [ ] ✅ Rate limiting active
- [ ] ✅ No secrets exposed
- [ ] ✅ Discord integration working
- [ ] ✅ History saving/loading
- [ ] ✅ Logout clearing session
- [ ] ✅ Documentation complete
- [ ] ✅ Ready for production

## You're All Set! 🎉

Your MaxBot Controller is now:
- ✅ Secure (GitHub OAuth + API auth)
- ✅ Protected (Rate limiting + CSRF)
- ✅ Documented (Comprehensive guides)
- ✅ Tested (Pre-deployment checklist)
- ✅ Production Ready (Vercel compatible)

**Next Step**: Start using it!
