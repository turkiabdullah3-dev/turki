// Wormhole Tunnel Fragment Shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDepth;

uniform float time;
uniform float tunnelRadius;
uniform sampler2D noiseTexture;

void main() {
  // Normalize coordinates from tunnel center
  vec3 normal = normalize(vNormal);
  
  // Distance from tunnel axis
  float distanceFromAxis = sqrt(vPosition.x * vPosition.x + vPosition.y * vPosition.y);
  float fadeFactor = smoothstep(tunnelRadius * 1.2, tunnelRadius * 0.8, distanceFromAxis);
  
  // Depth-based color gradient
  float depthColor = mod(vDepth * 0.05 + time * 0.3, 1.0);
  
  // Noise-based warping
  float noise = texture2D(noiseTexture, vUv + time * 0.1).r;
  
  // Create flowing effect
  vec3 color = mix(
    vec3(0.0, 0.7, 1.0),
    vec3(0.7, 0.0, 1.0),
    depthColor
  );
  
  // Add warping effect
  color += vec3(noise * 0.2);
  
  // Glow at tunnel edge
  float edgeGlow = pow(1.0 - fadeFactor, 2.0) * 0.5;
  color += vec3(0.0, 1.0, 1.0) * edgeGlow;
  
  gl_FragColor = vec4(color, fadeFactor);
}
