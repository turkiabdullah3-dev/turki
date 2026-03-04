// Render safety - prevents NaN/Infinity from reaching canvas
// Owner: Turki Abdullah © 2026
// Ensures all physics state values are safe for rendering

import { clamp, safeNumber } from './safety.js';
import CONSTANTS from './constants.js';

/**
 * Sanitize black hole physics state before rendering
 * Prevents alpha, redshift, tidal from becoming Infinity/NaN
 * @param {object} state - BlackHolePhysics.getState() output
 * @returns {object} - Safe state for rendering
 */
export function sanitizeBlackHoleState(state) {
  if (!state) {
    return {
      r: CONSTANTS.r_s * 5,
      r_normalized: 5,
      alpha: 0.8,
      redshift: 0.1,
      tidalForce: 0,
      isAtPhotonSphere: false,
      insideHorizon: false
    };
  }
  
  return {
    r: safeNumber(state.r, CONSTANTS.r_s * 5),
    r_normalized: clamp(safeNumber(state.r_normalized, 5), 1.02, 100),
    alpha: clamp(safeNumber(state.alpha, 0.8), 1e-6, 1),
    redshift: clamp(safeNumber(state.redshift, 0.1), 0, CONSTANTS.limits.maxRedshift),
    tidalForce: clamp(safeNumber(state.tidalForce, 0), 0, CONSTANTS.limits.maxTidal),
    isAtPhotonSphere: Boolean(state.isAtPhotonSphere),
    insideHorizon: Boolean(state.insideHorizon)
  };
}

/**
 * Sanitize wormhole physics state before rendering
 * Prevents warp strength, curvature from becoming Infinity/NaN
 * @param {object} state - WormholePhysics.getState() output
 * @returns {object} - Safe state for rendering
 */
export function sanitizeWormholeState(state) {
  if (!state) {
    return {
      r: CONSTANTS.wormhole.throatRadius * 2,
      r_normalized: 2,
      b: CONSTANTS.wormhole.throatRadius,
      warpStrength: 0.25,
      embeddingSlope: 1,
      exoticMatter: -0.1,
      atThroat: false,
      distanceToOtherSide: CONSTANTS.wormhole.throatRadius
    };
  }
  
  return {
    r: safeNumber(state.r, CONSTANTS.wormhole.throatRadius * 2),
    r_normalized: clamp(safeNumber(state.r_normalized, 2), 0.5, 10),
    b: clamp(safeNumber(state.b, CONSTANTS.wormhole.throatRadius), 
             CONSTANTS.wormhole.throatRadius * 0.5, 
             CONSTANTS.wormhole.throatRadius * 10),
    warpStrength: clamp(safeNumber(state.warpStrength, 0.25), 0, 2),
    embeddingSlope: clamp(safeNumber(state.embeddingSlope, 1), 0, 10),
    exoticMatter: safeNumber(state.exoticMatter, -0.1),
    atThroat: Boolean(state.atThroat),
    distanceToOtherSide: clamp(safeNumber(state.distanceToOtherSide, CONSTANTS.wormhole.throatRadius), 
                               0, CONSTANTS.wormhole.throatRadius * 10)
  };
}

/**
 * Safe visual warp amount for rendering (clamped 0-1 for alpha/opacity)
 * @param {number} warpStrength - from physics
 * @returns {number} - Safe warp value for canvas rendering
 */
export function getVisualWarpAmount(warpStrength) {
  return clamp(safeNumber(warpStrength, 0), 0, 1);
}

/**
 * Safe visual radius for rendering (prevents log(0) or log(Infinity))
 * @param {number} physicalRadius - actual physical radius in meters
 * @param {number} referenceRadius - e.g., r_s or r0
 * @param {number} maxVisualRadius - max screen pixels
 * @returns {number} - Safe visual radius for drawing
 */
export function getVisualRadius(physicalRadius, referenceRadius, maxVisualRadius = 200) {
  const physicalSafe = Math.max(physicalRadius, referenceRadius * 0.5);
  const referenceSafe = Math.max(referenceRadius, 1);
  
  const ratio = physicalSafe / referenceSafe;
  const normalized = Math.log(ratio + 1) / Math.log(10);
  
  return clamp(normalized * maxVisualRadius, 5, maxVisualRadius);
}

/**
 * Safe gradient color generation (prevents invalid colors)
 * @param {number} value - Normalized value 0-1
 * @param {boolean} useHSL - If true, returns HSL; else RGBA
 * @returns {string} - Valid CSS color string
 */
export function getSafeColor(value, useHSL = false) {
  const v = clamp(safeNumber(value, 0.5), 0, 1);
  
  if (useHSL) {
    const hue = v * 360;
    const saturation = 80;
    const lightness = 50;
    return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
  } else {
    // RGBA from value
    const r = Math.round(v * 255);
    const g = Math.round((1 - v) * 255);
    const b = 200;
    const a = clamp(v, 0.3, 1);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

export default {
  sanitizeBlackHoleState,
  sanitizeWormholeState,
  getVisualWarpAmount,
  getVisualRadius,
  getSafeColor
};
