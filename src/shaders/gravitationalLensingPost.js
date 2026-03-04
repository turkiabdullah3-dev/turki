/**
 * Gravitational Lensing Post-Processing Shader
 * Simulates light bending around massive objects based on impact parameter
 */

export const GravitationalLensingShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'blackHolePos': { value: [0.5, 0.5] }, // Normalized screen position
    'schwarzschildRadius': { value: 0.1 },
    'lensStrength': { value: 1.0 },
    'time': { value: 0.0 }
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 blackHolePos;
    uniform float schwarzschildRadius;
    uniform float lensStrength;
    uniform float time;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Distance from black hole center
      vec2 delta = uv - blackHolePos;
      float dist = length(delta);
      
      // Lensing angle: θ ≈ 4GM/(c²b) = 4r_s/b
      // where b is impact parameter (closest approach distance)
      float impactParameter = max(dist, schwarzschildRadius * 0.1);
      float lensingAngle = (4.0 * schwarzschildRadius) / impactParameter;
      
      // Apply lensing distortion
      vec2 lensingDirection = normalize(delta);
      vec2 distortedUV = uv + lensingDirection * lensingAngle * lensStrength;
      
      // Inside photon sphere (1.5 * r_s), create multiple images (Einstein ring effect)
      if (dist < schwarzschildRadius * 1.5 && dist > schwarzschildRadius) {
        // Secondary image from light bending around black hole
        float ringIntensity = smoothstep(schwarzschildRadius, schwarzschildRadius * 1.5, dist);
        vec2 ringUV = blackHolePos + lensingDirection * schwarzschildRadius * 1.5;
        
        vec4 primaryImage = texture2D(tDiffuse, distortedUV);
        vec4 secondaryImage = texture2D(tDiffuse, ringUV);
        
        gl_FragColor = mix(secondaryImage, primaryImage, ringIntensity);
      } else if (dist > schwarzschildRadius) {
        // Normal lensing outside event horizon
        gl_FragColor = texture2D(tDiffuse, distortedUV);
      } else {
        // Inside event horizon - total blackness
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
      
      // Add subtle chromatic aberration (gravity affects different wavelengths slightly differently)
      if (dist < schwarzschildRadius * 3.0 && dist > schwarzschildRadius) {
        float aberration = 0.002 * (schwarzschildRadius / impactParameter);
        float r = texture2D(tDiffuse, distortedUV + lensingDirection * aberration).r;
        float g = texture2D(tDiffuse, distortedUV).g;
        float b = texture2D(tDiffuse, distortedUV - lensingDirection * aberration).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    }
  `
};
