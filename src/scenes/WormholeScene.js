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
    
    // HUD Panel
    const hudPanel = document.createElement('div');
    hudPanel.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      width: 350px;
      background: rgba(0, 20, 40, 0.85);
      border: 2px solid #00d9ff;
      border-radius: 10px;
      padding: 20px;
      color: #00d9ff;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 100;
      box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
      backdrop-filter: blur(10px);
    `;
    
    hudPanel.innerHTML = `
      <div style="margin-bottom: 15px; border-bottom: 1px solid #00d9ff; padding-bottom: 10px;">
        <h3 style="margin: 0; color: #ff6b9d; font-size: 14px;">⚙️ WORMHOLE METRICS</h3>
      </div>
      <div style="display: grid; gap: 10px;">
        <div>
          <span style="color: #00d9ff;">Throat Radius (a):</span>
          <span style="color: #ff6b9d;" id="throat-radius">1.5 M</span>
        </div>
        <div>
          <span style="color: #00d9ff;">Spacetime Curvature:</span>
          <span style="color: #ff6b9d;" id="curvature">High</span>
        </div>
        <div>
          <span style="color: #00d9ff;">Time Dilation (α):</span>
          <span style="color: #ff6b9d;" id="time-dilation">0.8-1.0</span>
        </div>
        <div>
          <span style="color: #00d9ff;">Tidal Forces:</span>
          <span style="color: #ff6b9d;" id="tidal-forces">Moderate</span>
        </div>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #00d9ff; font-size: 11px; color: #00a8cc;">
        <p style="margin: 0 0 5px 0;">📐 Morris-Thorne Geometry</p>
        <p style="margin: 0;">Exotic matter required</p>
      </div>
    `;
    sceneContainer.appendChild(hudPanel);
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button';
    backBtn.textContent = '← العودة';
    backBtn.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 150, 200, 0.2));
      color: #00d9ff;
      border: 2px solid #00d9ff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      z-index: 100;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 217, 255, 0.2);
    `;
    backBtn.addEventListener('mouseover', () => {
      backBtn.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.4), rgba(0, 150, 200, 0.4))';
      backBtn.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.5)';
    });
    backBtn.addEventListener('mouseout', () => {
      backBtn.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 150, 200, 0.2))';
      backBtn.style.boxShadow = '0 0 10px rgba(0, 217, 255, 0.2)';
    });
    backBtn.addEventListener('click', () => this.callbacks.onBack());
    sceneContainer.appendChild(backBtn);
    
    // Mode toggle button
    const modeBtn = document.createElement('button');
    modeBtn.className = 'mode-button';
    modeBtn.textContent = '🔄 نمط داخلي';
    modeBtn.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 50, 100, 0.2));
      color: #ff6b9d;
      border: 2px solid #ff6b9d;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      z-index: 100;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 107, 157, 0.2);
    `;
    modeBtn.addEventListener('mouseover', () => {
      modeBtn.style.background = 'linear-gradient(135deg, rgba(255, 107, 157, 0.4), rgba(255, 50, 100, 0.4))';
      modeBtn.style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.5)';
    });
    modeBtn.addEventListener('mouseout', () => {
      modeBtn.style.background = 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 50, 100, 0.2))';
      modeBtn.style.boxShadow = '0 0 10px rgba(255, 107, 157, 0.2)';
    });
    modeBtn.addEventListener('click', () => this.toggleMode(modeBtn));
    sceneContainer.appendChild(modeBtn);
    this.modeBtn = modeBtn;
    
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
    // Galaxy 1 (left) - Blue side
    this.createGalaxy(new THREE.Vector3(-400, 0, 0), 0, 0x1a4d7a, 0x00d9ff);
    
    // Galaxy 2 (right) - Pink side
    this.createGalaxy(new THREE.Vector3(400, 0, 0), Math.PI, 0x7a1a4d, 0xff6b9d);
    
    // Wormhole tunnel
    this.createTunnel();
    
    // Particle field
    this.createParticles();
    
    // Add accretion disk effect
    this.createAccretionDisk();
  }

  createGalaxy(position, rotationZ, baseColor, glowColor) {
    const diskGeometry = new THREE.CircleGeometry(80, 64);
    const diskMaterial = new THREE.MeshPhongMaterial({
      color: baseColor,
      emissive: glowColor,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
      wireframe: false
    });
    
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.position.copy(position);
    disk.rotation.z = rotationZ;
    disk.receiveShadow = true;
    disk.castShadow = true;
    this.scene.add(disk);
    
    // Galaxy core - much brighter
    const coreGeometry = new THREE.SphereGeometry(20, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 1.5
    });
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.copy(position);
    this.scene.add(core);
    
    // Core glow halo
    const haloGeometry = new THREE.SphereGeometry(35, 32, 32);
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(glowColor) }
      },
      vertexShader: `
        varying float vNormal;
        void main() {
          vNormal = dot(normalize(normalMatrix * normal), normalize(modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vNormal;
        void main() {
          float alpha = (1.0 - abs(vNormal)) * 0.4;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.copy(position);
    this.scene.add(halo);
  }

  createAccretionDisk() {
    const diskGeometry = new THREE.TorusGeometry(150, 50, 32, 100);
    const diskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying float vY;
        void main() {
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying float vY;
        void main() {
          float hue = fract(vY * 0.01 + time * 0.1);
          vec3 color = mix(
            vec3(0.0, 0.8, 1.0),
            mix(vec3(1.0, 0.4, 0.8), vec3(1.0, 0.2, 0.4), hue),
            hue
          );
          gl_FragColor = vec4(color, 0.5);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    this.accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    this.accretionDisk.rotation.x = Math.PI * 0.3;
    this.scene.add(this.accretionDisk);
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
    if (this.modeBtn) {
      this.modeBtn.textContent = this.mode === 'external' ? '🔄 نمط داخلي' : '🔄 نمط خارجي';
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
    
    // Update accretion disk
    if (this.accretionDisk && this.accretionDisk.material.uniforms) {
      this.accretionDisk.material.uniforms.time.value += 0.01;
      this.accretionDisk.rotation.z += 0.001;
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
    
    // Update HUD with physics data
    this.updateHUD();
    
    // Render
    this.composer.render();
  }

  updateHUD() {
    const throatRadiusEl = document.getElementById('throat-radius');
    const curvatureEl = document.getElementById('curvature');
    const timeDilationEl = document.getElementById('time-dilation');
    const tidalForcesEl = document.getElementById('tidal-forces');
    
    if (throatRadiusEl) {
      const radius = this.physics.throatRadius || 1.5;
      throatRadiusEl.textContent = `${radius.toFixed(2)} M`;
    }
    
    if (curvatureEl) {
      // Calculate Ricci curvature scalar
      const R = 4 / (this.physics.throatRadius ** 2);
      const level = R > 2 ? 'Very High' : R > 1 ? 'High' : 'Moderate';
      curvatureEl.textContent = level;
    }
    
    if (timeDilationEl) {
      // Time dilation factor α = √(1 - r_s/r)
      const r = Math.max(this.physics.throatRadius, 1.05 * (this.physics.throatRadius || 0.5));
      const r_s = 1.0; // Schwarzschild radius
      const alpha = Math.sqrt(Math.max(0, 1 - r_s / r));
      timeDilationEl.textContent = alpha.toFixed(3);
    }
    
    if (tidalForcesEl) {
      // Tidal force approximation
      const cameraZ = Math.abs(this.camera.position.z);
      const distance = Math.sqrt(
        this.camera.position.x ** 2 + 
        this.camera.position.y ** 2 + 
        cameraZ ** 2
      );
      
      const throatRadius = this.physics.throatRadius || 1.5;
      const tidalAccel = Math.pow(throatRadius, 2) / Math.pow(Math.max(distance, throatRadius), 3);
      
      let level = 'Safe';
      if (tidalAccel > 0.5) level = 'High';
      else if (tidalAccel > 0.2) level = 'Moderate';
      
      tidalForcesEl.textContent = `${level} (${tidalAccel.toFixed(3)})`;
    }
  }

  getPhysicsMetrics() {
    const cameraZ = Math.abs(this.camera.position.z);
    const distance = Math.sqrt(
      this.camera.position.x ** 2 + 
      this.camera.position.y ** 2 + 
      cameraZ ** 2
    );
    
    const M = 1.0; // Schwarzschild mass parameter
    const a = this.physics.throatRadius; // Throat radius
    
    // Time dilation: α = √(1 - 2M/r)
    const r_s = 2 * M; // Schwarzschild radius
    const r = Math.max(distance, a);
    const timeDilation = Math.sqrt(Math.max(0.1, 1 - r_s / r));
    
    // Redshift: z = 1/√(g_tt) - 1
    const redshift = (1 / timeDilation) - 1;
    
    // Tidal force: F_tidal ∝ M/r³
    const tidalForce = M / Math.pow(r, 3);
    
    // Spacetime curvature: Ricci scalar R = 4/a²
    const curvature = 4 / (a * a);
    
    return {
      timeDilation,
      redshift,
      tidalForce,
      curvature,
      distance,
      throatRadius: a
    };
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
