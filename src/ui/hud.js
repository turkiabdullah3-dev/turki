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
   * Format scientific notation cleanly (e.g., 1.00e3 instead of 1.00e+3)
   */
  formatScientific(value, precision = 2) {
    if (Math.abs(value) < 1e6 && Math.abs(value) >= 0.01) {
      // Use regular notation for reasonable values
      return value.toFixed(precision);
    }
    // Use clean scientific notation
    const sci = value.toExponential(precision);
    return sci.replace('e+', 'e');
  }
  
  /**
   * Update values in DOM (throttled to 10 FPS)
   */
  updateValues() {
    if (!this.data) return;
    
    // Distance (value only, unit in HTML)
    if (this.elements.distance && this.data.r_normalized !== undefined) {
      sanitize.setText(this.elements.distance, this.data.r_normalized.toFixed(2));
    }
    
    // Time dilation (alpha)
    if (this.elements.alpha && this.data.alpha !== undefined) {
      sanitize.setText(this.elements.alpha, this.data.alpha.toFixed(4));
    }
    
    // Redshift
    if (this.elements.redshift && this.data.redshift !== undefined) {
      sanitize.setText(this.elements.redshift, this.data.redshift.toFixed(2));
    }
    
    // Tidal force (value only, unit in HTML)
    if (this.elements.tidal && this.data.tidalForce !== undefined) {
      sanitize.setText(this.elements.tidal, this.formatScientific(this.data.tidalForce, 2));
    }
    
    // Warp strength (wormhole - value only, unit in HTML)
    if (this.elements.warpStrength && this.data.warpStrength !== undefined) {
      sanitize.setText(this.elements.warpStrength, (this.data.warpStrength * 100).toFixed(0));
    }
    
    // Exotic matter (wormhole)
    if (this.elements.exoticMatter && this.data.exoticMatter !== undefined) {
      const sign = this.data.exoticMatter < 0 ? 'Required' : 'Not Required';
      sanitize.setText(this.elements.exoticMatter, sign);
    }
    
    // FPS (value only, unit in HTML)
    if (this.elements.fps) {
      const fps = perf.fpsCounter.getFPS();
      sanitize.setText(this.elements.fps, fps.toString());
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
      sanitize.setText(this.elements.fps, fps.toString());
    }
  }
}

export default HUD;
