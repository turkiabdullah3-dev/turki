# Spacetime Observatory

**Interactive Black Hole + Wormhole Physics Experience**

© 2026 Turki Abdullah. All Rights Reserved.

---

## Overview

Spacetime Observatory is a scientifically accurate, interactive visualization of extreme spacetime geometries. Explore the physics of black holes and traversable wormholes through real-time simulations with a beautiful liquid glass UI.

### Features

- **Black Hole Mode**: Experience Schwarzschild spacetime with:
  - Time dilation visualization
  - Gravitational redshift calculations
  - Photon sphere rendering
  - Tidal force computation
  
- **Wormhole Mode**: Traverse Morris-Thorne wormholes with:
  - Embedding diagram visualization
  - Exotic matter indicators
  - Shape function rendering
  - Warp strength metrics

- **Equations Reference**: Complete documentation with KaTeX-rendered formulas
- **Adaptive Performance**: Optimized for laptop and iPad
- **Secure Design**: CSP headers, XSS protection, safe DOM handling

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd spacetime-observatory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```
   
   Production files will be in the `dist/` directory.

### Login Credentials

- **Owner**: username `turki` (full access)
- **Guest**: username `mashael` (view-only)

---

## Project Structure

```
spacetime-observatory/
├── index.html              # Redirect to login
├── login.html             # Login page
├── home.html              # Mode selection
├── blackhole.html         # Black hole simulation
├── wormhole.html          # Wormhole simulation
├── equations.html         # Equations reference
├── about.html             # Project info & rights
│
├── styles/
│   ├── app.css           # Main application styles
│   └── glass.css         # Liquid glass UI styles
│
├── src/
│   ├── core/
│   │   ├── config.js     # Configuration & constants
│   │   ├── auth.js       # Authentication system
│   │   ├── storage.js    # Local/session storage
│   │   ├── sanitize.js   # XSS protection
│   │   └── perf.js       # Performance utilities
│   │
│   ├── physics/
│   │   ├── constants.js  # Physical constants
│   │   ├── blackhole.js  # Black hole physics
│   │   ├── wormhole.js   # Wormhole physics
│   │   └── safety.js     # NaN/Infinity prevention
│   │
│   ├── render/
│   │   ├── canvasRoot.js        # Canvas management
│   │   ├── spaceBackground.js   # Star field renderer
│   │   ├── blackholeScene.js    # Black hole visualization
│   │   ├── wormholeScene.js     # Wormhole visualization
│   │   └── postFX.js            # Post-processing effects
│   │
│   └── ui/
│       ├── hud.js        # Heads-up display
│       ├── controls.js   # Interactive controls
│       └── equationsUI.js # Equation rendering
│
├── package.json
├── vite.config.js
├── LICENSE.txt
├── NOTICE.md
└── README.md
```

---

## Deployment

### GitHub Pages

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   # If using gh-pages package
   npm install -D gh-pages
   
   # Add to package.json scripts:
   "deploy": "gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

3. **Configure GitHub Pages:**
   - Go to repository Settings → Pages
   - Select `gh-pages` branch
   - Site will be available at `https://yourusername.github.io/repo-name/`

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow prompts** to link your GitHub repository

### Netlify

1. **Drag and drop** the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)

   OR

2. **Use Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

---

## Technical Details

### Performance Optimizations

- **DPR Capping**: Device pixel ratio limited to 2.0
- **Adaptive Star Count**: 
  - Mobile: ~700 stars
  - Tablet: ~1200 stars
  - Desktop: ~2000 stars
- **HUD Throttling**: Updates at 10 FPS (100ms intervals)
- **Canvas Rendering**: Single canvas with 2D context
- **Resize Handling**: Proper buffer size management

### Safety Features

All physics calculations include safety clamps to prevent:
- NaN (Not a Number) values
- Infinity values
- Division by zero
- Square root of negative numbers
- Blank canvas failures

### Security

