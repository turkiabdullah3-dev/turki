# Project File Tree

```
spacetime-observatory/
│
├── 📄 index.html                    # Entry point (redirects to login)
├── 📄 login.html                    # Authentication page
├── 📄 home.html                     # Mode selection page
├── 📄 blackhole.html                # Black hole simulation
├── 📄 wormhole.html                 # Wormhole simulation
├── 📄 equations.html                # Equations reference
├── 📄 about.html                    # About & rights page
│
├── 📁 styles/
│   ├── app.css                      # Main application styles
│   └── glass.css                    # Liquid glass UI components
│
├── 📁 src/
│   │
│   ├── 📁 core/                     # Core utilities
│   │   ├── config.js                # Configuration & constants
│   │   ├── auth.js                  # Authentication system
│   │   ├── storage.js               # Local/session storage
│   │   ├── sanitize.js              # XSS protection utilities
│   │   └── perf.js                  # Performance monitoring
│   │
│   ├── 📁 physics/                  # Physics engines
│   │   ├── constants.js             # Physical constants (G, c, etc.)
│   │   ├── blackhole.js             # Schwarzschild physics
│   │   ├── wormhole.js              # Morris-Thorne physics
│   │   └── safety.js                # NaN/Infinity prevention
│   │
│   ├── 📁 render/                   # Rendering system
│   │   ├── canvasRoot.js            # Canvas creation & resizing
│   │   ├── spaceBackground.js       # Star field renderer
│   │   ├── blackholeScene.js        # Black hole visualization
│   │   ├── wormholeScene.js         # Wormhole visualization
│   │   └── postFX.js                # Post-processing effects
│   │
│   └── 📁 ui/                       # UI components
│       ├── hud.js                   # Heads-up display controller
│       ├── controls.js              # Interactive sliders/buttons
│       └── equationsUI.js           # Equation rendering with KaTeX
│
├── 📁 node_modules/                 # Dependencies (generated)
├── 📁 dist/                         # Production build (generated)
│
├── 📄 package.json                  # Node.js dependencies
├── 📄 package-lock.json             # Dependency lock file
├── 📄 vite.config.js                # Vite build configuration
│
├── 📄 LICENSE.txt                   # Copyright license
├── 📄 NOTICE.md                     # Rights notice
│
├── 📄 README.md                     # Complete documentation
├── 📄 DEPLOY.md                     # Deployment guide
├── 📄 TESTING.md                    # Test checklist
├── 📄 QUICKSTART.md                 # Quick start guide
├── 📄 PROJECT_SUMMARY.md            # Implementation summary
├── 📄 FILETREE.md                   # This file
│
└── 📄 .gitignore                    # Git ignore rules

```

## File Count

- **HTML Pages**: 7 files
- **JavaScript Modules**: 17 files
- **CSS Files**: 2 files
- **Configuration**: 3 files
- **Documentation**: 6 files
- **Total**: 35 source files

## Module Dependencies

```
login.html
  └─ canvasRoot.js → perf.js
  └─ spaceBackground.js → perf.js
  └─ auth.js → config.js, storage.js
  └─ sanitize.js

home.html
  └─ (same as login.html)

blackhole.html
  └─ canvasRoot.js → perf.js
  └─ spaceBackground.js → perf.js
  └─ blackholeScene.js → blackhole.js, safety.js
  └─ blackhole.js → constants.js, safety.js
  └─ postFX.js
  └─ hud.js → perf.js, sanitize.js
  └─ controls.js → storage.js
  └─ auth.js → config.js, storage.js

wormhole.html
  └─ canvasRoot.js → perf.js
  └─ spaceBackground.js → perf.js
  └─ wormholeScene.js → wormhole.js, safety.js
  └─ wormhole.js → constants.js, safety.js
  └─ postFX.js
  └─ hud.js → perf.js, sanitize.js
  └─ controls.js → storage.js
  └─ auth.js → config.js, storage.js

equations.html
  └─ auth.js → config.js, storage.js
  └─ KaTeX (external CDN)

about.html
  └─ auth.js → config.js, storage.js
```

## File Sizes (Approximate)

**HTML Files**: ~70 KB total
- index.html: ~0.6 KB
- login.html: ~1.9 KB
- home.html: ~2.1 KB
- blackhole.html: ~3.2 KB
- wormhole.html: ~3.2 KB
- equations.html: ~13.5 KB
- about.html: ~6.1 KB

**JavaScript Modules**: ~25 KB total (source)
- Core: ~6 KB
- Physics: ~8 KB
- Render: ~9 KB
- UI: ~6 KB

**CSS Files**: ~12 KB total
- app.css: ~5 KB
- glass.css: ~7 KB

**Documentation**: ~45 KB total

**Production Build**: ~60 KB (minified + gzipped)

---

## Quick Navigation

**Start Here:**
- QUICKSTART.md → Fast setup
- README.md → Full documentation

**Development:**
- src/core/ → Utilities & config
- src/physics/ → Physics calculations
- src/render/ → Visual rendering
- src/ui/ → User interface

**Deployment:**
- DEPLOY.md → How to deploy
- TESTING.md → What to test

**Legal:**
- LICENSE.txt → Copyright
- NOTICE.md → Rights statement

---

© 2026 Turki Abdullah. All Rights Reserved.
