/**
 * Graphics Quality Configuration
 * Controls visual fidelity and performance settings
 */

export const GraphicsPresets = {
  ULTRA: {
    name: 'Ultra',
    particleCount: {
      stars: 10000,
      accretionDisk: 10000,
      dust: 3000,
      glow: 800,
      wormholeEnergy: 1500
    },
    shaderQuality: 'high',
    bloomStrength: 2.2,
    bloomRadius: 1.0,
    bloomThreshold: 0.1,
    shadowsEnabled: true,
    shadowMapSize: 2048,
    antialiasing: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    postProcessing: {
      enabled: true,
      chromaticAberration: 0.002,
      vignette: 0.5,
      filmGrain: 0.05
    },
    effects: {
      lensFlare: true,
      motionBlur: true,
      depthOfField: true,
      volumetricLighting: true
    }
  },
  
  HIGH: {
    name: 'High',
    particleCount: {
      stars: 8000,
      accretionDisk: 8000,
      dust: 2000,
      glow: 600,
      wormholeEnergy: 1000
    },
    shaderQuality: 'high',
    bloomStrength: 1.8,
    bloomRadius: 0.8,
    bloomThreshold: 0.15,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    antialiasing: true,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    postProcessing: {
      enabled: true,
      chromaticAberration: 0.001,
      vignette: 0.4,
      filmGrain: 0.03
    },
    effects: {
      lensFlare: true,
      motionBlur: false,
      depthOfField: true,
      volumetricLighting: true
    }
  },
  
  MEDIUM: {
    name: 'Medium',
    particleCount: {
      stars: 5000,
      accretionDisk: 5000,
      dust: 1500,
      glow: 400,
      wormholeEnergy: 700
    },
    shaderQuality: 'medium',
    bloomStrength: 1.5,
    bloomRadius: 0.6,
    bloomThreshold: 0.2,
    shadowsEnabled: false,
    shadowMapSize: 512,
    antialiasing: true,
    pixelRatio: 1,
    postProcessing: {
      enabled: true,
      chromaticAberration: 0,
      vignette: 0.3,
      filmGrain: 0.02
    },
    effects: {
      lensFlare: false,
      motionBlur: false,
      depthOfField: false,
      volumetricLighting: false
    }
  },
  
  LOW: {
    name: 'Low',
    particleCount: {
      stars: 3000,
      accretionDisk: 3000,
      dust: 800,
      glow: 200,
      wormholeEnergy: 400
    },
    shaderQuality: 'low',
    bloomStrength: 1.0,
    bloomRadius: 0.4,
    bloomThreshold: 0.3,
    shadowsEnabled: false,
    shadowMapSize: 256,
    antialiasing: false,
    pixelRatio: 1,
    postProcessing: {
      enabled: false,
      chromaticAberration: 0,
      vignette: 0.2,
      filmGrain: 0
    },
    effects: {
      lensFlare: false,
      motionBlur: false,
      depthOfField: false,
      volumetricLighting: false
    }
  }
};

/**
 * Auto-detect optimal graphics settings based on device
 */
export function detectOptimalPreset() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    return GraphicsPresets.LOW;
  }
  
  // Check WebGL capabilities
  const renderer = gl.getParameter(gl.RENDERER);
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
  
  // Performance heuristics
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = maxTextureSize < 4096 || maxVertexUniforms < 256;
  const hasHighDPI = window.devicePixelRatio > 1.5;
  
  // Memory check (approximate)
  const memory = navigator.deviceMemory || 4; // GB
  
  if (isMobile || isLowEnd || memory < 4) {
    return GraphicsPresets.LOW;
  } else if (memory < 6 || !hasHighDPI) {
    return GraphicsPresets.MEDIUM;
  } else if (memory < 8) {
    return GraphicsPresets.HIGH;
  } else {
    return GraphicsPresets.ULTRA;
  }
}

/**
 * Color palettes for different scenes
 */
export const ColorPalettes = {
  blackHole: {
    eventHorizon: 0x000000,
    accretionDiskInner: 0x4da6ff,  // Blue-white (hottest)
    accretionDiskMid: 0xffd700,     // Yellow
    accretionDiskOuter: 0xff6600,   // Orange-red (coolest)
    photonRing: 0xffa500,
    jetBlue: 0x00d9ff,
    jetPurple: 0x9d00ff,
    lensGlow: 0x1a1a3e
  },
  
  wormhole: {
    throatColor1: 0x7d00ff,  // Purple
    throatColor2: 0x00d9ff,  // Cyan
    galaxyBlue: 0x4da6ff,
    galaxyOrange: 0xff8c42,
    energyFlow: 0x00ffff,
    spacetimeGrid: 0x4d4dff
  },
  
  cosmic: {
    nebulaDeep: 0x1a0933,
    nebulaMid: 0x2d1b4e,
    nebulaLight: 0x4a2f6f,
    starWhite: 0xffffff,
    starBlue: 0xb3d9ff,
    starYellow: 0xffeb99,
    starRed: 0xff9999,
    dustParticle: 0x8888aa,
    glowCyan: 0x00d9ff,
    glowPurple: 0x7d00ff
  }
};

/**
 * Physics visualization constants
 */
export const PhysicsConstants = {
  // Schwarzschild radius scaling for visibility
  schwarzschildScale: 50,
  
  // ISCO (Innermost Stable Circular Orbit) multiplier
  iscoRadius: 3, // 3 * Schwarzschild radius
  
  // Photon sphere
  photonSphereRadius: 1.5, // 1.5 * Schwarzschild radius
  
  // Accretion disk dimensions
  accretionDiskInner: 3,
  accretionDiskOuter: 15,
  
  // Wormhole throat
  wormholeThroatMin: 1.0,
  wormholeThroatMax: 5.0,
  
  // Animation speeds
  diskRotationSpeed: 0.001,
  particleFlowSpeed: 0.02,
  shaderTimeScale: 0.01
};

/**
 * Camera presets for cinematic views
 */
export const CameraPresets = {
  blackHole: {
    distant: {
      distance: 500,
      yaw: 0.3,
      pitch: 0.2,
      fov: 60
    },
    approach: {
      distance: 150,
      yaw: 0.1,
      pitch: 0.05,
      fov: 65
    },
    eventHorizon: {
      distance: 60,
      yaw: 0.05,
      pitch: 0.02,
      fov: 70
    },
    firstPerson: {
      distance: 40,
      yaw: 0,
      pitch: 0,
      fov: 85
    }
  },
  
  wormhole: {
    external: {
      distance: 400,
      height: 50,
      rotationSpeed: 0.002,
      fov: 60
    },
    internal: {
      tunnelSpeed: 5,
      wobbleAmount: 20,
      fov: 75
    }
  }
};

export default {
  GraphicsPresets,
  detectOptimalPreset,
  ColorPalettes,
  PhysicsConstants,
  CameraPresets
};
