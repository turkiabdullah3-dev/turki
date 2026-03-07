// Camera Controller for free navigation and orbit controls
// Owner: Turki Abdullah © 2026

/**
 * CameraController
 * Manages camera position, rotation, and zoom for interactive viewing
 * Supports mouse orbit, touch swipe/pinch, and keyboard controls
 */
export class CameraController {
  constructor(canvasRoot, minDistance = 1.5, maxDistance = 50) {
    this.canvasRoot = canvasRoot;
    
    // Camera state
    this.distance = 5.0; // Distance from center (in r_s units)
    this.theta = 0; // Horizontal rotation (radians)
    this.phi = Math.PI / 4; // Vertical rotation (radians, 0 = top, π = bottom)
    
    // Camera constraints
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;
    this.minPhi = 0.2; // Minimum vertical angle (prevent looking directly down)
    this.maxPhi = Math.PI - 0.2; // Maximum vertical angle
    
    // Input state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.touchStartDistance = 0;
    
    // Smooth interpolation
    this.targetDistance = this.distance;
    this.targetTheta = this.theta;
    this.targetPhi = this.phi;
    this.lerpSpeed = 0.1; // Smoothing factor (0-1)
    
    // Default state for reset
    this.defaultDistance = 5.0;
    this.defaultTheta = 0;
    this.defaultPhi = Math.PI / 4;
    
    this.setupEventListeners();
  }

  /**
   * Setup mouse and touch event listeners
   */
  setupEventListeners() {
    const canvas = this.canvasRoot.canvas;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('wheel', (e) => this.onMouseWheel(e));

    // Touch events
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
    canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

    // Keyboard controls (optional)
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  /**
   * Mouse down - start orbit drag
   */
  onMouseDown(event) {
    if (event.button !== 0) return; // Only left mouse button
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    event.preventDefault();
  }

  /**
   * Mouse move - orbit camera
   */
  onMouseMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    // Orbit sensitivity
    const rotationSpeed = 0.01;
    this.targetTheta -= deltaX * rotationSpeed;
    this.targetPhi += deltaY * rotationSpeed;

    // Clamp phi to prevent flipping
    this.targetPhi = Math.max(this.minPhi, Math.min(this.maxPhi, this.targetPhi));

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  /**
   * Mouse up - stop orbit drag
   */
  onMouseUp(event) {
    this.isDragging = false;
  }

  /**
   * Mouse wheel - zoom in/out
   */
  onMouseWheel(event) {
    event.preventDefault();
    
    const zoomSpeed = 0.001;
    const delta = event.deltaY > 0 ? 1 : -1;
    
    this.targetDistance += delta * this.targetDistance * zoomSpeed * 10;
    this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
  }

  /**
   * Touch start - initialize multi-touch
   */
  onTouchStart(event) {
    if (event.touches.length === 1) {
      // Single touch = orbit
      this.isDragging = true;
      this.lastMouseX = event.touches[0].clientX;
      this.lastMouseY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Two fingers = pinch zoom
      this.touchStartDistance = this.getTouchDistance(event.touches);
      this.isDragging = false;
    }
    event.preventDefault();
  }

  /**
   * Touch move - orbit or pinch zoom
   */
  onTouchMove(event) {
    if (event.touches.length === 1 && this.isDragging) {
      // Single touch orbit
      const deltaX = event.touches[0].clientX - this.lastMouseX;
      const deltaY = event.touches[0].clientY - this.lastMouseY;

      const rotationSpeed = 0.01;
      this.targetTheta -= deltaX * rotationSpeed;
      this.targetPhi += deltaY * rotationSpeed;

      this.targetPhi = Math.max(this.minPhi, Math.min(this.maxPhi, this.targetPhi));

      this.lastMouseX = event.touches[0].clientX;
      this.lastMouseY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Pinch zoom
      const currentDistance = this.getTouchDistance(event.touches);
      const ratio = currentDistance / this.touchStartDistance;
      
      // Zoom inversely proportional to pinch
      this.targetDistance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.targetDistance / ratio)
      );

      this.touchStartDistance = currentDistance;
    }
    event.preventDefault();
  }

  /**
   * Touch end - clean up
   */
  onTouchEnd(event) {
    this.isDragging = false;
  }

  /**
   * Get distance between two touch points
   */
  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Keyboard controls (optional arrow keys)
   */
  onKeyDown(event) {
    const zoomStep = 0.5;
    switch (event.key) {
      case 'ArrowUp':
        this.targetPhi = Math.max(this.minPhi, this.targetPhi - 0.1);
        break;
      case 'ArrowDown':
        this.targetPhi = Math.min(this.maxPhi, this.targetPhi + 0.1);
        break;
      case 'ArrowLeft':
        this.targetTheta -= 0.1;
        break;
      case 'ArrowRight':
        this.targetTheta += 0.1;
        break;
      case '+':
      case '=':
        this.targetDistance = Math.max(this.minDistance, this.targetDistance - zoomStep);
        break;
      case '-':
        this.targetDistance = Math.min(this.maxDistance, this.targetDistance + zoomStep);
        break;
    }
  }

  /**
   * Update camera state with smooth interpolation
   */
  update() {
    // Smooth interpolation toward target values
    this.distance += (this.targetDistance - this.distance) * this.lerpSpeed;
    this.theta += (this.targetTheta - this.theta) * this.lerpSpeed;
    this.phi += (this.targetPhi - this.phi) * this.lerpSpeed;
  }

  /**
   * Get camera position in Cartesian coordinates
   * Returns {x, y, z} relative to center
   */
  getPosition() {
    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);
    const sinTheta = Math.sin(this.theta);
    const cosTheta = Math.cos(this.theta);

    return {
      x: this.distance * sinPhi * cosTheta,
      y: this.distance * cosPhi,
      z: this.distance * sinPhi * sinTheta
    };
  }

  /**
   * Get camera rotation as transform (for canvas 2D projection)
   * Returns angle for canvas rotation
   */
  getRotationAngle() {
    return this.theta;
  }

  /**
   * Get zoom level (0-1, where 1 is max zoom out)
   */
  getZoomLevel() {
    return (this.distance - this.minDistance) / (this.maxDistance - this.minDistance);
  }

  /**
   * Reset camera to default position
   */
  reset() {
    this.targetDistance = this.defaultDistance;
    this.targetTheta = this.defaultTheta;
    this.targetPhi = this.defaultPhi;
    // Optional: snap immediately instead of interpolating
    // this.distance = this.defaultDistance;
    // this.theta = this.defaultTheta;
    // this.phi = this.defaultPhi;
  }

  /**
   * Set distance constraint
   */
  setDistanceConstraints(min, max) {
    this.minDistance = min;
    this.maxDistance = max;
    this.targetDistance = Math.max(min, Math.min(max, this.targetDistance));
  }

  /**
   * Get current camera state
   */
  getState() {
    return {
      distance: this.distance,
      theta: this.theta,
      phi: this.phi,
      position: this.getPosition()
    };
  }
}

export default CameraController;
