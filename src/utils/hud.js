/**
 * Advanced HUD System
 * Floating holographic panels with glass morphism
 */
import * as THREE from 'three';

export class InteractiveHUD {
  constructor(container) {
    this.container = container;
    this.panels = [];
    this.updaters = [];
    this.notifications = [];
    this.lastHudUpdate = 0;
    this.rafId = null;
    this.theme = {
      primary: '#00d9ff',
      secondary: '#0099ff',
      accent: '#7d00ff',
      dark: '#050508',
      border: 'rgba(0, 217, 255, 0.25)'
    };

    this.updateLoop = this.updateLoop.bind(this);
    this.rafId = requestAnimationFrame(this.updateLoop);
  }

  updateLoop(now) {
    if (now - this.lastHudUpdate >= 100) {
      this.updaters.forEach((updateFn) => updateFn());
      this.lastHudUpdate = now;
    }

    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const item = this.notifications[i];
      if (!item.shown && now >= item.showAt) {
        item.element.classList.add('show');
        item.shown = true;
      }

      if (!item.hiding && now >= item.hideAt) {
        item.element.classList.remove('show');
        item.hiding = true;
      }

      if (now >= item.removeAt) {
        item.element.remove();
        this.notifications.splice(i, 1);
      }
    }

    this.rafId = requestAnimationFrame(this.updateLoop);
  }

  /**
   * Create a glass morphism panel
   */
  createPanel(title, options = {}) {
    const panel = document.createElement('div');
    panel.className = 'interactive-hud-panel';
    
    const panelId = `panel-${Date.now()}`;
    panel.id = panelId;
    
    // Header
    const header = document.createElement('div');
    header.className = 'hud-panel-header';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'hud-panel-title';
    titleEl.textContent = title;
    header.appendChild(titleEl);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'hud-panel-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => this.closePanel(panelId));
    header.appendChild(closeBtn);
    
    panel.appendChild(header);
    
    // Content
    const content = document.createElement('div');
    content.className = 'hud-panel-content';
    panel.appendChild(content);
    
    // Make draggable
    this.makeDraggable(panel);
    
    // Make expandable
    this.makeExpandable(panel);
    
    this.container.appendChild(panel);
    
    this.panels.push({
      element: panel,
      id: panelId,
      title,
      content,
      expanded: false
    });
    
    return { panel, content, id: panelId };
  }

  /**
   * Make panel draggable
   */
  makeDraggable(element) {
    let offsetX = 0, offsetY = 0, x = 0, y = 0;
    
    const header = element.querySelector('.hud-panel-header');
    header.addEventListener('mousedown', (e) => {
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      
      const moveListener = (moveEvent) => {
        x = moveEvent.clientX - offsetX;
        y = moveEvent.clientY - offsetY;
        
        element.style.left = x + 'px';
        element.style.top = y + 'px';
      };
      
      const upListener = () => {
        document.removeEventListener('mousemove', moveListener);
        document.removeEventListener('mouseup', upListener);
      };
      
      document.addEventListener('mousemove', moveListener);
      document.addEventListener('mouseup', upListener);
    });
  }

  /**
   * Make panel expandable
   */
  makeExpandable(element) {
    const header = element.querySelector('.hud-panel-header');
    const content = element.querySelector('.hud-panel-content');
    
    header.addEventListener('dblclick', () => {
      const isExpanded = element.classList.contains('expanded');
      if (isExpanded) {
        element.classList.remove('expanded');
        content.style.maxHeight = 'auto';
      } else {
        element.classList.add('expanded');
        content.style.maxHeight = '400px';
      }
    });
  }

  /**
   * Add data to panel with live updates
   */
  addDataDisplay(panelId, label, getter, unit = '') {
    const panel = this.panels.find(p => p.id === panelId);
    if (!panel) return;
    
    const dataElement = document.createElement('div');
    dataElement.className = 'hud-data-item';
    
    const labelEl = document.createElement('div');
    labelEl.className = 'hud-data-label';
    labelEl.textContent = label;
    
    const valueEl = document.createElement('div');
    valueEl.className = 'hud-data-value';
    valueEl.textContent = '---';
    
    dataElement.appendChild(labelEl);
    dataElement.appendChild(valueEl);
    
    panel.content.appendChild(dataElement);
    
    // Update loop
    const updateValue = () => {
      try {
        const value = getter();
        valueEl.textContent = `${value}${unit}`;
      } catch (e) {
        valueEl.textContent = 'Error';
      }
    };
    
    // Update immediately and on frame-driven HUD loop
    updateValue();
    this.updaters.push(updateValue);
  }

  /**
   * Create progress bar in panel
   */
  addProgressBar(panelId, label, getter, max = 1) {
    const panel = this.panels.find(p => p.id === panelId);
    if (!panel) return;
    
    const progressItem = document.createElement('div');
    progressItem.className = 'hud-progress-item';
    
    const labelEl = document.createElement('div');
    labelEl.className = 'hud-progress-label';
    labelEl.textContent = label;
    
    const barContainer = document.createElement('div');
    barContainer.className = 'hud-progress-bar-container';
    
    const bar = document.createElement('div');
    bar.className = 'hud-progress-bar-fill';
    barContainer.appendChild(bar);
    
    progressItem.appendChild(labelEl);
    progressItem.appendChild(barContainer);
    
    panel.content.appendChild(progressItem);
    
    // Update loop
    const progressUpdater = () => {
      try {
        const value = Math.min(getter() / max, 1);
        bar.style.width = (value * 100) + '%';
      } catch (e) {
        // Silently fail
      }
    };
    progressUpdater();
    this.updaters.push(progressUpdater);
  }

  /**
   * Close panel
   */
  closePanel(panelId) {
    const panelIndex = this.panels.findIndex(p => p.id === panelId);
    if (panelIndex > -1) {
      const panel = this.panels[panelIndex];
      panel.element.style.opacity = '0';
      panel.element.style.pointerEvents = 'none';

      const handleTransitionEnd = () => {
        panel.element.removeEventListener('transitionend', handleTransitionEnd);
        panel.element.remove();
        this.panels.splice(panelIndex, 1);
      };

      panel.element.addEventListener('transitionend', handleTransitionEnd);
    }
  }

  /**
   * Show notification
   */
  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'hud-notification';
    notification.textContent = message;
    
    this.container.appendChild(notification);

    const now = performance.now();
    this.notifications.push({
      element: notification,
      showAt: now + 16,
      hideAt: now + duration,
      removeAt: now + duration + 320,
      shown: false,
      hiding: false
    });
  }

  /**
   * Dispose
   */
  dispose() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.updaters = [];
    this.notifications = [];
    this.panels.forEach(panel => {
      panel.element.remove();
    });
    this.panels = [];
  }
}

