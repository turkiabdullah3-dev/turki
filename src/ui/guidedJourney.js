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
    description: 'We begin our journey at a safe distance, 50 Schwarzschild radii from the black hole. From here, we can observe the entire system without experiencing extreme gravitational effects.',
    targetDistance: 50,
    duration: 3000
  },
  {
    stage: 2,
    title: 'Approaching Photon Sphere',
    description: 'At 3 Schwarzschild radii, we enter the photon sphere—the region where light can orbit the black hole. Gravitational lensing becomes visually apparent as space curves dramatically.',
    targetDistance: 3,
    duration: 4000
  },
  {
    stage: 3,
    title: 'Near Event Horizon',
    description: 'We are now at 1.5 Schwarzschild radii, just outside the event horizon. Time dilation is extreme—clocks here tick much slower than those far from the black hole. Tidal forces begin to rise sharply.',
    targetDistance: 1.5,
    duration: 4000
  },
  {
    stage: 4,
    title: 'Critical Region',
    description: 'This is the boundary—1.02 Schwarzschild radii. Any closer and escape becomes impossible. Redshift approaches infinity, and tidal forces would tear apart any physical object. This is as close as we can safely observe.',
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
    description: 'We begin at 5 throat radii from the wormhole entrance. From this vantage point, we can see the warping of spacetime that connects two distant regions of the universe.',
    targetDistance: 5,
    duration: 3000
  },
  {
    stage: 2,
    title: 'Approach',
    description: 'Moving to 2.5 throat radii, the curvature of space becomes more pronounced. The wormhole\'s shape function dictates how dramatically space is bent to create this shortcut through spacetime.',
    targetDistance: 2.5,
    duration: 4000
  },
  {
    stage: 3,
    title: 'Throat Region',
    description: 'We are now at the throat—the narrowest point of the wormhole. Exotic matter with negative energy density is required to keep this passage open. Without it, the wormhole would collapse.',
    targetDistance: 1.0,
    duration: 4000
  },
  {
    stage: 4,
    title: 'Tunnel Transition',
    description: 'At 0.5 throat radii, we are inside the tunnel itself. The warp strength is at maximum, and we can observe the connection between two regions of spacetime. This is theoretical physics made visual.',
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
