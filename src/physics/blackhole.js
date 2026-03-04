// Black hole physics (Schwarzschild metric)
// Owner: Turki Abdullah © 2026
// Scientifically accurate equations with safety clamps

import CONSTANTS from './constants.js';
import { clamp, safeNumber, safeDivide, safeSqrt } from './safety.js';

export class BlackHolePhysics {
  constructor() {
    this.r_s = CONSTANTS.r_s;           // Schwarzschild radius
    this.r_photon = CONSTANTS.r_photon; // Photon sphere
    this.M = CONSTANTS.M;               // Black hole mass
    this.G = CONSTANTS.G;
    this.c = CONSTANTS.c;
  }
  
  /**
   * Calculate time dilation factor α(r)
   * α(r) = √(1 - r_s/r)
   * Safe for r > r_s
   * @param {number} r - radius (meters)
   * @returns {number} α in [0, 1]
   */
  timeDilation(r) {
    // Enforce minimum radius (stay outside horizon)
    const r_safe = Math.max(r, this.r_s * CONSTANTS.limits.minRadius);
    const ratio = this.r_s / r_safe;
    const alpha_squared = 1 - ratio;
    
    // Should be positive for r > r_s
    if (alpha_squared <= 0) {
      return 0.01; // Very close to horizon
    }
    
    const alpha = safeSqrt(alpha_squared, 0.01);
    return clamp(alpha, 0, 1);
  }
  
  /**
   * Calculate gravitational redshift z
   * 1 + z = 1/√(1 - r_s/r)
   * @param {number} r - radius (meters)
   * @returns {number} redshift factor
   */
  redshift(r) {
    const alpha = this.timeDilation(r);
    if (alpha === 0) return CONSTANTS.limits.maxRedshift;
    
    const z = safeDivide(1, alpha, CONSTANTS.limits.maxRedshift) - 1;
    return clamp(z, 0, CONSTANTS.limits.maxRedshift);
  }
  
  /**
   * Calculate tidal acceleration
   * a_tidal ≈ 2GM L / r³
   * @param {number} r - radius (meters)
   * @param {number} L - object length (meters, default 2m for human)
   * @returns {number} tidal force (m/s²)
   */
  tidalAcceleration(r, L = 2) {
    const r_safe = Math.max(r, this.r_s * CONSTANTS.limits.minRadius);
    const numerator = 2 * this.G * this.M * L;
    const denominator = r_safe * r_safe * r_safe;
    
    const a_tidal = safeDivide(numerator, denominator, 0);
    return clamp(a_tidal, 0, CONSTANTS.limits.maxTidal);
  }
  
  /**
   * Check if radius is at photon sphere
   * @param {number} r 
   * @returns {boolean}
   */
  isAtPhotonSphere(r) {
    return Math.abs(r - this.r_photon) < this.r_s * 0.05;
  }
  
  /**
   * Check if inside event horizon
   * @param {number} r 
   * @returns {boolean}
   */
  isInsideHorizon(r) {
    return r <= this.r_s;
  }
  
  /**
   * Get normalized radius (r/r_s)
   * @param {number} r 
   * @returns {number}
   */
  getNormalizedRadius(r) {
    return safeDivide(r, this.r_s, CONSTANTS.limits.minRadius);
  }
  
  /**
   * Calculate proper time elapsed for observer at radius r
   * dτ = dt * α(r)
   * @param {number} r - radius
   * @param {number} dt - coordinate time interval
   * @returns {number} proper time
   */
  properTime(r, dt) {
    const alpha = this.timeDilation(r);
    return safeNumber(dt * alpha, 0);
  }
  
  /**
   * Get physical state at given radius
   * @param {number} r - radius (meters)
   * @returns {object}
   */
  getState(r) {
    const r_safe = Math.max(r, this.r_s * CONSTANTS.limits.minRadius);
    
    return {
      r: r_safe,
      r_normalized: this.getNormalizedRadius(r_safe),
      alpha: this.timeDilation(r_safe),
      redshift: this.redshift(r_safe),
      tidalForce: this.tidalAcceleration(r_safe),
      isAtPhotonSphere: this.isAtPhotonSphere(r_safe),
      insideHorizon: this.isInsideHorizon(r_safe)
    };
  }
}

export default BlackHolePhysics;
