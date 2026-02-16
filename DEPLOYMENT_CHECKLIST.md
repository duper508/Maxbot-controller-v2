# MaxBot Controller - Deployment Checklist

Complete this checklist to go from development to production.

---

## Phase 1: Local Verification ✅

- [ ] Clone/navigate to repository directory
- [ ] Run `npm install`
- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (no errors)
- [ ] Test web app locally:
  - [ ] `npm run -w apps/web dev`
  - [ ] Open http://localhost:3000
  - [ ] Dashboard loads
  - [ ] Can search commands
  - [ ] Can select a command
- [ ] Test mobile app locally:
  - [ ] `npm run -w apps/mobile dev`
  - [ ] Open in Expo Go app
  - [ ] All three screens load

---

## Phase 2: GitHub Setup 📚

- [ ] Create public repository: `maxbot-controller` under `duper508`
- [ ] Push code to GitHub (see `GITHUB_SETUP.md`)
- [ ] Verify all workflows in `.github/workflows/` are present:
  - [ ] `ci.yml`
  - [ ] `build-apk.yml`
  - [ ] `deploy-web.yml`
- [ ] GitHub Actions tab shows successful CI run
- [ ] Repository topics added: discord, bot, terminal, fallout, pip-boy
- [ ] README.md displays correctly on GitHub

---

## Phase 3: Discord Integration Setup 🎮

- [ ] Create Discord webhook (see `DISCORD_SETUP.md`):
  - [ ] Create channel: `#bot-controller-center`
  - [ ] Create webhook in channel
  - [ ] Copy webhook URL
  - [ ] Keep URL secret

- [ ] (Optional) Create Discord bot token:
  - [ ] Create app in Developer Portal
  - [ ] Add bot to app
  - [ ] Enable Message Content Intent
  - [ ] Copy bot token
  - [ ] Add bot to server
  - [ ] Give bot permissions in channel

- [ ] Test webhook manually:
  ```bash
  curl -X POST YOUR_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -d '{"content":"Test message"}'
  ```

---

## Phase 4: Web App Deployment (Vercel) 🌐

### Create Vercel Project

- [ ] Go to https://vercel.com
- [ ] Sign in/create account
- [ ] Click "Add New..." → "Project"
- [ ] Select your GitHub repository
- [ ] Select framework: Next.js
- [ ] Root directory: `apps/web`
- [ ] Build command: `npm run build -- --filter=maxbot-controller-web`
- [ ] Click "Deploy"

### Configure Environment

After initial deploy:
- [ ] Go to project Settings → Environment Variables
- [ ] Add variables:
  - `NEXT_PUBLIC_DISCORD_WEBHOOK_BASE` = `https://discord.com/api/webhooks`
  - `NEXT_PUBLIC_API_BASE` = `https://your-vercel-url/api`
- [ ] Redeploy after adding variables

### Test Web Deployment

- [ ] Open Vercel URL
- [ ] Dashboard loads and renders correctly
- [ ] Pip-Boy theme visible (green text, scanlines)
- [ ] Can search commands
- [ ] Can input webhook URL
- [ ] Can execute a test command
- [ ] Check `#bot-controller-center` Discord channel for webhook message

### Setup Auto-Deploy

- [ ] Go to Settings → Git
- [ ] Verify GitHub integration
- [ ] Push new commit to main
- [ ] Vercel should auto-deploy
- [ ] Check Deployments tab

---

## Phase 5: Mobile App Deployment 📱

### Option A: Local Testing (Easiest)

- [ ] Install Expo Go on phone
- [ ] Run `npm run -w apps/mobile dev`
- [ ] Scan QR code with Expo Go
- [ ] App loads on phone
- [ ] All tabs work
- [ ] Can input Discord credentials
- [ ] Settings saved properly

### Option B: EAS Build (Production APK)

#### Setup

- [ ] Create Expo account at https://expo.dev
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Configure EAS:
  - [ ] `cd apps/mobile`
  - [ ] `eas init`
  - [ ] Follow prompts to create EAS project
- [ ] Add `EXPO_TOKEN` to GitHub secrets

#### Build

- [ ] Test local build:
  ```bash
  cd apps/mobile
  eas build --platform android --local
  ```
  (Requires Android SDK)

- [ ] Or trigger via GitHub Actions:
  - [ ] Push code to GitHub
  - [ ] Manually trigger `build-apk` workflow
  - [ ] Watch Actions for build completion
  - [ ] Download APK from artifacts

#### Distribute

- [ ] Test APK on Android device
- [ ] (Optional) Upload to Google Play Console:
  - [ ] Create developer account
  - [ ] Create app listing
  - [ ] Upload APK
  - [ ] Submit for review

---

## Phase 6: CI/CD Verification ✅

### GitHub Actions Workflows

- [ ] Push test commit to main
- [ ] Watch Actions tab
- [ ] CI workflow completes successfully:
  - [ ] ✅ Type checking
  - [ ] ✅ Linting
  - [ ] ✅ Build
- [ ] Deploy workflow runs (if secrets configured)
- [ ] Check Vercel for deployment

### Workflow Secrets

If using deployment workflows:

- [ ] VERCEL_TOKEN configured:
  - [ ] Go to Settings → Secrets and variables → Actions
  - [ ] `VERCEL_TOKEN` present
  - [ ] Value matches Vercel token
- [ ] VERCEL_ORG_ID configured
- [ ] VERCEL_PROJECT_ID configured
- [ ] EXPO_TOKEN configured (if building APK)

---

## Phase 7: Integration Testing 🧪

### End-to-End Command Execution

