// Wormhole scene renderer
// Owner: Turki Abdullah © 2026

import WormholePhysics from '../physics/wormhole.js';
import { safeNumber } from '../physics/safety.js';

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
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw embedding diagram (side view)
    this.drawEmbeddingDiagram(centerX, centerY, time);
    
    // Draw throat indicator
    this.drawThroat(centerX, centerY);
    
    // Draw observer position
    this.drawObserver(centerX, centerY);
    
    // Draw warp effect
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
   * Draw throat region
   */
  drawThroat(x, y) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    const scale = Math.min(width, height) * 0.0015;
    
    const throatRadius = this.physics.r0 * scale;
    
    // Throat glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, throatRadius * 2);
    gradient.addColorStop(0, 'rgba(150, 100, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(100, 50, 200, 0.3)');
    gradient.addColorStop(1, 'rgba(50, 0, 150, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, throatRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Throat ring
    ctx.strokeStyle = 'rgba(200, 150, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, throatRadius, 0, Math.PI * 2);
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
   * Draw warp effect (tunnel distortion)
   */
  drawWarpEffect(time) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const strength = this.state.warpStrength;
    
    // Radial distortion
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    
    // Pulsating effect
    const pulse = Math.sin(time * 0.002) * 0.1 + 0.9;
    
    gradient.addColorStop(0, `rgba(100, 50, 200, ${strength * 0.2 * pulse})`);
    gradient.addColorStop(0.5, `rgba(50, 25, 100, ${strength * 0.1 * pulse})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

export default WormholeScene;
