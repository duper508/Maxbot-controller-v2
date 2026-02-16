# GitHub Repository Setup

Instructions for creating and configuring the GitHub repository.

## Step 1: Create Repository

1. Go to [GitHub.com](https://github.com/duper508)
2. Click "New" (or go to https://github.com/new)
3. Fill in:
   - **Owner**: duper508 (should be auto-selected)
   - **Repository name**: `maxbot-controller`
   - **Description**: "Fallout Pip-Boy themed ClawdBot command controller"
   - **Visibility**: Public
   - **Initialize**: No (we have code ready)

4. Click "Create repository"

## Step 2: Push Code

```bash
# From your local maxbot-controller directory
cd /home/duper/clawd/maxbot-controller

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/duper508/maxbot-controller.git

# Create main branch
git branch -M main

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Complete MaxBot Controller monorepo"

# Push to GitHub
git push -u origin main
```

## Step 3: Configure Repository Settings

### Branch Protection (Optional but Recommended)

1. Go to Settings → Branches
2. Click "Add rule"
3. Pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Dismiss stale pull request approvals
   - ✅ Require branches to be up to date before merging

### Actions Permissions

1. Go to Settings → Actions → General
2. Enable GitHub Actions
3. Allow all actions and reusable workflows

### Secrets Setup (For CI/CD)

If deploying to Vercel or using EAS Build, add secrets:

1. Go to Settings → Secrets and variables → Actions
2. Add new repository secrets:

#### For Vercel Deployment (Web)
```
VERCEL_TOKEN          # Your Vercel API token
VERCEL_ORG_ID         # Your Vercel organization ID
VERCEL_PROJECT_ID     # Your MaxBot Controller project ID
```

Get these from:
- `VERCEL_TOKEN`: https://vercel.com/account/tokens
- `VERCEL_ORG_ID` & `VERCEL_PROJECT_ID`: Vercel dashboard

#### For EAS Build (Mobile APK)
```
EXPO_TOKEN            # Your Expo API token
```

Get this from:
- `EXPO_TOKEN`: https://expo.dev/settings/tokens

## Step 4: Verify GitHub Actions

1. Go to Actions tab
2. You should see workflows:
   - `CI` - Runs on all pushes/PRs
   - `Build APK` - Builds mobile app
   - `Deploy Web` - Deploys to Vercel

3. Push a test commit to trigger workflows:
```bash
git commit --allow-empty -m "test: trigger workflows"
git push
```

4. Watch Actions tab for workflow runs

## Step 5: Update Repository Description

1. Go to repository main page
2. Click "About" (gear icon on right)
3. Edit:
   - **Description**: "Fallout Pip-Boy themed ClawdBot command controller"
   - **Website**: (leave blank or add if you deploy to custom domain)
   - **Topics**: Add `discord`, `bot`, `terminal`, `fallout`, `pip-boy`
   - **Include in the home page**: Yes

## Optional: Add License

1. Click "Add file" → "Create new file"
2. Name it `LICENSE`
3. Choose license type (MIT recommended)
4. Commit

## Optional: Add Code of Conduct

1. Click "Settings" → "Community"
2. Click "Add" next to "Code of conduct"
3. Choose Contributor Covenant
4. Commit

---

## GitHub Workflow Overview

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to main/develop, all PRs

**Steps**:
1. Checkout code
2. Setup Node.js 18.x and 20.x
3. Install dependencies
4. Type check (TypeScript)
5. Lint (ESLint)
6. Build all packages
7. Run tests
8. Security scan (npm audit, Trivy)

**Status**: Check Actions tab for pass/fail

### Build APK Workflow (`.github/workflows/build-apk.yml`)

**Triggers**: Push to main/develop, manual trigger

**Steps**:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build packages
5. Lint & type check
6. Build Android APK (requires EXPO_TOKEN)
7. Upload artifacts

**Note**: Requires `EXPO_TOKEN` secret configured

### Deploy Web Workflow (`.github/workflows/deploy-web.yml`)

**Triggers**: Push to main only

**Steps**:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build all packages
5. Deploy to Vercel (requires secrets)

**Note**: Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Troubleshooting

### Actions Not Running

Check:
1. GitHub Actions enabled in Settings
2. Workflow files in `.github/workflows/` are valid YAML
3. No syntax errors in workflow files

### Build Failures

Common causes:
1. Node.js version mismatch (use 18.x or 20.x)
2. Missing dependencies (run `npm install`)
3. Type errors (run `npm run type-check`)
4. Lint errors (run `npm run lint`)

### Deployment Secrets Not Found

1. Go to Settings → Secrets and variables → Actions
2. Verify secret names match workflow file
3. Secrets are case-sensitive
4. Don't quote values in secrets (GitHub adds them)

---

## Useful GitHub URLs

For your repository `duper508/maxbot-controller`:

- **Main Page**: https://github.com/duper508/maxbot-controller
- **Settings**: https://github.com/duper508/maxbot-controller/settings
- **Actions**: https://github.com/duper508/maxbot-controller/actions
- **Secrets**: https://github.com/duper508/maxbot-controller/settings/secrets/actions
- **Branches**: https://github.com/duper508/maxbot-controller/settings/branches
- **Issues**: https://github.com/duper508/maxbot-controller/issues
- **Releases**: https://github.com/duper508/maxbot-controller/releases

---

## Next Steps

1. ✅ Create repository
2. ✅ Push code
3. ✅ Configure branch protection
4. ✅ Add deployment secrets (if using)
5. 📋 Create Discord webhook and bot (see `DISCORD_SETUP.md`)
6. 📋 Configure Vercel project (if deploying web)
7. 📋 Configure EAS Build (if building APK via GitHub)

---

## Environment Files

**Do NOT commit:**
- `.env`
- `.env.local`
- `.env.*.local`
- Any files with credentials

**Use instead:**
- GitHub Secrets for CI/CD
- Environment variables in Vercel dashboard
- App configuration (Settings tab in mobile)

---

## Pull Request Template (Optional)

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactor
- [ ] Dependency update

## Related Issue
Closes #(issue number)

## Testing
Steps to test changes

## Checklist
- [ ] Code compiles (`npm run build`)
- [ ] Types check (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
```

Save as `.github/pull_request_template.md` and commit to repo.

---

## Issue Templates (Optional)

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug
---

## Description
Clear description of the bug

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: 
- Node version:
- App version:

## Screenshots
(if applicable)
```

---

All set! Your GitHub repository is ready for collaboration.
