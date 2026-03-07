// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
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
import GuidedJourney from '../ui/guidedJourney.js';
import { OBSERVED_BLACK_HOLES } from '../data/observedBlackHoles.js';
import perf from '../core/perf.js';
import PerformanceMonitor from '../core/performanceMonitor.js';
import UnitsConverter, { UnitMode } from '../core/unitsConverter.js';
import { sanitizeState } from '../physics/safety.js';
import navigationHelper from '../ui/navigationHelper.js';
import SimulationRecorder from '../core/simulationRecorder.js';
import { TimelineRenderer } from '../ui/timelineRenderer.js';
import { ObserverFrame } from '../core/observerFrames.js';
import ExperimentsLab from '../ui/experimentsLab.js';
import MissionScenarios from '../ui/missionScenarios.js';

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
  navigationHelper.navigateWithTransition('./home.html');
});

document.getElementById('btn-equations-header')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./equations.html');
});

document.getElementById('btn-equations-footer')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./equations.html');
});

function setupIntroOverlay() {
  const introOverlay = document.getElementById('intro-overlay');
  const enterButton = document.getElementById('btn-enter-simulation');

  if (!introOverlay || !enterButton) {
    return;
  }

  enterButton.addEventListener('click', () => {
    introOverlay.classList.add('hidden');
    setTimeout(() => {
      introOverlay.style.display = 'none';
    }, 350);
  });
}

setupIntroOverlay();

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

// Initialize simulation recorder and timeline renderer
const simulationRecorder = new SimulationRecorder(500); // Record every 500ms
const timelineRenderer = new TimelineRenderer();

// Timeline panel setup
const timelinePanel = document.getElementById('timeline-panel');
const timelineCanvas = document.getElementById('timeline-canvas');
const timelineCtx = timelineCanvas ? timelineCanvas.getContext('2d') : null;
let currentGraphType = 'redshift';

// Timeline button
document.getElementById('btn-timeline')?.addEventListener('click', () => {
  if (timelinePanel) {
    timelinePanel.style.display = timelinePanel.style.display === 'none' ? 'block' : 'none';
  }
});

// Graph tab switching
document.querySelectorAll('.graph-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.graph-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentGraphType = tab.getAttribute('data-graph');
  });
});

// Reset timeline button
document.getElementById('btn-timeline-reset')?.addEventListener('click', () => {
  simulationRecorder.resetTimeline();
});

// Toggle timeline button text
document.getElementById('btn-timeline-toggle')?.addEventListener('click', (e) => {
  const canvas = document.getElementById('timeline-canvas');
  const info = document.getElementById('timeline-info');
  if (canvas.style.display === 'none') {
    canvas.style.display = 'block';
    if (info) info.style.display = 'block';
    e.target.textContent = 'Hide';
  } else {
    canvas.style.display = 'none';
    if (info) info.style.display = 'none';
    e.target.textContent = 'Show';
  }
});

// Initialize observer frame system
let currentObserverFrame = new ObserverFrame('distant');
const savedFrame = localStorage.getItem('blackhole-observer-frame') || 'distant';
currentObserverFrame = new ObserverFrame(savedFrame);

// Observer frame button setup
const observerFrameButtons = document.querySelectorAll('.observer-frame-btn');
const observerFrameNameEl = document.getElementById('observer-frame-name');
const observerFrameDescEl = document.getElementById('observer-frame-description');

observerFrameButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const frameType = btn.getAttribute('data-frame');
    currentObserverFrame = new ObserverFrame(frameType);
    localStorage.setItem('blackhole-observer-frame', frameType);

    // Update button states
    observerFrameButtons.forEach((b) => b.classList.remove('primary'));
    btn.classList.add('primary');

    // Update info display
    if (observerFrameNameEl && observerFrameDescEl) {
      observerFrameNameEl.textContent = currentObserverFrame.getName();
      observerFrameDescEl.textContent = currentObserverFrame.getDescription();
    }
  });
});

