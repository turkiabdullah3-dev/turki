// Experiments Lab - Interactive Physics Experiments
// Owner: Turki Abdullah © 2026

/**
 * ExperimentsLab
 * Interactive physics experiments for educational demonstration
 */
export class ExperimentsLab {
  constructor(mode = 'blackhole', physics = null, scene = null) {
    this.mode = mode; // 'blackhole' or 'wormhole'
    this.physics = physics;
    this.scene = scene;
    this.isActive = false;
    this.panel = null;
    this.currentExperiment = null;
    this.experiments = this.getExperimentsForMode();
    this.activeExperimentInstance = null;
  }

  /**
   * Get available experiments for current mode
   */
  getExperimentsForMode() {
    const baseExperiments = [
      {
        id: 'light-bending',
        name: 'Light Bending',
        description: 'Launch a photon near the black hole and observe gravitational lensing',
        icon: '💡',
        category: 'General Relativity'
      },
      {
        id: 'time-dilation',
        name: 'Time Dilation',
        description: 'Compare clock rates at different gravitational potentials',
        icon: '⏱️',
        category: 'Spacetime'
      },
      {
        id: 'orbit-stability',
        name: 'Orbit Stability',
        description: 'Explore stable and unstable orbits around the black hole',
        icon: '🌍',
        category: 'Orbital Mechanics'
      }
    ];

    if (this.mode === 'wormhole') {
      baseExperiments.push({
        id: 'wormhole-signal',
        name: 'Wormhole Signal',
        description: 'Send a signal through the wormhole throat',
        icon: '📡',
        category: 'Wormhole Physics'
      });
    }

    return baseExperiments;
  }

  /**
   * Initialize the experiments lab
   */
  init() {
    this.createPanel();
    this.attachEventListeners();
  }

  /**
   * Create the experiments panel UI
   */
  createPanel() {
    const existingPanel = document.getElementById('experiments-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'experiments-panel';
    panel.className = 'experiments-panel glass-panel';
    panel.style.display = 'none';

    panel.innerHTML = `
      <div class="experiments-header">
        <h3>🔬 Physics Experiments</h3>
        <button class="glass-btn experiments-close" type="button">✕</button>
      </div>
      
      <div class="experiments-content">
        <div class="experiments-list">
          ${this.experiments.map(exp => `
            <div class="experiment-card" data-experiment-id="${exp.id}">
              <div class="experiment-icon">${exp.icon}</div>
              <div class="experiment-info">
                <div class="experiment-name">${exp.name}</div>
                <div class="experiment-description">${exp.description}</div>
                <div class="experiment-category">${exp.category}</div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="experiment-runner" id="experiment-runner" style="display: none;">
          <div class="experiment-runner-header">
            <h4 id="experiment-runner-title">Experiment</h4>
            <button class="glass-btn" id="experiment-back-btn" type="button">← Back</button>
          </div>
          
          <div class="experiment-visualization" id="experiment-viz">
            <!-- Experiment-specific visualization goes here -->
          </div>
          
          <div class="experiment-controls" id="experiment-controls">
            <!-- Experiment-specific controls go here -->
          </div>
          
          <div class="experiment-results" id="experiment-results">
            <!-- Results display -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const closeBtn = this.panel.querySelector('.experiments-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    const backBtn = document.getElementById('experiment-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.showExperimentList());
    }

    const experimentCards = this.panel.querySelectorAll('.experiment-card');
    experimentCards.forEach(card => {
      card.addEventListener('click', () => {
        const experimentId = card.getAttribute('data-experiment-id');
        this.selectExperiment(experimentId);
      });
    });
  }

