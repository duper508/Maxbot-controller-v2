# 🔄 Migration Guide - Old to New Implementation

This guide helps you migrate from the old implementation to the new secure API implementation.

---

## What Changed

### Old Architecture ❌
```
Client → Discord Webhook (with URL) → Discord
Client → Discord API (with bot token) → Discord
Client stores secrets in state/storage
```

### New Architecture ✅
```
Client → Secure API Route → Server → Discord
Server handles all secrets (env vars only)
Client stores only session data
```

---

## Files to Remove

### 1. Old Discord Client Library

**Remove**:
- `apps/web/src/lib/discord.ts`

**Why**: Moved to server-side `discord-server.ts`

**Migration**:
```typescript
// OLD (client-side)
import { sendToDiscordWebhook } from '@/lib/discord';
const success = await sendToDiscordWebhook(webhookUrl, payload);

// NEW (server-side only)
import { sendCommandToDiscord } from '@/lib/discord-server';
const result = await sendCommandToDiscord(payload);
```

### 2. Old Execute Endpoint

**Remove**:
- `apps/web/src/pages/api/execute.ts`

**Why**: Replaced by `/api/execute-command` with authentication

**Migration**:
```typescript
// OLD endpoint
POST /api/execute?webhookUrl=...

// NEW endpoint
POST /api/execute-command (with auth)
```

---

## Code Changes Required

### 1. Remove Webhook URL Input from UI

**Before** (in settings tab):
```typescript
<input
  type="password"
  placeholder="Discord Webhook URL"
  value={webhookUrl}
  onChange={(e) => setWebhookUrl(e.target.value)}
/>
```

**After**: 
Removed (server-side only)

---

### 2. Remove Bot Token Input from UI

**Before** (in settings tab):
```typescript
<input
  type="password"
  placeholder="Discord Bot Token"
  value={botToken}
  onChange={(e) => setBotToken(e.target.value)}
/>
```

**After**:
Removed (server-side only)

---

### 3. Update Execute Command Call

**Before**:
```typescript
const response = await fetch('/api/execute', {
  method: 'POST',
  body: JSON.stringify({
    commandId,
    parameters,
    webhookUrl,  // ❌ REMOVE
  })
});
```

**After**:
```typescript
// Use new API client
const result = await executeCommand(commandId, parameters);

// OR with fetch:
const response = await fetch('/api/execute-command', {
  method: 'POST',
  body: JSON.stringify({
    commandId,
    parameters,
    // ✅ NO webhookUrl needed
  })
});
```

---

### 4. Add Authentication Check

**Before**: No authentication

**After**: Automatic via NextAuth

```typescript
// Pages are now protected
// Redirects to /login if not authenticated
useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/login');
  }
}, [status, router]);
```

---

### 5. Update Storage Keys

**Before**: Stored webhook URL and bot token in localStorage

**After**: Only store session (automatic via NextAuth)

```typescript
// Remove these from storage
localStorage.removeItem('webhook_url');
localStorage.removeItem('bot_token');

// Only use for favorites/history
localStorage.getItem('clawdbot:favorites');
localStorage.getItem('clawdbot:history');
```

---

## Environment Variables

### Old Setup (.env)
```
NEXT_PUBLIC_DISCORD_WEBHOOK_BASE=...
# Users set webhook URL and token in app
```

### New Setup (.env.local)
```
# GitHub OAuth
GITHUB_ID=...
GITHUB_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# Discord (server-side only!)
DISCORD_WEBHOOK_URL=...
DISCORD_BOT_TOKEN=...

# Public
NEXT_PUBLIC_API_BASE=...
```

---

## API Changes

### /api/execute (OLD ❌)

```bash
POST /api/execute
Content-Type: application/json

{
  "commandId": "sys_status",
  "parameters": {},
  "webhookUrl": "https://discord.com/api/webhooks/..."
}
```

**Removed**: Uses old client library

### /api/execute-command (NEW ✅)