// Set initial observer frame info display
if (observerFrameNameEl && observerFrameDescEl) {
  observerFrameNameEl.textContent = currentObserverFrame.getName();
  observerFrameDescEl.textContent = currentObserverFrame.getDescription();
  // Set primary button
  observerFrameButtons.forEach((btn) => {
    btn.classList.toggle('primary', btn.getAttribute('data-frame') === savedFrame);
  });
}

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
const selectObservedObject = document.getElementById('select-observed-object');
const observedName = document.getElementById('observed-name');
const observedType = document.getElementById('observed-type');
const observedMass = document.getElementById('observed-mass');
const observedLocation = document.getElementById('observed-location');
const observedDistance = document.getElementById('observed-distance');

const OBSERVED_OBJECT_KEY = 'observedBlackHoleObject';
const CUSTOM_MASS_KEY = 'customBlackHoleMass';

function clampCustomMass(value) {
  if (!sliderMass) return value;
  const min = parseFloat(sliderMass.min);
  const max = parseFloat(sliderMass.max);
  return Math.min(max, Math.max(min, value));
}

function formatMassSolar(mass) {
  if (mass >= 1e9) {
    return `${(mass / 1e9).toFixed(2)} billion M☉`;
  }
  if (mass >= 1e6) {
    return `${(mass / 1e6).toFixed(2)} million M☉`;
  }
  return `${mass.toLocaleString('en-US', { maximumFractionDigits: 2 })} M☉`;
}

function formatSchwarzschildKm(km) {
  if (km >= 1e9) {
    return `${(km / 1e9).toFixed(2)} billion km`;
  }
  if (km >= 1e6) {
    return `${(km / 1e6).toFixed(2)} million km`;
  }
  return `${km.toFixed(2)} km`;
}

function updateMassInfoLabel() {
  if (!massInfo) return;
  const rsKm = unitsConverter.schwarzschildRadius / 1000;
  massInfo.textContent = `r_s = ${formatSchwarzschildKm(rsKm)}`;
}

function renderObservedObjectInfo(objectConfig) {
  if (observedName) observedName.textContent = objectConfig.name;
  if (observedType) observedType.textContent = objectConfig.type;
  if (observedMass) observedMass.textContent = objectConfig.massLabel;
  if (observedLocation) observedLocation.textContent = objectConfig.location;
  if (observedDistance) observedDistance.textContent = objectConfig.distanceFromEarth;
}

let customMass = parseFloat(localStorage.getItem(CUSTOM_MASS_KEY) || '10');
if (Number.isNaN(customMass) || customMass <= 0) {
  customMass = 10;
}
customMass = clampCustomMass(customMass);

function applyObservedObjectSelection(key) {
  const objectConfig = OBSERVED_BLACK_HOLES[key] || OBSERVED_BLACK_HOLES.custom;
  const isCustom = objectConfig.key === 'custom';

  localStorage.setItem(OBSERVED_OBJECT_KEY, objectConfig.key);
  renderObservedObjectInfo(objectConfig);

  if (sliderMass) {
    sliderMass.disabled = !isCustom;
    sliderMass.classList.toggle('slider-disabled', !isCustom);
  }

  if (isCustom) {
    unitsConverter.setBlackHoleMass(customMass);
    if (sliderMass) {
      sliderMass.value = customMass.toString();
    }
    if (sliderValueMass) {
      sliderValueMass.textContent = `${customMass.toFixed(0)} M☉`;
    }
  } else {
    unitsConverter.setBlackHoleMass(objectConfig.massSolar);
    if (sliderValueMass) {
      sliderValueMass.textContent = formatMassSolar(objectConfig.massSolar);
    }
  }

  updateMassInfoLabel();
  hud.setData(blackHoleScene.state || blackHoleScene.getState());
}

if (sliderMass && sliderValueMass) {
  sliderMass.value = customMass.toString();
  sliderValueMass.textContent = `${customMass.toFixed(0)} M☉`;
  updateMassInfoLabel();

  sliderMass.addEventListener('input', (e) => {
    const selectedKey = localStorage.getItem(OBSERVED_OBJECT_KEY) || 'custom';
    if (selectedKey !== 'custom') {
      return;
    }

    const mass = clampCustomMass(parseFloat(e.target.value));
    customMass = mass;
    localStorage.setItem(CUSTOM_MASS_KEY, customMass.toString());

    unitsConverter.setBlackHoleMass(mass);
    sliderValueMass.textContent = `${mass.toFixed(0)} M☉`;
    updateMassInfoLabel();
    hud.setData(blackHoleScene.state || blackHoleScene.getState());
  });
}

