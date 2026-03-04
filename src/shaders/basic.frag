varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform sampler2D map;
uniform float emissiveIntensity;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vPosition);
  
  float fresnel = dot(viewDir, normal);
  fresnel = pow(abs(fresnel), 0.5);
  
  vec3 texColor = texture2D(map, vUv).rgb;
  vec3 emissive = texColor * emissiveIntensity * fresnel;
  
  gl_FragColor = vec4(emissive, 1.0);
}
