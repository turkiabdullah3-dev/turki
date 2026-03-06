// Black hole scene renderer
// Owner: Turki Abdullah © 2026

import BlackHolePhysics from '../physics/blackhole.js';
import { safeNumber } from '../physics/safety.js';
import { sanitizeBlackHoleState, getVisualRadius } from '../physics/renderSafety.js';

class BlackHoleScene {
  constructor(canvasRoot) {
    this.canvasRoot = canvasRoot;
    this.physics = new BlackHolePhysics();
    this.distance = this.physics.r_s * 5; // Start at 5 r_s
    this.angle = 0;
    this.state = null;
    this.performanceMonitor = null; // Set externally
    this.blackHoleModel = localStorage.getItem('blackHoleModel') || 'schwarzschild';
    this.spinParameter = Math.max(0, Math.min(0.99, parseFloat(localStorage.getItem('blackHoleSpin') || '0') || 0));
  }
  
  /**
   * Initialize scene
   */
  init() {
    this.updatePhysics();
  }
  
  /**
   * Set performance monitor
   */
  setPerformanceMonitor(monitor) {
    this.performanceMonitor = monitor;
  }
  
  /**
   * Set observer distance
   */
  setDistance(radiusRatio) {
    // radiusRatio is r/r_s (user input from slider)
    this.distance = this.physics.r_s * radiusRatio;
    this.updatePhysics();
  }

  setBlackHoleModel(model) {
    this.blackHoleModel = model === 'kerr' ? 'kerr' : 'schwarzschild';
    localStorage.setItem('blackHoleModel', this.blackHoleModel);
    this.updatePhysics();
  }

  getBlackHoleModel() {
    return this.blackHoleModel;
  }

  setSpinParameter(spin) {
    this.spinParameter = Math.max(0, Math.min(0.99, safeNumber(spin, 0)));
    localStorage.setItem('blackHoleSpin', this.spinParameter.toFixed(2));
    this.updatePhysics();
  }

  getSpinParameter() {
    return this.spinParameter;
  }
  
  /**
   * Update physics state
   */
  updatePhysics() {
    this.state = {
      ...this.physics.getState(this.distance),
      blackHoleModel: this.blackHoleModel,
      spinParameter: this.spinParameter
    };
  }
  
  /**
   * Get current state for HUD
   */
  getState() {
    return this.state;
  }
  
  /**
   * Update scene
   */
  update(time) {
    // Slow rotation for observer position
    this.angle += 0.0005;
    // Store time for accretion disk rotation
    this.renderTime = time;
  }
  
