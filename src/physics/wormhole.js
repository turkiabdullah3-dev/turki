// Wormhole physics (Morris-Thorne traversable wormhole)
// Owner: Turki Abdullah © 2026
// Scientifically accurate equations with safety clamps

import CONSTANTS from './constants.js';
import { clamp, safeNumber, safeDivide, safeSqrt } from './safety.js';

export class WormholePhysics {
  constructor() {
    this.r0 = CONSTANTS.wormhole.throatRadius;    // Throat radius
    this.b0 = this.r0;                             // b(r0) = r0 (throat condition)
    this.shapeParam = CONSTANTS.wormhole.shapeParam;
  }
  
  /**
   * Shape function b(r)
   * Must satisfy: b(r0) = r0, b'(r0) < 1 (flare-out condition)
   * Using: b(r) = r0 * (r0/r)^shapeParam
   * @param {number} r - radius coordinate
   * @returns {number}
   */
  shapeFunction(r) {
    if (r <= 0) return this.r0;
    const ratio = this.r0 / r;
    const b = this.r0 * Math.pow(ratio, this.shapeParam);
    return safeNumber(b, this.r0);
  }
  
  /**
   * Redshift function Φ(r)
   * Set to 0 for simplicity (no redshift)
   * @param {number} r 
   * @returns {number}
   */
  redshiftFunction(r) {
    return 0; // Simplest case
  }
  
  /**
   * Metric component g_rr = 1/(1 - b(r)/r)
   * @param {number} r 
   * @returns {number}
   */
  metricRR(r) {
    const b = this.shapeFunction(r);
    const denominator = 1 - b / r;
    
    if (denominator <= 0) {
      // Near throat, avoid singularity
      return 100; // Large value
    }
    
    return safeDivide(1, denominator, 1);
  }
  
  /**
   * Calculate embedding diagram slope dz/dr
   * dz/dr = ± 1/√(r/b(r) - 1)
   * @param {number} r 
   * @returns {number}
   */
  embeddingSlope(r) {
    const b = this.shapeFunction(r);
    const ratio = safeDivide(r, b, 1.1);
    
    if (ratio <= 1) {
      return 10; // Very steep near throat
    }
    
    const slope = safeDivide(1, safeSqrt(ratio - 1, 0.1), 10);
    return clamp(slope, 0, 10);
  }
  
  /**
   * Check if at throat
   * @param {number} r 
   * @returns {boolean}
   */
  isAtThroat(r) {
    return Math.abs(r - this.r0) < this.r0 * 0.1;
  }
  
  /**
   * Calculate "exotic matter" density indicator
   * Violates NEC: ρ + p_r < 0
   * Returns negative value to indicate violation
   * @param {number} r 
   * @returns {number}
   */
  exoticMatterDensity(r) {
    const b = this.shapeFunction(r);
    const b_prime = -this.shapeParam * b / r; // derivative
    
    // Simplified NEC violation indicator
    const violation = b_prime - b / (r * r);
    return safeNumber(violation, -1);
  }
  
  /**
   * Calculate warp strength (visualization parameter)
   * Higher near throat
   * @param {number} r 
   * @returns {number} in [0, 1]
   */
  warpStrength(r) {
    const distance_from_throat = Math.abs(r - this.r0);
    const normalized_distance = safeDivide(distance_from_throat, this.r0, 1);
    
    // Exponential decay from throat
    const strength = Math.exp(-2 * normalized_distance);
    return clamp(strength, 0, 1);
  }
  
  /**
   * Calculate coordinate distance to other side
   * In Morris-Thorne, you can traverse to r < r0
   * @param {number} r 
   * @returns {number}
   */
  distanceToOtherSide(r) {
    if (r > this.r0) {
      return r - this.r0;
    } else {
      return this.r0 - r;
    }
  }
  
  /**
   * Get physical state at given radius
   * @param {number} r 
   * @returns {object}
   */
  getState(r) {
    const r_safe = Math.max(r, this.r0 * 0.5);
    
    return {
      r: r_safe,
      r_normalized: safeDivide(r_safe, this.r0, 1),
      b: this.shapeFunction(r_safe),
      warpStrength: this.warpStrength(r_safe),
      embeddingSlope: this.embeddingSlope(r_safe),
      exoticMatter: this.exoticMatterDensity(r_safe),
      atThroat: this.isAtThroat(r_safe),
      distanceToOtherSide: this.distanceToOtherSide(r_safe)
    };
  }
}

export default WormholePhysics;
