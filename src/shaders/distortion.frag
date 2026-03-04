varying vec2 vUv;
varying vec3 vPosition;

uniform float time;
uniform float distortionAmount;
uniform sampler2D distortionMap;

void main() {
  vec2 uv = vUv;
  
  // Radial distortion from center
  vec2 center = vec2(0.5);
  vec2 delta = uv - center;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);
  
  // Create gravitational lensing effect
  float lensing = 1.0 + (distortionAmount * (1.0 / (1.0 + dist * 5.0)));
  vec2 distortedUv = center + (delta / lensing);
  
  // Add subtle warping
  vec2 warp = vec2(
    sin(distortedUv.y * 10.0 + time * 0.5) * 0.02,
    cos(distortedUv.x * 10.0 + time * 0.5) * 0.02
  );
  
  distortedUv += warp * distortionAmount;
  
  // Sample the distortion map
  vec3 color = texture2D(distortionMap, distortedUv).rgb;
  
  // Apply chromatic aberration
  vec2 chromaticUv = distortedUv;
  float chromatic = distortionAmount * 0.02;
  float r = texture2D(distortionMap, chromaticUv + vec2(chromatic, 0.0)).r;
  float g = color.g;
  float b = texture2D(distortionMap, chromaticUv - vec2(chromatic, 0.0)).b;
  
  color = vec3(r, g, b);
  
  // Fade at edges
  float fade = smoothstep(1.5, 0.0, dist);
  color *= fade;
  
  gl_FragColor = vec4(color, 1.0);
}
