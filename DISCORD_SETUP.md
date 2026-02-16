# Discord Integration Setup

This guide walks through setting up Discord webhook and bot token for MaxBot Controller.

## Overview

MaxBot Controller communicates with your system via Discord in two ways:

1. **Webhook** - Send commands to Discord channel
2. **Bot Token** - Poll for responses (optional but recommended)

## Part 1: Create Discord Webhook

### Step 1: Open Channel Settings

1. Go to your Discord server
2. Create a new channel (or use existing): `#bot-controller-center`
3. Right-click channel → Edit Channel

### Step 2: Create Webhook

1. Navigate to "Integrations" → "Webhooks"
2. Click "New Webhook"
3. Give it a name: "MaxBot Controller"
4. (Optional) Set an avatar
5. Click "Copy Webhook URL"

### Step 3: Save Webhook URL

You'll get a URL like:
```
https://discord.com/api/webhooks/123456789/abcdefghijklmnop_QrStUvWxYz
```

**Keep this secret!** It allows posting to your channel.

---

## Part 2: Create Discord Bot Token (Optional but Recommended)

If you want automatic polling for command responses, you need a bot token.

### Step 1: Create Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it: "MaxBot Controller"
4. Accept ToS
5. Click "Create"

### Step 2: Create Bot

1. Go to "Bot" section
2. Click "Add Bot"
3. Under TOKEN, click "Copy"

You'll get a token like:
```
MTA4NTQxMTA5NTA4NTQxMTA5NTA4NTQxMTA5NTA4
```

**Keep this secret!**

### Step 3: Enable Intents

For the bot to read messages (for polling), enable intents:

1. In Bot section, scroll to "GATEWAY INTENTS"
2. Enable:
   - ✅ Message Content Intent
   - ✅ Guild Messages Intent

### Step 4: Add Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ bot
3. Select permissions:
   - ✅ Send Messages
   - ✅ Embed Links
4. Copy generated URL
5. Open in browser and select your server

The bot should now appear in your server as offline (unless you run it).

---

## Part 3: Configure in MaxBot Controller

### Web App

1. Open MaxBot Controller web interface
2. Go to Settings panel
3. Paste webhook URL in "Discord Webhook URL" field
4. Paste bot token in "Discord Bot Token" field (if you created one)
5. Test webhook by executing a command

### Mobile App

1. Open Settings tab
2. Paste webhook URL
3. Paste bot token (optional)
4. Toggle "Auto-refresh" if you want automatic polling
5. Save settings

Both are stored securely (LocalStorage on web, SecureStore on mobile).

---

## Testing the Connection

### Test Webhook

1. Configure webhook URL
2. Select any command
3. Click Execute
4. Check Discord channel - you should see a message with command details

**If webhook fails:**
- Verify URL is correct and recent
- Check webhook hasn't expired
- Ensure bot has channel permissions
- Check server firewall/proxy

### Test Bot Token (Optional)

1. Configure bot token
2. Make sure bot is in your server
3. Execute a command
4. App should try to poll for response

**If polling fails:**
- Bot may not have message read permissions
- Message Content Intent may not be enabled
- Bot may not be in the channel

---

## How It Works

### Command Execution Flow

```
1. User selects command in app
2. App sends to webhook URL
   POST https://discord.com/api/webhooks/ID/TOKEN
   {
     "embeds": [{
       "title": "Command Name",
       "description": "command_id",
       "fields": [
         { "name": "param1", "value": "value1" }
       ]
     }]
   }

3. Message appears in #bot-controller-center

4. ClawdBot or human reads message

5. System executes command

6. Response posted back to Discord (same channel or thread)

7. App polls Discord API using bot token
   GET https://discord.com/api/v10/channels/CHANNEL_ID/messages
   Headers: { Authorization: "Bot TOKEN" }

8. App finds response message

9. Result displayed in terminal
```

### Architecture Diagram