  /**
   * Show experiments panel
   */
  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.isActive = true;
      this.showExperimentList();
    }
  }

  /**
   * Hide experiments panel
   */
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isActive = false;
      this.stopCurrentExperiment();
    }
  }

  /**
   * Show experiment list
   */
  showExperimentList() {
    const listEl = this.panel.querySelector('.experiments-list');
    const runnerEl = document.getElementById('experiment-runner');
    
    if (listEl) listEl.style.display = 'grid';
    if (runnerEl) runnerEl.style.display = 'none';
    
    this.stopCurrentExperiment();
  }

  /**
   * Select and run an experiment
   */
  selectExperiment(experimentId) {
    const experiment = this.experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    this.currentExperiment = experiment;
    
    const listEl = this.panel.querySelector('.experiments-list');
    const runnerEl = document.getElementById('experiment-runner');
    const titleEl = document.getElementById('experiment-runner-title');
    
    if (listEl) listEl.style.display = 'none';
    if (runnerEl) runnerEl.style.display = 'block';
    if (titleEl) titleEl.textContent = `${experiment.icon} ${experiment.name}`;

    this.runExperiment(experimentId);
  }

  /**
   * Run specific experiment
   */
  runExperiment(experimentId) {
    this.stopCurrentExperiment();

    switch (experimentId) {
      case 'light-bending':
        this.activeExperimentInstance = new LightBendingExperiment(this.physics, this.scene);
        break;
      case 'time-dilation':
        this.activeExperimentInstance = new TimeDilationExperiment(this.physics, this.scene);
        break;
      case 'orbit-stability':
        this.activeExperimentInstance = new OrbitStabilityExperiment(this.physics, this.scene);
        break;
      case 'wormhole-signal':
        this.activeExperimentInstance = new WormholeSignalExperiment(this.physics, this.scene);
        break;
    }

    if (this.activeExperimentInstance) {
      this.activeExperimentInstance.init();
    }
  }

  /**
   * Stop current experiment
   */
  stopCurrentExperiment() {
    if (this.activeExperimentInstance && this.activeExperimentInstance.stop) {
      this.activeExperimentInstance.stop();
    }
    this.activeExperimentInstance = null;
  }

  /**
   * Update experiment (called from animation loop)
   */
  update(deltaTime) {
    if (this.isActive && this.activeExperimentInstance && this.activeExperimentInstance.update) {
      this.activeExperimentInstance.update(deltaTime);
    }
  }

  isExperimentRunning() {
    return Boolean(this.isActive && this.activeExperimentInstance);
  }
}

/**
 * Light Bending Experiment
 * Demonstrates gravitational lensing
 */
class LightBendingExperiment {
  constructor(physics, scene) {
    this.physics = physics;
    this.scene = scene;
    this.photons = [];
    this.isRunning = false;
    this.animationId = null;
  }

