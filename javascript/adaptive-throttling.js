/**
 * Adaptive Throttling System
 * Dynamically adjusts throttling delays based on CPU performance
 */

class AdaptiveThrottlingSystem {
    constructor() {
        this.cpuLoadHistory = [];
        this.frameRateHistory = [];
        this.currentThrottleMultiplier = 1.0;
        
        // Base throttling delays (in ms)
        this.baseDelays = {
            scroll: 16,      // 60fps
            resize: 100,     // 10fps
            input: 300,      // 300ms debounce
            mousemove: 16,   // 60fps
            touchmove: 16,   // 60fps
            wheel: 16        // 60fps
        };
        
        // Performance thresholds
        this.thresholds = {
            lowCPU: 30,      // < 30% CPU usage
            mediumCPU: 60,   // 30-60% CPU usage
            highCPU: 80,     // 60-80% CPU usage
            criticalCPU: 90, // > 80% CPU usage
            
            goodFPS: 55,     // > 55 fps
            okFPS: 30,       // 30-55 fps
            poorFPS: 15      // < 30 fps
        };
        
        // Throttle multipliers based on performance
        this.multipliers = {
            excellent: 0.8,  // Reduce throttling when performance is good
            good: 1.0,       // Normal throttling
            medium: 1.5,     // Increase throttling moderately
            poor: 2.0,       // Increase throttling significantly
            critical: 3.0    // Maximum throttling
        };
        
        this.setupPerformanceMonitoring();
    }

    /**
     * Setup performance monitoring for adaptive throttling
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate
        this.frameRateMonitor = new FrameRateMonitor((fps) => {
            this.recordFrameRate(fps);
            this.updateThrottleMultiplier();
        });

        // Monitor CPU usage if available
        if (performance.memory) {
            setInterval(() => {
                this.estimateCPULoad();
                this.updateThrottleMultiplier();
            }, 5000); // Every 5 seconds
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) { // Long task > 50ms
                            this.recordLongTask(entry.duration);
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('[AdaptiveThrottling] Long task monitoring not supported');
            }
        }
    }

    /**
     * Get adaptive delay for event type
     */
    getAdaptiveDelay(eventType) {
        const baseDelay = this.baseDelays[eventType] || 100;
        return Math.round(baseDelay * this.currentThrottleMultiplier);
    }

    /**
     * Record frame rate measurement
     */
    recordFrameRate(fps) {
        this.frameRateHistory.push({
            fps,
            timestamp: Date.now()
        });

        // Keep only last 20 measurements
        if (this.frameRateHistory.length > 20) {
            this.frameRateHistory.shift();
        }
    }

    /**
     * Estimate CPU load based on available metrics
     */
    estimateCPULoad() {
        if (!performance.memory) return;

        const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        const avgFrameRate = this.getAverageFrameRate();
        
        // Estimate CPU load based on memory pressure and frame rate
        let estimatedLoad = 0;
        
        // Memory pressure contributes to CPU load estimation
        estimatedLoad += memoryUsage * 40; // 0-40% based on memory
        
        // Frame rate contributes to CPU load estimation
        if (avgFrameRate > this.thresholds.goodFPS) {
            estimatedLoad += 10; // Low CPU if good FPS
        } else if (avgFrameRate > this.thresholds.okFPS) {
            estimatedLoad += 30; // Medium CPU if ok FPS
        } else {
            estimatedLoad += 60; // High CPU if poor FPS
        }

        this.cpuLoadHistory.push({
            load: Math.min(100, estimatedLoad),
            timestamp: Date.now()
        });

        // Keep only last 10 measurements
        if (this.cpuLoadHistory.length > 10) {
            this.cpuLoadHistory.shift();
        }
    }

    /**
     * Record long task for performance analysis
     */
    recordLongTask(duration) {
        // Long tasks indicate high CPU usage
        const estimatedLoad = Math.min(100, (duration / 100) * 80); // Scale to 0-100%
        
        this.cpuLoadHistory.push({
            load: estimatedLoad,
            timestamp: Date.now(),
            longTask: true
        });
    }