/**
 * Real-time data visualization
 */
export class DataVisualization {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.className = 'data-visualization-canvas';
    container.appendChild(this.canvas);
    
    this.data = [];
    this.maxDataPoints = 60;
    this.scale = 100;
  }

  /**
   * Add data point
   */
  addDataPoint(value) {
    this.data.push(value);
    if (this.data.length > this.maxDataPoints) {
      this.data.shift();
    }
  }

  /**
   * Draw graph
   */
  draw() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear
    this.ctx.fillStyle = 'rgba(5, 5, 8, 0.5)';
    this.ctx.fillRect(0, 0, width, height);
    
    if (this.data.length < 2) return;
    
    // Find min/max
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;
    
    // Draw grid
    this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
    
    // Draw data
    this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    this.data.forEach((value, index) => {
      const x = (index / this.data.length) * width;
      const normalized = (value - min) / range;
      const y = height - (normalized * height);
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.stroke();
    
    // Draw point
    const lastValue = this.data[this.data.length - 1];
    const normalized = (lastValue - min) / range;
    const x = width;
    const y = height - (normalized * height);
    
    this.ctx.fillStyle = 'rgba(0, 217, 255, 1)';
    this.ctx.beginPath();
    this.ctx.arc(x - 2, y, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Resize canvas
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.draw();
  }

  /**
   * Dispose
   */
  dispose() {
    this.canvas.remove();
  }
}