```
┌──────────────────────────┐
│   MaxBot Controller    │
│   (Web or Mobile)        │
└────────────┬─────────────┘
             │
             │ POST (webhook)
             ▼
    ┌────────────────────┐
    │  Discord Webhook   │
    │  (Channel message) │
    └────────┬───────────┘
             │
             │ Message appears
             ▼
    ┌────────────────────┐
    │  Discord Channel   │
    │ #bot-controller... │
    └────────┬───────────┘
             │
             │ Human/bot reads
             ▼
    ┌────────────────────┐
    │   ClawdBot System  │
    │   (Your machine)   │
    └────────┬───────────┘
             │
             │ Executes command
             ▼
    ┌────────────────────┐
    │   System Response  │
    │   (output/error)   │
    └────────┬───────────┘
             │
             │ Posts response
             ▼
    ┌────────────────────┐
    │ Discord Response   │
    │ Message in channel │
    └────────┬───────────┘
             │
             │ GET (bot token polling)
             ▼
┌──────────────────────────┐
│   MaxBot Controller    │
│   (Displays result)      │
└──────────────────────────┘
```

---

## Webhook URL Format

Complete webhook URL structure:

```
https://discord.com/api/webhooks/{WEBHOOK_ID}/{WEBHOOK_TOKEN}
```

Where:
- `WEBHOOK_ID` - Unique ID for webhook
- `WEBHOOK_TOKEN` - Secret token (changes if rotated)

**Important:** Keep the full URL secret. It's equivalent to a password.

---

## Bot Token Format

Discord bot tokens follow this pattern:

```
{NUMERIC_ID}.{TIMESTAMP_HEX}.{SIGNATURE_BASE64}
```

Example format (NOT a real token):
```
YOUR_BOT_ID.TIMESTAMP_PART.SIGNATURE_PART
```

**Never share your token!** If compromised:

1. Regenerate token in Developer Portal
2. Update token in app
3. Old token becomes invalid

---

## Security Best Practices

### Webhook URL

- ✅ Store in environment variables or secure storage
- ✅ Rotate if exposed
- ✅ Use narrow scopes (specific channel only)
- ❌ Don't commit to Git
- ❌ Don't share in screenshots/logs
- ❌ Don't paste in public chat

### Bot Token

- ✅ Store encrypted (mobile uses SecureStore)
- ✅ Use only read permissions for polling
- ✅ Rotate periodically
- ❌ Never log or display
- ❌ Never share
- ❌ Never use in URLs (use Authorization header)

### Server Permissions

- ✅ Limit bot to single channel if possible
- ✅ Use webhook for sends, bot token for reads
- ✅ Regular token rotation (monthly)
- ✅ Monitor webhook usage
- ❌ Don't give bot unnecessary permissions
- ❌ Don't use admin token for this

---

## Troubleshooting

### Webhook not posting

**Error: "Invalid webhook"**
- URL may be outdated
- Check channel still exists
- Regenerate webhook if needed

**Error: "Forbidden"**
- Webhook may have been deleted
- Create new webhook with same name

**Error: "Connection timeout"**
- Network issue or firewall blocking
- Try from different network
- Check Discord status page

### Bot token not working

**Error: "Unauthorized"**
- Bot token is invalid or expired
- Regenerate token in Developer Portal

**Error: "No messages returned"**
- Bot may not have permissions
- Check bot is in channel
- Verify Message Content Intent is enabled

**Polling takes too long**
- Discord API rate limits apply
- Reduce polling frequency
- Use WebSocket instead of polling (advanced)

### Both working but no response

**Command sent but no response from ClawdBot:**
- ClawdBot system may not be running
- Check ClawdBot is monitoring the channel
- Look for error messages in ClawdBot logs

**Response posted but app doesn't see it:**
- Response format may not match expected
- Check bot has read permissions
- Verify polling is enabled

---

## Environment Variables

For web deployment (Vercel, Docker, etc.):

```bash
# .env or secrets
NEXT_PUBLIC_DISCORD_WEBHOOK_BASE=https://discord.com/api/webhooks
DISCORD_WEBHOOK_ID=123456789
DISCORD_WEBHOOK_TOKEN=your_webhook_token_here
```

For mobile (stored securely in app):
- Configured in Settings tab
- Encrypted by OS (SecureStore)

---

## Advanced: WebSocket Polling

For real-time response detection, consider using Discord's WebSocket instead of HTTP polling:

1. Requires `discord.py` bot or similar
2. Maintains persistent connection
3. Immediate message detection
4. More complex setup

See Discord Developer Portal for WebSocket documentation.

---

## Need Help?

- Check Discord status: https://status.discord.com
- Developer Portal: https://discord.com/developers
- ClawdBot GitHub issues
- Test with curl first:

```bash
curl -X POST https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'
```

Should return 204 (no content, but successful).
