// Wormhole Tunnel Vertex Shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDepth;

void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  vDepth = length(position);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