```bash
POST /api/execute-command
Cookie: next-auth.session-token=...
Content-Type: application/json

{
  "commandId": "sys_status",
  "parameters": {}
}
```

**Features**:
- ✅ Requires authentication
- ✅ Rate limited (10/min)
- ✅ No secrets in request
- ✅ Returns requestId

---

## Component Updates

### Login Component

**New**: `src/pages/login.tsx`

```typescript
import { signIn, useSession } from 'next-auth/react';

// GitHub login button
<button onClick={() => signIn('github')}>
  Sign in with GitHub
</button>
```

### Logout Button

**New**: In dashboard header

```typescript
import { signOut } from 'next-auth/react';

<button onClick={() => signOut()}>
  Logout
</button>
```

### Access Control

**New**: `/unauthorized.tsx` page

```typescript
// Automatic if not a collaborator
// Shows at /unauthorized
// User can sign in with different account
```

---

## Testing Checklist

- [ ] Old API endpoint returns 404
- [ ] New API endpoint requires auth
- [ ] No webhook URL in browser storage
- [ ] No bot token in browser storage
- [ ] No secrets in console
- [ ] GitHub login works
- [ ] Collaborator check works
- [ ] Non-collaborators see /unauthorized
- [ ] Commands execute via new endpoint
- [ ] History saves/loads

---

## Rollback Plan

If you need to go back:

1. Revert commits removing old files
2. Reinstall old packages
3. Update `.env` (remove new vars)
4. Restart dev server

But **don't** - the new implementation is more secure!

---

## FAQ

### Q: Where do I put the webhook URL now?
**A**: Set `DISCORD_WEBHOOK_URL` in `.env.local` (server-side only)

### Q: Where do I put the bot token now?
**A**: Set `DISCORD_BOT_TOKEN` in `.env.local` (server-side only)

### Q: Do users still need to configure secrets?
**A**: No! They just log in with GitHub. Admin sets env vars on server.

### Q: Can I revert to the old version?
**A**: Yes, but not recommended. Old version leaked secrets to browser.

### Q: Will my old history still work?
**A**: Old history is lost (was in localStorage). New history saves on server.

### Q: Do I need to update the mobile app?
**A**: Not immediately. Mobile app has its own settings. But should be updated to use secure API routes too.

### Q: How do I test locally?
**A**: Follow [QUICKSTART.md](QUICKSTART.md)

---

## What's NOT Changing

✅ Command definitions (commands.json)  
✅ UI theme and styling  
✅ History functionality (improved)  
✅ Rate limiting (new, protects system)  
✅ Favorites system  
✅ Mobile app (for now)  

---

## Timeline

- **Immediately**: Set up new implementation
- **Week 1**: Test thoroughly
- **Week 2**: Deploy to production
- **Week 3**: Remove old code
- **Month 2**: Update mobile app (optional)

---

## Support

Need help migrating?

1. Read [SECURITY.md](SECURITY.md) - Why secrets moved server-side
2. Read [QUICKSTART.md](QUICKSTART.md) - How to set up
3. Read [TESTING.md](TESTING.md) - How to test
4. Open an issue if stuck

---

## Before & After Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Secrets in Browser** | ❌ YES (leaked!) | ✅ NO |
| **Authentication** | ❌ None | ✅ GitHub OAuth |
| **Authorization** | ❌ None | ✅ Collaborator check |
| **API Routes** | ❌ 1 basic route | ✅ 5 secure routes |
| **Rate Limiting** | ❌ None | ✅ 10-120 req/min |
| **CSRF Protection** | ❌ None | ✅ Built-in |
| **Session Management** | ❌ None | ✅ JWT (30d) |
| **Documentation** | ❌ Minimal | ✅ Comprehensive |
| **Security Audit Ready** | ❌ No | ✅ Yes |

---

## You're Done! 🎉

Migration complete. Your MaxBot Controller is now secure and production-ready.

Next: Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production.
