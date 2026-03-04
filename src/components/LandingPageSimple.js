import * as THREE from 'three';

/**
 * Simplified Landing Page - optimized for performance
 */
export class LandingPageSimple {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationFrameId = null;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    this.element = this.createDOM();
    this.initThree();
    this.setupEventListeners();
    this.animate();
  }

  createDOM() {
    const page = document.createElement('div');
    page.className = 'landing-page';
    
    const canvas = document.createElement('canvas');
    canvas.className = 'landing-canvas';
    
    const content = document.createElement('div');
    content.className = 'landing-content landing-content-visible';
    
    const title = document.createElement('h1');
    title.className = 'landing-title';
    title.textContent = 'Exploring the Geometry of Spacetime';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'landing-subtitle';
    subtitle.textContent = 'A journey through black holes and wormholes';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'landing-buttons';
    
    // Dual portal button
    const dualPortalBtn = document.createElement('div');
    dualPortalBtn.className = 'dual-portal-btn';
    
    const blackHolePortal = document.createElement('button');
    blackHolePortal.className = 'portal-button portal-left';
    blackHolePortal.innerHTML = '<span class="portal-icon">●</span><span class="portal-label">Black Hole</span>';
    blackHolePortal.addEventListener('click', () => this.callbacks.onBlackHoleClick());
    
    const wormholePortal = document.createElement('button');
    wormholePortal.className = 'portal-button portal-right';
    wormholePortal.innerHTML = '<span class="portal-icon">◇</span><span class="portal-label">Wormhole</span>';
    wormholePortal.addEventListener('click', () => this.callbacks.onWormholeClick());

    const equationsBtn = document.createElement('button');
    equationsBtn.className = 'glow-button equations-btn';
    equationsBtn.textContent = '∑ Equations & How It Works';
    equationsBtn.addEventListener('click', () => this.callbacks.onEquationsClick());
    
    dualPortalBtn.appendChild(blackHolePortal);
    dualPortalBtn.appendChild(wormholePortal);
    
    buttonContainer.appendChild(dualPortalBtn);
    buttonContainer.appendChild(equationsBtn);
    
    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(buttonContainer);
    
    page.appendChild(canvas);
    page.appendChild(content);
    
    this.canvas = canvas;
    this.element = page;
    return page;
  }

  initThree() {
    console.log('LandingPageSimple: Initializing Three.js...');
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
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    console.log('LandingPageSimple: Three.js initialized, creating starfield...');
    
    // Minimal starfield
    this.createMinimalStarfield();
  }

  createMinimalStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = this.isMobile ? 200 : 500;
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      
      const brightness = Math.random();
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      sizeAttenuation: true
    });
    
    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
  }

  setupEventListeners() {
    this._resizeListener = () => this.onWindowResize();
    window.addEventListener('resize', this._resizeListener);
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    // Gentle camera movement
    const time = Date.now() * 0.0001;
    this.camera.position.x = Math.sin(time) * 30;
    this.camera.position.y = Math.cos(time * 0.8) * 20;
    this.camera.lookAt(0, 0, 0);
    
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this._resizeListener);
    
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
    
    this.renderer.dispose();
  }
}
