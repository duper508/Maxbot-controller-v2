# Mobile App (Android) Setup Guide

The MaxBot Controller mobile app runs locally on your Android device and connects to your Vercel web app backend for all Discord/GitHub operations.

## Architecture Overview

```
Android App (Local)
    ↓
    └── Calls Vercel Web App API
            ↓
            ├── /api/execute-command (send Discord commands)
            ├── /api/poll-response (get bot responses)
            └── /api/history (fetch execution history)
    
    ↓ Uses SecureStore
    ├── API Base URL (your Vercel domain)
    └── Optional: User preferences
```

**Key Point:** The Android app is a "client" that talks to your Vercel-deployed backend. It does NOT handle Discord/GitHub directly.

---

## Prerequisites

- Android 8.0+ (API level 26+)
- APK file (downloaded from GitHub Releases or built locally)
- Your Vercel domain (e.g., `https://maxbot-controller.vercel.app`)

---

## Installation Steps

### 1. Download APK

Option A: **From GitHub Releases**
1. Go to [github.com/duper508/maxbot-controller/releases](https://github.com/duper508/maxbot-controller/releases)
2. Download the latest `app-release.apk`
3. Transfer to your Android device

Option B: **Build Locally (Advanced)**
```bash
cd apps/mobile
npx expo build:android --type apk
# Download APK from Expo
```

### 2. Install APK on Android Device

1. On your Android phone:
   - Go to Settings → Security
   - Enable "Unknown Sources" (Allow installation from unknown sources)
   
2. Open File Manager and find the downloaded APK
3. Tap to install
4. Wait for installation to complete
5. Open "MaxBot Controller" app

---

## First-Time Configuration

When you first launch the app:

### 1. Enter Vercel Domain

The app will ask for your **API Base URL**:

```
Your Vercel Domain: https://maxbot-controller.vercel.app
```

Or if using a custom domain:
```
Your API Base URL: https://your-custom-domain.com
```

**This is stored securely** in the device's secure storage (uses Android KeyStore).

### 2. Log In with GitHub

1. Tap "Settings" tab
2. Tap "Login with GitHub"
3. You'll see a browser screen with GitHub login
4. Enter your GitHub credentials
5. Grant access to MaxBot Controller
6. Return to app (login succeeds)

**What happens:**
- App contacts your Vercel backend
- Backend verifies you're a collaborator on the repo
- Session is created and stored securely

### 3. Verify Connection

1. Go to "Commands" tab
2. Browse available commands
3. Try executing one
4. Check if it appears in Discord

If it works → Setup complete! ✅

---

## How the Mobile App Works

### Authentication Flow

```
1. User enters Vercel domain
   ↓
2. Taps "Login with GitHub"
   ↓
3. Browser opens GitHub OAuth page
   ↓
4. User approves MaxBot Controller
   ↓
5. Browser redirects back to app
   ↓
6. App receives session token
   ↓
7. Session stored securely on device
   ↓
8. App is now authenticated!
```

### Command Execution Flow

```
1. User selects command + fills parameters
   ↓
2. Taps "EXECUTE"
   ↓
3. App sends to: POST /api/execute-command
   ↓
4. Vercel backend:
   - Verifies authentication
   - Checks rate limits
   - Sends to Discord webhook
   ↓
5. App waits for response
   ↓
6. App polls: GET /api/poll-response
   ↓
7. Shows Discord bot response in terminal
   ↓
8. Saves to execution history
```

---

## Settings (Available in App)

### Vercel Domain Configuration
**Location:** Settings tab → "API Configuration" section

- **API Base URL:** Your Vercel domain (must start with `https://`)
- **Example:** `https://maxbot-controller.vercel.app`

**Security:** Stored in device's secure storage (encrypted by Android).

### Optional Settings

- **Favorites:** Star commands for quick access
- **Execution History:** Shows all previous commands
- **Theme:** (Pre-set to Pip-Boy green, not changeable)

---

## Troubleshooting

### "Failed to connect to API"

**Problem:** App can't reach your Vercel backend

**Solutions:**
1. Check API Base URL is correct:
   - Should be: `https://maxbot-controller.vercel.app`
   - NOT: `http://` (must be HTTPS)
   - NOT: `https://maxbot-controller.vercel.app/api` (no `/api` suffix)

2. Verify Vercel is running:
   - Visit `https://maxbot-controller.vercel.app` in browser
   - Should show login page

3. Check network:
   - Device is connected to WiFi/mobile data
   - WiFi allows HTTPS traffic

### "GitHub login failed"

**Problem:** OAuth login doesn't work

**Solutions:**
1. Verify GitHub OAuth app is configured:
   - Go to https://github.com/settings/developers
   - Check "Authorization callback URL" = `https://maxbot-controller.vercel.app/api/auth/callback/github`

2. Check environment variables in Vercel:
   - `GITHUB_ID` and `GITHUB_SECRET` must be set

3. Try logging in on web app first:
   - Visit `https://maxbot-controller.vercel.app` in browser
   - If that fails, fix the web app before trying mobile

### "Commands won't execute"

**Problem:** Tapping "EXECUTE" doesn't do anything

**Solutions:**
1. Check you're logged in:
   - Settings tab → Look for your GitHub username
   - If not logged in, go through GitHub login flow

2. Check Discord webhook:
   - Make sure webhook exists in your Discord server
   - Verify `DISCORD_WEBHOOK_URL` is set in Vercel

3. Check rate limiting:
   - Wait a few seconds between commands
   - App has rate limits to prevent spam

### "Can't see command responses"

**Problem:** Command executes but no response shown

**Solutions:**
1. Check Discord channel:
   - Make sure webhook points to correct channel
   - Verify `DISCORD_CHANNEL_ID` is correct in Vercel

2. Check bot permissions:
   - Discord bot needs "Read Messages" permission
   - Bot must be in the channel

3. Wait a bit longer:
   - App polls every 3 seconds for response
   - Max wait time is 60 seconds

---

## Data Storage

### Stored Locally on Device
- **API Base URL** (encrypted in secure storage)
- **Session token** (encrypted in secure storage)
- **Execution history** (up to 100 entries)
- **Favorite commands** (marked with star)

### Deleted on Uninstall
- All stored data is deleted when you uninstall the app
- You'll need to re-enter API URL and re-login next time

### No Cloud Sync
- Device storage is not synced to cloud
- Each device stores its own history independently

---

## Security Notes

✅ **Secure:**
- All credentials stored in Android KeyStore (encrypted)
- HTTPS only (no unencrypted connections)
- Session tokens are server-side, device just stores reference
- No Discord token or webhook URL stored on device

⚠️ **Phone Security:**
- If someone gets access to your phone, they could use the app
- No biometric lock (could add as feature)
- Logout removes session from device

---

## Advanced: Rebuild APK Locally

If you want to customize or rebuild the APK:

```bash
# Install dependencies
cd apps/mobile
npm install

# Option 1: Build with Expo (free, works on any computer)
npx expo build:android --type apk
# Download APK from Expo dashboard

# Option 2: Build locally with EAS (requires account)
eas build --platform android --profile preview
# Download APK from EAS dashboard
```

---

## Limitations (Current Version)

- Android only (no iOS version currently)
- No offline mode (requires internet connection)
- No biometric authentication (username/password via GitHub OAuth)
- No dark/light theme toggle (always Pip-Boy green)
- No push notifications (polling only)

These could be added as future enhancements.

---

## Quick Reference

| What | Where | How |
|------|-------|-----|
| Install app | GitHub Releases | Download APK, install |
| Configure | Settings tab | Enter Vercel domain |
| Login | Settings tab | Tap "Login with GitHub" |
| Execute commands | Commands tab | Select → Fill params → Tap EXECUTE |
| View history | History tab | Tap to see details |
| Add favorites | Commands tab | Tap star icon |
| Logout | Settings tab | Tap "Logout" |

---

## Still Having Issues?

1. **Check web app first** - If web version doesn't work, mobile won't either
2. **Verify environment variables** - Go to Vercel Settings → Environment Variables
3. **Check Discord/GitHub setup** - Webhook exists? Bot has permissions?
4. **Network issues** - Try different WiFi, restart device
5. **Check logs** - In Vercel, go to Deployments → view logs for errors

---

## Next Steps

1. ✅ Download APK from GitHub Releases
2. ✅ Install on Android device (enable unknown sources)
3. ✅ Open app and enter Vercel domain
4. ✅ Login with GitHub
5. ✅ Try executing a command
6. ✅ Check Discord to verify it worked

Done! 🎮
