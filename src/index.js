import * as THREE from 'three';
import { LandingPage } from './components/LandingPage.js';
import { BlackHoleScene } from './scenes/BlackHoleScene.js';
import { WormholeScene } from './scenes/WormholeScene.js';
import { EquationsPage } from './components/EquationsPage.js';

export class App {
  constructor() {
    this.root = document.getElementById('root');
    this.currentPage = null;
    this.init();
  }

  init() {
    this.renderLanding();
  }

  renderLanding() {
    this.cleanupCurrentPage();
    this.currentPage = new LandingPage({
      onBlackHoleClick: () => this.renderBlackHole(),
      onWormholeClick: () => this.renderWormhole(),
      onEquationsClick: () => this.renderEquations()
    });
    this.root.appendChild(this.currentPage.element);
  }

  renderBlackHole() {
    this.cleanupCurrentPage();
    this.currentPage = new BlackHoleScene({
      onBack: () => this.renderLanding()
    });
    this.root.appendChild(this.currentPage.element);
  }

  renderWormhole() {
    this.cleanupCurrentPage();
    this.currentPage = new WormholeScene({
      onBack: () => this.renderLanding()
    });
    this.root.appendChild(this.currentPage.element);
  }

  renderEquations() {
    this.cleanupCurrentPage();
    this.currentPage = new EquationsPage({
      onBack: () => this.renderLanding()
    });
    this.root.appendChild(this.currentPage.element);
  }

  cleanupCurrentPage() {
    if (this.currentPage) {
      this.currentPage.dispose();
      this.currentPage.element.remove();
      this.currentPage = null;
    }
  }

  dispose() {
    this.cleanupCurrentPage();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}

window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.dispose();
  }
});
