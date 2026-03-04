// Accretion Disk Particle Shader
// Realistic temperature and orbital dynamics

uniform float time;

attribute float velocity;
attribute vec3 color;
attribute float size;

varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

void main() {
    vColor = color;
    
    // Calculate orbital position
    vec3 pos = position;
    float radius = length(pos.xz);
    float angle = atan(pos.z, pos.x);
    
    // Keplerian orbital velocity
    float orbitalAngle = angle + time * velocity * 0.02;
    
    // Update position with orbital motion
    pos.x = radius * cos(orbitalAngle);
    pos.z = radius * sin(orbitalAngle);
    
    // Vertical oscillation (turbulence)
    pos.y += sin(time * 2.0 + radius * 0.1) * 0.5;
    
    // Brightness variation based on position and time
    vAlpha = 0.5 + abs(sin(time * 0.5 + radius * 0.1)) * 0.5;
    
    // Glow intensity (hotter = more glow)
    vGlow = 1.0 - (radius - 80.0) / 200.0;
    vGlow = clamp(vGlow, 0.0, 1.0);
    
    // Transform to clip space
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = size * (400.0 / -mvPosition.z);
}

// Fragment Shader
#ifdef FRAGMENT_SHADER

varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

void main() {
    // Circular particle shape
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Soft edge with glow
    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
    alpha *= vAlpha;
    
    // Bright center based on temperature
    float centerGlow = 1.0 - (dist * 2.0);
    centerGlow = pow(centerGlow, 2.0);
    
    // Final color with glow
    vec3 finalColor = vColor * (1.0 + centerGlow * vGlow);
    
    // Add bloom effect for hot particles
    finalColor += vColor * vGlow * 0.5;
    
    gl_FragColor = vec4(finalColor, alpha);
}

#endif
