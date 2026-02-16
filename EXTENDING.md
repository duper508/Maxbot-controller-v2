# Extending MaxBot Controller

This guide explains how to customize, extend, and integrate MaxBot Controller.

## Table of Contents

1. [Adding Commands](#adding-commands)
2. [Customizing Theme](#customizing-theme)
3. [Creating Custom Components](#creating-custom-components)
4. [Adding New Features](#adding-new-features)
5. [Discord Integration](#discord-integration)
6. [Mobile Customization](#mobile-customization)
7. [Deployment Customization](#deployment-customization)

---

## Adding Commands

### Basic Command

Edit `packages/commands/src/commands.json`:

```json
{
  "id": "my_awesome_command",
  "name": "My Awesome Command",
  "description": "Does something awesome",
  "category": "custom",
  "icon": "🚀",
  "parameters": [],
  "timeout": 5000
}
```

Command automatically available in CommandManager:

```typescript
import { commandManager } from '@repo/commands';

const cmd = commandManager.getCommand('my_awesome_command');
```

### Command with Parameters

```json
{
  "id": "deploy_service",
  "name": "Deploy Service",
  "description": "Deploy a service to production",
  "category": "deployment",
  "icon": "🚀",
  "parameters": [
    {
      "id": "service_name",
      "name": "Service Name",
      "type": "string",
      "description": "Name of service to deploy",
      "required": true,
      "placeholder": "my-service"
    },
    {
      "id": "environment",
      "name": "Environment",
      "type": "select",
      "description": "Target environment",
      "required": true,
      "options": ["staging", "production"]
    },
    {
      "id": "skip_tests",
      "name": "Skip tests",
      "type": "boolean",
      "description": "Skip running tests before deploy",
      "required": false,
      "default": false
    },
    {
      "id": "max_retries",
      "name": "Max retries",
      "type": "number",
      "description": "Number of retries on failure",
      "required": false,
      "default": 3
    }
  ],
  "timeout": 30000,
  "requiresConfirmation": true,
  "dangerous": true
}
```

### Parameter Types

```typescript
// string - text input
"type": "string"
"placeholder": "example value"

// number - numeric input
"type": "number"
"default": 42

// boolean - checkbox/toggle
"type": "boolean"
"default": false

// select - dropdown
"type": "select"
"options": ["option1", "option2", "option3"]
```

### Dangerous Commands

Commands affecting system state:

```json
{
  "dangerous": true,
  "requiresConfirmation": true
}
```

These show:
- Red "DANGEROUS" badge
- Confirmation dialog before execution
- Can't execute without explicit user action

### Custom Categories

Create new category by setting `category` field:

```json
"category": "my_category"
```

Update category descriptions in `packages/commands/src/index.ts`:

```typescript
private getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    // ... existing
    my_category: "My custom category description",
  };
  return descriptions[category] || 'Commands';
}
```

---

## Customizing Theme

### Global Theme

Edit `packages/config/src/index.ts`:

```typescript
export const THEME = {
  PRIMARY_GREEN: '#00FF41',      // Main Pip-Boy green
  DARK_BG: '#001A00',             // Background
  BORDER_COLOR: '#003300',        // Borders
  TEXT_COLOR: '#00FF41',          // Text
  ACCENT_GREEN: '#00DD00',        // Accent
  MUTED_TEXT: '#00AA00',          // Muted text
  ERROR_RED: '#FF0000',           // Errors
  SUCCESS_GREEN: '#00FF41',       // Success
} as const;

// Example: Neon blue variant
export const THEME_BLUE = {
  PRIMARY_GREEN: '#00FFFF',
  DARK_BG: '#000015',
  // ...
};
```

### Component Styling

Use theme in components:

```typescript
import { THEME } from '@repo/config';

const MyComponent = () => (
  <div style={{
    backgroundColor: THEME.DARK_BG,
    color: THEME.PRIMARY_GREEN,
    borderColor: THEME.BORDER_COLOR,
  }}>
    Content
  </div>
);
```

### CRT Effects

Customize in `packages/ui/src/theme.ts`:

```typescript
export const pipboyTheme = {
  effects: {
    // Horizontal scanlines
    scanlines: `
      background-image: linear-gradient(...);
      background-size: 100% 4px;
    `,
    
    // Text glow
    crt: `
      text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
    `,
    
    // Border glow
    glow: `
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
    `,
  },
};
```

Use effects:

```typescript
const { scanlines } = pipboyTheme.effects;

<div style={{ ...scanlines }}>Content</div>
```

### Typography

Update `packages/config/src/index.ts`:

```typescript
export const TYPOGRAPHY = {
  FONT_FAMILY: "'Courier New', 'OCR-A', monospace",
  FONT_SIZE_SMALL: '12px',
  FONT_SIZE_BASE: '14px',
  FONT_SIZE_LARGE: '16px',
  FONT_SIZE_TITLE: '20px',
  LETTER_SPACING: '0.05em',
  LINE_HEIGHT: '1.6',
} as const;
```

---

## Creating Custom Components

### Shared UI Component

Create in `packages/ui/src/components/MyComponent.tsx`:

```typescript
import React from 'react';
import { THEME, SPACING } from '@repo/config';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <div
      style={{
        backgroundColor: THEME.DARK_BG,
        borderColor: THEME.BORDER_COLOR,
        borderWidth: 2,
        padding: SPACING.MD,
        borderRadius: 4,
      }}
    >
      <h2 style={{ color: THEME.PRIMARY_GREEN, margin: 0 }}>{title}</h2>
      {children}
    </div>
  );
};
```

Export from `packages/ui/src/index.ts`:

```typescript
export { MyComponent } from './components/MyComponent';
```

Use in apps:

```typescript
import { MyComponent } from '@repo/ui';

<MyComponent title="My Title">
  <p>Content</p>
</MyComponent>
```

### Web-only Component

Create in `apps/web/src/components/MyWebComponent.tsx`:

```typescript
import React from 'react';
import { pipboyTheme } from '@repo/ui';

export const MyWebComponent: React.FC = () => {
  return (
    <div
      style={{
        ...pipboyTheme.effects.glow,
        backgroundColor: pipboyTheme.colors.background,
      }}
    >
      Web-only component
    </div>
  );
};
```

### Mobile-only Component

Create in `apps/mobile/src/components/MyMobileComponent.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, SPACING } from '@repo/config';

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.DARK_BG,
    borderColor: THEME.BORDER_COLOR,
    borderWidth: 2,
    padding: SPACING.MD,
  },
});

export const MyMobileComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={{ color: THEME.PRIMARY_GREEN }}>
        Mobile-only component
      </Text>
    </View>
  );
};
```

---

## Adding New Features

### Command Execution Flow

To customize how commands are executed, edit `apps/web/src/pages/index.tsx`:

```typescript
const handleExecute = async () => {
  // Before execution
  console.log('Executing command:', selectedCmd?.command.name);
  
  // Call API
  const response = await fetch('/api/execute', {
    method: 'POST',
    body: JSON.stringify({
      commandId: selectedCmd.command.id,
      parameters: selectedCmd.parameters,
      webhookUrl,
    }),
  });
  
  // After execution
  const data = await response.json();
  
  // Save to history
  if (storageManager) {
    storageManager.saveHistory({
      // Custom history entry
    });
  }
};
```

### Custom API Endpoint

Create `apps/web/src/pages/api/custom.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Your custom logic
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

Call from component:

```typescript
const response = await fetch('/api/custom', {
  method: 'POST',
  body: JSON.stringify({ /* data */ }),
});
```

### State Management

Current setup uses React hooks. For more complex state, add Zustand:

```bash
npm install zustand
```

Create store:

```typescript
// apps/web/src/store/commandStore.ts
import { create } from 'zustand';

interface CommandState {
  selectedCommand: Command | null;
  setSelectedCommand: (cmd: Command | null) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  selectedCommand: null,
  setSelectedCommand: (cmd) => set({ selectedCommand: cmd }),
}));
```

Use in component:

```typescript
const selectedCommand = useCommandStore((state) => state.selectedCommand);
```

---

## Discord Integration

### Webhook Customization

Edit `apps/web/src/lib/discord.ts`:

```typescript
export function formatCommandEmbed(
  commandName: string,
  commandId: string,
  parameters: Record<string, unknown>
): DiscordWebhookPayload {
  return {
    embeds: [
      {
        title: `🎮 ${commandName}`,
        // Customize embed fields
        fields: [
          {
            name: 'Command ID',
            value: commandId,
            inline: true,
          },
          // Add more fields
        ],
      },
    ],
  };
}
```

### Polling for Responses

Implement in `apps/web/src/pages/index.tsx`:

```typescript
const pollForResponse = async (requestId: string) => {
  const maxAttempts = 30;
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;
    
    // Fetch messages from Discord
    const messages = await fetchDiscordMessages(
      botToken,
      channelId,
      { limit: 10 }
    );

    // Look for response message
    const response = messages.find(msg => 
      msg.content.includes(requestId)
    );

    if (response) {
      clearInterval(interval);
      setOutput(response.content);
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      setOutput('TIMEOUT: No response received');
    }
  }, 2000);
};
```

### Bot Command Parsing

In your ClawdBot system, parse webhook messages:

```javascript
// Your ClawdBot implementation
client.on('message', (msg) => {
  // Parse embed
  const embed = msg.embeds[0];
  const commandId = embed.description.match(/`(\w+)`/)[1];
  const parameters = parseEmbedFields(embed.fields);
  
  // Execute command
  executeCommand(commandId, parameters)
    .then(result => {
      msg.reply({ embeds: [resultEmbed] });
    });
});
```

---

## Mobile Customization

### Adding New Screen

1. Create `apps/mobile/src/screens/MyScreen.tsx`
2. Add to Tab.Navigator in `App.tsx`:

```typescript
<Tab.Screen
  name="MyFeature"
  component={MyScreen}
  options={{
    title: '🎯 MY FEATURE',
    tabBarLabel: 'My Feature',
    tabBarIcon: ({ color }) => <View style={{ width: 24, height: 24, backgroundColor: color }} />,
  }}
/>
```

### Navigation

Use React Navigation:

```typescript
import { useNavigation } from '@react-navigation/native';

export const MyComponent = () => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
      <Text>Go to Settings</Text>
    </TouchableOpacity>
  );
};
```

### Secure Storage

Store sensitive data:

```typescript
import * as SecureStore from 'expo-secure-store';

// Save
await SecureStore.setItemAsync('key', 'value');

// Retrieve
const value = await SecureStore.getItemAsync('key');

// Delete
await SecureStore.deleteItemAsync('key');
```

### Push Notifications

Add expo-notifications:

```bash
npm install expo-notifications
```

Configure in `app.json`:

```json
{
  "plugins": [
    "expo-notifications"
  ]
}
```

---

## Deployment Customization

### Vercel Environment

Add variables in `vercel.json` or Vercel dashboard:

```json
{
  "env": {
    "NEXT_PUBLIC_DISCORD_WEBHOOK_BASE": "@discord_webhook_base",
    "NEXT_PUBLIC_API_BASE": "@api_base"
  }
}
```

Or environment-specific:

```json
{
  "env": {
    "NEXT_PUBLIC_DISCORD_WEBHOOK_BASE": {
      "production": "@discord_webhook_prod",
      "preview": "@discord_webhook_dev"
    }
  }
}
```

### GitHub Actions Customization

Edit `.github/workflows/*.yml`:

```yaml
- name: Custom Build Step
  run: |
    npm run custom-script
    echo "Build complete"
  env:
    MY_CUSTOM_VAR: ${{ secrets.MY_CUSTOM_VAR }}
```

Add secrets in GitHub Settings → Secrets and variables → Actions

### EAS Build Customization

Edit `apps/mobile/eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "versionCode": 1
      },
      "env": {
        "CUSTOM_VAR": "value"
      }
    }
  }
}
```

### Custom Domain

Deploy web to custom domain:

1. Set up domain DNS
2. In Vercel dashboard: Settings → Domains
3. Add domain and configure DNS

---

## Best Practices

### ✅ Do's

- Use TypeScript for type safety
- Keep components reusable
- Store sensitive data securely (SecureStore on mobile)
- Use theme constants instead of hardcoding colors
- Test with both web and mobile apps
- Document custom features
- Use proper error handling

### ❌ Don'ts

- Don't hardcode Discord credentials
- Don't store sensitive data in localStorage (web)
- Don't modify root tsconfig.json without updating app configs
- Don't add dependencies to shared packages unnecessarily
- Don't skip type checking before committing
- Don't commit .env files

---

## Examples

### Example: Custom Command Category

1. Add commands with new category:
```json
{ "id": "docker_logs", "category": "docker", ... }
```

2. Update category description:
```typescript
docker: "Docker & containerization commands",
```

3. Add category icon:
```typescript
docker: "🐳",
```

### Example: Theme Variant

Create alternate theme in `packages/config/src/index.ts`:

```typescript
export const THEME_CYBERPUNK = {
  PRIMARY_GREEN: '#FF00FF',
  DARK_BG: '#0A0A1F',
  BORDER_COLOR: '#FF00FF',
  // ...
};
```

Use in component:

```typescript
import { THEME_CYBERPUNK } from '@repo/config';

<div style={{ color: THEME_CYBERPUNK.PRIMARY_GREEN }} />
```

### Example: Persistent Polling

Implement continuous polling in mobile app:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await checkDiscordForUpdates();
    if (response) {
      updateHistory(response);
    }
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

---

## Getting Help

- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [README.md](README.md) for setup
- Review source code examples in `apps/` and `packages/`
- GitHub Issues for bug reports
