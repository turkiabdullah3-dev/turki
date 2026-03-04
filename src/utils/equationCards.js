/**
 * Physics Equation Card System
 * Glassmorphism UI for displaying relativistic equations with live values
 */

export class EquationCard {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      title: config.title || 'Equation',
      latex: config.latex || 'E=mc^2',
      description: config.description || 'A physics equation',
      value: config.value || '0',
      unit: config.unit || '',
      visible: config.visible !== false,
      position: config.position || 'top-right', // top-left, top-right, bottom-left, bottom-right
      ...config
    };
    
    this.element = this.createCard();
    this.updateValue(this.config.value, this.config.unit);
  }

  createCard() {
    const card = document.createElement('div');
    card.className = 'equation-card';
    card.classList.add(`card-${this.config.position}`);
    
    if (!this.config.visible) {
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
    }

    const content = document.createElement('div');
    content.className = 'equation-card-content';

    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'equation-card-title';
    titleEl.textContent = this.config.title;
    content.appendChild(titleEl);

    // Equation (LaTeX-style)
    const eqEl = document.createElement('div');
    eqEl.className = 'equation-card-equation';
    eqEl.innerHTML = this.config.latex;
    content.appendChild(eqEl);

    // Description
    const descEl = document.createElement('div');
    descEl.className = 'equation-card-description';
    descEl.textContent = this.config.description;
    content.appendChild(descEl);

    // Live value
    const valueEl = document.createElement('div');
    valueEl.className = 'equation-card-value';
    this.valueElement = valueEl;
    content.appendChild(valueEl);

    card.appendChild(content);
    this.container.appendChild(card);

    return card;
  }

  updateValue(value, unit = '') {
    if (!this.valueElement) return;

    let displayValue = value;
    if (typeof value === 'number') {
      if (Math.abs(value) > 1e6) {
        displayValue = (value / 1e6).toFixed(2) + 'M';
      } else if (Math.abs(value) > 1e3) {
        displayValue = (value / 1e3).toFixed(2) + 'k';
      } else if (Math.abs(value) < 0.01 && value !== 0) {
        displayValue = value.toExponential(2);
      } else {
        displayValue = value.toFixed(3);
      }
    }

    this.valueElement.textContent = `Live: ${displayValue} ${unit}`;
  }

  setVisible(visible, animate = true) {
    if (animate) {
      this.element.style.transition = 'opacity 0.4s ease-out';
    }
    this.element.style.opacity = visible ? '1' : '0';
    this.element.style.pointerEvents = visible ? 'auto' : 'none';
  }

  highlight(intensity = 1) {
    this.element.style.boxShadow = `0 0 ${20 * intensity}px rgba(0, 217, 255, ${0.5 * intensity})`;
    this.element.classList.add('highlighted');
  }

  removeHighlight() {
    this.element.style.boxShadow = 'none';
    this.element.classList.remove('highlighted');
  }

  remove() {
    this.element.remove();
  }
}

/**
 * Equation Card Manager for Black Hole Scene
 * Progressive reveal based on camera distance with visual linking
 */
export class BlackHoleEquationDisplay {
  constructor(container, physics, sceneElements = {}) {
    this.container = container;
    this.physics = physics;
    this.sceneElements = sceneElements; // {photonRing, accretionDisk, etc.}
    this.cards = {};
    this.currentZone = null;
    this.highlightedElement = null;
    this.createEquationCards();
  }

