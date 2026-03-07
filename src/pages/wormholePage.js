// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import '../../styles/app.css';
import '../../styles/glass.css';

import auth from '../core/auth.js';
import CanvasRoot from '../render/canvasRoot.js';
import SpaceBackground from '../render/spaceBackground.js';
import WormholeScene from '../render/wormholeScene.js';
import PostFX from '../render/postFX.js';
import HUD from '../ui/hud.js';
import Controls from '../ui/controls.js';
import ScientificMode from '../ui/scientificMode.js';
import GuidedJourney from '../ui/guidedJourney.js';
import perf from '../core/perf.js';
import PerformanceMonitor from '../core/performanceMonitor.js';
import UnitsConverter, { UnitMode } from '../core/unitsConverter.js';
import { sanitize } from '../core/sanitize.js';
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
const wormholeScene = new WormholeScene(canvasRoot);
const postFX = new PostFX(canvasRoot);

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();
spaceBackground.setPerformanceMonitor(performanceMonitor);
wormholeScene.setPerformanceMonitor(performanceMonitor);

spaceBackground.init();
wormholeScene.init();

// Initialize simulation recorder and timeline renderer
const simulationRecorder = new SimulationRecorder(500); // Record every 500ms
const timelineRenderer = new TimelineRenderer();

// Timeline panel setup
const timelinePanel = document.getElementById('timeline-panel');
const timelineCanvas = document.getElementById('timeline-canvas');
const timelineCtx = timelineCanvas ? timelineCanvas.getContext('2d') : null;
let currentGraphType = 'distance';

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
const savedFrame = localStorage.getItem('wormhole-observer-frame') || 'distant';
currentObserverFrame = new ObserverFrame(savedFrame);

// Observer frame button setup
const observerFrameButtons = document.querySelectorAll('.observer-frame-btn');
const observerFrameNameEl = document.getElementById('observer-frame-name');
const observerFrameDescEl = document.getElementById('observer-frame-description');

observerFrameButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const frameType = btn.getAttribute('data-frame');
    currentObserverFrame = new ObserverFrame(frameType);
    localStorage.setItem('wormhole-observer-frame', frameType);

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
const unitsConverter = new UnitsConverter('wormhole');
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
    updateWormholeHUD(wormholeScene.state || wormholeScene.getState());
  });
  btnUnitsPhysical.addEventListener('click', () => {
    unitsConverter.setUnitMode(UnitMode.PHYSICAL);
    btnUnitsPhysical.classList.add('primary');
    btnUnitsRelative.classList.remove('primary');
    updateWormholeHUD(wormholeScene.state || wormholeScene.getState());
  });
  // Set initial state
  if (unitsConverter.getUnitMode() === UnitMode.PHYSICAL) {
    btnUnitsPhysical.classList.add('primary');
    btnUnitsRelative.classList.remove('primary');
  }
}

// Throat radius parameter slider
const sliderThroat = document.getElementById('slider-throat');
const sliderValueThroat = document.getElementById('slider-value-throat');
if (sliderThroat && sliderValueThroat) {
  sliderThroat.value = unitsConverter.getWormholeThroatRadius().toString();
  sliderValueThroat.textContent = `${unitsConverter.getWormholeThroatRadius().toFixed(0)} m`;
  
  sliderThroat.addEventListener('input', (e) => {
    const throat = parseFloat(e.target.value);
    unitsConverter.setWormholeThroatRadius(throat);
    sliderValueThroat.textContent = `${throat.toFixed(0)} m`;
    updateWormholeHUD(wormholeScene.state || wormholeScene.getState());
  });
}

// Initialize scientific mode
const scientificMode = new ScientificMode('wormhole');
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
const guidedJourney = new GuidedJourney('wormhole');
guidedJourney.init();

// Initialize experiments lab
const experimentsLab = new ExperimentsLab('wormhole', wormholeScene.physics, wormholeScene);
experimentsLab.init();

