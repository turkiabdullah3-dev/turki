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
  
  /**
   * Update physics state
   */
  updatePhysics() {
    this.state = this.physics.getState(this.distance);
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
    this.state = safeState; // Update with safe values
    
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate visual sizes using safe getVisualRadius
    // VISUAL SCALE: Increased from 0.2 to 0.26 for better hero prominence
    const horizonRadius = getVisualRadius(this.physics.r_s, this.physics.r_s, Math.min(width, height) * 0.26);
    const photonRadius = getVisualRadius(this.physics.r_photon, this.physics.r_s, Math.min(width, height) * 0.2);
    const observerRadius = getVisualRadius(this.distance, this.physics.r_s, Math.min(width, height) * 0.2);
    
    // Draw photon sphere with enhanced visuals
    this.drawPhotonSphere(centerX, centerY, photonRadius);
    
    // Draw accretion disk (simplified)
    this.drawAccretionDisk(centerX, centerY, horizonRadius, photonRadius, this.renderTime || time);
    
    // Draw event horizon (black circle with glow)
    this.drawEventHorizon(centerX, centerY, horizonRadius);
    
    // Draw observer position
    const obsX = centerX + Math.cos(this.angle) * observerRadius;
    const obsY = centerY + Math.sin(this.angle) * observerRadius;
    
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
  drawEventHorizon(x, y, radius) {
    const ctx = this.canvasRoot.getContext();
    
    // Get quality settings
    const qualitySettings = this.performanceMonitor 
      ? this.performanceMonitor.getQualitySettings() 
      : { enableGlow: true, glowIntensity: 1.0 };
    
    const glowMultiplier = qualitySettings.glowIntensity;
    
    // LAYER 1: Deep shadow core
    const shadowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    shadowGradient.addColorStop(0.6, 'rgba(20, 0, 40, 0.95)');
    shadowGradient.addColorStop(1, 'rgba(40, 20, 80, 0.5)');
    
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // LAYER 2: Main glow gradient
    const gradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.3);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, `rgba(80, 40, 120, ${Math.min(1, (0.6 + this.state.alpha * 0.4) * glowMultiplier)})`);
    gradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // LAYER 3: Black hole itself
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // LAYER 4: Subtle rotating glow halo (quality-dependent)
    if (qualitySettings.enableGlow && qualitySettings.effectsMultiplier > 0.5) {
      const shimmerAngle = performance.now() * 0.0008;
      const shimmerGradient = ctx.createRadialGradient(
        x + Math.cos(shimmerAngle) * radius * 0.3,
        y + Math.sin(shimmerAngle) * radius * 0.3,
        radius * 0.5,
        x, y, radius * 1.8
      );
      shimmerGradient.addColorStop(0, `rgba(200, 120, 240, ${0.25 * glowMultiplier})`);
      shimmerGradient.addColorStop(0.5, `rgba(160, 80, 200, ${0.12 * glowMultiplier})`);
      shimmerGradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
      ctx.fillStyle = shimmerGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // LAYER 5: Event horizon ring (always visible, subtle)
    ctx.strokeStyle = `rgba(200, 100, 200, ${0.3 + 0.2 * Math.sin(performance.now() * 0.002)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * Draw accretion disk with enhanced visuals
   */
  drawAccretionDisk(x, y, innerRadius, outerRadius, time) {
    const ctx = this.canvasRoot.getContext();
    
    // Disk rotation
    const rotation = time * 0.0002;
    
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
      ctx.ellipse(x, y, radius, radius * 0.25, rotation, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // ENHANCEMENT: Adds a subtle photon sphere glow inside the accretion disk
    // This represents the region where light orbits
    const photonGlowGradient = ctx.createRadialGradient(
      x, y, outerRadius * 0.6,
      x, y, outerRadius * 1.0
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
  drawPhotonSphere(x, y, radius) {
    const ctx = this.canvasRoot.getContext();
    
    // LAYER 1: Glow halo
    const haloGradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius * 1.3);
    haloGradient.addColorStop(0, 'rgba(100, 180, 255, 0.2)');
    haloGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.08)');
    haloGradient.addColorStop(1, 'rgba(80, 120, 255, 0)');
    
    ctx.fillStyle = haloGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // LAYER 2: Main photon sphere ring (bright, always visible)
    ctx.strokeStyle = `rgba(120, 180, 255, ${0.5 + 0.15 * Math.sin(performance.now() * 0.003)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // LAYER 3: Inner structure hint
    ctx.strokeStyle = 'rgba(100, 160, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Dashed line
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
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
