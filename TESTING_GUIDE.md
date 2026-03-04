# Physics Display System - Testing & Validation Guide

## Quick Start

### Development
```bash
npm run dev
# Open http://localhost:3000/
```

### Production
```bash
npm run build
npx vite preview
```

## Testing Checklist

### 1. Black Hole Scene Physics Verification

**Test: Schwarzschild Radius Calculation**
- Navigate to Black Hole scene
- In distant view, check HUD panel: "Schwarzschild Radius"
- Expected for 10 solar mass black hole: ~29.5 km
- Verify: `rs = 2GM/c² = 2 × (6.674e-11) × (10 × 1.989e30) / (299792458)² ≈ 29,523 m`

**Test: Photon Sphere Radius**
- Approach closer to black hole
- Check equation card: "Photon Sphere"
- Expected: ~44.3 km (exactly 1.5 × rs)
- Verify: `r_ph = 1.5 × 29,523 = 44,285 m`

**Test: Time Dilation Factor**
- Approach photon sphere distance (44.3 km)
- Check HUD: "Time Dilation (α)"
- Expected value: √(1 - 29.5/44.3) ≈ 0.707
- Verify formula: `α = √(1 - rs/r)`

**Test: Gravitational Redshift**
- Move to different distances
- Check HUD: "Gravitational Redshift (z)"
- At photon sphere: z ≈ 0.414
- Verify: `z = 1/√(1 - rs/r) - 1`

**Test: Tidal Force**
- Extreme close approach (if possible)
- Check HUD: "Tidal Acceleration"
- Should show increasing values in m/s²
- Verify: `a_tidal = 2GMx/r³` where x = 1.8 m (human height)

**Test: Tidal Stress Meter**
- Watch meter as you approach
- Color progression: Cyan (0%) → Yellow (50%) → Red (100%)
- Should correlate with "Spaghettification Risk"
- At critical zones: Badge should show ❌ Critical

### 2. Equation Card Progressive Reveal

**Test: Far Distance (300+ km away)**
- Expect visible: Schwarzschild Radius, Photon Sphere cards
- Expect hidden: Time Dilation, Redshift, Tidal Force, Schwarzschild Metric

**Test: Approach Distance (44-150 km)**
- All cards visible: Schwarzschild, Photon Sphere, Time Dilation, Redshift
- Metric card still hidden

**Test: Photon Sphere Distance (40-50 km)**
- Expect visible: Photon Sphere, Redshift, Tidal Force, Time Dilation
- Schwarzschild Radius might fade out
- Metric card still hidden

**Test: Horizon Distance (< 30 km)**
- Expect all expert cards visible including Schwarzschild Metric
- Visual indicators: Scene redshift effects, intense tidal warnings

### 3. Visual Linking (Glow Effects)

**Test: Accretion Disk Highlight**
- At "approach" zone, accretion disk should glow blue
- Check emissive intensity increases as you near
- Should sync with equation card appearance

**Test: Photon Ring Highlight**
- At "photon sphere" and "far" zones, photon ring glows
- Ring should be highlighted when Photon Sphere card visible
- Emissive intensity: ~0.3

### 4. Wormhole Scene Physics Verification

**Test: Throat Radius**
- Check HUD: "Throat Radius (r₀)"
- Default: 1.5 m (for Morris-Thorne model)
- Verify: `b(r₀) = r₀` condition

**Test: Shape Function**
- Check HUD: "Shape Function b(r)"
- At 2×r₀: Should be approximately b(2r₀) = r₀²/(2r₀) = r₀/2
- Verify: `b(r) = b₀²/r`