  /**
   * Render black hole
   */
  render(time) {
    // CRITICAL: Sanitize state before rendering to prevent Infinity/NaN
    const safeState = sanitizeBlackHoleState(this.state);
    this.state = {
      ...this.state,
      ...safeState,
      blackHoleModel: this.blackHoleModel,
      spinParameter: this.spinParameter
    };
    
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const isKerr = this.blackHoleModel === 'kerr';
    const spin = isKerr ? this.spinParameter : 0;
    const kerrTwist = (this.renderTime || time) * (0.00035 + spin * 0.00085);
    const centerShiftX = Math.cos(kerrTwist) * horizonRadius * 0.08 * spin;
    const centerShiftY = Math.sin(kerrTwist * 0.7) * horizonRadius * 0.04 * spin;
    const kerrVisual = {
      isKerr,
      spin,
      kerrTwist,
      centerShiftX,
      centerShiftY
    };
    
    // Calculate visual sizes using safe getVisualRadius
    // VISUAL SCALE: Increased from 0.2 to 0.26 for better hero prominence
    const horizonRadius = getVisualRadius(this.physics.r_s, this.physics.r_s, Math.min(width, height) * 0.26);
    const photonRadius = getVisualRadius(this.physics.r_photon, this.physics.r_s, Math.min(width, height) * 0.2);
    const observerRadius = getVisualRadius(this.distance, this.physics.r_s, Math.min(width, height) * 0.2);
    
    // Draw photon sphere with enhanced visuals
    this.drawPhotonSphere(centerX, centerY, photonRadius, kerrVisual);
    
    // Draw accretion disk (simplified)
    this.drawAccretionDisk(centerX, centerY, horizonRadius, photonRadius, this.renderTime || time, kerrVisual);
    
    // Draw event horizon (black circle with glow)
    this.drawEventHorizon(centerX, centerY, horizonRadius, kerrVisual);

    if (isKerr && spin > 0.02) {
      this.drawErgosphereOverlay(centerX, centerY, horizonRadius, kerrVisual);
    }
    
    // Draw observer position
    const obsX = centerX + Math.cos(this.angle + spin * 0.35) * observerRadius;
    const obsY = centerY + Math.sin(this.angle + spin * 0.22) * observerRadius;
    
    ctx.fillStyle = 'rgba(255, 200, 100, 0.8)';
    ctx.beginPath();
    ctx.arc(obsX, obsY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw line to observer
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(obsX, obsY);
    ctx.stroke();
    
    // Add gravitational lensing effect (vignette based on distance)
    this.drawLensingEffect();
  }
  
  /**
   * Calculate visual radius for screen
   */
  calculateVisualRadius(physicalRadius) {
    const { width, height } = this.canvasRoot.getDimensions();
    const screenSize = Math.min(width, height);
    
    // Logarithmic scale for better visualization
    const normalized = Math.log(physicalRadius / this.physics.r_s + 1) / Math.log(10);
    return normalized * screenSize * 0.15;
  }
  
  /**
   * Draw event horizon with photon sphere and accretion glow
   */
  drawEventHorizon(x, y, radius, kerrVisual = { isKerr: false, spin: 0, kerrTwist: 0, centerShiftX: 0, centerShiftY: 0 }) {
    const ctx = this.canvasRoot.getContext();
    
    // Get quality settings
    const qualitySettings = this.performanceMonitor 
      ? this.performanceMonitor.getQualitySettings() 
      : { enableGlow: true, glowIntensity: 1.0 };
    
    const glowMultiplier = qualitySettings.glowIntensity;
    const ringScaleX = 1 + (kerrVisual.isKerr ? 0.08 * kerrVisual.spin : 0);
    const ringScaleY = 1 - (kerrVisual.isKerr ? 0.08 * kerrVisual.spin : 0);
    const shiftedX = x + kerrVisual.centerShiftX;
    const shiftedY = y + kerrVisual.centerShiftY;
    
    // LAYER 1: Deep shadow core
    const shadowGradient = ctx.createRadialGradient(shiftedX, shiftedY, 0, shiftedX, shiftedY, radius * 1.5);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    shadowGradient.addColorStop(0.6, 'rgba(20, 0, 40, 0.95)');
    shadowGradient.addColorStop(1, 'rgba(40, 20, 80, 0.5)');
    
    ctx.fillStyle = shadowGradient;
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.4);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // LAYER 2: Main glow gradient
    const gradient = ctx.createRadialGradient(shiftedX, shiftedY, radius * 0.8, shiftedX, shiftedY, radius * 1.3);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, `rgba(80, 40, 120, ${Math.min(1, (0.6 + this.state.alpha * 0.4) * glowMultiplier)})`);
    gradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
    