  init() {
    const vizEl = document.getElementById('experiment-viz');
    const controlsEl = document.getElementById('experiment-controls');
    const resultsEl = document.getElementById('experiment-results');

    vizEl.innerHTML = `
      <canvas id="light-bending-canvas" width="400" height="300" style="width: 100%; height: auto; background: rgba(0,0,0,0.3); border-radius: 8px;"></canvas>
    `;

    controlsEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <label class="glass-label">Impact Parameter (r_s)</label>
          <input type="range" id="impact-param" class="glass-slider" min="1.5" max="10" step="0.1" value="3">
          <span id="impact-value" style="font-size: 12px;">3.0 r_s</span>
        </div>
        <button class="glass-btn primary" id="launch-photon-btn" type="button">Launch Photon</button>
        <button class="glass-btn" id="clear-photons-btn" type="button">Clear Trails</button>
      </div>
    `;

    resultsEl.innerHTML = `
      <div style="font-size: 11px; color: rgba(255,255,255,0.7);">
        <p><strong>Observation:</strong> Light bends as it passes near the black hole. Closer trajectories bend more severely. At the photon sphere (1.5 r_s), light can orbit the black hole!</p>
      </div>
    `;

    this.canvas = document.getElementById('light-bending-canvas');
    this.ctx = this.canvas.getContext('2d');

    document.getElementById('launch-photon-btn')?.addEventListener('click', () => this.launchPhoton());
    document.getElementById('clear-photons-btn')?.addEventListener('click', () => this.clearPhotons());
    document.getElementById('impact-param')?.addEventListener('input', (e) => {
      document.getElementById('impact-value').textContent = `${parseFloat(e.target.value).toFixed(1)} r_s`;
    });

    this.isRunning = true;
    this.animate();
  }

  launchPhoton() {
    const impactParam = parseFloat(document.getElementById('impact-param')?.value || 3);
    const rs = this.physics?.r_s || 1;
    
    this.photons.push({
      x: -this.canvas.width / 2,
      y: impactParam * 20, // Scale for visualization
      vx: 5,
      vy: 0,
      trail: [],
      impactParam: impactParam,
      active: true
    });
  }

  clearPhotons() {
    this.photons = [];
  }

  animate() {
    if (!this.isRunning) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Draw black hole
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw photon sphere
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5 * 20, 0, Math.PI * 2);
    ctx.stroke();

    // Update and draw photons
    this.photons.forEach(photon => {
      if (!photon.active) return;

      // Calculate gravitational deflection
      const dx = photon.x - 0;
      const dy = photon.y - 0;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r < 15) {
        photon.active = false;
        return;
      }

      // Simplified gravitational deflection
      const deflection = 100 / (r * r);
      const angle = Math.atan2(dy, dx);
      
      photon.vx -= deflection * Math.cos(angle);
      photon.vy -= deflection * Math.sin(angle);

      photon.x += photon.vx;
      photon.y += photon.vy;

      photon.trail.push({ x: photon.x, y: photon.y });
      if (photon.trail.length > 100) photon.trail.shift();

      // Draw trail
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      photon.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(cx + p.x, cy + p.y);
        else ctx.lineTo(cx + p.x, cy + p.y);
      });
      ctx.stroke();

      // Deactivate if off-screen
      if (Math.abs(photon.x) > w || Math.abs(photon.y) > h) {
        photon.active = false;
      }
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  update(deltaTime) {
    // Handled in animate loop
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/**
 * Time Dilation Experiment
 * Demonstrates gravitational time dilation
 */
class TimeDilationExperiment {
  constructor(physics, scene) {
    this.physics = physics;
    this.scene = scene;
    this.distantTime = 0;
    this.nearTime = 0;
    this.isRunning = false;
    this.nearDistance = 1.5; // Near horizon
  }

  init() {
    const vizEl = document.getElementById('experiment-viz');
    const controlsEl = document.getElementById('experiment-controls');
    const resultsEl = document.getElementById('experiment-results');

    vizEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px;">
        <div style="text-align: center;">
          <div style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.7);">Distant Observer (∞)</div>
          <div id="distant-clock" style="font-family: 'Courier New', monospace; font-size: 32px; color: rgba(100, 200, 255, 0.9);">00:00.0</div>
          <div style="font-size: 10px; margin-top: 4px; color: rgba(255,255,255,0.5);">α = 1.000</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.7);">Near Horizon (<span id="near-dist">1.5</span> r_s)</div>
          <div id="near-clock" style="font-family: 'Courier New', monospace; font-size: 32px; color: rgba(255, 150, 100, 0.9);">00:00.0</div>
          <div id="near-alpha" style="font-size: 10px; margin-top: 4px; color: rgba(255,255,255,0.5);">α = 0.577</div>
        </div>
      </div>
      <div style="text-align: center; padding: 8px; font-size: 11px; color: rgba(255,255,255,0.6);">
        Time difference: <span id="time-diff" style="color: rgba(255, 200, 100, 0.9); font-weight: 600;">0.0s</span>
      </div>
    `;

    controlsEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <label class="glass-label">Observer Distance (r_s)</label>
          <input type="range" id="near-distance-slider" class="glass-slider" min="1.05" max="10" step="0.05" value="1.5">
          <span id="near-distance-value" style="font-size: 12px;">1.50 r_s</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="glass-btn primary" id="start-clock-btn" type="button" style="flex: 1;">▶ Start</button>
          <button class="glass-btn" id="reset-clock-btn" type="button" style="flex: 1;">Reset</button>
        </div>
      </div>
    `;

    resultsEl.innerHTML = `
      <div style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
        <p><strong>Observation:</strong> Time runs slower in stronger gravitational fields. An observer near the event horizon ages more slowly than one far away. This is gravitational time dilation predicted by Einstein's General Relativity.</p>
      </div>
    `;

    document.getElementById('start-clock-btn')?.addEventListener('click', () => this.toggleClock());
    document.getElementById('reset-clock-btn')?.addEventListener('click', () => this.resetClock());
    document.getElementById('near-distance-slider')?.addEventListener('input', (e) => {
      this.nearDistance = parseFloat(e.target.value);
      document.getElementById('near-distance-value').textContent = `${this.nearDistance.toFixed(2)} r_s`;
      document.getElementById('near-dist').textContent = this.nearDistance.toFixed(2);
      this.updateAlphaDisplay();
    });

    this.updateAlphaDisplay();
  }

  toggleClock() {
    this.isRunning = !this.isRunning;
    const btn = document.getElementById('start-clock-btn');
    if (btn) {
      btn.textContent = this.isRunning ? '⏸ Pause' : '▶ Start';
    }
  }

  resetClock() {
    this.distantTime = 0;
    this.nearTime = 0;
    this.isRunning = false;
    const btn = document.getElementById('start-clock-btn');
    if (btn) btn.textContent = '▶ Start';
    this.updateClockDisplay();
  }

  updateAlphaDisplay() {
    const alpha = Math.sqrt(1 - 1 / this.nearDistance);
    const alphaEl = document.getElementById('near-alpha');
    if (alphaEl) {
      alphaEl.textContent = `α = ${alpha.toFixed(3)}`;
    }
  }

  update(deltaTime) {
    if (!this.isRunning) return;

    // Distant observer: normal time flow
    this.distantTime += deltaTime;

    // Near observer: time dilation factor α = √(1 - r_s/r)
    const alpha = Math.sqrt(Math.max(0, 1 - 1 / this.nearDistance));
    this.nearTime += deltaTime * alpha;

    this.updateClockDisplay();
  }

  updateClockDisplay() {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${secs.toFixed(1).padStart(4, '0')}`;
    };