  createEquationCards() {
    const rs = this.physics.schwarzschildRadius;
    const r_ph = this.physics.photonSphereRadius;

    // Schwarzschild Radius Card
    this.cards.schwarzschild = new EquationCard(this.container, {
      title: 'Schwarzschild Radius',
      latex: 'r<sub>s</sub> = 2GM/c²',
      description: 'Radius of the event horizon (point of no return)',
      value: rs,
      unit: 'm',
      position: 'top-right',
      visible: false
    });

    // Photon Sphere Card
    this.cards.photonSphere = new EquationCard(this.container, {
      title: 'Photon Sphere',
      latex: 'r<sub>ph</sub> = 3GM/c² = 1.5 r<sub>s</sub>',
      description: 'Unstable circular orbit for light rays',
      value: r_ph,
      unit: 'm',
      position: 'top-right',
      visible: false
    });

    // Time Dilation Card
    this.cards.timeDilation = new EquationCard(this.container, {
      title: 'Time Dilation',
      latex: 'dτ = dt √(1 - r<sub>s</sub>/r)',
      description: 'Clocks slow down near the black hole',
      value: 0.5,
      unit: '(dimensionless)',
      position: 'bottom-right',
      visible: false
    });

    // Redshift Card
    this.cards.redshift = new EquationCard(this.container, {
      title: 'Gravitational Redshift',
      latex: 'z = 1/√(1 - r<sub>s</sub>/r) - 1',
      description: 'Light loses energy escaping gravity (becomes redder)',
      value: 0.5,
      unit: '',
      position: 'bottom-right',
      visible: false
    });

    // Tidal Force Card
    this.cards.tidalForce = new EquationCard(this.container, {
      title: 'Tidal Force (Spaghettification)',
      latex: 'a<sub>tidal</sub> ≈ 2GML/r³',
      description: 'Differential gravity stretches objects (feet vs head)',
      value: 0.01,
      unit: 'm/s²',
      position: 'bottom-left',
      visible: false
    });

    // Schwarzschild Metric Card (Expert)
    this.cards.metric = new EquationCard(this.container, {
      title: 'Schwarzschild Spacetime',
      latex: 'ds² = (1 - r<sub>s</sub>/r)c²dt² - (1 - r<sub>s</sub>/r)⁻¹dr² - r²dΩ²',
      description: 'The fundamental rulebook of spacetime near a black hole',
      value: '',
      unit: '',
      position: 'top-left',
      visible: false
    });
  }

  /**
   * Update card visibility and values based on camera distance
   */
  updateByDistance(cameraDistance) {
    const rs = this.physics.schwarzschildRadius;
    const r_ph = this.physics.photonSphereRadius;
    const metrics = this.physics.getMetricsAtRadius(cameraDistance);

    // Determine zone
    let newZone = 'far';
    if (cameraDistance <= rs * 2) {
      newZone = 'horizon';
    } else if (cameraDistance <= r_ph) {
      newZone = 'photonSphere';
    } else if (cameraDistance <= r_ph * 3) {
      newZone = 'approach';
    } else {
      newZone = 'far';
    }

    if (newZone !== this.currentZone) {
      this.showZoneCards(newZone);
      this.currentZone = newZone;
    }

    // Update live values
    this.cards.schwarzschild.updateValue(rs / 1000, 'km');
    this.cards.photonSphere.updateValue(r_ph / 1000, 'km');
    this.cards.timeDilation.updateValue(metrics.timeDilationFactor, '');
    this.cards.redshift.updateValue(metrics.redshift, '');
    this.cards.tidalForce.updateValue(metrics.tidalForce, 'm/s²');
  }

  /**
   * Show/hide cards based on current zone
   */
  showZoneCards(zone) {
    // Hide all first
    Object.values(this.cards).forEach(card => card.setVisible(false));

    // Show based on zone
    switch (zone) {
      case 'far':
        this.cards.schwarzschild.setVisible(true);
        this.cards.photonSphere.setVisible(true);
        this.cards.metric.setVisible(false);
        this.highlightSceneElement('photonRing', true);
        break;
      case 'approach':
        this.cards.schwarzschild.setVisible(true);
        this.cards.photonSphere.setVisible(true);
        this.cards.timeDilation.setVisible(true);
        this.cards.redshift.setVisible(true);
        this.highlightSceneElement('accretionDisk', true);
        break;
      case 'photonSphere':
        this.cards.photonSphere.setVisible(true);
        this.cards.redshift.setVisible(true);
        this.cards.tidalForce.setVisible(true);
        this.cards.timeDilation.setVisible(true);
        this.highlightSceneElement('photonRing', true);
        break;
      case 'horizon':
        this.cards.timeDilation.setVisible(true);
        this.cards.redshift.setVisible(true);
        this.cards.tidalForce.setVisible(true);
        this.cards.metric.setVisible(true);
        this.highlightSceneElement('accretionDisk', true);
        break;
    }
  }

  /**
   * Add glow effect to scene element to highlight active equation
   */
  highlightSceneElement(elementName, visible = true) {
    // Remove previous highlight
    if (this.highlightedElement && this.sceneElements[this.highlightedElement]) {
      const elem = this.sceneElements[this.highlightedElement];
      if (elem.material && elem.material.emissive) {
        elem.material.emissive.setHex(0x000000);
      }
    }

    if (visible && elementName && this.sceneElements[elementName]) {
      this.highlightedElement = elementName;
      const elem = this.sceneElements[elementName];
      
      // Add emissive glow to material
      if (elem.material && elem.material.emissive) {
        elem.material.emissive.setHex(0x0099ff);
        elem.material.emissiveIntensity = 0.3;
      }
    } else {
      this.highlightedElement = null;
    }
  }

