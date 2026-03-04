/**
 * Enhanced Realistic Wormhole Visualization
 * Clear, scientifically accurate, and visually intuitive
 */

import * as THREE from 'three';

export class RealisticWormholeRenderer {
  constructor(physics, scene) {
    this.physics = physics;
    this.scene = scene;
    this.components = {};
    this.createWormholeVisualization();
  }

  createWormholeVisualization() {
    // 1. Wormhole Tunnel (النفق)
    this.createTunnel();
    
    // 2. Throat Ring (حلقة الحلق)
    this.createThroatRing();
    
    // 3. Spacetime Distortion (تشويه الزمكان)
    this.createSpacetimeDistortion();
    
    // 4. Event Markers (علامات الأحداث)
    this.createEventMarkers();
  }

  /**
   * Main Wormhole Tunnel - النفق الرئيسي
   */
  createTunnel() {
    const length = this.physics.tunnelLength * 200;
    const segments = 128;
    const radialSegments = 32;
    
    // Create tapered tunnel (wider at ends, narrower at throat)
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];
    
    for (let i = 0; i <= segments; i++) {
      const z = (i / segments - 0.5) * length;
      const normalizedZ = Math.abs(z) / (length * 0.5);
      
      // Tunnel radius based on Morris-Thorne shape function
      const b = this.physics.getShapeFunction(this.physics.throatRadius + normalizedZ * 4);
      const radius = b * 15; // Scale for visibility
      
      for (let j = 0; j < radialSegments; j++) {
        const theta = (j / radialSegments) * Math.PI * 2;
        
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;
        
        vertices.push(x, y, z);
        
        // Color: Violet at throat, blue-cyan at edges
        const throatCloseness = 1 - Math.abs(normalizedZ);
        const r = 0.6 + throatCloseness * 0.2;
        const g = 0.0 + throatCloseness * 0.3;
        const b_color = 0.8 + throatCloseness * 0.2;
        
        colors.push(r, g, b_color);
      }
    }
    
    // Create faces
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * radialSegments + j;
        const b = a + radialSegments;
        const c = (j + 1) % radialSegments + i * radialSegments;
        const d = c + radialSegments;
        
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
      emissive: new THREE.Color(0x0066ff),
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const tunnel = new THREE.Mesh(geometry, material);
    this.scene.add(tunnel);
    this.components.tunnel = { mesh: tunnel, material };
  }

  /**
   * Throat Ring - حلقة الحلق (أضيق نقطة)
   */
  createThroatRing() {
    const throatRadius = this.physics.throatRadius * 15;
    
    // Main bright ring at throat
    const torusGeometry = new THREE.TorusGeometry(
      throatRadius,
      throatRadius * 0.12,
      32,
      128
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff9900,
      emissiveIntensity: 2.5,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 1
    });
    
    const ring = new THREE.Mesh(torusGeometry, material);
    ring.position.z = 0;
    this.scene.add(ring);
    
    this.components.throatRing = { mesh: ring, material };
    
    // Add glow particles
    this.createThroatGlow(throatRadius);
  }

  createThroatGlow() {
    const throatRadius = this.physics.throatRadius * 15;
    const particleCount = 300;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6 - Math.PI * 0.3;
      const r = throatRadius * (0.9 + Math.random() * 0.2);
      
      positions[i * 3] = Math.cos(theta) * Math.cos(phi) * r;
      positions[i * 3 + 1] = Math.sin(phi) * r;
      positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r;
      
      // Orange glow
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.0;
      
      sizes[i] = 2 + Math.random() * 3;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
  }

  /**
   * Spacetime Grid Distortion - تشويه شبكة الزمكان
   */
  createSpacetimeDistortion() {
    const gridSize = 300;
    const divisions = 12;
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.25,
      linewidth: 2
    });
    
    // Radial lines (showing curvature)
    for (let i = 0; i < divisions; i++) {
      const angle = (i / divisions) * Math.PI * 2;
      const points = [];
      
      for (let j = 0; j <= 20; j++) {
        const z = (j / 20 - 0.5) * gridSize;
        const dist = Math.abs(z) / gridSize * 0.5;
        const radius = 30 + 30 * Math.sin(dist * Math.PI) * Math.cos(angle);
        
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            z
          )
        );
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.scene.add(line);
    }
    
    // Circular rings showing distance
    for (let i = 1; i <= divisions / 2; i++) {
      const z = (i / (divisions / 2) - 0.5) * gridSize;
      const radius = 30 + 30 * Math.sin(Math.abs(z) / gridSize * Math.PI);
      
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
      const points = curve.getPoints(32);
      
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, p.y, z))
      );
      
      const line = new THREE.Line(geometry, lineMaterial);
      this.scene.add(line);
    }
    
    this.components.grid = lineMaterial;
  }

  /**
   * Event Markers - علامات التنبيهات المهمة
   */
  createEventMarkers() {
    // Throat entrance marker
    const markerGeometry = new THREE.OctahedronGeometry(8, 2);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1,
      metalness: 0.8,
      wireframe: true
    });
    
    const marker1 = new THREE.Mesh(markerGeometry, markerMaterial);
    marker1.position.z = -100;
    marker1.scale.set(1.5, 1.5, 1.5);
    
    const marker2 = marker1.clone();
    marker2.position.z = 100;
    
    this.scene.add(marker1);
    this.scene.add(marker2);
    
    this.components.markers = { m1: marker1, m2: marker2 };
  }

  /**
   * Update animation
   */
  update(time) {
    if (this.components.throatRing) {
      this.components.throatRing.mesh.rotation.x += 0.003;
      this.components.throatRing.mesh.rotation.y += 0.001;
    }
    
    if (this.components.tunnel) {
      this.components.tunnel.mesh.rotation.z = Math.sin(time * 0.3) * 0.05;
    }
    
    if (this.components.markers) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      this.components.markers.m1.scale.set(
        1.5 * scale,
        1.5 * scale,
        1.5 * scale
      );
      this.components.markers.m2.scale.copy(this.components.markers.m1.scale);
    }
  }

  dispose() {
    Object.values(this.components).forEach(component => {
      if (component.mesh) {
        component.mesh.geometry?.dispose();
        component.mesh.material?.dispose();
        this.scene.remove(component.mesh);
      }
      if (component.material) {
        component.material.dispose();
      }
    });
  }
}