    const distantEl = document.getElementById('distant-clock');
    const nearEl = document.getElementById('near-clock');
    const diffEl = document.getElementById('time-diff');

    if (distantEl) distantEl.textContent = formatTime(this.distantTime);
    if (nearEl) nearEl.textContent = formatTime(this.nearTime);
    if (diffEl) diffEl.textContent = `${(this.distantTime - this.nearTime).toFixed(1)}s`;
  }

  stop() {
    this.isRunning = false;
  }
}

/**
 * Orbit Stability Experiment
 * Demonstrates stable and unstable orbits
 */
class OrbitStabilityExperiment {
  constructor(physics, scene) {
    this.physics = physics;
    this.scene = scene;
    this.particles = [];
    this.isRunning = false;
    this.animationId = null;
  }

  init() {
    const vizEl = document.getElementById('experiment-viz');
    const controlsEl = document.getElementById('experiment-controls');
    const resultsEl = document.getElementById('experiment-results');

    vizEl.innerHTML = `
      <canvas id="orbit-canvas" width="400" height="300" style="width: 100%; height: auto; background: rgba(0,0,0,0.3); border-radius: 8px;"></canvas>
    `;

    controlsEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <label class="glass-label">Orbital Radius (r_s)</label>
          <input type="range" id="orbit-radius" class="glass-slider" min="2" max="10" step="0.1" value="6">
          <span id="orbit-value" style="font-size: 12px;">6.0 r_s</span>
        </div>
        <div style="font-size: 10px; color: rgba(255,255,255,0.6); padding: 6px; background: rgba(100,150,255,0.1); border-radius: 4px;">
          ISCO (Innermost Stable Circular Orbit) = 3.0 r_s
        </div>
        <button class="glass-btn primary" id="place-particle-btn" type="button">Place Test Particle</button>
        <button class="glass-btn" id="clear-orbits-btn" type="button">Clear</button>
      </div>
    `;

    resultsEl.innerHTML = `
      <div style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
        <p><strong>Observation:</strong> Orbits below the ISCO (3 r_s for non-rotating black holes) are unstable and plunge inward. Above the ISCO, stable circular orbits are possible.</p>
      </div>
    `;

    this.canvas = document.getElementById('orbit-canvas');
    this.ctx = this.canvas.getContext('2d');

    document.getElementById('place-particle-btn')?.addEventListener('click', () => this.placeParticle());
    document.getElementById('clear-orbits-btn')?.addEventListener('click', () => this.clearParticles());
    document.getElementById('orbit-radius')?.addEventListener('input', (e) => {
      document.getElementById('orbit-value').textContent = `${parseFloat(e.target.value).toFixed(1)} r_s`;
    });

    this.isRunning = true;
    this.animate();
  }

  placeParticle() {
    const radius = parseFloat(document.getElementById('orbit-radius')?.value || 6);
    const isStable = radius >= 3; // ISCO at 3 r_s
    
    const angle = Math.random() * Math.PI * 2;
    const r = radius * 20; // Scale for visualization
    
    // Circular orbital velocity: v = √(GM/r) ≈ √(r_s/2r)
    const orbitalSpeed = Math.sqrt(10 / radius);
    
    this.particles.push({
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
      vx: -orbitalSpeed * Math.sin(angle),
      vy: orbitalSpeed * Math.cos(angle),
      trail: [],
      isStable: isStable,
      active: true,
      color: isStable ? 'rgba(100, 255, 150, 0.8)' : 'rgba(255, 100, 100, 0.8)'
    });
  }

  clearParticles() {
    this.particles = [];
  }

  animate() {
    if (!this.isRunning) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, w, h);

    // Draw black hole
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw ISCO
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, 3 * 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update and draw particles
    this.particles.forEach(particle => {
      if (!particle.active) return;

      const dx = particle.x;
      const dy = particle.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r < 15) {
        particle.active = false;
        return;
      }

      // Gravitational acceleration: a = GM/r² pointing toward center
      const acc = 150 / (r * r);
      const angle = Math.atan2(dy, dx);
      
      particle.vx -= acc * Math.cos(angle);
      particle.vy -= acc * Math.sin(angle);

      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 200) particle.trail.shift();

      // Draw trail
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      particle.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(cx + p.x, cy + p.y);
        else ctx.lineTo(cx + p.x, cy + p.y);
      });
      ctx.stroke();

      // Draw particle
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(cx + particle.x, cy + particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  update(deltaTime) {
    // Handled in animate loop
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/**
 * Wormhole Signal Experiment
 * Demonstrates signal propagation through wormhole
 */
class WormholeSignalExperiment {
  constructor(physics, scene) {
    this.physics = physics;
    this.scene = scene;
    this.signal = null;
    this.isRunning = false;
    this.animationId = null;
  }

  init() {
    const vizEl = document.getElementById('experiment-viz');
    const controlsEl = document.getElementById('experiment-controls');
    const resultsEl = document.getElementById('experiment-results');

    vizEl.innerHTML = `
      <canvas id="wormhole-signal-canvas" width="400" height="200" style="width: 100%; height: auto; background: rgba(0,0,0,0.3); border-radius: 8px;"></canvas>
    `;

    controlsEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="glass-btn primary" id="send-signal-btn" type="button">📡 Send Signal</button>
        <div id="signal-status" style="font-size: 11px; color: rgba(255,255,255,0.7); padding: 8px; background: rgba(100,150,255,0.1); border-radius: 4px;">
          Status: Ready
        </div>
      </div>
    `;

    resultsEl.innerHTML = `
      <div style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5;">
        <p><strong>Observation:</strong> Signals can traverse the wormhole throat, potentially connecting distant regions of spacetime. The exotic matter (negative energy) keeps the throat open.</p>
      </div>
    `;

    this.canvas = document.getElementById('wormhole-signal-canvas');
    this.ctx = this.canvas.getContext('2d');

    document.getElementById('send-signal-btn')?.addEventListener('click', () => this.sendSignal());

    this.isRunning = true;
    this.animate();
  }

