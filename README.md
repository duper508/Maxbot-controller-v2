<!-- markdownlint-disable MD033 -->

# 🎮 MaxBot Controller

A Fallout Pip-Boy themed command control interface for ClawdBot. Execute commands through Discord with a retro-futuristic terminal aesthetic.

<div style="background-color: #001A00; border: 2px solid #00FF41; padding: 12px; border-radius: 4px; font-family: monospace; color: #00FF41; margin-bottom: 16px;">
  <pre>████████████████████████████████████████
█ ⚙️  CLAWDBOT CONTROLLER v1.0.0         █
█ FALLOUT PIP-BOY COMMAND INTERFACE     █
█ Discord Integrated • Multi-Platform   █
████████████████████████████████████████</pre>
</div>

## Features

✅ **Multi-Platform**
- Web UI (Next.js + Pip-Boy theme)
- Mobile app (Expo React Native)
- Responsive design with CRT effects

✅ **Discord Integration**
- Send commands via webhook
- Poll for responses using bot token
- Embedded message formatting
- Secure token storage (mobile)

✅ **Command Management**
- 17+ pre-configured commands
- Favorites system
- Execution history (100+ entries)
- Search and filter

✅ **Fallout Aesthetic**
- Authentic Pip-Boy green (#00FF41)
- Monospace typography
- Scanline CRT effects
- Glowing text shadows
- Retro terminal UI

✅ **Developer Friendly**
- TypeScript throughout
- Monorepo with Turbo
- Shared components & types
- Proper error handling
- Comprehensive documentation

## Quick Start

### Prerequisites

- Node.js 18+ & npm 9+
- Git
- Discord bot token (for polling responses)
- Discord webhook URL (for sending commands)

### Installation

```bash
# Clone the repository
git clone https://github.com/duper508/maxbot-controller.git
cd maxbot-controller

# Install dependencies (monorepo setup)
npm install

# Install Turbo globally (optional, for faster builds)
npm install -g turbo
```

### Development

```bash
# Start all apps in development mode
npm run dev

# Start specific app
npm run -w apps/web dev
npm run -w apps/mobile dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build everything
npm run build
```

### Environment Setup

Create a `.env.local` file in `apps/web`:

```bash
# Discord webhook for sending commands
NEXT_PUBLIC_DISCORD_WEBHOOK_BASE=https://discord.com/api/webhooks
```

For mobile, configure in Settings tab:
- Discord Webhook URL
- Discord Bot Token (for polling)

## Architecture

```
maxbot-controller/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/pages/
│   │   │   ├── index.tsx      # Dashboard
│   │   │   └── api/
│   │   │       └── execute.ts # Command execution API
│   │   └── src/lib/
│   │       ├── discord.ts     # Discord integration
│   │       └── storage.ts     # LocalStorage utilities
│   └── mobile/                 # Expo React Native app
│       ├── src/screens/
│       │   ├── CommandsScreen.tsx
│       │   ├── HistoryScreen.tsx
│       │   └── SettingsScreen.tsx
│       └── eas.json           # EAS Build configuration
├── packages/
│   ├── commands/              # Command definitions & manager
│   │   ├── src/commands.json  # 17+ command definitions
│   │   ├── src/types.ts       # Command types
│   │   └── src/index.ts       # CommandManager class
│   ├── config/                # Shared configuration
│   │   └── src/index.ts       # Theme, colors, storage keys
│   └── ui/                    # Shared UI components
│       ├── src/components/
│       │   ├── Button.tsx
│       │   ├── TerminalDisplay.tsx
│       │   └── CommandCard.tsx
│       └── src/theme.ts       # Pip-Boy theme
├── .github/workflows/         # CI/CD pipelines
│   ├── ci.yml                # Build & test
│   ├── build-apk.yml         # Mobile builds
│   └── deploy-web.yml        # Vercel deployment
├── package.json              # Root workspace
├── turbo.json                # Turbo build config
└── tsconfig.json             # TypeScript base config
```

### Monorepo Benefits

- **Shared packages**: UI components, commands, and config shared across apps
- **Single dependency tree**: Unified Node modules
- **Turbo caching**: Fast rebuilds
- **Path aliases**: Easy imports with `@repo/*`

## Commands

Pre-configured commands include:

### System (⚙️)
- `sys_status` - System status & resources
- `sys_restart` - Restart system (⚠️ dangerous)
- `sys_logs` - Retrieve system logs

### Network (🌐)
- `net_ping` - Ping host
- `net_trace` - Trace route
- `net_dns` - DNS lookup

### Processes (⚡)
- `proc_list` - List running processes
- `proc_kill` - Kill process (⚠️ dangerous)
- `proc_monitor` - Monitor process

### Storage (💾)
- `disk_usage` - Check disk usage
- `disk_cleanup` - Clean temp files

### Development (🔀)
- `git_status` - Git repository status
- `git_pull` - Pull latest changes

### Containers (🐳)
- `docker_ps` - List containers
- `docker_restart` - Restart container

### Other
- `env_show` - Show environment variables
- `perf_benchmark` - Performance benchmark

See `packages/commands/src/commands.json` for full definitions.

## Discord Integration

### Setting Up Webhook

1. Go to your Discord server's channel settings
2. Create a webhook in #bot-controller-center (or your channel)
3. Copy the webhook URL
4. Paste in Web UI or mobile Settings

### Bot Token (For Polling)

1. Create a Discord bot in Developer Portal
2. Copy the bot token
3. Add bot to your server
4. Configure in app Settings

### How It Works

```
User executes command in UI
    ↓
Command sent via webhook to Discord
    ↓
Bot picks up command in channel
    ↓
ClawdBot executes on system
    ↓
Response posted to Discord
    ↓
UI polls channel for response
    ↓
Result displayed in terminal
```

## Web Deployment

### Vercel Deployment

1. Create Vercel account and project
2. Connect GitHub repository
3. Set environment variables:
   - `NEXT_PUBLIC_DISCORD_WEBHOOK_BASE`
4. Deploy (automatic on push to main)

Or manually:

```bash
cd apps/web
npm run build
npm run start
```

### GitHub Actions

Deploy workflow runs on push to main. Requires:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Mobile Deployment

### Local APK Build

```bash
# Requires Android SDK & Java
cd apps/mobile
npm run build:apk
```

### EAS Build (Cloud)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build
eas build --platform android
eas build --platform ios
```

Requires `EXPO_TOKEN` environment variable.

### GitHub Actions APK Build

Workflow file: `.github/workflows/build-apk.yml`

Requires:
- `EXPO_TOKEN` (GitHub secret)
- EAS project configured

## Development

### Adding a New Command

1. Add to `packages/commands/src/commands.json`:

```json
{
  "id": "my_command",
  "name": "My Command",
  "description": "Does something cool",
  "category": "system",
  "icon": "🎯",
  "parameters": [
    {
      "id": "param1",
      "name": "Parameter",
      "type": "string",
      "description": "A parameter",
      "required": true
    }
  ],
  "timeout": 5000
}
```

2. Command automatically available in CommandManager
3. UI automatically shows parameters

### Adding a UI Component

1. Create in `packages/ui/src/components/MyComponent.tsx`
2. Export from `packages/ui/src/index.ts`
3. Use in either app:

```typescript
import { MyComponent } from '@repo/ui';
```

### Styling

Components use inline styles with Pip-Boy theme:

```typescript
import { pipboyTheme } from '@repo/ui';

<div style={{
  backgroundColor: pipboyTheme.colors.background,
  color: pipboyTheme.colors.primary,
  fontFamily: pipboyTheme.typography.FONT_FAMILY,
}}>
```

## Testing

```bash
# Type check all packages
npm run type-check

# Lint all code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Environment Variables

### Web App

```env
# .env.local or GitHub secrets
NEXT_PUBLIC_DISCORD_WEBHOOK_BASE=https://discord.com/api/webhooks
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

### Mobile App

Configured in app Settings tab (secure storage):
- Discord Webhook URL
- Discord Bot Token

### CI/CD

```env
# GitHub Secrets
VERCEL_TOKEN=vercel_token_here
VERCEL_ORG_ID=org_id_here
VERCEL_PROJECT_ID=project_id_here
EXPO_TOKEN=expo_token_here
```

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Module not found errors

Check `tsconfig.json` paths and `packages/*/package.json` exports

### Discord webhook not working

- Verify webhook URL is correct and recent
- Check bot permissions in channel
- Ensure webhook hasn't expired (can happen after app restarts)

### Mobile app not starting

```bash
# Clear Expo cache
rm -rf apps/mobile/.expo
npm run -w apps/mobile dev
```

## Security Notes

⚠️ **Never commit credentials**
- Use `.gitignore` for `.env` files
- Use GitHub Secrets for CI/CD
- Use secure storage on mobile

⚠️ **Be careful with dangerous commands**
- Commands marked as dangerous require confirmation
- Some commands require elevated permissions

⚠️ **Discord token security**
- Don't share your bot token
- Rotate regularly
- Use separate bot for testing

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with TypeScript
3. Run type-check & lint: `npm run type-check && npm run lint`
4. Commit: `git commit -am 'feat: description'`
5. Push: `git push origin feature/my-feature`
6. Open PR

## License

MIT - See LICENSE file

## Support

- 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design
- 🔧 See [EXTENDING.md](EXTENDING.md) for customization
- 🐛 File issues on GitHub

---

<div style="text-align: center; color: #00FF41; font-family: monospace; margin-top: 32px;">
  <pre>
████████████████████████████████████
█  CLAWDBOT CONTROLLER  █ v1.0.0  █
█  Discord Integrated   █         █
█  Pip-Boy UI Theme     █ ✓       █
████████████████████████████████████
  </pre>
</div>
