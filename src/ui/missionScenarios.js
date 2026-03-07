// Mission Scenarios - Preset simulation experiences
// Owner: Turki Abdullah © 2026

export class MissionScenarios {
  constructor(mode = 'blackhole', options = {}) {
    this.mode = mode;
    this.onApplyScenario = options.onApplyScenario || null;
    this.onManualReset = options.onManualReset || null;
    this.onVisibilityChange = options.onVisibilityChange || null;
    this.scenarios = this.getScenariosForMode();
    this.panel = null;
    this.isActive = false;
    this.activeScenarioId = null;
  }

  getScenariosForMode() {
    const allScenarios = [
      {
        id: 'safe-observation',
        mode: 'blackhole',
        name: 'Safe Observation',
        icon: '🛰️',
        description: 'A comfortable distant view to inspect core black-hole effects.',
        category: 'Black Hole',
        message: 'Maintains a safe radius with simulation view for baseline observations.',
        preset: {
          distance: 8.0,
          blackHoleModel: 'schwarzschild',
          observationMode: 'simulation',
          scientificMode: false,
          resetCamera: true
        }
      },
      {
        id: 'photon-sphere-approach',
        mode: 'blackhole',
        name: 'Photon Sphere Approach',
        icon: '💫',
        description: 'Move close to the photon sphere to emphasize lensing and ring structure.',
        category: 'Black Hole',
        message: 'Sets distance near 1.5 r_s and enables telescope/scientific view for ring analysis.',
        preset: {
          distance: 1.6,
          blackHoleModel: 'schwarzschild',
          observationMode: 'telescope',
          scientificMode: true,
          resetCamera: true
        }
      },
      {
        id: 'near-horizon-observation',
        mode: 'blackhole',
        name: 'Near Horizon Observation',
        icon: '🌌',
        description: 'Observe strong time dilation and redshift just outside the event horizon.',
        category: 'Black Hole',
        message: 'Places observer very close to r_s to highlight strong relativistic effects.',
        preset: {
          distance: 1.08,
          blackHoleModel: 'schwarzschild',
          observationMode: 'simulation',
          scientificMode: true,
          resetCamera: true
        }
      },
      {
        id: 'stable-orbit-test',
        mode: 'blackhole',
        name: 'Stable Orbit Test',
        icon: '🪐',
        description: 'Set an orbit-friendly radius to study stability versus inward plunge.',
        category: 'Black Hole',
        message: 'Uses a radius outside ISCO (3 r_s) for stable orbit behavior inspection.',
        preset: {
          distance: 3.2,
          blackHoleModel: 'kerr',
          spinParameter: 0.6,
          observationMode: 'simulation',
          scientificMode: true,
          resetCamera: true
        }
      },
      {
        id: 'wormhole-exterior-scan',
        mode: 'wormhole',
        name: 'Wormhole Exterior Scan',
        icon: '🌀',
        description: 'Inspect embedding geometry and throat behavior from outside.',
        category: 'Wormhole',
        message: 'Configures exterior mode with moderate distance for geometric inspection.',
        preset: {
          distance: 2.8,
          viewMode: 'exterior',
          scientificMode: true,
          qualityMode: 'glow',
          resetCamera: true
        }
      },
      {
        id: 'wormhole-interior-passage',
        mode: 'wormhole',
        name: 'Wormhole Interior Passage',
        icon: '🚀',
        description: 'Switch to interior traversal view for a tunnel passage experience.',
        category: 'Wormhole',
        message: 'Switches to interior mode with close approach to simulate traversal.',
        preset: {
          distance: 0.9,
          viewMode: 'interior',
          scientificMode: true,
          qualityMode: 'glow',
          resetCamera: true
        }
      }
    ];

    return allScenarios.filter((scenario) => scenario.mode === this.mode);
  }

  init() {
    this.createPanel();
    this.attachEventListeners();
  }

  createPanel() {
    const existingPanel = document.getElementById('missions-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'missions-panel';
    panel.className = 'missions-panel glass-panel';
    panel.style.display = 'none';

    panel.innerHTML = `
      <div class="missions-header">
        <h3>🧭 Mission Scenarios</h3>
        <button class="glass-btn missions-close" id="missions-close-btn" type="button">✕</button>
      </div>

      <p class="missions-subtitle">Launch curated presets without manually tuning every control.</p>

      <div class="missions-list">
        ${this.scenarios.map((scenario) => `
          <div class="mission-card" data-mission-id="${scenario.id}">
            <div class="mission-icon">${scenario.icon}</div>
            <div class="mission-info">
              <div class="mission-name">${scenario.name}</div>
              <div class="mission-description">${scenario.description}</div>
              <div class="mission-meta">${scenario.category}</div>
            </div>
            <button class="glass-btn mission-launch" data-launch-id="${scenario.id}" type="button">Launch</button>
          </div>
        `).join('')}
      </div>

      <div class="mission-status" id="mission-status" aria-live="polite">
        Select a mission to apply preset simulation settings.
      </div>

      <div class="missions-actions">
        <button class="glass-btn" id="mission-manual-btn" type="button">↺ Return to Manual Mode</button>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;
  }

  attachEventListeners() {
    if (!this.panel) {
      return;
    }

    this.panel.querySelector('#missions-close-btn')?.addEventListener('click', () => {
      this.hide();
    });

    this.panel.querySelectorAll('[data-launch-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const scenarioId = button.getAttribute('data-launch-id');
        this.launchScenario(scenarioId);
      });
    });

    this.panel.querySelector('#mission-manual-btn')?.addEventListener('click', () => {
      this.returnToManualMode();
    });
  }

  launchScenario(scenarioId) {
    const scenario = this.scenarios.find((item) => item.id === scenarioId);
    if (!scenario) {
      return;
    }

    if (this.onApplyScenario) {
      this.onApplyScenario(scenario);
    }

    this.activeScenarioId = scenario.id;
    this.updateUIState();
    this.setStatusMessage(`Mission launched: ${scenario.name}. ${scenario.message}`);
  }

  returnToManualMode() {
    if (this.onManualReset) {
      this.onManualReset();
    }

    this.activeScenarioId = null;
    this.updateUIState();
    this.setStatusMessage('Manual mode restored. You can now adjust controls freely.');
  }

  updateUIState() {
    if (!this.panel) {
      return;
    }

    this.panel.querySelectorAll('.mission-card').forEach((card) => {
      const missionId = card.getAttribute('data-mission-id');
      card.classList.toggle('active', missionId === this.activeScenarioId);
    });
  }

  setStatusMessage(message) {
    const status = this.panel?.querySelector('#mission-status');
    if (status) {
      status.textContent = message;
    }
  }

  show() {
    if (!this.panel) {
      return;
    }

    this.isActive = true;
    this.panel.style.display = 'block';
    if (this.onVisibilityChange) {
      this.onVisibilityChange(true);
    }
  }

  hide() {
    if (!this.panel) {
      return;
    }

    this.isActive = false;
    this.panel.style.display = 'none';
    if (this.onVisibilityChange) {
      this.onVisibilityChange(false);
    }
  }

  toggle() {
    if (this.isActive) {
      this.hide();
    } else {
      this.show();
    }
  }
}

export default MissionScenarios;
