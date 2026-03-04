/**
 * Physics Data Display for HUD
 * Live numerical display of relativistic metrics
 */

export class PhysicsDataPanel {
  constructor(container, title = 'Physics Data') {
    this.container = container;
    this.title = title;
    this.element = this.createPanel();
    this.dataElements = {};
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'physics-data-panel';

    const titleEl = document.createElement('div');
    titleEl.className = 'physics-data-title';
    titleEl.textContent = this.title;
    panel.appendChild(titleEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'physics-data-content';
    this.contentElement = contentEl;
    panel.appendChild(contentEl);

    this.container.appendChild(panel);

    return panel;
  }

  /**
   * Add a data display row with label and value
   */
  addDataRow(id, label, unit = '') {
    const row = document.createElement('div');
    row.className = 'physics-data-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'physics-data-label';
    labelEl.textContent = label;
    row.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'physics-data-value';
    valueEl.textContent = '—';
    row.appendChild(valueEl);

    if (unit) {
      const unitEl = document.createElement('span');
      unitEl.className = 'physics-data-unit';
      unitEl.textContent = unit;
      row.appendChild(unitEl);
    }

    this.contentElement.appendChild(row);

    this.dataElements[id] = {
      row,
      valueElement: valueEl,
      unit
    };

    return valueEl;
  }

  /**
   * Add a meter display (progress bar style)
   */
  addMeter(id, label, minValue = 0, maxValue = 1) {
    const container = document.createElement('div');
    container.className = 'physics-data-meter-container';

    const labelEl = document.createElement('div');
    labelEl.className = 'physics-data-label';
    labelEl.textContent = label;
    container.appendChild(labelEl);

    const meterWrapper = document.createElement('div');
    meterWrapper.className = 'physics-data-meter';

    const meterFill = document.createElement('div');
    meterFill.className = 'physics-data-meter-fill';
    meterWrapper.appendChild(meterFill);

    const meterValue = document.createElement('span');
    meterValue.className = 'physics-data-meter-value';
    meterValue.textContent = '0%';
    meterWrapper.appendChild(meterValue);

    container.appendChild(meterWrapper);
    this.contentElement.appendChild(container);

    this.dataElements[id] = {
      meterFill,
      meterValue,
      minValue,
      maxValue,
      row: container
    };

    return meterFill;
  }

  /**
   * Add a status badge
   */
  addBadge(id, label) {
    const container = document.createElement('div');
    container.className = 'physics-data-badge-container';

    const labelEl = document.createElement('span');
    labelEl.className = 'physics-data-label';
    labelEl.textContent = label;
    container.appendChild(labelEl);

    const badge = document.createElement('div');
    badge.className = 'physics-data-badge';
    badge.textContent = 'OK';
    container.appendChild(badge);

    this.contentElement.appendChild(container);

    this.dataElements[id] = {
      badge,
      row: container
    };

    return badge;
  }

  /**
   * Update a value in the display
   */
  updateValue(id, value, options = {}) {
    const element = this.dataElements[id];
    if (!element) return;

    if (element.valueElement) {
      // Regular data row
      let displayValue = value;
      
      if (typeof value === 'number') {
        const precision = options.precision !== undefined ? options.precision : 3;
        
        if (Math.abs(value) > 1e6) {
          displayValue = (value / 1e6).toFixed(precision) + 'M';
        } else if (Math.abs(value) > 1e3) {
          displayValue = (value / 1e3).toFixed(precision) + 'k';
        } else if (Math.abs(value) < 0.01 && value !== 0) {
          displayValue = value.toExponential(2);
        } else {
          displayValue = value.toFixed(precision);
        }
      }

      element.valueElement.textContent = displayValue;
      
      // Apply color class based on severity
      element.valueElement.classList.remove('critical', 'warning');
      if (options.severity === 'critical') {
        element.valueElement.classList.add('critical');
      } else if (options.severity === 'warning') {
        element.valueElement.classList.add('warning');
      }

    } else if (element.meterFill && value !== undefined) {
      // Meter
      const { minValue, maxValue } = element;
      const normalized = Math.max(minValue, Math.min(maxValue, value));
      const percentage = ((normalized - minValue) / (maxValue - minValue)) * 100;

      element.meterFill.style.width = percentage + '%';
      element.meterValue.textContent = Math.round(percentage) + '%';

      // Color gradient: green → yellow → red
      if (percentage < 33) {
        element.meterFill.style.backgroundColor = 'rgba(0, 217, 255, 0.7)';
      } else if (percentage < 66) {
        element.meterFill.style.backgroundColor = 'rgba(255, 215, 0, 0.7)';
      } else {
        element.meterFill.style.backgroundColor = 'rgba(255, 100, 100, 0.7)';
      }

    } else if (element.badge) {
      // Badge
      element.badge.textContent = value;
      element.badge.classList.remove('ok', 'warning', 'critical');
      if (options.severity === 'critical') {
        element.badge.classList.add('critical');
      } else if (options.severity === 'warning') {
        element.badge.classList.add('warning');
      } else {
        element.badge.classList.add('ok');
      }
    }
  }

  /**
   * Show/hide the panel
   */
  setVisible(visible) {
    this.element.style.display = visible ? 'block' : 'none';
  }

  remove() {
    this.element.remove();
  }
}

/**
 * Black Hole HUD Panel Manager
 */
export class BlackHoleHUDPanel {
  constructor(container, physics) {
    this.container = container;
    this.physics = physics;
    this.panel = new PhysicsDataPanel(container, '🌌 Black Hole Metrics');
    this.setupMetrics();
  }

