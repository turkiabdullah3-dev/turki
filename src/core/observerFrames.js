// Multi-Observer Reference Frame System
// Owner: Turki Abdullah © 2026

/**
 * ObserverFrame
 * Represents different observer reference frames in curved spacetime
 * Demonstrates how different observers experience gravity differently
 */
export class ObserverFrame {
  static FRAMES = {
    DISTANT: 'distant',
    ORBITING: 'orbiting',
    INFALLING: 'infalling'
  };

  static FRAME_METADATA = {
    distant: {
      name: 'Distant Observer',
      description: 'Observer at infinity, stationary relative to black hole',
      color: 'rgba(100, 200, 255, 0.8)',
      velocity: 0,
      redshiftFactor: 1.0,
      isOrbiting: false,
      isInfalling: false
    },
    orbiting: {
      name: 'Orbiting Observer',
      description: 'Observer in stable circular orbit around black hole',
      color: 'rgba(150, 255, 150, 0.8)',
      velocity: 0.15, // Fraction of speed of light
      redshiftFactor: 0.95,
      isOrbiting: true,
      isInfalling: false
    },
    infalling: {
      name: 'Infalling Observer',
      description: 'Observer falling radially inward toward black hole',
      color: 'rgba(255, 150, 100, 0.8)',
      velocity: 0.3, // Fraction of speed of light (increasing)
      redshiftFactor: 0.85,
      isOrbiting: false,
      isInfalling: true
    }
  };

  constructor(frameType = 'distant') {
    this.frameType = frameType;
    this.metadata = ObserverFrame.FRAME_METADATA[frameType] || ObserverFrame.FRAME_METADATA.distant;
    this.time = 0;
    this.orbitPhase = 0; // For orbiting observer
    this.fallingTime = 0; // Time spent falling
    this.properTime = 0; // Proper time experienced by observer
  }

  /**
   * Update observer state
   * @param {number} deltaTime - Time elapsed in seconds
   * @param {object} state - Current simulation state (distance, alpha, etc.)
   */
  update(deltaTime, state) {
    this.time += deltaTime;

    // Update proper time (affected by gravitational time dilation)
    const alpha = state.alpha || 1.0;
    this.properTime += deltaTime * alpha;

    if (this.frameType === 'orbiting') {
      // Orbiting observer rotates around black hole
      // Orbital period ~ sqrt(r^3) in Schwarzschild geometry
      const distance = state.distance || 5;
      const orbitalPeriod = Math.pow(distance, 1.5) * 2; // Simplified Kepler's 3rd law
      this.orbitPhase = (this.time / orbitalPeriod) * Math.PI * 2;
    } else if (this.frameType === 'infalling') {
      // Infalling observer accelerates toward horizon
      this.fallingTime += deltaTime;
      // Velocity increases as observer approaches horizon
      const horizonDistance = 1.1; // Avoid singularity
      if (state.distance > horizonDistance) {
        // Simplified: velocity approaches c as distance -> 0
        const velocityFraction = Math.min(0.95, 0.3 + 0.5 * (1 - state.distance / 10));
        this.metadata.velocity = velocityFraction;
      }
    }
  }

  /**
   * Get camera position adjustment for this observer frame
   * @param {object} basePosition - Base observer position
   * @param {object} state - Current simulation state
   * @returns {object} Adjusted position
   */
  getCameraOffset(basePosition, state) {
    const offset = { x: 0, y: 0, z: 0 };

    if (this.frameType === 'orbiting') {
      // Orbiting observer rotates around black hole
      const distance = state.distance || 5;
      const orbitRadius = distance * 0.3; // Orbit at 30% of view distance
      offset.x = orbitRadius * Math.cos(this.orbitPhase);
      offset.z = orbitRadius * Math.sin(this.orbitPhase);
      offset.y = orbitRadius * 0.2 * Math.sin(this.orbitPhase * 0.5);
    } else if (this.frameType === 'infalling') {
      // Infalling observer moves forward
      const infallingDistance = this.fallingTime * 0.1; // Move forward over time
      offset.x = infallingDistance * Math.sin(this.time * 0.5);
      offset.z = infallingDistance;
    }

    return offset;
  }

