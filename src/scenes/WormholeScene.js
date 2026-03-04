import * as THREE from 'three';
import { WormholePhysics } from '../utils/physics.js';
import { RealisticWormholeRenderer } from '../utils/realisticWormholeRenderer.js';
import { WormholeEquationDisplay } from '../utils/equationCards.js';
import { WormholeHUDPanel } from '../utils/hudPhysics.js';
import { WormholeEmbeddingDiagram } from '../utils/embeddingDiagram.js';
import { 
  PhysicsValidator, 
  ShaderValueSanitizer,
  PhysicsWatchdog,
  safeNumber,
  clamp
} from '../utils/safePhysics.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class WormholeScene {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.physics = new WormholePhysics(1.5);
    this.mode = 'external'; // external or internal
    this.throatRadius = 1.5;
    this.modeProgress = 0;
    this.cameraRotation = 0;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.starfield = null;
    this.visualizer = null;
    this.realisticRenderer = null;
    this.equationDisplay = null;
    this.hudPhysicsPanel = null;
    this.embeddingDiagram = null;
    this.animationFrameId = null;
    this.composer = null;
    this.bloomPass = null;
    this.tunnelMesh = null;
    this.usePostProcessing = false;
    this.frameCounter = 0;
    this.lastFrameTime = performance.now();
    this.lastHudUpdateTime = 0;
    this.hudUpdateIntervalMs = this.isMobile ? 300 : 200; // تقليل تحديث HUD لتحسين الأداء
    this.handleResize = null;
    this.handleMouseMove = null;
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
    sceneContainer.className = 'scene-container scene-cosmic-bg';
    this.sceneContainer = sceneContainer;
    
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
    
    this.externalBtn = document.createElement('button');
    this.externalBtn.className = 'control-button active';
    this.externalBtn.textContent = 'External View';
    this.externalBtn.addEventListener('click', () => this.setMode('external'));
    
    this.internalBtn = document.createElement('button');
    this.internalBtn.className = 'control-button';
    this.internalBtn.textContent = 'Internal View';
    this.internalBtn.addEventListener('click', () => this.setMode('internal'));
    
    controlPanel.appendChild(this.externalBtn);
    controlPanel.appendChild(this.internalBtn);
    sceneContainer.appendChild(controlPanel);
    
    // HUD Panel
    const hudPanel = document.createElement('div');
    hudPanel.className = 'hud-panel';
    
    const hudTitle = document.createElement('div');
    hudTitle.className = 'hud-title';
    hudTitle.textContent = 'Wormhole Physics';
    hudPanel.appendChild(hudTitle);
    
    // Morris-Thorne Metric Card
    const metricCard = document.createElement('div');
    metricCard.className = 'physics-card';
    
    const metricLabel = document.createElement('div');
    metricLabel.className = 'physics-label';
    metricLabel.textContent = 'Morris-Thorne Metric';
    metricCard.appendChild(metricLabel);
    
    const metricEq = document.createElement('div');
    metricEq.className = 'physics-equation';
    metricEq.innerHTML = 'ds² = -c²dt² + dr²/(1-b(r)/r) + r²dΩ²';
    metricCard.appendChild(metricEq);
    
    const metricDesc = document.createElement('div');
    metricDesc.className = 'physics-description';
    metricDesc.textContent = 'A theoretical spacetime geometry allowing traversable shortcuts through space.';
    metricCard.appendChild(metricDesc);
    
    hudPanel.appendChild(metricCard);
    
    // Shape Function Card
    const shapeCard = document.createElement('div');
    shapeCard.className = 'physics-card';
    
    const shapeLabel = document.createElement('div');
    shapeLabel.className = 'physics-label';
    shapeLabel.textContent = 'Throat Radius';
    shapeCard.appendChild(shapeLabel);
    
    const shapeEq = document.createElement('div');
    shapeEq.className = 'physics-equation';
    shapeEq.innerHTML = 'b(r) = r₀²/r';
    shapeCard.appendChild(shapeEq);
    
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    
    const sliderLabel = document.createElement('label');
    sliderLabel.className = 'slider-label';
    sliderLabel.textContent = 'Adjust Throat Radius';
    sliderContainer.appendChild(sliderLabel);
    
    this.throatSlider = document.createElement('input');
    this.throatSlider.type = 'range';
    this.throatSlider.className = 'slider';
    this.throatSlider.min = '0.5';
    this.throatSlider.max = '3';
    this.throatSlider.step = '0.1';
    this.throatSlider.value = '1.5';
    this.throatSlider.addEventListener('input', (e) => this.updateThroat(parseFloat(e.target.value)));
    sliderContainer.appendChild(this.throatSlider);
    
    this.throatValueDisplay = document.createElement('div');
    this.throatValueDisplay.className = 'slider-value';
    this.throatValueDisplay.textContent = '1.50';
    sliderContainer.appendChild(this.throatValueDisplay);
    
    shapeCard.appendChild(sliderContainer);
    
    hudPanel.appendChild(shapeCard);
    
    // Stability Card
    const stabilityCard = document.createElement('div');
    stabilityCard.className = 'physics-card';
    
    const stabilityLabel = document.createElement('div');
    stabilityLabel.className = 'physics-label';
    stabilityLabel.textContent = 'Stability Condition';
    stabilityCard.appendChild(stabilityLabel);
    
    const stabilityEq = document.createElement('div');
    stabilityEq.className = 'physics-equation';
    stabilityEq.innerHTML = 'ρ + p<sub>r</sub> < 0';
    stabilityCard.appendChild(stabilityEq);
    
    this.stabilityValue = document.createElement('div');
    this.stabilityValue.className = 'physics-value';
    this.stabilityValue.textContent = '0.74';
    stabilityCard.appendChild(this.stabilityValue);
    
    const stabilityDesc = document.createElement('div');
    stabilityDesc.className = 'physics-description';
    stabilityDesc.textContent = 'Stability metric (0-1). Higher values require less exotic matter.';
    stabilityCard.appendChild(stabilityDesc);
    
    hudPanel.appendChild(stabilityCard);
    
    sceneContainer.appendChild(hudPanel);
    
    page.appendChild(sceneContainer);
    
    this.canvas = canvas;
    return page;
  }

  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.camera.position.z = 300;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.syncRendererSize(true);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    this.usePostProcessing = false;
    
    // Enhanced rendering with bloom-like effect
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Create realistic wormhole visualization
    this.realisticRenderer = new RealisticWormholeRenderer(this.physics, this.scene);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x00d9ff, 0.35);
    this.scene.add(ambientLight);
    
    // Post-processing
    if (this.usePostProcessing) {
      this.setupPostProcessing();
    }

    // Initialize equation card display system with scene element links
    const sceneElements = {
      throat: this.tunnelMesh, // Tunnel represents wormhole throat
      galaxies: null
    };
    this.equationDisplay = new WormholeEquationDisplay(document.body, this.physics, sceneElements);

    // Initialize physics data HUD panel
    this.hudPhysicsPanel = new WormholeHUDPanel(document.body, this.physics);

    // Initialize embedding diagram (hidden by default in internal mode)
    this.embeddingDiagram = new WormholeEmbeddingDiagram(this.physics, this.scene);
    this.embeddingDiagram.setVisible(true); // Visible in external view

    this.handleResize = () => this.onWindowResize();
    window.addEventListener('resize', this.handleResize);
  }

  createWormhole() {
    // Galaxy 1 (left)
    this.createGalaxy(new THREE.Vector3(-400, 0, 0), 0);
    
    // Galaxy 2 (right)
    this.createGalaxy(new THREE.Vector3(400, 0, 0), Math.PI);
    
    // Wormhole tunnel
    this.createTunnel();
  }

  createGalaxy(position, rotationZ) {
    // Simple galaxy disk representation
    const galaxyGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    const galaxyParticleCount = this.isMobile ? 200 : 350;
    for (let i = 0; i < galaxyParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 100 + 20;
      const z = (Math.random() - 0.5) * 40;
      
      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z
      );
      
      const colorType = Math.random();
      if (colorType < 0.7) {
        colors.push(0.8, 0.8, 1);
      } else if (colorType < 0.85) {
        colors.push(1, 0.6, 0.3);
      } else {
        colors.push(0.5, 0.5, 1);
      }
    }
    
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    
    const galaxyMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9
    });
    
    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    galaxy.position.copy(position);
    galaxy.rotation.z = rotationZ;
    this.scene.add(galaxy);
  }

  createTunnel() {
    // Lightweight tunnel geometry + shader illusion
    const tubeGeometry = new THREE.CylinderGeometry(60, 60, 900, this.isMobile ? 12 : 16, 1, true);
    
    const tunnelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x7d00ff) }, // Purple
        color2: { value: new THREE.Color(0x00d9ff) }  // Cyan
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          float noiseLike = sin((vUv.y * 26.0) - time * 2.6) * 0.12;
          float gradient = fract(vUv.y + noiseLike - time * 0.25);
          vec3 color = mix(color1, color2, gradient);

          float flowLine = 0.5 + 0.5 * sin((vUv.y * 90.0) - time * 8.0);
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
          vec3 glowColor = color * fresnel * 1.6;

          vec3 finalColor = color * (0.75 + flowLine * 0.35) + glowColor;
          
          gl_FragColor = vec4(finalColor, 0.72);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.tunnelMesh = new THREE.Mesh(tubeGeometry, tunnelMaterial);
    this.tunnelMesh.rotation.z = Math.PI / 2;
    this.scene.add(this.tunnelMesh);
    
    // Add energy particles flowing through tunnel
    this.createEnergyParticles();
  }
  
  createEnergyParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    
    const energyCount = this.isMobile ? 60 : 120;
    for (let i = 0; i < energyCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 45 + Math.random() * 30;
      const z = (Math.random() - 0.5) * 800;
      
      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z
      );
      
      // Cyan-purple gradient
      const t = Math.random();
      colors.push(
        0.49 * (1 - t) + 0.0 * t,  // R
        0.85 * (1 - t) + 0.82 * t,  // G
        1.0 * (1 - t) + 1.0 * t     // B
      );
      
      sizes.push(2 + Math.random() * 3);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    
    this.energyParticles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.energyParticles);
  }

  createCurve() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-400, 0, -400),
      new THREE.Vector3(-200, 0, -200),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(200, 0, 200),
      new THREE.Vector3(400, 0, 400)
    ]);
    return curve;
  }

  setupEventListeners() {
    this.handleMouseMove = (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    
    this.handleKeyDown = (e) => {
      if (e.key === '1') this.setMode('external');
      if (e.key === '2') this.setMode('internal');
    };
    document.addEventListener('keydown', this.handleKeyDown);
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    
    this.mode = newMode;
    
    this.externalBtn.classList.remove('active');
    this.internalBtn.classList.remove('active');
    
    if (newMode === 'external') {
      this.externalBtn.classList.add('active');
      // Show embedding diagram in external view
      if (this.embeddingDiagram) {
        this.embeddingDiagram.setVisible(true);
      }
    } else {
      this.internalBtn.classList.add('active');
      // Hide embedding diagram in internal view (tunnel mode)
      if (this.embeddingDiagram) {
        this.embeddingDiagram.setVisible(false);
      }
    }
  }

  updateThroat(radius) {
    this.throatRadius = radius;
    this.physics.setThroatRadius(radius);
    
    // Sanitize displayed values
    const safeRadius = safeNumber(radius, 1.5);
    const safeStability = safeNumber(this.physics.stability, 0.5);
    
    this.throatValueDisplay.textContent = safeRadius.toFixed(2);
    this.stabilityValue.textContent = clamp(safeStability, 0, 1).toFixed(2);
    
    // Rebuild tunnel with new radius
    if (this.tunnelLine) this.scene.remove(this.tunnelLine);
    if (this.tunnelMesh) this.scene.remove(this.tunnelMesh);
    this.createTunnel();
    
    // Update embedding diagram
    if (this.embeddingDiagram) {
      this.embeddingDiagram.updateThroatRadius(safeRadius);
    }
  }

  animate(now = performance.now()) {
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
    const deltaSeconds = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.frameCounter % 30 === 0) {
      this.syncRendererSize();
    }
    
    if (this.mode === 'external') {
      // Rotate around wormhole
      this.cameraRotation += 0.002;
      const distance = 400;
      const height = 50;
      
      this.camera.position.x = Math.cos(this.cameraRotation) * distance;
      this.camera.position.y = Math.sin(this.cameraRotation * 0.3) * height;
      this.camera.position.z = Math.sin(this.cameraRotation) * distance;
      
      this.camera.lookAt(0, 0, 0);
    } else {
      // Internal: moving through tunnel
      const speed = 5;
      if (!this.tunnelProgress) this.tunnelProgress = 0;
      
      this.tunnelProgress += speed;
      if (this.tunnelProgress > 800) this.tunnelProgress = 0;
      
      const z = this.tunnelProgress - 400;
      const wobble = Math.sin(this.tunnelProgress * 0.05) * 20;
      
      this.camera.position.set(wobble, 0, z);
      this.camera.lookAt(0, 0, z + 100);
    }
    
    // Update tunnel shader
    if (this.tunnelMesh && this.tunnelMesh.material.uniforms) {
      this.tunnelMesh.material.uniforms.time.value += deltaSeconds * 0.6;
      this.tunnelMesh.rotation.z += deltaSeconds * 0.06;
    }

    const cameraDistance = this.camera.position.length();
    const safeDistance = Number.isFinite(cameraDistance) ? Math.max(1, cameraDistance) : 1;

    // Update equation display based on camera position
    if (this.equationDisplay && now - this.lastHudUpdateTime >= this.hudUpdateIntervalMs) {
      this.equationDisplay.updateByDistance(safeDistance);
    }

    // Update physics data panel
    if (this.hudPhysicsPanel && now - this.lastHudUpdateTime >= this.hudUpdateIntervalMs) {
      const radiusForMetrics = Math.max(this.physics.throatRadius, Math.abs(this.camera.position.z), 1);
      const metrics = this.physics.getMetricsAtRadius(radiusForMetrics);
      this.hudPhysicsPanel.update(metrics);
    }

    if (now - this.lastHudUpdateTime >= this.hudUpdateIntervalMs) {
      this.lastHudUpdateTime = now;
    }
    
    const heavyUpdateFrame = this.frameCounter % (this.isMobile ? 3 : 2) === 0;

    // Update embedding diagram (throttled)
    if (this.embeddingDiagram && heavyUpdateFrame) {
      this.embeddingDiagram.update(this.frameCounter * 0.01);
    }

    // Update realistic renderer (throttled)
    if (this.realisticRenderer && heavyUpdateFrame) {
      this.realisticRenderer.update(this.frameCounter * 0.01);
    }

    // Lightweight CSS background parallax
    if (this.sceneContainer && heavyUpdateFrame) {
      const bgShiftX = Math.sin(this.frameCounter * 0.004) * 4;
      const bgShiftY = Math.cos(this.frameCounter * 0.003) * 3;
      this.sceneContainer.style.backgroundPosition = `${50 + bgShiftX}% ${50 + bgShiftY}%`;
    }
    
    this.frameCounter++;

    // Animate energy particles (heavily throttled)
    if (this.energyParticles && this.frameCounter % (this.isMobile ? 4 : 3) === 0) {
      const positions = this.energyParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += 1.5; // Move along z-axis
        if (positions[i + 2] > 400) {
          positions[i + 2] = -400; // Reset
        }
      }
      this.energyParticles.geometry.attributes.position.needsUpdate = true;
      this.energyParticles.rotation.z += 0.002;
    }
    
    // Render with composer at reduced frequency
    if (this.composer && this.frameCounter % 2 === 0) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  setupPostProcessing() {
    // Composer
    this.composer = new EffectComposer(this.renderer);
    
    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Bloom pass for glowing effects
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.isMobile ? 0.25 : 0.4,
      0.3,
      0.6
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

  syncRendererSize(force = false) {
    if (!this.renderer || !this.camera || !this.canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 0.8 : 1);
    const displayWidth = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const displayHeight = Math.max(1, this.canvas.clientHeight || window.innerHeight);

    const resized = force || this.renderer.domElement.width !== Math.floor(displayWidth * dpr) || this.renderer.domElement.height !== Math.floor(displayHeight * dpr);
    if (!resized) return;

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(displayWidth, displayHeight, false);
    this.camera.aspect = displayWidth / displayHeight;
    this.camera.updateProjectionMatrix();
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
    if (this.handleMouseMove) {
      document.removeEventListener('mousemove', this.handleMouseMove);
      this.handleMouseMove = null;
    }
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown);
      this.handleKeyDown = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (material.map) material.map.dispose();
            if (material.alphaMap) material.alphaMap.dispose();
            material.dispose();
          });
        }
      });
    }
    if (this.equationDisplay) {
      this.equationDisplay.dispose();
    }
    if (this.hudPhysicsPanel) {
      this.hudPhysicsPanel.dispose();
    }
    if (this.embeddingDiagram) {
      this.embeddingDiagram.dispose();
    }
    if (this.realisticRenderer) {
      this.realisticRenderer.dispose();
    }
  }
}
