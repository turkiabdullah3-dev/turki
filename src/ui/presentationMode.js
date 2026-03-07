// Presentation Mode - Clean cinematic display
// Owner: Turki Abdullah © 2026

import { sanitize } from '../core/sanitize.js';

export class PresentationMode {
  constructor(mode = 'blackhole', options = {}) {
    this.mode = mode;
    this.getCameraController = options.getCameraController || (() => null);
    this.onEnter = options.onEnter || null;
    this.onExit = options.onExit || null;
    this.onVisibilityChange = options.onVisibilityChange || null;

    this.isActive = false;
    this.overlay = null;
    this.currentState = null;
    this.cameraSnapshot = null;
  }

  init() {
    this.createOverlay();
    this.attachListeners();
  }

  createOverlay() {
    const existing = document.getElementById('presentation-overlay');
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'presentation-overlay';
    overlay.className = 'presentation-overlay';
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="presentation-copy">
        <div class="presentation-kicker">Presentation Mode</div>
        <h2 class="presentation-title" id="presentation-scene-title">Cinematic Simulation View</h2>
        <p class="presentation-description" id="presentation-scene-description">A clean visual demonstration of relativistic spacetime.</p>
      </div>

      <div class="presentation-minihud" aria-live="polite">
        <div class="presentation-row">
          <span>Distance</span>
          <strong id="presentation-value-distance">—</strong>
        </div>
        <div class="presentation-row">
          <span>Redshift</span>
          <strong id="presentation-value-redshift">—</strong>
        </div>
        <div class="presentation-row">
          <span>Time Dilation</span>
          <strong id="presentation-value-alpha">—</strong>
        </div>
      </div>

      <button class="glass-btn presentation-exit" id="btn-exit-presentation" type="button">Exit Presentation</button>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  attachListeners() {
    this.overlay?.querySelector('#btn-exit-presentation')?.addEventListener('click', () => {
      this.setActive(false);
    });
  }

  toggle() {
    this.setActive(!this.isActive);
  }

  setActive(active) {
    const nextState = Boolean(active);
    if (this.isActive === nextState) {
      return;
    }

    this.isActive = nextState;

    if (this.isActive) {
      this.captureCameraSnapshot();
      if (this.onEnter) {
        this.onEnter();
      }
    } else {
      this.restoreCameraSnapshot();
      if (this.onExit) {
        this.onExit();
      }
    }

    document.body.classList.toggle('presentation-active', this.isActive);
    if (this.overlay) {
      this.overlay.style.display = this.isActive ? 'block' : 'none';
    }

    if (this.onVisibilityChange) {
      this.onVisibilityChange(this.isActive);
    }
  }

  captureCameraSnapshot() {
    const camera = this.getCameraController();
    if (!camera) {
      this.cameraSnapshot = null;
      return;
    }

    this.cameraSnapshot = {
      targetDistance: camera.targetDistance,
      targetTheta: camera.targetTheta,
      targetPhi: camera.targetPhi,
      distance: camera.distance,
      theta: camera.theta,
      phi: camera.phi
    };
  }

  restoreCameraSnapshot() {
    const camera = this.getCameraController();
    if (!camera || !this.cameraSnapshot) {
      return;
    }

    camera.targetDistance = this.cameraSnapshot.targetDistance;
    camera.targetTheta = this.cameraSnapshot.targetTheta;
    camera.targetPhi = this.cameraSnapshot.targetPhi;
  }

  update(time, state) {
    if (!this.isActive) {
      return;
    }

    this.currentState = state || this.currentState;
    this.applyAutoCameraMotion(time);
    this.updateOverlayContent();
  }

  applyAutoCameraMotion(time) {
    const camera = this.getCameraController();
    if (!camera) {
      return;
    }

    const t = (time || 0) * 0.001;
    const baseDistance = this.cameraSnapshot?.distance ?? camera.defaultDistance ?? camera.distance;
    const basePhi = this.cameraSnapshot?.phi ?? camera.defaultPhi ?? camera.phi;

    camera.targetTheta += 0.0012;
    camera.targetDistance = baseDistance + Math.sin(t * 0.35) * 0.35;

    const nextPhi = basePhi + Math.sin(t * 0.22) * 0.06;
    camera.targetPhi = Math.min(camera.maxPhi, Math.max(camera.minPhi, nextPhi));
  }

  updateOverlayContent() {
    const state = this.currentState || {};
    const distance = this.getDistanceValue(state);
    const redshift = this.getNumberValue(state.redshift, 2);
    const alpha = this.getNumberValue(state.alpha, 4);

    const distanceEl = this.overlay?.querySelector('#presentation-value-distance');
    const redshiftEl = this.overlay?.querySelector('#presentation-value-redshift');
    const alphaEl = this.overlay?.querySelector('#presentation-value-alpha');

    if (distanceEl) sanitize.setText(distanceEl, distance);
    if (redshiftEl) sanitize.setText(redshiftEl, redshift);
    if (alphaEl) sanitize.setText(alphaEl, alpha);

    const titleEl = this.overlay?.querySelector('#presentation-scene-title');
    const descriptionEl = this.overlay?.querySelector('#presentation-scene-description');
    const sceneText = this.getSceneDescription(state);

    if (titleEl) sanitize.setText(titleEl, sceneText.title);
    if (descriptionEl) sanitize.setText(descriptionEl, sceneText.description);
  }

  getDistanceValue(state) {
    if (Number.isFinite(state.r_normalized)) {
      const unit = this.mode === 'blackhole' ? 'r_s' : 'r_0';
      return `${state.r_normalized.toFixed(2)} ${unit}`;
    }

    if (Number.isFinite(state.distance)) {
      return state.distance.toFixed(2);
    }

    return '—';
  }

  getNumberValue(value, digits) {
    return Number.isFinite(value) ? value.toFixed(digits) : '—';
  }

  getSceneDescription(state) {
    const distanceRatio = Number.isFinite(state.r_normalized) ? state.r_normalized : null;

    if (this.mode === 'blackhole') {
      if (state.observationMode === 'telescope') {
        return {
          title: 'Photon Ring Focus',
          description: 'Light paths curve around the black hole, forming a bright ring structure.'
        };
      }

      if (distanceRatio != null && distanceRatio <= 1.2) {
        return {
          title: 'Near Horizon Drift',
          description: 'Time slows dramatically near the event horizon while redshift intensifies.'
        };
      }

      return {
        title: 'Relativistic Black Hole Vista',
        description: 'A clean distant view highlighting gravitational lensing and spacetime curvature.'
      };
    }

    if (state.viewMode === 'interior') {
      return {
        title: 'Wormhole Interior Passage',
        description: 'The tunnel geometry stretches into a cinematic traversal through curved spacetime.'
      };
    }

    if (distanceRatio != null && distanceRatio <= 1.2) {
      return {
        title: 'Throat Approach',
        description: 'Approaching the throat reveals the strongest visible geometric distortion.'
      };
    }

    return {
      title: 'Wormhole Exterior Scan',
      description: 'A clear embedding view of a traversable wormhole with minimal interface clutter.'
    };
  }
}

export default PresentationMode;
