// Guided Journey - Cinematic exploration mode
// Owner: Turki Abdullah © 2026

import { sanitize } from '../core/sanitize.js';

/**
 * Journey stages for black hole exploration
 */
const BLACK_HOLE_STAGES = [
  {
    stage: 1,
    title: 'Distant View',
    description: 'Start from a safe distance at 50 Schwarzschild radii to observe the full system clearly.',
    targetDistance: 50,
    duration: 3000
  },
  {
    stage: 2,
    title: 'Approaching Photon Sphere',
    description: 'At 3 Schwarzschild radii, lensing becomes strong as light paths bend around the black hole.',
    targetDistance: 3,
    duration: 4000
  },
  {
    stage: 3,
    title: 'Near Event Horizon',
    description: 'At 1.5 Schwarzschild radii, time dilation and redshift rise rapidly near the horizon.',
    targetDistance: 1.5,
    duration: 4000
  },
  {
    stage: 4,
    title: 'Critical Region',
    description: 'At 1.02 Schwarzschild radii, this is the closest safe observation point before no-return.',
    targetDistance: 1.02,
    duration: 4000
  }
];

/**
 * Journey stages for wormhole exploration
 */
const WORMHOLE_STAGES = [
  {
    stage: 1,
    title: 'External Observation',
    description: 'Begin at 5 throat radii to view the full external wormhole geometry.',
    targetDistance: 5,
    duration: 3000
  },
  {
    stage: 2,
    title: 'Approach',
    description: 'At 2.5 throat radii, curvature intensifies and the throat profile becomes clearer.',
    targetDistance: 2.5,
    duration: 4000
  },
  {
    stage: 3,
    title: 'Throat Region',
    description: 'At the throat, exotic matter requirements become central to maintaining traversability.',
    targetDistance: 1.0,
    duration: 4000
  },
  {
    stage: 4,
    title: 'Tunnel Transition',
    description: 'At 0.5 throat radii, the tunnel transition highlights peak warp effects.',
    targetDistance: 0.5,
    duration: 4000
  }
];

/**
 * Guided Journey Mode
 * Provides cinematic exploration of physics visualizations
 */
export class GuidedJourney {
  constructor(mode = 'blackhole') {
    this.mode = mode;
    this.isActive = false;
    this.currentStage = 1;
    this.stages = mode === 'blackhole' ? BLACK_HOLE_STAGES : WORMHOLE_STAGES;
    this.overlay = null;
    
    // Animation state
    this.isTransitioning = false;
    this.transitionStartTime = 0;
    this.transitionDuration = 0;
    this.startDistance = 0;
    this.targetDistance = 0;
    
    // Callbacks
    this.onDistanceChange = null;
    this.onStageChangeCallback = null;
    this.onActiveChangeCallback = null;
  }
  
  /**
   * Initialize journey UI
   */
  init() {
    this.createOverlay();
    return this;
  }
  
  /**
   * Create journey overlay UI
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'journey-overlay';
    this.overlay.className = 'journey-overlay';
    this.overlay.style.display = 'none';
    
    document.body.appendChild(this.overlay);
  }
  
  /**
   * Start guided journey
   */
  start(currentDistance) {
    this.isActive = true;
    this.currentStage = 1;
    this.startDistance = currentDistance;
    
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      this.overlay.style.opacity = '0';
      
      // Fade in
      requestAnimationFrame(() => {
        this.overlay.style.transition = 'opacity 0.5s ease';
        this.overlay.style.opacity = '1';
      });
    }
    
    this.renderStage();
    this.transitionToStage(1);
    
