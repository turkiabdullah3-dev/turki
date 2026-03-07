// Timeline Graph Renderer
// Owner: Turki Abdullah © 2026

/**
 * TimelineRenderer
 * Renders line graphs and event markers for simulation timeline
 * Uses Canvas 2D for lightweight rendering
 */
export class TimelineRenderer {
  constructor() {
    this.padding = { top: 20, right: 20, bottom: 30, left: 50 };
    this.axisColor = 'rgba(120, 180, 255, 0.5)';
    this.gridColor = 'rgba(100, 150, 255, 0.1)';
    this.lineColor = 'rgba(100, 200, 255, 1)';
    this.eventColorMap = {
      photon_sphere: 'rgba(255, 200, 100, 0.8)',
      near_horizon: 'rgba(255, 100, 100, 0.8)',
      wormhole_throat: 'rgba(150, 200, 255, 0.8)'
    };
  }

  /**
   * Render a line graph on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {object} dataPoints - Array of data points
   * @param {string} xProperty - Property for X axis (timestamp)
   * @param {string} yProperty - Property for Y axis
   * @param {string} yLabel - Label for Y axis
   * @param {array} eventMarkers - Array of event markers
   * @param {object} range - { min, max } for Y axis
   */
  renderLineGraph(
    ctx,
    width,
    height,
    dataPoints,
    xProperty,
    yProperty,
    yLabel,
    eventMarkers = [],
    range = null
  ) {
    if (!dataPoints || dataPoints.length < 2 || !ctx) return;

    const graphWidth = width - this.padding.left - this.padding.right;
    const graphHeight = height - this.padding.top - this.padding.bottom;

    // Clear canvas
    ctx.fillStyle = 'rgba(10, 20, 40, 0)';
    ctx.fillRect(0, 0, width, height);

    // Get data range
    if (!range) {
      range = this.getDataRange(dataPoints, yProperty);
    }

    // Draw grid
    this.drawGrid(ctx, width, height, range);

    // Draw axes
    this.drawAxes(ctx, width, height, yLabel, range);

    // Draw data line
    this.drawDataLine(ctx, dataPoints, yProperty, graphWidth, graphHeight, range);

    // Draw event markers
    if (eventMarkers && eventMarkers.length > 0) {
      this.drawEventMarkers(
        ctx,
        eventMarkers,
        dataPoints,
        graphWidth,
        graphHeight,
        range
      );
    }
  }

  /**
   * Get min/max range for data
   * @param {array} dataPoints - Data points
   * @param {string} property - Property to analyze
   */
  getDataRange(dataPoints, property) {
    const values = dataPoints
      .map((dp) => dp[property] || 0)
      .filter((v) => !isNaN(v) && isFinite(v));

    if (values.length === 0) {
      return { min: 0, max: 1 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = range * 0.1;

    return {
      min: Math.max(0, min - padding),
      max: max + padding
    };
  }

  /**
   * Draw grid lines
   */
  drawGrid(ctx, width, height, range) {
    const graphWidth = width - this.padding.left - this.padding.right;
    const graphHeight = height - this.padding.top - this.padding.bottom;
    const startX = this.padding.left;
    const startY = this.padding.top;

    // Vertical grid lines (5 divisions)
    for (let i = 0; i <= 5; i++) {
      const x = startX + (graphWidth / 5) * i;
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + graphHeight);
      ctx.stroke();
    }

    // Horizontal grid lines (5 divisions)
    for (let i = 0; i <= 5; i++) {
      const y = startY + (graphHeight / 5) * i;
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + graphWidth, y);
      ctx.stroke();
    }
  }

  /**
   * Draw axes and labels
   */
  drawAxes(ctx, width, height, yLabel, range) {
    const startX = this.padding.left;
    const startY = this.padding.top;
    const graphHeight = height - this.padding.top - this.padding.bottom;

    // Draw axes
    ctx.strokeStyle = this.axisColor;
    ctx.lineWidth = 2;

    // Y axis
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + graphHeight);
    ctx.stroke();

