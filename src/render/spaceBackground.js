// Space background - procedural stars with parallax
// Owner: Turki Abdullah © 2026

import perf from '../core/perf.js';

export class SpaceBackground {
  constructor(canvasRoot) {
    this.canvasRoot = canvasRoot;
    this.stars = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
  }
  
  /**
   * Initialize stars
   */
  init() {
    const count = perf.getAdaptiveStarCount();
    const { width, height } = this.canvasRoot.getDimensions();
    
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push(this.createStar(width, height));
    }
    
    // Setup mouse tracking
    document.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
    
    // Setup touch tracking
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
      }
    }, { passive: true });
  }
  
  /**
   * Create a single star
   */
  createStar(width, height) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.5 + 0.15,
      depth: Math.random(), // For parallax (0 = far, 1 = near)
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2
    };
  }
  
  /**
   * Update stars (parallax + twinkle)
   */
  update(time) {
    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    
    const { width, height } = this.canvasRoot.getDimensions();
    
    // Update star positions based on parallax
    this.stars.forEach(star => {
      // Parallax offset based on depth
      const parallaxX = this.mouseX * star.depth * 20;
      const parallaxY = this.mouseY * star.depth * 20;
      
      star.renderX = star.x + parallaxX;
      star.renderY = star.y + parallaxY;
      
      // Twinkle brightness (reduced for subtlety)
      star.currentBrightness = star.brightness + 
        Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.12;
    });
  }
  
  /**
   * Render stars
   */
  render(time) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    // Draw stars (reduced opacity for subtlety)
    this.stars.forEach(star => {
      const alpha = Math.max(0, Math.min(1, star.currentBrightness)) * 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      
      ctx.beginPath();
      ctx.arc(star.renderX, star.renderY, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /**
   * Add nebula gradient (subtle background)
   */
  renderNebula() {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 1.5
    );
    
    gradient.addColorStop(0, 'rgba(30, 20, 60, 0.3)');
    gradient.addColorStop(0.5, 'rgba(20, 10, 40, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  /**
   * Handle resize
   */
  resize() {
    const { width, height } = this.canvasRoot.getDimensions();
    
    // Reposition stars proportionally
    this.stars.forEach(star => {
      star.x = (star.x / this.canvasRoot.width) * width;
      star.y = (star.y / this.canvasRoot.height) * height;
    });
  }
}

export default SpaceBackground;
