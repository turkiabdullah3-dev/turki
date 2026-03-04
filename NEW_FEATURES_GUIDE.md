# Quick Reference: New Physics Features

## 🕐 Dual Clock System

### Location
Top-left corner of Black Hole scene

### What You See
1. **Far Observer Clock** (Blue border)
   - Shows coordinate time (t)
   - Advances at constant rate
   - Reference time far from gravity

2. **Local Observer Clock** (Orange border)
   - Shows proper time (τ)
   - Slows down near black hole
   - dτ = dt √(1 - rs/r)

3. **Time Dilation Factor** (Purple border)
   - Shows α(r) value (0 to 1)
   - Progress bar visualization
   - Color changes: Blue → Orange → Red

### Physics
- **Green/Blue (α > 0.7):** Safe distance, minimal time dilation
- **Orange (0.3 < α < 0.7):** Moderate time dilation
- **Red (α < 0.3):** Extreme time dilation, approaching horizon

### Example
At 2× Schwarzschild radius:
- Far observer: 10.00 seconds
- Local observer: 7.07 seconds
- Dilation factor: 0.707

---

## 🌀 Wormhole Embedding Diagram

### How to View
1. Open Wormhole Experience
2. Ensure "External View" is selected (default)
3. 3D funnel appears in center of scene

### What You See
- **Funnel Shape:** Actual spacetime geometry
- **Color Gradient:** Violet (throat) → Cyan (edges)
- **Throat Ring:** Orange glowing circle at narrowest point
- **Grid Lines:** Radial spacetime reference markers
- **Mirror Side:** Both universe connections visible

### Interactivity
- Adjust "Throat Radius" slider → Funnel reshapes live
- Switches to "Internal View" → Diagram hides (tunnel mode)
- Rotates gently for 3D depth perception

### Physics Visualization
Shows the embedding equation:
**dz/dr = ±√(1/(r/b(r) - 1))**

Where:
- r = radial distance
- b(r) = shape function = r₀²/r
- z = embedding depth

---

## 🌊 Gravitational Waves (Physics Functions)

### Access in Code
```javascript
const physics = new BlackHolePhysics(10); // 10 solar masses
const waveData = physics.getGravitationalWaveEnergy();

console.log(waveData);
// {
//   totalMass: 2 × 10 solar masses
//   energyReleased: ~1.07 × 10^47 Joules
//   energyInSolarMasses: 0.6 solar masses
//   description: "Energy radiated as gravitational waves during merger"
// }
```

### Equation
**E ≈ 0.03 Mc²**

Approximately 3% of total mass converted to gravitational wave energy during binary black hole merger.

### Real-World Example
LIGO's first detection (GW150914):
- Two black holes: ~29 + 36 solar masses
- Energy released: ~3 solar masses → gravitational waves
- Peak power: 50× entire visible universe!

---

## ⭐ Tidal Disruption Events

### Access in Code
```javascript
const physics = new BlackHolePhysics(1e6); // 1 million solar masses
const tidalData = physics.getTidalDisruptionRadius(
  6.96e8,  // Solar radius
  1.989e30 // Solar mass
);

console.log(tidalData);
// {
//   tidalRadius: ~4.7 × 10^10 meters (47 solar radii)
//   starRadius: 6.96 × 10^8 meters
//   starMass: 1.989 × 10^30 kg
//   isTidallyDisrupted: function(r)
//   disruptionFactor: function(r)
// }
```

### Equation
**r_t ≈ R★ × (M_BH / M★)^(1/3)**

Where:
- R★ = stellar radius
- M_BH = black hole mass
- M★ = stellar mass

### Example Scenarios
| Black Hole Mass | Star Type | Tidal Radius |
|----------------|-----------|--------------|
| 10 M☉ | Sun-like | ~3 R☉ |
| 1,000 M☉ | Sun-like | ~30 R☉ |
| 1,000,000 M☉ | Sun-like | ~3,000 R☉ |

**Note:** Supermassive black holes can swallow stars whole!

---

