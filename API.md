# 📡 API Reference

All API routes require authentication via NextAuth session cookies.

## Authentication

All endpoints (except `/api/auth/*`) require a valid NextAuth session.

### Check Authentication

```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=..."
```

**Response**:
```json
{
  "user": {
    "name": "github-username",
    "email": "user@example.com",
    "image": "https://avatars.githubusercontent.com/u/123?v=4"
  },
  "expires": "2024-12-31T00:00:00.000Z"
}
```

---

## Endpoints

### POST /api/execute-command

Execute a command via Discord webhook.

**Authentication**: ✅ Required  
**Rate Limit**: 10 requests/minute  
**Method**: POST

**Request Body**:
```json
{
  "commandId": "sys_status",
  "parameters": {
    "param1": "value1",
    "param2": 42
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Command sent successfully",
  "requestId": "req_1704067200000_abc123def"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Command not found"
}
```

**Status Codes**:
- `200` - Command sent successfully
- `400` - Invalid request (missing commandId, invalid parameters)
- `401` - Unauthorized (not logged in)
- `404` - Command not found
- `429` - Rate limited
- `500` - Server error

**Example**:
```bash
curl -X POST http://localhost:3000/api/execute-command \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "commandId": "sys_status",
    "parameters": {}
  }'
```

---

### GET /api/poll-response

Poll Discord channel for bot responses.

**Authentication**: ✅ Required  
**Rate Limit**: 120 requests/minute  
**Method**: GET

**Query Parameters**:
| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| `channelId` | string | Yes | - | - |
| `limit` | number | No | 10 | 100 |
| `after` | string | No | - | - |

**Response (Success)**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "1234567890",
      "content": "Command output here",
      "author": {
        "id": "bot_id",
        "username": "ClawdBot",
        "avatar": "..."
      },
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid channelId format"
}
```

**Status Codes**:
- `200` - Messages retrieved
- `400` - Invalid parameters
- `401` - Unauthorized
- `429` - Rate limited
- `500` - Server error

**Example**:
```bash
curl "http://localhost:3000/api/poll-response?channelId=123456789&limit=10" \
  -H "Cookie: next-auth.session-token=..."
```

---

### GET /api/commands

Get list of available commands.

**Authentication**: ✅ Required  
**Rate Limit**: 120 requests/minute  
**Method**: GET

**Query Parameters**:
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `search` | string | No | - |
| `category` | string | No | - |

**Response (Success)**:
```json
{
  "success": true,
  "commands": [
    {
      "id": "sys_status",
      "name": "System Status",
      "description": "Get system status and resource usage",
      "category": "system",
      "icon": "⚙️",
      "parameters": [
        {
          "id": "verbose",
          "name": "Verbose",
          "type": "boolean",
          "description": "Show detailed info",
          "required": false
        }
      ],
      "dangerous": false,
      "timeout": 5000
    }
  ],
  "total": 1
}
```

**Status Codes**:
- `200` - Commands retrieved
- `401` - Unauthorized
- `429` - Rate limited
- `500` - Server error

**Example**:
```bash
# Get all commands
curl "http://localhost:3000/api/commands" \
  -H "Cookie: next-auth.session-token=..."

# Search for commands
curl "http://localhost:3000/api/commands?search=status" \
  -H "Cookie: next-auth.session-token=..."

# Filter by category
curl "http://localhost:3000/api/commands?category=system" \
  -H "Cookie: next-auth.session-token=..."
```

---

### GET /api/history

Get execution history for authenticated user.

**Authentication**: ✅ Required  
**Rate Limit**: 120 requests/minute  
**Method**: GET

**Query Parameters**:
| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| `limit` | number | No | 50 | 100 |

**Response (Success)**:
```json
{
  "success": true,
  "history": [
    {
      "id": "req_1704067200000_abc123def",
      "commandId": "sys_status",
      "commandName": "System Status",
      "status": "success",
      "output": "CPU: 45%, Memory: 8GB/16GB",
      "error": null,
      "startTime": 1704067200000,
      "endTime": 1704067205000,
      "duration": 5000,
      "timestamp": 1704067200000
    }
  ],
  "stats": {
    "totalExecutions": 42,
    "successfulExecutions": 40,
    "failedExecutions": 2,
    "pendingExecutions": 0
  }
}
```

**Status Codes**:
- `200` - History retrieved
- `401` - Unauthorized
- `429` - Rate limited
- `500` - Server error

**Example**:
```bash
# Get last 50 entries (default)
curl "http://localhost:3000/api/history" \
  -H "Cookie: next-auth.session-token=..."

# Get last 20 entries
curl "http://localhost:3000/api/history?limit=20" \
  -H "Cookie: next-auth.session-token=..."
```

---

### DELETE /api/history

Delete a history entry.

**Authentication**: ✅ Required  
**Rate Limit**: 120 requests/minute  
**Method**: DELETE

**Query Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| `id` | string | Yes |

**Response (Success)**:
```json
{
  "success": true
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "History entry not found"
}
```

**Status Codes**:
- `200` - Entry deleted
- `400` - Invalid request (missing id)
- `401` - Unauthorized
- `404` - Entry not found
- `429` - Rate limited
- `500` - Server error

**Example**:
```bash
curl -X DELETE "http://localhost:3000/api/history?id=req_1704067200000_abc123def" \
  -H "Cookie: next-auth.session-token=..."
