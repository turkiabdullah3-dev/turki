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
    this.viewMode = localStorage.getItem('wormholeViewMode') === 'interior' ? 'interior' : 'exterior';
    this.interiorParticles = this.createInteriorParticles(42);
  }

  createInteriorParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i += 1) {
      particles.push({
        seed: (i + 1) * 0.173,
        phase: (i / count) * Math.PI * 2,
        radiusFactor: 0.35 + ((i * 17) % 60) / 100,
        depthOffset: ((i * 37) % 100) / 100,
        brightness: 0.4 + ((i * 13) % 40) / 100
      });
    }
    return particles;
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

  setViewMode(mode) {
    this.viewMode = mode === 'interior' ? 'interior' : 'exterior';
    localStorage.setItem('wormholeViewMode', this.viewMode);
    this.updatePhysics();
  }

  getViewMode() {
    return this.viewMode;
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
    this.state = {
      ...this.physics.getState(this.distance),
      viewMode: this.viewMode
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

    if (this.viewMode === 'interior') {
      this.drawInteriorJourney(ctx, centerX, centerY, throatRadius, time, intensity, distanceRatio);
      return;
    }
    
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

  drawInteriorJourney(ctx, centerX, centerY, throatRadius, time, intensity, distanceRatio) {
    const { width, height } = this.canvasRoot.getDimensions();
    const qualitySettings = this.performanceMonitor
      ? this.performanceMonitor.getQualitySettings()
      : { effectsMultiplier: 1, enableGlow: true };

    const effects = clamp(qualitySettings.effectsMultiplier ?? 1, 0.4, 1);
    const forwardSpeed = 0.00022 + (1 / Math.max(distanceRatio, 0.5)) * 0.00025;
    const depthScale = 1 + intensity * 0.55;
    const shiftPhase = time * 0.00045;

    // Background tunnel ambience
    const ambience = ctx.createRadialGradient(
      centerX,
      centerY,
      throatRadius * 0.1,
      centerX,
      centerY,
      Math.max(width, height) * 0.75
    );
    ambience.addColorStop(0, 'rgba(12, 8, 28, 0.95)');
    ambience.addColorStop(0.45, 'rgba(30, 14, 55, 0.65)');
    ambience.addColorStop(1, 'rgba(8, 6, 16, 0.88)');
    ctx.fillStyle = ambience;
    ctx.fillRect(0, 0, width, height);

    // Endpoint transition cue (far region glow tone)
    const endpointTone = ctx.createRadialGradient(
      centerX + Math.sin(shiftPhase * 1.3) * throatRadius * 0.14,
      centerY - Math.cos(shiftPhase) * throatRadius * 0.1,
      throatRadius * 0.15,
      centerX,
      centerY,
      throatRadius * 2.8
    );
    endpointTone.addColorStop(0, `rgba(130, 240, 255, ${0.14 * effects})`);
    endpointTone.addColorStop(0.35, `rgba(110, 190, 255, ${0.09 * effects})`);
    endpointTone.addColorStop(1, 'rgba(80, 120, 210, 0)');
    ctx.fillStyle = endpointTone;
    ctx.beginPath();
    ctx.arc(centerX, centerY, throatRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Layered interior rings for depth and forward motion illusion
    const ringCount = Math.floor(28 * effects);
    for (let i = 0; i < ringCount; i += 1) {
      const depth = (i / ringCount + (time * forwardSpeed) % 1) % 1;
      const perspective = Math.pow(1 - depth, 1.45);
      const ringRadius = throatRadius * (0.35 + perspective * 2.7) * depthScale;
      const alpha = (0.03 + 0.18 * perspective) * effects;
      const hue = 250 + Math.sin(depth * 8 + shiftPhase) * 22;

      ctx.strokeStyle = `hsla(${hue.toFixed(0)}, 80%, ${48 + perspective * 18}%, ${alpha})`;
      ctx.lineWidth = 0.9 + perspective * 2.0;
      ctx.beginPath();
      ctx.ellipse(
        centerX + Math.sin(shiftPhase + depth * 6) * throatRadius * 0.08,
        centerY + Math.cos(shiftPhase * 0.8 + depth * 5) * throatRadius * 0.06,
        ringRadius,
        ringRadius * (0.76 + 0.08 * Math.sin(shiftPhase + depth * 10)),
        shiftPhase * 0.35 + depth * 0.22,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Subtle flowing star/light streak particles
    const particleCount = Math.floor(this.interiorParticles.length * (0.55 + effects * 0.45));
    for (let i = 0; i < particleCount; i += 1) {
      const particle = this.interiorParticles[i];
      const travel = (particle.depthOffset + time * forwardSpeed * (0.8 + particle.seed)) % 1;
      const perspective = Math.pow(1 - travel, 1.7);
      const radius = throatRadius * particle.radiusFactor * (0.6 + perspective * 1.8);
      const angle = particle.phase + shiftPhase * (0.4 + particle.seed);

      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius * 0.78;
      const streak = 4 + perspective * 18;

      ctx.strokeStyle = `rgba(190, 225, 255, ${(0.08 + perspective * 0.26) * particle.brightness * effects})`;
      ctx.lineWidth = 0.6 + perspective * 1.4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(
        px - Math.cos(angle) * streak,
        py - Math.sin(angle) * streak * 0.75
      );
      ctx.stroke();
    }

    // Inner throat glow for cinematic center
    const innerGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      throatRadius * 0.08,
      centerX,
      centerY,
      throatRadius * 1.4
    );
    innerGlow.addColorStop(0, `rgba(235, 255, 255, ${0.28 * effects})`);
    innerGlow.addColorStop(0.35, `rgba(170, 220, 255, ${0.16 * effects})`);
    innerGlow.addColorStop(1, 'rgba(120, 170, 255, 0)');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, throatRadius * 1.4, 0, Math.PI * 2);
    ctx.fill();
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
