// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import '../../styles/app.css';
import '../../styles/glass.css';

import CanvasRoot from '../render/canvasRoot.js';
import SpaceBackground from '../render/spaceBackground.js';
import auth from '../core/auth.js';
import { sanitize } from '../core/sanitize.js';

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

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const cooldownMessage = document.getElementById('cooldown-message');
const loginBtn = document.getElementById('login-btn');

function getLockState() {
  return auth.getLoginLockState();
}

function updateLockoutUI() {
  const lock = getLockState();
  const locked = lock.isLocked;
  loginBtn.disabled = locked;
  usernameInput.disabled = locked;
  passwordInput.disabled = locked;

  if (locked) {
    cooldownMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    sanitize.setText(
      cooldownMessage,
      `Too many attempts. Try again in ${lock.remainingSeconds}s.`
    );
  } else {
    cooldownMessage.style.display = 'none';
  }
}

if (auth.isLoggedIn()) {
  window.location.href = './home.html';
}

updateLockoutUI();
setInterval(updateLockoutUI, 1000);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const lock = getLockState();
  if (lock.isLocked) {
    cooldownMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    sanitize.setText(
      cooldownMessage,
      `Too many attempts. Try again in ${lock.remainingSeconds}s.`
    );
    return;
  }

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  const success = await auth.login(username, password);
  if (success) {
    auth.resetLoginLockState();
    window.location.href = './home.html';
    return;
  }

  const nextState = auth.recordFailedLoginAttempt();
  errorMessage.style.display = 'block';
  cooldownMessage.style.display = 'none';
  sanitize.setText(errorMessage, 'Invalid credentials.');

  if (nextState.isLocked) {
    updateLockoutUI();
  }
});
