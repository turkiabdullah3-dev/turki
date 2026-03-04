import * as THREE from 'three';
import { BlackHolePhysics } from '../utils/physics.js';
import { RealisticBlackHoleRenderer } from '../utils/realisticRenderer.js';
import { BlackHoleEquationDisplay } from '../utils/equationCards.js';
import { BlackHoleHUDPanel } from '../utils/hudPhysics.js';
import { DualClockDisplay } from '../utils/dualClock.js';
import { createStarfield, lerp, easeInOutCubic, formatDistance, formatValue } from '../utils/helpers.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class BlackHoleScene {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.physics = new BlackHolePhysics(10); // 10 solar masses
    this.stage = 'distant'; // distant, approach, firstPerson
    this.zoomProgress = 0;
    this.isZooming = false;
    this.zoomDirection = 1;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.starfield = null;
    this.visualizer = null;
    this.realisticRenderer = null;
    this.photonRing = null;
    this.equationDisplay = null;
    this.hudPhysicsPanel = null;
    this.dualClock = null;
    this.animationFrameId = null;
    this.composer = null;
    this.bloomPass = null;
    this.usePostProcessing = false;
    this.frameCounter = 0;
    this.lastFrameTime = performance.now();
    this.lastHudUpdateTime = 0;
    this.hudUpdateIntervalMs = this.isMobile ? 200 : 120; // تقليل تحديث HUD لتحسين الأداء
    this.handleResize = null;
    this.handleKeyDown = null;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    this.element = this.createDOM();
    this.initThree();
    this.setupEventListeners();
    this.animate();
  }

  createDOM() {
    const page = document.createElement('div');
    page.className = 'experience-page';
    
    const sceneContainer = document.createElement('div');
    sceneContainer.className = 'scene-container';
    
    const canvas = document.createElement('canvas');
    sceneContainer.appendChild(canvas);
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => this.callbacks.onBack());
    sceneContainer.appendChild(backBtn);
    
    // Control panel
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    
    this.zoomOutBtn = document.createElement('button');
    this.zoomOutBtn.className = 'control-button active';
    this.zoomOutBtn.textContent = 'Distant View';
    this.zoomOutBtn.addEventListener('click', () => this.zoomTo('distant'));
    
    this.zoomInBtn = document.createElement('button');
    this.zoomInBtn.className = 'control-button';
    this.zoomInBtn.textContent = 'Approach';
    this.zoomInBtn.addEventListener('click', () => this.zoomTo('approach'));
    
    this.fpBtn = document.createElement('button');
    this.fpBtn.className = 'control-button';
    this.fpBtn.textContent = 'First Person';
    this.fpBtn.addEventListener('click', () => this.zoomTo('firstPerson'));
    
    controlPanel.appendChild(this.zoomOutBtn);
    controlPanel.appendChild(this.zoomInBtn);
    controlPanel.appendChild(this.fpBtn);
    sceneContainer.appendChild(controlPanel);
    
    // HUD Panel
    const hudPanel = document.createElement('div');
    hudPanel.className = 'hud-panel';
    
    const hudTitle = document.createElement('div');
    hudTitle.className = 'hud-title';
    hudTitle.textContent = 'Black Hole Physics';
    hudPanel.appendChild(hudTitle);
    
    // Schwarzschild Radius Card
    const schwarzchildCard = document.createElement('div');
    schwarzchildCard.className = 'physics-card';
    
    const schwarzchildLabel = document.createElement('div');
    schwarzchildLabel.className = 'physics-label';
    schwarzchildLabel.textContent = 'Schwarzschild Radius';
    schwarzchildCard.appendChild(schwarzchildLabel);
    
    const schwarzchildEq = document.createElement('div');
    schwarzchildEq.className = 'physics-equation';
    schwarzchildEq.innerHTML = 'r<sub>s</sub> = 2GM/c<sup>2</sup>';
    schwarzchildCard.appendChild(schwarzchildEq);
    
    const schwarzchildValue = document.createElement('div');
    schwarzchildValue.className = 'physics-value';
    schwarzchildValue.textContent = `${formatDistance(this.physics.schwarzschildRadius)}`;
    schwarzchildCard.appendChild(schwarzchildValue);
    
    const schwarzchildDesc = document.createElement('div');
    schwarzchildDesc.className = 'physics-description';
    schwarzchildDesc.textContent = 'Event horizon radius. The point of no return.';
    schwarzchildCard.appendChild(schwarzchildDesc);
    
    hudPanel.appendChild(schwarzchildCard);
    
    // Time Dilation Card
    const dilationCard = document.createElement('div');
    dilationCard.className = 'physics-card';
    
    const dilationLabel = document.createElement('div');
    dilationLabel.className = 'physics-label';
    dilationLabel.textContent = 'Time Dilation';
    dilationCard.appendChild(dilationLabel);
    
    const dilationEq = document.createElement('div');
    dilationEq.className = 'physics-equation';
    dilationEq.innerHTML = 'α(r) = √(1 - r<sub>s</sub>/r)';
    dilationCard.appendChild(dilationEq);
    
    this.dilationValue = document.createElement('div');
    this.dilationValue.className = 'physics-value';
    this.dilationValue.textContent = '1.000';
    dilationCard.appendChild(this.dilationValue);
    
    const dilationDesc = document.createElement('div');
    dilationDesc.className = 'physics-description';
    dilationDesc.textContent = 'Ratio of proper time to coordinate time. Approaches 0 at event horizon.';
    dilationCard.appendChild(dilationDesc);
    
    hudPanel.appendChild(dilationCard);
    
    // Gravitational Redshift Card
    const redshiftCard = document.createElement('div');
    redshiftCard.className = 'physics-card';
    
    const redshiftLabel = document.createElement('div');
    redshiftLabel.className = 'physics-label';
    redshiftLabel.textContent = 'Gravitational Redshift';
    redshiftCard.appendChild(redshiftLabel);
    
    const redshiftEq = document.createElement('div');
    redshiftEq.className = 'physics-equation';
    redshiftEq.innerHTML = 'z ≈ 1/(√(1 - r<sub>s</sub>/r)) - 1';
    redshiftCard.appendChild(redshiftEq);
    
    this.redshiftValue = document.createElement('div');
    this.redshiftValue.className = 'physics-value';
    this.redshiftValue.textContent = '0.000';
    redshiftCard.appendChild(this.redshiftValue);
    
    const redshiftDesc = document.createElement('div');
    redshiftDesc.className = 'physics-description';
    redshiftDesc.textContent = 'Wavelength shift from gravity well. Visual correlation with screen tint.';
    redshiftCard.appendChild(redshiftDesc);
    
    hudPanel.appendChild(redshiftCard);
    
    // Distance indicator
    const distanceCard = document.createElement('div');
    distanceCard.className = 'physics-card';
    
    const distanceLabel = document.createElement('div');
    distanceLabel.className = 'physics-label';
    distanceLabel.textContent = 'Current Distance';
    distanceCard.appendChild(distanceLabel);
    
    this.distanceValue = document.createElement('div');
    this.distanceValue.className = 'physics-value';
    this.distanceValue.textContent = '∞';
    distanceCard.appendChild(this.distanceValue);
    
    hudPanel.appendChild(distanceCard);
    
    sceneContainer.appendChild(hudPanel);
    
    page.appendChild(sceneContainer);
    
    this.canvas = canvas;
    this.hudPanel = hudPanel;
    return page;
  }

  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      100000
    );
    this.camera.position.set(0, 100, 500);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.syncRendererSize(true);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    this.usePostProcessing = false;
    
    // Enhanced rendering
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Starfield
    const starfieldGeometry = createStarfield(this.isMobile ? 500 : 1500, 1000);
    const starfieldMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9
    });
    this.starfield = new THREE.Points(starfieldGeometry, starfieldMaterial);
    this.scene.add(this.starfield);
    
    // Create realistic black hole visualization
    this.realisticRenderer = new RealisticBlackHoleRenderer(this.scene, this.physics);
    
    // Lighting - stronger for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff9900, 1.2, 1200);
    pointLight.position.set(0, 80, 220);
    this.scene.add(pointLight);
    
    // Post-processing
    if (this.usePostProcessing) {
      this.setupPostProcessing();
    }

    // Initialize equation card display system with scene element links
    const sceneElements = {
      photonRing: this.realisticRenderer?.components?.photonRing?.mesh || null,
      accretionDisk: this.realisticRenderer?.components?.accretionDisk?.mesh || null
    };
    this.equationDisplay = new BlackHoleEquationDisplay(document.body, this.physics, sceneElements);

    // Initialize physics data HUD panel
    this.hudPhysicsPanel = new BlackHoleHUDPanel(document.body, this.physics);

    // Initialize dual clock display
    this.dualClock = new DualClockDisplay(document.body, this.physics);

    this.handleResize = () => this.onWindowResize();
    window.addEventListener('resize', this.handleResize);
  }

  createBlackHole() {
    // Removed - now using RealisticBlackHoleRenderer
  }

  createAccretionDisk() {
    // Removed - now using RealisticBlackHoleRenderer
  }

  setupEventListeners() {
    this.handleKeyDown = (e) => {
      if (e.key === '1') this.zoomTo('distant');
      if (e.key === '2') this.zoomTo('approach');
      if (e.key === '3') this.zoomTo('firstPerson');
    };
    document.addEventListener('keydown', this.handleKeyDown);
  }

  zoomTo(newStage) {
    if (this.stage === newStage || this.isZooming) return;
    
    this.isZooming = true;
    const stageIndex = { distant: 0, approach: 1, firstPerson: 2 };
    const currentIndex = stageIndex[this.stage];
    const newIndex = stageIndex[newStage];
    
    this.zoomDirection = newIndex > currentIndex ? 1 : -1;
    this.stage = newStage;
    
    // Update UI
    this.zoomOutBtn.classList.remove('active');
    this.zoomInBtn.classList.remove('active');
    this.fpBtn.classList.remove('active');
    
    if (newStage === 'distant') this.zoomOutBtn.classList.add('active');
    if (newStage === 'approach') this.zoomInBtn.classList.add('active');
    if (newStage === 'firstPerson') this.fpBtn.classList.add('active');
  }

  updatePhysicsDisplay(cameraDistance, deltaSeconds = 0.016) {
    const safeDistance = Number.isFinite(cameraDistance) && cameraDistance > 0 ? cameraDistance : 1;
    const timeDilation = this.physics.getTimeDilationFactor(cameraDistance);
    const redshift = this.physics.getRedshift(cameraDistance);
    const metrics = this.physics.getMetricsAtRadius(safeDistance);
    
    this.dilationValue.textContent = formatValue(timeDilation);
    this.redshiftValue.textContent = formatValue(redshift);
    
    if (safeDistance > this.physics.schwarzschildRadius * 100) {
      this.distanceValue.textContent = formatDistance(safeDistance);
    } else {
      this.distanceValue.textContent = formatDistance(this.physics.schwarzschildRadius * 100);
    }

    // Update equation card display with live physics values
    if (this.equationDisplay) {
      this.equationDisplay.updateByDistance(safeDistance);
    }

    // Update physics data panel
    if (this.hudPhysicsPanel) {
      this.hudPhysicsPanel.update(metrics, safeDistance);
    }

    // Update dual clock system
    if (this.dualClock) {
      this.dualClock.update(safeDistance, deltaSeconds);
    }
  }

  syncRendererSize(force = false) {
    if (!this.renderer || !this.camera || !this.canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const displayHeight = Math.max(1, this.canvas.clientHeight || window.innerHeight);

    const resized = force || this.renderer.domElement.width !== Math.floor(displayWidth * dpr) || this.renderer.domElement.height !== Math.floor(displayHeight * dpr);
    if (!resized) return;

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(displayWidth, displayHeight, false);
    this.camera.aspect = displayWidth / displayHeight;
    this.camera.updateProjectionMatrix();
  }

  animate(now = performance.now()) {
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
    const deltaSeconds = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.frameCounter % 30 === 0) {
      this.syncRendererSize();
    }
    
    // Smooth zoom animation
    if (this.isZooming) {
      this.zoomProgress += 0.02 * this.zoomDirection;
      
      if ((this.zoomDirection > 0 && this.zoomProgress >= 1) || 
          (this.zoomDirection < 0 && this.zoomProgress <= 0)) {
        this.zoomProgress = Math.max(0, Math.min(1, this.zoomProgress));
        this.isZooming = false;
      }
      
      this.zoomProgress = Math.max(0, Math.min(1, this.zoomProgress));
    }
    
    // Calculate camera position based on stage
    let targetDistance, targetYaw, targetPitch;
    
    if (this.stage === 'distant') {
      targetDistance = 420;
      targetYaw = 0.3;
      targetPitch = 0.2;
    } else if (this.stage === 'approach') {
      targetDistance = 260;
      targetYaw = 0.1;
      targetPitch = 0.05;
    } else {
      targetDistance = 160;
      targetYaw = 0;
      targetPitch = 0;
    }
    
    // Smooth camera movement
    if (!this.currentDistance) this.currentDistance = this.camera.position.z;
    this.currentDistance += (targetDistance - this.currentDistance) * 0.1;
    
    // Update camera
    const dist = this.currentDistance;
    this.camera.position.x = Math.sin(targetYaw) * Math.cos(targetPitch) * dist;
    this.camera.position.y = Math.sin(targetPitch) * dist;
    this.camera.position.z = Math.cos(targetYaw) * Math.cos(targetPitch) * dist;
    this.camera.lookAt(0, 0, 0);
    
    if (now - this.lastHudUpdateTime >= this.hudUpdateIntervalMs) {
      this.updatePhysicsDisplay(dist, deltaSeconds);
      this.lastHudUpdateTime = now;
    }
    
    // Update realistic renderer
    if (this.realisticRenderer) {
      this.realisticRenderer.update(this.frameCounter * 0.016);
    }
    
    // Update starfield based on proximity
    if (this.starfield) {
      const scale = 1 + (1 - this.zoomProgress * 0.5);
      this.starfield.scale.set(scale, scale, scale);
    }
    
    this.frameCounter++;

    this.renderer.render(this.scene, this.camera);
  }
  
  setupPostProcessing() {
    // Composer
    this.composer = new EffectComposer(this.renderer);
    
    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Bloom pass (lightweight)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.isMobile ? 0.25 : 0.45,
      0.35,
      0.55
    );
    this.composer.addPass(this.bloomPass);
  }

  onWindowResize() {
    if (this.camera && this.renderer) {
      this.syncRendererSize(true);
      
      if (this.composer) {
        const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
        const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
        this.composer.setSize(width, height);
      }
    }
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
      this.handleResize = null;
    }
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown);
      this.handleKeyDown = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.equationDisplay) {
      this.equationDisplay.dispose();
    }
    if (this.hudPhysicsPanel) {
      this.hudPhysicsPanel.dispose();
    }
    if (this.dualClock) {
      this.dualClock.dispose();
    }
    if (this.realisticRenderer) {
      this.realisticRenderer.dispose();
    }
  }
}