**Test: Flare-out Condition**
- Badge should display "OK ✓" for stable geometry
- For standard Morris-Thorne: Always satisfied (b'(r₀) < 1)
- Visual: Green glow on badge

**Test: Exotic Matter Cost**
- Meter shows cost from 0-100%
- Larger throat radius = lower cost
- Longer tunnel = higher cost
- Verify inverse relationship: `cost ∝ L/r₀`

### 5. HUD Panel Performance

**Test: Update Frequency**
- Open DevTools → Performance
- Record 10 seconds of gameplay
- Check FPS: Should maintain 60 FPS (desktop) or 30-45 FPS (mobile)
- HUD updates should occur every 100ms (visible but not jarring)

**Test: Memory Usage**
- DevTools → Memory
- Take heap snapshot before/after HUD initialization
- Increase should be <5 MB
- Check for memory leaks: Snapshots 5 minutes apart should stabilize

**Test: Panel Visibility Toggle**
- Panels should smoothly fade in/out
- Transition: 0.4s ease-out for equations cards
- No stuttering or visual artifacts

### 6. Mobile Responsiveness

**Test: Equation Cards on Mobile**
- Emulate iPad/Android in DevTools
- Cards should stack vertically on left/right edges
- Font sizes: 0.75rem (mobile) vs 0.9rem (desktop)
- No horizontal scroll required

**Test: Physics Panel on Mobile**
- Panel repositioned to fit viewport
- Scrollable with custom scrollbar styling
- Still readable in portrait and landscape

**Test: Touch Interactions**
- All buttons clickable on touch devices
- No hover-state blocking
- Text selections disabled (user-select: none)

### 7. Accessibility Testing

**Test: Color Blind Mode**
- Open with color blindness filter (DevTools accessibility)
- Badges should use text + shape, not just color
- Text: "OK ✓", "FAIL ✗", "CRITICAL ❌"

**Test: Keyboard Navigation**
- Tab through all cards and panels
- All interactive elements focusable
- Focus outline visible

**Test: Reduced Motion**
- Set prefers-reduced-motion: reduce
- Animations should be removed or instant
- Media query: `@media (prefers-reduced-motion: reduce)`

### 8. Cross-Browser Testing

**Test Browsers:**
- ✓ Chrome/Chromium (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Mobile Safari (iOS 14+)
- ✓ Chrome Mobile (Android 10+)

**Expected Issues:**
- Older browsers: WebGL issues (not supported)
- Edge cases: Backdrop-filter not fully supported in Firefox (graceful degradation)

## Numeric Validation Tests

### Black Hole (10 Solar Masses)

```javascript
// Constants
const G = 6.67430e-11;
const c = 299792458;
const M_sun = 1.989e30;
const M = 10 * M_sun;

// rs = 2GM/c²
const rs = (2 * G * M) / (c ** 2);
console.assert(Math.abs(rs - 29523) < 100, `rs should be ~29523 m, got ${rs}`);

// r_ph = 1.5 * rs
const r_ph = 1.5 * rs;
console.assert(Math.abs(r_ph - 44285) < 100, `r_ph should be ~44285 m, got ${r_ph}`);

// α(44285 m) = sqrt(1 - rs/r)
const alpha = Math.sqrt(1 - rs / r_ph);
console.assert(Math.abs(alpha - 0.707) < 0.01, `α should be ~0.707, got ${alpha}`);

// z at photon sphere
const z = 1 / Math.sqrt(1 - rs / r_ph) - 1;
console.assert(Math.abs(z - 0.414) < 0.01, `z should be ~0.414, got ${z}`);
```

### Wormhole (1.5 m throat)

```javascript
// b(r) = b0²/r, where b0 = 1.5
const b0 = 1.5;

// At 2×r0:
const b_2r0 = (b0 ** 2) / (2 * b0);
console.assert(Math.abs(b_2r0 - 0.75) < 0.01, `b(2r₀) should be 0.75, got ${b_2r0}`);

// Flare-out: b'(r) = -b0²/r²
// At r0: b'(r0) = -b0²/r0² = -1 < 1 ✓
const db_dr = -(b0 ** 2) / (b0 ** 2);
console.assert(db_dr < 1, `b'(r₀) should be < 1, got ${db_dr}`);
```

## Visual Inspection Checklist

- [ ] Equation cards appear with correct LaTeX rendering
- [ ] Card backgrounds blur properly (backdrop-filter visible)
- [ ] Cyan/blue color scheme consistent throughout
- [ ] Glows/shadows render smoothly
- [ ] No text clipping or overlap
- [ ] Mobile layout doesn't overflow viewport
- [ ] Responsive breakpoints work (1200px, 768px)
- [ ] Animations are smooth (60 FPS on desktop)

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| FPS (Desktop) | 60 | _ |
| FPS (Mobile) | 30-45 | _ |
| HUD Update Frequency | 100ms | _ |
| Memory for HUD | <5 MB | _ |
| Card Opacity Transition | 0.4s | _ |
| Physics Calc Time | <1ms | _ |

## Bug Report Template

```
**Description**: [What went wrong]

**Steps to Reproduce**:
1. [First step]
2. [Second step]

**Expected**: [What should happen]
**Actual**: [What actually happens]

**Environment**:
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile]
- FPS: [60/30/unstable]

**Screenshots**: [If applicable]
```

## Troubleshooting

### Cards Not Appearing
- Check DevTools console for errors
- Verify equation display initialized: `scene.equationDisplay` should exist
- Check distance zones: Log `scene.currentDistance` value
- Inspect element: Cards should have opacity > 0

### Values Not Updating
- Check HUD update interval: 100ms throttle might delay visibility
- Verify physics calculations: Log `physics.getMetricsAtRadius(distance)`
- Check scene active: Is scene renderer running?

### Wrong Calculations
- Review physics.js constants (G, c, M_sun)
- Verify distance is in meters (scene units)
- Check metric formulas against references

### Performance Issues
- Profile with DevTools Performance tab
- Check if bloom pass enabled (usePostProcessing)
- Reduce particle counts on mobile
- Check for memory leaks (heap snapshots)

## Sign-off Checklist

- [ ] All physics calculations verified against formulas
- [ ] Equation cards appear and update correctly
- [ ] HUD panel displays all metrics smoothly
- [ ] Progressive reveal works by distance
- [ ] Visual glows sync with equation cards
- [ ] Mobile responsive without overflow
- [ ] Performance meets targets (60/30 FPS)
- [ ] No console errors
- [ ] Accessibility features working
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

## Success Criteria

✅ **Physics is Accurate**: Numeric values match theoretical calculations within 0.1% tolerance

✅ **UI is Clear**: Users can understand meaning of each equation without external help

✅ **Performance is Smooth**: No frame drops during normal gameplay

✅ **Mobile Works**: Fully playable on smartphones (iOS/Android)

✅ **Accessible**: Colorblind users, keyboard navigation, reduced motion support

Once all criteria are met, the physics education system is production-ready.
