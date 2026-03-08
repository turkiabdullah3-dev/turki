// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import CanvasRoot from '../render/canvasRoot.js';
import SpaceBackground from '../render/spaceBackground.js';
import auth from '../core/auth.js';
import { sanitize } from '../core/sanitize.js';
import navigationHelper from '../ui/navigationHelper.js';

auth.requireLogin();

const session = auth.getSession();
if (session) {
  sanitize.setText(document.getElementById('user-name'), session.displayName);
}

document.getElementById('btn-logout')?.addEventListener('click', () => {
  auth.logout();
});

document.getElementById('card-blackhole')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./blackhole.html');
});

document.getElementById('card-wormhole')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./wormhole.html');
});

document.getElementById('card-blackhole')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    navigationHelper.navigateWithTransition('./blackhole.html');
  }
});

document.getElementById('card-wormhole')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    navigationHelper.navigateWithTransition('./wormhole.html');
  }
});

document.getElementById('btn-equations')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./equations.html');
});

document.getElementById('btn-about')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./about.html');
});

const container = document.getElementById('canvas-container');
const canvasRoot = new CanvasRoot(container);
canvasRoot.init();

const spaceBackground = new SpaceBackground(canvasRoot);
spaceBackground.init();

function animate(time) {
  canvasRoot.clear('#000000');
  spaceBackground.update(time);
  spaceBackground.render(time);
  spaceBackground.renderNebula();
  requestAnimationFrame(animate);
}
animate(0);

// Setup page load fade-in transition
navigationHelper.setupPageLoadFadeIn();
