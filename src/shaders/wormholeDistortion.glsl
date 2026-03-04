// Wormhole Distortion Shader
// Creates spacetime curvature effect

uniform float time;
uniform float throatRadius;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Noise function for organic distortion
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

void main() {
    // Calculate distance from throat center
    float dist = length(vPosition.xy);
    
    // Morris-Thorne metric simulation
    float radialCoord = sqrt(dist * dist + throatRadius * throatRadius);
    float embeddingDepth = atan(dist / throatRadius);
    
    // Color gradient based on position
    float gradient = smoothstep(0.0, 1.0, vUv.x);
    vec3 baseColor = mix(color1, color2, gradient);
    
    // Add flowing energy pattern
    float flowPattern = fbm(vec3(vUv * 5.0, time * 0.3));
    flowPattern += sin(vUv.y * 20.0 + time * 2.0) * 0.1;
    
    // Pulsing effect
    float pulse = sin(time * 2.0 + embeddingDepth * 5.0) * 0.3 + 0.7;
    
    // Combine effects
    vec3 finalColor = baseColor * pulse;
    finalColor += vec3(flowPattern) * 0.3;
    
    // Edge glow using Fresnel
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5);
    vec3 glowColor = mix(color1, color2, 0.5) * fresnel * 2.0;
    finalColor += glowColor;
    
    // Spacetime grid
    float gridX = abs(fract(vUv.x * 20.0) - 0.5);
    float gridY = abs(fract(vUv.y * 20.0 + time * 0.1) - 0.5);
    float grid = smoothstep(0.48, 0.5, max(gridX, gridY));
    finalColor += vec3(grid * 0.2);
    
    // Depth-based opacity
    float alpha = 0.7 + fresnel * 0.3;
    
    gl_FragColor = vec4(finalColor, alpha);
}
