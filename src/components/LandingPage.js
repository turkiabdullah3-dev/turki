import * as THREE from 'three';
import { createStarfield } from '../utils/helpers.js';
import { CosmicAtmosphere, CinematicCamera, CursorTrail } from '../utils/atmosphere.js';

export class LandingPage {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.blackHolePreview = null;
    this.mouse = { x: 0, y: 0 };
    this.atmosphere = null;
    this.cinematicCamera = null;
    this.cursorTrail = null;
    this.animationFrameId = null;
    this.introPlaying = true;
    this.trailCounter = 0;
    this.introStartTime = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.starParticleCount = this.isMobile ? 500 : 1500;
    
    this.element = this.createDOM();
    this.initThree();
    this.setupEventListeners();
    this.playIntroAnimation();
  }

  createDOM() {
    const page = document.createElement('div');
    page.className = 'landing-page';
    
    const canvas = document.createElement('canvas');
    canvas.className = 'landing-canvas';
    
    const content = document.createElement('div');
    content.className = 'landing-content';
    
    const title = document.createElement('h1');
    title.className = 'landing-title';
    title.textContent = 'Exploring the Geometry of Spacetime';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'landing-subtitle';
    subtitle.textContent = 'A journey through black holes and wormholes';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'landing-buttons';
    
    const blackHoleBtn = document.createElement('button');
    blackHoleBtn.className = 'glow-button';
    blackHoleBtn.textContent = 'Enter Black Hole';
    blackHoleBtn.addEventListener('click', () => this.callbacks.onBlackHoleClick());
    
    const wormholeBtn = document.createElement('button');
    wormholeBtn.className = 'glow-button';
    wormholeBtn.textContent = 'Enter Wormhole';
    wormholeBtn.addEventListener('click', () => this.callbacks.onWormholeClick());

    const equationsBtn = document.createElement('button');
    equationsBtn.className = 'glow-button';
    equationsBtn.textContent = 'Equations & How It Works';
    equationsBtn.addEventListener('click', () => this.callbacks.onEquationsClick());
    
    buttonContainer.appendChild(blackHoleBtn);
    buttonContainer.appendChild(wormholeBtn);
    buttonContainer.appendChild(equationsBtn);
    
    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(buttonContainer);
    
    page.appendChild(canvas);
    page.appendChild(content);
    
    this.canvas = canvas;
    return page;
  }

  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 5000, 10000);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.camera.position.z = 100;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: window.devicePixelRatio <= 1.25,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setClearColor(0x000000, 1);
    
    // Enhanced cinematic rendering
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Initialize cinematic atmosphere with 4-layer system
    this.atmosphere = new CosmicAtmosphere(this.scene, this.camera);
    this.cinematicCamera = new CinematicCamera(this.camera);
    this.cursorTrail = new CursorTrail(this.scene);
    
    // Black hole preview (distant focal point)
    const bhGeometry = new THREE.SphereGeometry(8, 32, 32);
    const bhMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      emissive: 0x1a1a2e,
      emissiveIntensity: 0.5
    });
    this.blackHolePreview = new THREE.Mesh(bhGeometry, bhMaterial);
    this.blackHolePreview.position.set(0, -20, -150);
    this.blackHolePreview.scale.set(0, 0, 0);
    this.scene.add(this.blackHolePreview);
    
    // Accretion disk with advanced glow
    const diskGeometry = new THREE.BufferGeometry();
    const diskPositions = [];
    const diskColors = [];
    const diskGlow = [];
    
    const diskParticleCount = this.isMobile ? 450 : 800;
    for (let i = 0; i < diskParticleCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const radius = 12 + Math.random() * 8;
      const z = (Math.random() - 0.5) * 2;
      
      diskPositions.push(
        Math.cos(angle) * radius,
        z,
        Math.sin(angle) * radius
      );
      
      const colorType = Math.random();
      if (colorType < 0.3) {
        diskColors.push(1, 0.4, 0); // Orange
      } else if (colorType < 0.6) {
        diskColors.push(1, 0.7, 0); // Yellow
      } else {
        diskColors.push(0.8, 0.2, 0); // Red
      }
      
      diskGlow.push(Math.random());
    }
    
    diskGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(diskPositions), 3));
    diskGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(diskColors), 3));
    diskGeometry.setAttribute('glow', new THREE.BufferAttribute(new Float32Array(diskGlow), 1));
    
    const diskMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0
    });
    
    const disk = new THREE.Points(diskGeometry, diskMaterial);
    disk.position.copy(this.blackHolePreview.position);
    this.scene.add(disk);
    this.previewDisk = disk;
    
    // Ambient lighting
    const ambientLight = new THREE.AmbientLight(0x0099ff, 0.1);
    this.scene.add(ambientLight);
    
    // Glow light from black hole
    const glowLight = new THREE.PointLight(0xff6600, 0, 500);
    glowLight.position.copy(this.blackHolePreview.position);
    this.scene.add(glowLight);
    this.glowLight = glowLight;
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupEventListeners() {
    const onMouseMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    const onResize = () => this.onWindowResize();
    
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
    
    this._mouseMoveListener = onMouseMove;
    this._resizeListener = onResize;
  }

  playIntroAnimation() {
    this.introStartTime = performance.now();
    this.animate(this.introStartTime);
  }

  easeInOut(progress) {
    return progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }

  updateIntroTimeline(now) {
    const elapsed = now - this.introStartTime;
    
    const scaleProgress = Math.max(0, Math.min(1, (elapsed - 1500) / 900));
    const diskProgress = Math.max(0, Math.min(1, (elapsed - 2000) / 900));
    const glowProgress = Math.max(0, Math.min(1, (elapsed - 2500) / 700));
    const contentProgress = Math.max(0, Math.min(1, (elapsed - 3000) / 800));

    const smoothScale = this.easeInOut(scaleProgress);
    const smoothDisk = this.easeInOut(diskProgress);
    const smoothGlow = this.easeInOut(glowProgress);
    const smoothContent = this.easeInOut(contentProgress);

    if (this.blackHolePreview) {
      this.blackHolePreview.scale.set(smoothScale, smoothScale, smoothScale);
    }

    if (this.previewDisk) {
      this.previewDisk.material.opacity = 0.7 * smoothDisk;
    }

    if (this.glowLight) {
      this.glowLight.intensity = 2 * smoothGlow;
    }

    const content = this.element.querySelector('.landing-content');
    if (content) {
      content.style.opacity = String(smoothContent);
    }
  }

  animate(now = performance.now()) {
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
    
    if (this.scene && this.camera && this.renderer) {
      // Update atmospheric layers
      if (this.atmosphere) {
        this.atmosphere.update(0.016);
      }

      this.updateIntroTimeline(now);
      
      // Update cursor trails
      if (this.cursorTrail) {
        this.trailCounter++;
        if (this.trailCounter % 6 === 0) {
          const trailPoint = new THREE.Vector3(this.mouse.x * 30, this.mouse.y * 18, -80);
          this.cursorTrail.addTrail(trailPoint);
        }
        this.cursorTrail.update();
      }
      
      // Cinematic camera parallax
      const targetX = this.mouse.x * 15;
      const targetY = this.mouse.y * 15;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
      this.camera.lookAt(0, 0, 0);
      
      // Rotate black hole preview with smooth animation
      if (this.blackHolePreview) {
        this.blackHolePreview.rotation.y += 0.0003;
        
        // Subtle bobbing motion
        this.blackHolePreview.position.y = -20 + Math.sin(now * 0.001) * 3;
        
        // Update glow light position
        if (this.glowLight) {
          this.glowLight.position.copy(this.blackHolePreview.position);
        }
      }
      
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    }
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    document.removeEventListener('mousemove', this._mouseMoveListener);
    window.removeEventListener('resize', this._resizeListener);
    
    if (this.atmosphere) {
      this.atmosphere.dispose();
    }
    
    if (this.cursorTrail) {
      this.cursorTrail.dispose();
    }
    
    // Dispose scene objects
    this.scene.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
