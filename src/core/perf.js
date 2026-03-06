// Performance monitoring and optimization
// Owner: Turki Abdullah © 2026

import CONFIG from './config.js';

export const perf = {
  /**
   * Get safe device pixel ratio (capped to prevent excessive rendering)
   * @returns {number}
   */
  getSafeDPR() {
    return Math.min(window.devicePixelRatio || 1, CONFIG.performance.maxDPR);
  },
  
  /**
   * Get adaptive star count based on device
   * @param {number} qualityMultiplier - Quality multiplier (0.4 to 1.0)
   * @returns {number}
   */
  getAdaptiveStarCount(qualityMultiplier = 1.0) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixels = width * height;
    
    let baseCount;
    // Mobile/small screens
    if (pixels < 500000) {
      baseCount = CONFIG.performance.starCount.mobile;
    }
    // Tablet/medium screens
    else if (pixels < 1500000) {
      baseCount = CONFIG.performance.starCount.tablet;
    }
    // Desktop/large screens
    else {
      baseCount = CONFIG.performance.starCount.desktop;
    }
    
    // Apply quality multiplier
    return Math.floor(baseCount * qualityMultiplier);
  },
  
  /**
   * Detect if device is mobile/tablet
   * @returns {boolean}
   */
  isMobileOrTablet() {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  /**
   * Create throttled function
   * @param {Function} func 
   * @param {number} delay 
   * @returns {Function}
   */
  throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  },
  
  /**
   * FPS counter
   */
  fpsCounter: {
    frames: 0,
    lastTime: performance.now(),
    fps: 60,
    
    update() {
      this.frames++;
      const now = performance.now();
      if (now >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.frames = 0;
        this.lastTime = now;
      }
      return this.fps;
    },
    
    getFPS() {
      return this.fps;
    }
  },
  
  /**
   * Request animation frame with fallback
   * @param {Function} callback 
   */
  requestFrame(callback) {
    return requestAnimationFrame(callback);
  }
};

export default perf;