  highlightCardForFeature(feature) {
    // Highlight active equation card based on visual feature
    Object.values(this.cards).forEach(card => card.removeHighlight());
    
    if (this.cards[feature]) {
      this.cards[feature].highlight();
    }
  }

  dispose() {
    Object.values(this.cards).forEach(card => card.remove());
    this.cards = {};
  }
}

/**
 * Equation Card Manager for Wormhole Scene
 */
export class WormholeEquationDisplay {
  constructor(container, physics, sceneElements = {}) {
    this.container = container;
    this.physics = physics;
    this.sceneElements = sceneElements;
    this.cards = {};
    this.highlightedElement = null;
    this.createEquationCards();
  }

  createEquationCards() {
    // Morris-Thorne Metric Card
    this.cards.morrisThorne = new EquationCard(this.container, {
      title: 'Morris-Thorne Metric',
      latex: 'ds² = -e<sup>2Φ(r)</sup>c²dt² + dr²/(1 - b(r)/r) + r²dΩ²',
      description: 'Defines the geometry of a traversable wormhole',
      value: '',
      unit: '',
      position: 'top-right',
      visible: false
    });

    // Throat Radius Card
    this.cards.throat = new EquationCard(this.container, {
      title: 'Throat Radius',
      latex: 'b(r₀) = r₀',
      description: 'Condition defining the wormhole throat (narrowest point)',
      value: this.physics.throatRadius,
      unit: 'm',
      position: 'top-right',
      visible: false
    });

    // Shape Function Card
    this.cards.shapeFunction = new EquationCard(this.container, {
      title: 'Shape Function',
      latex: 'b(r) = b₀²/r',
      description: 'Controls tunnel width at radius r',
      value: this.physics.getShapeFunction(this.physics.throatRadius * 2),
      unit: 'm',
      position: 'top-left',
      visible: false
    });

    // Flare-out Condition Card
    this.cards.flareOut = new EquationCard(this.container, {
      title: 'Flare-out Condition',
      latex: 'b\'(r₀) < 1',
      description: 'Ensures tunnel geometry is stable and traversable',
      value: this.physics.getFlareOutCondition().isSatisfied ? 'Yes' : 'No',
      unit: '',
      position: 'bottom-right',
      visible: false
    });

    // Exotic Matter Card
    this.cards.exoticMatter = new EquationCard(this.container, {
      title: 'Exotic Matter Requirement',
      latex: 'ρ + p<sub>r</sub> < 0 (NEC violation)',
      description: 'Traversable wormholes require negative energy density',
      value: this.physics.getExoticMatterCost(),
      unit: '(cost factor)',
      position: 'bottom-left',
      visible: false
    });
  }

  updateByDistance(cameraDistance) {
    const metrics = this.physics.getMetricsAtRadius(cameraDistance);
    
    this.cards.throat.updateValue(this.physics.throatRadius, 'm');
    this.cards.shapeFunction.updateValue(metrics.shapeFunction_b, 'm');
    this.cards.flareOut.updateValue(metrics.flareOutCondition.isSatisfied ? 'Yes' : 'No', '');
    this.cards.exoticMatter.updateValue(metrics.exoticMatterCost, '');

    // Show all wormhole cards if close enough
    const allVisible = cameraDistance < this.physics.tunnelLength * 5;
    Object.values(this.cards).forEach(card => card.setVisible(allVisible));

    // Highlight throat when viewing wormhole
    if (allVisible) {
      this.highlightSceneElement('throat', true);
    } else {
      this.highlightSceneElement(null, false);
    }
  }

  highlightSceneElement(elementName, visible = true) {
    // Remove previous highlight
    if (this.highlightedElement && this.sceneElements[this.highlightedElement]) {
      const elem = this.sceneElements[this.highlightedElement];
      if (elem.material && elem.material.emissive) {
        elem.material.emissive.setHex(0x000000);
      }
    }

    if (visible && elementName && this.sceneElements[elementName]) {
      this.highlightedElement = elementName;
      const elem = this.sceneElements[elementName];
      
      if (elem.material && elem.material.emissive) {
        elem.material.emissive.setHex(0x00d9ff);
        elem.material.emissiveIntensity = 0.4;
      }
    } else {
      this.highlightedElement = null;
    }
  }

  highlightCardForFeature(feature) {
    Object.values(this.cards).forEach(card => card.removeHighlight());
    
    if (this.cards[feature]) {
      this.cards[feature].highlight();
    }
  }

  dispose() {
    Object.values(this.cards).forEach(card => card.remove());
    this.cards = {};
  }
}