  sendSignal() {
    this.signal = {
      x: 0,
      progress: 0,
      active: true
    };
    
    const statusEl = document.getElementById('signal-status');
    if (statusEl) statusEl.textContent = 'Status: Signal in transit...';
  }

  animate() {
    if (!this.isRunning) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cy = h / 2;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Draw wormhole throat
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, cy - 40);
    ctx.quadraticCurveTo(w / 4, cy - 60, w / 2, cy);
    ctx.quadraticCurveTo(w * 3 / 4, cy + 60, w, cy + 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, cy + 40);
    ctx.quadraticCurveTo(w / 4, cy + 60, w / 2, cy);
    ctx.quadraticCurveTo(w * 3 / 4, cy - 60, w, cy - 40);
    ctx.stroke();

    // Draw throat center
    ctx.fillStyle = 'rgba(150, 100, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(w / 2, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw signal
    if (this.signal && this.signal.active) {
      this.signal.progress += 0.01;
      
      if (this.signal.progress >= 1) {
        this.signal.active = false;
        const statusEl = document.getElementById('signal-status');
        if (statusEl) statusEl.textContent = 'Status: Signal transmitted successfully!';
      } else {
        const x = this.signal.progress * w;
        const y = cy + Math.sin(this.signal.progress * Math.PI) * 30;
        
        ctx.fillStyle = 'rgba(100, 255, 200, 0.9)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(100, 255, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  update(deltaTime) {
    // Handled in animate loop
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

export default ExperimentsLab;
