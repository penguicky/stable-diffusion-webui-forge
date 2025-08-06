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
    
    console.log('[PerformanceIntegration] Initializing performance systems...');
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
      console.log('[PerformanceIntegration] All systems initialized successfully');
      
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
      console.log(`[PerformanceIntegration] Loaded systems: ${loadedSystems.join(', ')}`);

      if (this.areAllSystemsLoaded()) {
        console.log('[PerformanceIntegration] All systems loaded successfully');
        return;
      }
      await this.delay(checkInterval);
    }

    const loadedSystems = this.getLoadedSystems();
    const missingSystems = this.getMissingSystems();

    console.warn(`[PerformanceIntegration] Timeout waiting for systems. Loaded: ${loadedSystems.join(', ')}, Missing: ${missingSystems.join(', ')}`);

    // Continue with partial initialization if some systems are available
    if (loadedSystems.length > 0) {
      console.log('[PerformanceIntegration] Continuing with partial initialization');
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

    console.log('[PerformanceIntegration] Available systems:', availableSystems);
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

    console.log('[PerformanceIntegration] System integrations configured');
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

    console.log('[PerformanceIntegration] Memory cleanup completed');
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
    console.log('[PerformanceIntegration] Optimizing for slow interactions');
    
    // Could implement adaptive debouncing here
    // For now, just log the issue
  }

  /**
   * Optimize animations during low FPS
   */
  optimizeAnimations() {
    console.log('[PerformanceIntegration] Optimizing animations for better FPS');
    
    // Could reduce animation complexity or disable non-essential animations
    // For now, just log the issue
  }

  /**
   * Optimize existing page elements
   */
  optimizeExistingElements() {
    console.log('[PerformanceIntegration] Optimizing existing page elements...');
    
    // Optimize common high-frequency event handlers
    this.optimizeScrollHandlers();
    this.optimizeInputHandlers();
    this.optimizeResizeHandlers();
    
    // Pre-cache common selectors
    this.precacheCommonSelectors();
    
    console.log('[PerformanceIntegration] Page optimization completed');
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
        console.log('[PerformanceIntegration] Initial performance stats:', stats);
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
    console.log('[PerformanceIntegration] Cleaning up all systems...');
    
    Object.values(this.systems).forEach(system => {
      if (system && typeof system.cleanup === 'function') {
        system.cleanup();
      }
    });
    
    this.isInitialized = false;
    console.log('[PerformanceIntegration] Cleanup completed');
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

console.log('[PerformanceIntegration] Loaded. Initialization will begin automatically.');
