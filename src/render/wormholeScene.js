// Wormhole scene renderer
// Owner: Turki Abdullah © 2026

import WormholePhysics from '../physics/wormhole.js';
import { clamp, safeNumber } from '../physics/safety.js';

class WormholeScene {
  constructor(canvasRoot) {
    this.canvasRoot = canvasRoot;
    this.physics = new WormholePhysics();
    this.distance = this.physics.r0 * 2; // Start at 2x throat
    this.traverseProgress = 0; // 0 to 1
    this.state = null;
    this.qualityMode = 'glow';
    this.isMobileDevice = false;
    this.currentFPS = 60;
    this.frameCount = 0;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
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
   * Set quality mode
   * @param {'glow' | 'high'} mode
   */
  setQualityMode(mode) {
    this.qualityMode = mode === 'high' ? 'high' : 'glow';
  }

  /**
   * Update performance context for quality gating
   * @param {{ fps?: number, isMobile?: boolean }} metrics
   */
  setPerformanceContext(metrics = {}) {
    this.currentFPS = safeNumber(metrics.fps, this.currentFPS);
    this.isMobileDevice = Boolean(metrics.isMobile);
  }

  /**
   * Whether optional high distortion should run this frame
   * @returns {boolean}
   */
  shouldRunHighDistortion() {
    // Use performance monitor if available
    if (this.performanceMonitor) {
      const settings = this.performanceMonitor.getQualitySettings();
      const fps = this.performanceMonitor.getFPS();
      return settings.enableDistortion && !this.isMobileDevice && fps > 45;
    }
    // Fallback to old logic
    return this.qualityMode === 'high' && !this.isMobileDevice && this.currentFPS > 45;
  }
  
  /**
   * Render wormhole
   */
  render(time) {
    const safeState = this.state || {};
    
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const centerX = width / 2;
    const centerY = height / 2;

    const epsilon = 1e-6;
    const distanceRatio = Math.max(safeNumber(safeState.r_normalized, 1), epsilon);
    const intensity = clamp(safeNumber(safeState.warpStrength, 0), 0, 2);
    // VISUAL SCALE: Increased from 0.15 to 0.19 for better hero prominence
    const baseRadius = Math.min(width, height) * 0.19;
    const throatRadius = baseRadius * clamp(1 / (distanceRatio + epsilon), 0.6, 1.6);
    
    // Draw starfield background
    this.drawEmbeddingDiagram(centerX, centerY, time);
    
    // Draw clear wormhole hero visual
    this.drawThroatAndTunnel(ctx, centerX, centerY, throatRadius, time, intensity);
    
    // Draw observer position
    this.drawObserver(centerX, centerY);
    
    // Always-on cheap glow warp
    this.drawWarpGlow(time, centerX, centerY, throatRadius, intensity);

    // Optional high-quality distortion (desktop + healthy FPS only)
    if (this.shouldRunHighDistortion()) {
      this.applyHighDistortion(centerX, centerY, throatRadius, intensity);
    }
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
   * Draw throat + tunnel hero visual (cheap: arcs + gradients only)
   */
  drawThroatAndTunnel(ctx, centerX, centerY, radius, t, intensity) {
    // Get quality settings
    const qualitySettings = this.performanceMonitor 
      ? this.performanceMonitor.getQualitySettings() 
      : { enableGlow: true, glowIntensity: 1.0, effectsMultiplier: 1.0 };
    
    const glowMultiplier = qualitySettings.glowIntensity;
    
    // Outer glow ring
    const outerGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius * 2.8);
    outerGlow.addColorStop(0, `rgba(170, 120, 255, ${0.24 * intensity * glowMultiplier})`);
    outerGlow.addColorStop(0.45, `rgba(120, 70, 210, ${0.18 * intensity * glowMultiplier})`);
    outerGlow.addColorStop(1, 'rgba(30, 10, 80, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Inner depth (dark center)
    const depth = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.1);
    depth.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    depth.addColorStop(0.5, 'rgba(18, 8, 40, 0.78)');
    depth.addColorStop(1, 'rgba(70, 30, 130, 0.18)');
    ctx.fillStyle = depth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Gentle pulsing shimmer glow around throat (quality-dependent)
    if (qualitySettings.enableGlow && qualitySettings.effectsMultiplier > 0.5) {
      const pulse = 0.82 + 0.18 * Math.sin(t * 0.004);
      const shimmer = ctx.createRadialGradient(
        centerX, centerY, radius * 0.6,
        centerX, centerY, radius * 1.5
      );
      shimmer.addColorStop(0, `rgba(230, 190, 255, ${0.3 * pulse * glowMultiplier})`);
      shimmer.addColorStop(0.5, `rgba(180, 140, 220, ${0.18 * pulse * glowMultiplier})`);
      shimmer.addColorStop(1, 'rgba(140, 100, 180, 0)');
      ctx.fillStyle = shimmer;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Crisp throat ring
    const pulse = 0.82 + 0.18 * Math.sin(t * 0.004);
    ctx.strokeStyle = `rgba(230, 190, 255, ${pulse})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating highlight (liquid energy illusion)
    const highlightAngle = t * 0.0012;
    const hx = centerX + Math.cos(highlightAngle) * radius * 0.86;
    const hy = centerY + Math.sin(highlightAngle) * radius * 0.86;
    const highlight = ctx.createRadialGradient(hx, hy, 0, hx, hy, radius * 0.55);
    highlight.addColorStop(0, `rgba(255, 240, 255, ${0.34 * intensity})`);
    highlight.addColorStop(1, 'rgba(255, 240, 255, 0)');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(hx, hy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
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
   * Always-on cheap glow overlay (no pixel readback)
   */
  drawWarpGlow(time, centerX, centerY, throatRadius, intensity) {
    const ctx = this.canvasRoot.getContext();
    const pulse = 0.86 + 0.14 * Math.sin(time * 0.003);

    const glow = ctx.createRadialGradient(
      centerX,
      centerY,
      throatRadius * 0.8,
      centerX,
      centerY,
      throatRadius * 5
    );
    glow.addColorStop(0, `rgba(150, 90, 240, ${0.24 * intensity * pulse})`);
    glow.addColorStop(0.35, `rgba(110, 55, 190, ${0.14 * intensity * pulse})`);
    glow.addColorStop(1, 'rgba(20, 5, 40, 0)');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.canvasRoot.getDimensions().width, this.canvasRoot.getDimensions().height);

    ctx.strokeStyle = `rgba(170, 120, 255, ${0.16 * intensity})`;
    ctx.lineWidth = 1.2;
    for (let i = 1; i <= 3; i++) {
      const ringRadius = throatRadius * (1.45 + i * 0.55) * pulse;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Optional high-quality distortion (desktop-only, low-res, throttled)
   */
  applyHighDistortion(centerX, centerY, throatRadius, intensity) {
    this.frameCount += 1;
    if (this.frameCount % 3 !== 0) return;

    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    const lowW = Math.max(1, Math.floor(width * 0.25));
    const lowH = Math.max(1, Math.floor(height * 0.25));

    if (this.offscreenCanvas.width !== lowW || this.offscreenCanvas.height !== lowH) {
      this.offscreenCanvas.width = lowW;
      this.offscreenCanvas.height = lowH;
    }

    this.offscreenCtx.clearRect(0, 0, lowW, lowH);
    this.offscreenCtx.drawImage(this.canvasRoot.getCanvas(), 0, 0, lowW, lowH);

    const src = this.offscreenCtx.getImageData(0, 0, lowW, lowH);
    const dst = this.offscreenCtx.createImageData(src);
    const srcData = src.data;
    const dstData = dst.data;

    const cX = (centerX / width) * lowW;
    const cY = (centerY / height) * lowH;
    const radius = (throatRadius / Math.min(width, height)) * Math.min(lowW, lowH) * 3.5;
    const radiusSafe = Math.max(radius, 1e-6);

    for (let y = 0; y < lowH; y++) {
      for (let x = 0; x < lowW; x++) {
        const dx = x - cX;
        const dy = y - cY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.max(0, 1 - dist / radiusSafe);
        const shift = falloff * intensity * 2.2;

        const angle = Math.atan2(dy, dx);
        const sx = Math.round(clamp(x + Math.cos(angle) * shift, 0, lowW - 1));
        const sy = Math.round(clamp(y + Math.sin(angle) * shift, 0, lowH - 1));

        const sIdx = (sy * lowW + sx) * 4;
        const dIdx = (y * lowW + x) * 4;
        dstData[dIdx] = srcData[sIdx];
        dstData[dIdx + 1] = srcData[sIdx + 1];
        dstData[dIdx + 2] = srcData[sIdx + 2];
        dstData[dIdx + 3] = srcData[sIdx + 3];
      }
    }

    this.offscreenCtx.putImageData(dst, 0, 0);

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.drawImage(this.offscreenCanvas, 0, 0, width, height);
    ctx.restore();
  }
}

export default WormholeScene;
