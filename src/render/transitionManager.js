// Cinematic Transition Manager
// Owner: Turki Abdullah © 2026

/**
 * TransitionManager
 * Handles smooth cinematic transitions, fades, and animations
 * Supports fade-out/in, camera travel, intro effects, UI animations
 */
export class TransitionManager {
  constructor() {
    this.activeTransitions = [];
    this.fadeOverlay = null;
    this.isTransitioning = false;
    this.setupFadeOverlay();
  }

  /**
   * Setup fade overlay element
   */
  setupFadeOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'transition-fade-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0);
      pointer-events: none;
      z-index: 9999;
      transition: none;
    `;
    document.body.appendChild(overlay);
    this.fadeOverlay = overlay;
  }

  /**
   * Easing functions for smooth animations
   */
  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 + --t * 2 * (2 * (t + 1) * t + 1);
  }

  static easeOutCubic(t) {
    return 1 + --t * t * t;
  }

  static easeInCubic(t) {
    return t * t * t;
  }

  /**
   * Scene fade transition: fade out, callback, fade in
   * @param {number} duration - Total duration in ms
   * @param {Function} callback - Called during fade out
   * @param {Function} onComplete - Called when transition complete
   */
  fadeSceneTransition(duration = 500, callback, onComplete) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const fadeOutDuration = duration * 0.4;
    const fadeInDuration = duration * 0.4;
    const callbackDelay = fadeOutDuration;

    // Fade to black
    this.animateFade(0, 1, fadeOutDuration, TransitionManager.easeInOutQuad, () => {
      // Execute scene change
      if (callback) callback();
      
      // Fade from black
      this.animateFade(1, 0, fadeInDuration, TransitionManager.easeInOutQuad, () => {
        this.isTransitioning = false;
        if (onComplete) onComplete();
      });
    });
  }

  /**
   * Animate fade overlay opacity
   * @param {number} startAlpha - Starting opacity (0-1)
   * @param {number} endAlpha - Ending opacity (0-1)
   * @param {number} duration - Duration in ms
   * @param {Function} easeFunc - Easing function
   * @param {Function} onComplete - Callback when done
   */
  animateFade(startAlpha, endAlpha, duration, easeFunc = TransitionManager.easeInOutQuad, onComplete) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeFunc(progress);
      const alpha = startAlpha + (endAlpha - startAlpha) * eased;
      
      if (this.fadeOverlay) {
        this.fadeOverlay.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * UI fade-in animation for elements
   * @param {HTMLElement} element - Element to animate
   * @param {number} duration - Duration in ms
   * @param {number} delay - Delay before starting in ms
   * @param {Function} onComplete - Callback when done
   */
  fadeInElement(element, duration = 400, delay = 0, onComplete) {
    if (!element) return;

    element.style.opacity = '0';
    setTimeout(() => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = TransitionManager.easeOutCubic(progress);
        
        element.style.opacity = eased.toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.opacity = '1';
          if (onComplete) onComplete();
        }
      };

      requestAnimationFrame(animate);
    }, delay);
  }

  /**
   * UI fade-out animation for elements
   * @param {HTMLElement} element - Element to animate
   * @param {number} duration - Duration in ms
   * @param {Function} onComplete - Callback when done
   */
  fadeOutElement(element, duration = 300, onComplete) {
    if (!element) return;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = TransitionManager.easeInCubic(progress);
      
      element.style.opacity = (1 - eased).toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.opacity = '0';
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Slide-in animation (from left/right/top/bottom)
   * @param {HTMLElement} element - Element to animate
   * @param {string} direction - 'left', 'right', 'top', 'bottom'
   * @param {number} distance - Distance to slide in px
   * @param {number} duration - Duration in ms
   * @param {number} delay - Delay before starting in ms
   * @param {Function} onComplete - Callback when done
   */
  slideInElement(element, direction = 'left', distance = 50, duration = 500, delay = 0, onComplete) {
    if (!element) return;

    const getInitialTransform = () => {
      const transforms = {
        left: `translateX(-${distance}px)`,
        right: `translateX(${distance}px)`,
        top: `translateY(-${distance}px)`,
        bottom: `translateY(${distance}px)`
      };
      return transforms[direction] || 'translateX(0)';
    };

    element.style.transform = getInitialTransform();
    element.style.opacity = '0';

    setTimeout(() => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = TransitionManager.easeOutCubic(progress);
        
        element.style.opacity = eased.toString();
        element.style.transform = `translate${direction === 'left' || direction === 'right' ? 'X' : 'Y'}(${
          (direction === 'left' || direction === 'top' ? -distance : distance) * (1 - eased)
        }px)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.opacity = '1';
          element.style.transform = 'translate(0, 0)';
          if (onComplete) onComplete();
        }
      };

      requestAnimationFrame(animate);
    }, delay);
  }

  /**
   * Intro fly-in: camera zoom in from distance
   * @param {number} startDistance - Initial camera distance
   * @param {number} endDistance - Final camera distance
   * @param {number} duration - Duration in ms
   * @param {Function} onDistanceChange - Called each frame with new distance
   * @param {Function} onComplete - Callback when done
   */
  introFlyIn(startDistance, endDistance, duration = 2000, onDistanceChange, onComplete) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = TransitionManager.easeInOutCubic(progress);
      
      const distance = startDistance + (endDistance - startDistance) * eased;
      
      if (onDistanceChange) onDistanceChange(distance);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Stagger animation for multiple elements
   * @param {HTMLElement[]} elements - Array of elements to animate
   * @param {string} animationType - 'fade' or 'slide'
   * @param {number} staggerDelay - Delay between each element in ms
   * @param {number} duration - Duration per element in ms
   * @param {Function} onComplete - Callback when all done
   */
  staggerElements(elements, animationType = 'fade', staggerDelay = 100, duration = 400, onComplete) {
    if (!elements || elements.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    let completed = 0;
    const checkComplete = () => {
      completed++;
      if (completed === elements.length && onComplete) {
        onComplete();
      }
    };

    elements.forEach((element, index) => {
      const delay = index * staggerDelay;
      
      if (animationType === 'fade') {
        this.fadeInElement(element, duration, delay, checkComplete);
      } else if (animationType === 'slide') {
        this.slideInElement(element, 'bottom', 30, duration, delay, checkComplete);
      }
    });
  }

  /**
   * Pulse animation (opacity throb)
   * @param {HTMLElement} element - Element to animate
   * @param {number} duration - Duration of pulse in ms
   * @param {number} intensity - Max opacity change (0-1)
   * @param {number} iterations - Number of pulses
   */
  pulseElement(element, duration = 800, intensity = 0.3, iterations = 2) {
    if (!element) return;

    const baseDuration = duration / iterations;
    let currentIteration = 0;

    const pulse = () => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / baseDuration, 1);
        const wave = Math.sin(progress * Math.PI);
        
        element.style.opacity = (1 - wave * intensity).toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentIteration++;
          if (currentIteration < iterations) {
            pulse();
          } else {
            element.style.opacity = '1';
          }
        }
      };

      requestAnimationFrame(animate);
    };

    pulse();
  }

  /**
   * Check if currently transitioning
   */
  getIsTransitioning() {
    return this.isTransitioning;
  }

  /**
   * Reset transition state
   */
  resetTransitionState() {
    this.isTransitioning = false;
    if (this.fadeOverlay) {
      this.fadeOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    }
  }
}

export default TransitionManager;
