# Bug Report

## Critical Severity

### 1. Unauthenticated Command Execution & Secret Exposure
- **Severity:** CRITICAL
- **Location:** `apps/web/src/pages/api/execute.ts`
- **Description:** The `/api/execute` endpoint does not use the `withAuth` middleware, allowing any unauthenticated user to execute commands. Furthermore, it accepts `webhookUrl` in the request body, which forces the client to expose the secret Discord Webhook URL.
- **Impact:** Attackers can execute arbitrary commands and steal the webhook URL to spam the Discord server.
- **Recommendation:** Delete `apps/web/src/pages/api/execute.ts` immediately. Use `apps/web/src/pages/api/execute-command.ts` instead.

### 2. Flawed Collaborator Check Logic
- **Severity:** HIGH
- **Location:** `apps/web/src/pages/api/auth/[...nextauth].ts`
- **Description:** The `checkUserCollaborator` function uses the *user's* access token to check if they are a collaborator on the repository. If the repository is private, the user might not have visibility into the repo's collaborators unless they are already added. If the repo is public, this check might pass for anyone if not scoped correctly.
- **Impact:** Potential bypass of authorization or valid users being denied access.
- **Recommendation:** Use a dedicated `GITHUB_PAT` (Personal Access Token) with `repo` scope in environment variables to check collaboration status, rather than the user's token.

### 3. Weak CSRF Protection
- **Severity:** HIGH
- **Location:** `apps/web/src/lib/auth-middleware.ts`
- **Description:** `validateCsrfToken` implementation is `Boolean(token && sessionId)`. It checks for existence but does not validate the token's signature or origin.
- **Impact:** Cross-Site Request Forgery (CSRF) attacks are possible against API endpoints.
- **Recommendation:** Implement proper CSRF token validation using a library like `csurf` or verify against the session's stored CSRF token (NextAuth provides `getCsrfToken`).

## Medium Severity

### 4. Discord Channel ID Exposure / IDOR
- **Severity:** MEDIUM
- **Location:** `apps/web/src/pages/api/poll-response.ts`
- **Description:** The `poll-response` endpoint accepts `channelId` as a query parameter.
- **Impact:** An authenticated user (collaborator) can poll messages from *any* channel the bot has access to, potentially leaking sensitive information from private admin channels.
- **Recommendation:** Validate that the requested `channelId` matches the configured `DISCORD_CHANNEL_ID` environment variable, or remove the parameter and always use the env var.

### 5. In-Memory History Storage
- **Severity:** MEDIUM (Functionality)
- **Location:** `apps/web/src/lib/history.ts`
- **Description:** Execution history is stored in a JavaScript `Map` (in-memory).
- **Impact:** All command history is lost when the server restarts or redeploys.
- **Recommendation:** Use a persistent database (PostgreSQL, SQLite, or even a JSON file for small scale) to store history.

## Low Severity

### 6. Missing Environment Variable Validation
- **Severity:** LOW
- **Location:** `apps/web/next.config.js` / `apps/web/src/lib/discord-server.ts`
- **Description:** While there are checks, the app starts even if critical env vars like `DISCORD_WEBHOOK_URL` are missing (just logs a warning).
- **Impact:** App runs in a broken state.
- **Recommendation:** Fail the build or startup if critical environment variables are missing.

---

# Security Audit

## Findings
1.  **Authentication:** Uses NextAuth with GitHub provider. Logic is generally sound but relies on `checkCollaborator` which has implementation flaws.
2.  **Authorization:** API routes (except the vulnerable `execute.ts`) are protected by `withAuth`.
3.  **Secrets:** Discord Webhook URL is properly used server-side in `execute-command.ts`, but exposed in `execute.ts`.
4.  **Rate Limiting:** Implemented via `rate-limit.ts` and applied to API routes.
5.  **Headers:** Security headers are configured in `next.config.js` (HSTS, X-Frame-Options, CSP).

## Recommendations
- **Immediate:** Delete `apps/web/src/pages/api/execute.ts`.
- **High Priority:** Fix `checkUserCollaborator` to use a service token. Fix CSRF validation.
- **Medium Priority:** Lock down `poll-response.ts` to only allowed channels.

---

# UX & Functionality Review

## UX Issues
1.  **Loading States:** Need to verify if the frontend handles the `poll-response` loading state gracefully.
2.  **Error Messages:** API returns generic error strings. Frontend should map these to user-friendly messages.
3.  **History Persistence:** Users will be confused if history disappears.

## Functionality Gaps
1.  **History Persistence:** As noted, history is ephemeral.
2.  **Real-time Updates:** Polling is used (via `poll-response`). WebSockets or Server-Sent Events (SSE) would provide a better experience for command responses.

---

# Code Quality

## Issues
1.  **Type Safety:** Generally good, but `any` is used in a few places (e.g., `(req as any).session`). Extend `NextApiRequest` interface instead.
2.  **Duplication:** `execute.ts` and `execute-command.ts` duplicate logic (and one is insecure).
3.  **Hardcoded Values:** `LOOSE_LIMIT`, `EXECUTE_LIMIT` configurations are in code, should be in config.

