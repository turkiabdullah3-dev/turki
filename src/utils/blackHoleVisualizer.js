/**
 * Advanced Black Hole Visualization System
 * Four-phase journey through the event horizon
 */
import * as THREE from 'three';

export class BlackHoleVisualizer {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.phase = 0; // 0: distant, 1: approach, 2: event horizon, 3: first-person
    this.phaseTransition = 0;
    
    this.blackHoleMesh = null;
    this.accretionDisk = null;
    this.photonRing = null;
    this.eventHorizonGlow = null;
    this.lensGrid = null;
    this.warpEffect = null;
    
    this.initializeVisualization();
  }

  initializeVisualization() {
    // Create black hole core
    this.createBlackHoleCore();
    
    // Create accretion disk
    this.createAccretionDisk();
    
    // Create photon ring
    this.createPhotonRing();
    
    // Create lensing effect grid
    this.createLensingGrid();
  }

  createBlackHoleCore() {
    const geometry = new THREE.SphereGeometry(this.physics.schwarzschildRadius, 64, 64);
    
    // Create gradient texture for event horizon
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.7, 'rgba(20, 20, 40, 0.5)');
    gradient.addColorStop(1, 'rgba(50, 0, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add shimmer pattern
    ctx.strokeStyle = 'rgba(100, 50, 200, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(128, 128, 30 + i * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color(0x1a0033),
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.BackSide
    });
    
    this.blackHoleMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.blackHoleMesh);
  }

  createAccretionDisk() {
    const diskGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = this.physics.schwarzschildRadius * (2 + Math.random() * 3);
      const radiusSmall = Math.random() * 0.5;
      
      positions[i * 3] = Math.cos(angle) * (radius + radiusSmall);
      positions[i * 3 + 1] = (Math.random() - 0.5) * this.physics.schwarzschildRadius * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * (radius + radiusSmall);
      
      // Temperature-based color
      const tempFactor = Math.random();
      if (tempFactor < 0.3) {
        colors[i * 3] = 1;     // Red
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0;
      } else if (tempFactor < 0.6) {
        colors[i * 3] = 1;     // Orange
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0;
      } else {
        colors[i * 3] = 1;     // Yellow
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.2;
      }
      
      sizes[i] = Math.random() * 1.5 + 0.5;
      radii[i] = radius;
    }
    
    diskGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    diskGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    diskGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const diskMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    
    this.accretionDisk = new THREE.Points(diskGeometry, diskMaterial);
    this.accretionDisk.rotation.x = Math.random() * 0.4 - 0.2; // Slight tilt
    this.scene.add(this.accretionDisk);
  }

  createPhotonRing() {
    // Ring of light that orbits at the innermost stable circular orbit
    const ringGeometry = new THREE.BufferGeometry();
    const ringPoints = 200;
    
    const positions = new Float32Array(ringPoints * 3);
    const colors = new Float32Array(ringPoints * 3);
    
    // ISCO (Innermost Stable Circular Orbit) is at 3x Schwarzschild radius for non-rotating BH
    const isco = this.physics.schwarzschildRadius * 3;
    
    for (let i = 0; i < ringPoints; i++) {
      const angle = (i / ringPoints) * Math.PI * 2;
      
      positions[i * 3] = Math.cos(angle) * isco;
      positions[i * 3 + 1] = Math.sin(angle) * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * isco;
      
      // Yellow-white glow
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.9;
      colors[i * 3 + 2] = 0.3;
    }
    
    ringGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    ringGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const ringMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      linewidth: 3
    });
    
    this.photonRing = new THREE.Line(ringGeometry, ringMaterial);
    this.scene.add(this.photonRing);
  }

  createLensingGrid() {
    const gridGeometry = new THREE.BufferGeometry();
    const gridSize = 200;
    const spacing = 1;
    const vertices = [];
    
    // Create grid pattern
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        vertices.push(x, 0, z);
      }
    }
    
    gridGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    
    const gridMaterial = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.3,
      transparent: true,
      opacity: 0
    });
    
    this.lensGrid = new THREE.Points(gridGeometry, gridMaterial);
    this.scene.add(this.lensGrid);
  }

  update(phase, phaseProgress, camera, deltaTime = 0.016) {
    this.phase = phase;
    this.phaseTransition = phaseProgress;
    
    // Update rotation
    if (this.accretionDisk) {
      this.accretionDisk.rotation.z += 0.0002 * (1 - phaseProgress * 0.5);
    }
    
    if (this.photonRing) {
      this.photonRing.rotation.z += 0.0005;
    }
    
    // Phase-specific updates
    switch(phase) {
      case 0: // Distant
        this.updateDistantPhase(phaseProgress);
        break;
      case 1: // Approach
        this.updateApproachPhase(phaseProgress);
        break;
      case 2: // Event Horizon
        this.updateEventHorizonPhase(phaseProgress);
        break;
      case 3: // First-Person
        this.updateFirstPersonPhase(phaseProgress, camera);
        break;
    }
  }

  updateDistantPhase(progress) {
    // Full accretion disk visible, calm rotation
    if (this.accretionDisk) {
      this.accretionDisk.material.opacity = 0.8;
    }
    if (this.photonRing) {
      this.photonRing.material.opacity = 0;
    }
    if (this.lensGrid) {
      this.lensGrid.material.opacity = 0;
    }
  }

  updateApproachPhase(progress) {
    // Accretion disk becomes more intense
    if (this.accretionDisk) {
      this.accretionDisk.material.opacity = 0.8 + progress * 0.2;
      this.accretionDisk.scale.set(1, 1, 1 + progress * 0.3);
    }
    
    // Photon ring starts to appear
    if (this.photonRing) {
      this.photonRing.material.opacity = progress * 0.5;
    }
  }

  updateEventHorizonPhase(progress) {
    // Focus on event horizon details
    if (this.accretionDisk) {
      this.accretionDisk.material.opacity = 0.6;
    }
    
    if (this.photonRing) {
      this.photonRing.material.opacity = 0.5 + progress * 0.5;
    }
    
    // Event horizon glow intensifies
    if (this.blackHoleMesh) {
      this.blackHoleMesh.material.emissiveIntensity = 0.8 + progress * 0.4;
    }
    
    // Lensing grid becomes visible
    if (this.lensGrid) {
      this.lensGrid.material.opacity = progress * 0.4;
    }
  }

  updateFirstPersonPhase(progress, camera) {
    // Extreme distortion, redshift effects
    if (this.accretionDisk) {
      this.accretionDisk.material.opacity = 0.4;
      
      // Radial stretching effect
      const stretch = 1 + progress * 2;
      this.accretionDisk.scale.set(stretch, 1, stretch);
    }
    
    // Photon ring dominates view
    if (this.photonRing) {
      this.photonRing.material.opacity = 0.8 + progress * 0.2;
    }
    
    // Maximum lensing grid visibility
    if (this.lensGrid) {
      this.lensGrid.material.opacity = 0.4 * progress;
    }
    
    // Apply spacetime warping to camera
    if (camera && this.blackHoleMesh) {
      const distance = camera.position.length();
      const schwarzschildRadius = this.physics.schwarzschildRadius;
      
      // Gravitational redshift calculation
      const redshift = Math.sqrt(1 - (2 * schwarzschildRadius / distance));
      
      // This would be used for post-processing color shift
      this.redshiftFactor = redshift;
    }
  }

  applyGravitationalLensing(camera) {
    if (!this.lensGrid || !this.blackHoleMesh) return;
    
    const bhPosition = this.blackHoleMesh.position;
    const cameraDist = camera.position.clone().sub(bhPosition).length();
    const schwarzschildRadius = this.physics.schwarzschildRadius;
    
    // Strong lensing parameter
    const lensStrength = (schwarzschildRadius * 2) / cameraDist;
    
    return {
      strength: Math.min(lensStrength, 1),
      center: bhPosition,
      distance: cameraDist
    };
  }

  dispose() {
    [this.blackHoleMesh, this.accretionDisk, this.photonRing, this.lensGrid].forEach(obj => {
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

/**
 * Gravitational Lensing Post-Processing
 */
export class LensingEffect {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.strength = 0;
  }

  update(lensParameters) {
    if (!lensParameters) return;
    
    this.strength = lensParameters.strength;
    // Shader-based lensing would go here
    // For now, this provides the parameters
  }

  dispose() {
    // Cleanup if needed
  }
}
