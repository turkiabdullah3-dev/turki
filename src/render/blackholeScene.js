// Black hole scene renderer
// Owner: Turki Abdullah © 2026

import BlackHolePhysics from '../physics/blackhole.js';
import { safeNumber } from '../physics/safety.js';
import { sanitizeBlackHoleState, getVisualRadius } from '../physics/renderSafety.js';
import CameraController from './cameraController.js';

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
    this.observationMode = localStorage.getItem('observationMode') || 'simulation';
    this.lensingSamples = this.createLensingSamples(96);
    
    // Initialize camera controller for free navigation
    this.cameraController = new CameraController(canvasRoot, 1.5, 50);
  }

  createLensingSamples(count) {
    const samples = [];
    for (let index = 0; index < count; index += 1) {
      const t = (index + 0.5) / count;
      const angle = t * Math.PI * 2;
      const wobble = Math.sin(index * 12.9898) * 43758.5453;
      const fract = wobble - Math.floor(wobble);

      samples.push({
        angle,
        radialBand: 0.9 + fract * 1.6,
        phase: fract * Math.PI * 2,
        brightness: 0.35 + fract * 0.65,
        size: 0.8 + fract * 1.4
      });
    }
    return samples;
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

  setObservationMode(mode) {
    this.observationMode = mode === 'telescope' ? 'telescope' : 'simulation';
    localStorage.setItem('observationMode', this.observationMode);
  }

  getObservationMode() {
    return this.observationMode;
  }

  /**
   * Get camera controller for external control
   */
  getCameraController() {
    return this.cameraController;
  }

  /**
   * Reset camera to default position
   */
  resetCamera() {
    this.cameraController.reset();
  }
  
  /**
   * Update physics state
   */
  updatePhysics() {
    this.state = {
      ...this.physics.getState(this.distance),
      blackHoleModel: this.blackHoleModel,
      spinParameter: this.spinParameter,
      observationMode: this.observationMode
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
    // Update camera controller (smooth interpolation)
    this.cameraController.update();
    
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

    // Apply camera zoom (1.0 = normal, < 1.0 = zoomed in, > 1.0 = zoomed out)
    const cameraZoom = 1.0 + (this.cameraController.distance - this.cameraController.defaultDistance) * 0.08;

    // Calculate visual sizes using safe getVisualRadius
    // VISUAL SCALE: Increased from 0.2 to 0.26 for better hero prominence
    // Apply camera zoom to scale everything
    const horizonRadius = getVisualRadius(this.physics.r_s, this.physics.r_s, Math.min(width, height) * 0.26 / cameraZoom);
    const photonRadius = getVisualRadius(this.physics.r_photon, this.physics.r_s, Math.min(width, height) * 0.2 / cameraZoom);
    const observerRadius = getVisualRadius(this.distance, this.physics.r_s, Math.min(width, height) * 0.2 / cameraZoom);
    
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
    
    this.drawLensingEffect(centerX, centerY, horizonRadius, photonRadius, kerrVisual, this.renderTime || time);
    
    // Draw photon sphere with enhanced visuals
    this.drawPhotonSphere(centerX, centerY, photonRadius, kerrVisual);
    
    // Draw accretion disk (simplified)
    this.drawAccretionDisk(centerX, centerY, horizonRadius, photonRadius, this.renderTime || time, kerrVisual);
    
    // Draw event horizon (black circle with glow)
    this.drawEventHorizon(centerX, centerY, horizonRadius, kerrVisual);

    if (isKerr && spin > 0.02) {
      this.drawErgosphereOverlay(centerX, centerY, horizonRadius, kerrVisual);
    }
    
    // Apply telescope observation effects if enabled
    if (this.observationMode === 'telescope') {
      this.drawTelescopeEffects(centerX, centerY, horizonRadius, photonRadius, kerrVisual);
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
    
    // Add subtle global darkening related to lensing depth
    this.drawLensingVignette(centerX, centerY);
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
   * Draw accretion disk with enhanced visuals, Doppler boosting, and gravitational redshift
   */
  drawAccretionDisk(x, y, innerRadius, outerRadius, time, kerrVisual = { isKerr: false, spin: 0, kerrTwist: 0 }) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    // Disk rotation - faster near horizon, slower at outer edges (realistic Keplerian)
    const baseRotation = time * 0.0002 + (kerrVisual.isKerr ? kerrVisual.spin * 0.65 : 0);
    
    // ENHANCEMENT: Add glow effect proportional to time dilation distortion
    const glowStrength = Math.max(0.1, Math.min(1, this.state.alpha)); // More glow when alpha is lower (closer to horizon)
    
    // Draw disk as multiple concentric rings with realistic plasma physics
    const ringCount = 28;
    for (let i = 0; i < ringCount; i++) {
      const t = i / ringCount;
      const radius = innerRadius + (outerRadius - innerRadius) * t;
      
      // Keplerian rotation: slower at outer edges (v ∝ 1/√r)
      const keperianFactor = Math.sqrt(1 - t * 0.4);
      const layerRotation = baseRotation * keperianFactor + (kerrVisual.isKerr ? t * 0.22 * kerrVisual.spin : 0);
      
      // ===== DOPPLER BOOSTING =====
      // Brighter on the approaching side (blueward), dimmer on receding side (redward)
      // Maximum boost at 0° (right), maximum dimming at 180° (left)
      let dopplerBoost = 1.0;
      let colorShift = 0;
      
      // Draw disk segment by segment to apply Doppler effect
      const segmentCount = 32;
      for (let seg = 0; seg < segmentCount; seg++) {
        const angle1 = (seg / segmentCount) * Math.PI * 2 + layerRotation;
        const angle2 = ((seg + 1) / segmentCount) * Math.PI * 2 + layerRotation;
        
        // Doppler effect: cos(angle) gives max boost at 0° (approaching), max dimming at 180° (receding)
        const dopplerAngle = angle1 + (angle2 - angle1) / 2;
        const cosDoppler = Math.cos(dopplerAngle);
        dopplerBoost = 1.0 + 0.5 * cosDoppler; // Range: 0.5 to 1.5
        colorShift = cosDoppler * 15; // Blueshift (positive) to redshift (negative)
        
        // ===== GRAVITATIONAL REDSHIFT =====
        // Regions closer to event horizon are redshifted and darkened
        const horizonProximity = (radius - innerRadius) / (outerRadius - innerRadius);
        const redshiftFactor = Math.pow(0.7, 1 - horizonProximity); // Stronger redshift near horizon
        const finalRedshift = colorShift + (1 - horizonProximity) * 30 * (1 - redshiftFactor);
        
        // ===== REALISTIC PLASMA COLORS =====
        // Inner disk: blue-white hot plasma (inner accretion)
        // Middle disk: orange-yellow (mid-temperature)
        // Outer disk: deep red (cooler, outer accretion)
        let hue, saturation, lightness, baseAlpha;
        
        if (horizonProximity < 0.33) {
          // Inner hot plasma: blue-white
          hue = 200 - horizonProximity * 50 + finalRedshift * 0.3;
          saturation = 80 - horizonProximity * 20;
          lightness = 70 - horizonProximity * 20;
          baseAlpha = 0.22 * dopplerBoost;
        } else if (horizonProximity < 0.66) {
          // Mid-range: orange-yellow
          hue = 30 + (horizonProximity - 0.33) * 20 + finalRedshift * 0.3;
          saturation = 95;
          lightness = 65 - (horizonProximity - 0.33) * 15;
          baseAlpha = 0.18 * dopplerBoost;
        } else {
          // Outer cooler disk: red
          hue = 15 + (horizonProximity - 0.66) * 30 + finalRedshift * 0.3;
          saturation = 85;
          lightness = 55 - (horizonProximity - 0.66) * 10;
          baseAlpha = 0.14 * dopplerBoost;
        }
        
        // Apply time dilation brightness based on observer distance
        const finalAlpha = baseAlpha * glowStrength * (0.8 + 0.2 * Math.sin(performance.now() * 0.0008 + seg * 0.2));
        
        // Draw segment
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${finalAlpha})`;
        ctx.beginPath();
        
        // Ellipse parameters for flat disk perspective
        const diskY = radius * (0.25 - (kerrVisual.isKerr ? 0.07 * kerrVisual.spin : 0));
        const diskScaleX = 1 + (kerrVisual.isKerr ? kerrVisual.spin * 0.12 : 0);
        
        // Draw curved segment of ring
        const x1 = x + radius * Math.cos(angle1) * diskScaleX;
        const y1 = y + diskY * Math.sin(angle1);
        const x2 = x + radius * Math.cos(angle2) * diskScaleX;
        const y2 = y + diskY * Math.sin(angle2);
        
        // Create radial gradient for each segment for smooth color transitions
        const segGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        segGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${finalAlpha})`);
        segGradient.addColorStop(1, `hsla(${hue + 5}, ${saturation - 5}%, ${lightness - 5}%, ${finalAlpha * 0.7})`);
        
        ctx.fillStyle = segGradient;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        // Inner and outer radius
        const x1Inner = x + (radius - 1.5) * Math.cos(angle1) * diskScaleX;
        const y1Inner = y + (diskY * 0.95) * Math.sin(angle1);
        const x2Inner = x + (radius - 1.5) * Math.cos(angle2) * diskScaleX;
        const y2Inner = y + (diskY * 0.95) * Math.sin(angle2);
        
        ctx.lineTo(x2Inner, y2Inner);
        ctx.lineTo(x1Inner, y1Inner);
        ctx.fill();
      }
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
    
    // Add relativistic jets if quality allows
    const qualitySettings = this.performanceMonitor
      ? this.performanceMonitor.getQualitySettings()
      : { effectsMultiplier: 1 };
    
    if (qualitySettings.effectsMultiplier > 0.5) {
      this.drawRelativisticJets(x, y, innerRadius, outerRadius, baseRotation, kerrVisual);
    }
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
  drawLensingEffect(centerX, centerY, horizonRadius, photonRadius, kerrVisual, time) {
    const ctx = this.canvasRoot.getContext();

    const qualitySettings = this.performanceMonitor
      ? this.performanceMonitor.getQualitySettings()
      : { effectsMultiplier: 1, enableDistortion: true };

    const effectsLevel = qualitySettings.effectsMultiplier ?? 1;
    const nearStrength = Math.max(0.2, Math.min(1.1, 1.2 - this.state.r_normalized / 12));
    const photonBlend = Math.max(0.1, Math.min(1, effectsLevel * nearStrength));
    const spin = kerrVisual.isKerr ? kerrVisual.spin : 0;
    const fieldOuter = photonRadius * (2.1 + 0.6 * effectsLevel);

    // Radial distortion field glow (lightweight, localized)
    const fieldGradient = ctx.createRadialGradient(
      centerX + kerrVisual.centerShiftX * 0.6,
      centerY + kerrVisual.centerShiftY * 0.6,
      horizonRadius * 0.8,
      centerX,
      centerY,
      fieldOuter
    );
    fieldGradient.addColorStop(0, 'rgba(255,255,255,0)');
    fieldGradient.addColorStop(0.45, `rgba(130, 170, 255, ${0.09 * photonBlend})`);
    fieldGradient.addColorStop(0.72, `rgba(110, 155, 255, ${0.055 * photonBlend})`);
    fieldGradient.addColorStop(1, 'rgba(90, 130, 230, 0)');

    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(centerX, centerY);
      ctx.rotate(kerrVisual.kerrTwist * 0.52);
      ctx.scale(1 + spin * 0.15, 1 - spin * 0.1);
      ctx.translate(-centerX, -centerY);
    }
    ctx.fillStyle = fieldGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, fieldOuter, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const tracerCount = qualitySettings.enableDistortion
      ? Math.floor(72 * effectsLevel)
      : Math.floor(34 * effectsLevel + 12);
    const activeSamples = this.lensingSamples.slice(0, Math.max(16, tracerCount));
    const sigma = photonRadius * 0.45;

    // Bent light tracers (localized; no full-screen pixel loops)
    for (let index = 0; index < activeSamples.length; index += 1) {
      const sample = activeSamples[index];
      const theta = sample.angle + (time * 0.00005) + sample.phase * 0.08;
      const asymmetry = kerrVisual.isKerr
        ? (1 + spin * 0.22 * Math.cos(theta - kerrVisual.kerrTwist * 1.6))
        : 1;
      const baseR = photonRadius * sample.radialBand * asymmetry;

      const distanceFromPhoton = baseR - photonRadius;
      const lensCore = Math.exp(-((distanceFromPhoton * distanceFromPhoton) / (2 * sigma * sigma)));
      const lensStrength = lensCore * photonBlend;
      if (lensStrength < 0.03) {
        continue;
      }

      const tangentialTwist = (0.22 + spin * 0.32) * lensStrength;
      const localTheta = theta + tangentialTwist;

      const radialX = Math.cos(localTheta);
      const radialY = Math.sin(localTheta);
      const tangentX = -radialY;
      const tangentY = radialX;

      const startR = baseR - photonRadius * 0.045 * lensStrength;
      const endR = baseR + photonRadius * 0.11 * lensStrength;
      const frameDragShift = kerrVisual.isKerr ? spin * lensStrength * photonRadius * 0.05 : 0;

      const startX = centerX + radialX * startR + tangentX * frameDragShift;
      const startY = centerY + radialY * startR + tangentY * frameDragShift;
      const endX = centerX + radialX * endR + tangentX * (frameDragShift + photonRadius * 0.055 * lensStrength);
      const endY = centerY + radialY * endR + tangentY * (frameDragShift + photonRadius * 0.055 * lensStrength);

      const opacity = (0.06 + sample.brightness * 0.19) * lensStrength;
      const width = (0.5 + sample.size * 0.9) * (0.85 + effectsLevel * 0.25);

      ctx.strokeStyle = `rgba(205, 225, 255, ${opacity})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    this.drawEinsteinRing(centerX, centerY, photonRadius, kerrVisual, photonBlend, qualitySettings);
  }

  drawEinsteinRing(centerX, centerY, photonRadius, kerrVisual, photonBlend, qualitySettings) {
    const ctx = this.canvasRoot.getContext();
    const spin = kerrVisual.isKerr ? kerrVisual.spin : 0;
    const ringRadius = photonRadius * (1.0 + 0.02 * Math.sin((this.renderTime || 0) * 0.0017));
    const ringAlpha = (0.08 + 0.12 * photonBlend) * (0.75 + 0.25 * qualitySettings.effectsMultiplier);

    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(centerX, centerY);
      ctx.rotate(kerrVisual.kerrTwist * 0.75);
      ctx.scale(1 + spin * 0.07, 1 - spin * 0.055);
      ctx.translate(-centerX, -centerY);
    }

    ctx.strokeStyle = `rgba(170, 210, 255, ${ringAlpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(centerX + kerrVisual.centerShiftX * 0.25, centerY + kerrVisual.centerShiftY * 0.25, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(210, 235, 255, ${ringAlpha * 0.45})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(centerX + kerrVisual.centerShiftX * 0.2, centerY + kerrVisual.centerShiftY * 0.2, ringRadius * 1.012, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawLensingVignette(centerX, centerY) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();

    const strength = Math.max(0, 1 - this.state.r_normalized / 10);

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(width, height) / 2
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.25})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${strength * 0.5})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw telescope observation effects
   * Simulates how a real telescope would observe a black hole
   */
  drawTelescopeEffects(centerX, centerY, horizonRadius, photonRadius, kerrVisual) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();

    const qualitySettings = this.performanceMonitor
      ? this.performanceMonitor.getQualitySettings()
      : { effectsMultiplier: 1, enableDistortion: true };

    // 1. Emphasize photon ring with bright halo
    const ringEmphasisGradient = ctx.createRadialGradient(
      centerX, centerY, photonRadius * 0.92,
      centerX, centerY, photonRadius * 1.25
    );
    ringEmphasisGradient.addColorStop(0, 'rgba(255, 200, 100, 0.35)');
    ringEmphasisGradient.addColorStop(0.5, 'rgba(255, 180, 80, 0.15)');
    ringEmphasisGradient.addColorStop(1, 'rgba(220, 150, 60, 0)');

    ctx.fillStyle = ringEmphasisGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, photonRadius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // 2. Strong black hole shadow emphasis
    const shadowGradient = ctx.createRadialGradient(
      centerX, centerY, horizonRadius * 0.5,
      centerX, centerY, horizonRadius * 1.1
    );
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    shadowGradient.addColorStop(0.7, 'rgba(10, 5, 20, 0.88)');
    shadowGradient.addColorStop(1, 'rgba(30, 20, 50, 0.4)');

    ctx.save();
    if (kerrVisual.isKerr) {
      ctx.translate(centerX, centerY);
      ctx.rotate(kerrVisual.kerrTwist * 0.4);
      ctx.scale(1 + kerrVisual.spin * 0.08, 1 - kerrVisual.spin * 0.08);
      ctx.translate(-centerX, -centerY);
    }
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, horizonRadius * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Add subtle blur-like effect via soft edges
    const blurGradient = ctx.createRadialGradient(
      centerX, centerY, photonRadius * 0.8,
      centerX, centerY, photonRadius * 1.5
    );
    blurGradient.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
    blurGradient.addColorStop(0.6, 'rgba(20, 10, 40, 0.12)');
    blurGradient.addColorStop(1, 'rgba(40, 20, 60, 0.06)');

    ctx.fillStyle = blurGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, photonRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Add subtle observational artifacts (random noise layer)
    if (qualitySettings.effectsMultiplier > 0.4) {
      this.drawObservationArtifacts(centerX, centerY, horizonRadius, photonRadius);
    }

    // 5. Reduce background star field brightness (simulate observational focus)
    const backdropDim = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(width, height)
    );
    backdropDim.addColorStop(0, 'rgba(0, 0, 0, 0)');
    backdropDim.addColorStop(0.4, 'rgba(0, 0, 0, 0.15)');
    backdropDim.addColorStop(1, 'rgba(0, 0, 0, 0.25)');

    ctx.fillStyle = backdropDim;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw subtle observational artifacts (sensor noise, diffraction)
   */
  drawObservationArtifacts(centerX, centerY, horizonRadius, photonRadius) {
    const ctx = this.canvasRoot.getContext();
    const artifactRadius = horizonRadius * 1.8;
    const artifactCount = 12;

    // Subtle diffraction-like spikes
    for (let i = 0; i < artifactCount; i++) {
      const angle = (i / artifactCount) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * artifactRadius * 0.6;
      const y1 = centerY + Math.sin(angle) * artifactRadius * 0.6;
      const x2 = centerX + Math.cos(angle) * artifactRadius * 1.1;
      const y2 = centerY + Math.sin(angle) * artifactRadius * 1.1;

      ctx.strokeStyle = `rgba(200, 200, 200, ${0.06 + 0.04 * Math.sin(performance.now() * 0.001 + i)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Subtle luminosity variation rings (sensor artifacts)
    for (let ring = 0; ring < 3; ring++) {
      const variation = 0.02 * (ring + 1);
      const noisePhase = performance.now() * 0.0003 + ring * 1.2;
      const ringradiusBase = horizonRadius * (1.2 + ring * 0.35);
      const ringRadiusVar = ringradiusBase + Math.sin(noisePhase) * photonRadius * variation;

      ctx.strokeStyle = `rgba(150, 150, 200, ${0.035 + 0.025 * Math.sin(noisePhase * 0.5)})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadiusVar, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Draw relativistic jets emerging from black hole poles
   * These represent high-energy particle flows in active galactic nuclei
   */
  drawRelativisticJets(x, y, innerRadius, outerRadius, time, kerrVisual) {
    const ctx = this.canvasRoot.getContext();
    const { height } = this.canvasRoot.getDimensions();

    const jetScale = outerRadius * 2.5;
    const jetWidth = innerRadius * 0.35;

    // North jet
    this.drawJet(ctx, x, y - jetScale, x, y - height / 2, jetWidth, time, 'north', kerrVisual);
    
    // South jet
    this.drawJet(ctx, x, y + jetScale, x, y + height / 2, jetWidth, time, 'south', kerrVisual);
  }

  /**
   * Helper to draw a single relativistic jet with energy flow animation
   */
  drawJet(ctx, startX, startY, endX, endY, width, time, direction, kerrVisual) {
    const isNorth = direction === 'north';
    const jetLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

    // Jet color: white-blue high-energy plasma
    const jetGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    
    // Animation: flowing particles moving along jet
    const flowPhase = (time * 0.001) % 1;
    
    jetGradient.addColorStop(0, `rgba(150, 200, 255, 0.4)`);
    jetGradient.addColorStop(0.2, `rgba(200, 220, 255, 0.35)`);
    jetGradient.addColorStop(0.5, `rgba(180, 200, 255, 0.2)`);
    jetGradient.addColorStop(0.8, `rgba(150, 180, 255, 0.1)`);
    jetGradient.addColorStop(1, `rgba(100, 150, 255, 0)`);

    ctx.fillStyle = jetGradient;
    ctx.strokeStyle = `rgba(200, 220, 255, 0.25)`;
    ctx.lineWidth = 1;

    // Draw jet cone (wider at base, narrower at tip)
    const baseWidth = width;
    const tipWidth = width * 0.3;
    
    const dx = (endX - startX) / jetLength;
    const dy = (endY - startY) / jetLength;
    const perpX = -dy;
    const perpY = dx;

    ctx.beginPath();
    ctx.moveTo(startX - perpX * baseWidth, startY - perpY * baseWidth);
    ctx.lineTo(startX + perpX * baseWidth, startY + perpY * baseWidth);
    ctx.lineTo(endX + perpX * tipWidth, endY + perpY * tipWidth);
    ctx.lineTo(endX - perpX * tipWidth, endY - perpY * tipWidth);
    ctx.fill();
    ctx.stroke();

    // Draw animated flow particles
    const particleCount = 5;
    for (let p = 0; p < particleCount; p++) {
      const particlePhase = (flowPhase + p / particleCount) % 1;
      const particleX = startX + (endX - startX) * particlePhase;
      const particleY = startY + (endY - startY) * particlePhase;
      
      const particleAlpha = Math.sin(particlePhase * Math.PI) * 0.5;
      const particleSize = (1 - particlePhase) * width * 0.4;

      ctx.fillStyle = `rgba(220, 240, 255, ${particleAlpha})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();

      // Glow around particles
      const glowGradient = ctx.createRadialGradient(
        particleX, particleY, 0,
        particleX, particleY, particleSize * 1.5
      );
      glowGradient.addColorStop(0, `rgba(200, 230, 255, ${particleAlpha * 0.4})`);
      glowGradient.addColorStop(1, `rgba(150, 200, 255, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default BlackHoleScene;