    /**
     * Update throttle multiplier based on current performance
     */
    updateThrottleMultiplier() {
        const avgCPULoad = this.getAverageCPULoad();
        const avgFrameRate = this.getAverageFrameRate();
        
        let performanceLevel = 'good';
        
        // Determine performance level
        if (avgCPULoad > this.thresholds.criticalCPU || avgFrameRate < this.thresholds.poorFPS) {
            performanceLevel = 'critical';
        } else if (avgCPULoad > this.thresholds.highCPU || avgFrameRate < this.thresholds.okFPS) {
            performanceLevel = 'poor';
        } else if (avgCPULoad > this.thresholds.mediumCPU) {
            performanceLevel = 'medium';
        } else if (avgCPULoad < this.thresholds.lowCPU && avgFrameRate > this.thresholds.goodFPS) {
            performanceLevel = 'excellent';
        }
        
        // Update multiplier with smoothing
        const targetMultiplier = this.multipliers[performanceLevel];
        this.currentThrottleMultiplier = this.smoothTransition(
            this.currentThrottleMultiplier, 
            targetMultiplier, 
            0.1 // 10% change per update
        );
    }

    /**
     * Smooth transition between multiplier values
     */
    smoothTransition(current, target, factor) {
        return current + (target - current) * factor;
    }

    /**
     * Get average CPU load from recent history
     */
    getAverageCPULoad() {
        if (this.cpuLoadHistory.length === 0) return 50; // Default assumption
        
        const recentHistory = this.cpuLoadHistory.slice(-5); // Last 5 measurements
        const sum = recentHistory.reduce((acc, entry) => acc + entry.load, 0);
        return sum / recentHistory.length;
    }

    /**
     * Get average frame rate from recent history
     */
    getAverageFrameRate() {
        if (this.frameRateHistory.length === 0) return 60; // Default assumption
        
        const recentHistory = this.frameRateHistory.slice(-10); // Last 10 measurements
        const sum = recentHistory.reduce((acc, entry) => acc + entry.fps, 0);
        return sum / recentHistory.length;
    }

    /**
     * Get current performance statistics
     */
    getStats() {
        return {
            currentMultiplier: Math.round(this.currentThrottleMultiplier * 100) / 100,
            avgCPULoad: Math.round(this.getAverageCPULoad()),
            avgFrameRate: Math.round(this.getAverageFrameRate()),
            adaptiveDelays: {
                scroll: this.getAdaptiveDelay('scroll'),
                resize: this.getAdaptiveDelay('resize'),
                input: this.getAdaptiveDelay('input'),
                mousemove: this.getAdaptiveDelay('mousemove')
            },
            performanceLevel: this.getCurrentPerformanceLevel()
        };
    }

    /**
     * Get current performance level
     */
    getCurrentPerformanceLevel() {
        const avgCPULoad = this.getAverageCPULoad();
        const avgFrameRate = this.getAverageFrameRate();
        
        if (avgCPULoad > this.thresholds.criticalCPU || avgFrameRate < this.thresholds.poorFPS) {
            return 'critical';
        } else if (avgCPULoad > this.thresholds.highCPU || avgFrameRate < this.thresholds.okFPS) {
            return 'poor';
        } else if (avgCPULoad > this.thresholds.mediumCPU) {
            return 'medium';
        } else if (avgCPULoad < this.thresholds.lowCPU && avgFrameRate > this.thresholds.goodFPS) {
            return 'excellent';
        }
        return 'good';
    }

    /**
     * Force performance level for testing
     */
    setPerformanceLevel(level) {
        if (this.multipliers[level]) {
            this.currentThrottleMultiplier = this.multipliers[level];
        }
    }
}

/**
 * Simple Frame Rate Monitor
 */
class FrameRateMonitor {
    constructor(callback) {
        this.callback = callback;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.isRunning = false;
        
        this.start();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.measure();
    }

    stop() {
        this.isRunning = false;
    }

    measure() {
        if (!this.isRunning) return;

        this.frameCount++;
        const currentTime = performance.now();
        
        // Calculate FPS every second
        if (currentTime - this.lastTime >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.callback(fps);
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(() => this.measure());
    }
}

// Create global instance
window.adaptiveThrottlingSystem = new AdaptiveThrottlingSystem();

// Expose utility functions
window.getAdaptiveDelay = (eventType) => window.adaptiveThrottlingSystem.getAdaptiveDelay(eventType);
window.getThrottlingStats = () => window.adaptiveThrottlingSystem.getStats();
