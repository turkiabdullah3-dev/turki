/**
 * Physics constants and calculations
 * General Relativistic spacetime models for educational visualization
 */

export const PHYSICS_CONSTANTS = {
  G: 6.67430e-11,        // Gravitational constant
  c: 299792458,          // Speed of light
  M_SUN: 1.989e30,       // Solar mass
  AU: 1.496e11,          // Astronomical Unit
};

/**
 * Schwarzschild Spacetime (Non-rotating Black Hole)
 * Metric: ds² = (1 - rs/r)c²dt² - (1 - rs/r)⁻¹dr² - r²dΩ²
 */
export class BlackHolePhysics {
  constructor(massMultiplier = 10) {
    this.mass = PHYSICS_CONSTANTS.M_SUN * massMultiplier;
    this.schwarzschildRadius = this.calculateSchwarzschild();
    this.photonSphereRadius = this.calculatePhotonSphere();
  }

  /**
   * Schwarzschild radius: rs = 2GM/c²
   * The event horizon radius (point of no return)
   */
  calculateSchwarzschild() {
    return (2 * PHYSICS_CONSTANTS.G * this.mass) / (PHYSICS_CONSTANTS.c ** 2);
  }

  /**
   * Photon sphere radius: r_ph = 3rs/2 = 3GM/c²
   * Unstable circular orbit for light
   */
  calculatePhotonSphere() {
    return (1.5 * this.schwarzschildRadius);
  }

  /**
   * Time dilation factor: α(r) = √(1 - rs/r)
   * Ratio of proper time (τ) to coordinate time (t)
   * dτ = dt√(1 - rs/r)
   */
  getTimeDilationFactor(radius) {
    if (radius <= this.schwarzschildRadius) return 0;
    const rs = this.schwarzschildRadius;
    return Math.sqrt(1 - rs / radius);
  }

  /**
   * Gravitational redshift: z = 1/√(1 - rs/r) - 1
   * Light climbing out of gravity loses energy (becomes redder)
   */
  getRedshift(radius) {
    if (radius <= this.schwarzschildRadius) return Infinity;
    const rs = this.schwarzschildRadius;
    return 1 / Math.sqrt(1 - rs / radius) - 1;
  }

  /**
   * Tidal acceleration across length L
   * a_tidal ≈ 2GML/r³
   * Difference in gravity between head and feet
   */
  getTidalForce(radius, bodyLength = 1.8) {
    const rs = this.schwarzschildRadius;
    if (radius <= rs) return Infinity;
    // a_tidal = 2GM * L / r³
    const tidalAcceleration = (2 * PHYSICS_CONSTANTS.G * this.mass * bodyLength) / (radius ** 3);
    return tidalAcceleration;
  }

  /**
   * Tidal stress level (0-1 scale)
   * Safe: < 0.01 m/s²
   * Warning: 0.01 - 0.1 m/s²
   * Critical: > 0.1 m/s²
   */
  getTidalStress(radius, bodyLength = 1.8) {
    const tidal = this.getTidalForce(radius, bodyLength);
    // Normalized to meter scale
    return Math.min(1, tidal / 10); // Clamp at 10 m/s² critical
  }

  /**
   * Lensing angle (approximate)
   */
  getLensingAngle(impactParameter) {
    const rs = this.schwarzschildRadius;
    return (4 * rs) / Math.max(impactParameter, rs * 0.1);
  }

  /**
   * Get all physics metrics for a given radius
   */
  getMetricsAtRadius(radius) {
    return {
      schwarzschildRadius: this.schwarzschildRadius,
      photonSphereRadius: this.photonSphereRadius,
      timeDilationFactor: this.getTimeDilationFactor(radius),
      redshift: this.getRedshift(radius),
      tidalForce: this.getTidalForce(radius),
      tidalStress: this.getTidalStress(radius),
      insideHorizon: radius <= this.schwarzschildRadius,
      insidePhotonSphere: radius <= this.photonSphereRadius
    };
  }

  /**
   * Gravitational wave energy from black hole merger
   * E ≈ 0.03 M c² (approximately 3% of total mass converted to gravitational waves)
   * This is for binary black hole mergers
   */
  getGravitationalWaveEnergy(mass1 = this.mass, mass2 = this.mass) {
    const totalMass = mass1 + mass2;
    const energyReleased = 0.03 * totalMass * (PHYSICS_CONSTANTS.c ** 2);
    return {
      totalMass,
      energyReleased,
      energyInJoules: energyReleased,
      energyInSolarMasses: energyReleased / (PHYSICS_CONSTANTS.M_SUN * PHYSICS_CONSTANTS.c ** 2),
      description: 'Energy radiated as gravitational waves during merger'
    };
  }

  /**
   * Tidal disruption radius for a star near black hole
   * r_t ≈ R_star * (M_BH / M_star)^(1/3)
   * Stars within this radius are torn apart by tidal forces
   */
  getTidalDisruptionRadius(starRadius = 6.96e8, starMass = PHYSICS_CONSTANTS.M_SUN) {
    // Tidal radius
    const r_t = starRadius * Math.pow(this.mass / starMass, 1/3);
    
    return {
      tidalRadius: r_t,
      starRadius,
      starMass,
      isTidallyDisrupted: (r) => r < r_t,
      disruptionFactor: (r) => {
        // How much the star is being stretched (0 = safe, 1 = total disruption)
        if (r >= r_t) return 0;
        return 1 - (r / r_t);
      },
      description: 'Stars closer than this radius are torn apart by tidal forces'
    };
  }

