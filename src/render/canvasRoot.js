// Canvas root - handles canvas creation and resizing
// Owner: Turki Abdullah © 2026
// CRITICAL: Prevents blank canvas failures

import perf from '../core/perf.js';

export class CanvasRoot {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.resizeObserver = null;
  }
  
  /**
   * Create and setup canvas
   * CRITICAL: Must be called before rendering
   */
  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.zIndex = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    // Get 2D context
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true // Better performance
    });
    
    if (!this.ctx) {
      console.error('Failed to get 2D context');
      return false;
    }
    
    // Append to container
    this.container.appendChild(this.canvas);
    
    // Initial resize
    this.resize();
    
    // Setup resize observer
    this.setupResizeObserver();
    
    // Also handle window resize
    window.addEventListener('resize', () => this.resize());
    
    return true;
  }
  
  /**
   * Resize canvas to match display size
   * CRITICAL: Updates both CSS size and drawing buffer size
   */
  resize() {
    if (!this.canvas) return;
    
    // Get display size from bounding rect
    const rect = this.canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Get safe DPR
    this.dpr = perf.getSafeDPR();
    
    // Calculate buffer size
    const bufferWidth = Math.floor(displayWidth * this.dpr);
    const bufferHeight = Math.floor(displayHeight * this.dpr);
    
    // Only resize if changed
    if (this.canvas.width !== bufferWidth || this.canvas.height !== bufferHeight) {
      this.canvas.width = bufferWidth;
      this.canvas.height = bufferHeight;
      
      this.width = bufferWidth;
      this.height = bufferHeight;
      
      console.log(`Canvas resized: ${bufferWidth}x${bufferHeight} (DPR: ${this.dpr})`);
    }
  }
  
  /**
   * Setup ResizeObserver for better resize detection
   */
  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(this.canvas);
    }
  }
  
  /**
   * Clear canvas
   */
  clear(color = '#000000') {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  /**
   * Get context
   */
  getContext() {
    return this.ctx;
  }
  
  /**
   * Get dimensions
   */
  getDimensions() {
    return {
      width: this.width,
      height: this.height,
      dpr: this.dpr
    };
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export default CanvasRoot;
