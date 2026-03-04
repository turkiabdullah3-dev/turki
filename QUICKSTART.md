# Quick Start Guide

Get up and running in 2 minutes.

## Step 1: Install Dependencies

```bash
cd /Users/turki/Desktop/٥٨٧
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

Server starts at: **http://localhost:3000**

## Step 3: Login

Use either:
- Username: **turki** (owner)
- Username: **mashael** (guest)

No password needed.

## Step 4: Explore

1. **Home Page** → Choose Black Hole or Wormhole
2. **Black Hole** → Adjust distance slider, see physics update
3. **Wormhole** → Move through spacetime tunnel
4. **Equations** → View all formulas with explanations
5. **About** → Read project info and rights

---

## Build for Production

```bash
npm run build
```

Files output to `dist/` folder.

---

## Deploy to GitHub Pages

```bash
# First time - setup git and push to GitHub
git init
git add .
git commit -m "Initial commit: Spacetime Observatory"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# Deploy to GitHub Pages
npm run build
npx gh-pages -d dist
```

Your site will be live at:
`https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

---

## Troubleshooting

**Canvas is blank?**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

**Login doesn't work?**
- Use lowercase: `turki` or `mashael`
- No password needed

**Build fails?**
- Run `npm install` first
- Check for Node.js version (18+ required)

**Performance issues?**
- Check FPS in HUD (should be 45-60)
- Close other browser tabs
- Star count auto-adjusts to device

---

## What's Next?

1. **Test it** - Use TESTING.md checklist
2. **Deploy it** - Follow DEPLOY.md guide
3. **Share it** - Send live URL to others

---

## File Reference

- `README.md` - Complete documentation
- `DEPLOY.md` - Deployment instructions
- `TESTING.md` - Testing checklist
- `PROJECT_SUMMARY.md` - Implementation summary

---

**© 2026 Turki Abdullah. All Rights Reserved.**

*Ready to explore spacetime!* 🚀
