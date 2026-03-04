// HUD (Heads-Up Display) controller
// Owner: Turki Abdullah © 2026

import perf from '../core/perf.js';
import { sanitize } from '../core/sanitize.js';

export class HUD {
  constructor() {
    this.elements = {};
    this.updateThrottled = perf.throttle(() => this.updateValues(), 100);
    this.data = {};
  }
  
  /**
   * Initialize HUD elements
   */
  init() {
    this.elements = {
      distance: document.getElementById('value-distance'),
      alpha: document.getElementById('value-alpha'),
      redshift: document.getElementById('value-redshift'),
      tidal: document.getElementById('value-tidal'),
      fps: document.getElementById('value-fps'),
      // Optional elements
      warpStrength: document.getElementById('value-warp'),
      exoticMatter: document.getElementById('value-exotic')
    };
  }
  
  /**
   * Set data for display
   */
  setData(data) {
    this.data = data;
    this.updateThrottled();
  }
  
  /**
   * Update values in DOM (throttled to 10 FPS)
   */
  updateValues() {
    if (!this.data) return;
    
    // Distance
    if (this.elements.distance && this.data.r_normalized !== undefined) {
      sanitize.setText(this.elements.distance, `${this.data.r_normalized.toFixed(2)} r_s`);
    }
    
    // Time dilation (alpha)
    if (this.elements.alpha && this.data.alpha !== undefined) {
      sanitize.setText(this.elements.alpha, this.data.alpha.toFixed(4));
    }
    
    // Redshift
    if (this.elements.redshift && this.data.redshift !== undefined) {
      sanitize.setText(this.elements.redshift, this.data.redshift.toFixed(2));
    }
    
    // Tidal force
    if (this.elements.tidal && this.data.tidalForce !== undefined) {
      const tidal = this.data.tidalForce.toExponential(2);
      sanitize.setText(this.elements.tidal, `${tidal} m/s²`);
    }
    
    // Warp strength (wormhole)
    if (this.elements.warpStrength && this.data.warpStrength !== undefined) {
      sanitize.setText(this.elements.warpStrength, `${(this.data.warpStrength * 100).toFixed(0)}%`);
    }
    
    // Exotic matter (wormhole)
    if (this.elements.exoticMatter && this.data.exoticMatter !== undefined) {
      const sign = this.data.exoticMatter < 0 ? 'Yes' : 'No';
      sanitize.setText(this.elements.exoticMatter, sign);
    }
    
    // FPS
    if (this.elements.fps) {
      const fps = perf.fpsCounter.getFPS();
      sanitize.setText(this.elements.fps, `${fps} FPS`);
    }
  }
  
  /**
   * Show warning message
   */
  showWarning(message) {
    const warning = document.getElementById('warning-message');
    if (warning) {
      sanitize.setText(warning, message);
      warning.style.display = 'block';
      
      setTimeout(() => {
        warning.style.display = 'none';
      }, 3000);
    }
  }
  
  /**
   * Update FPS display
   */
  updateFPS() {
    if (this.elements.fps) {
      const fps = perf.fpsCounter.getFPS();
      sanitize.setText(this.elements.fps, `${fps} FPS`);
    }
  }
}

export default HUD;
