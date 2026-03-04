/**
 * Dual Clock System for Time Dilation Visualization
 * Shows divergence between far observer time and local observer time
 */

export class DualClockDisplay {
  constructor(container, physics) {
    this.container = container;
    this.physics = physics;
    this.farObserverTime = 0;
    this.localObserverTime = 0;
    this.startTime = Date.now();
    this.element = this.createClockUI();
  }

  createClockUI() {
    const clockContainer = document.createElement('div');
    clockContainer.className = 'dual-clock-container';

    // Far Observer Clock
    const farClock = document.createElement('div');
    farClock.className = 'clock-panel far-clock';

    const farTitle = document.createElement('div');
    farTitle.className = 'clock-title';
    farTitle.textContent = 'Far Observer Time';
    farClock.appendChild(farTitle);

    const farDisplay = document.createElement('div');
    farDisplay.className = 'clock-display';
    farDisplay.textContent = '0.00 s';
    this.farClockDisplay = farDisplay;
    farClock.appendChild(farDisplay);

    const farDesc = document.createElement('div');
    farDesc.className = 'clock-description';
    farDesc.textContent = 'Coordinate time (t) far from gravity';
    farClock.appendChild(farDesc);

    clockContainer.appendChild(farClock);

    // Local Observer Clock
    const localClock = document.createElement('div');
    localClock.className = 'clock-panel local-clock';

    const localTitle = document.createElement('div');
    localTitle.className = 'clock-title';
    localTitle.textContent = 'Local Observer Time';
    localClock.appendChild(localTitle);

    const localDisplay = document.createElement('div');
    localDisplay.className = 'clock-display';
    localDisplay.textContent = '0.00 s';
    this.localClockDisplay = localDisplay;
    localClock.appendChild(localDisplay);

    const localDesc = document.createElement('div');
    localDesc.className = 'clock-description';
    localDesc.innerHTML = 'Proper time (τ) near black hole<br/>dτ = dt √(1 - r<sub>s</sub>/r)';
    localClock.appendChild(localDesc);

    clockContainer.appendChild(localClock);

    // Divergence Indicator
    const divergence = document.createElement('div');
    divergence.className = 'time-divergence';
    
    const divTitle = document.createElement('div');
    divTitle.className = 'divergence-title';
    divTitle.textContent = 'Time Dilation Factor (α)';
    divergence.appendChild(divTitle);

    const divValue = document.createElement('div');
    divValue.className = 'divergence-value';
    divValue.textContent = '1.000';
    this.divergenceValue = divValue;
    divergence.appendChild(divValue);

    const divBar = document.createElement('div');
    divBar.className = 'divergence-bar';
    const divFill = document.createElement('div');
    divFill.className = 'divergence-fill';
    this.divergenceFill = divFill;
    divBar.appendChild(divFill);
    divergence.appendChild(divBar);

    clockContainer.appendChild(divergence);

    this.container.appendChild(clockContainer);
    return clockContainer;
  }

  update(cameraDistance, deltaTime = 0.016) {
    // Calculate time dilation factor at current position
    const alpha = this.physics.getTimeDilationFactor(cameraDistance);
    
    // Far observer time advances normally
    this.farObserverTime += deltaTime;
    
    // Local observer time advances more slowly (proper time)
    // dτ = dt * α
    this.localObserverTime += deltaTime * alpha;
    
    // Update displays
    this.farClockDisplay.textContent = this.farObserverTime.toFixed(2) + ' s';
    this.localClockDisplay.textContent = this.localObserverTime.toFixed(2) + ' s';
    this.divergenceValue.textContent = alpha.toFixed(4);
    
    // Update divergence bar (inverse - more dilation = less bar)
    const barWidth = alpha * 100;
    this.divergenceFill.style.width = barWidth + '%';
    
    // Color based on severity
    if (alpha < 0.3) {
      this.divergenceFill.style.backgroundColor = '#ff4444';
      this.localClockDisplay.style.color = '#ff6666';
    } else if (alpha < 0.7) {
      this.divergenceFill.style.backgroundColor = '#ffaa00';
      this.localClockDisplay.style.color = '#ffcc66';
    } else {
      this.divergenceFill.style.backgroundColor = '#00d9ff';
      this.localClockDisplay.style.color = '#00d9ff';
    }
    
    // Show dramatic divergence when very close
    if (alpha < 0.5) {
      this.localClock.classList.add('extreme-dilation');
    } else {
      this.localClock.classList.remove('extreme-dilation');
    }
  }

  reset() {
    this.farObserverTime = 0;
    this.localObserverTime = 0;
    this.startTime = Date.now();
  }

  setVisible(visible) {
    this.element.style.display = visible ? 'flex' : 'none';
  }

  dispose() {
    this.element.remove();
  }
}