  setupMetrics() {
    // Schwarzschild Radius
    this.panel.addDataRow('rs', 'Schwarzschild Radius (r_s)', 'km');
    
    // Photon Sphere
    this.panel.addDataRow('rph', 'Photon Sphere (r_ph)', 'km');
    
    // Time Dilation
    this.panel.addDataRow('timeDilation', 'Time Dilation (α)', '');
    
    // Redshift
    this.panel.addDataRow('redshift', 'Gravitational Redshift (z)', '');
    
    // Tidal Force
    this.panel.addDataRow('tidalForce', 'Tidal Acceleration', 'm/s²');
    
    // Tidal Stress Meter
    this.panel.addMeter('tidalStressMeter', 'Spaghettification Risk', 0, 1);
    
    // Status Badges
    this.panel.addBadge('eventHorizonStatus', 'Event Horizon');
    this.panel.addBadge('photonSphereStatus', 'Photon Sphere');
  }

  update(metrics, cameraDistance) {
    const rs = this.physics.schwarzschildRadius;
    const r_ph = this.physics.photonSphereRadius;

    this.panel.updateValue('rs', rs / 1000, { precision: 2 });
    this.panel.updateValue('rph', r_ph / 1000, { precision: 2 });
    this.panel.updateValue('timeDilation', metrics.timeDilationFactor, { precision: 4 });
    this.panel.updateValue('redshift', metrics.redshift, { precision: 3 });
    this.panel.updateValue('tidalForce', metrics.tidalForce, { precision: 2 });
    
    // Tidal stress meter (0-1 scale)
    this.panel.updateValue('tidalStressMeter', metrics.tidalStress, {
      severity: metrics.tidalStress > 0.7 ? 'critical' : metrics.tidalStress > 0.3 ? 'warning' : 'ok'
    });

    // Status badges
    let horizonStatus = 'Safe ✓';
    let horizonSeverity = 'ok';
    if (cameraDistance <= rs * 1.5) {
      horizonStatus = 'Inside ✗';
      horizonSeverity = 'critical';
    } else if (cameraDistance <= rs * 3) {
      horizonStatus = 'Close ⚠';
      horizonSeverity = 'warning';
    }
    this.panel.updateValue('eventHorizonStatus', horizonStatus, { severity: horizonSeverity });

    let sphereStatus = 'Outside ✓';
    let sphereSeverity = 'ok';
    if (cameraDistance <= r_ph) {
      sphereStatus = 'Inside ✗';
      sphereSeverity = 'critical';
    } else if (cameraDistance <= r_ph * 1.5) {
      sphereStatus = 'Near ⚠';
      sphereSeverity = 'warning';
    }
    this.panel.updateValue('photonSphereStatus', sphereStatus, { severity: sphereSeverity });
  }

  dispose() {
    this.panel.remove();
  }
}

/**
 * Wormhole HUD Panel Manager
 */
export class WormholeHUDPanel {
  constructor(container, physics) {
    this.container = container;
    this.physics = physics;
    this.panel = new PhysicsDataPanel(container, '🌀 Wormhole Metrics');
    this.setupMetrics();
  }

  setupMetrics() {
    // Throat Radius
    this.panel.addDataRow('throatRadius', 'Throat Radius (r₀)', 'm');
    
    // Shape Function
    this.panel.addDataRow('shapeFunction', 'Shape Function b(r)', 'm');
    
    // Flare-out Condition
    this.panel.addBadge('flareOut', 'Geometry Status');
    
    // Exotic Matter Cost
    this.panel.addMeter('exoticMatter', 'Exotic Matter Required', 0, 1);
  }

  update(metrics) {
    this.panel.updateValue('throatRadius', this.physics.throatRadius, { precision: 2 });
    this.panel.updateValue('shapeFunction', metrics.shapeFunction_b, { precision: 3 });
    
    const flareStatus = metrics.flareOutCondition.isSatisfied ? 'OK ✓' : 'Fail ✗';
    const flareSeverity = metrics.flareOutCondition.isSatisfied ? 'ok' : 'critical';
    this.panel.updateValue('flareOut', flareStatus, { severity: flareSeverity });
    
    this.panel.updateValue('exoticMatter', metrics.exoticMatterCost, {
      severity: metrics.exoticMatterCost > 0.7 ? 'critical' : metrics.exoticMatterCost > 0.3 ? 'warning' : 'ok'
    });
  }

  dispose() {
    this.panel.remove();
  }
}
