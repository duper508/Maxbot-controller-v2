# Architecture

## Overview

MaxBot Controller is a monorepo project using Turbo for build orchestration. It consists of:

- **2 applications**: Web (Next.js) and Mobile (Expo)
- **3 shared packages**: UI components, commands, and configuration
- **Type-safe**: Full TypeScript throughout
- **Themeable**: Pip-Boy aesthetic applied consistently

## Tech Stack

### Core
- **Runtime**: Node.js 18+
- **Build**: Turbo, TypeScript
- **Package Manager**: npm workspaces

### Web App
- **Framework**: Next.js 14
- **Style**: Inline CSS (Pip-Boy theme)
- **State**: React hooks
- **Storage**: LocalStorage (history, favorites)
- **Deployment**: Vercel

### Mobile App
- **Framework**: Expo 51
- **Language**: React Native
- **Navigation**: React Navigation
- **Storage**: expo-secure-store (encrypted)
- **Build**: EAS or local Android SDK
- **Deployment**: Google Play / TestFlight

### Shared
- **Commands**: JSON-based with TypeScript types
- **Config**: Constants, types, theme
- **UI**: React/React Native compatible components

## Monorepo Structure

```
packages/
├── config/          # Shared constants & types
│   └── src/
│       └── index.ts (THEME, STORAGE, STATUS, etc)
├── commands/        # Command definitions & manager
│   ├── src/
│   │   ├── index.ts (CommandManager class)
│   │   ├── types.ts (Command, CommandGroup types)
│   │   └── commands.json (17+ commands)
│   └── dist/        (built TypeScript)
└── ui/              # Reusable UI components
    ├── src/
    │   ├── components/
    │   │   ├── Button.tsx
    │   │   ├── TerminalDisplay.tsx
    │   │   └── CommandCard.tsx
    │   ├── theme.ts
    │   └── index.ts
    └── dist/        (built TypeScript)

apps/
├── web/             # Next.js web application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx (main dashboard)
│   │   │   ├── _app.tsx
│   │   │   ├── _document.tsx
│   │   │   └── api/
│   │   │       └── execute.ts (webhook sender)
│   │   └── lib/
│   │       ├── discord.ts (webhook & API)
│   │       └── storage.ts (localStorage manager)
│   ├── public/
│   ├── .next/       (built output)
│   ├── next.config.js
│   └── tsconfig.json
└── mobile/          # Expo React Native app
    ├── src/
    │   ├── App.tsx  (main app, tab nav)
    │   ├── screens/
    │   │   ├── CommandsScreen.tsx
    │   │   ├── HistoryScreen.tsx
    │   │   └── SettingsScreen.tsx
    │   └── index.tsx
    ├── app.json     (Expo config)
    ├── eas.json     (EAS build config)
    └── tsconfig.json

root:
├── package.json     (workspace definition)
├── turbo.json       (build orchestration)
├── tsconfig.json    (TypeScript base)
├── .github/
│   └── workflows/
│       ├── ci.yml   (lint, test, build)
│       ├── build-apk.yml (mobile build)
│       └── deploy-web.yml (vercel deploy)
└── README.md, ARCHITECTURE.md, EXTENDING.md
```

## Data Flow

### Command Execution

```
┌─────────────────┐
│   User Input    │  (Web UI or Mobile app)
│  (parameters)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  CommandManager         │  Validate parameters
│  .validateParameters()  │  (types, required, etc)
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  sendToDiscordWebhook()          │  POST to webhook with
│  (web: /api/execute endpoint)    │  command & parameters
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Discord Webhook        │  Webhook receives
│  (user's channel)       │  formatted message
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  ClawdBot System         │  Bot picks up command
│  (on target machine)     │  Executes on system
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Response posted         │  Result in Discord
│  (new message/embed)     │  or DM
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Poll Discord API        │  Web: fetchDiscordMessages()
│  for response            │  Mobile: Manually check
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Display in Terminal     │  TerminalDisplay component
│  Save to history         │  localStorage / secure storage
└──────────────────────────┘
```

### Storage

**Web App** (Browser LocalStorage):
```typescript
// Each in localStorage:
clawdbot:favorites      // ["cmd1", "cmd2"]
clawdbot:history        // [{ id, commandId, status, output, timestamp }]
clawdbot:settings       // { autoRefresh: true, theme: 'dark' }
```

**Mobile App** (expo-secure-store encrypted):
```typescript
// Each in secure storage:
discord_webhook         // Full webhook URL
discord_token          // Bot token for polling
favorites              // Favorite command IDs
history                // Execution history
```

## Component Interaction

### Web App Flow

```
pages/index.tsx (Dashboard)
    ├── imports CommandManager
    ├── imports Button, TerminalDisplay, CommandCard
    ├── manages state: selectedCmd, webhookUrl, history
    │
    ├── Renders:
    │   ├── Header (title, status)
    │   ├── Settings (webhook, token inputs)
    │   ├── Sidebar
    │   │   ├── Search input
    │   │   ├── Tab switcher (commands/history/favorites/settings)
    │   │   └── CommandCard components (maps over filtered)
    │   └── Main panel
    │       ├── Command details (parameters form)
    │       ├── Execute button
    │       └── TerminalDisplay (output)
    │
    └── On execute:
        └── POST /api/execute
            ├── Validates params
            ├── Calls sendToDiscordWebhook()
            └── Returns requestId
                ├── Save to history
                ├── Start polling
                └── Update TerminalDisplay
```

