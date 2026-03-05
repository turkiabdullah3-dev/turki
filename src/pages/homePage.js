import '../../styles/app.css';
import '../../styles/glass.css';

import CanvasRoot from '../render/canvasRoot.js';
import SpaceBackground from '../render/spaceBackground.js';
import auth from '../core/auth.js';
import { sanitize } from '../core/sanitize.js';

auth.requireLogin();

const session = auth.getSession();
if (session) {
  sanitize.setText(document.getElementById('user-name'), session.displayName);
}

document.getElementById('btn-logout')?.addEventListener('click', () => {
  auth.logout();
});

document.getElementById('card-blackhole')?.addEventListener('click', () => {
  window.location.href = './blackhole.html';
});

document.getElementById('card-wormhole')?.addEventListener('click', () => {
  window.location.href = './wormhole.html';
});

document.getElementById('card-blackhole')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    window.location.href = './blackhole.html';
  }
});

document.getElementById('card-wormhole')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    window.location.href = './wormhole.html';
  }
});

document.getElementById('btn-equations')?.addEventListener('click', () => {
  window.location.href = './equations.html';
});

document.getElementById('btn-about')?.addEventListener('click', () => {
  window.location.href = './about.html';
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