- **Content Security Policy**: Enabled on all pages
- **XSS Protection**: All user data sanitized
- **No innerHTML**: Safe DOM manipulation only
- **Local Storage**: Only non-sensitive settings saved
- **Demo Authentication**: Front-end only (not production-grade)

---

## Physics Accuracy

### Black Hole (Schwarzschild Metric)

**Exact Equations:**
- Schwarzschild radius: `r_s = 2GM/c²`
- Time dilation: `α(r) = √(1 - r_s/r)`
- Redshift: `1 + z = 1/√(1 - r_s/r)`
- Photon sphere: `r_ph = 3GM/c² = 1.5 r_s`

**Approximate:**
- Tidal acceleration: `a_tidal ≈ 2GML/r³`

### Wormhole (Morris-Thorne)

**Exact Equations:**
- Metric: `ds² = -e^(2Φ)c²dt² + dr²/(1-b/r) + r²dΩ²`
- Throat condition: `b(r₀) = r₀`
- Flare-out: `b'(r₀) < 1`
- NEC violation: `ρ + p_r < 0`

### Assumptions

- Non-rotating (Schwarzschild) black hole
- Static spacetime
- Vacuum solution
- Observer at rest
- No full ray-tracing (visualization approximation)

---

## Browser Support

- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile

---

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Adding New Features

1. **New Physics Mode**: Add to `/src/physics/` and `/src/render/`
2. **New UI Component**: Add to `/src/ui/`
3. **New Page**: Create HTML file and add to `vite.config.js`

### Code Style

- Use ES6 modules
- Prefer `const` over `let`
- Always use safety clamps for physics calculations
- Use `sanitize.js` for all DOM text updates
- Document all functions with JSDoc comments

---

## Testing Checklist

Before deploying, verify:

- [ ] Canvas renders correctly on first load
- [ ] Canvas resizes properly on window resize
- [ ] No console errors (no NaN, no Infinity)
- [ ] Runs smoothly on iPad Safari (60 FPS target)
- [ ] Runs smoothly on laptop Chrome
- [ ] Login works for both users
- [ ] Guest cannot access owner features
- [ ] All equations render with KaTeX
- [ ] CSP headers don't block functionality
- [ ] Settings persist across page refreshes
- [ ] All navigation links work

---

## Troubleshooting

### Blank Canvas

**Problem**: Canvas appears but stays black  
**Solution**: Check browser console for errors. Ensure `canvasRoot.init()` succeeds and returns true.

### NaN/Infinity Values

**Problem**: Physics values show NaN or Infinity  
**Solution**: All physics functions use safety clamps. Check if you're calling them correctly.

### Poor Performance

**Problem**: Low FPS on mobile/tablet  
**Solution**: Reduce star count in `config.js`, check DPR is capped at 2.0

### KaTeX Not Loading

**Problem**: Equations show as text on equations page  
**Solution**: Check CDN link in `equations.html`, ensure internet connection

---

## License & Rights

**© 2026 Turki Abdullah. All Rights Reserved.**

This project's design, structure, and implementation are proprietary intellectual property. No reproduction, modification, or redistribution is permitted without explicit written permission from the copyright holder.

See [LICENSE.txt](./LICENSE.txt) and [NOTICE.md](./NOTICE.md) for details.

---

## Credits

**Owner**: Turki Abdullah  
**Year**: 2026

### Scientific References

- Schwarzschild, K. (1916) - Schwarzschild metric
- Morris, M. S., & Thorne, K. S. (1988) - Traversable wormholes
- Einstein, A. (1915) - General Theory of Relativity

### Technologies

- Vite - Build tool
- KaTeX - Math rendering
- Canvas 2D - Rendering
- ES6 Modules - Code organization

---

## Contact

For inquiries regarding licensing, permissions, or technical questions, please contact the project owner.

---

**Note**: This is an educational project. For scientific research, use specialized numerical relativity software.
