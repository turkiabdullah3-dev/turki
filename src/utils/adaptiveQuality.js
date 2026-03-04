/**
 * Adaptive Quality System
 * Automatically adjusts graphics quality based on performance
 */

export class AdaptiveQualityManager {
  constructor() {
    this.targetFPS = 60;
    this.minFPS = 45;
    this.fpsHistory = [];
    this.historySize = 60; // 1 second at 60fps
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.currentQuality = 'medium';
    this.adjustmentCooldown = 0;
    this.cooldownTime = 180; // 3 seconds
  }

  update() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    const fps = 1000 / delta;
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }
    
    this.frameCount++;
    
    // Check every second
    if (this.frameCount >= 60) {
      this.checkPerformance();
      this.frameCount = 0;
    }
    
    if (this.adjustmentCooldown > 0) {
      this.adjustmentCooldown--;
    }
  }

  checkPerformance() {
    if (this.fpsHistory.length < 30) return;
    
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    
    // Need to reduce quality
    if (avgFPS < this.minFPS && this.adjustmentCooldown === 0) {
      this.reduceQuality();
      this.adjustmentCooldown = this.cooldownTime;
    }
    
    // Can increase quality
    if (avgFPS > this.targetFPS + 5 && this.adjustmentCooldown === 0) {
      this.increaseQuality();
      this.adjustmentCooldown = this.cooldownTime;
    }
  }

  reduceQuality() {
    if (this.currentQuality === 'high') {
      this.currentQuality = 'medium';
      console.log('Quality reduced to MEDIUM');
      return true;
    } else if (this.currentQuality === 'medium') {
      this.currentQuality = 'low';
      console.log('Quality reduced to LOW');
      return true;
    }
    return false;
  }

  increaseQuality() {
    if (this.currentQuality === 'low') {
      this.currentQuality = 'medium';
      console.log('Quality increased to MEDIUM');
      return true;
    } else if (this.currentQuality === 'medium') {
      this.currentQuality = 'high';
      console.log('Quality increased to HIGH');
      return true;
    }
    return false;
  }

  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 60;
    return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
  }

  getCurrentQuality() {
    return this.currentQuality;
  }
}

// Singleton instance
let instance = null;

export function getQualityManager() {
  if (!instance) {
    instance = new AdaptiveQualityManager();
  }
  return instance;
}