    ctx.fillStyle = gradient;
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.5);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // LAYER 3: Black hole itself
    ctx.fillStyle = '#000000';
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.65);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // LAYER 4: Subtle rotating glow halo (quality-dependent)
    if (qualitySettings.enableGlow && qualitySettings.effectsMultiplier > 0.5) {
      const shimmerAngle = performance.now() * 0.0008;
      const shimmerGradient = ctx.createRadialGradient(
        shiftedX + Math.cos(shimmerAngle + kerrVisual.spin) * radius * (0.3 + 0.1 * kerrVisual.spin),
        shiftedY + Math.sin(shimmerAngle + kerrVisual.spin) * radius * (0.3 + 0.08 * kerrVisual.spin),
        radius * 0.5,
        x, y, radius * 1.8
      );
      shimmerGradient.addColorStop(0, `rgba(200, 120, 240, ${0.25 * glowMultiplier})`);
      shimmerGradient.addColorStop(0.5, `rgba(160, 80, 200, ${0.12 * glowMultiplier})`);
      shimmerGradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
      ctx.fillStyle = shimmerGradient;
      ctx.save();
      if (kerrVisual.isKerr) {
        ctx.translate(x, y);
        ctx.rotate(kerrVisual.kerrTwist * 0.45);
        ctx.scale(1 + 0.12 * kerrVisual.spin, 1 - 0.09 * kerrVisual.spin);
        ctx.translate(-x, -y);
      }
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // LAYER 5: Event horizon ring (always visible, subtle)
    ctx.strokeStyle = `rgba(200, 100, 200, ${0.3 + 0.2 * Math.sin(performance.now() * 0.002)})`;
    ctx.lineWidth = 2;
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.7);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  
  /**
   * Draw accretion disk with enhanced visuals
   */
  drawAccretionDisk(x, y, innerRadius, outerRadius, time, kerrVisual = { isKerr: false, spin: 0, kerrTwist: 0 }) {
    const ctx = this.canvasRoot.getContext();
    
    // Disk rotation
    const rotation = time * 0.0002 + (kerrVisual.isKerr ? kerrVisual.spin * 0.65 : 0);
    
    // ENHANCEMENT: Add glow effect proportional to time dilation distortion
    const glowStrength = Math.max(0.1, Math.min(1, this.state.alpha)); // More glow when alpha is lower (closer to horizon)
    
    // Draw disk as multiple ellipses with enhanced color/glow
    for (let i = 0; i < 25; i++) {
      const t = i / 25;
      const radius = innerRadius + (outerRadius - innerRadius) * t;
      const alpha = 0.15 * (1 - t) * glowStrength;
      
      // Color shifts from hot orange (inner) to cool red (outer), with time dilation brightness
      const hue = 30 - t * 25; // Orange to red to dark
      const saturation = 100 - t * 30; // More saturated inner disk
      const lightness = 55 + t * 5; // Slightly brighter outer disk
      
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = 2.5 + t * 1.5; // Thicker outer rings
      ctx.beginPath();
      const diskY = radius * (0.25 - (kerrVisual.isKerr ? 0.07 * kerrVisual.spin : 0));
      const layerRotation = rotation + (kerrVisual.isKerr ? t * 0.22 * kerrVisual.spin : 0);
      const offsetX = kerrVisual.isKerr ? Math.cos(layerRotation * 2.0) * innerRadius * 0.08 * kerrVisual.spin : 0;
      ctx.ellipse(x + offsetX, y, radius, diskY, layerRotation, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // ENHANCEMENT: Adds a subtle photon sphere glow inside the accretion disk
    // This represents the region where light orbits
    const photonGlowGradient = ctx.createRadialGradient(
      x + (kerrVisual.isKerr ? kerrVisual.spin * outerRadius * 0.05 : 0),
      y,
      outerRadius * 0.6,
      x,
      y,
      outerRadius * 1.0
    );
    photonGlowGradient.addColorStop(0, `rgba(150, 200, 255, ${0.1 * glowStrength})`);
    photonGlowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    
    ctx.fillStyle = photonGlowGradient;
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw photon sphere ring with enhanced visibility
   */
  drawPhotonSphere(x, y, radius, kerrVisual = { isKerr: false, spin: 0, kerrTwist: 0 }) {
    const ctx = this.canvasRoot.getContext();
    const ringScaleX = 1 + (kerrVisual.isKerr ? 0.06 * kerrVisual.spin : 0);
    const ringScaleY = 1 - (kerrVisual.isKerr ? 0.06 * kerrVisual.spin : 0);
    const ringX = x + (kerrVisual.isKerr ? kerrVisual.centerShiftX * 0.6 : 0);
    const ringY = y + (kerrVisual.isKerr ? kerrVisual.centerShiftY * 0.6 : 0);
    
    // LAYER 1: Glow halo
    const haloGradient = ctx.createRadialGradient(ringX, ringY, radius * 0.7, ringX, ringY, radius * 1.3);
    haloGradient.addColorStop(0, 'rgba(100, 180, 255, 0.2)');
    haloGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.08)');
    haloGradient.addColorStop(1, 'rgba(80, 120, 255, 0)');
    
    ctx.fillStyle = haloGradient;
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.35);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // LAYER 2: Main photon sphere ring (bright, always visible)
    ctx.strokeStyle = `rgba(120, 180, 255, ${0.5 + 0.15 * Math.sin(performance.now() * 0.003)})`;
    ctx.lineWidth = 3;
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.55);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // LAYER 3: Inner structure hint
    ctx.strokeStyle = 'rgba(100, 160, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Dashed line
    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(x, y);
      ctx.rotate(kerrVisual.kerrTwist * 0.85);
      ctx.scale(ringScaleX, ringScaleY);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.setLineDash([]); // Reset line dash
  }

  drawErgosphereOverlay(x, y, radius, kerrVisual) {
    const ctx = this.canvasRoot.getContext();
    const qualitySettings = this.performanceMonitor
      ? this.performanceMonitor.getQualitySettings()
      : { effectsMultiplier: 1, glowIntensity: 1 };

    if (qualitySettings.effectsMultiplier < 0.35) {
      return;
    }

    const spin = kerrVisual.spin;
    const ergoRadius = radius * (1.25 + 0.28 * spin);
    const scaleX = 1 + 0.18 * spin;
    const scaleY = 1 - 0.18 * spin;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(kerrVisual.kerrTwist * 0.9);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-x, -y);

    ctx.strokeStyle = `rgba(110, 190, 255, ${0.16 + 0.14 * spin})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(x + kerrVisual.centerShiftX * 0.8, y + kerrVisual.centerShiftY * 0.8, ergoRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }
  
  /**
   * Draw gravitational lensing effect (simple vignette)
   */
  drawLensingEffect() {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    // Stronger effect when closer
    const strength = Math.max(0, 1 - this.state.r_normalized / 10);
    
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.3})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${strength * 0.6})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

export default BlackHoleScene;
