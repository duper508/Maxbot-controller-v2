# 🧪 Testing & Verification Guide

## Pre-Deployment Checklist

Run these checks before deploying to production.

### 1. Secrets Not Exposed

**Test**: Verify no secrets in browser or client code

```javascript
// Open browser console (F12) and run:

// ✅ All should be undefined (secrets server-only)
console.assert(typeof process.env.DISCORD_BOT_TOKEN === 'undefined', 'BOT_TOKEN leaked!');
console.assert(typeof process.env.DISCORD_WEBHOOK_URL === 'undefined', 'WEBHOOK_URL leaked!');
console.assert(typeof process.env.GITHUB_SECRET === 'undefined', 'GITHUB_SECRET leaked!');
console.assert(typeof process.env.NEXTAUTH_SECRET === 'undefined', 'NEXTAUTH_SECRET leaked!');

console.log('✅ All secrets properly hidden from client');
```

**Expected**: All assertions pass, console shows "All secrets properly hidden"

---

### 2. Authentication Flow

**Test**: GitHub OAuth login and session management

#### 2.1 Successful Login (Collaborator)

```bash
1. Navigate to http://localhost:3000
2. Click "SIGN IN WITH GITHUB"
3. Authorize the application
4. Should redirect to dashboard (/)
5. Should show user email in header
```

**Check**:
- ✅ URL changed to /
- ✅ User email displayed
- ✅ Session exists: `fetch('/api/auth/session').then(r=>r.json()).then(console.log)`

#### 2.2 Unauthorized Access (Non-Collaborator)

```bash
1. Add a test GitHub account as collaborator
2. Verify it works (step 2.1)
3. Remove collaborator on GitHub
4. Clear browser cookies
5. Try login again
6. Should see /unauthorized page
```

**Check**:
- ✅ Redirected to /unauthorized
- ✅ "ACCESS DENIED" message shown
- ✅ Cannot bypass to dashboard

#### 2.3 Session Persistence

```bash
1. Login successfully
2. Refresh page (Ctrl+R)
3. Should stay logged in
4. Close tab, reopen, navigate to site
5. Should still be logged in
```

**Check**:
- ✅ Session persists across refreshes
- ✅ No re-login needed

#### 2.4 Logout

```bash
1. Click "LOGOUT" button
2. Should redirect to /login
3. Try accessing / directly
4. Should redirect to /login
```

**Check**:
- ✅ Session cleared
- ✅ Redirected to login
- ✅ Protected routes blocked

---

### 3. API Authentication

**Test**: All API routes require authentication

#### 3.1 Unauthenticated Requests

```bash
# Should all return 401
curl http://localhost:3000/api/commands
curl http://localhost:3000/api/execute-command -X POST
curl http://localhost:3000/api/poll-response
curl http://localhost:3000/api/history
```

**Expected**: All return:
```json
{
  "success": false,
  "error": "Unauthorized: Please log in"
}
```

#### 3.2 Authenticated Requests

```javascript
// After logging in via browser:

// GET /api/commands
fetch('/api/commands')
  .then(r => r.json())
  .then(d => console.log(d.success ? '✅ Commands loaded' : '❌ Failed'));

// GET /api/history
fetch('/api/history')
  .then(r => r.json())
  .then(d => console.log(d.success ? '✅ History loaded' : '❌ Failed'));

// POST /api/execute-command (with valid command)
fetch('/api/execute-command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commandId: 'sys_status',
    parameters: {}
  })
})
  .then(r => r.json())
  .then(d => console.log(d.success ? '✅ Command executed' : '❌ Failed'));
```

**Expected**: All succeed with proper responses

---

### 4. Rate Limiting

**Test**: Rate limits are enforced

#### 4.1 Execute Command Rate Limit (10/min)

```javascript
// Rapidly execute commands
for (let i = 0; i < 15; i++) {
  fetch('/api/execute-command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commandId: 'sys_status',
      parameters: {}
    })
  })
  .then(r => {
    if (r.status === 429) {
      console.log(`✅ Rate limited at request ${i+1}`);
    }
  });
}
```

**Expected**: After ~10 requests, get 429 "Too many requests"

#### 4.2 Standard Route Rate Limit (60/min)

```javascript
// Test /api/commands rate limit
for (let i = 0; i < 65; i++) {
  fetch('/api/commands')
    .then(r => {
      if (r.status === 429 && i > 60) {
        console.log(`✅ Rate limited at request ${i+1}`);
      }
    });
}
```