```

---

## NextAuth Endpoints

These handle authentication flow.

### GET /api/auth/signin

Redirect to GitHub login page.

```bash
# Automatic redirect when accessing /login
# Or manually:
curl http://localhost:3000/api/auth/signin
```

### POST /api/auth/callback/github

GitHub OAuth callback (handled by NextAuth).

```
GET /api/auth/callback/github?code=...&state=...
```

### POST /api/auth/signout

Sign out the user.

**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/signout
```

**Response**:
Redirects to login page.

---

## Error Codes

### 400 - Bad Request

Invalid request parameters.

```json
{
  "success": false,
  "error": "Missing commandId"
}
```

**Causes**:
- Missing required parameters
- Invalid parameter format
- Invalid parameter values

### 401 - Unauthorized

User is not authenticated.

```json
{
  "success": false,
  "error": "Unauthorized: Please log in"
}
```

**Causes**:
- Session expired
- No session cookie
- Invalid session token

### 404 - Not Found

Resource not found.

```json
{
  "success": false,
  "error": "Command not found"
}
```

**Causes**:
- Command doesn't exist
- History entry not found

### 429 - Rate Limited

Too many requests.

```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

**Causes**:
- Exceeded request limit for endpoint
- Wait 1 minute before retrying

### 500 - Internal Server Error

Server error.

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Causes**:
- Discord API error
- Unexpected server exception
- Database error

---

## Rate Limiting

Each endpoint has specific rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/execute-command` | 10 | 1 minute |
| `/api/poll-response` | 120 | 1 minute |
| `/api/commands` | 120 | 1 minute |
| `/api/history` | 120 | 1 minute |

When rate limited, you get:
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

**Response Code**: 429

---

## Client Library

Use the provided client library in `lib/api-client.ts`:

```typescript
import {
  executeCommand,
  pollResponses,
  getCommands,
  getHistory,
  deleteHistoryEntry,
} from '@/lib/api-client';

// Execute command
const result = await executeCommand('sys_status', {});
if (result.success) {
  console.log('Request ID:', result.data?.requestId);
}

// Get commands
const cmdResult = await getCommands('status', 'system');
if (cmdResult.success) {
  console.log('Commands:', cmdResult.data?.commands);
}

// Poll responses
const pollResult = await pollResponses('123456789', 10);
if (pollResult.success) {
  console.log('Messages:', pollResult.data?.messages);
}

// Get history
const histResult = await getHistory(50);
if (histResult.success) {
  console.log('History:', histResult.data?.history);
  console.log('Stats:', histResult.data?.stats);
}

// Delete history entry
const delResult = await deleteHistoryEntry('entry_id');
if (delResult.success) {
  console.log('Entry deleted');
}
```

---

## Request Examples

### JavaScript/Fetch

```javascript
// Execute command
const response = await fetch('/api/execute-command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commandId: 'sys_status',
    parameters: { verbose: true }
  })
});
const data = await response.json();
console.log(data);
```

### cURL

```bash
# Get commands
curl http://localhost:3000/api/commands \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Execute command
curl -X POST http://localhost:3000/api/execute-command \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"commandId":"sys_status","parameters":{}}'

# Get history
curl http://localhost:3000/api/history?limit=20 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Python

```python
import requests

session = requests.Session()

# Execute command
response = session.post(
    'http://localhost:3000/api/execute-command',
    json={
        'commandId': 'sys_status',
        'parameters': {}
    }
)
print(response.json())

# Get history
response = session.get(
    'http://localhost:3000/api/history?limit=20'
)
print(response.json())
```

---

## WebSocket Support (Future)

Currently uses polling for responses. Future versions may add WebSocket support for real-time updates.

```javascript
// Future: WebSocket for real-time responses
const ws = new WebSocket('wss://example.com/api/ws');

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Response:', data);
});
```

---

## Pagination

List endpoints support cursor-based pagination:

```bash
# First page
curl http://localhost:3000/api/history?limit=20

# Next page (using 'after' parameter)
curl http://localhost:3000/api/history?limit=20&after=LAST_ENTRY_ID
```

---

## Filtering & Searching

Commands endpoint supports filtering:

```bash
# Search by name
curl http://localhost:3000/api/commands?search=status

# Filter by category
curl http://localhost:3000/api/commands?category=system

# Combine filters
curl http://localhost:3000/api/commands?search=restart&category=system
```

---

## Status Codes Summary

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Login first |
| 404 | Not Found | Verify resource exists |
| 429 | Too Many Requests | Wait and retry |
| 500 | Server Error | Check server logs |

---

## Security Notes

- All requests should use HTTPS (automatic on Vercel)
- Session cookies are automatically included (Secure + HttpOnly)
- CSRF protection is automatic via NextAuth
- Rate limiting prevents abuse
- All inputs are validated on server-side

---

## Support

For API issues:
1. Check `TESTING.md` for troubleshooting
2. Review `SECURITY.md` for auth issues
3. Check server logs for detailed errors
4. Open an issue on GitHub