// Experiments button
const btnExperiments = document.getElementById('btn-experiments');
if (btnExperiments) {
  btnExperiments.addEventListener('click', () => {
    experimentsLab.show();
  });
}

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
    wormholeScene.resetCamera();
  });
}

// Connect journey distance updates to controls
guidedJourney.onDistanceUpdate((newDistance) => {
  controls.setDistance(newDistance);
});

document.getElementById('btn-quality-glow')?.addEventListener('click', () => applyQualityMode('glow', false));
document.getElementById('btn-quality-high')?.addEventListener('click', () => applyQualityMode('high', true));

applyQualityMode(qualityMode, false);

const btnViewExterior = document.getElementById('btn-view-exterior');
const btnViewInterior = document.getElementById('btn-view-interior');
const viewModeHint = document.getElementById('viewmode-hint');

function applyViewMode(mode) {
  const nextMode = mode === 'interior' ? 'interior' : 'exterior';
  wormholeScene.setViewMode(nextMode);

  if (btnViewExterior) {
    btnViewExterior.classList.toggle('primary', nextMode === 'exterior');
  }
  if (btnViewInterior) {
    btnViewInterior.classList.toggle('primary', nextMode === 'interior');
  }
  if (viewModeHint) {
    viewModeHint.textContent = nextMode === 'interior'
      ? 'Interior mode: cinematic traversal through the wormhole tunnel.'
      : 'Exterior mode: classic throat embedding view.';
  }
}

btnViewExterior?.addEventListener('click', () => applyViewMode('exterior'));
btnViewInterior?.addEventListener('click', () => applyViewMode('interior'));
applyViewMode(wormholeScene.getViewMode());

function refreshWormholeStateForHUD() {
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
  wormholeScene.state = state;
  updateWormholeHUD(state);
  scientificMode.updateState(state);
}

