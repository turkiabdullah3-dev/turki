# 🌌 Spacetime Explorer

> Interactive physics visualization exploring black holes and wormholes through general relativity

**Created by:** Turki Al-Marrakhi  
**Live Demo:** [https://turkiabdullah3-dev.github.io/Black-hole/](https://turkiabdullah3-dev.github.io/Black-hole/)

## 🎯 Overview

An educational physics visualization project that brings Einstein's general relativity to life through interactive 3D graphics. Experience black holes and wormholes with scientifically accurate physics calculations rendered in real-time.

## ✨ Features

### 🌑 Black Hole Visualization
- **Schwarzschild Metric**: Accurate spacetime curvature around a black hole
- **Event Horizon**: Visual representation of the point of no return
- **Gravitational Lensing**: Light bending around massive objects
- **Time Dilation**: Real-time calculation of time flow near the singularity
- **Accretion Disk**: Particle system showing matter spiraling into the black hole
- **Photon Sphere**: Unstable orbit where light circles the black hole

### 🌀 Wormhole Visualization
- **Morris-Thorne Geometry**: Traversable wormhole model
- **Dual Spacetimes**: Two connected regions visualized with particle galaxies
- **Throat Visualization**: The narrow passage connecting both ends
- **External & Internal Views**: Switch between orbiting and traveling through
- **Spacetime Curvature**: Real-time Ricci scalar calculations
- **Tidal Forces**: Safety indicators showing gravitational stress

### 📊 Physics Engine
- **General Relativity Equations**: Schwarzschild and Morris-Thorne metrics
- **Real-time Calculations**: Time dilation, redshift, tidal forces
- **Safety Constraints**: Prevents unphysical states (NaN/Infinity)
- **HUD Display**: Live physics metrics with color-coded warnings
- **Performance Monitoring**: 60 FPS target with adaptive quality

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Three.js | 0.160.0 | 3D rendering engine |
| Vite | 5.4.21 | Build tool & dev server |
| WebGL 2.0 | Latest | GPU acceleration |
| JavaScript | ES6+ | Application logic |
| CSS 3 | Latest | Visual design |

## 📂 Project Structure
- **Three.js** v0.160.0 - 3D graphics engine
- **Vite** v5.4.21 - Build tool and dev server
- **WebGL** - GPU-accelerated rendering
- **GLSL Shaders** - Custom visual effects

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

## 📁 Project Structure

```
src/
├── index.js                    - Main application
├── components/
│   └── LandingPageSimple.js   - Homepage
├── scenes/
│   ├── BlackHoleScene.js      - Black hole visualization
│   └── WormholeScene.js       - Wormhole visualization  
├── utils/
│   ├── physics.js             - Physics calculations
│   ├── safePhysics.js         - Safety constraints
│   └── performance.js         - Optimization
└── styles/
    └── main.css               - Styling
```

## 🎓 Physics Background

### Black Holes (Schwarzschild Metric)
The project uses the Schwarzschild solution to Einstein's field equations:

**Time Dilation:** `α = √(1 - 2M/r)`  
**Gravitational Redshift:** `z = 1/α - 1`  
**Event Horizon:** `r_s = 2GM/c²`

### Wormholes (Morris-Thorne Geometry)
Based on the traversable wormhole model:

**Throat Radius:** Minimum wormhole diameter  
**Ricci Curvature:** `R = 4/a²`  
**Tidal Forces:** `F ∝ M/r³`

## 📊 Performance

- **Target:** 60 FPS
- **Particles:** 500-1000 depending on scene
- **Adaptive Quality:** Auto-adjusts based on performance
- **Build Time:** ~1.6 seconds

## 🎯 Use Cases

- **Physics Education:** Visual demonstration of general relativity
- **Scientific Visualization:** Real-time metric calculations
- **Interactive Learning:** Explore spacetime curvature
- **Research Tool:** Test wormhole stability models
- ✅ Mouse parallax
- ✅ Phase transitions
- ✅ Mode switching
- ✅ Parameter adjustment
- ✅ Data visualization
- ✅ Notification system
- ✅ Draggable panels

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 95+ | ✅ Full |
| Firefox | 91+ | ✅ Full |
| Safari | 15+ | ✅ Full |
| Edge | 95+ | ✅ Full |
| Mobile | iOS 13+ / Android 9+ | ✅ Optimized |

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Getting started guide
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Phase 2 summary
- **[FEATURE_MATRIX.md](FEATURE_MATRIX.md)** - Complete feature checklist
- **[docs/ENHANCEMENTS.md](docs/ENHANCEMENTS.md)** - Technical details
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
- **[API_REFERENCE.md](API_REFERENCE.md)** - Class documentation

## 🎓 Educational Value

This project serves as both a visualization tool and learning resource:
- Real-time physics calculations
- Scientific visualization of spacetime
- Interactive parameter exploration
- Live data and metrics display
- Educational UI overlays (future)

## 🔮 Future Enhancements
## 📝 License

MIT License - Created by Turki Al-Marrakhi

## 🔗 Links

- **Live Demo:** [https://turkiabdullah3-dev.github.io/Black-hole/](https://turkiabdullah3-dev.github.io/Black-hole/)
- **Repository:** [https://github.com/turkiabdullah3-dev/Black-hole](https://github.com/turkiabdullah3-dev/Black-hole)

## 📚 References

- Einstein's General Relativity (1915)
- Schwarzschild Solution (1916)
- Morris-Thorne Wormhole Model (1988)
- Three.js Documentation
- WebGL Specifications

---

**Created with passion for physics and visualization**  
*Turki Al-Marrakhi - 2024*

## 📄 License

MIT - See LICENSE file for details

---

**Status**: ✅ **Production Ready**  
**Version**: 2.0.0  
**Last Updated**: December 2024

🌌 **Ready to explore the geometry of spacetime!** 🌌


## Technology Stack

- **Three.js** (r128+): 3D rendering
- **GLSL Shaders**: Advanced distortion effects
- **Vite**: Build tool and dev server
- **Vanilla JavaScript**: No heavy UI frameworks

## Installation & Running

### Prerequisites
- Node.js 16+ and npm

### Setup
```bash
cd /Users/turki/Desktop/٥٨٧
npm install
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

## Usage

### Landing Page
- Click "Enter Black Hole" to explore gravitational physics
- Click "Enter Wormhole" to traverse spacetime geometry

### Black Hole Scene
- Use buttons to switch between zoom levels
- Keyboard shortcuts: Press 1, 2, or 3 for different stages
- HUD displays live physics calculations
- Watch how time dilation and redshift change with proximity

### Wormhole Scene
- Toggle between external and internal views
- Use the slider to adjust throat radius
- Watch the wormhole geometry and stability update in real-time
- Internal view: smooth tunnel navigation with visual effects

## Physics Implementation

### Black Hole Physics
- **Schwarzschild Metric**: Non-rotating black hole spacetime
- **Time Dilation Factor**: α(r) = √(1 - r_s/r)
- **Gravitational Redshift**: z ≈ 1/√(1 - r_s/r) - 1
- **Photon Sphere**: At 1.5 × Schwarzschild radius

### Wormhole Physics
- **Morris-Thorne Metric**: Traversable wormhole geometry
- **Shape Function**: b(r) = r₀²/r (throat shape)
- **Stability Condition**: ρ + p_r < 0 (exotic matter requirement)
- **Spatial Curvature**: Visual representation of spacetime geometry

## Performance Optimizations

- GPU-accelerated rendering with Three.js
- Efficient particle systems for starfields
- Smooth 60 FPS animations via requestAnimationFrame
- Optimized shader compilation
- Minimal DOM manipulation

## Accessibility Notes

- Cosmic theme with high contrast glowing elements
- All interactive buttons clearly labeled
- Physics displays use both equations and numerical values
- Keyboard shortcuts for scene navigation

## Visual Design

### Color Palette
- **Deep Black Background**: #050508
- **Accent Cyan**: #00d9ff
- **Accent Blue**: #0099ff
- **Accent Purple**: #7d00ff
- **Glowing Elements**: Soft box-shadow glow effects

### Animation Style
- Smooth ease-in-out cubic-bezier transitions
- 400ms default transition duration
- Fade and slide animations for UI elements
- Continuous smooth rotation for celestial objects

## License

Created as an educational experience exploring general relativity and spacetime geometry.
