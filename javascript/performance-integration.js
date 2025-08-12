/**
 * Performance Integration Script
 * Initializes and coordinates all performance optimization systems
 */

class PerformanceIntegration {
  constructor() {
    this.systems = {
      memoryManager: null,
      optimizedEventHandlers: null,
      domQueryOptimizer: null,
      domUpdateBatcher: null,
      performanceMonitor: null
    };
    
    this.isInitialized = false;
    this.initializationPromise = null;
    
    // Initializing performance systems...
  }

  /**
   * Initialize all performance systems
   */
  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      // Wait for all systems to be available
      await this.waitForSystems();
      
      // Initialize systems
      this.initializeSystems();
      
      // Setup integrations
      this.setupIntegrations();
      
      // Optimize existing page elements
      this.optimizeExistingElements();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isInitialized = true;
      // All systems initialized successfully

      // Load additional performance tools
      try {
        this.loadPerformanceTools();
        console.log('[PerformanceIntegration] Performance tools loading initiated');
      } catch (error) {
        console.error('[PerformanceIntegration] Failed to load performance tools:', error);
      }

      // Dispatch initialization event
      window.dispatchEvent(new CustomEvent('performance-systems-ready', {
        detail: { systems: this.systems }
      }));
      
    } catch (error) {
      console.error('[PerformanceIntegration] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Wait for all performance systems to be loaded
   */
  async waitForSystems() {
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 100; // 100ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const loadedSystems = this.getLoadedSystems();
      // Loaded systems: ${loadedSystems.join(', ')}

      if (this.areAllSystemsLoaded()) {
        // All systems loaded successfully
        return;
      }
      await this.delay(checkInterval);
    }

    const loadedSystems = this.getLoadedSystems();
    const missingSystems = this.getMissingSystems();

    console.warn(`[PerformanceIntegration] Timeout waiting for systems. Loaded: ${loadedSystems.join(', ')}, Missing: ${missingSystems.join(', ')}`);

    // Continue with partial initialization if some systems are available
    if (loadedSystems.length > 0) {
      // Continuing with partial initialization
      return;
    }

    throw new Error(`Timeout waiting for performance systems to load. Missing: ${missingSystems.join(', ')}`);
  }

  /**
   * Check if all systems are loaded
   */
  areAllSystemsLoaded() {
    return window.memoryManager &&
           window.optimizedEventHandlers &&
           window.domQueryOptimizer &&
           window.domUpdateBatcher &&
           window.performanceMonitor;
  }

  /**
   * Get list of loaded systems
   */
  getLoadedSystems() {
    const systems = [];
    if (window.memoryManager) systems.push('memoryManager');
    if (window.optimizedEventHandlers) systems.push('optimizedEventHandlers');
    if (window.domQueryOptimizer) systems.push('domQueryOptimizer');
    if (window.domUpdateBatcher) systems.push('domUpdateBatcher');
    if (window.performanceMonitor) systems.push('performanceMonitor');
    return systems;
  }

  /**
   * Get list of missing systems
   */
  getMissingSystems() {
    const missing = [];
    if (!window.memoryManager) missing.push('memoryManager');
    if (!window.optimizedEventHandlers) missing.push('optimizedEventHandlers');
    if (!window.domQueryOptimizer) missing.push('domQueryOptimizer');
    if (!window.domUpdateBatcher) missing.push('domUpdateBatcher');
    if (!window.performanceMonitor) missing.push('performanceMonitor');
    return missing;
  }

  /**
   * Initialize individual systems
   */
  initializeSystems() {
    // Initialize available systems
    this.systems.memoryManager = window.memoryManager || null;
    this.systems.optimizedEventHandlers = window.optimizedEventHandlers || null;
    this.systems.domQueryOptimizer = window.domQueryOptimizer || null;
    this.systems.domUpdateBatcher = window.domUpdateBatcher || null;
    this.systems.performanceMonitor = window.performanceMonitor || null;

    // Log which systems are available
    const availableSystems = Object.entries(this.systems)
      .filter(([key, value]) => value !== null)
      .map(([key]) => key);

    const unavailableSystems = Object.entries(this.systems)
      .filter(([key, value]) => value === null)
      .map(([key]) => key);

    // Available systems: ${availableSystems}
    if (unavailableSystems.length > 0) {
      console.warn('[PerformanceIntegration] Unavailable systems:', unavailableSystems);
    }
  }

  /**
   * Setup integrations between systems
   */
  setupIntegrations() {
    // Setup performance alerts if monitor is available
    if (this.systems.performanceMonitor) {
      this.systems.performanceMonitor.onAlert((alert) => {
        this.handlePerformanceAlert(alert);
      });
    }

    // Setup automatic cache invalidation on DOM changes
    this.setupCacheInvalidation();

    // Setup memory pressure handling
    this.setupMemoryPressureHandling();

    // System integrations configured
  }

  /**
   * Setup cache invalidation on significant DOM changes
   */
  setupCacheInvalidation() {
    const observer = new MutationObserver((mutations) => {
      let shouldInvalidate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 5) {
          shouldInvalidate = true;
        }
      });
      
      if (shouldInvalidate && this.systems.domQueryOptimizer) {
        this.systems.domQueryOptimizer.invalidateCache();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.systems.memoryManager.trackObserver(observer);
  }

  /**
   * Setup memory pressure handling
   */
  setupMemoryPressureHandling() {
    // Monitor memory usage and trigger cleanup when needed
    setInterval(() => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
        
        if (memoryUsage > 400) { // 400MB threshold
          console.warn('[PerformanceIntegration] High memory usage detected, triggering cleanup');
          this.triggerMemoryCleanup();
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Trigger memory cleanup across all systems
   */
  triggerMemoryCleanup() {
    // Clear DOM query cache if available
    if (this.systems.domQueryOptimizer) {
      this.systems.domQueryOptimizer.cleanupExpiredCache();
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Schedule partial cleanup if available
    if (this.systems.memoryManager) {
      this.systems.memoryManager.scheduleCleanup();
    }

    // Memory cleanup completed
  }

  /**
   * Handle performance alerts
   */
  handlePerformanceAlert(alert) {
    console.warn(`[PerformanceIntegration] Performance Alert: ${alert.message}`);
    
    // Take corrective actions based on alert type
    switch (alert.type) {
      case 'INP':
      case 'INP_Trend':
        this.handleSlowInteractions();
        break;
      case 'Memory':
        this.triggerMemoryCleanup();
        break;
      case 'FPS':
        this.optimizeAnimations();
        break;
    }
  }

  /**
   * Handle slow interactions
   */
  handleSlowInteractions() {
    // Increase debounce delays for better performance
    // Optimizing for slow interactions
    
    // Could implement adaptive debouncing here
    // For now, just log the issue
  }

  /**
   * Optimize animations during low FPS
   */
  optimizeAnimations() {
    // Optimizing animations for better FPS
    
    // Could reduce animation complexity or disable non-essential animations
    // For now, just log the issue
  }

  /**
   * Optimize existing page elements
   */
  optimizeExistingElements() {
    // Optimizing existing page elements...

    // Optimize common high-frequency event handlers
    this.optimizeScrollHandlers();
    this.optimizeInputHandlers();
    this.optimizeResizeHandlers();

    // Pre-cache common selectors
    this.precacheCommonSelectors();

    // Page optimization completed
  }

  /**
   * Optimize scroll event handlers
   */
  optimizeScrollHandlers() {
    const scrollableElements = document.querySelectorAll('.gradio-gallery, .scroll-container, [style*="overflow"]');
    
    scrollableElements.forEach(element => {
      // Replace existing scroll handlers with throttled versions
      this.systems.optimizedEventHandlers.addThrottledHandler(
        element, 
        'scroll', 
        () => {
          // Placeholder for scroll handling
          console.log('Optimized scroll handler');
        }, 
        16 // 60fps
      );
    });
  }

  /**
   * Optimize input event handlers
   */
  optimizeInputHandlers() {
    const inputElements = document.querySelectorAll('input[type="text"], textarea');
    
    inputElements.forEach(element => {
      // Add optimized input handlers
      this.systems.optimizedEventHandlers.addDebouncedHandler(
        element,
        'input',
        () => {
          // Placeholder for input handling
          console.log('Optimized input handler');
        },
        300
      );
    });
  }

  /**
   * Optimize resize handlers
   */
  optimizeResizeHandlers() {
    this.systems.optimizedEventHandlers.addThrottledHandler(
      window,
      'resize',
      () => {
        // Batch resize-related DOM updates
        this.systems.domUpdateBatcher.scheduleWrite(() => {
          // Trigger resize handling
          window.dispatchEvent(new CustomEvent('optimized-resize'));
        });
      },
      100
    );
  }

  /**
   * Pre-cache common selectors
   */
  precacheCommonSelectors() {
    const commonSelectors = [
      '#txt2img_prompt',
      '#img2img_prompt',
      '.gradio-gallery',
      '.thumbnail-item',
      '[id$="_extra_search"]',
      '.tab-nav button',
      '#txt2img_generate',
      '#img2img_generate'
    ];
    
    // Batch query common selectors to populate cache
    this.systems.domQueryOptimizer.batchQuery(
      commonSelectors.map(selector => ({ selector, maxAge: 10000 }))
    );
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.systems.performanceMonitor) {
      this.systems.performanceMonitor.startMonitoring();

      // Log initial performance stats
      setTimeout(() => {
        const stats = this.getPerformanceStats();
        // Initial performance stats: ${stats}
      }, 5000);
    } else {
      console.warn('[PerformanceIntegration] Performance monitor not available');
    }
  }

  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats() {
    const stats = {};

    if (this.systems.memoryManager) {
      stats.memoryManager = this.systems.memoryManager.getStats();
    }

    if (this.systems.optimizedEventHandlers) {
      stats.eventHandlers = this.systems.optimizedEventHandlers.getStats();
    }

    if (this.systems.domQueryOptimizer) {
      stats.domQueries = this.systems.domQueryOptimizer.getStats();
    }

    if (this.systems.domUpdateBatcher) {
      stats.domUpdates = this.systems.domUpdateBatcher.getStats();
    }

    if (this.systems.performanceMonitor) {
      stats.performance = this.systems.performanceMonitor.getStats();
    }

    return stats;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.getPerformanceStats();
    const report = this.systems.performanceMonitor.generateReport();
    
    return {
      ...report,
      systemStats: stats,
      timestamp: Date.now(),
      isOptimized: this.isInitialized
    };
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up all systems
   */
  cleanup() {
    // Cleaning up all systems...

    Object.values(this.systems).forEach(system => {
      if (system && typeof system.cleanup === 'function') {
        system.cleanup();
      }
    });

    this.isInitialized = false;
    // Cleanup completed
  }

  /**
   * Load additional performance tools and test suites
   */
  loadPerformanceTools() {
    console.log('[PerformanceIntegration] Starting to load performance tools...');

    try {
      // Load CPU optimization systems
      this.loadAdaptiveThrottling();
      console.log('[PerformanceIntegration] Adaptive throttling loading attempted');

      this.loadBackgroundProcessor();
      console.log('[PerformanceIntegration] Background processor loading attempted');

      this.loadCPUValidator();
      console.log('[PerformanceIntegration] CPU validator loading attempted');

      // Load network optimization systems
      this.loadNetworkOptimizations();
      console.log('[PerformanceIntegration] Network optimizations loading attempted');

      // Verify systems loaded after a short delay
      setTimeout(() => {
        this.verifySystemsLoaded();
      }, 1000);

      console.log('[PerformanceIntegration] Performance tools loading completed');

    } catch (error) {
      console.error('[PerformanceIntegration] Error loading performance tools:', error);
    }
  }

  /**
   * Verify that all systems loaded correctly
   */
  verifySystemsLoaded() {
    const cpuSystems = {
      adaptiveThrottlingSystem: !!window.adaptiveThrottlingSystem,
      backgroundProcessor: !!window.backgroundProcessor,
      getAdaptiveDelay: !!window.getAdaptiveDelay,
      getThrottlingStats: !!window.getThrottlingStats,
      processInBackground: !!window.processInBackground,
      getBackgroundStats: !!window.getBackgroundStats
    };

    const networkSystems = {
      requestBatcher: !!window.requestBatcher,
      responseCache: !!window.responseCache,
      connectionPool: !!window.connectionPool,
      batchedFetch: !!window.batchedFetch,
      getCachedResponse: !!window.getCachedResponse,
      pooledFetch: !!window.pooledFetch
    };

    const cpuLoadedCount = Object.values(cpuSystems).filter(Boolean).length;
    const networkLoadedCount = Object.values(networkSystems).filter(Boolean).length;

    console.log(`[PerformanceIntegration] CPU systems: ${cpuLoadedCount}/6 loaded`);
    console.log(`[PerformanceIntegration] Network systems: ${networkLoadedCount}/6 loaded`);

    if (cpuLoadedCount < 6) {
      console.warn('[PerformanceIntegration] Some CPU systems failed to load, attempting retry...');
      this.retryFailedSystems(cpuSystems);
    }

    if (networkLoadedCount < 6) {
      console.warn('[PerformanceIntegration] Some network systems failed to load, attempting retry...');
      this.retryFailedNetworkSystems(networkSystems);
    }

    if (cpuLoadedCount >= 6 && networkLoadedCount >= 6) {
      console.log('[PerformanceIntegration] All performance systems loaded successfully');
    }
  }

  /**
   * Retry loading failed systems
   */
  retryFailedSystems(systems) {
    if (!systems.adaptiveThrottlingSystem || !systems.getAdaptiveDelay) {
      console.log('[PerformanceIntegration] Retrying adaptive throttling...');
      this.loadAdaptiveThrottling();
    }

    if (!systems.backgroundProcessor || !systems.processInBackground) {
      console.log('[PerformanceIntegration] Retrying background processor...');
      this.loadBackgroundProcessor();
    }
  }

  /**
   * Retry loading failed network systems
   */
  retryFailedNetworkSystems(systems) {
    console.log('[PerformanceIntegration] Retrying failed network systems...');

    // Try to reload network scripts
    if (!systems.requestBatcher || !systems.batchedFetch) {
      console.log('[PerformanceIntegration] Retrying request batcher...');
      this.loadScript('/src/javascript/request-batcher.js')
        .catch(error => console.error('[PerformanceIntegration] Request batcher retry failed:', error));
    }

    if (!systems.responseCache || !systems.getCachedResponse) {
      console.log('[PerformanceIntegration] Retrying response cache...');
      this.loadScript('/src/javascript/response-cache.js')
        .catch(error => console.error('[PerformanceIntegration] Response cache retry failed:', error));
    }

    if (!systems.connectionPool || !systems.pooledFetch) {
      console.log('[PerformanceIntegration] Retrying connection pool...');
      this.loadScript('/src/javascript/connection-pool.js')
        .catch(error => console.error('[PerformanceIntegration] Connection pool retry failed:', error));
    }

    // Verify again after retry
    setTimeout(() => {
      const retryCheck = {
        requestBatcher: !!window.requestBatcher,
        responseCache: !!window.responseCache,
        connectionPool: !!window.connectionPool,
        batchedFetch: !!window.batchedFetch,
        getCachedResponse: !!window.getCachedResponse,
        pooledFetch: !!window.pooledFetch
      };

      const retryCount = Object.values(retryCheck).filter(Boolean).length;
      console.log(`[PerformanceIntegration] Network retry result: ${retryCount}/6 systems loaded`);

      if (retryCount < 6) {
        console.warn('[PerformanceIntegration] Network systems still failing, manual intervention may be needed');
      }
    }, 3000);
  }

  /**
   * Load CPU System Validator
   */
  loadCPUValidator() {
    // Try to load the validator script
    this.loadScript('/src/javascript/cpu-system-validator.js')
      .then(() => {
        console.log('[PerformanceIntegration] CPU System Validator loaded');

        // Run initial validation after a short delay
        setTimeout(() => {
          if (window.quickCPUCheck) {
            const check = window.quickCPUCheck();
            console.log(`[PerformanceIntegration] Initial CPU check: ${check.total}/${check.maxTotal} systems available`);
          }
        }, 2000);
      })
      .catch(error => {
        console.warn('[PerformanceIntegration] Failed to load CPU validator:', error);
      });
  }

  /**
   * Load Adaptive Throttling System directly
   */
  loadAdaptiveThrottling() {
    console.log('[PerformanceIntegration] Loading Adaptive Throttling System...');

    if (window.adaptiveThrottlingSystem) {
      console.log('[PerformanceIntegration] Adaptive Throttling already loaded');
      return;
    }

    try {
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
          console.log('[AdaptiveThrottling] System initialized');
        }

        setupPerformanceMonitoring() {
          // Simple frame rate monitoring
          this.frameCount = 0;
          this.lastFrameTime = performance.now();
          this.isMonitoring = true;

          this.monitorFrameRate();

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

        monitorFrameRate() {
          if (!this.isMonitoring) return;

          this.frameCount++;
          const currentTime = performance.now();

          // Calculate FPS every second
          if (currentTime - this.lastFrameTime >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
            this.recordFrameRate(fps);

            this.frameCount = 0;
            this.lastFrameTime = currentTime;
          }

          requestAnimationFrame(() => this.monitorFrameRate());
        }

        getAdaptiveDelay(eventType) {
          const baseDelay = this.baseDelays[eventType] || 100;
          return Math.round(baseDelay * this.currentThrottleMultiplier);
        }

        recordFrameRate(fps) {
          this.frameRateHistory.push({
            fps,
            timestamp: Date.now()
          });

          // Keep only last 20 measurements
          if (this.frameRateHistory.length > 20) {
            this.frameRateHistory.shift();
          }

          this.updateThrottleMultiplier();
        }

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

        recordLongTask(duration) {
          // Long tasks indicate high CPU usage
          const estimatedLoad = Math.min(100, (duration / 100) * 80); // Scale to 0-100%

          this.cpuLoadHistory.push({
            load: estimatedLoad,
            timestamp: Date.now(),
            longTask: true
          });
        }

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

        smoothTransition(current, target, factor) {
          return current + (target - current) * factor;
        }

        getAverageCPULoad() {
          if (this.cpuLoadHistory.length === 0) return 50; // Default assumption

          const recentHistory = this.cpuLoadHistory.slice(-5); // Last 5 measurements
          const sum = recentHistory.reduce((acc, entry) => acc + entry.load, 0);
          return sum / recentHistory.length;
        }

        getAverageFrameRate() {
          if (this.frameRateHistory.length === 0) return 60; // Default assumption

          const recentHistory = this.frameRateHistory.slice(-10); // Last 10 measurements
          const sum = recentHistory.reduce((acc, entry) => acc + entry.fps, 0);
          return sum / recentHistory.length;
        }

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

        setPerformanceLevel(level) {
          if (this.multipliers[level]) {
            this.currentThrottleMultiplier = this.multipliers[level];
          }
        }

        cleanup() {
          this.isMonitoring = false;
        }
      }

      // Create global instance
      window.adaptiveThrottlingSystem = new AdaptiveThrottlingSystem();

      // Expose utility functions
      window.getAdaptiveDelay = (eventType) => window.adaptiveThrottlingSystem.getAdaptiveDelay(eventType);
      window.getThrottlingStats = () => window.adaptiveThrottlingSystem.getStats();

      console.log('[PerformanceIntegration] Adaptive Throttling System loaded successfully');

      // Verify it's working
      if (window.getAdaptiveDelay) {
        const testDelay = window.getAdaptiveDelay('scroll');
        console.log(`[PerformanceIntegration] Adaptive throttling test: scroll delay = ${testDelay}ms`);
      }

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to load Adaptive Throttling:', error);
      console.error('[PerformanceIntegration] Error details:', error.stack);
    }
  }

  /**
   * Load Background Processor System directly
   */
  loadBackgroundProcessor() {
    console.log('[PerformanceIntegration] Loading Background Processor System...');

    if (window.backgroundProcessor) {
      console.log('[PerformanceIntegration] Background Processor already loaded');
      return;
    }

    try {
      class BackgroundProcessor {
        constructor() {
          this.taskQueue = [];
          this.isProcessing = false;
          this.maxConcurrentTasks = 2;
          this.activeTasks = new Set();

          // Task priorities
          this.priorities = {
            LOW: 1,
            NORMAL: 2,
            HIGH: 3,
            CRITICAL: 4
          };

          // Performance monitoring
          this.stats = {
            tasksProcessed: 0,
            tasksQueued: 0,
            averageProcessingTime: 0,
            backgroundUtilization: 0
          };

          this.setupBackgroundProcessing();
          console.log('[BackgroundProcessor] System initialized');
        }

        setupBackgroundProcessing() {
          // Check for requestIdleCallback support
          this.hasIdleCallback = 'requestIdleCallback' in window;

          // Check for Web Worker support
          this.hasWebWorkers = 'Worker' in window;

          // Start processing loop
          this.startProcessingLoop();
        }

        addTask(taskFunction, options = {}) {
          const task = {
            id: this.generateTaskId(),
            function: taskFunction,
            priority: options.priority || this.priorities.NORMAL,
            timeout: options.timeout || 30000, // 30 second timeout
            useWebWorker: options.useWebWorker || false,
            onComplete: options.onComplete || (() => {}),
            onError: options.onError || ((error) => console.error('[BackgroundProcessor] Task error:', error)),
            createdAt: Date.now(),
            data: options.data || null
          };

          // Insert task in priority order
          this.insertTaskByPriority(task);
          this.stats.tasksQueued++;

          // Start processing if not already running
          if (!this.isProcessing) {
            this.processNextTask();
          }

          return task.id;
        }

        insertTaskByPriority(task) {
          let insertIndex = this.taskQueue.length;

          for (let i = 0; i < this.taskQueue.length; i++) {
            if (this.taskQueue[i].priority < task.priority) {
              insertIndex = i;
              break;
            }
          }

          this.taskQueue.splice(insertIndex, 0, task);
        }

        startProcessingLoop() {
          const processLoop = () => {
            if (this.taskQueue.length > 0 && this.activeTasks.size < this.maxConcurrentTasks) {
              this.processNextTask();
            }

            // Schedule next iteration
            if (this.hasIdleCallback) {
              requestIdleCallback(processLoop, { timeout: 1000 });
            } else {
              setTimeout(processLoop, 16); // ~60fps fallback
            }
          };

          processLoop();
        }

        async processNextTask() {
          if (this.taskQueue.length === 0 || this.activeTasks.size >= this.maxConcurrentTasks) {
            return;
          }

          const task = this.taskQueue.shift();
          this.activeTasks.add(task.id);
          this.isProcessing = true;

          const startTime = performance.now();

          try {
            let result;

            if (task.useWebWorker && this.hasWebWorkers) {
              result = await this.executeInWebWorker(task);
            } else {
              result = await this.executeInMainThread(task);
            }

            const processingTime = performance.now() - startTime;
            this.updateStats(processingTime);

            task.onComplete(result);
            this.stats.tasksProcessed++;

          } catch (error) {
            task.onError(error);
          } finally {
            this.activeTasks.delete(task.id);

            if (this.activeTasks.size === 0 && this.taskQueue.length === 0) {
              this.isProcessing = false;
            }
          }
        }

        executeInWebWorker(task) {
          return new Promise((resolve, reject) => {
            // Create worker with task function
            const workerCode = `
              self.onmessage = function(e) {
                try {
                  const taskFunction = new Function('data', e.data.functionCode);
                  const result = taskFunction(e.data.taskData);
                  self.postMessage({ success: true, result: result });
                } catch (error) {
                  self.postMessage({ success: false, error: error.message });
                }
              };
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));

            // Set timeout
            const timeout = setTimeout(() => {
              worker.terminate();
              reject(new Error('Task timeout'));
            }, task.timeout);

            worker.onmessage = (e) => {
              clearTimeout(timeout);
              worker.terminate();
              URL.revokeObjectURL(blob);

              if (e.data.success) {
                resolve(e.data.result);
              } else {
                reject(new Error(e.data.error));
              }
            };

            worker.onerror = (error) => {
              clearTimeout(timeout);
              worker.terminate();
              URL.revokeObjectURL(blob);
              reject(error);
            };

            // Send task to worker
            worker.postMessage({
              functionCode: task.function.toString(),
              taskData: task.data
            });
          });
        }

        executeInMainThread(task) {
          return new Promise((resolve, reject) => {
            const executeWithTimeSlicing = () => {
              if (this.hasIdleCallback) {
                requestIdleCallback((deadline) => {
                  try {
                    const result = task.function(task.data);
                    resolve(result);
                  } catch (error) {
                    reject(error);
                  }
                }, { timeout: task.timeout });
              } else {
                // Fallback: execute with setTimeout to yield control
                setTimeout(() => {
                  try {
                    const result = task.function(task.data);
                    resolve(result);
                  } catch (error) {
                    reject(error);
                  }
                }, 0);
              }
            };

            executeWithTimeSlicing();
          });
        }

        updateStats(processingTime) {
          const currentAvg = this.stats.averageProcessingTime;
          const totalTasks = this.stats.tasksProcessed + 1;

          this.stats.averageProcessingTime = (currentAvg * this.stats.tasksProcessed + processingTime) / totalTasks;
          this.stats.backgroundUtilization = (this.activeTasks.size / this.maxConcurrentTasks) * 100;
        }

        generateTaskId() {
          return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        cancelTask(taskId) {
          const taskIndex = this.taskQueue.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            this.taskQueue.splice(taskIndex, 1);
            return true;
          }
          return false;
        }

        clearQueue() {
          this.taskQueue.length = 0;
        }

        getStats() {
          return {
            ...this.stats,
            queueLength: this.taskQueue.length,
            activeTasks: this.activeTasks.size,
            maxConcurrentTasks: this.maxConcurrentTasks,
            capabilities: {
              webWorkers: this.hasWebWorkers,
              idleCallback: this.hasIdleCallback
            }
          };
        }
      }

      // Create global instance
      window.backgroundProcessor = new BackgroundProcessor();

      // Expose utility functions
      window.processInBackground = (taskFunction, options) =>
        window.backgroundProcessor.addTask(taskFunction, options);

      window.getBackgroundStats = () => window.backgroundProcessor.getStats();

      console.log('[PerformanceIntegration] Background Processor System loaded successfully');

      // Verify it's working
      if (window.getBackgroundStats) {
        const stats = window.getBackgroundStats();
        console.log(`[PerformanceIntegration] Background processor test: capabilities =`, stats.capabilities);
      }

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to load Background Processor:', error);
      console.error('[PerformanceIntegration] Error details:', error.stack);
    }
  }

  /**
   * Load Network Optimization Systems
   */
  loadNetworkOptimizations() {
    console.log('[PerformanceIntegration] Loading Network Optimization Systems...');

    // Load network optimization scripts
    const networkSystems = [
      'request-batcher.js',
      'response-cache.js',
      'connection-pool.js'
    ];

    networkSystems.forEach(system => {
      this.loadScript(`/src/javascript/${system}`)
        .then(() => {
          console.log(`[PerformanceIntegration] Loaded ${system}`);
        })
        .catch(error => {
          console.warn(`[PerformanceIntegration] Failed to load ${system}:`, error);
        });
    });

    // Setup integrated network fetch after systems load
    setTimeout(() => {
      this.setupIntegratedNetworkFetch();
    }, 2000);
  }

  /**
   * Setup integrated network fetch combining all optimizations
   */
  setupIntegratedNetworkFetch() {
    console.log('[PerformanceIntegration] Setting up integrated network fetch...');

    // Create optimized fetch function that combines all network optimizations
    window.optimizedFetch = async (url, options = {}) => {
      try {
        // Generate cache key
        const cacheKey = window.responseCache ?
          window.responseCache.generateKey(url, options) : null;

        // Check cache first
        if (window.getCachedResponse && cacheKey) {
          const cached = window.getCachedResponse(cacheKey);
          if (cached) {
            console.log(`[OptimizedFetch] Cache hit for ${url}`);
            return cached;
          }
        }

        // Use batched fetch if available, otherwise pooled fetch, otherwise regular fetch
        let response;
        if (window.batchedFetch) {
          response = await window.batchedFetch(url, options);
        } else if (window.pooledFetch) {
          response = await window.pooledFetch(url, options);
        } else {
          response = await fetch(url, options);
          response = await this.parseResponse(response);
        }

        // Cache the response
        if (window.setCachedResponse && cacheKey && response) {
          window.setCachedResponse(cacheKey, response);
          console.log(`[OptimizedFetch] Cached response for ${url}`);
        }

        return response;

      } catch (error) {
        console.error(`[OptimizedFetch] Error fetching ${url}:`, error);
        throw error;
      }
    };

    // Setup network statistics aggregator
    window.getNetworkStats = () => {
      const stats = {
        timestamp: new Date().toISOString(),
        systems: {}
      };

      if (window.getBatchStats) {
        stats.systems.batching = window.getBatchStats();
      }

      if (window.getCacheStats) {
        stats.systems.caching = window.getCacheStats();
      }

      if (window.getConnectionStats) {
        stats.systems.connectionPool = window.getConnectionStats();
      }

      // Calculate overall network savings
      const batchSavings = stats.systems.batching?.networkSavings || 0;
      const cacheSavings = stats.systems.caching?.networkSaved || 0;
      const totalRequests = stats.systems.batching?.totalRequests || 0;

      stats.summary = {
        totalNetworkSavings: batchSavings + cacheSavings,
        totalRequests,
        systemsActive: Object.keys(stats.systems).length,
        overallEfficiency: totalRequests > 0 ?
          Math.round(((batchSavings + cacheSavings) / totalRequests) * 100) : 0
      };

      return stats;
    };

    console.log('[PerformanceIntegration] Integrated network fetch setup complete');
  }

  /**
   * Parse response helper
   */
  async parseResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  }

  /**
   * Load script dynamically
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));

      document.head.appendChild(script);
    });
  }
}

// Create global instance
window.performanceIntegration = window.performanceIntegration || new PerformanceIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceIntegration.initialize();
  });
} else {
  // DOM is already ready
  window.performanceIntegration.initialize();
}

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.performanceIntegration) {
    window.performanceIntegration.cleanup();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceIntegration;
}

// Loaded. Initialization will begin automatically.