1. **Web App Test**:
   - [ ] Open web app
   - [ ] Input Discord webhook URL
   - [ ] Select a command (e.g., `sys_status`)
   - [ ] Click Execute
   - [ ] Check Discord - message appears
   - [ ] Output shows "AWAITING RESPONSE"
   - [ ] (If bot configured) Poll for response

2. **Mobile App Test**:
   - [ ] Open mobile app
   - [ ] Go to Settings
   - [ ] Input Discord webhook URL
   - [ ] Go back to Commands
   - [ ] Select a command
   - [ ] Check Discord - message appears

3. **History Test**:
   - [ ] Execute a command
   - [ ] Check History tab/screen
   - [ ] Execution appears in history
   - [ ] Can click to see details

4. **Favorites Test**:
   - [ ] Click star on a command
   - [ ] Go to Favorites tab
   - [ ] Command appears
   - [ ] Click star again to remove
   - [ ] Command disappears from favorites

---

## Phase 8: Documentation ✅

- [ ] README.md is complete and accurate
- [ ] ARCHITECTURE.md explains system design
- [ ] EXTENDING.md guides customization
- [ ] DISCORD_SETUP.md explains integration
- [ ] GITHUB_SETUP.md describes repo config
- [ ] All links in documentation work
- [ ] Code examples in docs are correct

---

## Phase 9: Security Audit 🔐

### Credentials

- [ ] No Discord tokens in code
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] All credentials via:
  - [ ] GitHub Secrets (CI/CD)
  - [ ] Environment variables (Vercel)
  - [ ] User input (Web/Mobile UI)
  - [ ] SecureStore (Mobile)

### Dependencies

- [ ] Run `npm audit` - no critical vulnerabilities
- [ ] All dependencies up to date
- [ ] No deprecated packages

### Access Control

- [ ] GitHub repo is public (as intended)
- [ ] Discord webhook has narrow scope
- [ ] Bot token only has necessary permissions
- [ ] API endpoints don't expose secrets

---

## Phase 10: Performance Check ⚡

### Web App

- [ ] Homepage loads in <3 seconds
- [ ] Commands search is responsive
- [ ] Pip-Boy theme renders smoothly
- [ ] No console errors
- [ ] Lighthouse score >80 (optional)

### Mobile App

- [ ] App starts in <5 seconds
- [ ] Tab navigation is smooth
- [ ] No memory leaks
- [ ] Settings persist across sessions

---

## Phase 11: Bug Fixes & Polish 🎨

- [ ] Test with different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (various sizes)
- [ ] Test on different Discord channel types
- [ ] Test with different webhook configurations
- [ ] Verify error messages are helpful
- [ ] Check console for warnings

---

## Phase 12: Go Live! 🚀

- [ ] All previous phases complete
- [ ] Final smoke test on live deployment
- [ ] Create GitHub Release (optional):
  - [ ] Tag: `v1.0.0`
  - [ ] Release notes with features
  - [ ] Upload APK as asset

- [ ] Announce if desired:
  - [ ] Share on Discord
  - [ ] Share on social media
  - [ ] Add to portfolio

---

## Post-Launch Monitoring 📊

- [ ] Monitor GitHub Actions for failures
- [ ] Check Vercel for errors
- [ ] Monitor Discord for webhook issues
- [ ] Gather user feedback
- [ ] Fix bugs as they arise
- [ ] Plan future enhancements

---

## Rollback Plan 🔙

If something breaks:

1. **Web App**: Vercel has automatic rollback
   - [ ] Go to Deployments
   - [ ] Click "Promote to Production" on previous version

2. **Mobile App**: Users have app version
   - [ ] Build and release new version
   - [ ] Document fix in release notes

3. **Code**: GitHub history preserved
   - [ ] Revert commit if needed
   - [ ] Push hotfix
   - [ ] Redeploy

---

## Maintenance Checklist 🛠️

Weekly:
- [ ] Check GitHub for security updates
- [ ] Review action logs for failures

Monthly:
- [ ] Update dependencies: `npm update`
- [ ] Audit for security issues: `npm audit`
- [ ] Review error logs

Quarterly:
- [ ] Plan new features
- [ ] User feedback review
- [ ] Architecture review

---

## Key Links

- **GitHub**: https://github.com/duper508/maxbot-controller
- **Vercel**: https://vercel.com/duper508/maxbot-controller
- **Expo**: https://expo.dev/@duper/maxbot-controller
- **Discord Developer Portal**: https://discord.com/developers/applications

---

## Status Checklist

```
Phase 1: Local Verification       [ ] Not Started [ ] In Progress [ ] Complete
Phase 2: GitHub Setup             [ ] Not Started [ ] In Progress [ ] Complete
Phase 3: Discord Integration      [ ] Not Started [ ] In Progress [ ] Complete
Phase 4: Web Deployment           [ ] Not Started [ ] In Progress [ ] Complete
Phase 5: Mobile Deployment        [ ] Not Started [ ] In Progress [ ] Complete
Phase 6: CI/CD Verification       [ ] Not Started [ ] In Progress [ ] Complete
Phase 7: Integration Testing      [ ] Not Started [ ] In Progress [ ] Complete
Phase 8: Documentation            [ ] Not Started [ ] In Progress [ ] Complete
Phase 9: Security Audit           [ ] Not Started [ ] In Progress [ ] Complete
Phase 10: Performance Check       [ ] Not Started [ ] In Progress [ ] Complete
Phase 11: Bug Fixes & Polish      [ ] Not Started [ ] In Progress [ ] Complete
Phase 12: Go Live!                [ ] Not Started [ ] In Progress [ ] Complete
Post-Launch Monitoring            [ ] Not Started [ ] In Progress [ ] Complete
```

---

Good luck with your deployment! 🎉