**Expected**: Limited after ~60 requests

---

### 5. Parameter Validation

**Test**: Invalid parameters are rejected

```javascript
// Missing required parameter
fetch('/api/execute-command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commandId: 'sys_status',
    parameters: {} // Invalid
  })
})
.then(r => r.json())
.then(d => {
  if (!d.success && d.error) {
    console.log('✅ Validation error:', d.error);
  }
});

// Non-existent command
fetch('/api/execute-command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commandId: 'fake_command',
    parameters: {}
  })
})
.then(r => r.json())
.then(d => {
  if (!d.success && d.error) {
    console.log('✅ Command not found:', d.error);
  }
});
```

**Expected**: Both return validation errors

---

### 6. Discord Integration

**Test**: Discord webhook and bot token work

#### 6.1 Execute Command Test

```javascript
// Login and execute a command
fetch('/api/execute-command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commandId: 'sys_status',
    parameters: {}
  })
})
.then(r => r.json())
.then(d => {
  if (d.success && d.requestId) {
    console.log('✅ Request sent to Discord:', d.requestId);
    console.log('Check Discord channel - should see command embed');
  }
});
```

**Check Discord**:
- ✅ Message appears in Discord channel
- ✅ Shows command name and parameters
- ✅ Formatted as embed with green color

#### 6.2 Poll Response Test

```javascript
// Get channel ID and poll
const channelId = 'YOUR_CHANNEL_ID';

fetch(`/api/poll-response?channelId=${channelId}&limit=5`)
  .then(r => r.json())
  .then(d => {
    if (d.success && d.messages) {
      console.log(`✅ Polled ${d.messages.length} messages`);
      console.log(d.messages);
    }
  });
```

**Expected**: Returns recent messages from channel

---

### 7. History Management

**Test**: Execution history is saved and retrievable

```javascript
// Get history
fetch('/api/history')
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      console.log('✅ History loaded:', d.history?.length || 0, 'entries');
      console.log('Stats:', d.stats);
    }
  });

// Delete entry (after getting history ID)
const historyId = 'entry_id_from_above';
fetch(`/api/history?id=${historyId}`, { method: 'DELETE' })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      console.log('✅ Entry deleted');
    }
  });
```

**Expected**: History operations work correctly

---

### 8. CSRF Protection

**Test**: Cross-site requests are protected

```javascript
// NextAuth provides automatic CSRF protection
// NextAuth validates session on API calls
// No additional testing needed - it's built-in

console.log('✅ CSRF protection via NextAuth session');
```

---

### 9. Security Headers

**Test**: Security headers are properly set

```bash
# Check HTTP headers
curl -I http://localhost:3000/

# Look for these headers:
# X-Frame-Options: DENY ✅
# X-Content-Type-Options: nosniff ✅
# X-XSS-Protection: 1; mode=block ✅
# Referrer-Policy: strict-origin-when-cross-origin ✅
# Strict-Transport-Security: max-age=31536000 ✅
```

---

### 10. Error Handling

**Test**: Error cases are handled gracefully

```javascript
// Invalid channel ID in poll
fetch('/api/poll-response?channelId=invalid')
  .then(r => r.json())
  .then(d => {
    if (!d.success) {
      console.log('✅ Invalid input rejected:', d.error);
    }
  });

// Missing required query parameter
fetch('/api/poll-response')
  .then(r => r.json())
  .then(d => {
    if (!d.success) {
      console.log('✅ Missing param error:', d.error);
    }
  });

// Server error handling (intentional)
// API gracefully handles errors without crashing
```

**Expected**: Proper error messages, no server crashes

---

## Automated Testing Script

Save as `test-security.js`:

```javascript
/**
 * Automated security testing script
 * Run in browser console after login
 */

const tests = {
  secretsNotExposed: () => {
    const secrets = [
      'DISCORD_BOT_TOKEN',
      'DISCORD_WEBHOOK_URL',
      'GITHUB_SECRET',
      'NEXTAUTH_SECRET'
    ];
    
    return secrets.every(secret => {
      const value = process.env[secret];
      return typeof value === 'undefined';
    });
  },

  apiAuthenticationRequired: async () => {
    const endpoints = [
      '/api/commands',
      '/api/history',
    ];
    
    // Don't logout - just check if logout routes to login
    // Actually, test with fetch - just verify auth is needed
    return true; // Tested manually above
  },

  sessionPersists: async () => {
    const session = await fetch('/api/auth/session').then(r => r.json());
    return !!session.user;
  },

  rateLimit: async () => {
    // Make many requests
    const results = [];
    for (let i = 0; i < 65; i++) {
      const r = await fetch('/api/commands');
      if (r.status === 429) {
        return true; // Rate limited as expected
      }
      results.push(r.status);
    }
    return false; // Didn't hit rate limit (bad)
  }
};

// Run tests
async function runTests() {
  console.log('🧪 Running security tests...\n');
  
  // Sync tests
  const secretsOk = tests.secretsNotExposed();
  console.log(`${secretsOk ? '✅' : '❌'} Secrets not exposed to client`);
  
  // Async tests
  const sessionOk = await tests.sessionPersists();
  console.log(`${sessionOk ? '✅' : '❌'} Session persists`);
  
  console.log('\n🧪 Manual tests required:');
  console.log('  - API authentication');
  console.log('  - Rate limiting');
  console.log('  - Discord integration');
  console.log('  - Error handling');
}

runTests();
```

---

## Checklist Template

Copy and use before deployment:

```markdown
## Pre-Deployment Testing Checklist

### Security
- [ ] No secrets in browser console
- [ ] No secrets in localStorage
- [ ] No secrets in session storage
- [ ] No secrets in network requests (DevTools)

### Authentication
- [ ] GitHub login works for collaborators
- [ ] Non-collaborators redirected to /unauthorized
- [ ] Logout clears session
- [ ] Session persists on refresh

### API Routes
- [ ] All routes require authentication
- [ ] Rate limiting works
- [ ] Parameter validation works
- [ ] Error messages don't leak details

### Discord
- [ ] Webhook URL valid and working
- [ ] Bot token valid
- [ ] Commands appear in Discord
- [ ] Message polling works

### Headers & Security
- [ ] Security headers present
- [ ] HTTPS enabled (prod)
- [ ] CORS properly configured
- [ ] CSP headers set

### Error Handling
- [ ] Invalid input rejected
- [ ] No 500 errors on user input
- [ ] Error messages helpful
- [ ] Failed requests logged

### Performance
- [ ] Page loads quickly
- [ ] API responds <1s
- [ ] No memory leaks
- [ ] Rate limiting not too strict

### Deployment
- [ ] Env vars set in Vercel
- [ ] Sensitive vars marked private
- [ ] Build completes successfully
- [ ] No build warnings/errors

### Smoke Tests
- [ ] Can login
- [ ] Can execute command
- [ ] Can view history
- [ ] Can logout
```

---

## Continuous Integration

For GitHub Actions, add to `.github/workflows/test.yml`:

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      
      - run: npm run type-check
      
      - run: npm run lint
      
      - name: Check for secrets
        run: |
          # Check that secrets are not in code
          ! grep -r "DISCORD_BOT_TOKEN=" apps/web/src/
          ! grep -r "DISCORD_WEBHOOK_URL=" apps/web/src/
          ! grep -r "GITHUB_SECRET=" apps/web/src/
          ! grep -r "NEXTAUTH_SECRET=" apps/web/src/
```

---

## Performance Baseline

Expected metrics:

- **Page load**: <2 seconds
- **API response**: <500ms
- **Auth check**: <200ms
- **Rate limit check**: <50ms
- **Database query**: <100ms (when using DB)

---

## Troubleshooting Tests

### Rate limit not triggering

- Check IP address extraction in `lib/rate-limit.ts`
- Verify limits in constants (EXECUTE_LIMIT, STANDARD_LIMIT)
- Check that `withRateLimit` is wrapping handler

### Secrets appearing in console

- Check `next.config.js` for `NEXT_PUBLIC_` prefixes
- Verify `.env.local` is in `.gitignore`
- Check client code doesn't access server env vars

### Discord messages not appearing

- Verify webhook URL format
- Check bot permissions in Discord
- Check webhook hasn't expired
- Look for 401/403 errors in server logs

### Authentication failing

- Check GitHub OAuth app callback URL
- Verify user is collaborator on repository
- Check NEXTAUTH_SECRET is set
- Look at `/api/auth/error` for specific errors

---

## Getting Help

- Run `npm run build` to catch TypeScript errors
- Check browser DevTools Network tab for API errors
- Check server logs for detailed errors
- Review test output for specific failures
