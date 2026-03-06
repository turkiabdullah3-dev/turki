import '../../styles/app.css';
import '../../styles/glass.css';

import auth from '../core/auth.js';
import CanvasRoot from '../render/canvasRoot.js';
import SpaceBackground from '../render/spaceBackground.js';
import BlackHoleScene from '../render/blackholeScene.js';
import PostFX from '../render/postFX.js';
import HUD from '../ui/hud.js';
import Controls from '../ui/controls.js';
import ScientificMode from '../ui/scientificMode.js';
import perf from '../core/perf.js';
import PerformanceMonitor from '../core/performanceMonitor.js';
import UnitsConverter, { UnitMode } from '../core/unitsConverter.js';
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
const blackHoleScene = new BlackHoleScene(canvasRoot);
const postFX = new PostFX(canvasRoot);

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();
spaceBackground.setPerformanceMonitor(performanceMonitor);
blackHoleScene.setPerformanceMonitor(performanceMonitor);

spaceBackground.init();
blackHoleScene.init();

const hud = new HUD();
hud.init();

// Initialize units converter
const unitsConverter = new UnitsConverter('blackhole');
unitsConverter.loadPreferences();
hud.setUnitsConverter(unitsConverter);

// Units toggle buttons
const btnUnitsRelative = document.getElementById('btn-units-relative');
const btnUnitsPhysical = document.getElementById('btn-units-physical');
if (btnUnitsRelative && btnUnitsPhysical) {
  btnUnitsRelative.addEventListener('click', () => {
    unitsConverter.setUnitMode(UnitMode.RELATIVE);
    btnUnitsRelative.classList.add('primary');
    btnUnitsPhysical.classList.remove('primary');
    hud.setData(blackHoleScene.state || blackHoleScene.getState());
  });
  btnUnitsPhysical.addEventListener('click', () => {
    unitsConverter.setUnitMode(UnitMode.PHYSICAL);
    btnUnitsPhysical.classList.add('primary');
    btnUnitsRelative.classList.remove('primary');
    hud.setData(blackHoleScene.state || blackHoleScene.getState());
  });
  // Set initial state
  if (unitsConverter.getUnitMode() === UnitMode.PHYSICAL) {
    btnUnitsPhysical.classList.add('primary');
    btnUnitsRelative.classList.remove('primary');
  }
}

// Mass parameter slider
const sliderMass = document.getElementById('slider-mass');
const sliderValueMass = document.getElementById('slider-value-mass');
const massInfo = document.getElementById('mass-info');
if (sliderMass && sliderValueMass) {
  sliderMass.value = unitsConverter.getBlackHoleMass().toString();
  sliderValueMass.textContent = `${unitsConverter.getBlackHoleMass().toFixed(0)} M☉`;
  if (massInfo) {
    const rs_km = (unitsConverter.schwarzschildRadius / 1000).toFixed(2);
    massInfo.textContent = `r_s = ${rs_km} km`;
  }
  
  sliderMass.addEventListener('input', (e) => {
    const mass = parseFloat(e.target.value);
    unitsConverter.setBlackHoleMass(mass);
    sliderValueMass.textContent = `${mass.toFixed(0)} M☉`;
    if (massInfo) {
      const rs_km = (unitsConverter.schwarzschildRadius / 1000).toFixed(2);
      massInfo.textContent = `r_s = ${rs_km} km`;
    }
    hud.setData(blackHoleScene.state || blackHoleScene.getState());
  });
}

// Initialize scientific mode
const scientificMode = new ScientificMode('blackhole');
scientificMode.init();
scientificMode.loadPreference();

// Scientific mode button
const btnScientific = document.getElementById('btn-scientific');
if (btnScientific) {
  btnScientific.addEventListener('click', () => {
    const isActive = scientificMode.toggle();
    btnScientific.classList.toggle('active', isActive);
  });
  // Set initial state
  btnScientific.classList.toggle('active', scientificMode.isActive);
}

const controls = new Controls(
  (distance) => {
    blackHoleScene.setDistance(distance);
    const rawState = blackHoleScene.getState();
    const state = sanitizeState(
      {
        ...rawState,
        rs: blackHoleScene.physics.r_s,
        tidal: rawState.tidalForce
      },
      'blackhole'
    );
    hud.setData({ ...rawState, ...state, tidalForce: state.tidal });
  },
  () => {
    blackHoleScene.setDistance(5);
    const rawState = blackHoleScene.getState();
    const state = sanitizeState(
      {
        ...rawState,
        rs: blackHoleScene.physics.r_s,
        tidal: rawState.tidalForce
      },
      'blackhole'
    );
    hud.setData({ ...rawState, ...state, tidalForce: state.tidal });
  }
);
controls.init('blackhole');

const initialDistance = controls.getValue();
blackHoleScene.setDistance(initialDistance);
{
  const rawState = blackHoleScene.getState();
  const state = sanitizeState(
    {
      ...rawState,
      rs: blackHoleScene.physics.r_s,
      tidal: rawState.tidalForce
    },
    'blackhole'
  );
  hud.setData({ ...rawState, ...state, tidalForce: state.tidal });
}

function animate(time) {
  canvasRoot.clear('#000000');

  // Update performance monitor
  const currentFPS = performanceMonitor.update();

  spaceBackground.update(time);
  blackHoleScene.update(time);

  const rawState = blackHoleScene.getState();
  const state = sanitizeState(
    {
      ...rawState,
      rs: blackHoleScene.physics.r_s,
      tidal: rawState.tidalForce,
      fps: currentFPS
    },
    'blackhole'
  );
  blackHoleScene.state = { ...rawState, ...state, tidalForce: state.tidal };
  hud.setData(blackHoleScene.state);
  scientificMode.updateState(blackHoleScene.state);

  spaceBackground.render(time);
  blackHoleScene.render(time);
  spaceBackground.renderNebula();
  postFX.apply(0.4, 0.2);

  hud.updateFPS();

  requestAnimationFrame(animate);
}

animate(0);
