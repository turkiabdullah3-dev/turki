// Gravitational Lensing Shader
// Simulates light bending near massive objects

uniform float time;
uniform float mass;
uniform vec2 blackHolePos;
uniform sampler2D backgroundTexture;

varying vec2 vUv;

const float G = 6.674e-11;
const float c = 299792458.0;

void main() {
    vec2 uv = vUv;
    
    // Calculate distance from black hole
    vec2 toBlackHole = uv - blackHolePos;
    float dist = length(toBlackHole);
    
    // Schwarzschild radius approximation
    float rs = 2.0 * G * mass / (c * c);
    
    // Deflection angle (Einstein's equation simplified)
    float deflection = 4.0 * G * mass / (c * c * dist);
    
    // Limit deflection to avoid extreme distortion
    deflection = min(deflection, 0.5);
    
    // Apply deflection
    vec2 deflectedUv = uv + normalize(toBlackHole) * deflection;
    
    // Sample background with distorted UV
    vec4 color = texture2D(backgroundTexture, deflectedUv);
    
    // Add gravitational redshift
    float redshift = sqrt(1.0 - rs / dist);
    color.r *= 1.0 + (1.0 - redshift) * 0.5;
    color.gb *= redshift;
    
    // Event horizon darkening
    if (dist < rs * 1.5) {
        float darkness = 1.0 - smoothstep(rs, rs * 1.5, dist);
        color.rgb *= (1.0 - darkness);
    }
    
    // Add Doppler beaming effect
    float angle = atan(toBlackHole.y, toBlackHole.x);
    float beaming = sin(angle + time * 0.5) * 0.1 + 1.0;
    color.rgb *= beaming;
    
    gl_FragColor = color;
}
