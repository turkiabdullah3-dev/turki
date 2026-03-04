# Quick Reference - Spacetime Explorer

## Starting the Project

```bash
cd /Users/turki/Desktop/٥٨٧
npm install      # One-time setup
npm run dev      # Start dev server → http://localhost:3000
npm run build    # Create optimized build
npm run preview  # Preview production build
```

## File Quick Links

| Purpose | File | Key Classes |
|---------|------|------------|
| Main entry | `src/index.js` | `App` |
| Landing | `src/components/LandingPage.js` | `LandingPage` |
| Black hole | `src/scenes/BlackHoleScene.js` | `BlackHoleScene` |
| Wormhole | `src/scenes/WormholeScene.js` | `WormholeScene` |
| Physics calcs | `src/utils/physics.js` | `BlackHolePhysics`, `WormholePhysics` |
| Helpers | `src/utils/helpers.js` | Various utility functions |
| Styling | `src/styles/main.css` | CSS variables and components |

## Key Physics Calculations

### Black Hole Equations

```javascript
// Schwarzschild radius
const r_s = (2 * G * M) / (c ** 2);

// Time dilation (0 to 1, decreases near event horizon)
const alpha = Math.sqrt(1 - r_s / r);

// Gravitational redshift (0 to infinity)
const z = 1 / Math.sqrt(1 - r_s / r) - 1;
```

### Wormhole Equations

```javascript
// Shape function
const b = (r_0 ** 2) / r;

// Stability (exotic matter requirement)
const stability = 1 / (1 + Math.exp(-2 * (r_throat - 1)));

// Metric component
const g_rr = 1 / (1 - b / r);
```

## Common Customizations

### Change Black Hole Mass

```javascript
// In src/scenes/BlackHoleScene.js
this.physics = new BlackHolePhysics(10); // Change 10 to desired solar masses
```

### Modify Colors

```css
/* In src/styles/main.css */
--color-accent-cyan: #00d9ff;    /* Main glow color */
--color-accent-blue: #0099ff;    /* Text color */
--color-deep-black: #050508;     /* Background */
```

### Adjust Particle Counts

```javascript
// More stars = better visuals but slower
createStarfield(3000, 500);   // Increase 3000 for more stars
```

### Change Rendering Quality

```javascript
// In scene renderers
this.renderer.toneMappingExposure = 1.2;  // Range: 0.8-1.5
this.renderer.setPixelRatio(1);           // 0.5 for performance
```

## Development Workflow

1. **Edit code** in VS Code
2. **Vite auto-reloads** on save
3. **Check console** for errors: F12 → Console
4. **Profile performance**: DevTools → Performance tab
5. **Build for production**: `npm run build`

## Keyboard Shortcuts (In Scenes)

| Key | Action |
|-----|--------|
| 1 | Black Hole: Distant View |
| 2 | Black Hole: Approach |
| 3 | Black Hole: First Person |
| 1 | Wormhole: External View |
| 2 | Wormhole: Internal View |

## Debug Tips

### Enable Physics Output

```javascript
// Add in animate() loop
console.log('Distance:', cameraDistance);
console.log('Time dilation:', timeDilation);
console.log('Redshift:', redshift);
```

### Performance Profiling

```javascript
// In animate loop
const start = performance.now();
// ... render code ...
const duration = performance.now() - start;
console.log('Frame time:', duration.toFixed(2) + 'ms');
```

### Visual Debugging

```javascript
// Show hitboxes/bounding boxes
scene.children.forEach(obj => {
  if (obj.geometry) {
    obj.geometry.computeBoundingBox();
  }
});
```

## Three.js Common Patterns

### Create a Sphere

```javascript
const geometry = new THREE.SphereGeometry(radius, segments, rings);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

### Create Particles

```javascript
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array([...]);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ size: 2 });
const points = new THREE.Points(geometry, material);
scene.add(points);
```

### Smooth Camera Movement

```javascript
this.camera.position.lerp(targetPos, 0.1);
this.camera.lookAt(targetLookAt);
```

## CSS Utility Classes

| Class | Purpose |
|-------|---------|
| `.glow-button` | Interactive button with glow |
| `.hud-panel` | Floating information panel |
| `.control-panel` | Scene control buttons |
| `.physics-card` | Physics information display |
| `.slider` | Range input for parameters |

## Color Palette

```
Deep Black:       #050508
Dark Navy:        #0a0e27
Accent Cyan:      #00d9ff
Accent Blue:      #0099ff
Accent Purple:    #7d00ff
Nebula Dark:      #1a0933
Nebula Light:     #2d1b4e
Text White:       #f0f0f0
```

## Browser DevTools Tips

### Check WebGL Info
```javascript
// In console
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
console.log(gl.getParameter(gl.VERSION));
```

### Monitor Memory
```javascript
// DevTools → Memory → Take heap snapshot
// Compare snapshots after scene transitions
```

### Profile Rendering
```javascript
// DevTools → Performance → Record
// Look for long frames (>16ms)
```

## Deployment Checklist

- [ ] Run `npm run build`
- [ ] Check `dist/` folder created
- [ ] Test production build locally: `npm run preview`
- [ ] Verify all scenes work
- [ ] Check console for errors
- [ ] Test on mobile device
- [ ] Upload `dist/` to web host
- [ ] Test on deployed URL

## Useful Resources

- **Three.js Docs**: https://threejs.org/docs/
- **WebGL Specs**: https://www.khronos.org/webgl/
- **Einstein's Relativity**: https://en.wikipedia.org/wiki/General_relativity
- **Wormholes**: https://en.wikipedia.org/wiki/Wormhole

## Performance Targets

| Metric | Target |
|--------|--------|
| FPS | 60 constant |
| Frame time | <16.67ms |
| Max memory | <200MB |
| Load time | <3s |
| interaction latency | <100ms |

---

**Last Updated:** March 3, 2026 | **Version:** 1.0.0
