// Units Converter - Relative vs Physical Units
// Owner: Turki Abdullah © 2026

/**
 * Physical constants
 */
const CONSTANTS = {
  G: 6.67430e-11,          // Gravitational constant (m³ kg⁻¹ s⁻²)
  c: 299792458,            // Speed of light (m/s)
  SOLAR_MASS: 1.98892e30,  // Solar mass (kg)
};

/**
 * Unit modes
 */
export const UnitMode = {
  RELATIVE: 'relative',
  PHYSICAL: 'physical'
};

/**
 * Units Converter
 * Converts between relative units (r_s, r₀) and physical units (km, m)
 */
export class UnitsConverter {
  constructor(mode = 'blackhole') {
    this.mode = mode; // 'blackhole' or 'wormhole'
    this.unitMode = UnitMode.RELATIVE;
    this.blackHoleMass = 10; // Solar masses (default)
    this.wormholeThroatRadius = 1000; // meters (default)
    this.schwarzschildRadius = this.calculateSchwarzschildRadius();
  }
  
  /**
   * Calculate Schwarzschild radius
   * r_s = 2GM / c²
   */
  calculateSchwarzschildRadius() {
    const M = this.blackHoleMass * CONSTANTS.SOLAR_MASS; // Convert to kg
    const r_s = (2 * CONSTANTS.G * M) / (CONSTANTS.c * CONSTANTS.c);
    return r_s; // meters
  }
  
  /**
   * Set unit mode
   */
  setUnitMode(mode) {
    if (Object.values(UnitMode).includes(mode)) {
      this.unitMode = mode;
      localStorage.setItem('unitMode', mode);
    }
  }
  
  /**
   * Get current unit mode
   */
  getUnitMode() {
    return this.unitMode;
  }
  
  /**
   * Set black hole mass (in solar masses)
   */
  setBlackHoleMass(solarMasses) {
    this.blackHoleMass = Math.max(0.1, Math.min(1e11, solarMasses)); // Clamp 0.1 - 100 billion M☉
    this.schwarzschildRadius = this.calculateSchwarzschildRadius();
    localStorage.setItem('blackHoleMass', this.blackHoleMass.toString());
  }
  
  /**
   * Get black hole mass (in solar masses)
   */
  getBlackHoleMass() {
    return this.blackHoleMass;
  }
  
  /**
   * Set wormhole throat radius (in meters)
   */
  setWormholeThroatRadius(meters) {
    this.wormholeThroatRadius = Math.max(1, Math.min(1e6, meters)); // Clamp 1m - 1000km
    localStorage.setItem('wormholeThroatRadius', this.wormholeThroatRadius.toString());
  }
  
  /**
   * Get wormhole throat radius (in meters)
   */
  getWormholeThroatRadius() {
    return this.wormholeThroatRadius;
  }
  
  /**
   * Convert distance for display
   * @param {number} relativeValue - Distance in relative units (r/r_s or r/r₀)
   * @param {string} type - 'distance', 'radius', etc.
   * @returns {Object} { value, unit }
   */
  convertDistance(relativeValue, type = 'distance') {
    if (this.unitMode === UnitMode.RELATIVE) {
      if (this.mode === 'blackhole') {
        return {
          value: relativeValue.toFixed(2),
          unit: 'r_s'
        };
      } else {
        return {
          value: relativeValue.toFixed(2),
          unit: 'r₀'
        };
      }
    } else {
      // Physical mode
      if (this.mode === 'blackhole') {
        const meters = relativeValue * this.schwarzschildRadius;
        const km = meters / 1000;
        
        if (km >= 1) {
          return {
            value: km.toFixed(2),
            unit: 'km'
          };
        } else {
          return {
            value: meters.toFixed(2),
            unit: 'm'
          };
        }
      } else {
        // Wormhole
        const meters = relativeValue * this.wormholeThroatRadius;
        const km = meters / 1000;
        
        if (km >= 1) {
          return {
            value: km.toFixed(2),
            unit: 'km'
          };
        } else {
          return {
            value: meters.toFixed(2),
            unit: 'm'
          };
        }
      }
    }
  }
  
  /**
   * Convert Schwarzschild radius for display
   * @returns {Object} { value, unit }
   */
  convertSchwarzschildRadius() {
    if (this.unitMode === UnitMode.RELATIVE) {
      return {
        value: '1.00',
        unit: 'r_s'
      };
    } else {
      const km = this.schwarzschildRadius / 1000;
      return {
        value: km.toFixed(2),
        unit: 'km'
      };
    }
  }
  
  /**
   * Convert throat radius for display
   * @returns {Object} { value, unit }
   */
  convertThroatRadius() {
    if (this.unitMode === UnitMode.RELATIVE) {
      return {
        value: '1.00',
        unit: 'r₀'
      };
    } else {
      const meters = this.wormholeThroatRadius;
      const km = meters / 1000;
      
      if (km >= 1) {
        return {
          value: km.toFixed(2),
          unit: 'km'
        };
      } else {
        return {
          value: meters.toFixed(0),
          unit: 'm'
        };
      }
    }
  }
  
  /**
   * Get unit label for a measurement type
   */
  getUnitLabel(type) {
    if (this.unitMode === UnitMode.RELATIVE) {
      if (this.mode === 'blackhole') {
        switch (type) {
          case 'distance': return 'r_s';
          case 'radius': return 'r_s';
          default: return '';
        }
      } else {
        switch (type) {
          case 'distance': return 'r₀';
          case 'radius': return 'r₀';
          default: return '';
        }
      }
    } else {
      // Physical mode - units are determined by scale
      return ''; // Will be set by conversion
    }
  }
  
  /**
   * Load saved preferences
   */
  loadPreferences() {
    const savedMode = localStorage.getItem('unitMode');
    if (savedMode && Object.values(UnitMode).includes(savedMode)) {
      this.unitMode = savedMode;
    }
    
    const savedMass = localStorage.getItem('blackHoleMass');
    if (savedMass) {
      const mass = parseFloat(savedMass);
      if (!isNaN(mass) && mass > 0) {
        this.blackHoleMass = mass;
        this.schwarzschildRadius = this.calculateSchwarzschildRadius();
      }
    }
    
    const savedThroat = localStorage.getItem('wormholeThroatRadius');
    if (savedThroat) {
      const throat = parseFloat(savedThroat);
      if (!isNaN(throat) && throat > 0) {
        this.wormholeThroatRadius = throat;
      }
    }
  }
  
  /**
   * Get info text for current configuration
   */
  getConfigInfo() {
    if (this.mode === 'blackhole') {
      return `Black hole mass: ${this.blackHoleMass.toFixed(1)} M☉ (r_s = ${(this.schwarzschildRadius / 1000).toFixed(2)} km)`;
    } else {
      const km = this.wormholeThroatRadius / 1000;
      if (km >= 1) {
        return `Throat radius: ${km.toFixed(2)} km`;
      } else {
        return `Throat radius: ${this.wormholeThroatRadius.toFixed(0)} m`;
      }
    }
  }
}

export default UnitsConverter;