  /**
   * Get camera rotation for this observer frame
   * @returns {object} Rotation { rx, ry, rz } in radians
   */
  getCameraRotation() {
    const rotation = { rx: 0, ry: 0, rz: 0 };

    if (this.frameType === 'orbiting') {
      // Orbiting observer tilts to look at black hole
      rotation.rx = Math.PI * 0.1;
      rotation.ry = this.orbitPhase;
    } else if (this.frameType === 'infalling') {
      // Infalling observer looks downward/forward
      rotation.rx = Math.sin(this.fallingTime * 0.3) * 0.1;
      rotation.ry = Math.sin(this.fallingTime * 0.2) * 0.05;
    }

    return rotation;
  }

  /**
   * Get starfield visual effect parameters
   * @returns {object} Effect parameters
   */
  getStarfieldEffect() {
    const effect = {
      rotationSpeed: 0,
      distortion: 0,
      colorShift: 1.0,
      brightness: 1.0
    };

    if (this.frameType === 'orbiting') {
      // Starfield rotates with observer orbit
      effect.rotationSpeed = (this.orbitPhase * 0.1) % (Math.PI * 2);
      effect.brightness = 1.0 + Math.sin(this.orbitPhase) * 0.1; // Pulsing brightness
    } else if (this.frameType === 'infalling') {
      // Starfield distorts due to gravitational effects
      effect.distortion = Math.min(0.3, this.fallingTime * 0.01);
      // Blue-shift toward horizon (inverse of redshift)
      effect.colorShift = Math.max(0.7, 1.0 - this.fallingTime * 0.05);
      effect.brightness = Math.max(0.6, 1.0 - this.fallingTime * 0.02);
    }

    return effect;
  }

  /**
   * Get redshift modification for this observer
   * Redshift depends on observer's velocity relative to gravitational field
   * @param {number} baseRedshift - Redshift calculated from static observer
   * @returns {number} Modified redshift
   */
  getRedshiftModification(baseRedshift) {
    if (this.frameType === 'distant') {
      return baseRedshift;
    } else if (this.frameType === 'orbiting') {
      // Orbiting observer has orbital motion - adds Doppler effect
      // Approaching side: blue-shift (lower redshift)
      // Receding side: red-shift (higher redshift)
      const dopplerFactor = Math.cos(this.orbitPhase) * 0.05;
      return baseRedshift * (1 - dopplerFactor);
    } else if (this.frameType === 'infalling') {
      // Infalling observer gets blue-shifted (sees higher frequency)
      // Inverse of normal redshift for infalling motion
      const infallingFactor = 1 - Math.min(0.4, this.fallingTime * 0.02);
      return baseRedshift * infallingFactor;
    }

    return baseRedshift;
  }

  /**
   * Get proper time scaling for this observer
   * Proper time is what the observer actually experiences
   * @param {number} coordinateTime - Coordinate time from simulation
   * @returns {number} Proper time experienced by observer
   */
  getProperTimeScaling(coordinateTime) {
    // Proper time is affected by time dilation
    // This is already handled in update(), but can be queried separately
    return this.properTime;
  }

  /**
   * Get velocity of observer in this frame
   * @returns {number} Velocity as fraction of speed of light
   */
  getVelocity() {
    return this.metadata.velocity;
  }

  /**
   * Get frame type
   */
  getFrameType() {
    return this.frameType;
  }

  /**
   * Get frame metadata
   */
  getMetadata() {
    return { ...this.metadata };
  }

  /**
   * Get frame name
   */
  getName() {
    return this.metadata.name;
  }

  /**
   * Get frame description
   */
  getDescription() {
    return this.metadata.description;
  }

  /**
   * Reset observer state
   */
  reset() {
    this.time = 0;
    this.orbitPhase = 0;
    this.fallingTime = 0;
    this.properTime = 0;
  }

  /**
   * Get all available frames
   */
  static getAvailableFrames() {
    return Object.keys(ObserverFrame.FRAME_METADATA).map((key) => ({
      id: key,
      name: ObserverFrame.FRAME_METADATA[key].name,
      description: ObserverFrame.FRAME_METADATA[key].description
    }));
  }
}

export default ObserverFrame;
