import '../../styles/app.css';
import '../../styles/glass.css';

import auth from '../core/auth.js';
import CanvasRoot from '../render/canvasRoot.js';
import SpaceBackground from '../render/spaceBackground.js';
import WormholeScene from '../render/wormholeScene.js';
import PostFX from '../render/postFX.js';
import HUD from '../ui/hud.js';
import Controls from '../ui/controls.js';
import perf from '../core/perf.js';
import { sanitize } from '../core/sanitize.js';
import { sanitizeState } from '../physics/safety.js';

auth.requireLogin();

function setupDockTabs() {
  const tabButtons = document.querySelectorAll('[data-dock-tab]');
  const tabPanels = document.querySelectorAll('[data-dock-content]');

  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTab = button.getAttribute('data-dock-tab');

      tabButtons.forEach((tabButton) => {
        tabButton.classList.toggle('active', tabButton === button);
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-dock-content') === nextTab);
      });
    });
  });
}

setupDockTabs();

document.getElementById('btn-home')?.addEventListener('click', () => {
  window.location.href = './home.html';
});

document.getElementById('btn-equations-header')?.addEventListener('click', () => {
  window.location.href = './equations.html';
});

document.getElementById('btn-equations-footer')?.addEventListener('click', () => {
  window.location.href = './equations.html';
});

const container = document.getElementById('canvas-container');
const canvasRoot = new CanvasRoot(container);
if (!canvasRoot.init()) {
  alert('Failed to initialize canvas');
}

const spaceBackground = new SpaceBackground(canvasRoot);
const wormholeScene = new WormholeScene(canvasRoot);
const postFX = new PostFX(canvasRoot);

spaceBackground.init();
wormholeScene.init();

const hud = new HUD();
hud.init();

const QUALITY_KEY = 'qualityMode';
const isTouchIPad = /Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document;
const isMobileOrTablet = perf.isMobileOrTablet() || isTouchIPad;
let qualityMode = localStorage.getItem(QUALITY_KEY) || 'glow';
let lowFpsSince = null;

function showQualityToast(message) {
  let toast = document.getElementById('quality-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'quality-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '10px';
    toast.style.background = 'rgba(15, 10, 40, 0.85)';
    toast.style.border = '1px solid rgba(180, 140, 255, 0.45)';
    toast.style.color = 'rgba(255,255,255,0.95)';
    toast.style.fontSize = '12px';
    toast.style.zIndex = '9999';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(showQualityToast._timer);
  showQualityToast._timer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2200);
}

function applyQualityMode(mode, withNotice = false) {
  const glowBtn = document.getElementById('btn-quality-glow');
  const highBtn = document.getElementById('btn-quality-high');
  const hint = document.getElementById('quality-hint');

  let nextMode = mode === 'high' ? 'high' : 'glow';
  if (isMobileOrTablet && nextMode === 'high') {
    nextMode = 'glow';
    if (withNotice) {
      showQualityToast('High mode is desktop-only. Using Glow mode.');
    }
  }

  qualityMode = nextMode;
  localStorage.setItem(QUALITY_KEY, qualityMode);
  wormholeScene.setQualityMode(qualityMode);
  wormholeScene.setPerformanceContext({ fps: perf.fpsCounter.getFPS(), isMobile: isMobileOrTablet });

  if (glowBtn) glowBtn.classList.toggle('primary', qualityMode === 'glow');
  if (highBtn) highBtn.classList.toggle('primary', qualityMode === 'high');
  if (hint) {
    hint.textContent = isMobileOrTablet
      ? 'High mode is desktop-only on this device.'
      : qualityMode === 'high'
        ? 'High mode: distortion enabled when FPS stays above 45.'
        : 'Glow mode: best smoothness for all devices.';
  }
}

const controls = new Controls(
  (distance) => {
    wormholeScene.setDistance(distance);
    const rawState = wormholeScene.getState();
    const safeState = sanitizeState(
      {
        ...rawState,
        r0: wormholeScene.physics.r0,
        distanceRatio: rawState.r_normalized
      },
      'wormhole'
    );
    const state = { ...rawState, ...safeState, r_normalized: safeState.distanceRatio ?? rawState.r_normalized };
    updateWormholeHUD(state);
  },
  () => {
    wormholeScene.setDistance(2);
    const rawState = wormholeScene.getState();
    const safeState = sanitizeState(
      {
        ...rawState,
        r0: wormholeScene.physics.r0,
        distanceRatio: rawState.r_normalized
      },
      'wormhole'
    );
    const state = { ...rawState, ...safeState, r_normalized: safeState.distanceRatio ?? rawState.r_normalized };
    updateWormholeHUD(state);
  }
);
controls.init('wormhole');

document.getElementById('btn-quality-glow')?.addEventListener('click', () => applyQualityMode('glow', false));
document.getElementById('btn-quality-high')?.addEventListener('click', () => applyQualityMode('high', true));

applyQualityMode(qualityMode, false);

function updateWormholeHUD(state) {
  const distanceEl = document.getElementById('value-distance');
  const warpEl = document.getElementById('value-warp');
  const exoticEl = document.getElementById('value-exotic');
  const throatRadiusEl = document.getElementById('value-throat-radius');

  // Values only - units are in HTML
  if (distanceEl) sanitize.setText(distanceEl, state.r_normalized.toFixed(2));
  if (warpEl) sanitize.setText(warpEl, (state.warpStrength * 100).toFixed(0));
  if (exoticEl) sanitize.setText(exoticEl, state.exoticMatter < 0 ? 'Required' : 'Not Required');
  if (throatRadiusEl) sanitize.setText(throatRadiusEl, '1.00'); // Throat radius is constant at 1.00 r₀
}

const initialDistance = controls.getValue();
wormholeScene.setDistance(initialDistance);
{
  const rawState = wormholeScene.getState();
  const safeState = sanitizeState(
    {
      ...rawState,
      r0: wormholeScene.physics.r0,
      distanceRatio: rawState.r_normalized
    },
    'wormhole'
  );
  const state = { ...rawState, ...safeState, r_normalized: safeState.distanceRatio ?? rawState.r_normalized };
  updateWormholeHUD(state);
}

function animate(time) {
  canvasRoot.clear('#000000');

  perf.fpsCounter.update();
  const currentFPS = perf.fpsCounter.getFPS();

  spaceBackground.update(time);
  wormholeScene.update(time);

  const rawState = wormholeScene.getState();
  const safeState = sanitizeState(
    {
      ...rawState,
      r0: wormholeScene.physics.r0,
      distanceRatio: rawState.r_normalized,
      fps: currentFPS
    },
    'wormhole'
  );
  wormholeScene.state = { ...rawState, ...safeState, r_normalized: safeState.distanceRatio ?? rawState.r_normalized };
  wormholeScene.setPerformanceContext({ fps: currentFPS, isMobile: isMobileOrTablet });
  updateWormholeHUD(wormholeScene.state);

  if (qualityMode === 'high' && !isMobileOrTablet) {
    if (currentFPS < 40) {
      lowFpsSince = lowFpsSince ?? time;
      if (time - lowFpsSince > 1000) {
        applyQualityMode('glow', false);
        showQualityToast('Switched to Glow mode for performance.');
        lowFpsSince = null;
      }
    } else {
      lowFpsSince = null;
    }
  } else {
    lowFpsSince = null;
  }

  spaceBackground.render(time);
  wormholeScene.render(time);
  spaceBackground.renderNebula();
  postFX.apply(0.3, 0.2);

  hud.updateFPS();

  requestAnimationFrame(animate);
}

animate(0);
