/**
 * Advanced Wormhole Visualization System
 * External and internal wormhole views with spacetime distortion
 */
import * as THREE from 'three';

export class WormholeVisualizer {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.mode = 'external'; // external, internal
    this.modeTransition = 0;
    
    this.galaxyA = null;
    this.galaxyB = null;
    this.tunnelMesh = null;
    this.spacetimeGrid = null;
    this.luminousTube = null;
    this.waveEffect = null;
    this.time = 0;
    
    this.initializeVisualization();
  }

  initializeVisualization() {
    // Create galaxy clouds
    this.createGalaxyClouds();
    
    // Create wormhole tunnel
    this.createWormholeTunnel();
    
    // Create spacetime grid
    this.createSpacetimeGrid();
    
    // Create luminous effect
    this.createLuminousEffect();
  }

  createGalaxyClouds() {
    const galaxyGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    
    const createGalaxy = (center, rotation) => {
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() ** 0.5) * 80;
        const verticalSpread = (Math.random() - 0.5) * 20;
        
        positions[i * 3] = Math.cos(angle) * radius + center.x;
        positions[i * 3 + 1] = verticalSpread + center.y;
        positions[i * 3 + 2] = Math.sin(angle) * radius + center.z;
        
        // Color - blue for galaxy
        const colorFactor = Math.random();
        colors[i * 3] = 0.3 + colorFactor * 0.4;     // R
        colors[i * 3 + 1] = 0.6 + colorFactor * 0.4;  // G
        colors[i * 3 + 2] = 1;                        // B
        
        sizes[i] = Math.random() * 0.8 + 0.2;
      }
      
      galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      galaxyGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
      
      const points = new THREE.Points(galaxyGeometry, material);
      return points;
    };
    
    this.galaxyA = createGalaxy(new THREE.Vector3(-120, 0, 0), 0);
    this.galaxyB = createGalaxy(new THREE.Vector3(120, 0, 0), Math.PI);
    
    this.scene.add(this.galaxyA);
    this.scene.add(this.galaxyB);
  }

  createWormholeTunnel() {
    // Create a curved tunnel connecting the two galaxies
    const segments = 50;
    const geometry = new THREE.TubeGeometry(
      this.createWormholePath(),
      segments,
      30, // tube radius segments
      8,  // radius segments
      false
    );
    
    // Gradient material from violet to cyan
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, 'rgb(138, 43, 226)');   // Violet
    gradient.addColorStop(0.5, 'rgb(75, 0, 130)');   // Indigo
    gradient.addColorStop(1, 'rgb(0, 200, 255)');    // Cyan
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add glow lines
    ctx.strokeStyle = 'rgba(200, 100, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 25);
      ctx.lineTo(256, i * 25 + 20);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: new THREE.Color(0x4400ff),
      emissiveIntensity: 0.4,
      shininess: 100,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    });
    
    this.tunnelMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.tunnelMesh);
  }

  createWormholePath() {
    // Create a curved path from galaxy A to galaxy B
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-120, 0, 0),
      new THREE.Vector3(-60, 30, -20),
      new THREE.Vector3(0, 40, 0),
      new THREE.Vector3(60, 30, 20),
      new THREE.Vector3(120, 0, 0)
    ]);
    
    return curve;
  }

  createSpacetimeGrid() {
    const geometry = new THREE.BufferGeometry();
    const lines = [];
    
    // Create grid distorted by wormhole
    const gridSize = 100;
    const divisions = 10;
    const step = gridSize / divisions;
    
    for (let x = -gridSize; x <= gridSize; x += step) {
      for (let z = -gridSize; z <= gridSize; z += step) {
        // Calculate distortion from wormhole center
        const distFromCenter = Math.sqrt(x * x + z * z);
        const distortion = Math.sin(distFromCenter * 0.05) * 20;
        
        lines.push(
          x, distortion, z,
          x + step, Math.sin((distFromCenter + step) * 0.05) * 20, z
        );
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(lines), 3
    ));
    
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      linewidth: 1
    });
    
    this.spacetimeGrid = new THREE.LineSegments(geometry, material);
    this.scene.add(this.spacetimeGrid);
  }

  createLuminousEffect() {
    // Floating light particles along the tunnel
    const geometry = new THREE.BufferGeometry();
    const particleCount = 100;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const curve = this.createWormholePath();
      const point = curve.getPoint(t);
      
      positions[i * 3] = point.x + (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 30;
      
      // Cyan glow
      colors[i * 3] = 0.2;
      colors[i * 3 + 1] = 0.9;
      colors[i * 3 + 2] = 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    
    this.luminousTube = new THREE.Points(geometry, material);
    this.scene.add(this.luminousTube);
  }

  update(mode, modeTransition, deltaTime = 0.016) {
    this.mode = mode;
    this.modeTransition = modeTransition;
    this.time += deltaTime;
    
    // Rotate galaxies
    if (this.galaxyA) {
      this.galaxyA.rotation.z += 0.0002;
    }
    if (this.galaxyB) {
      this.galaxyB.rotation.z -= 0.0002;
    }
    
    // Update tunnel texture offset for flow effect
    if (this.tunnelMesh && this.tunnelMesh.material.map) {
      this.tunnelMesh.material.map.offset.x += 0.005 * (1 - modeTransition * 0.3);
      this.tunnelMesh.material.map.offset.y += 0.002;
    }
    
    // Mode-specific updates
    if (mode === 'external') {
      this.updateExternalMode(modeTransition);
    } else {
      this.updateInternalMode(modeTransition);
    }
  }

  updateExternalMode(transition) {
    // Show both galaxies and tunnel
    if (this.galaxyA) this.galaxyA.material.opacity = 0.8;
    if (this.galaxyB) this.galaxyB.material.opacity = 0.8;
    if (this.tunnelMesh) {
      this.tunnelMesh.material.opacity = 0.6 + transition * 0.2;
    }
    if (this.spacetimeGrid) {
      this.spacetimeGrid.material.opacity = transition * 0.2;
    }
  }

  updateInternalMode(transition) {
    // Tunnel dominates, galaxies fade
    if (this.galaxyA) this.galaxyA.material.opacity = 0.8 * (1 - transition);
    if (this.galaxyB) this.galaxyB.material.opacity = 0.8 * (1 - transition);
    if (this.tunnelMesh) {
      this.tunnelMesh.material.opacity = 0.7 + transition * 0.3;
      this.tunnelMesh.material.emissiveIntensity = 0.4 + transition * 0.4;
    }
    if (this.spacetimeGrid) {
      this.spacetimeGrid.material.opacity = transition * 0.5;
    }
    if (this.luminousTube) {
      this.luminousTube.material.opacity = 0.6 + transition * 0.4;
    }
  }

  dispose() {
    [this.galaxyA, this.galaxyB, this.tunnelMesh, this.spacetimeGrid, this.luminousTube].forEach(obj => {
      if (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        this.scene.remove(obj);
      }
    });
  }
}