if (selectObservedObject) {
  const savedSelection = localStorage.getItem(OBSERVED_OBJECT_KEY) || 'custom';
  selectObservedObject.value = OBSERVED_BLACK_HOLES[savedSelection] ? savedSelection : 'custom';
  applyObservedObjectSelection(selectObservedObject.value);

  selectObservedObject.addEventListener('change', (event) => {
    applyObservedObjectSelection(event.target.value);
  });
}

const btnModelSchwarzschild = document.getElementById('btn-model-schwarzschild');
const btnModelKerr = document.getElementById('btn-model-kerr');
const spinControlGroup = document.getElementById('spin-control-group');
const sliderSpin = document.getElementById('slider-spin');
const sliderValueSpin = document.getElementById('slider-value-spin');

function applyBlackHoleModelUI(model) {
  const isKerr = model === 'kerr';
  btnModelSchwarzschild?.classList.toggle('primary', !isKerr);
  btnModelKerr?.classList.toggle('primary', isKerr);
  if (spinControlGroup) {
    spinControlGroup.style.display = isKerr ? 'block' : 'none';
  }
}

if (sliderSpin && sliderValueSpin) {
  sliderSpin.value = blackHoleScene.getSpinParameter().toFixed(2);
  sliderValueSpin.textContent = blackHoleScene.getSpinParameter().toFixed(2);
  sliderSpin.addEventListener('input', (event) => {
    const spin = parseFloat(event.target.value);
    blackHoleScene.setSpinParameter(spin);
    sliderValueSpin.textContent = spin.toFixed(2);
  });
}

btnModelSchwarzschild?.addEventListener('click', () => {
  blackHoleScene.setBlackHoleModel('schwarzschild');
  applyBlackHoleModelUI('schwarzschild');
});

btnModelKerr?.addEventListener('click', () => {
  blackHoleScene.setBlackHoleModel('kerr');
  applyBlackHoleModelUI('kerr');
});

applyBlackHoleModelUI(blackHoleScene.getBlackHoleModel());

// Observation mode toggle
const btnModeSimulation = document.getElementById('btn-mode-simulation');
const btnModeTelescope = document.getElementById('btn-mode-telescope');
const ehtInfoPanel = document.getElementById('eht-info-panel');

function applyObservationModeUI(mode) {
  const isTelescope = mode === 'telescope';
  btnModeSimulation?.classList.toggle('primary', !isTelescope);
  btnModeTelescope?.classList.toggle('primary', isTelescope);
  
  // Show EHT info panel only when telescope mode is active
  if (ehtInfoPanel) {
    ehtInfoPanel.style.display = isTelescope ? 'block' : 'none';
  }
}

btnModeSimulation?.addEventListener('click', () => {
  blackHoleScene.setObservationMode('simulation');
  applyObservationModeUI('simulation');
});

btnModeTelescope?.addEventListener('click', () => {
  blackHoleScene.setObservationMode('telescope');
  applyObservationModeUI('telescope');
});

applyObservationModeUI(blackHoleScene.getObservationMode());

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

// Initialize guided journey
const guidedJourney = new GuidedJourney('blackhole');
guidedJourney.init();

// Initialize experiments lab
const experimentsLab = new ExperimentsLab('blackhole', blackHoleScene.physics, blackHoleScene);
experimentsLab.init();

// Experiments button
const btnExperiments = document.getElementById('btn-experiments');
if (btnExperiments) {
  btnExperiments.addEventListener('click', () => {
    experimentsLab.show();
  });
}

function refreshBlackHoleStateForHUD() {
  const rawState = blackHoleScene.getState();
  const state = sanitizeState(
    {
      ...rawState,
      rs: blackHoleScene.physics.r_s,
      tidal: rawState.tidalForce
    },
    'blackhole'
  );
  blackHoleScene.state = { ...rawState, ...state, tidalForce: state.tidal };
  hud.setData(blackHoleScene.state);
  scientificMode.updateState(blackHoleScene.state);
}

