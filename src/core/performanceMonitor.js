// Adaptive Performance Monitor - Auto quality management
// Owner: Turki Abdullah © 2026

/**
 * Quality levels for rendering
 * @enum {string}
 */
export const QualityLevel = {
  LOW: 'low',
  AUTO: 'auto',
  HIGH: 'high'
};

/**
 * Performance monitor with adaptive quality control
 */
export class PerformanceMonitor {
  constructor() {
    this.targetFPS = 60;
    this.minAcceptableFPS = 45;
    
    // FPS tracking
    this.frames = 0;
    this.lastTime = performance.now();
    this.currentFPS = 60;
    this.fpsHistory = [];
    this.historySize = 5; // Track last 5 seconds
    
    // Quality management
    this.currentQuality = QualityLevel.AUTO;
    this.actualQuality = QualityLevel.AUTO; // What's actually being used
    this.lastQualityChange = performance.now();
    this.qualityChangeDelay = 3000; // Wait 3s before changing quality
    
    // Device detection
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.isSafari = this.detectSafari();
    this.isLowPowerDevice = this.isMobile || this.isTablet || this.isSafari;
    
    // Initialize quality based on device
    this.initializeQuality();
  }
  
  /**
   * Detect mobile device
   */
  detectMobile() {
    return /iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Detect tablet device
   */
  detectTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  }
  
  /**
   * Detect Safari browser
   */
  detectSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
  
  /**
   * Initialize quality level based on device
   */
  initializeQuality() {
    if (this.currentQuality === QualityLevel.AUTO) {
      // Start conservatively on low-power devices
      if (this.isMobile) {
        this.actualQuality = QualityLevel.LOW;
      } else if (this.isTablet || this.isSafari) {
        this.actualQuality = QualityLevel.AUTO;
      } else {
        // Desktop: start at AUTO, can scale up
        this.actualQuality = QualityLevel.AUTO;
      }
    } else {
      this.actualQuality = this.currentQuality;
    }
  }
  
  /**
   * Update FPS counter (call every frame)
   */
  update() {
    this.frames++;
    const now = performance.now();
    
    if (now >= this.lastTime + 1000) {
      // Calculate FPS for last second
      const fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.currentFPS = fps;
      
      // Add to history
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.historySize) {
        this.fpsHistory.shift();
      }
      
      // Auto-adjust quality if in AUTO mode
      if (this.currentQuality === QualityLevel.AUTO) {
        this.autoAdjustQuality(now);
      }
      
      this.frames = 0;
      this.lastTime = now;
    }
    
    return this.currentFPS;
  }
  
  /**
   * Auto-adjust quality based on FPS performance
   */
  autoAdjustQuality(now) {
    // Don't change quality too frequently
    if (now - this.lastQualityChange < this.qualityChangeDelay) {
      return;
    }
    
    // Need enough history to make decision
    if (this.fpsHistory.length < 3) {
      return;
    }
    
    // Calculate average FPS from recent history
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    
    // Decide quality adjustment
    if (avgFPS < this.minAcceptableFPS) {
      // Performance suffering - reduce quality
      if (this.actualQuality === QualityLevel.HIGH) {
        this.actualQuality = QualityLevel.AUTO;
        this.lastQualityChange = now;
        console.log(`[Performance] Reduced quality to AUTO (FPS: ${avgFPS.toFixed(1)})`);
      } else if (this.actualQuality === QualityLevel.AUTO) {
        this.actualQuality = QualityLevel.LOW;
        this.lastQualityChange = now;
        console.log(`[Performance] Reduced quality to LOW (FPS: ${avgFPS.toFixed(1)})`);
      }
    } else if (avgFPS > this.targetFPS - 5) {
      // Performance good - can try higher quality
      // Only upgrade on desktop/high-power devices
      if (!this.isLowPowerDevice) {
        if (this.actualQuality === QualityLevel.LOW) {
          this.actualQuality = QualityLevel.AUTO;
          this.lastQualityChange = now;
          console.log(`[Performance] Increased quality to AUTO (FPS: ${avgFPS.toFixed(1)})`);
        } else if (this.actualQuality === QualityLevel.AUTO && avgFPS >= this.targetFPS - 2) {
          this.actualQuality = QualityLevel.HIGH;
          this.lastQualityChange = now;
          console.log(`[Performance] Increased quality to HIGH (FPS: ${avgFPS.toFixed(1)})`);
        }
      }
    }
  }
  
  /**
   * Set quality level manually
   */
  setQuality(level) {
    if (Object.values(QualityLevel).includes(level)) {
      this.currentQuality = level;
      if (level !== QualityLevel.AUTO) {
        this.actualQuality = level;
      }
      this.lastQualityChange = performance.now();
    }
  }
  
  /**
   * Get current FPS
   */
  getFPS() {
    return this.currentFPS;
  }
  
  /**
   * Get actual quality level being used
   */
  getQuality() {
    return this.actualQuality;
  }
  
  /**
   * Get quality settings for rendering
   */
  getQualitySettings() {
    const quality = this.actualQuality;

    let baseSettings;
    switch (quality) {
      case QualityLevel.LOW:
        baseSettings = {
          starMultiplier: 0.4,      // 40% stars
          enableGlow: false,         // Minimal glow
          enableDistortion: false,   // No distortion
          glowIntensity: 0.3,       // Reduced glow
          effectsMultiplier: 0.5     // Half effects
        };
        break;
      
      case QualityLevel.AUTO:
        baseSettings = {
          starMultiplier: 0.7,      // 70% stars
          enableGlow: true,          // Basic glow
          enableDistortion: false,   // Distortion off in AUTO
          glowIntensity: 0.7,       // Moderate glow
          effectsMultiplier: 0.8     // Most effects
        };
        break;
      
      case QualityLevel.HIGH:
        baseSettings = {
          starMultiplier: 1.0,      // 100% stars
          enableGlow: true,          // Full glow
          enableDistortion: true,    // Distortion enabled
          glowIntensity: 1.0,       // Full glow
          effectsMultiplier: 1.0     // All effects
        };
        break;
      
      default:
        baseSettings = {
          starMultiplier: 0.7,
          enableGlow: true,
          enableDistortion: false,
          glowIntensity: 0.7,
          effectsMultiplier: 0.8
        };
        break;
    }

    const fps = this.currentFPS;
    const emergencyScale = fps < 40 ? Math.max(0.45, fps / 40) : 1;

    return {
      ...baseSettings,
      glowIntensity: baseSettings.glowIntensity * emergencyScale,
      effectsMultiplier: baseSettings.effectsMultiplier * emergencyScale,
      distortionSampleScale: emergencyScale,
      particleMultiplier: emergencyScale
    };
  }
  
  /**
   * Check if device is low power
   */
  isLowPowerDevice() {
    return this.isLowPowerDevice;
  }
  
  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      fps: this.currentFPS,
      quality: this.actualQuality,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isSafari: this.isSafari,
      avgFPS: this.fpsHistory.length > 0 
        ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
        : this.currentFPS
    };
  }
}

export default PerformanceMonitor;
