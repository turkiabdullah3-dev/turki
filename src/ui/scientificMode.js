// Scientific Mode - Educational physics overlay
// Owner: Turki Abdullah © 2026

import { sanitize } from '../core/sanitize.js';

/**
 * Scientific Mode UI Component
 * Displays physics equations and explanations with current values
 */
export class ScientificMode {
  constructor(mode = 'blackhole') {
    this.mode = mode;
    this.isActive = false;
    this.panel = null;
    this.currentState = null;
    this.equations = this.getEquationsForMode();
  }
  
  /**
   * Get equation definitions for current mode
   */
  getEquationsForMode() {
    if (this.mode === 'blackhole') {
      return [
        {
          title: 'Time Dilation',
          formula: 'α(r) = √(1 − r_s / r)',
          explanation: 'This equation describes gravitational time dilation. As the observer approaches the Schwarzschild radius, time slows relative to distant observers.',
          getValue: (state) => state.alpha != null ? state.alpha.toFixed(4) : '—',
          symbol: 'α'
        },
        {
          title: 'Gravitational Redshift',
          formula: 'z = (1 / α) − 1',
          explanation: 'Light loses energy climbing out of the gravitational well, shifting toward longer wavelengths. This redshift increases dramatically near the event horizon.',
          getValue: (state) => state.redshift != null ? state.redshift.toFixed(4) : '—',
          symbol: 'z'
        },
        {
          title: 'Schwarzschild Radius',
          formula: 'r_s = 2GM / c²',
          explanation: 'The event horizon radius where escape velocity equals the speed of light. Nothing, not even light, can escape from within this radius.',
          getValue: (state) => state.rs != null ? `${(state.rs / 1000).toFixed(2)} km` : '—',
          symbol: 'r_s'
        },
        {
          title: 'Tidal Force',
          formula: 'F_tidal ∝ M / r³',
          explanation: 'The differential gravitational force across an extended object. This "spaghettification" effect increases rapidly as r decreases.',
          getValue: (state) => state.tidal != null ? state.tidal.toExponential(2) : '—',
          symbol: 'F_tidal'
        }
      ];
    } else if (this.mode === 'wormhole') {
      return [
        {
          title: 'Shape Function',
          formula: 'b(r) = r₀² / r',
          explanation: 'This function describes the curvature of spacetime around the wormhole throat. It determines how the geometry connects two regions of space.',
          getValue: (state) => state.r_normalized != null ? (1 / state.r_normalized).toFixed(3) : '—',
          symbol: 'b/r₀'
        },
        {
          title: 'Warp Strength',
          formula: 'W = |b′(r) / r|',
          explanation: 'Measures the intensity of spacetime curvature. Higher values indicate stronger warping of space required to maintain the wormhole.',
          getValue: (state) => state.warpStrength != null ? state.warpStrength.toFixed(4) : '—',
          symbol: 'W'
        },
        {
          title: 'Throat Radius',
          formula: 'r₀ = constant',
          explanation: 'The minimum radius of the wormhole, representing the narrowest point connecting the two spacetime regions. This is the critical constraint for traversability.',
          getValue: (state) => '1.00 r₀',
          symbol: 'r₀'
        },
        {
          title: 'Exotic Matter',
          formula: 'T_rr = −ρ_exotic < 0',
          explanation: 'Wormholes require exotic matter with negative energy density to remain open. This violates the weak energy condition and has never been observed in nature.',
          getValue: (state) => state.exoticMatter != null && state.exoticMatter < 0 ? 'Required' : 'Not Required',
          symbol: 'ρ_exotic'
        }
      ];
    }
    return [];
  }
  
  /**
   * Initialize scientific mode
   */
  init() {
    // Create panel element
    this.panel = document.createElement('div');
    this.panel.id = 'scientific-panel';
    this.panel.className = 'scientific-panel';
    this.panel.style.display = 'none';
    
    // Add to body
    document.body.appendChild(this.panel);
    
    // Initial render
    this.render();
    
    return this;
  }
  
  /**
   * Toggle scientific mode on/off
   */
  toggle() {
    this.isActive = !this.isActive;
    if (this.panel) {
      this.panel.style.display = this.isActive ? 'block' : 'none';
    }
    
    // Save preference
    localStorage.setItem('scientificMode', this.isActive ? 'on' : 'off');
    
    return this.isActive;
  }
  
  /**
   * Set active state
   */
  setActive(active) {
    this.isActive = active;
    if (this.panel) {
      this.panel.style.display = this.isActive ? 'block' : 'none';
    }
  }
  
  /**
   * Update state values
   */
  updateState(state) {
    this.currentState = state;
    if (this.isActive) {
      this.render();
    }
  }
  
  /**
   * Render the scientific panel
   */
  render() {
    if (!this.panel) return;
    
    let html = `
      <div class="scientific-header">
        <h3>Scientific Mode</h3>
        <p class="scientific-subtitle">${this.mode === 'blackhole' ? 'Black Hole Physics' : 'Wormhole Physics'}</p>
      </div>
      <div class="scientific-content">
    `;
    
    this.equations.forEach(eq => {
      const value = this.currentState ? eq.getValue(this.currentState) : '—';
      
      html += `
        <div class="scientific-equation">
          <div class="equation-title">${eq.title}</div>
          <div class="equation-formula">${this.escapeHtml(eq.formula)}</div>
          <div class="equation-explanation">${this.escapeHtml(eq.explanation)}</div>
          <div class="equation-value">
            <span class="value-label">Current value:</span>
            <span class="value-data">${eq.symbol} = ${this.escapeHtml(value)}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    this.panel.innerHTML = html;
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Load saved preference
   */
  loadPreference() {
    const saved = localStorage.getItem('scientificMode');
    if (saved === 'on') {
      this.setActive(true);
    }
  }
}

export default ScientificMode;
