# GitHub Deployment Guide

## Initial Repository Setup

### 1. Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the **+** icon → **New repository**
3. Repository settings:
   - **Name**: `spacetime-observatory` (or your preferred name)
   - **Visibility**: Choose **Private** (recommended) or Public
   - **DO NOT** initialize with README (we already have one)
4. Click **Create repository**

### 2. Push Code to GitHub

In your terminal, run these commands from the project directory:

```bash
# Navigate to project directory
cd /Users/turki/Desktop/٥٨٧

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Spacetime Observatory"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO with your actual GitHub username and repo name
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Deploy to GitHub Pages

#### Option A: Using gh-pages package (Recommended)

```bash
# Install gh-pages
npm install -D gh-pages

# Add deploy script to package.json (already configured in this project)
# The script is: "deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npx gh-pages -d dist
```

#### Option B: Manual deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Push the `dist` folder to a `gh-pages` branch:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

3. Configure GitHub Pages:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select branch: `gh-pages`
   - Click **Save**

4. Your site will be available at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

### 4. Update vite.config.js for GitHub Pages

If deploying to GitHub Pages, update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/YOUR_REPO/',  // Add your repo name here
  // ... rest of config
});
```

Then rebuild and redeploy:

```bash
npm run build
npx gh-pages -d dist
```

---

## Keeping Repository Private

To protect your intellectual property:

1. **Keep repository Private** in GitHub settings
2. **Do NOT** add collaborators unless necessary
3. **Add `.gitignore`** to exclude sensitive files (already included)
4. **Review commits** before pushing to ensure no secrets

---

## Updating After Changes

Whenever you make changes:

```bash
# Build the project
npm run build

# Commit changes
git add .
git commit -m "Description of changes"
git push origin main

# Deploy to GitHub Pages
npx gh-pages -d dist
```

---

## Sharing the Live Demo

After deployment, you can share:
- **Live URL**: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
- **Login credentials**:
  - Owner: username `turki`
  - Guest: username `mashael`

**Note**: The repository can stay private while the GitHub Pages site is public. This protects your source code while allowing people to use the application.

---

## Alternative: Vercel Deployment

For even easier deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? spacetime-observatory
# - Directory? ./
# - Override settings? No

# For subsequent deploys
vercel --prod
```

Vercel will:
- Automatically build your project
- Provide a custom URL
- Support private GitHub repos
- Auto-deploy on git push (if connected)

---

## Troubleshooting

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check for console errors

### GitHub Pages shows 404
- Ensure `base` in `vite.config.js` matches your repo name
- Verify `gh-pages` branch exists
- Check GitHub Pages settings

### Login doesn't work after deployment
- This is expected - it's demo authentication
- Try usernames `turki` or `mashael`

---

## Security Reminder

This is a **static front-end application**. The login system is for demonstration only. For production use with real user data, implement a proper backend authentication system.

---

## Support

For deployment issues:
- Check [Vite deployment docs](https://vitejs.dev/guide/static-deploy.html)
- Check [GitHub Pages docs](https://docs.github.com/pages)

© 2026 Turki Abdullah. All Rights Reserved.
