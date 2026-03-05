// Safety utilities - prevent NaN and Infinity
// Owner: Turki Abdullah © 2026
// CRITICAL: These functions prevent blank canvas failures

/**
 * Clamp value between min and max
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * Safe number - returns default if not finite
 * @param {number} value 
 * @param {number} defaultValue 
 * @returns {number}
 */
export function safeNumber(x, fallback = 0) {
  return Number.isFinite(x) ? x : fallback;
}

/**
 * Sanitizes physics output so rendering never receives NaN/Infinity.
 * mode:
 *  - "blackhole": clamps radius outside horizon for the external model
 *  - "wormhole": clamps denominators near throat and warp
 */
export function sanitizeState(state, mode) {
  // copy to avoid accidental mutation bugs
  const s = { ...state };

  // General numeric safety
  s.fps = safeNumber(s.fps, 0);

  // --- BLACK HOLE SAFETY ---
  if (mode === 'blackhole') {
    // Require rs and r
    s.rs = safeNumber(s.rs, 0);
    s.r = safeNumber(s.r, s.rs * 2);

    // Prevent crossing the horizon in the external model
    // Use a small safety margin to avoid sqrt(negative) and division blow-ups.
    const minR = s.rs > 0 ? s.rs * 1.02 : 0.001;
    s.r = Math.max(s.r, minR);

    // Clamp alpha to avoid 0/NaN
    s.alpha = safeNumber(s.alpha, 1e-6);
    s.alpha = Math.max(s.alpha, 1e-6);

    // Clamp redshift and tidal to safe display/render ranges
    s.redshift = safeNumber(s.redshift, 0);
    s.redshift = clamp(s.redshift, 0, 1e4);

    s.tidal = safeNumber(s.tidal, 0);
    s.tidal = clamp(s.tidal, 0, 1e12);

    // Any warp strength used in rendering should be clamped too (if present)
    if ('warpStrength' in s) {
      s.warpStrength = safeNumber(s.warpStrength, 0);
      s.warpStrength = clamp(s.warpStrength, 0, 2.0);
    }
  }

  // --- WORMHOLE SAFETY ---
  if (mode === 'wormhole') {
    // Typical fields might be: r0, distanceRatio, warpStrength, stabilityCost
    if ('r0' in s) s.r0 = Math.max(safeNumber(s.r0, 1), 1e-6);

    if ('distanceRatio' in s) {
      s.distanceRatio = safeNumber(s.distanceRatio, 1);
      // avoid 0 or negative ratios that could feed denominators or logs
      s.distanceRatio = Math.max(s.distanceRatio, 1e-6);
    }

    if ('warpStrength' in s) {
      s.warpStrength = safeNumber(s.warpStrength, 0);
      s.warpStrength = clamp(s.warpStrength, 0, 2.0);
    }

    if ('stabilityCost' in s) {
      s.stabilityCost = safeNumber(s.stabilityCost, 0);
      s.stabilityCost = clamp(s.stabilityCost, 0, 1e6);
    }
  }

  return s;
}

/**
 * Safe division - prevents division by zero
 * @param {number} numerator 
 * @param {number} denominator 
 * @param {number} defaultValue 
 * @returns {number}
 */
export function safeDivide(numerator, denominator, defaultValue = 0) {
  if (denominator === 0 || !isFinite(denominator)) {
    return defaultValue;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : defaultValue;
}

/**
 * Safe square root
 * @param {number} value 
 * @param {number} defaultValue 
 * @returns {number}
 */
export function safeSqrt(value, defaultValue = 0) {
  if (value < 0 || !isFinite(value)) {
    return defaultValue;
  }
  const result = Math.sqrt(value);
  return isFinite(result) ? result : defaultValue;
}

/**
 * Check if value is safe (finite and not NaN)
 * @param {number} value 
 * @returns {boolean}
 */
export function isSafe(value) {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Make object properties safe
 * @param {object} obj 
 * @param {number} defaultValue 
 * @returns {object}
 */
export function makeSafe(obj, defaultValue = 0) {
  const safe = {};
  for (const key in obj) {
    safe[key] = safeNumber(obj[key], defaultValue);
  }
  return safe;
}

export default {
  clamp,
  safeNumber,
  sanitizeState,
  safeDivide,
  safeSqrt,
  isSafe,
  makeSafe
};
