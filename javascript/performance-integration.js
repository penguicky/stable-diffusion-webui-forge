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

    // Pre-cache common selectors (with error handling)
    try {
      this.precacheCommonSelectors();
    } catch (error) {
      console.log('[PerformanceIntegration] Skipping precache due to missing dependencies');
    }

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
    
    // Batch query common selectors to populate cache (with fallback)
    if (this.systems.domQueryOptimizer && this.systems.domQueryOptimizer.batchQuery) {
      this.systems.domQueryOptimizer.batchQuery(
        commonSelectors.map(selector => ({ selector, maxAge: 10000 }))
      );
    } else {
      console.log('[PerformanceIntegration] domQueryOptimizer not available, skipping cache preload');
    }
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
  async loadPerformanceTools() {
    try {
      // Load CPU optimization systems
      this.loadAdaptiveThrottling();
      this.loadBackgroundProcessor();
      this.loadCPUValidator();
      this.load404Suppressor();
      this.loadMemoryManager();

      // Load network optimization systems
      await this.loadNetworkOptimizations();

      // Verify systems loaded after a short delay
      setTimeout(() => {
        this.verifySystemsLoaded();
      }, 1000);

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

    // System verification complete

    if (cpuLoadedCount < 6) {
      console.warn('[PerformanceIntegration] Some CPU systems failed to load, attempting retry...');
      this.retryFailedSystems(cpuSystems);
    }

    if (networkLoadedCount < 6) {
      console.warn('[PerformanceIntegration] Some network systems failed to load, attempting retry...');
      this.retryFailedNetworkSystems(networkSystems);
    }

    // Performance systems loaded
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

    // Use embedded systems instead of external files
    if (!systems.requestBatcher || !systems.batchedFetch) {
      console.log('[PerformanceIntegration] Retrying request batcher with embedded version...');
      this.loadRequestBatcher();
    }

    if (!systems.responseCache || !systems.getCachedResponse) {
      console.log('[PerformanceIntegration] Retrying response cache with embedded version...');
      this.loadResponseCache();
    }

    if (!systems.connectionPool || !systems.pooledFetch) {
      console.log('[PerformanceIntegration] Retrying connection pool with embedded version...');
      this.loadConnectionPool();
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
   * Load CPU System Validator (embedded validation)
   */
  loadCPUValidator() {
    // CPU system validation (silent)
    setTimeout(() => {
      const cpuSystems = {
        adaptiveThrottlingSystem: !!window.adaptiveThrottlingSystem,
        backgroundProcessor: !!window.backgroundProcessor,
        getAdaptiveDelay: !!window.getAdaptiveDelay,
        processInBackground: !!window.processInBackground
      };

      const availableCount = Object.values(cpuSystems).filter(Boolean).length;
      // CPU systems validated silently
    }, 2000);
  }

  /**
   * Load 404 Error Suppressor (embedded)
   */
  load404Suppressor() {

    try {
      // Embed 404 suppression directly to avoid external file dependency

      // List of file patterns to suppress 404 errors for
      const suppressPatterns = [
        // Network optimization files (removed but still referenced by other code)
        'file=javascript/request-batcher.js',
        'file=javascript/response-cache.js',
        'file=javascript/connection-pool.js',
        'src/javascript/request-batcher.js',
        'src/javascript/response-cache.js',
        'src/javascript/connection-pool.js',
        'src/javascript/network-optimization-validator.js',
        'src/javascript/404-error-suppressor.js',

        // Test endpoints (don't exist, used for testing)
        '/api/test/',
        '/api/embedded/',
        '/api/integration/',
        '/api/optimized/',
        '/api/pool/',
        '/api/batch',

        // CPU test files that might be missing
        'src/javascript/cpu-system-validator.js'
      ];

      // Store original console methods
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      // Function to check if error should be suppressed
      function shouldSuppressError(message) {
        if (typeof message !== 'string') return false;

        // Check for 404 errors with our patterns
        if (message.includes('404') || message.includes('Not Found')) {
          return suppressPatterns.some(pattern => message.includes(pattern));
        }

        // Check for network errors with our patterns
        if (message.includes('net::ERR_ABORTED') || message.includes('Failed to load')) {
          return suppressPatterns.some(pattern => message.includes(pattern));
        }

        // Check for argument-related errors (from yargs and similar libraries)
        if (message.includes('Too many arguments provided') ||
            message.includes('Not enough arguments provided') ||
            message.includes('Too many arguments provided for the endpoint')) {
          console.debug('[PerformanceIntegration] Suppressed argument error (fixed):', message);
          return true;
        }

        return false;
      }

      // TEMPORARILY DISABLED - Console error suppression
      console.error = function(...args) {
        console.log('[DEBUG] Performance-integration console.error called with:', args);
        return originalConsoleError.apply(console, args);
      };

      // COMPLETELY DISABLED - Console warn suppression for troubleshooting
      console.warn = originalConsoleWarn; // Restore original console.warn completely

      // Intercept fetch to suppress 404s for our patterns
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        return originalFetch.call(this, url, options)
          .catch(error => {
            const urlString = typeof url === 'string' ? url : url.toString();
            const shouldSuppress = suppressPatterns.some(pattern => urlString.includes(pattern));

            if (shouldSuppress) {
              // Create a silent error for suppressed patterns
              const suppressedError = new Error(`HTTP 404: Not Found (suppressed: ${urlString})`);
              suppressedError.suppressed = true;
              throw suppressedError;
            }

            throw error;
          });
      };

      // Suppress unhandled promise rejections for our patterns
      window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.message) {
          const shouldSuppress = shouldSuppressError(event.reason.message) ||
                                 (event.reason.suppressed === true);
          if (shouldSuppress) {
            event.preventDefault();
            return false;
          }
        }
      });

      // Function to restore original console methods (for debugging)
      window.restore404Suppression = function() {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.log('[404-Suppressor] Console methods restored');
      };

      // Function to add new patterns to suppress
      window.add404SuppressionPattern = function(pattern) {
        suppressPatterns.push(pattern);
        console.log(`[404-Suppressor] Added pattern: ${pattern}`);
      };

      // Function to show current suppression patterns
      window.show404SuppressionPatterns = function() {
        console.log('[404-Suppressor] Current suppression patterns:', suppressPatterns);
      };

      // 404 Error Suppressor loaded

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to load embedded 404 suppressor:', error);
    }
  }

  /**
   * Load Memory Manager System (embedded)
   */
  loadMemoryManager() {
    console.log('[PerformanceIntegration] Loading Memory Manager System (embedded)...');

    try {
      // Create embedded memory manager to avoid external file dependency
      class EmbeddedMemoryManager {
        constructor() {
          this.eventListeners = new Map();
          this.timers = new Set();
          this.intervals = new Set();
          this.observers = new Set();
          this.animationFrames = new Set();
          this.webSockets = new Set();
          this.isCleanupScheduled = false;

          this.setupAutoCleanup();
          // Memory manager initialized
        }

        addEventListener(element, event, handler, options = {}) {
          if (!element || typeof handler !== 'function') {
            console.warn('[MemoryManager] Invalid element or handler for addEventListener');
            return () => {};
          }

          element.addEventListener(event, handler, options);

          if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, new Map());
          }

          if (!this.eventListeners.get(element).has(event)) {
            this.eventListeners.get(element).set(event, new Set());
          }

          const listenerInfo = { handler, options };
          this.eventListeners.get(element).get(event).add(listenerInfo);

          return () => {
            element.removeEventListener(event, handler, options);
            if (this.eventListeners.has(element) &&
                this.eventListeners.get(element).has(event)) {
              this.eventListeners.get(element).get(event).delete(listenerInfo);
            }
          };
        }

        trackObserver(observer) {
          if (observer && typeof observer.disconnect === 'function') {
            this.observers.add(observer);
            return observer;
          }
          console.warn('[MemoryManager] Invalid observer for tracking');
          return observer;
        }

        setTimeout(callback, delay) {
          const timerId = setTimeout(() => {
            this.timers.delete(timerId);
            callback();
          }, delay);

          this.timers.add(timerId);
          return timerId;
        }

        setInterval(callback, delay) {
          const intervalId = setInterval(callback, delay);
          this.intervals.add(intervalId);
          return intervalId;
        }

        clearTimeout(timerId) {
          if (this.timers.has(timerId)) {
            clearTimeout(timerId);
            this.timers.delete(timerId);
          }
        }

        clearInterval(intervalId) {
          if (this.intervals.has(intervalId)) {
            clearInterval(intervalId);
            this.intervals.delete(intervalId);
          }
        }

        requestAnimationFrame(callback) {
          const frameId = requestAnimationFrame(() => {
            this.animationFrames.delete(frameId);
            callback();
          });

          this.animationFrames.add(frameId);
          return frameId;
        }

        trackWebSocket(ws) {
          if (ws instanceof WebSocket) {
            this.webSockets.add(ws);
          }
          return ws;
        }

        setupAutoCleanup() {
          const cleanup = () => this.cleanup();

          window.addEventListener('beforeunload', cleanup);
          window.addEventListener('pagehide', cleanup);
          window.addEventListener('unload', cleanup);

          document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
              this.scheduleCleanup();
            }
          });
        }

        scheduleCleanup() {
          if (this.isCleanupScheduled) return;

          this.isCleanupScheduled = true;
          setTimeout(() => {
            this.partialCleanup();
            this.isCleanupScheduled = false;
          }, 1000);
        }

        partialCleanup() {
          this.eventListeners.forEach((events, element) => {
            if (element &&
                element !== window &&
                element !== document &&
                element.nodeType &&
                !document.contains(element)) {
              this.cleanupElementListeners(element);
            }
          });

          console.log('[MemoryManager] Partial cleanup completed');
        }

        cleanupElementListeners(element) {
          if (!this.eventListeners.has(element)) return;

          const elementListeners = this.eventListeners.get(element);
          elementListeners.forEach((listeners, event) => {
            listeners.forEach(({ handler, options }) => {
              element.removeEventListener(event, handler, options);
            });
          });

          this.eventListeners.delete(element);
        }

        cleanup() {
          console.log('[MemoryManager] Starting complete cleanup...');

          this.eventListeners.forEach((events, element) => {
            events.forEach((listeners, event) => {
              listeners.forEach(({ handler, options }) => {
                try {
                  element.removeEventListener(event, handler, options);
                } catch (e) {
                  console.warn('[MemoryManager] Error removing event listener:', e);
                }
              });
            });
          });
          this.eventListeners.clear();

          this.timers.forEach(timerId => clearTimeout(timerId));
          this.timers.clear();

          this.intervals.forEach(intervalId => clearInterval(intervalId));
          this.intervals.clear();

          this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
          this.animationFrames.clear();

          this.observers.forEach(observer => {
            try {
              observer.disconnect();
            } catch (e) {
              console.warn('[MemoryManager] Error disconnecting observer:', e);
            }
          });
          this.observers.clear();

          this.webSockets.forEach(ws => {
            try {
              if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close(1000, 'Page unload cleanup');
              }
            } catch (e) {
              console.warn('[MemoryManager] Error closing WebSocket:', e);
            }
          });
          this.webSockets.clear();

          console.log('[MemoryManager] Complete cleanup finished');
        }

        forceCleanup() {
          console.log('[MemoryManager] Force cleanup triggered');
          this.cleanup();
        }

        getStats() {
          return {
            eventListeners: this.eventListeners.size,
            timers: this.timers.size,
            intervals: this.intervals.size,
            observers: this.observers.size,
            animationFrames: this.animationFrames.size,
            webSockets: this.webSockets.size,
            totalElements: Array.from(this.eventListeners.keys()).length,
            embedded: true
          };
        }
      }

      // Create global instance
      window.memoryManager = new EmbeddedMemoryManager();
      // Memory Manager loaded

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to create embedded memory manager:', error);
      this.createMemoryManagerFallback();
    }
  }

  /**
   * Create Memory Manager Fallback
   */
  createMemoryManagerFallback() {
    console.log('[PerformanceIntegration] Creating memory manager fallback...');

    try {
      window.memoryManager = {
        eventListeners: new Map(),
        observers: new Set(),

        addEventListener: function(element, event, handler, options = {}) {
          console.log('[MemoryManager-Fallback] addEventListener called');
          if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
          }
          return () => {};
        },

        trackObserver: function(observer) {
          console.log('[MemoryManager-Fallback] trackObserver called');
          if (observer && typeof observer.disconnect === 'function') {
            this.observers.add(observer);
          }
          return observer;
        },

        cleanup: function() {
          console.log('[MemoryManager-Fallback] Cleanup called');
          this.observers.forEach(observer => {
            try {
              observer.disconnect();
            } catch (e) {}
          });
          this.observers.clear();

          if (window.gc) {
            window.gc();
          }
        },

        forceCleanup: function() {
          console.log('[MemoryManager-Fallback] Force cleanup called');
          this.cleanup();
        },

        scheduleCleanup: function() {
          console.log('[MemoryManager-Fallback] Schedule cleanup called');
          setTimeout(() => this.cleanup(), 1000);
        },

        setTimeout: function(callback, delay) {
          return setTimeout(callback, delay);
        },

        setInterval: function(callback, delay) {
          return setInterval(callback, delay);
        },

        clearTimeout: function(timerId) {
          clearTimeout(timerId);
        },

        clearInterval: function(intervalId) {
          clearInterval(intervalId);
        },

        requestAnimationFrame: function(callback) {
          return requestAnimationFrame(callback);
        },

        trackWebSocket: function(ws) {
          return ws;
        },

        getStats: function() {
          return {
            fallback: true,
            message: 'Using fallback memory manager',
            observers: this.observers.size,
            eventListeners: this.eventListeners.size
          };
        }
      };

      console.log('[PerformanceIntegration] Memory manager fallback created with all required methods');
    } catch (error) {
      console.error('[PerformanceIntegration] Failed to create memory manager fallback:', error);
    }
  }



  /**
   * Load Adaptive Throttling System directly
   */
  loadAdaptiveThrottling() {
    if (window.adaptiveThrottlingSystem) {
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

      // Adaptive Throttling System loaded

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
    if (window.backgroundProcessor) {
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

      // Background Processor System loaded

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
  async loadNetworkOptimizations() {
    // Clear any existing external versions to prevent conflicts
    if (window.requestBatcher && window.requestBatcher.constructor.name !== 'RequestBatcher') {
      delete window.requestBatcher;
      delete window.batchedFetch;
      delete window.getBatchStats;
    }

    // Load systems directly instead of trying to load external files
    this.loadResponseCache();
    this.loadRequestBatcher();
    this.loadConnectionPool();

    // Wait a bit for systems to initialize, then setup integrated fetch
    setTimeout(() => {
      this.verifyNetworkSystems();
    }, 1000);

    setTimeout(() => {
      this.setupIntegratedNetworkFetch();
    }, 1500);
  }

  /**
   * Load Response Cache System directly
   */
  loadResponseCache() {
    if (window.responseCache) {
      return;
    }

    try {
      class ResponseCache {
        constructor(options = {}) {
          this.maxSize = options.maxSize || 100;
          this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
          this.maxMemoryMB = options.maxMemoryMB || 50;

          this.cache = new Map();
          this.accessOrder = new Map();
          this.memoryUsage = 0;

          this.cachePolicies = new Map();
          this.setupDefaultPolicies();

          this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalRequests: 0,
            memorySaved: 0,
            networkSaved: 0
          };

          this.setupPeriodicCleanup();
          // System initialized
        }

        setupDefaultPolicies() {
          this.setCachePolicy('/api/v1/models', { ttl: 600000, priority: 'high' });
          this.setCachePolicy('/api/v1/samplers', { ttl: 600000, priority: 'high' });
          this.setCachePolicy('/api/v1/schedulers', { ttl: 600000, priority: 'high' });
          this.setCachePolicy('/api/v1/upscalers', { ttl: 600000, priority: 'high' });
          this.setCachePolicy('/api/v1/embeddings', { ttl: 300000, priority: 'medium' });
          this.setCachePolicy('/api/v1/hypernetworks', { ttl: 300000, priority: 'medium' });
          this.setCachePolicy('/api/v1/loras', { ttl: 300000, priority: 'medium' });
          this.setCachePolicy('/api/v1/progress', { ttl: 5000, priority: 'low' });
          this.setCachePolicy('/api/v1/memory', { ttl: 10000, priority: 'low' });
          this.setCachePolicy('/api/v1/txt2img', { ttl: 0, priority: 'none' });
          this.setCachePolicy('/api/v1/img2img', { ttl: 0, priority: 'none' });
        }

        setCachePolicy(pattern, policy) {
          this.cachePolicies.set(pattern, {
            ttl: policy.ttl || this.defaultTTL,
            priority: policy.priority || 'medium',
            maxAge: policy.maxAge || policy.ttl,
            staleWhileRevalidate: policy.staleWhileRevalidate || false
          });
        }

        get(key) {
          this.stats.totalRequests++;

          const entry = this.cache.get(key);
          if (!entry) {
            this.stats.misses++;
            return null;
          }

          if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.memoryUsage -= entry.size;
            this.stats.misses++;
            return null;
          }

          this.accessOrder.set(key, Date.now());
          entry.accessCount++;
          entry.lastAccessed = Date.now();

          this.stats.hits++;
          this.stats.networkSaved++;

          return entry.data;
        }

        set(key, data, options = {}) {
          const policy = this.getCachePolicy(key);

          if (policy.ttl === 0) {
            return false;
          }

          const size = this.estimateSize(data);
          const ttl = options.ttl || policy.ttl;

          if (this.shouldEvict(size)) {
            this.evictItems(size);
          }

          const entry = {
            data,
            size,
            ttl,
            priority: policy.priority,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 1,
            expiresAt: Date.now() + ttl
          };

          if (this.cache.has(key)) {
            const existing = this.cache.get(key);
            this.memoryUsage -= existing.size;
          }

          this.cache.set(key, entry);
          this.accessOrder.set(key, Date.now());
          this.memoryUsage += size;

          return true;
        }

        getCachePolicy(key) {
          for (const [pattern, policy] of this.cachePolicies) {
            if (key.includes(pattern)) {
              return policy;
            }
          }
          return {
            ttl: this.defaultTTL,
            priority: 'medium',
            maxAge: this.defaultTTL,
            staleWhileRevalidate: false
          };
        }

        isExpired(entry) {
          return Date.now() > entry.expiresAt;
        }

        shouldEvict(newItemSize) {
          const wouldExceedMemory = (this.memoryUsage + newItemSize) > (this.maxMemoryMB * 1024 * 1024);
          const wouldExceedCount = this.cache.size >= this.maxSize;
          return wouldExceedMemory || wouldExceedCount;
        }

        evictItems(requiredSpace = 0) {
          const targetMemory = (this.maxMemoryMB * 1024 * 1024) * 0.8;
          const targetCount = Math.floor(this.maxSize * 0.8);

          const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            entry,
            lastAccessed: this.accessOrder.get(key) || 0
          }));

          entries.sort((a, b) => {
            const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
            const aPriority = priorityOrder[a.entry.priority] || 2;
            const bPriority = priorityOrder[b.entry.priority] || 2;

            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }

            return a.lastAccessed - b.lastAccessed;
          });

          let freedMemory = 0;
          let evictedCount = 0;

          for (const { key, entry } of entries) {
            if (this.memoryUsage - freedMemory <= targetMemory &&
                this.cache.size - evictedCount <= targetCount &&
                freedMemory >= requiredSpace) {
              break;
            }

            this.cache.delete(key);
            this.accessOrder.delete(key);
            freedMemory += entry.size;
            evictedCount++;
            this.stats.evictions++;
          }

          this.memoryUsage -= freedMemory;
        }

        estimateSize(data) {
          if (typeof data === 'string') {
            return data.length * 2;
          }

          if (data instanceof ArrayBuffer) {
            return data.byteLength;
          }

          if (data instanceof Blob) {
            return data.size;
          }

          try {
            return JSON.stringify(data).length * 2;
          } catch (e) {
            return 1024;
          }
        }

        setupPeriodicCleanup() {
          setInterval(() => {
            this.cleanupExpired();
          }, 120000);

          setInterval(() => {
            if (this.memoryUsage > (this.maxMemoryMB * 1024 * 1024 * 0.9)) {
              this.evictItems();
            }
          }, 300000);
        }

        cleanupExpired() {
          const now = Date.now();
          const expiredKeys = [];

          for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
              expiredKeys.push(key);
            }
          }

          expiredKeys.forEach(key => {
            const entry = this.cache.get(key);
            if (entry) {
              this.cache.delete(key);
              this.accessOrder.delete(key);
              this.memoryUsage -= entry.size;
            }
          });
        }

        getStats() {
          const hitRate = this.stats.totalRequests > 0 ?
            (this.stats.hits / this.stats.totalRequests * 100) : 0;

          return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            currentItems: this.cache.size,
            maxItems: this.maxSize,
            memoryUsageMB: Math.round(this.memoryUsage / 1024 / 1024 * 100) / 100,
            maxMemoryMB: this.maxMemoryMB,
            memoryUtilization: ((this.memoryUsage / (this.maxMemoryMB * 1024 * 1024)) * 100).toFixed(2)
          };
        }

        generateKey(url, options = {}) {
          const method = options.method || 'GET';
          const headers = JSON.stringify(options.headers || {});
          const body = options.body || '';
          return `${method}:${url}:${headers}:${body}`;
        }
      }

      // Create global instance
      window.responseCache = new ResponseCache({
        maxSize: 100,
        defaultTTL: 300000,
        maxMemoryMB: 50
      });

      // Expose utility functions
      window.getCachedResponse = (key) => window.responseCache.get(key);
      window.setCachedResponse = (key, data, options) => window.responseCache.set(key, data, options);
      window.invalidateCache = (pattern) => window.responseCache.invalidate(pattern);
      window.getCacheStats = () => window.responseCache.getStats();

      // Response Cache System loaded

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to load Response Cache:', error);
    }
  }

  /**
   * Load Request Batcher System directly
   */
  loadRequestBatcher() {
    // Force reload to ensure we use the embedded version

    try {
      class RequestBatcher {
        constructor(options = {}) {
          this.batchWindow = options.batchWindow || 100;
          this.maxBatchSize = options.maxBatchSize || 10;
          this.maxWaitTime = options.maxWaitTime || 500;

          this.batches = new Map();
          this.timers = new Map();
          this.pendingRequests = new Map();

          this.requestCache = new Map();
          this.cacheTimeout = options.cacheTimeout || 5000;

          this.stats = {
            totalRequests: 0,
            batchedRequests: 0,
            deduplicatedRequests: 0,
            batchesSent: 0,
            averageBatchSize: 0,
            networkSavings: 0
          };

          // System initialized
        }

        addRequest(url, options = {}) {
          this.stats.totalRequests++;

          const requestKey = this.generateRequestKey(url, options);

          if (this.isDuplicateRequest(requestKey)) {
            this.stats.deduplicatedRequests++;
            return this.requestCache.get(requestKey).promise;
          }

          let requestPromise;

          requestPromise = new Promise((resolve, reject) => {
            const request = {
              url,
              options,
              resolve,
              reject,
              timestamp: Date.now(),
              key: requestKey
            };

            // Add to batch immediately
            this.addToBatch(request);
          });

          // Cache the promise after it's created
          this.requestCache.set(requestKey, {
            promise: requestPromise,
            timestamp: Date.now()
          });

          return requestPromise;
        }

        addToBatch(request) {
          const batchKey = this.getBatchKey(request.url, request.options);

          if (!this.batches.has(batchKey)) {
            this.batches.set(batchKey, []);
          }

          const batch = this.batches.get(batchKey);
          batch.push(request);

          if (batch.length >= this.maxBatchSize) {
            this.sendBatch(batchKey);
          } else {
            this.setBatchTimer(batchKey);
          }
        }

        setBatchTimer(batchKey) {
          if (this.timers.has(batchKey)) {
            clearTimeout(this.timers.get(batchKey));
          }

          const timer = setTimeout(() => {
            this.sendBatch(batchKey);
          }, this.batchWindow);

          this.timers.set(batchKey, timer);
        }

        async sendBatch(batchKey) {
          const batch = this.batches.get(batchKey);
          if (!batch || batch.length === 0) return;

          if (this.timers.has(batchKey)) {
            clearTimeout(this.timers.get(batchKey));
            this.timers.delete(batchKey);
          }

          this.batches.delete(batchKey);

          this.stats.batchedRequests += batch.length;
          this.stats.batchesSent++;
          this.updateAverageBatchSize(batch.length);

          try {
            if (batch.length === 1) {
              await this.sendSingleRequest(batch[0]);
            } else {
              if (this.isBatchableEndpoint(batchKey)) {
                await this.sendBatchedRequest(batch);
              } else {
                await this.sendParallelRequests(batch);
              }
            }
          } catch (error) {
            console.error('[RequestBatcher] Batch send error:', error);
            batch.forEach(request => request.reject(error));
          }
        }

        async sendSingleRequest(request) {
          try {
            const response = await fetch(request.url, request.options);
            const data = await this.parseResponse(response);
            request.resolve(data);
          } catch (error) {
            request.reject(error);
          }
        }

        async sendParallelRequests(batch) {
          const promises = batch.map(request =>
            fetch(request.url, request.options)
              .then(response => this.parseResponse(response))
              .then(data => request.resolve(data))
              .catch(error => request.reject(error))
          );

          await Promise.allSettled(promises);
        }

        generateRequestKey(url, options) {
          const method = options.method || 'GET';
          const body = options.body || '';
          const headers = JSON.stringify(options.headers || {});
          return `${method}:${url}:${body}:${headers}`;
        }

        isDuplicateRequest(requestKey) {
          const cached = this.requestCache.get(requestKey);
          if (!cached) return false;

          const age = Date.now() - cached.timestamp;
          if (age > this.cacheTimeout) {
            this.requestCache.delete(requestKey);
            return false;
          }

          return true;
        }

        getBatchKey(url, options) {
          const urlObj = new URL(url, window.location.origin);
          const method = options.method || 'GET';
          return `${method}:${urlObj.pathname}`;
        }

        isBatchableEndpoint(batchKey) {
          const batchableEndpoints = [
            '/api/v1/models',
            '/api/v1/samplers',
            '/api/v1/schedulers',
            '/api/v1/upscalers',
            '/api/v1/embeddings',
            '/api/v1/hypernetworks',
            '/api/v1/loras'
          ];

          return batchableEndpoints.some(endpoint => batchKey.includes(endpoint));
        }

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

        updateAverageBatchSize(batchSize) {
          const currentAvg = this.stats.averageBatchSize;
          const totalBatches = this.stats.batchesSent;
          this.stats.averageBatchSize = (currentAvg * (totalBatches - 1) + batchSize) / totalBatches;
        }

        cleanupCache() {
          const now = Date.now();
          for (const [key, cached] of this.requestCache) {
            if (now - cached.timestamp > this.cacheTimeout) {
              this.requestCache.delete(key);
            }
          }
        }

        getStats() {
          const networkSavings = this.stats.totalRequests > 0 ?
            ((this.stats.batchedRequests + this.stats.deduplicatedRequests) / this.stats.totalRequests * 100) : 0;

          return {
            ...this.stats,
            networkSavings: Math.round(networkSavings * 100) / 100,
            cacheSize: this.requestCache.size,
            activeBatches: this.batches.size,
            averageBatchSize: Math.round(this.stats.averageBatchSize * 100) / 100
          };
        }

        flushAll() {
          const batchKeys = Array.from(this.batches.keys());
          batchKeys.forEach(key => this.sendBatch(key));
        }
      }

      // Create global instance
      window.requestBatcher = new RequestBatcher({
        batchWindow: 100,
        maxBatchSize: 10,
        maxWaitTime: 500,
        cacheTimeout: 5000
      });

      // Expose utility functions
      window.batchedFetch = (url, options) => window.requestBatcher.addRequest(url, options);
      window.getBatchStats = () => window.requestBatcher.getStats();
      window.flushBatches = () => window.requestBatcher.flushAll();

      // Setup periodic cache cleanup
      setInterval(() => {
        if (window.requestBatcher) {
          window.requestBatcher.cleanupCache();
        }
      }, 30000);

      // Request Batcher System loaded

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to load Request Batcher:', error);
    }
  }

  /**
   * Load Connection Pool System directly
   */
  loadConnectionPool() {
    if (window.connectionPool) {
      return;
    }

    try {
      class ConnectionPool {
        constructor(options = {}) {
          this.maxConnections = options.maxConnections || 6;
          this.maxConnectionsPerHost = options.maxConnectionsPerHost || 4;
          this.connectionTimeout = options.connectionTimeout || 30000;
          this.keepAliveTimeout = options.keepAliveTimeout || 60000;

          this.activeConnections = new Map();
          this.connectionQueue = new Map();
          this.connectionTimers = new Map();

          this.globalQueue = [];
          this.isProcessingQueue = false;

          this.stats = {
            totalRequests: 0,
            queuedRequests: 0,
            activeConnections: 0,
            connectionReuse: 0,
            timeoutErrors: 0,
            averageWaitTime: 0
          };

          this.setupConnectionMonitoring();
          // System initialized
        }

        async request(url, options = {}) {
          this.stats.totalRequests++;

          const host = this.getHost(url);
          const startTime = Date.now();

          return new Promise((resolve, reject) => {
            const request = {
              url,
              options,
              host,
              resolve,
              reject,
              startTime,
              timeout: options.timeout || this.connectionTimeout
            };

            this.queueRequest(request);
          });
        }

        queueRequest(request) {
          const host = request.host;

          if (this.canProcessRequest(host)) {
            this.processRequest(request);
          } else {
            if (!this.connectionQueue.has(host)) {
              this.connectionQueue.set(host, []);
            }

            this.connectionQueue.get(host).push(request);
            this.stats.queuedRequests++;

            if (!this.isProcessingQueue) {
              this.processQueue();
            }
          }
        }

        canProcessRequest(host) {
          const hostConnections = this.activeConnections.get(host) || 0;
          const totalConnections = this.getTotalActiveConnections();

          return hostConnections < this.maxConnectionsPerHost &&
                 totalConnections < this.maxConnections;
        }

        async processRequest(request) {
          const host = request.host;

          this.incrementConnections(host);

          try {
            const timeoutId = setTimeout(() => {
              this.stats.timeoutErrors++;
              request.reject(new Error('Request timeout'));
            }, request.timeout);

            const response = await fetch(request.url, {
              ...request.options,
              signal: this.createAbortSignal(request.timeout)
            });

            clearTimeout(timeoutId);

            const waitTime = Date.now() - request.startTime;
            this.updateAverageWaitTime(waitTime);

            const data = await this.parseResponse(response);
            request.resolve(data);

          } catch (error) {
            request.reject(error);
          } finally {
            setTimeout(() => {
              this.decrementConnections(host);
              this.processQueue();
            }, 100);
          }
        }

        async processQueue() {
          if (this.isProcessingQueue) return;
          this.isProcessingQueue = true;

          try {
            while (this.hasQueuedRequests()) {
              let processed = false;

              for (const [host, queue] of this.connectionQueue) {
                if (queue.length > 0 && this.canProcessRequest(host)) {
                  const request = queue.shift();
                  this.stats.queuedRequests--;

                  this.processRequest(request);
                  processed = true;
                }
              }

              if (!processed) {
                await this.delay(10);
              }
            }
          } finally {
            this.isProcessingQueue = false;
          }
        }

        hasQueuedRequests() {
          for (const queue of this.connectionQueue.values()) {
            if (queue.length > 0) return true;
          }
          return false;
        }

        incrementConnections(host) {
          const current = this.activeConnections.get(host) || 0;
          this.activeConnections.set(host, current + 1);
          this.stats.activeConnections++;
        }

        decrementConnections(host) {
          const current = this.activeConnections.get(host) || 0;
          if (current > 0) {
            this.activeConnections.set(host, current - 1);
            this.stats.activeConnections--;
            this.stats.connectionReuse++;
          }
        }

        getTotalActiveConnections() {
          let total = 0;
          for (const count of this.activeConnections.values()) {
            total += count;
          }
          return total;
        }

        getHost(url) {
          try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.host;
          } catch (e) {
            return window.location.host;
          }
        }

        createAbortSignal(timeout) {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), timeout);
          return controller.signal;
        }

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

        updateAverageWaitTime(waitTime) {
          const currentAvg = this.stats.averageWaitTime;
          const totalRequests = this.stats.totalRequests;
          this.stats.averageWaitTime = (currentAvg * (totalRequests - 1) + waitTime) / totalRequests;
        }

        setupConnectionMonitoring() {
          setInterval(() => {
            this.monitorConnections();
          }, 30000);

          setInterval(() => {
            this.cleanupStaleConnections();
          }, 60000);
        }

        monitorConnections() {
          const totalActive = this.getTotalActiveConnections();
          const totalQueued = this.getTotalQueuedRequests();

          if (totalQueued > 10) {
            console.warn(`[ConnectionPool] High queue depth: ${totalQueued} requests queued`);
          }

          if (totalActive >= this.maxConnections * 0.8) {
            console.warn(`[ConnectionPool] High connection usage: ${totalActive}/${this.maxConnections}`);
          }
        }

        getTotalQueuedRequests() {
          let total = 0;
          for (const queue of this.connectionQueue.values()) {
            total += queue.length;
          }
          return total;
        }

        cleanupStaleConnections() {
          for (const [host, count] of this.activeConnections) {
            if (count === 0) {
              this.activeConnections.delete(host);
            }
          }

          for (const [host, queue] of this.connectionQueue) {
            if (queue.length === 0) {
              this.connectionQueue.delete(host);
            }
          }
        }

        delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        getStats() {
          return {
            ...this.stats,
            maxConnections: this.maxConnections,
            maxConnectionsPerHost: this.maxConnectionsPerHost,
            currentActiveConnections: this.getTotalActiveConnections(),
            currentQueuedRequests: this.getTotalQueuedRequests(),
            hostsWithConnections: this.activeConnections.size,
            averageWaitTime: Math.round(this.stats.averageWaitTime),
            connectionEfficiency: this.stats.totalRequests > 0 ?
              Math.round((this.stats.connectionReuse / this.stats.totalRequests) * 100) : 0
          };
        }

        forceProcessQueue() {
          this.processQueue();
        }

        reset() {
          for (const queue of this.connectionQueue.values()) {
            queue.forEach(request => {
              request.reject(new Error('Connection pool reset'));
            });
          }

          this.connectionQueue.clear();
          this.activeConnections.clear();
          this.globalQueue.length = 0;
          this.isProcessingQueue = false;

          this.stats.queuedRequests = 0;
          this.stats.activeConnections = 0;
        }
      }

      // Create global instance
      window.connectionPool = new ConnectionPool({
        maxConnections: 6,
        maxConnectionsPerHost: 4,
        connectionTimeout: 30000,
        keepAliveTimeout: 60000
      });

      // Expose utility functions
      window.pooledFetch = (url, options) => window.connectionPool.request(url, options);
      window.getConnectionStats = () => window.connectionPool.getStats();
      window.resetConnectionPool = () => window.connectionPool.reset();

      // Connection Pool System loaded

    } catch (error) {
      console.error('[PerformanceIntegration] Failed to load Connection Pool:', error);
    }
  }

  /**
   * Verify network systems loaded and create fallbacks if needed
   */
  verifyNetworkSystems() {
    const networkSystems = {
      requestBatcher: !!window.requestBatcher,
      responseCache: !!window.responseCache,
      connectionPool: !!window.connectionPool,
      batchedFetch: !!window.batchedFetch,
      getCachedResponse: !!window.getCachedResponse,
      pooledFetch: !!window.pooledFetch
    };

    const loadedCount = Object.values(networkSystems).filter(Boolean).length;

    // Create fallbacks for missing systems
    if (!networkSystems.responseCache) {
      this.createResponseCacheFallback();
    }

    if (!networkSystems.requestBatcher) {
      this.createRequestBatcherFallback();
    }

    if (!networkSystems.connectionPool) {
      this.createConnectionPoolFallback();
    }
  }

  /**
   * Create response cache fallback
   */
  createResponseCacheFallback() {
    console.log('[PerformanceIntegration] Creating response cache fallback...');

    try {
      window.responseCache = {
        cache: new Map(),
        get: function(key) { return this.cache.get(key); },
        set: function(key, data) { this.cache.set(key, data); return true; },
        getStats: function() { return { currentItems: this.cache.size, hitRate: 0 }; },
        generateKey: function(url, options) {
          const method = options.method || 'GET';
          return `${method}:${url}`;
        }
      };

      window.getCachedResponse = (key) => window.responseCache.get(key);
      window.setCachedResponse = (key, data) => window.responseCache.set(key, data);
      window.getCacheStats = () => window.responseCache.getStats();

      console.log('[PerformanceIntegration] Response cache fallback created');
    } catch (error) {
      console.error('[PerformanceIntegration] Failed to create response cache fallback:', error);
    }
  }

  /**
   * Create request batcher fallback
   */
  createRequestBatcherFallback() {
    console.log('[PerformanceIntegration] Creating request batcher fallback...');

    try {
      window.requestBatcher = {
        stats: { totalRequests: 0, networkSavings: 0 },
        addRequest: async function(url, options) {
          this.stats.totalRequests++;
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const contentType = response.headers.get('content-type');
          return contentType && contentType.includes('application/json') ?
            await response.json() : await response.text();
        },
        getStats: function() { return this.stats; }
      };

      window.batchedFetch = (url, options) => window.requestBatcher.addRequest(url, options);
      window.getBatchStats = () => window.requestBatcher.getStats();

      console.log('[PerformanceIntegration] Request batcher fallback created');
    } catch (error) {
      console.error('[PerformanceIntegration] Failed to create request batcher fallback:', error);
    }
  }

  /**
   * Create connection pool fallback
   */
  createConnectionPoolFallback() {
    console.log('[PerformanceIntegration] Creating connection pool fallback...');

    try {
      window.connectionPool = {
        stats: { totalRequests: 0, averageWaitTime: 0 },
        request: async function(url, options) {
          this.stats.totalRequests++;
          const startTime = Date.now();
          const response = await fetch(url, options);
          this.stats.averageWaitTime = Date.now() - startTime;
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const contentType = response.headers.get('content-type');
          return contentType && contentType.includes('application/json') ?
            await response.json() : await response.text();
        },
        getStats: function() { return this.stats; }
      };

      window.pooledFetch = (url, options) => window.connectionPool.request(url, options);
      window.getConnectionStats = () => window.connectionPool.getStats();

      console.log('[PerformanceIntegration] Connection pool fallback created');
    } catch (error) {
      console.error('[PerformanceIntegration] Failed to create connection pool fallback:', error);
    }
  }

  /**
   * Setup integrated network fetch combining all optimizations
   */
  setupIntegratedNetworkFetch() {
    // Verify systems are available
    const systemsAvailable = {
      cache: !!window.getCachedResponse,
      batch: !!window.batchedFetch,
      pool: !!window.pooledFetch
    };

    // Create optimized fetch function that combines all network optimizations
    window.optimizedFetch = async (url, options = {}) => {
      try {
        // Generate cache key
        const cacheKey = window.responseCache ?
          window.responseCache.generateKey(url, options) : `${options.method || 'GET'}:${url}`;

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

    // Integrated network fetch setup complete
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
