/**
 * Simplified Landing Page - optimized for performance
 */
export class LandingPageSimple {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.animationFrameId = null;
    this.pointerX = 0;
    this.pointerY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    this.element = this.createDOM();
    this.setupEventListeners();
    this.startBackgroundAnimation();
  }

  createDOM() {
    const page = document.createElement('div');
    page.className = 'landing-page';
    
    const bg = document.createElement('div');
    bg.className = 'landing-image-bg';
    
    const content = document.createElement('div');
    content.className = 'landing-content landing-content-visible';
    
    const title = document.createElement('h1');
    title.className = 'landing-title';
    title.textContent = 'Exploring the Geometry of Spacetime';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'landing-subtitle';
    subtitle.textContent = 'A journey through black holes and wormholes';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'landing-buttons';
    
    // Wormhole portal button
    const wormholePortal = document.createElement('button');
    wormholePortal.className = 'portal-button';
    wormholePortal.innerHTML = '<span class="portal-icon">◇</span><span class="portal-label">Wormhole</span>';
    wormholePortal.addEventListener('click', () => this.callbacks.onWormholeClick());

    const equationsBtn = document.createElement('button');
    equationsBtn.className = 'glow-button equations-btn';
    equationsBtn.textContent = '∑ Equations & How It Works';
    equationsBtn.addEventListener('click', () => this.callbacks.onEquationsClick());
    
    buttonContainer.appendChild(wormholePortal);
    buttonContainer.appendChild(equationsBtn);
    
    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(buttonContainer);
    
    page.appendChild(bg);
    page.appendChild(content);
    
    this.bgLayer = bg;
    this.element = page;
    return page;
  }

  setupEventListeners() {
    this._resizeListener = () => this.onWindowResize();
    this._mouseMoveListener = (event) => {
      const cx = window.innerWidth * 0.5;
      const cy = window.innerHeight * 0.5;
      this.targetX = (event.clientX - cx) / cx;
      this.targetY = (event.clientY - cy) / cy;
    };

    window.addEventListener('resize', this._resizeListener);
    if (!this.isMobile) {
      window.addEventListener('mousemove', this._mouseMoveListener, { passive: true });
    }
  }

  onWindowResize() {
    this.targetX = 0;
    this.targetY = 0;
  }

  startBackgroundAnimation() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.pointerX += (this.targetX - this.pointerX) * 0.05;
      this.pointerY += (this.targetY - this.pointerY) * 0.05;

      if (this.bgLayer) {
        const moveX = this.pointerX * 12;
        const moveY = this.pointerY * 8;
        this.bgLayer.style.transform = `scale(1.08) translate3d(${moveX}px, ${moveY}px, 0)`;
      }
    };

    animate();
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this._resizeListener);
    if (this._mouseMoveListener) {
      window.removeEventListener('mousemove', this._mouseMoveListener);
    }
  }
}
