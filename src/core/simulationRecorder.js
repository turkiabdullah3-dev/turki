// Simulation Data Recorder
// Owner: Turki Abdullah © 2026

/**
 * SimulationRecorder
 * Records key simulation parameters over time for timeline visualization
 * Records periodically (~0.5s) to avoid excessive memory growth
 */
export class SimulationRecorder {
  constructor(recordInterval = 500) {
    this.recordInterval = recordInterval; // milliseconds
    this.lastRecordTime = 0;
    this.simulationTime = 0;
    this.dataPoints = [];
    this.maxDataPoints = 300; // Limit to prevent memory growth
    this.eventMarkers = []; // Track special events (photon sphere, horizon, throat)
    this.isRecording = true;

    // Physics parameters to track
    this.currentState = {
      time: 0,
      distance: 0,
      alpha: 1.0,
      redshift: 0,
      tidalForce: 0,
      warpStrength: 0, // For wormhole
      isBlackHole: true
    };
  }

  /**
   * Update recorder state (call each frame)
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   * @param {object} state - Current simulation state
   */
  update(deltaTime, state) {
    if (!this.isRecording || !state) return;

    this.simulationTime += deltaTime;
    const now = performance.now();

    // Record if interval has passed
    if (now - this.lastRecordTime >= this.recordInterval) {
      this.recordDataPoint(state);
      this.lastRecordTime = now;
    }
  }

  /**
   * Record a single data point
   * @param {object} state - Current simulation state
   */
  recordDataPoint(state) {
    const dataPoint = {
      timestamp: this.simulationTime,
      distance: state.distance || 0,
      alpha: state.alpha !== undefined ? state.alpha : 1.0,
      redshift: state.redshift !== undefined ? state.redshift : 0,
      tidalForce: state.tidalForce !== undefined ? state.tidalForce : 0,
      warpStrength: state.warpStrength !== undefined ? state.warpStrength : 0,
      observerPosition: { ...state.observerPosition } || { x: 0, y: 0, z: 0 }
    };

    this.dataPoints.push(dataPoint);

    // Trim oldest data if exceeding max
    if (this.dataPoints.length > this.maxDataPoints) {
      this.dataPoints.shift();
    }

    // Check for event markers
    this.checkForEvents(state, dataPoint);

    this.currentState = { ...this.currentState, ...dataPoint };
  }

  /**
   * Check for special events and add markers
   * @param {object} state - Current simulation state
   * @param {object} dataPoint - Recently recorded data point
   */
  checkForEvents(state, dataPoint) {
    const schwarzschildRadius = state.schwarzschildRadius || 1;
    const photonSphereRadius = schwarzschildRadius * 1.5;
    const horizonProximity = dataPoint.distance / schwarzschildRadius;

    // Event: Photon Sphere crossing
    if (
      dataPoint.distance <= photonSphereRadius * 1.05 &&
      dataPoint.distance >= photonSphereRadius * 0.95 &&
      !this.hasEventNear('photon_sphere', dataPoint.timestamp, 0.1)
    ) {
      this.addEventMarker('photon_sphere', dataPoint.timestamp, 'Photon Sphere');
    }

    // Event: Near Event Horizon (within 1.2x radius)
    if (
      horizonProximity < 1.2 &&
      horizonProximity > 1.0 &&
      !this.hasEventNear('near_horizon', dataPoint.timestamp, 0.1)
    ) {
      this.addEventMarker('near_horizon', dataPoint.timestamp, 'Near Event Horizon');
    }

    // Event: Wormhole Throat crossing
    if (
      state.isWormhole &&
      dataPoint.distance <= (state.throatRadius || 5) * 1.05 &&
      !this.hasEventNear('wormhole_throat', dataPoint.timestamp, 0.1)
    ) {
      this.addEventMarker('wormhole_throat', dataPoint.timestamp, 'Wormhole Throat');
    }
  }

  /**
   * Check if event already exists near timestamp
   * @param {string} eventType - Type of event
   * @param {number} timestamp - Time to check
   * @param {number} tolerance - Time tolerance in seconds
   */
  hasEventNear(eventType, timestamp, tolerance) {
    return this.eventMarkers.some(
      (marker) =>
        marker.type === eventType &&
        Math.abs(marker.timestamp - timestamp) < tolerance
    );
  }

  /**
   * Add an event marker
   * @param {string} type - Event type identifier
   * @param {number} timestamp - Time of event
   * @param {string} label - Display label
   */
  addEventMarker(type, timestamp, label) {
    this.eventMarkers.push({
      type,
      timestamp,
      label,
      dataPointIndex: this.dataPoints.length - 1
    });
  }

  /**
   * Get all recorded data points
   */
  getDataPoints() {
    return [...this.dataPoints];
  }

  /**
   * Get event markers
   */
  getEventMarkers() {
    return [...this.eventMarkers];
  }

  /**
   * Reset all recorded data
   */
  resetTimeline() {
    this.dataPoints = [];
    this.eventMarkers = [];
    this.simulationTime = 0;
    this.lastRecordTime = performance.now();
  }

  /**
   * Toggle recording on/off
   */
  setRecording(enabled) {
    this.isRecording = enabled;
  }

  /**
   * Get recording status
   */
  isRecordingData() {
    return this.isRecording;
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return { ...this.currentState };
  }

  /**
   * Get data point at specific index
   */
  getDataPointAt(index) {
    if (index >= 0 && index < this.dataPoints.length) {
      return { ...this.dataPoints[index] };
    }
    return null;
  }

  /**
   * Get min/max values for a property across all data points
   * @param {string} property - Property name (e.g., 'redshift', 'distance')
   */
  getPropertyRange(property) {
    if (this.dataPoints.length === 0) {
      return { min: 0, max: 1 };
    }

    const values = this.dataPoints
      .map((dp) => dp[property] || 0)
      .filter((v) => !isNaN(v) && isFinite(v));

    if (values.length === 0) {
      return { min: 0, max: 1 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    // Add 10% padding to range
    const range = max - min || 1;
    const padding = range * 0.1;

    return {
      min: Math.max(0, min - padding),
      max: max + padding
    };
  }

  /**
   * Get average value for a property
   * @param {string} property - Property name
   */
  getPropertyAverage(property) {
    if (this.dataPoints.length === 0) return 0;

    const sum = this.dataPoints.reduce((acc, dp) => acc + (dp[property] || 0), 0);
    return sum / this.dataPoints.length;
  }

  /**
   * Check if we have enough data to display graphs
   */
  hasEnoughData() {
    return this.dataPoints.length >= 2;
  }

  /**
   * Get data point count
   */
  getDataPointCount() {
    return this.dataPoints.length;
  }
}

export default SimulationRecorder;
