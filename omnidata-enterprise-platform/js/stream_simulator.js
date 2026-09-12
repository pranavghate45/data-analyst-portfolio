/**
 * Real-Time Streaming Data Simulator with Z-Score Anomaly Alerts
 */

class StreamSimulator {
  constructor(updateCallback, alertCallback) {
    this.updateCallback = updateCallback;
    this.alertCallback = alertCallback;
    this.intervalId = null;
    this.isRunning = false;
    this.tickCount = 0;
    this.currentValue = 100.0;
    this.history = [];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  tick() {
    this.tickCount++;
    const delta = (Math.random() - 0.48) * 4.5;
    
    // Random Anomaly spike every ~15 ticks
    const isAnomaly = Math.random() < 0.07;
    const spike = isAnomaly ? (Math.random() > 0.5 ? 28.0 : -25.0) : 0.0;
    
    this.currentValue = Math.max(10.0, Math.round((this.currentValue + delta + spike) * 100) / 100);
    this.history.push(this.currentValue);
    if (this.history.length > 30) this.history.shift();

    if (this.updateCallback) {
      this.updateCallback({
        tick: this.tickCount,
        value: this.currentValue,
        history: [...this.history],
        isAnomaly
      });
    }

    if (isAnomaly && this.alertCallback) {
      this.alertCallback({
        tick: this.tickCount,
        value: this.currentValue,
        msg: `🚨 Real-Time Anomaly Spike Detected at Tick #${this.tickCount}! Value: ${this.currentValue}`
      });
    }
  }
}
