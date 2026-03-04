/**
 * Helper utilities for Three.js and general tasks
 */
import * as THREE from 'three';

export function createParticleTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  
  // Create radial gradient for particle
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  return canvas;
}

export function createStarfield(count = 5000, distance = 2000) {
  const geometry = new THREE.BufferGeometry();
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random spherical distribution
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(Math.random() * 2 - 1);
    const r = distance * (0.5 + Math.random() * 0.5);
    
    positions[i3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i3 + 2] = r * Math.cos(theta);
    
    // Color variation (white to blue to cyan)
    const colorType = Math.random();
    if (colorType < 0.7) {
      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    } else if (colorType < 0.85) {
      colors[i3] = 0.5;
      colors[i3 + 1] = 0.7;
      colors[i3 + 2] = 1;
    } else {
      colors[i3] = 0;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 1;
    }
    
    sizes[i] = Math.random() * 2 + 1;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  return geometry;
}

export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOutCubic(t) {
  return 1 + (--t) * t * t;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function formatScientific(value, decimals = 2) {
  if (value === 0) return '0';
  
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  
  return `${mantissa.toFixed(decimals)}e${exponent}`;
}

export function formatValue(value) {
  if (Math.abs(value) < 0.001) return formatScientific(value);
  return value.toFixed(3);
}

export function formatDistance(meters) {
  if (meters < 1000) return meters.toFixed(0) + ' m';
  if (meters < 1e6) return (meters / 1000).toFixed(1) + ' km';
  if (meters < 1e9) return (meters / 1e6).toFixed(1) + ' Mm';
  if (meters < 1.496e11) return (meters / 1e9).toFixed(1) + ' Gm';
  return (meters / 1.496e11).toFixed(2) + ' AU';
}
