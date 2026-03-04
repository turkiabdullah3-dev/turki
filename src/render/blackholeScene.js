// Black hole scene renderer
// Owner: Turki Abdullah © 2026

import BlackHolePhysics from '../physics/blackhole.js';
import { safeNumber } from '../physics/safety.js';

class BlackHoleScene {
  constructor(canvasRoot) {
    this.canvasRoot = canvasRoot;
    this.physics = new BlackHolePhysics();
    this.distance = this.physics.r_s * 5; // Start at 5 r_s
    this.angle = 0;
    this.state = null;
  }
  
  /**
   * Initialize scene
   */
  init() {
    this.updatePhysics();
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
    // Slow rotation
    this.angle += 0.0005;
  }
  
  /**
   * Render black hole
   */
  render(time) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate visual sizes
    const horizonRadius = this.calculateVisualRadius(this.physics.r_s);
    const photonRadius = this.calculateVisualRadius(this.physics.r_photon);
    const observerRadius = this.calculateVisualRadius(this.distance);
    
    // Draw photon sphere (faint ring)
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, photonRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw accretion disk (simplified)
    this.drawAccretionDisk(centerX, centerY, horizonRadius, photonRadius, time);
    
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
   * Draw event horizon
   */
  drawEventHorizon(x, y, radius) {
    const ctx = this.canvasRoot.getContext();
    
    // Glow gradient
    const gradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.3);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.7, 'rgba(50, 30, 80, 0.8)');
    gradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Black hole itself
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw accretion disk
   */
  drawAccretionDisk(x, y, innerRadius, outerRadius, time) {
    const ctx = this.canvasRoot.getContext();
    
    // Disk rotation
    const rotation = time * 0.0002;
    
    // Draw disk as multiple ellipses
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const radius = innerRadius + (outerRadius - innerRadius) * t;
      const alpha = 0.1 * (1 - t);
      
      // Color shifts from hot (inner) to cool (outer)
      const hue = 30 - t * 20; // Orange to red
      
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.3, rotation, 0, Math.PI * 2);
      ctx.stroke();
    }
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
