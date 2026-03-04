/**
 * Performance Monitoring and Adaptive Quality System
 * Maintains 60 FPS target with automatic quality adjustment
 */

export class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.frameTime = [];
    this.fps = 60;
    this.targetFps = 60;
    this.maxFrameTime = 1000 / this.targetFps; // ~16.67ms for 60fps
    
    this.quality = 'high'; // high, medium, low
    this.particleMultiplier = 1.0;
    this.textureResolution = 1.0;
    this.shadowsEnabled = true;
    
    this.startTime = Date.now();
    this.lastReportTime = this.startTime;
  }

  /**
   * Record frame time
   */
  recordFrame(frameTime) {
    this.frameCount++;
    this.frameTime.push(frameTime);
    
    // Keep only last 60 frames
    if (this.frameTime.length > 60) {
      this.frameTime.shift();
    }
    
    // Calculate average FPS
    const avgFrameTime = this.frameTime.reduce((a, b) => a + b, 0) / this.frameTime.length;
    this.fps = Math.round(1000 / avgFrameTime);
    
    // Check if we need to adjust quality
    const currentTime = Date.now();
    if (currentTime - this.lastReportTime > 2000) {
      this.adjustQuality();
      this.lastReportTime = currentTime;
    }
  }

  /**
   * Automatically adjust quality based on performance
   */
  adjustQuality() {
    if (this.fps < 45) {
      // FPS too low, reduce quality
      if (this.quality === 'high') {
        this.setQuality('medium');
      } else if (this.quality === 'medium') {
        this.setQuality('low');
      }
    } else if (this.fps > 55) {
      // FPS good, potentially increase quality
      if (this.quality === 'low') {
        this.setQuality('medium');
      } else if (this.quality === 'medium') {
        this.setQuality('high');
      }
    }
  }

  /**
   * Set quality level
   */
  setQuality(level) {
    if (level === this.quality) return;
    
    this.quality = level;
    
    switch(level) {
      case 'high':
        this.particleMultiplier = 1.0;
        this.textureResolution = 1.0;
        this.shadowsEnabled = true;
        break;
      case 'medium':
        this.particleMultiplier = 0.7;
        this.textureResolution = 0.8;
        this.shadowsEnabled = true;
        break;
      case 'low':
        this.particleMultiplier = 0.4;
        this.textureResolution = 0.5;
        this.shadowsEnabled = false;
        break;
    }
    
    // Dispatch quality change event
    window.dispatchEvent(new CustomEvent('qualityChange', {
      detail: { quality: level }
    }));
  }

  /**
   * Get performance report
   */
  getReport() {
    return {
      fps: this.fps,
      quality: this.quality,
      particleMultiplier: this.particleMultiplier,
      textureResolution: this.textureResolution,
      shadowsEnabled: this.shadowsEnabled,
      frameCount: this.frameCount,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Get FPS as string
   */
  getFpsString() {
    return `${this.fps} FPS`;
  }

  /**
   * Check if device is mobile
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Get device info
   */
  getDeviceInfo() {
    const isMobile = this.isMobile();
    const cores = navigator.hardwareConcurrency || 1;
    const memory = navigator.deviceMemory || 4;
    
    return {
      isMobile,
      cores,
      memory,
      userAgent: navigator.userAgent
    };
  }

  /**
   * Get recommended quality for device
   */
  getRecommendedQuality() {
    const device = this.getDeviceInfo();
    
    if (device.isMobile) {
      return 'medium';
    }
    
    if (device.memory < 4) {
      return 'low';
    }
    
    if (device.cores < 4) {
      return 'medium';
    }
    
    return 'high';
  }

  /**
   * Initialize with device-appropriate settings
   */
  initialize() {
    const recommended = this.getRecommendedQuality();
    this.setQuality(recommended);
  }
}

/**
 * Render optimization utilities
 */
export class RenderOptimizer {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.monkeyPatch();
  }

  /**
   * Monkey-patch renderer for optimizations
   */
  monkeyPatch() {
    const originalRender = this.renderer.render;
    let frameCount = 0;
    
    this.renderer.render = (scene, camera) => {
      frameCount++;
      
      // Frustum culling
      this.frustumCull(scene, camera);
      
      // LOD switching
      this.updateLOD(scene, camera);
      
      // Call original render
      originalRender.call(this.renderer, scene, camera);
    };
  }

  /**
   * Frustum culling - don't render objects outside view
   */
  frustumCull(scene, camera) {
    const frustum = new (require('three')).Frustum();
    const cameraMatrix = new (require('three')).Matrix4();
    
    cameraMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(cameraMatrix);
    
    scene.children.forEach(child => {
      if (child.geometry) {
        child.visible = frustum.intersectsObject(child);
      }
    });
  }

  /**
   * LOD (Level of Detail) switching
   */
  updateLOD(scene, camera) {
    scene.children.forEach(child => {
      if (child.isLOD) {
        child.update(camera);
      }
    });
  }

  /**
   * Dispose
   */
  dispose() {
    // Cleanup
  }
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  constructor() {
    this.initialMemory = this.getMemoryUsage();
  }

  /**
   * Get memory usage from performance API
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }

  /**
   * Get memory increase since initialization
   */
  getMemoryIncrease() {
    const current = this.getMemoryUsage();
    if (!current || !this.initialMemory) return null;
    
    return {
      increase: current.usedJSHeapSize - this.initialMemory.usedJSHeapSize,
      percentage: ((current.usedJSHeapSize - this.initialMemory.usedJSHeapSize) / this.initialMemory.usedJSHeapSize * 100).toFixed(2)
    };
  }

  /**
   * Check if memory is critical
   */
  isMemoryCritical() {
    const memory = this.getMemoryUsage();
    if (!memory) return false;
    
    const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    return usage > 0.85;
  }

  /**
   * Get report
   */
  getReport() {
    return {
      current: this.getMemoryUsage(),
      increase: this.getMemoryIncrease(),
      critical: this.isMemoryCritical()
    };
  }
}

/**
 * Scene optimization utilities
 */
export function optimizeScene(scene, quality = 'high') {
  const particleMultiplier = quality === 'high' ? 1 : quality === 'medium' ? 0.7 : 0.4;
  
  // Reduce particle counts
  scene.children.forEach(child => {
    if (child.isPoints && child.geometry) {
      const positions = child.geometry.attributes.position;
      if (positions && positions.count > 1000) {
        // Could implement particle reduction here
      }
    }
  });
}

/**
 * Calculate geometry complexity
 */
export function calculateComplexity(object) {
  let triangles = 0;
  let vertices = 0;
  let drawCalls = 0;
  
  object.traverse(child => {
    if (child.geometry) {
      const pos = child.geometry.attributes.position;
      if (pos) {
        vertices += pos.count;
        triangles += child.geometry.isBufferGeometry 
          ? (child.geometry.index ? child.geometry.index.count / 3 : pos.count / 3)
          : 0;
      }
      drawCalls++;
    }
  });
  
  return { vertices, triangles, drawCalls };
}
