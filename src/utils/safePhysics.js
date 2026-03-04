/**
 * Safe Physics Layer
 * Ensures all physical calculations produce valid numerical values
 * Prevents NaN, Infinity, and singularities from propagating to renderer
 */

/**
 * Safe numerical handling - always returns a finite number
 * @param {number} value - The value to validate
 * @param {number} fallback - Default value if input is invalid
 * @returns {number} A guaranteed finite number
 */
export function safeNumber(value, fallback = 0) {
  if (Number.isFinite(value) && !Number.isNaN(value)) {
    return value;
  }
  return fallback;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Physics State Validator and Sanitizer
 * Ensures all physics quantities remain within safe numerical bounds
 */
export class PhysicsValidator {
  /**
   * Safe time dilation calculation
   * Prevents square root of negative numbers or zero
   * Returns value in range [1e-6, 1]
   */
  static safeTimeDilation(timeDilation) {
    let safe = safeNumber(timeDilation, 0);
    // Clamp between minimum (near singularity) and 1 (far field)
    return clamp(safe, 1e-6, 1.0);
  }

  /**
   * Safe redshift calculation
   * Prevents Infinity and extremely large values
   * Returns value in reasonable range [0, 1e6]
   */
  static safeRedshift(redshift) {
    let safe = safeNumber(redshift, 0);
    // Clamp at reasonable maximum (beyond this is "infinite redshift")
    return clamp(safe, 0, 1e6);
  }

  /**
   * Safe tidal force calculation
   * Prevents explosions near singularity
   * Returns value in range [0, 1e12] m/s²
   */
  static safeTidalForce(tidalForce) {
    let safe = safeNumber(tidalForce, 0);
    // Clamp to reasonable maximum
    return clamp(safe, 0, 1e12);
  }

  /**
   * Validate entire physics metrics object
   * Sanitizes all physical quantities
   */
  static validateMetrics(metrics) {
    return {
      schwarzschildRadius: safeNumber(metrics.schwarzschildRadius, 1),
      photonSphereRadius: safeNumber(metrics.photonSphereRadius, 2),
      timeDilationFactor: this.safeTimeDilation(metrics.timeDilationFactor),
      redshift: this.safeRedshift(metrics.redshift),
      tidalForce: this.safeTidalForce(metrics.tidalForce),
      tidalStress: clamp(safeNumber(metrics.tidalStress, 0), 0, 1),
      insideHorizon: Boolean(metrics.insideHorizon),
      insidePhotonSphere: Boolean(metrics.insidePhotonSphere)
    };
  }
}

/**
 * Observer Position Constraint
 * Prevents camera from crossing event horizon
 * Maintains observer always outside schwarzschild radius
 */
export class ObserverConstraint {
  /**
   * Ensure observer stays outside event horizon
   * @param {number} currentRadius - Observer's current radial distance
   * @param {number} schwarzschildRadius - Event horizon radius
   * @param {number} safetyFactor - How far outside horizon (default: 1.02 × Rs)
   * @returns {number} Safe radius, either original or clamped to minimum
   */
  static enforceSafeRadius(currentRadius, schwarzschildRadius, safetyFactor = 1.02) {
    const minimumSafeRadius = schwarzschildRadius * safetyFactor;
    
    // If observer would cross horizon, clamp to safe radius
    if (currentRadius <= schwarzschildRadius) {
      return minimumSafeRadius;
    }
    
    // Otherwise return original radius
    return currentRadius;
  }

  /**
   * Validate a 3D camera position relative to black hole
   * Calculates distance and enforces constraints
   * @param {THREE.Vector3} cameraPosition - Camera world position
   * @param {number} schwarzschildRadius - Event horizon radius
   * @param {number} safetyFactor - Safety multiplier
   * @returns {object} {distance, isSafe, constrainedDistance}
   */
  static validateCameraPosition(cameraPosition, schwarzschildRadius, safetyFactor = 1.02) {
    const distance = cameraPosition.length();
    const minimumSafe = schwarzschildRadius * safetyFactor;
    const isSafe = distance >= minimumSafe;
    const constrainedDistance = Math.max(distance, minimumSafe);
    
    return {
      distance: safeNumber(distance, minimumSafe),
      isSafe,
      constrainedDistance: safeNumber(constrainedDistance, minimumSafe),
      schwarzschildRadius,
      safetyFactor
    };
  }

  /**
   * Constrain camera position to stay outside horizon
   * If too close, scales position outward
   * @param {THREE.Vector3} cameraPosition - Current position (modified in place)
   * @param {number} schwarzschildRadius - Event horizon
   * @param {number} safetyFactor - Safety multiplier
   * @returns {boolean} True if position was modified
   */
  static constrainCameraPosition(cameraPosition, schwarzschildRadius, safetyFactor = 1.02) {
    const currentDistance = cameraPosition.length();
    const minimumSafe = schwarzschildRadius * safetyFactor;
    
    if (currentDistance < minimumSafe) {
      // Position is too close - scale it outward
      const scale = minimumSafe / Math.max(currentDistance, 1e-6);
      cameraPosition.multiplyScalar(scale);
      return true;
    }
    
    return false;
  }
}

/**
 * Shader Value Sanitizer
 * Ensures shader inputs never contain NaN or Infinity
 */
export class ShaderValueSanitizer {
  /**
   * Safe uniform value for WebGL
   * Converts invalid values to safe defaults
   */
  static sanitizeUniform(value, defaultValue = 0) {
    if (typeof value === 'number') {
      return safeNumber(value, defaultValue);
    }
    if (Array.isArray(value)) {
      return value.map(v => safeNumber(v, defaultValue));
    }
    return defaultValue;
  }

  /**
   * Sanitize all shader parameters before passing to GPU
   * @param {object} params - Shader parameters object
   * @returns {object} Sanitized parameters
   */
  static sanitizeShaderParams(params) {
    const sanitized = {};
    
    for (const key in params) {
      const value = params[key];
      
      if (typeof value === 'number') {
        sanitized[key] = safeNumber(value, 0);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => safeNumber(v, 0));
      } else if (value && typeof value === 'object') {
        // Handle THREE.Vector, Color, etc.
        if (value.x !== undefined) {
          sanitized[key] = {
            x: safeNumber(value.x, 0),
            y: safeNumber(value.y, 0),
            z: safeNumber(value.z, 0)
          };
        } else if (value.r !== undefined) {
          sanitized[key] = {
            r: safeNumber(value.r, 0),
            g: safeNumber(value.g, 0),
            b: safeNumber(value.b, 0)
          };
        } else {
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

/**
 * Physics Watchdog
 * Monitors physics values and logs warnings when they become unsafe
 */
export class PhysicsWatchdog {
  static warningCount = 0;
  static maxWarnings = 5; // Log max 5 warnings to avoid spam

  static checkPhysicsHealth(metrics, distance, schwarzschildRadius) {
    const warnings = [];

    // Check for inside horizon
    if (distance <= schwarzschildRadius) {
      warnings.push(`❌ Observer inside event horizon! r=${safeNumber(distance)} <= rs=${safeNumber(schwarzschildRadius)}`);
    }

    // Check for invalid time dilation
    if (!Number.isFinite(metrics.timeDilationFactor) || metrics.timeDilationFactor < 0) {
      warnings.push(`⚠️ Invalid time dilation: ${metrics.timeDilationFactor}`);
    }

    // Check for infinite redshift
    if (!Number.isFinite(metrics.redshift) || metrics.redshift > 1e6) {
      warnings.push(`⚠️ Extreme redshift: ${metrics.redshift}`);
    }

    // Check for tidal explosion
    if (!Number.isFinite(metrics.tidalForce) || metrics.tidalForce > 1e12) {
      warnings.push(`⚠️ Extreme tidal force: ${metrics.tidalForce}`);
    }

    // Log warnings
    if (warnings.length > 0 && this.warningCount < this.maxWarnings) {
      console.warn('🚨 Physics Watchdog Alert:', warnings);
      this.warningCount++;
      if (this.warningCount >= this.maxWarnings) {
        console.warn('⚠️ Further warnings suppressed...');
      }
    }

    return {
      isHealthy: warnings.length === 0,
      warnings
    };
  }
}
