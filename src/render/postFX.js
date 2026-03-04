// Post-processing effects (lightweight single-pass)
// Owner: Turki Abdullah © 2026

export class PostFX {
  constructor(canvasRoot) {
    this.canvasRoot = canvasRoot;
  }
  
  /**
   * Apply vignette effect
   */
  vignette(strength = 0.5) {
    const ctx = this.canvasRoot.getContext();
    const { width, height } = this.canvasRoot.getDimensions();
    
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 1.5
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.6, `rgba(0, 0, 0, ${strength * 0.3})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${strength * 0.7})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  /**
   * Apply subtle glow (cheap bloom alternative)
   */
  glow(strength = 0.3) {
    const ctx = this.canvasRoot.getContext();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = strength;
    
    // This would need source image duplication for real glow
    // For now, skip or use CSS filter as alternative
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  }
  
  /**
   * Apply all effects
   */
  apply(vignetteStrength = 0.4, glowStrength = 0.2) {
    this.vignette(vignetteStrength);
  }
}

export default PostFX;
