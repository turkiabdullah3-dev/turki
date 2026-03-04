// Physical constants (SI units)
// Owner: Turki Abdullah © 2026

export const CONSTANTS = {
  // Universal constants
  G: 6.67430e-11,           // Gravitational constant (m³ kg⁻¹ s⁻²)
  c: 299792458,             // Speed of light (m/s)
  
  // Black hole parameters (for visualization)
  M_solar: 1.989e30,        // Solar mass (kg)
  M_blackhole: 10,          // Black hole mass in solar masses
  
  // Derived quantities (calculated once)
  get M() {
    return this.M_blackhole * this.M_solar;
  },
  
  get r_s() {
    // Schwarzschild radius: r_s = 2GM/c²
    return (2 * this.G * this.M) / (this.c * this.c);
  },
  
  get r_photon() {
    // Photon sphere: r_ph = 3GM/c² = 1.5 * r_s
    return 1.5 * this.r_s;
  },
  
  // Wormhole parameters
  wormhole: {
    throatRadius: 30000,    // meters (throat radius r₀)
    shapeParam: 1.5,        // controls flare-out
    redshiftFunc: 0.0       // Φ(r) - set to 0 for simplicity
  },
  
  // Visualization scaling (to fit on screen)
  scale: {
    distance: 1e-3,         // scale factor for distances
    time: 1.0               // scale factor for time
  },
  
  // Safety limits
  limits: {
    minRadius: 1.02,        // minimum r/r_s ratio (stay outside horizon)
    maxRadius: 100,         // maximum r/r_s ratio
    maxRedshift: 100,       // maximum redshift value
    maxTidal: 1000          // maximum tidal force (arbitrary units)
  }
};

export default CONSTANTS;
