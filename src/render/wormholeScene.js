// Wormhole scene renderer
// Owner: Turki Abdullah © 2026

import WormholePhysics from '../physics/wormhole.js';
import { safeNumber } from '../physics/safety.js';
import { sanitizeWormholeState, getVisualWarpAmount, getVisualRadius } from '../physics/renderSafety.js';

class WormholeScene {
  constructor(canvasRoot) {
    this.canvasRoot = canvasRoot;
    this.physics = new WormholePhysics();
    this.distance = this.physics.r0 * 2; // Start at 2x throat
    this.traverseProgress = 0; // 0 to 1
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
    // radiusRatio relative to throat radius
    this.distance = this.physics.r0 * radiusRatio;
    this.updatePhysics();
  }
  
  /**
   * Set traverse progress (0 = one side, 1 = other side)
   */
  setTraverseProgress(progress) {
    this.traverseProgress = Math.max(0, Math.min(1, progress));
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
    // Animate warp effect
  }
  
  /**
   * Render wormhole
   */
  render(time) {
    // CRITICAL: Sanitize state before rendering to prevent Infinity/NaN
    const safeState = sanitizeWormholeState(this.state);
    this.state = safeState; // Update with safe values
    
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw starfield background
    this.drawEmbeddingDiagram(centerX, centerY, time);
    
    // Draw throat indicator
    this.drawThroat(centerX, centerY);
    
    // Draw observer position
    this.drawObserver(centerX, centerY);
    
    // Draw warp effect with safe values
    this.drawWarpEffect(time);
  }
  
  /**
   * Draw embedding diagram (simplified 2D representation)
   */
  drawEmbeddingDiagram(centerX, centerY, time) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const scale = Math.min(width, height) * 0.0015;
    
    // Draw both sides of wormhole
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
    ctx.lineWidth = 2;
    