## 🔍 Gravitational Lensing Shader

### Current Status
✅ **Shader created** → Ready for integration
⚠️ **Not yet integrated** into rendering pipeline

### To Enable (Future)
Add to `BlackHoleScene.js` post-processing:
```javascript
import { GravitationalLensingShader } from '../shaders/gravitationalLensingPost.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// In setupPostProcessing():
const lensingPass = new ShaderPass(GravitationalLensingShader);
lensingPass.uniforms.blackHolePos.value = [0.5, 0.5];
lensingPass.uniforms.schwarzschildRadius.value = 0.1;
this.composer.addPass(lensingPass);
```

### Physics
**Lensing Angle:** θ ≈ 4rs/b

Where:
- rs = Schwarzschild radius
- b = impact parameter (closest approach distance)

### Visual Effects
- **Light bending** around black hole
- **Einstein rings** at photon sphere
- **Multiple images** of background stars
- **Chromatic aberration** (wavelength-dependent)

---

## 📊 All Physics Equations Reference

### Black Hole
1. rs = 2GM/c² (Schwarzschild radius)
2. r_ph = 1.5rs (Photon sphere)
3. dτ = dt√(1-rs/r) (Time dilation)
4. z = 1/√(1-rs/r) - 1 (Redshift)
5. a_tidal ≈ 2GML/r³ (Tidal force)
6. r_t ≈ R★(M_BH/M★)^(1/3) (Tidal disruption)
7. E ≈ 0.03Mc² (Gravitational waves)
8. θ ≈ 4rs/b (Lensing angle)

### Wormhole
1. ds² = -c²dt² + dr²/(1-b/r) + r²dΩ² (Morris-Thorne metric)
2. b(r) = r₀²/r (Shape function)
3. b(r₀) = r₀ (Throat condition)
4. b'(r₀) < 1 (Flare-out condition)
5. ρ + pr < 0 (Exotic matter requirement)
6. dz/dr = ±√(1/(r/b-1)) (Embedding equation)

---

## 🎮 User Controls

### Black Hole Scene
- **1 key** → Distant View
- **2 key** → Approach
- **3 key** → First Person
- **Mouse** → Look around (planned)

### Wormhole Scene
- **1 key** → External View (shows embedding diagram)
- **2 key** → Internal View (tunnel mode)
- **Slider** → Adjust throat radius (0.5 - 3.0)

### UI Panels
- **Draggable** → Click and drag HUD panels
- **Auto-update** → All values refresh in real-time
- **Color-coded** → Visual severity indicators

---

## 🧪 Testing Values

### Time Dilation Test
```javascript
// At different distances from 10 solar mass black hole:
r = ∞        → α = 1.000 (no dilation)
r = 100 rs   → α = 0.995 (0.5% slower)
r = 10 rs    → α = 0.949 (5% slower)
r = 3 rs     → α = 0.816 (18% slower)
r = 2 rs     → α = 0.707 (29% slower)
r = 1.5 rs   → α = 0.577 (42% slower)
r = 1.1 rs   → α = 0.316 (68% slower)
r = rs       → α = 0.000 (time stops)
```

### Tidal Force Test
```javascript
// Human (1.8m tall) near 10 solar mass black hole:
r = 1000 rs  → 0.0001 m/s² (imperceptible)
r = 100 rs   → 0.001 m/s² (barely noticeable)
r = 10 rs    → 1 m/s² (uncomfortable)
r = 3 rs     → 37 m/s² (severe)
r = 2 rs     → 125 m/s² (lethal)
```

---

## 📚 Scientific References

- **Schwarzschild Solution:** K. Schwarzschild (1916)
- **Morris-Thorne Wormhole:** M. Morris & K. Thorne (1988)
- **Gravitational Waves:** LIGO Scientific Collaboration (2016)
- **Tidal Disruption:** Rees (1988), Evans & Kochanek (1989)

---

**Last Updated:** March 4, 2026
**Framework:** Three.js + WebGL
**Physics Accuracy:** Graduate-level General Relativity