function applyBlackHoleScenarioDistance(distance) {
  const slider = document.getElementById('slider-distance');
  const nextDistance = Number(distance);
  if (!Number.isFinite(nextDistance)) {
    return;
  }

  if (slider) {
    const min = parseFloat(slider.min || '1.02');
    const max = parseFloat(slider.max || '50');
    const clamped = Math.min(max, Math.max(min, nextDistance));
    slider.value = clamped.toFixed(2);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  blackHoleScene.setDistance(nextDistance);
  refreshBlackHoleStateForHUD();
}

function setBlackHoleScientificMode(isEnabled) {
  const active = Boolean(isEnabled);
  scientificMode.setActive(active);
  btnScientific?.classList.toggle('active', active);
  localStorage.setItem('scientificMode', active ? 'on' : 'off');
}

function applyBlackHoleScenarioPreset(preset = {}) {
  if (preset.blackHoleModel) {
    blackHoleScene.setBlackHoleModel(preset.blackHoleModel);
    applyBlackHoleModelUI(preset.blackHoleModel);
  }

  if (Number.isFinite(preset.spinParameter)) {
    blackHoleScene.setSpinParameter(preset.spinParameter);
    if (sliderSpin && sliderValueSpin) {
      sliderSpin.value = Number(preset.spinParameter).toFixed(2);
      sliderValueSpin.textContent = Number(preset.spinParameter).toFixed(2);
    }
  }

  if (preset.observationMode) {
    blackHoleScene.setObservationMode(preset.observationMode);
    applyObservationModeUI(preset.observationMode);
  }

  if (Number.isFinite(preset.distance)) {
    applyBlackHoleScenarioDistance(preset.distance);
  }

  if (preset.resetCamera) {
    blackHoleScene.resetCamera();
  }

  if (typeof preset.scientificMode === 'boolean') {
    setBlackHoleScientificMode(preset.scientificMode);
  }

  refreshBlackHoleStateForHUD();
}

const btnMissions = document.getElementById('btn-missions');
const missionScenarios = new MissionScenarios('blackhole', {
  onApplyScenario: (scenario) => {
    applyBlackHoleScenarioPreset(scenario.preset || {});
  },
  onManualReset: () => {
    refreshBlackHoleStateForHUD();
  },
  onVisibilityChange: (isVisible) => {
    btnMissions?.classList.toggle('active', isVisible);
  }
});
missionScenarios.init();

btnMissions?.addEventListener('click', () => {
  missionScenarios.toggle();
});

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

// Journey button
const btnJourneyStart = document.getElementById('btn-journey-start');
if (btnJourneyStart) {
  btnJourneyStart.addEventListener('click', () => {
    if (guidedJourney.isJourneyActive()) {
      guidedJourney.exit();
      btnJourneyStart.textContent = '🎬 Start Journey';
      btnJourneyStart.classList.remove('active');
    } else {
      guidedJourney.start(controls.getDistance());
      btnJourneyStart.textContent = '✕ Exit Journey';
      btnJourneyStart.classList.add('active');
    }
  });
}

// Camera reset button
const btnResetCamera = document.getElementById('btn-reset-camera');
if (btnResetCamera) {
  btnResetCamera.addEventListener('click', () => {
    blackHoleScene.resetCamera();
  });
}

// Connect journey distance updates to controls
guidedJourney.onDistanceUpdate((newDistance) => {
  controls.setDistance(newDistance);
});

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
  
  // Update observer frame
  currentObserverFrame.update(0.016, blackHoleScene.state);
  
  // Update experiments lab
  experimentsLab.update(0.016);
  
  // Update guided journey (if active)
  if (guidedJourney.isJourneyActive()) {
    const currentDistance = controls.getDistance();
    guidedJourney.update(time, currentDistance);
  }

  spaceBackground.update(time);
  blackHoleScene.update(time);

  const rawState = blackHoleScene.getState();
  const state = sanitizeState(
    {
      ...rawState,
      rs: blackHoleScene.physics.r_s,
      tidal: rawState.tidalForce,
      fps: currentFPS,
      observerFrame: currentObserverFrame.getName(),
      observerFrameVelocity: currentObserverFrame.getVelocity()
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

  // Update simulation recorder with observer frame redshift modification
  const deltaTime = 0.016; // ~60 FPS
  const baseRedshift = blackHoleScene.state?.redshift !== undefined ? blackHoleScene.state.redshift : 0;
  const observerRedshift = currentObserverFrame.getRedshiftModification(baseRedshift);
  
  const stateForRecorder = {
    ...blackHoleScene.state,
    distance: blackHoleScene.state?.distance || 5,
    alpha: blackHoleScene.state?.alpha !== undefined ? blackHoleScene.state.alpha : 1.0,
    redshift: observerRedshift,
    tidalForce: blackHoleScene.state?.tidalForce || 0,
    schwarzschildRadius: blackHoleScene.physics.r_s,
    isBlackHole: true
  };
  simulationRecorder.update(deltaTime, stateForRecorder);

  // Render timeline if visible
  if (timelinePanel && timelinePanel.style.display !== 'none' && timelineCtx) {
    const mapProperty = {
      redshift: 'redshift',
      distance: 'distance',
      alpha: 'alpha',
      tidal: 'tidalForce'
    }[currentGraphType] || 'redshift';

    const range = simulationRecorder.getPropertyRange(mapProperty);
    timelineRenderer.renderLineGraph(
      timelineCtx,
      timelineCanvas.width,
      timelineCanvas.height,
      simulationRecorder.getDataPoints(),
      'timestamp',
      mapProperty,
      currentGraphType.charAt(0).toUpperCase() + currentGraphType.slice(1),
      simulationRecorder.getEventMarkers(),
      range
    );

    // Update data point count
    const pointCountEl = document.getElementById('timeline-point-count');
    if (pointCountEl) {
      pointCountEl.textContent = simulationRecorder.getDataPointCount();
    }
  }

  hud.updateFPS();

  requestAnimationFrame(animate);
}

animate(0);

// Setup page load fade-in transition
navigationHelper.setupPageLoadFadeIn();

// Setup intro fly-in effect on first load
const INTRO_FLY_IN_KEY = 'blackhole-intro-flyIn-done';
if (!localStorage.getItem(INTRO_FLY_IN_KEY)) {
  localStorage.setItem(INTRO_FLY_IN_KEY, 'true');
  
  // Start with camera far away
  const cameraController = blackHoleScene.getCameraController();
  if (cameraController) {
    const defaultDistance = cameraController.defaultDistance;
    const startDistance = defaultDistance * 3;
    
    // Set initial camera position
    cameraController.distance = startDistance;
    cameraController.targetDistance = startDistance;
    
    // Animate camera flying in
    navigationHelper.getTransitionManager().introFlyIn(
      startDistance,
      defaultDistance,
      2000,
      (distance) => {
        if (cameraController) {
          cameraController.distance = distance;
          cameraController.targetDistance = distance;
        }
      },
      () => {
        // After fly-in, stagger fade-in HUD elements
        const hudElements = [
          document.querySelector('.header'),
          document.querySelector('.dock-panel'),
          document.querySelector('.hud-data')
        ];
        
        navigationHelper.getTransitionManager().staggerElements(
          hudElements.filter(el => el),
          'fade',
          100,
          400
        );
      }
    );
  }
} else {
  // If not first load, still animate UI layers on normal page load
  setTimeout(() => {
    const transitionMgr = navigationHelper.getTransitionManager();
    
    // Slide in dock panel from left
    const dockPanel = document.querySelector('.dock-panel');
    if (dockPanel) {
      transitionMgr.slideInElement(dockPanel, 'left', 40, 500, 100);
    }
    
    // Fade in header
    const header = document.querySelector('.header');
    if (header) {
      transitionMgr.fadeInElement(header, 400, 50);
    }
    
    // Slide in controls panel
    const hudData = document.querySelector('.hud-data');
    if (hudData) {
      transitionMgr.slideInElement(hudData, 'right', 40, 500, 150);
    }
  }, 100);
}