    // X axis
    ctx.beginPath();
    ctx.moveTo(startX, startY + graphHeight);
    ctx.lineTo(width - this.padding.right, startY + graphHeight);
    ctx.stroke();

    // Y axis label
    ctx.save();
    ctx.fillStyle = 'rgba(150, 200, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.translate(15, startY + graphHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Y axis scale labels
    ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = startY + (graphHeight / 5) * i;
      const value = range.max - ((range.max - range.min) / 5) * i;
      ctx.fillText(value.toFixed(2), startX - 8, y + 3);
    }

    // X axis label
    ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', width / 2, height - 5);
  }

  /**
   * Draw line connecting data points
   */
  drawDataLine(ctx, dataPoints, property, graphWidth, graphHeight, range) {
    const startX = this.padding.left;
    const startY = this.padding.top;

    if (dataPoints.length < 2) return;

    // Get time range
    const timeRange = {
      min: dataPoints[0].timestamp || 0,
      max: dataPoints[dataPoints.length - 1].timestamp || 1
    };
    const timeDiff = timeRange.max - timeRange.min || 1;

    // Draw line
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    dataPoints.forEach((point, index) => {
      const value = point[property] || 0;
      const x =
        startX +
        ((point.timestamp - timeRange.min) / timeDiff) * graphWidth;
      const normalizedValue = (value - range.min) / (range.max - range.min);
      const y = startY + graphHeight - normalizedValue * graphHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points as small circles
    ctx.fillStyle = this.lineColor;
    dataPoints.forEach((point) => {
      const value = point[property] || 0;
      const x =
        startX +
        ((point.timestamp - timeRange.min) / timeDiff) * graphWidth;
      const normalizedValue = (value - range.min) / (range.max - range.min);
      const y = startY + graphHeight - normalizedValue * graphHeight;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Draw event markers on graph
   */
  drawEventMarkers(ctx, eventMarkers, dataPoints, graphWidth, graphHeight, range) {
    const startX = this.padding.left;
    const startY = this.padding.top;

    if (dataPoints.length < 2) return;

    const timeRange = {
      min: dataPoints[0].timestamp || 0,
      max: dataPoints[dataPoints.length - 1].timestamp || 1
    };
    const timeDiff = timeRange.max - timeRange.min || 1;

    eventMarkers.forEach((marker) => {
      const x =
        startX +
        ((marker.timestamp - timeRange.min) / timeDiff) * graphWidth;
      const y = startY + graphHeight;

      // Draw vertical line
      const color =
        this.eventColorMap[marker.type] ||
        'rgba(200, 200, 200, 0.5)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw marker circle at bottom
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y + 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = color;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(marker.label, x, y + 25);
    });
  }

  /**
   * Render timeline info panel (text summary)
   */
  renderTimelineInfo(ctx, width, height, recorder) {
    if (!recorder || !recorder.hasEnoughData()) {
      ctx.fillStyle = 'rgba(150, 150, 150, 0.7)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Collecting data... (need 2+ points)', 20, 40);
      return;
    }

    const y0 = 20;
    const lineHeight = 18;
    const dataCount = recorder.getDataPointCount();

    const info = [
      `Data Points: ${dataCount} / ${300}`,
      `Recording Time: ${recorder.simulationTime.toFixed(1)}s`,
      `Events: ${recorder.getEventMarkers().length}`,
      `Avg Redshift: ${recorder.getPropertyAverage('redshift').toFixed(3)}`,
      `Avg Tidal Force: ${recorder.getPropertyAverage('tidalForce').toFixed(3)}`
    ];

    ctx.fillStyle = 'rgba(150, 200, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    info.forEach((text, index) => {
      ctx.fillText(text, 20, y0 + lineHeight * (index + 1));
    });
  }
}

export default TimelineRenderer;
