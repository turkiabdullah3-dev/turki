/**
 * Wormhole Embedding Diagram Visualizer
 * Creates a 3D funnel representation of the wormhole geometry
 * Using the embedding equation: dz/dr = ±√(1/(r/b(r) - 1))
 */

import * as THREE from 'three';

export class WormholeEmbeddingDiagram {
  constructor(physics, scene) {
    this.physics = physics;
    this.scene = scene;
    this.mesh = null;
    this.gridHelper = null;
    this.createEmbeddingDiagram();
  }

  createEmbeddingDiagram() {
    // Get embedding curve points from physics
    const curve = this.physics.getEmbeddingCurve(
      this.physics.throatRadius,
      this.physics.throatRadius * 8,
      60
    );

    if (curve.length < 2) return;

    // Create funnel geometry by rotating the curve
    const segments = 48;
    const vertices = [];
    const indices = [];
    const colors = [];

    for (let i = 0; i < curve.length; i++) {
      const { r, z } = curve[i];
      
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        
        vertices.push(x, y, z);
        
        // Color gradient from throat (violet) to edge (cyan)
        const t = i / (curve.length - 1);
        const color = new THREE.Color();
        color.setHSL(0.75 - t * 0.25, 0.8, 0.5 + t * 0.2);
        colors.push(color.r, color.g, color.b);
      }
    }

    // Create faces
    for (let i = 0; i < curve.length - 1; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        const c = a + 1;
        const d = b + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Material with wireframe overlay
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      wireframe: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    
    // Create wireframe overlay for better visualization
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    
    // Create mirror for the other side of wormhole
    const mirrorGeometry = geometry.clone();
    const mirrorMesh = new THREE.Mesh(mirrorGeometry, material.clone());
    mirrorMesh.scale.z = -1;
    
    const mirrorWireframe = new THREE.Mesh(mirrorGeometry, wireframeMaterial.clone());
    mirrorWireframe.scale.z = -1;

    // Group all together
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.wireframe);
    this.group.add(mirrorMesh);
    this.group.add(mirrorWireframe);
    
    // Add throat indicator ring
    this.addThroatIndicator();
    
    // Add grid lines for spacetime reference
    this.addSpacetimeGrid();
    
    this.scene.add(this.group);
  }

  addThroatIndicator() {
    const throatGeometry = new THREE.TorusGeometry(
      this.physics.throatRadius,
      this.physics.throatRadius * 0.05,
      16,
      32
    );
    const throatMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      emissive: 0xff6600,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.9
    });
    const throatRing = new THREE.Mesh(throatGeometry, throatMaterial);
    throatRing.rotation.x = Math.PI / 2;
    this.group.add(throatRing);
  }

  addSpacetimeGrid() {
    // Create radial grid lines
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.2
    });

    const radialLines = 12;
    for (let i = 0; i < radialLines; i++) {
      const angle = (i / radialLines) * Math.PI * 2;
      const curve = this.physics.getEmbeddingCurve(
        this.physics.throatRadius,
        this.physics.throatRadius * 8,
        30
      );

      const points = curve.map(p => 
        new THREE.Vector3(
          p.r * Math.cos(angle),
          p.r * Math.sin(angle),
          p.z
        )
      );

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, gridMaterial);
      this.group.add(line);
      
      // Mirror
      const mirrorLine = line.clone();
      mirrorLine.scale.z = -1;
      this.group.add(mirrorLine);
    }
  }

  update(time) {
    if (this.group) {
      // Gentle rotation for visualization
      this.group.rotation.z = time * 0.05;
    }
  }

  updateThroatRadius(newRadius) {
    // Remove old diagram
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    
    // Recreate with new radius
    this.createEmbeddingDiagram();
  }

  setVisible(visible) {
    if (this.group) {
      this.group.visible = visible;
    }
  }

  dispose() {
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
  }
}
