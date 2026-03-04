// Core configuration for Spacetime Observatory
// Owner: Turki Abdullah © 2026

export const CONFIG = {
  owner: {
    name: 'Turki Abdullah',
    year: '2026'
  },
  
  users: {
    turki: {
      username: 'turki',
      role: 'owner',
      displayName: 'Turki Abdullah'
    },
    mashael: {
      username: 'mashael',
      role: 'guest',
      displayName: 'Mashael'
    }
  },
  
  performance: {
    maxDPR: 2,
    starCount: {
      mobile: 700,
      tablet: 1200,
      desktop: 2000
    },
    hudUpdateInterval: 100, // ms (10 FPS for HUD)
    targetFPS: 60
  },
  
  csp: {
    // Content Security Policy
    meta: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:;"
  },
  
  rights: {
    footer: '© 2026 Turki Abdullah. All Rights Reserved.',
    notice: "This project's design, structure, and implementation are proprietary. No reproduction or redistribution without permission."
  }
};

export default CONFIG;