    // Save preference
    localStorage.setItem('journeyMode', 'active');
    document.body.classList.add('journey-active');
    if (this.onActiveChangeCallback) {
      this.onActiveChangeCallback(true);
    }
  }
  
  /**
   * Exit guided journey
   */
  exit() {
    this.isActive = false;
    this.isTransitioning = false;
    
    if (this.overlay) {
      this.overlay.style.transition = 'opacity 0.3s ease';
      this.overlay.style.opacity = '0';
      
      setTimeout(() => {
        this.overlay.style.display = 'none';
      }, 300);
    }
    
    // Save preference
    localStorage.setItem('journeyMode', 'inactive');
    document.body.classList.remove('journey-active');
    document.body.removeAttribute('data-journey-stage');
    if (this.onActiveChangeCallback) {
      this.onActiveChangeCallback(false);
    }
  }
  
  /**
   * Go to next stage
   */
  nextStage() {
    if (this.currentStage < this.stages.length) {
      this.currentStage++;
      this.renderStage();
      this.transitionToStage(this.currentStage);
    }
  }
  
  /**
   * Go to previous stage
   */
  previousStage() {
    if (this.currentStage > 1) {
      this.currentStage--;
      this.renderStage();
      this.transitionToStage(this.currentStage);
    }
  }
  
  /**
   * Transition to a specific stage
   */
  transitionToStage(stageNumber) {
    const stage = this.stages[stageNumber - 1];
    if (!stage) return;
    
    this.isTransitioning = true;
    this.transitionStartTime = performance.now();
    this.transitionDuration = stage.duration;
    this.targetDistance = stage.targetDistance;
    
    // Will be updated in update() method
  }
  
  /**
   * Render current stage UI
   */
  renderStage() {
    if (!this.overlay) return;
    
    const stage = this.stages[this.currentStage - 1];
    if (!stage) return;

    document.body.setAttribute('data-journey-stage', String(stage.stage));
    if (this.onStageChangeCallback) {
      this.onStageChangeCallback({ ...stage, totalStages: this.stages.length });
    }
    
    const html = `
      <div class="journey-content">
        <div class="journey-header">
          <div class="journey-stage-number">Stage ${stage.stage} of ${this.stages.length}</div>
          <button class="journey-exit-btn" id="journey-exit-inline" type="button">✕ Exit Journey</button>
        </div>
        
        <div class="journey-stage-info">
          <h2 class="journey-title">${this.escapeHtml(stage.title)}</h2>
          <p class="journey-description">${this.escapeHtml(stage.description)}</p>
        </div>
        
        <div class="journey-controls">
          <button 
            class="journey-btn journey-btn-prev" 
            id="journey-prev" 
            type="button"
            ${this.currentStage === 1 ? 'disabled' : ''}
          >
            ← Previous
          </button>
          <div class="journey-progress">
            ${this.stages.map((s, i) => `
              <div class="journey-dot ${i + 1 === this.currentStage ? 'active' : ''} ${i + 1 < this.currentStage ? 'completed' : ''}"></div>
            `).join('')}
          </div>
          <button 
            class="journey-btn journey-btn-next" 
            id="journey-next" 
            type="button"
            ${this.currentStage === this.stages.length ? 'disabled' : ''}
          >
            ${this.currentStage === this.stages.length ? 'Journey Complete' : 'Next →'}
          </button>
        </div>
      </div>
    `;
    
    this.overlay.innerHTML = html;
    
    // Attach event listeners
    this.attachEventListeners();
  }
  
  /**
   * Attach event listeners to journey controls
   */
  attachEventListeners() {
    const prevBtn = document.getElementById('journey-prev');
    const nextBtn = document.getElementById('journey-next');
    const exitBtn = document.getElementById('journey-exit-inline');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousStage());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStage < this.stages.length) {
          this.nextStage();
        }
      });
    }
    
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.exit());
    }
  }
  
  /**
   * Update animation (call this every frame)
   */
  update(currentTime, currentDistance) {
    if (!this.isActive || !this.isTransitioning) {
      return currentDistance;
    }
    
    const elapsed = currentTime - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1);
    
    // Ease-in-out interpolation
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Interpolate distance
    const newDistance = this.startDistance + (this.targetDistance - this.startDistance) * eased;
    
    // Update via callback
    if (this.onDistanceChange) {
      this.onDistanceChange(newDistance);
    }
    
    // Check if transition complete
    if (progress >= 1) {
      this.isTransitioning = false;
      this.startDistance = this.targetDistance;
    }
    
    return newDistance;
  }
  
  /**
   * Set distance change callback
   */
  onDistanceUpdate(callback) {
    this.onDistanceChange = callback;
  }

  onStageChange(callback) {
    this.onStageChangeCallback = callback;
  }

  onActiveChange(callback) {
    this.onActiveChangeCallback = callback;
  }

  getCurrentStage() {
    return this.stages[this.currentStage - 1] || null;
  }
  
  /**
   * Check if journey is active
   */
  isJourneyActive() {
    return this.isActive;
  }
  
  /**
   * Check if currently transitioning
   */
  isInTransition() {
    return this.isTransitioning;
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default GuidedJourney;