function applyWormholeScenarioDistance(distance) {
  const slider = document.getElementById('slider-distance');
  const nextDistance = Number(distance);
  if (!Number.isFinite(nextDistance)) {
    return;
  }

  if (slider) {
    const min = parseFloat(slider.min || '0.5');
    const max = parseFloat(slider.max || '5');
    const clamped = Math.min(max, Math.max(min, nextDistance));
    slider.value = clamped.toFixed(2);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  wormholeScene.setDistance(nextDistance);
  refreshWormholeStateForHUD();
}

function setWormholeScientificMode(isEnabled) {
  const active = Boolean(isEnabled);
  scientificMode.setActive(active);
  btnScientific?.classList.toggle('active', active);
  localStorage.setItem('scientificMode', active ? 'on' : 'off');
}

function applyWormholeScenarioPreset(preset = {}) {
  if (preset.viewMode) {
    applyViewMode(preset.viewMode);
  }

  if (preset.qualityMode) {
    applyQualityMode(preset.qualityMode, false);
  }

  if (Number.isFinite(preset.distance)) {
    applyWormholeScenarioDistance(preset.distance);
  }

  if (preset.resetCamera) {
    wormholeScene.resetCamera();
  }

  if (typeof preset.scientificMode === 'boolean') {
    setWormholeScientificMode(preset.scientificMode);
  }

  refreshWormholeStateForHUD();
}

const btnMissions = document.getElementById('btn-missions');
const missionScenarios = new MissionScenarios('wormhole', {
  onApplyScenario: (scenario) => {
    applyWormholeScenarioPreset(scenario.preset || {});
  },
  onManualReset: () => {
    refreshWormholeStateForHUD();
  },
  onVisibilityChange: (isVisible) => {
    btnMissions?.classList.toggle('active', isVisible);
  }
});
missionScenarios.init();

btnMissions?.addEventListener('click', () => {
  missionScenarios.toggle();
});

function updateWormholeHUD(state) {
  const distanceEl = document.getElementById('value-distance');
  const warpEl = document.getElementById('value-warp');
  const exoticEl = document.getElementById('value-exotic');
  const throatRadiusEl = document.getElementById('value-throat-radius');

  // Distance with unit conversion
  if (distanceEl && state.r_normalized !== undefined) {
    const converted = unitsConverter.convertDistance(state.r_normalized, 'distance');
    sanitize.setText(distanceEl, converted.value);
    const distanceUnit = distanceEl.parentElement.querySelector('.data-unit');
    if (distanceUnit) {
      sanitize.setText(distanceUnit, converted.unit);
    }
  }
  
  // Warp strength
  if (warpEl) sanitize.setText(warpEl, (state.warpStrength * 100).toFixed(0));
  
  // Exotic matter
  if (exoticEl) sanitize.setText(exoticEl, state.exoticMatter < 0 ? 'Required' : 'Not Required');
  
  // Throat radius with unit conversion
  if (throatRadiusEl) {
    const converted = unitsConverter.convertThroatRadius();
    sanitize.setText(throatRadiusEl, converted.value);
    const throatUnit = throatRadiusEl.parentElement.querySelector('.data-unit');
    if (throatUnit) {
      sanitize.setText(throatUnit, converted.unit);
    }
  }
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

  // Update performance monitor
  const currentFPS = performanceMonitor.update();
  
  // Update observer frame
  currentObserverFrame.update(0.016, wormholeScene.state);
  
  // Update experiments lab
  experimentsLab.update(0.016);
  
  // Update guided journey (if active)
  if (guidedJourney.isJourneyActive()) {
    const currentDistance = controls.getDistance();
    guidedJourney.update(time, currentDistance);
  }

  spaceBackground.update(time);
  wormholeScene.update(time);

  const rawState = wormholeScene.getState();
  const safeState = sanitizeState(
    {
      ...rawState,
      r0: wormholeScene.physics.r0,
      distanceRatio: rawState.r_normalized,
      fps: currentFPS,
      observerFrame: currentObserverFrame.getName(),
      observerFrameVelocity: currentObserverFrame.getVelocity()
    },
    'wormhole'
  );
  wormholeScene.state = { ...rawState, ...safeState, r_normalized: safeState.distanceRatio ?? rawState.r_normalized };
  wormholeScene.state.viewMode = wormholeScene.getViewMode();
  wormholeScene.setPerformanceContext({ fps: currentFPS, isMobile: isMobileOrTablet });
  updateWormholeHUD(wormholeScene.state);
  scientificMode.updateState(wormholeScene.state);

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

  // Update simulation recorder with observer frame redshift modification
  const deltaTime = 0.016; // ~60 FPS
  const baseRedshift = wormholeScene.state?.redshift !== undefined ? wormholeScene.state.redshift : 0;
  const observerRedshift = currentObserverFrame.getRedshiftModification(baseRedshift);
  
  const stateForRecorder = {
    ...wormholeScene.state,
    distance: wormholeScene.state?.distance || 10,
    alpha: wormholeScene.state?.alpha !== undefined ? wormholeScene.state.alpha : 1.0,
    redshift: observerRedshift,
    tidalForce: wormholeScene.state?.tidalForce || 0,
    warpStrength: wormholeScene.state?.warpStrength || 0,
    throatRadius: wormholeScene.physics.r0 || 5,
    isWormhole: true
  };
  simulationRecorder.update(deltaTime, stateForRecorder);

  // Render timeline if visible
  if (timelinePanel && timelinePanel.style.display !== 'none' && timelineCtx) {
    const mapProperty = {
      distance: 'distance',
      warpStrength: 'warpStrength',
      alpha: 'alpha'
    }[currentGraphType] || 'distance';

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
const INTRO_FLY_IN_KEY = 'wormhole-intro-flyIn-done';
if (!localStorage.getItem(INTRO_FLY_IN_KEY)) {
  localStorage.setItem(INTRO_FLY_IN_KEY, 'true');
  
  // Start with camera far away
  const cameraController = wormholeScene.getCameraController();
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

// Setup page load fade-in transition
navigationHelper.setupPageLoadFadeIn();
