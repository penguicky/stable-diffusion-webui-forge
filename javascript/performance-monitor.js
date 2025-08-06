/**
 * Real-time Performance Monitor
 * Tracks INP, memory usage, DOM complexity, and provides performance insights
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      inp: [],
      fid: [],
      cls: [],
      lcp: [],
      memoryUsage: [],
      domComplexity: [],
      eventListenerCount: 0,
      frameRate: [],
      slowInteractions: []
    };
    
    this.thresholds = {
      inp: 200, // ms - Interaction to Next Paint
      fid: 100, // ms - First Input Delay
      cls: 0.1,  // Cumulative Layout Shift
      lcp: 2500, // ms - Largest Contentful Paint
      memory: 300, // MB
      domNodes: 5000,
      frameRate: 55 // fps
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.performanceObserver = null;
    this.frameRateMonitor = null;
    
    // Performance alerts
    this.alertCallbacks = new Set();
    this.alertHistory = [];
    
    console.log('[PerformanceMonitor] Initialized with Core Web Vitals tracking');
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('[PerformanceMonitor] Already monitoring');
      return;
    }

    this.isMonitoring = true;
    
    // Setup Core Web Vitals monitoring
    this.setupWebVitalsMonitoring();
    
    // Setup memory monitoring
    this.setupMemoryMonitoring();
    
    // Setup DOM complexity monitoring
    this.setupDOMMonitoring();
    
    // Setup frame rate monitoring
    this.setupFrameRateMonitoring();
    
    // Setup interaction monitoring
    this.setupInteractionMonitoring();
    
    console.log('[PerformanceMonitor] Monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    if (this.frameRateMonitor) {
      this.frameRateMonitor.stop();
      this.frameRateMonitor = null;
    }
    
    console.log('[PerformanceMonitor] Monitoring stopped');
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  setupWebVitalsMonitoring() {
    if (!('PerformanceObserver' in window)) {
      console.warn('[PerformanceMonitor] PerformanceObserver not supported');
      return;
    }

    try {
      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fid = entry.processingStart - entry.startTime;
          this.recordFID(fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordLCP(entry.startTime);
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (clsValue > 0) {
          this.recordCLS(clsValue);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Monitor Long Tasks (for INP estimation)
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordLongTask(entry.duration);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

    } catch (error) {
      console.error('[PerformanceMonitor] Error setting up Web Vitals monitoring:', error);
    }
  }

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.recordMemoryUsage();
      this.checkPerformanceThresholds();
    }, 10000); // Every 10 seconds
  }

  /**
   * Setup DOM complexity monitoring
   */
  setupDOMMonitoring() {
    setInterval(() => {
      this.recordDOMComplexity();
    }, 30000); // Every 30 seconds
  }

  /**
   * Setup frame rate monitoring
   */
  setupFrameRateMonitoring() {
    this.frameRateMonitor = new FrameRateMonitor((fps) => {
      this.recordFrameRate(fps);
    });
    this.frameRateMonitor.start();
  }

  /**
   * Setup interaction monitoring
   */
  setupInteractionMonitoring() {
    const interactionEvents = ['click', 'keydown', 'touchstart'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.trackInteraction(event);
      }, { passive: true, capture: true });
    });
  }

  /**
   * Track user interactions for INP calculation
   */
  trackInteraction(event) {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to measure when the interaction is processed
    requestAnimationFrame(() => {
      const processingTime = performance.now() - startTime;
      this.recordINP(processingTime, event.type);
    });
  }

  /**
   * Record INP (Interaction to Next Paint)
   */
  recordINP(value, interactionType = 'unknown') {
    const entry = {
      value,
      interactionType,
      timestamp: Date.now(),
      url: window.location.pathname
    };
    
    this.metrics.inp.push(entry);
    
    // Keep only recent entries
    if (this.metrics.inp.length > 100) {
      this.metrics.inp.shift();
    }
    
    if (value > this.thresholds.inp) {
      this.triggerAlert('INP', value, `Slow ${interactionType} interaction: ${value.toFixed(2)}ms`);
      
      // Record as slow interaction
      this.metrics.slowInteractions.push({
        type: interactionType,
        duration: value,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Record First Input Delay
   */
  recordFID(value) {
    this.metrics.fid.push({
      value,
      timestamp: Date.now()
    });
    
    if (value > this.thresholds.fid) {
      this.triggerAlert('FID', value, `High first input delay: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Record Largest Contentful Paint
   */
  recordLCP(value) {
    this.metrics.lcp.push({
      value,
      timestamp: Date.now()
    });
    
    if (value > this.thresholds.lcp) {
      this.triggerAlert('LCP', value, `Slow loading: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Record Cumulative Layout Shift
   */
  recordCLS(value) {
    this.metrics.cls.push({
      value,
      timestamp: Date.now()
    });
    
    if (value > this.thresholds.cls) {
      this.triggerAlert('CLS', value, `Layout shift detected: ${value.toFixed(3)}`);
    }
  }

  /**
   * Record long task for performance analysis
   */
  recordLongTask(duration) {
    if (duration > 50) { // Tasks longer than 50ms
      console.warn(`[PerformanceMonitor] Long task detected: ${duration.toFixed(2)}ms`);
      
      // Estimate INP impact
      const estimatedINP = duration * 1.5; // Rough estimation
      this.recordINP(estimatedINP, 'long-task');
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage() {
    if (!performance.memory) return;
    
    const memoryInfo = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      timestamp: Date.now()
    };
    
    this.metrics.memoryUsage.push(memoryInfo);
    
    // Keep only recent entries
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
    
    if (memoryInfo.used > this.thresholds.memory) {
      this.triggerAlert('Memory', memoryInfo.used, `High memory usage: ${memoryInfo.used}MB`);
    }
  }

  /**
   * Record DOM complexity
   */
  recordDOMComplexity() {
    const domInfo = {
      nodeCount: document.querySelectorAll('*').length,
      depth: this.calculateDOMDepth(),
      timestamp: Date.now()
    };
    
    this.metrics.domComplexity.push(domInfo);
    
    if (domInfo.nodeCount > this.thresholds.domNodes) {
      this.triggerAlert('DOM', domInfo.nodeCount, `High DOM complexity: ${domInfo.nodeCount} nodes`);
    }
  }

  /**
   * Record frame rate
   */
  recordFrameRate(fps) {
    this.metrics.frameRate.push({
      value: fps,
      timestamp: Date.now()
    });
    
    // Keep only recent entries
    if (this.metrics.frameRate.length > 60) {
      this.metrics.frameRate.shift();
    }
    
    if (fps < this.thresholds.frameRate) {
      this.triggerAlert('FPS', fps, `Low frame rate: ${fps.toFixed(1)} fps`);
    }
  }

  /**
   * Calculate DOM depth
   */
  calculateDOMDepth() {
    let maxDepth = 0;
    
    function traverse(element, depth) {
      maxDepth = Math.max(maxDepth, depth);
      for (let child of element.children) {
        traverse(child, depth + 1);
      }
    }
    
    traverse(document.body, 0);
    return maxDepth;
  }

  /**
   * Check performance thresholds
   */
  checkPerformanceThresholds() {
    // Check recent INP values
    const recentINP = this.metrics.inp.slice(-10);
    if (recentINP.length > 0) {
      const avgINP = recentINP.reduce((sum, entry) => sum + entry.value, 0) / recentINP.length;
      if (avgINP > this.thresholds.inp) {
        this.triggerAlert('INP_Trend', avgINP, `Consistently slow interactions: ${avgINP.toFixed(2)}ms average`);
      }
    }
  }

  /**
   * Trigger performance alert
   */
  triggerAlert(type, value, message) {
    const alert = {
      type,
      value,
      message,
      timestamp: Date.now(),
      url: window.location.pathname
    };
    
    this.alertHistory.push(alert);
    
    // Keep only recent alerts
    if (this.alertHistory.length > 50) {
      this.alertHistory.shift();
    }
    
    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('[PerformanceMonitor] Alert callback error:', error);
      }
    });
    
    console.warn(`[PerformanceMonitor] ${message}`);
  }

  /**
   * Add alert callback
   */
  onAlert(callback) {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  /**
   * Get current performance statistics
   */
  getStats() {
    const now = Date.now();
    const recentWindow = 60000; // 1 minute
    
    // Calculate recent averages
    const recentINP = this.metrics.inp.filter(entry => now - entry.timestamp < recentWindow);
    const recentMemory = this.metrics.memoryUsage.filter(entry => now - entry.timestamp < recentWindow);
    const recentFPS = this.metrics.frameRate.filter(entry => now - entry.timestamp < recentWindow);
    
    return {
      inp: {
        current: recentINP.length > 0 ? recentINP[recentINP.length - 1].value : null,
        average: recentINP.length > 0 ? recentINP.reduce((sum, e) => sum + e.value, 0) / recentINP.length : null,
        p95: this.calculatePercentile(recentINP.map(e => e.value), 95),
        threshold: this.thresholds.inp
      },
      memory: {
        current: recentMemory.length > 0 ? recentMemory[recentMemory.length - 1].used : null,
        trend: this.calculateTrend(recentMemory.map(e => e.used)),
        threshold: this.thresholds.memory
      },
      frameRate: {
        current: recentFPS.length > 0 ? recentFPS[recentFPS.length - 1].value : null,
        average: recentFPS.length > 0 ? recentFPS.reduce((sum, e) => sum + e.value, 0) / recentFPS.length : null,
        threshold: this.thresholds.frameRate
      },
      dom: {
        nodeCount: this.metrics.domComplexity.length > 0 ? 
          this.metrics.domComplexity[this.metrics.domComplexity.length - 1].nodeCount : null,
        threshold: this.thresholds.domNodes
      },
      alerts: {
        recent: this.alertHistory.filter(alert => now - alert.timestamp < recentWindow),
        total: this.alertHistory.length
      },
      slowInteractions: this.metrics.slowInteractions.filter(interaction => 
        now - interaction.timestamp < recentWindow
      )
    };
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return null;
    
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Calculate trend (positive = increasing, negative = decreasing)
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((sum, v) => sum + v, 0) / first.length;
    const secondAvg = second.reduce((sum, v) => sum + v, 0) / second.length;
    
    return secondAvg - firstAvg;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.getStats();
    
    return {
      timestamp: Date.now(),
      url: window.location.pathname,
      performance: stats,
      recommendations: this.generateRecommendations(stats),
      summary: this.generateSummary(stats)
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(stats) {
    const recommendations = [];
    
    if (stats.inp.average > this.thresholds.inp) {
      recommendations.push({
        type: 'INP',
        priority: 'high',
        message: 'Optimize event handlers and reduce JavaScript execution time',
        value: stats.inp.average
      });
    }
    
    if (stats.memory.current > this.thresholds.memory) {
      recommendations.push({
        type: 'Memory',
        priority: 'medium',
        message: 'Check for memory leaks and optimize resource usage',
        value: stats.memory.current
      });
    }
    
    if (stats.frameRate.average < this.thresholds.frameRate) {
      recommendations.push({
        type: 'FPS',
        priority: 'medium',
        message: 'Optimize animations and reduce DOM manipulation',
        value: stats.frameRate.average
      });
    }
    
    return recommendations;
  }

  /**
   * Generate performance summary
   */
  generateSummary(stats) {
    const issues = [];
    
    if (stats.inp.average > this.thresholds.inp) issues.push('Slow interactions');
    if (stats.memory.current > this.thresholds.memory) issues.push('High memory usage');
    if (stats.frameRate.average < this.thresholds.frameRate) issues.push('Low frame rate');
    
    return {
      status: issues.length === 0 ? 'good' : issues.length <= 2 ? 'needs-improvement' : 'poor',
      issues,
      score: Math.max(0, 100 - (issues.length * 25))
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopMonitoring();
    this.alertCallbacks.clear();
    this.alertHistory = [];
    
    Object.keys(this.metrics).forEach(key => {
      if (Array.isArray(this.metrics[key])) {
        this.metrics[key] = [];
      }
    });
    
    console.log('[PerformanceMonitor] Cleanup completed');
  }
}

/**
 * Frame Rate Monitor Helper Class
 */
class FrameRateMonitor {
  constructor(callback) {
    this.callback = callback;
    this.isRunning = false;
    this.frameCount = 0;
    this.lastTime = 0;
    this.rafId = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    this.frameCount++;
    
    if (now - this.lastTime >= 1000) { // Calculate FPS every second
      const fps = (this.frameCount * 1000) / (now - this.lastTime);
      this.callback(fps);
      
      this.frameCount = 0;
      this.lastTime = now;
    }
    
    this.rafId = requestAnimationFrame(() => this.tick());
  }
}

// Create global instance
window.performanceMonitor = window.performanceMonitor || new PerformanceMonitor();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.performanceMonitor) {
    window.performanceMonitor.cleanup();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

console.log('[PerformanceMonitor] Loaded. Use window.performanceMonitor.startMonitoring() to begin tracking.');
