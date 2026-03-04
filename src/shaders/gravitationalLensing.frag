// Gravitational Lensing Fragment Shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;

uniform sampler2D starTexture;
uniform float time;
uniform float lensingStrength;
uniform vec3 blackHolePosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  
  // Distance from black hole
  float distanceFromBH = length(vWorldPosition - blackHolePosition);
  float distanceFactor = 1.0 / (1.0 + distanceFromBH * 0.01);
  
  // Light bending effect
  vec3 toBH = normalize(blackHolePosition - vWorldPosition);
  vec3 bendDir = mix(viewDir, toBH, lensingStrength * distanceFactor);
  
  // Sample texture with distortion
  vec2 distortedUv = vUv + bendDir.xy * 0.1 * distanceFactor;
  vec3 texColor = texture2D(starTexture, distortedUv).rgb;
  
  // Fresnel effect
  float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
  
  // Glow around BH
  vec3 glow = vec3(0.2, 0.6, 1.0) * fresnel * distanceFactor;
  
  // Final color
  vec3 finalColor = texColor + glow;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
