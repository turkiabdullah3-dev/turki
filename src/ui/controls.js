// Interactive controls (sliders, buttons)
// Owner: Turki Abdullah © 2026

import { storage } from '../core/storage.js';

export class Controls {
  constructor(onDistanceChange, onReset) {
    this.onDistanceChange = onDistanceChange;
    this.onReset = onReset;
    this.elements = {};
  }
  
  /**
   * Initialize controls
   */
  init(mode = 'blackhole') {
    this.mode = mode;
    
    // Get slider
    this.elements.distanceSlider = document.getElementById('slider-distance');
    this.elements.distanceValue = document.getElementById('slider-value-distance');
    this.elements.resetBtn = document.getElementById('btn-reset');
    
    if (!this.elements.distanceSlider) {
      console.error('Distance slider not found');
      return;
    }
    
    // Setup slider
    this.setupSlider();
    
    // Setup reset button
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.reset();
      });
    }
    
    // Load saved position
    this.loadSavedPosition();
  }
  
  /**
   * Setup distance slider
   */
  setupSlider() {
    const slider = this.elements.distanceSlider;
    
    // Set range based on mode
    if (this.mode === 'blackhole') {
      slider.min = '1.02';  // Just outside horizon
      slider.max = '50';
      slider.step = '0.1';
      slider.value = '5';   // Default 5 r_s
    } else {
      // Wormhole mode
      slider.min = '0.5';
      slider.max = '5';
      slider.step = '0.1';
      slider.value = '2';   // Default 2 r_0
    }
    
    // Update display
    this.updateSliderDisplay(slider.value);
    
    // Handle input
    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.updateSliderDisplay(value);
      
      if (this.onDistanceChange) {
        this.onDistanceChange(value);
      }
      
      // Save position
      this.savePosition(value);
    });
  }
  
  /**
   * Update slider value display
   */
  updateSliderDisplay(value) {
    if (this.elements.distanceValue) {
      const unit = this.mode === 'blackhole' ? 'r_s' : 'r_0';
      this.elements.distanceValue.textContent = `${parseFloat(value).toFixed(2)} ${unit}`;
    }
  }
  
  /**
   * Reset to default
   */
  reset() {
    if (this.elements.distanceSlider) {
      const defaultValue = this.mode === 'blackhole' ? 5 : 2;
      this.elements.distanceSlider.value = defaultValue;
      this.updateSliderDisplay(defaultValue);
      
      if (this.onDistanceChange) {
        this.onDistanceChange(defaultValue);
      }
      
      if (this.onReset) {
        this.onReset();
      }
    }
  }
  
  /**
   * Save current position
   */
  savePosition(value) {
    const key = `${this.mode}_distance`;
    storage.saveSettings({ [key]: value });
  }
  
  /**
   * Load saved position
   */
  loadSavedPosition() {
    const key = `${this.mode}_distance`;
    const saved = storage.getSetting(key);
    
    if (saved && this.elements.distanceSlider) {
      this.elements.distanceSlider.value = saved;
      this.updateSliderDisplay(saved);
      
      if (this.onDistanceChange) {
        this.onDistanceChange(parseFloat(saved));
      }
    }
  }
  
  /**
   * Get current value
   */
  getValue() {
    if (this.elements.distanceSlider) {
      return parseFloat(this.elements.distanceSlider.value);
    }
    return this.mode === 'blackhole' ? 5 : 2;
  }
}

export default Controls;