### Mobile App Flow

```
App.tsx (Root navigator)
    └── Tab.Navigator
        ├── CommandsScreen
        │   ├── SearchInput
        │   ├── Maps CommandCard over filtered
        │   └── TouchableOpacity to select
        │
        ├── HistoryScreen
        │   ├── ScrollView of history items
        │   ├── Status badges
        │   └── Timestamps
        │
        └── SettingsScreen
            ├── TextInputs (webhook, token)
            ├── Switches (auto-refresh)
            ├── Save/Clear buttons
            └── SecureStore integration
```

## Type Safety

### Command Types

```typescript
// packages/commands/src/types.ts
interface Command {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  parameters: CommandParameter[];
  timeout?: number;
  requiresConfirmation?: boolean;
  dangerous?: boolean;
}

interface CommandParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  default?: any;
  options?: string[]; // for select type
  placeholder?: string;
}
```

### Config Types

```typescript
// packages/config/src/index.ts
const THEME = { PRIMARY_GREEN: '#00FF41', ... }
const STATUS = { PENDING, EXECUTING, SUCCESS, ERROR, TIMEOUT }
const STORAGE = { HISTORY_MAX_ITEMS: 100, ... }

interface ExecutionResult {
  id: string;
  commandId: string;
  commandName: string;
  status: CommandStatus;
  output?: string;
  error?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface CommandHistoryEntry extends ExecutionResult {
  timestamp: number;
}
```

## Build & Deployment

### Local Development

```bash
# Turbo orchestrates builds
npm run dev                 # All apps
npm run build              # All packages

# Turbo understands dependencies:
apps/web depends on:
  - @repo/ui
  - @repo/commands
  - @repo/config

apps/mobile depends on:
  - @repo/ui
  - @repo/commands
  - @repo/config
```

### CI/CD Pipelines

**build-apk.yml**: On push to main/develop
```
checkout → install → build → type-check → lint → build:apk → upload artifacts
```

**deploy-web.yml**: On push to main
```
checkout → install → build → deploy to Vercel
```

**ci.yml**: On all PRs and pushes
```
checkout → install → type-check → lint → build → test → security scan
```

### Deployment Targets

- **Web**: Vercel (auto-deploy from main)
- **Mobile**: EAS Build (cloud) or local Android SDK
- **Packages**: npm (internal workspaces only)

## Performance Considerations

### Web App
- Next.js pages: Static by default, ISR if needed
- API routes: Serverless functions on Vercel
- Client state: React hooks only (no Redux/Zustand needed)
- Storage: LocalStorage (browser limit ~5-10MB)

### Mobile App
- Expo: Managed service, optimized builds
- Navigation: Bottom tab navigation (native feel)
- Storage: SecureStore for credentials, AsyncStorage for history
- Bundle size: ~25-30MB APK

### Monorepo
- Turbo caching: ~80% faster rebuilds
- TypeScript: Type-checked at build time
- Tree-shaking: Unused code removed
- Workspaces: Faster npm install vs separate repos

## Extensibility

### Adding New Command
1. Add JSON to `commands.json`
2. Automatically picked up by CommandManager
3. UI auto-renders parameter form
4. No code changes needed

### Adding New Screen (Mobile)
1. Create `src/screens/MyScreen.tsx`
2. Add Tab.Screen in App.tsx
3. Import and style with Pip-Boy theme

### Adding New Component
1. Create in `packages/ui/src/components/`
2. Export from index
3. Use in either app via `@repo/ui`

### Customizing Theme
Edit `packages/config/src/index.ts` THEME object or create theme variants in `packages/ui/src/theme.ts`

## Error Handling

### Validation
- CommandManager validates parameters against types
- Discord webhook URL validated before sending
- API returns detailed error messages

### Fallbacks
- Webhook failure: Show error, don't crash
- API polling timeout: Revert to manual check
- LocalStorage full: Oldest history entries pruned
- Missing token: Show configuration reminder

### Logging
- Browser console: Debug info on web
- React Native logs: `npx expo logs` on mobile
- GitHub Actions: Build logs in CI

## Security Architecture

### Credentials
- Web: Never stored (pass via input, use env for webhook base)
- Mobile: SecureStore (encrypted by OS)
- API: No sensitive data passed

### Permissions
- Discord webhook: Specific channel permission
- Bot token: Only for polling (read-only for responses)
- System commands: Require explicit confirmation

### CORS
- Web app makes requests to Discord API
- API endpoint handles webhooks server-side (no CORS issues)
- Mobile: No CORS (native HTTP)

## Future Enhancements

- [ ] WebSocket for real-time responses
- [ ] Command scheduling
- [ ] Multi-server support
- [ ] Execution logs (persistent database)
- [ ] Role-based access control
- [ ] Command groups/categories filtering
- [ ] Dark/light theme toggle
- [ ] Export history as CSV
- [ ] Mobile: iOS app (currently Android)
- [ ] API: REST endpoints for external tools
