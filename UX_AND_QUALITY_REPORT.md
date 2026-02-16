# UX & Functionality Report

## Critical UX/Functionality Issues

### 1. Fake Polling / Missing Real-Time Feedback
- **Severity:** HIGH
- **Location:** `apps/web/src/pages/index.tsx` (lines ~200-220)
- **Description:** The `handleExecute` function simulates polling for a response using `setTimeout` and hardcoded messages. It never calls `pollResponses` from `api-client.ts`.
- **Impact:** Users receive fake "Success" messages even if the command failed on Discord or is still processing. They have no way to see the actual bot response output in the UI.
- **Recommendation:** Implement real polling using `pollResponses` or valid server-side events. Display the actual `message.content` from the bot response.

### 2. Client-Side Only Favorites
- **Severity:** MEDIUM
- **Location:** `apps/web/src/lib/storage.ts`
- **Description:** Favorites are stored in `localStorage`.
- **Impact:** Favorites do not sync across devices or browsers.
- **Recommendation:** Move favorites storage to the backend (database) attached to the user profile.

### 3. Missing Error Handling Visualization
- **Severity:** MEDIUM
- **Location:** `apps/web/src/pages/index.tsx`
- **Description:** Error messages are just text strings in the terminal output.
- **Impact:** Critical errors might be missed if the user isn't looking at the terminal log.
- **Recommendation:** Use toast notifications or a distinct error banner for critical failures (e.g., API errors, auth failures).

---

# Code Quality Report

## Issues

### 1. Hardcoded Polling Logic
- **Location:** `apps/web/src/pages/index.tsx`
- **Description:** The polling logic is coupled inside the view component and is fake.
- **Improvement:** Extract polling logic to a custom hook (e.g., `useCommandPoller`) that handles the API calls and state management.

### 2. Type Safety Gaps
- **Location:** `apps/web/src/pages/api/*.ts`
- **Description:** Usage of `(req as any).session`.
- **Improvement:** Extend the `NextApiRequest` interface globally to include `session`.
  ```typescript
  interface AuthenticatedRequest extends NextApiRequest {
    session: Session;
  }
  ```

### 3. Duplicate/Insecure Code
- **Location:** `apps/web/src/pages/api/execute.ts`
- **Description:** Redundant and insecure endpoint.
- **Improvement:** Delete it.

### 4. Configuration Management
- **Location:** `apps/web/src/lib/discord-server.ts`
- **Description:** `DISCORD_WEBHOOK_URL` is read from `process.env` in multiple places.
- **Improvement:** Centralize all config reading in `@repo/config` or a dedicated config service that validates all env vars on startup.

---

# Summary Report

## Executive Summary
The MaxBot Controller is a functional proof-of-concept but contains **critical security vulnerabilities** and **simulated functionality** that make it unsuitable for production use in its current state.

## Key Findings
1.  **Security:** A critical vulnerability exists in `/api/execute` allowing unauthenticated command execution. This file must be deleted immediately.
2.  **Functionality:** The "polling" mechanism is fake. The frontend does not actually check for bot responses, meaning users get no real feedback.
3.  **Architecture:** The project structure (Turborepo) is solid, but the backend persistence layer is missing (in-memory history).

## Action Plan
1.  **IMMEDIATE:** Delete `apps/web/src/pages/api/execute.ts`.
2.  **HIGH:** Implement real polling in `index.tsx`.
3.  **HIGH:** Fix the GitHub collaborator check in `[...nextauth].ts`.
4.  **MEDIUM:** Add database persistence for history.
5.  **LOW:** Polish UX and add real error handling.