  /**
   * ISCO (Innermost Stable Circular Orbit)
   * For Schwarzschild black hole: r_isco = 6M = 3r_s
   */
  getISCO() {
    return 3 * this.schwarzschildRadius;
  }
}

/**
 * Morris-Thorne Traversable Wormhole
 * Metric: ds² = -e^(2Φ(r))c²dt² + dr²/(1 - b(r)/r) + r²dΩ²
 * Φ(r) = redshift function, b(r) = shape function
 */
export class WormholePhysics {
  constructor(throatRadius = 1, tunnelLength = 5) {
    this.throatRadius = Math.max(0.1, throatRadius);
    this.tunnelLength = Math.max(1, tunnelLength);
    this.redshiftFunction = this.createRedshiftFunction();
  }

  /**
   * Set throat radius (geometric parameter)
   * b(r₀) = r₀ (throat condition)
   */
  setThroatRadius(radius) {
    this.throatRadius = Math.max(0.1, radius);
  }

  /**
   * Set tunnel length (affects exotic matter requirement)
   */
  setTunnelLength(length) {
    this.tunnelLength = Math.max(1, length);
  }

  /**
   * Morris-Thorne shape function: b(r) = b₀²/r
   * Controls throat geometry and wormhole width at radius r
   */
  getShapeFunction(r) {
    if (r < this.throatRadius) return r; // Inside throat
    // b(r) = b₀² / r, where b₀ is throat radius
    return (this.throatRadius ** 2) / Math.max(r, this.throatRadius * 0.5);
  }

  /**
   * Flare-out condition: b'(r₀) < 1
   * Ensures throat flares outward (stable geometry)
   * For b(r) = b₀²/r: b'(r) = -b₀²/r²
   * At throat: b'(r₀) = -1 < 1 ✓ (always satisfied)
   */
  getFlareOutCondition(r = this.throatRadius) {
    const b = this.getShapeFunction(r);
    const dbdr = -(this.throatRadius ** 2) / (r ** 2);
    return {
      derivative: dbdr,
      isSatisfied: Math.abs(dbdr) < 1,
      description: Math.abs(dbdr) < 1 ? 'Geometry OK' : 'Geometry fails'
    };
  }

  /**
   * Redshift function: Φ(r)
   * Simple form: Φ(r) = constant (constant redshift throughout tunnel)
   * In realistic models, often small
   */
  createRedshiftFunction() {
    return (r) => {
      // Minimal redshift in throat region, increases away from throat
      const distance = Math.max(0, r - this.throatRadius);
      return 0.1 * (distance / (this.tunnelLength * 2));
    };
  }

  /**
   * Null Energy Condition (NEC) indicator
   * Traversable wormholes typically violate: ρ + p_r < 0
   * This requires "exotic matter" (negative energy density)
   * Indicator: higher cost = more exotic matter needed
   */
  getExoticMatterCost() {
    // Cost increases with smaller throat and longer tunnel
    // Cost = (tunnelLength / throatRadius) normalized
    const rawCost = (this.tunnelLength / this.throatRadius);
    return Math.min(1, rawCost / 20); // Normalize to 0-1 scale
  }

  /**
   * Embedding diagram: z(r) shows 2D slice of wormhole shape
   * dz/dr = ±√(1/(r/b(r) - 1))
   * Generates points for visualization
   */
  getEmbeddingCurve(rStart = this.throatRadius, rEnd = this.throatRadius * 10, samples = 50) {
    const curve = [];
    for (let i = 0; i <= samples; i++) {
      const r = rStart + ((rEnd - rStart) * i) / samples;
      const b = this.getShapeFunction(r);
      
      if (r > b) {
        // Valid embedding region
        const denominator = r / b - 1;
        const z = Math.sqrt(denominator) * (r - this.throatRadius);
        curve.push({ r, z, x: r * Math.cos(0), y: z });
      }
    }
    return curve;
  }

  /**
   * Metric component: g_rr = 1 / (1 - b(r)/r)
   */
  getMetricComponent(r) {
    const b = this.getShapeFunction(r);
    if (r <= b) return Infinity; // Inside throat
    return 1 / (1 - b / r);
  }

  /**
   * Get all wormhole metrics for UI display
   */
  getMetricsAtRadius(r) {
    const b = this.getShapeFunction(r);
    const flare = this.getFlareOutCondition();
    
    return {
      throatRadius: this.throatRadius,
      tunnelLength: this.tunnelLength,
      shapeFunction_b: b,
      flareOutCondition: flare,
      isStable: flare.isSatisfied,
      exoticMatterCost: this.getExoticMatterCost(),
      metricComponent: this.getMetricComponent(r),
      embeddingCurve: this.getEmbeddingCurve()
    };
  }
}
