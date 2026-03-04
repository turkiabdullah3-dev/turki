/**
 * Cinematic atmosphere and layered depth system
 * Creates a living, breathing cosmic environment
 */
import * as THREE from 'three';

export class CosmicAtmosphere {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.layers = [];
    this.time = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.starCount = this.isMobile ? 500 : 1500;
    this.dustCount = this.isMobile ? 300 : 900;
    this.glowCount = this.isMobile ? 120 : 260;
    
    this.createAtmosphereLayers();
  }

  createAtmosphereLayers() {
    // Layer 1: Far Background Nebula
    this.createNebulaGradient();
    
    // Layer 2: Star Field
    this.createStarfield();
    
    // Layer 3: Dust Particles
    this.createDustParticles();
    
    // Layer 4: Foreground Glow
    this.createForegroundGlow();
  }

  createNebulaGradient() {
    // Deep space gradient with faint nebula clouds
    const geometry = new THREE.IcosahedronGeometry(3000, 8);
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#020204');
    gradient.addColorStop(0.35, '#070812');
    gradient.addColorStop(0.7, '#090d18');
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add nebula clouds
    ctx.fillStyle = 'rgba(70, 40, 120, 0.025)';
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 150 + Math.random() * 200;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    
    this.layers.push({
      object: mesh,
      speed: 0.00005,
      type: 'nebula'
    });
  }

  createStarfield() {
    // Create thousands of tiny stars with subtle brightness and twinkling
    const starCount = this.starCount;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const twinkle = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      
      // Random spherical distribution
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const r = 2000 + Math.random() * 1000;
      
      positions[i3] = r * Math.sin(theta) * Math.cos(phi);
      positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i3 + 2] = r * Math.cos(theta);
      
      // Color variation with realistic star colors
      const colorType = Math.random();
      if (colorType < 0.6) {
        // White stars
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      } else if (colorType < 0.75) {
        // Blue-white stars
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 1;
      } else if (colorType < 0.9) {
        // Yellow stars
        colors[i3] = 1;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 0.6;
      } else {
        // Red stars
        colors[i3] = 1;
        colors[i3 + 1] = 0.5;
        colors[i3 + 2] = 0.3;
      }
      
      sizes[i] = Math.random() * 2.5 + 0.5;
      twinkle[i] = Math.random() * Math.PI * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('twinkle', new THREE.BufferAttribute(twinkle, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.9 }
      },
      vertexShader: `
        attribute float size;
        attribute float twinkle;
        attribute vec3 color;
        uniform float time;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          
          // Twinkling effect
          float twinkleSpeed = 2.0 + twinkle * 0.5;
          vAlpha = 0.3 + abs(sin(time * twinkleSpeed + twinkle)) * 0.7;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Circular star shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edge
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vAlpha * opacity;
          
          // Add glow
          float glow = 1.0 - dist * 2.0;
          vec3 finalColor = vColor * (1.0 + glow * 0.5);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    
    this.layers.push({
      object: points,
      material: material,
      speed: 0.00008,
      type: 'starfield'
    });
  }

  createDustParticles() {
    // Slow-moving dust particles with varying opacity
    const dustCount = this.dustCount;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);
    const sizes = new Float32Array(dustCount);
    const velocities = new Float32Array(dustCount * 3);
    
    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      
      // Random position in cube
      positions[i3] = (Math.random() - 0.5) * 4000;
      positions[i3 + 1] = (Math.random() - 0.5) * 4000;
      positions[i3 + 2] = (Math.random() - 0.5) * 4000;
      
      // Subtle colors
      const colorValue = 0.4 + Math.random() * 0.3;
      colors[i3] = colorValue;
      colors[i3 + 1] = colorValue * 0.8;
      colors[i3 + 2] = colorValue * 0.9;
      
      sizes[i] = Math.random() * 0.5 + 0.1;
      
      // Slow velocities
      velocities[i3] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.3
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    
    this.layers.push({
      object: points,
      positions: geometry.attributes.position.array,
      velocities: velocities,
      speed: 0.0005,
      type: 'dust'
    });
  }

  createForegroundGlow() {
    // Soft glowing particles in foreground
    const glowCount = this.glowCount;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(glowCount * 3);
    const colors = new Float32Array(glowCount * 3);
    const sizes = new Float32Array(glowCount);
    
    for (let i = 0; i < glowCount; i++) {
      const i3 = i * 3;
      
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const r = 500 + Math.random() * 800;
      
      positions[i3] = r * Math.sin(theta) * Math.cos(phi);
      positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i3 + 2] = r * Math.cos(theta);
      
      // Cyan glow
      colors[i3] = 0.3;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 1;
      
      sizes[i] = Math.random() * 3 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.2
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    
    this.layers.push({
      object: points,
      speed: 0.00002,
      type: 'glow'
    });
  }

  update(deltaTime = 0.016) {
    this.time += deltaTime;
    
    // Skip dust particle updates on some frames for better performance
    const shouldUpdateDust = Math.random() < 0.5; // Update 50% of frames
    
    // Update each layer with different speeds for parallax effect
    this.layers.forEach(layer => {
      if (layer.type === 'dust' && layer.positions && shouldUpdateDust) {
        const positions = layer.positions;
        const velocities = layer.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i] * 2;
          positions[i + 1] += velocities[i + 1] * 2;
          positions[i + 2] += velocities[i + 2] * 2;
          
          // Wrap around
          if (Math.abs(positions[i]) > 2500) positions[i] *= -0.9;
          if (Math.abs(positions[i + 1]) > 2500) positions[i + 1] *= -0.9;
          if (Math.abs(positions[i + 2]) > 2500) positions[i + 2] *= -0.9;
        }
        
        layer.object.geometry.attributes.position.needsUpdate = true;
      }
      
      // Subtle rotation for nebula
      if (layer.type === 'nebula') {
        layer.object.rotation.y += layer.speed;
      }
      
      // Update starfield shader time
      if (layer.type === 'starfield' && layer.material && layer.material.uniforms) {
        layer.material.uniforms.time.value = this.time;
      }
    });
  }

  dispose() {
    this.layers.forEach(layer => {
      if (layer.object.geometry) layer.object.geometry.dispose();
      if (layer.object.material) {
        if (Array.isArray(layer.object.material)) {
          layer.object.material.forEach(m => m.dispose());
        } else {
          layer.object.material.dispose();
        }
      }
      this.scene.remove(layer.object);
    });
    this.layers = [];
  }
}

/**
 * Camera cinematic movements
 */
export class CinematicCamera {
  constructor(camera) {
    this.camera = camera;
    this.targetPosition = camera.position.clone();
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.speed = 0.05;
  }

  smoothTransitionTo(position, lookAt, duration = 1000) {
    return new Promise(resolve => {
      const startPos = this.camera.position.clone();
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
        
        this.camera.position.lerpVectors(startPos, position, easeProgress);
        this.camera.lookAt(lookAt);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  update() {
    // Smooth camera following
    this.camera.position.lerp(this.targetPosition, this.speed);
  }
}

/**
 * Floating point light trails for cursor
 */
export class CursorTrail {
  constructor(scene) {
    this.scene = scene;
    this.trails = [];
    this.maxTrails = 20;
  }

  addTrail(position) {
    if (this.trails.length >= this.maxTrails) {
      const old = this.trails.shift();
      this.scene.remove(old.object);
      old.object.geometry.dispose();
      old.object.material.dispose();
    }
    
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    this.scene.add(mesh);
    
    this.trails.push({
      object: mesh,
      age: 0,
      maxAge: 30
    });
  }

  update() {
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const trail = this.trails[i];
      trail.age++;
      trail.object.material.opacity = 0.5 * (1 - trail.age / trail.maxAge);
      trail.object.scale.multiplyScalar(0.98);
      
      if (trail.age >= trail.maxAge) {
        this.scene.remove(trail.object);
        trail.object.geometry.dispose();
        trail.object.material.dispose();
        this.trails.splice(i, 1);
      }
    }
  }

  dispose() {
    this.trails.forEach(trail => {
      this.scene.remove(trail.object);
      trail.object.geometry.dispose();
      trail.object.material.dispose();
    });
    this.trails = [];
  }
}
