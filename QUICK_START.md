# MaxBot Controller - Quick Start Guide

**Get running in 5 minutes!**

---

## 1️⃣ Install Dependencies (1 minute)

```bash
cd maxbot-controller
npm install
```

---

## 2️⃣ Start Development (1 minute)

### Option A: All Apps (Recommended)
```bash
npm run dev
```

Then open:
- **Web**: http://localhost:3000
- **Mobile**: Expo QR code in terminal

### Option B: Just Web
```bash
npm run -w apps/web dev
```
Open: http://localhost:3000

### Option C: Just Mobile
```bash
npm run -w apps/mobile dev
```
Scan QR code with Expo Go

---

## 3️⃣ Get Discord Webhook (2 minutes)

### Fastest Way:
1. Create Discord channel: `#bot-controller-center`
2. Right-click channel → Edit → Integrations → Webhooks
3. New Webhook → Copy URL
4. Paste into Web App Settings panel ✅

**That's it!**

---

## 4️⃣ Execute First Command (1 minute)

1. Open http://localhost:3000
2. Paste webhook URL in Settings
3. Click "Commands" tab
4. Select any command (e.g., "System Status")
5. Click Execute ✅
6. Check Discord - message appears! 🎉

---

## 📚 What You Get

```
✅ Full-stack command controller
✅ Fallout Pip-Boy aesthetic
✅ Web (Next.js) + Mobile (Expo) apps
✅ 17+ pre-configured commands
✅ Discord integration
✅ History & Favorites
✅ CI/CD pipelines ready
```

---

## 🎯 Common Tasks

### Build for Production
```bash
npm run build
```

### Type Check Everything
```bash
npm run type-check
```

### Format Code
```bash
npm run format
```

### Lint Code
```bash
npm run lint
```

### Deploy Web to Vercel
```bash
# After connecting Vercel
git push  # Auto-deploys main branch
```

### Build Mobile APK
```bash
cd apps/mobile
eas build --platform android --local
# (requires Android SDK)
```

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Full overview & setup |
| `ARCHITECTURE.md` | System design & structure |
| `EXTENDING.md` | Adding features & customization |
| `DISCORD_SETUP.md` | Discord webhook & bot setup |
| `GITHUB_SETUP.md` | Repository configuration |
| `DEPLOYMENT_CHECKLIST.md` | Pre-launch verification |
| `QUICK_START.md` | This file! |

---

## 🚀 Next Steps

1. ✅ **Read**: `DISCORD_SETUP.md` (Discord integration)
2. ✅ **Explore**: `EXTENDING.md` (Add custom commands)
3. ✅ **Deploy**: `GITHUB_SETUP.md` + `DEPLOYMENT_CHECKLIST.md`

---

## 🔧 Troubleshooting

**Port 3000 already in use?**
```bash
npm run -w apps/web dev -- -p 3001
```

**Expo app not loading?**
```bash
npm run -w apps/mobile dev -- --clear
```

**Type errors?**
```bash
npm run type-check
```

**Build failing?**
```bash
npm run clean
npm install
npm run build
```

---

## 💾 Project Structure

```
maxbot-controller/
├── apps/
│   ├── web/          ← Next.js (http://localhost:3000)
│   └── mobile/       ← Expo (scan QR code)
├── packages/
│   ├── ui/           ← Shared components
│   ├── commands/     ← 17+ commands (edit commands.json)
│   └── config/       ← Theme, colors, constants
└── docs/             ← You are here!
```

---

## 🎨 Customization

### Change Theme Colors
Edit `packages/config/src/index.ts`:
```typescript
PRIMARY_GREEN: '#00FF41'  // Change to your color
```

### Add a Command
Edit `packages/commands/src/commands.json`:
```json
{
  "id": "my_command",
  "name": "My Command",
  "description": "Does something awesome",
  "category": "custom",
  "parameters": []
}
```

### Add Discord Webhook
1. Web: Paste URL in Settings panel
2. Mobile: Settings tab → Input webhook URL

---

## 📱 Mobile vs Web

| Feature | Web | Mobile |
|---------|-----|--------|
| Execute commands | ✅ | ✅ |
| History | ✅ | ✅ |
| Favorites | ✅ | ✅ |
| Settings | ✅ | ✅ |
| Real-time polling | ✅ | ⏳ |
| Offline access | ❌ | ⏳ |

---

## 🔐 Security

- Discord webhook URL: User input (never in code)
- Bot token: SecureStore on mobile, env vars in CI/CD
- No passwords stored
- All credentials via input/env

---

## 💡 Pro Tips

1. **Quick Search**: Ctrl+F in Commands tab to filter
2. **Favorites**: ⭐ button on command cards
3. **History**: Click history entries to see details
4. **Multiple Servers**: Use different webhooks
5. **Dangerous Commands**: Marked with ⚠️ badge

---

## 📊 Quick Stats

- **Lines of Code**: ~6,500 (production ready)
- **Commands**: 17+ pre-configured
- **Packages**: 3 shared (UI, commands, config)
- **Apps**: 2 (Web, Mobile)
- **Documentation**: ~2,000 lines

---

## 🎁 Included

- ✅ TypeScript throughout
- ✅ Monorepo setup (Turbo)
- ✅ Shared components
- ✅ Fallout Pip-Boy theme
- ✅ GitHub Actions CI/CD
- ✅ Vercel deployment ready
- ✅ Expo mobile app
- ✅ Comprehensive docs
- ✅ Examples & templates

---

## 🤔 FAQ

**Q: Can I run on macOS/Windows/Linux?**
A: Yes! Node.js 18+ works on all platforms.

**Q: Do I need a Discord bot?**
A: No, only webhook needed. Bot token is optional (for polling responses).

**Q: Can I deploy to my own server?**
A: Yes! It's a standard Node.js + Next.js app.

**Q: How do I add more commands?**
A: Edit `packages/commands/src/commands.json` and restart.

**Q: Can I customize the Pip-Boy theme?**
A: Yes! Edit colors in `packages/config/src/index.ts`.

**Q: Is it production-ready?**
A: Yes! Full TypeScript, error handling, security considerations.

---

## 🆘 Need Help?

1. **Setup**: Read `README.md`
2. **Design**: Read `ARCHITECTURE.md`
3. **Customize**: Read `EXTENDING.md`
4. **Discord**: Read `DISCORD_SETUP.md`
5. **Deploy**: Read `DEPLOYMENT_CHECKLIST.md`

---

## 🎯 Success Criteria

You've got this working when:
- ✅ Web app loads (http://localhost:3000)
- ✅ Mobile app loads (scan QR)
- ✅ Discord webhook URL saved
- ✅ Command executes (appears in Discord)
- ✅ History shows execution

**That's everything!**

---

**Happy commanding!** 🚀

For detailed guides, see other documentation files.
