/**
 * Enhanced Realistic Black Hole Visualization
 * Scientifically accurate and visually clear
 */

import * as THREE from 'three';

export class RealisticBlackHoleRenderer {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.components = {};
    this.visualRs = 34;
    this.visualRph = this.visualRs * 1.5;
    this.createVisualization();
  }

  createVisualization() {
    // 1. Event Horizon (صلب أسود حقيقي)
    this.createEventHorizon();
    
    // 2. Accretion Disk (قرص المادة الحارة)
    this.createAccretionDisk();
    
    // 3. Photon Ring (حلقة الضوء)
    this.createPhotonRing();
    
    // 4. Relativistic Beams (نفاثات النسبية)
    this.createRelativisticiBeams();
    
    // 5. Spacetime Grid (شبكة الزمكان)
    this.createSpacetimeGrid();
  }

  /**
   * Event Horizon - الأفق الحدثي
   * Dark circle with gravitational effects visible
   */
  createEventHorizon() {
    const rs = this.visualRs;
    
    // Create visible dark sphere (stable on all devices)
    const geometry = new THREE.SphereGeometry(rs, 128, 128);
    const material = new THREE.MeshStandardMaterial({
      color: 0x10131a,
      emissive: 0x1a0f2e,
      emissiveIntensity: 0.45,
      metalness: 0.15,
      roughness: 0.85,
      side: THREE.FrontSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.components.eventHorizon = { mesh, material };
  }

  /**
   * Accretion Disk - قرص المادة المتراكمة
   * Temperature-gradient colored disk with realistic dynamics
   */
  createAccretionDisk() {
    const innerRadius = this.visualRs * 1.8;
    const outerRadius = this.visualRs * 4.5;
    const segments = 64;
    const rings = 48;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];
    
    // Create disk ring by ring
    for (let i = 0; i <= rings; i++) {
      const r = innerRadius + (outerRadius - innerRadius) * (i / rings);
      const normalizedRadius = (r - innerRadius) / (outerRadius - innerRadius);
      
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        
        // Vertex position
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        const y = (Math.sin(theta * 0.5 + normalizedRadius * Math.PI) - 0.5) * r * 0.15; // Warped disk
        
        vertices.push(x, y, z);
        
        // Temperature-based color (red → orange → yellow → white)
        const temp = 1 - normalizedRadius; // Hotter near center
        let color;
        
        if (temp > 0.7) {
          // Red inner zone
          color = [1.0, 0.2, 0.0];
        } else if (temp > 0.4) {
          // Orange middle
          const t = (temp - 0.4) / 0.3;
          color = [1.0, 0.2 + t * 0.5, 0.0];
        } else {
          // Yellow outer
          color = [1.0, 0.7 + temp, 0.2];
        }
        
        colors.push(color[0], color[1], color[2]);
      }
    }
    
    // Create indices for faces
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        const c = a + 1;
        const d = b + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: 3.5,
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const disk = new THREE.Mesh(geometry, material);
    this.scene.add(disk);
    this.components.accretionDisk = { mesh: disk, material };
  }

  /**
   * Photon Ring (حلقة الضوء)
   * The light that orbits the black hole
   */
  createPhotonRing() {
    const r_ph = this.visualRph;
    
    // Create bright glowing ring
    const torusGeometry = new THREE.TorusGeometry(r_ph, r_ph * 0.08, 32, 128);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 5,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 1.0
    });
    
    const ring = new THREE.Mesh(torusGeometry, material);
    ring.rotation.x = Math.PI * 0.3;
    ring.rotation.y = Math.random() * Math.PI;
    
    this.scene.add(ring);
    this.components.photonRing = { mesh: ring, material };
    
    // Add glow particles around photon ring
    this.createPhotonRingHalo(r_ph);
  }

  createPhotonRingHalo() {
    const r_ph = this.visualRph;
    
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.4 - Math.PI * 0.2;
      const radiusVariation = r_ph * (0.95 + Math.random() * 0.1);
      
      positions[i * 3] = Math.cos(theta) * Math.cos(phi) * radiusVariation;
      positions[i * 3 + 1] = Math.sin(phi) * radiusVariation;
      positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radiusVariation;
      
      // Yellow glow
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 2] = 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.components.photonHalo = { mesh: points, material };
  }

  /**
   * Relativistic Jets (نفاثات نسبية)
   * Material streams ejected perpendicular to disk
   */
  createRelativisticiBeams() {
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ccff,
      emissiveIntensity: 4,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    
    // Upper jet
    const upperCone = this.createCone(14, 120, 24, 1);
    upperCone.position.y = 92;
    upperCone.material = beamMaterial;
    this.scene.add(upperCone);
    
    // Lower jet
    const lowerCone = this.createCone(14, 120, 24, 1);
    lowerCone.position.y = -92;
    lowerCone.rotation.x = Math.PI;
    lowerCone.material = beamMaterial;
    this.scene.add(lowerCone);
    
    this.components.jets = { upper: upperCone, lower: lowerCone };
  }

  createCone(radiusTop, height, radiusSegments, heightSegments) {
    const geometry = new THREE.ConeGeometry(radiusTop, height, radiusSegments, heightSegments);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ccff });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Spacetime Grid - شبكة الزمكان المشوهة
   * Shows curvature of spacetime
   */
  createSpacetimeGrid() {
    const grid = new THREE.GridHelper(520, 26, 0x00d9ff, 0x2a4f88);
    grid.rotation.x = Math.PI / 2;
    grid.position.y = -24;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    this.scene.add(grid);
    this.components.grid = { mesh: grid };
  }

  /**
   * Update animation
   */
  update(time) {
    if (this.components.accretionDisk) {
      this.components.accretionDisk.mesh.rotation.z += 0.001;
    }
    
    if (this.components.photonRing) {
      this.components.photonRing.mesh.rotation.z += 0.01;
    }
  }

  dispose() {
    const removeMesh = (mesh) => {
      if (!mesh) return;
      mesh.geometry?.dispose?.();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m?.dispose?.());
      } else {
        mesh.material?.dispose?.();
      }
      this.scene.remove(mesh);
    };

    Object.values(this.components).forEach((component) => {
      if (component?.mesh) {
        removeMesh(component.mesh);
      }
      if (component?.upper) {
        removeMesh(component.upper);
      }
      if (component?.lower) {
        removeMesh(component.lower);
      }
      if (component?.material) {
        component.material.dispose?.();
      }
    });
  }
}
