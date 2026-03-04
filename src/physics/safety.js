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
export function clamp(value, min, max) {
  if (!isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Safe number - returns default if not finite
 * @param {number} value 
 * @param {number} defaultValue 
 * @returns {number}
 */
export function safeNumber(value, defaultValue = 0) {
  return isFinite(value) ? value : defaultValue;
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
  safeDivide,
  safeSqrt,
  isSafe,
  makeSafe
};
