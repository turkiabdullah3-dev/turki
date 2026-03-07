// Navigation Helper with Cinematic Transitions
// Owner: Turki Abdullah © 2026

import { TransitionManager } from '../render/transitionManager.js';

class NavigationHelper {
  constructor() {
    this.transitionManager = new TransitionManager();
    this.setupNavigationInterception();
  }

  /**
   * Intercept all internal navigation links and add fade transitions
   */
  setupNavigationInterception() {
    document.addEventListener('click', (e) => {
      // Check if click target is a navigation button with href behavior
      const target = e.target.closest('[data-nav-link]');
      
      if (target && !this.transitionManager.getIsTransitioning()) {
        e.preventDefault();
        
        const href = target.getAttribute('data-nav-link');
        if (href) {
          this.navigateWithTransition(href);
        }
      }
    });
  }

  /**
   * Navigate to a page with fade transition
   * @param {string} url - URL to navigate to
   * @param {number} duration - Transition duration in ms
   */
  navigateWithTransition(url, duration = 500) {
    this.transitionManager.fadeSceneTransition(
      duration,
      null, // No callback during fade
      () => {
        window.location.href = url;
      }
    );
  }

  /**
   * Setup fade-in on page load (called after page is ready)
   */
  setupPageLoadFadeIn() {
    const overlay = document.getElementById('transition-fade-overlay');
    if (overlay) {
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
      
      // Fade in content
      setTimeout(() => {
        this.transitionManager.animateFade(
          1, 0, 300,
          TransitionManager.easeInOutQuad
        );
      }, 50);
    }
  }

  /**
   * Get transition manager for custom animations
   */
  getTransitionManager() {
    return this.transitionManager;
  }
}

// Create singleton instance
const navigationHelper = new NavigationHelper();

export default navigationHelper;
