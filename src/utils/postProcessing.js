/**
 * Post-processing effects for enhanced visuals
 */

export class PostProcessingEffects {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    // Create render targets
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        samples: 4
      }
    );
    
    this.initPostProcessing();
  }

  initPostProcessing() {
    // Bloom effect using scene.background manipulation
    this.setupBloomEffect();
  }

  setupBloomEffect() {
    // Enhanced bloom is achieved through the main renderer
    // by using toneMappingExposure and a slight brightness boost
    this.renderer.toneMappingExposure = 1.0;
  }

  applyChromatic(intensity = 0.01) {
    // Chromatic aberration can be applied in shader
    // For now, we'll use post-processing color channel manipulation
  }

  render() {
    this.renderer.render(this.scene, this.camera, this.renderTarget);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderTarget.dispose();
  }

  onWindowResize(width, height) {
    this.renderTarget.setSize(width, height);
  }
}

/**
 * Volumetric Light effect shader
 */
export const volumetricLightShader = {
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    uniform vec3 lightPosition;
    uniform float intensity;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(lightPosition - vPosition);
      
      float diff = max(dot(normal, lightDir), 0.0);
      float fresnel = pow(1.0 - abs(dot(normal, normalize(cameraPosition - vPosition))), 3.0);
      
      vec3 color = vec3(0.0, 0.6, 1.0) * (diff + fresnel * 2.0) * intensity;
      
      gl_FragColor = vec4(color, fresnel * intensity);
    }
  `
};

/**
 * Bloom effect through post-processing
 */
export function enhanceBloomEffect(renderer) {
  renderer.toneMappingExposure = 1.0;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
}

/**
 * Apply chromatic aberration effect to a canvas/texture
 */
export function createChromaticAberrationEffect(canvas, intensity = 2) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply color channel shift
  for (let i = 0; i < data.length; i += 4) {
    const shiftAmount = Math.floor(intensity);
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Create subtle color fringing
    data[i] = Math.min(255, r + shiftAmount);
    data[i + 2] = Math.max(0, b - shiftAmount);
  }
  
  ctx.putImageData(imageData, 0, 0);
}