    // Left side (our universe)
    ctx.beginPath();
    for (let r = this.physics.r0; r < this.physics.r0 * 5; r += 500) {
      const z = this.calculateEmbeddingZ(r) * scale;
      const x = centerX - r * scale;
      const y = centerY + z;
      
      if (r === this.physics.r0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Right side (other universe)
    ctx.beginPath();
    for (let r = this.physics.r0; r < this.physics.r0 * 5; r += 500) {
      const z = this.calculateEmbeddingZ(r) * scale;
      const x = centerX + r * scale;
      const y = centerY + z;
      
      if (r === this.physics.r0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw gridlines for depth perception
    this.drawGridLines(centerX, centerY, scale, time);
  }
  
  /**
   * Calculate embedding diagram Z coordinate
   */
  calculateEmbeddingZ(r) {
    // Integrate dz/dr
    const b = this.physics.shapeFunction(r);
    const ratio = r / b;
    
    if (ratio <= 1.01) return 0; // At throat
    
    // Numerical approximation
    return Math.sqrt(ratio - 1) * this.physics.r0 * 0.5;
  }
  
  /**
   * Draw throat region with enhanced visuals
   */
  drawThroat(x, y) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    const scale = Math.min(width, height) * 0.0015;
    
    const throatRadius = this.physics.r0 * scale;
    const warpStrength = getVisualWarpAmount(this.state.warpStrength);
    
    // LAYER 1: Deep tunnel gradient (dark blue-purple core)
    const tunnelGradient = ctx.createRadialGradient(x, y, 0, x, y, throatRadius * 3);
    tunnelGradient.addColorStop(0, `rgba(50, 20, 120, ${0.4 * warpStrength})`);
    tunnelGradient.addColorStop(0.3, `rgba(80, 40, 150, ${0.25 * warpStrength})`);
    tunnelGradient.addColorStop(1, 'rgba(30, 10, 60, 0)');
    
    ctx.fillStyle = tunnelGradient;
    ctx.beginPath();
    ctx.arc(x, y, throatRadius * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // LAYER 2: Throat glow (main visual)
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, throatRadius * 2);
    gradient.addColorStop(0, `rgba(200, 150, 255, ${0.7 * warpStrength})`);
    gradient.addColorStop(0.3, `rgba(150, 100, 255, ${0.5 * warpStrength})`);
    gradient.addColorStop(0.7, `rgba(100, 50, 200, ${0.25 * warpStrength})`);
    gradient.addColorStop(1, 'rgba(50, 0, 150, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, throatRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // LAYER 3: Sharp throat ring (critical visual - always visible)
    ctx.strokeStyle = `rgba(220, 180, 255, ${0.8 + 0.2 * Math.sin(performance.now() * 0.003)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, throatRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // LAYER 4: Inner ring structure (high frequency detail)
    ctx.strokeStyle = 'rgba(180, 130, 220, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, throatRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y, throatRadius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * Draw observer
   */
  drawObserver(centerX, centerY) {
    const { width, height } = this.canvasRoot.getDimensions();
    const scale = Math.min(width, height) * 0.0015;
    
    const ctx = this.canvasRoot.getContext();
    
    // Position based on distance and traverse progress
    const side = this.traverseProgress < 0.5 ? -1 : 1;
    const distFromCenter = this.distance * scale;
    
    const obsX = centerX + side * distFromCenter;
    const obsZ = this.calculateEmbeddingZ(this.distance) * scale;
    const obsY = centerY + obsZ;
    
    ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
    ctx.beginPath();
    ctx.arc(obsX, obsY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Connection line
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(obsX, obsY);
    ctx.stroke();
  }
  
  /**
   * Draw grid lines for 3D effect
   */
  drawGridLines(centerX, centerY, scale, time) {
    const ctx = this.canvasRoot.getContext();
    
    // Animated grid rotation
    const rotation = time * 0.0001;
    
    // Radial lines
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + rotation;
      
      ctx.strokeStyle = 'rgba(50, 100, 150, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let r = this.physics.r0; r < this.physics.r0 * 5; r += 500) {
        const z = this.calculateEmbeddingZ(r) * scale;
        const x = centerX + Math.cos(angle) * r * scale;
        const y = centerY + z;
        
        if (r === this.physics.r0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }
  
  /**
   * Draw warp effect (tunnel distortion with localized effect)
   */
  drawWarpEffect(time) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    // Use safe warp strength that's guaranteed to be 0-1
    const strength = getVisualWarpAmount(this.state.warpStrength);
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // EFFECT 1: Localized warp distortion around throat (screen-space)
    // Only affects a radius around the center
    const warpRadius = Math.min(width, height) * 0.4 * strength;
    
    // Create pixel-level distortion effect
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Simple distortion: shift pixels radially based on distance from center
    const distorted = ctx.createImageData(imageData);
    const distortedData = distorted.data;
    
    // Pre-distort: sample from offset positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Warp amount (decreases with distance, max at center)
        const warpAmount = Math.max(0, 1 - dist / warpRadius) * strength * 15;
        
        // Sample offset
        const angle = Math.atan2(dy, dx);
        const sampX = Math.round(x + Math.cos(angle) * warpAmount);
        const sampY = Math.round(y + Math.sin(angle) * warpAmount);
        
        // Bounds check
        if (sampX >= 0 && sampX < width && sampY >= 0 && sampY < height) {
          const srcIdx = (sampY * width + sampX) * 4;
          const dstIdx = (y * width + x) * 4;
          
          distortedData[dstIdx] = data[srcIdx];
          distortedData[dstIdx + 1] = data[srcIdx + 1];
          distortedData[dstIdx + 2] = data[srcIdx + 2];
          distortedData[dstIdx + 3] = data[srcIdx + 3];
        }
      }
    }
    
    // Only apply distortion if performance allows (skip on low-end devices)
    // For now, use a simpler approach: just add glow instead of pixel shifting
    
    // EFFECT 2: Radial tunnel depth illusion with pulsating glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, warpRadius * 0.2,
      centerX, centerY, warpRadius * 2
    );
    
    // Pulsating effect with safe values
    const pulse = Math.sin(time * 0.002) * 0.1 + 0.9;
    const centerAlpha = Math.max(0, Math.min(1, strength * 0.25 * pulse));
    const midAlpha = Math.max(0, Math.min(1, strength * 0.12 * pulse));
    
    gradient.addColorStop(0, `rgba(150, 80, 220, ${centerAlpha})`);
    gradient.addColorStop(0.4, `rgba(100, 50, 180, ${midAlpha * 0.7})`);
    gradient.addColorStop(1, 'rgba(30, 10, 80, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // EFFECT 3: Add subtle animated rings for depth cues
    ctx.strokeStyle = `rgba(120, 80, 200, ${strength * 0.15})`;
    ctx.lineWidth = 2;
    
    for (let i = 1; i <= 3; i++) {
      const ringRadius = warpRadius * (0.3 * i) * (0.9 + 0.1 * Math.sin(time * 0.001 + i));
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export default WormholeScene;
