// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import auth from '../core/auth.js';
import navigationHelper from '../ui/navigationHelper.js';

auth.requireLogin();

function createStars(count = 70) {
  const starsRoot = document.getElementById('observatory-stars');
  if (!starsRoot) {
    return;
  }

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const star = document.createElement('span');
    star.className = 'observatory-star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--size', `${(Math.random() * 2 + 1).toFixed(2)}px`);
    star.style.setProperty('--twinkle', `${(Math.random() * 3 + 2).toFixed(2)}s`);
    star.style.setProperty('--delay', `${(Math.random() * 1.2).toFixed(2)}s`);
    fragment.appendChild(star);
  }

  starsRoot.appendChild(fragment);
}

function setupNodeNavigation() {
  document.querySelectorAll('.observatory-node').forEach((node) => {
    node.addEventListener('click', () => {
      const target = node.getAttribute('data-target');
      if (target) {
        navigationHelper.navigateWithTransition(target);
      }
    });
  });
}

function setupQuickActions() {
  document.getElementById('btn-equations')?.addEventListener('click', () => {
    navigationHelper.navigateWithTransition('./equations.html');
  });

  document.getElementById('btn-about')?.addEventListener('click', () => {
    navigationHelper.navigateWithTransition('./about.html');
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    auth.logout();
  });
}

function triggerEntryAnimation() {
  requestAnimationFrame(() => {
    document.body.classList.add('entry-ready');
  });
}

createStars();
setupNodeNavigation();
setupQuickActions();
triggerEntryAnimation();

navigationHelper.setupPageLoadFadeIn();