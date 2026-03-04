import * as THREE from 'three';
import { WormholePhysics } from '../utils/physics.js';
import { 
  PhysicsValidator, 
  ShaderValueSanitizer,
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
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.animationFrameId = null;
    this.composer = null;
    this.bloomPass = null;
    this.tunnelMesh = null;
    this.particles = null;
    
    // State
    this.cameraRotation = 0;
    this.mode = 'external'; // external or internal
    this.tunnelProgress = 0;
    
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
    sceneContainer.style.cssText = `
      width: 100%;
      height: 100vh;
      position: relative;
      background: #000;
      overflow: hidden;
    `;
    this.sceneContainer = sceneContainer;
    
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      display: block;
      width: 100%;
      height: 100%;
    `;
    this.canvas = canvas;
    sceneContainer.appendChild(canvas);
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button';
    backBtn.textContent = '← العودة';
    backBtn.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 10px 20px;
      background: rgba(0, 217, 255, 0.3);
      color: #00d9ff;
      border: 1px solid #00d9ff;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      z-index: 100;
    `;
    backBtn.addEventListener('click', () => this.callbacks.onBack());
    sceneContainer.appendChild(backBtn);
    
    // Mode toggle button
    const modeBtn = document.createElement('button');
    modeBtn.className = 'mode-button';
    modeBtn.textContent = '🔄 Internal View';
    modeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: rgba(255, 107, 157, 0.3);
      color: #ff6b9d;
      border: 1px solid #ff6b9d;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      z-index: 100;
    `;
    modeBtn.addEventListener('click', () => this.toggleMode());
    sceneContainer.appendChild(modeBtn);
    
    page.appendChild(sceneContainer);
    return page;
  }

  initThree() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.camera.position.z = 300;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x00d9ff, 0.5);
    this.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff6b9d, 0.8);
    pointLight.position.set(100, 100, 100);
    this.scene.add(pointLight);
    
    // Create wormhole visualization
    this.createWormholeGeometry();
  }

  createWormholeGeometry() {
    // Galaxy 1 (left)
    this.createGalaxy(new THREE.Vector3(-400, 0, 0), 0);
    
    // Galaxy 2 (right)
    this.createGalaxy(new THREE.Vector3(400, 0, 0), Math.PI);
    
    // Wormhole tunnel
    this.createTunnel();
    
    // Particle field
    this.createParticles();
  }

  createGalaxy(position, rotationZ) {
    const diskGeometry = new THREE.CircleGeometry(80, 64);
    const diskMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a4d7a,
      emissive: 0x00d9ff,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    });
    
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.position.copy(position);
    disk.rotation.z = rotationZ;
    disk.receiveShadow = true;
    disk.castShadow = true;
    this.scene.add(disk);
    
    // Galaxy core
    const coreGeometry = new THREE.SphereGeometry(15, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b9d,
      emissive: 0xff6b9d,
      emissiveIntensity: 0.8
    });
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.copy(position);
    this.scene.add(core);
  }

  createTunnel() {
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(
        new THREE.Vector3(0, 0, -400),
        new THREE.Vector3(0, 0, 400)
      ),
      80,
      120,
      8,
      false
    );
    
    const tunnelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x00d9ff) },
        color2: { value: new THREE.Color(0xff6b9d) }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying float vDepth;
        
        void main() {
          vPosition = position;
          vDepth = position.z / 400.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        
        varying vec3 vPosition;
        varying float vDepth;
        
        void main() {
          float wave = sin(vPosition.z * 0.02 + time) * 0.5 + 0.5;
          vec3 finalColor = mix(color1, color2, vDepth + wave * 0.3);
          gl_FragColor = vec4(finalColor, 0.6);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.tunnelMesh = new THREE.Mesh(tubeGeometry, tunnelMaterial);
    this.scene.add(this.tunnelMesh);
  }

  createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    
    const count = 500;
    for (let i = 0; i < count; i++) {
      const z = (Math.random() - 0.5) * 800;
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 100;
      
      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z
      );
      
      velocities.push(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        2 + Math.random() * 4
      );
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 2,
      transparent: true,
      opacity: 0.6
    });
    
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.particles.userData.velocities = velocities;
    this.scene.add(this.particles);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggleMode();
      }
    });
  }

  toggleMode() {
    this.mode = this.mode === 'external' ? 'internal' : 'external';
    const modeBtn = this.sceneContainer.querySelector('.mode-button');
    if (modeBtn) {
      modeBtn.textContent = this.mode === 'external' ? '🔄 Internal View' : '🔄 External View';
    }
  }

  animate(now = performance.now()) {
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
    
    if (this.mode === 'external') {
      // Rotate around wormhole
      this.cameraRotation += 0.0015;
      const distance = 350;
      const height = 100;
      
      this.camera.position.x = Math.cos(this.cameraRotation) * distance;
      this.camera.position.y = Math.sin(this.cameraRotation * 0.5) * height;
      this.camera.position.z = Math.sin(this.cameraRotation) * distance;
      
      this.camera.lookAt(0, 0, 0);
    } else {
      // Internal: moving through tunnel
      this.tunnelProgress += 3;
      if (this.tunnelProgress > 800) this.tunnelProgress = 0;
      
      const z = this.tunnelProgress - 400;
      const wobble = Math.sin(this.tunnelProgress * 0.01) * 30;
      const sway = Math.cos(this.tunnelProgress * 0.015) * 30;
      
      this.camera.position.set(wobble, sway, z);
      this.camera.lookAt(0, 0, z + 100);
    }
    
    // Update tunnel shader
    if (this.tunnelMesh && this.tunnelMesh.material.uniforms) {
      this.tunnelMesh.material.uniforms.time.value += 0.02;
    }
    
    // Update particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      const velocities = this.particles.userData.velocities;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * 0.1;
        positions[i + 1] += velocities[i + 1] * 0.1;
        positions[i + 2] += velocities[i + 2] * 0.1;
        
        // Reset particles at back
        if (positions[i + 2] > 400) {
          positions[i + 2] = -400;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Render
    this.composer.render();
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.composer) {
      this.composer.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}
