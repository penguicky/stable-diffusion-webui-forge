/**
 * Optimized Event Handler System
 * Provides debouncing, throttling, and passive event handling for better performance
 */

class OptimizedEventHandlers {
  constructor() {
    this.debouncedHandlers = new Map();
    this.throttledHandlers = new Map();
    this.passiveEvents = new Set(['scroll', 'wheel', 'touchstart', 'touchmove', 'touchend']);
    this.activeHandlers = new Map();

    // Enhanced tracking for deduplication
    this.handlerRegistry = new Map(); // Track handlers by element+event combination
    this.cleanupCallbacks = new Map(); // Track cleanup functions

    // Performance tracking
    this.metrics = {
      handlersCreated: 0,
      eventsProcessed: 0,
      eventsSkipped: 0,
      averageProcessingTime: 0,
      handlersDeduped: 0,
      handlersRemoved: 0
    };

    // Initialized
  }

  /**
   * Add throttled event handler for high-frequency events
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} delay - Throttle delay in milliseconds
   * @param {Object} options - Event listener options
   */
  addThrottledHandler(element, event, handler, delay = 16, options = {}) {
    // Use adaptive delay if available and not forced
    let finalDelay = delay;
    if (!options.forceDelay && window.getAdaptiveDelay) {
      try {
        finalDelay = window.getAdaptiveDelay(event);
      } catch (e) {
        console.warn('[OptimizedEventHandlers] Adaptive delay failed, using default:', e);
        finalDelay = delay;
      }
    }

    const key = this.generateKey(element, event, finalDelay);
    const registryKey = this.generateRegistryKey(element, event);

    // Check if handler already exists for this element+event combination
    if (this.handlerRegistry.has(registryKey)) {
      const existingHandler = this.handlerRegistry.get(registryKey);

      // If same delay, return existing cleanup
      if (existingHandler.delay === finalDelay && existingHandler.type === 'throttled') {
        this.metrics.handlersDeduped++;
        return existingHandler.cleanup;
      }

      // Different delay - remove old handler first
      existingHandler.cleanup();
      this.metrics.handlersRemoved++;
    }

    // Create throttled wrapper
    const throttledHandler = this.createThrottledHandler(handler, finalDelay, event);
    
    // Set passive option for performance-critical events
    const eventOptions = {
      ...options,
      passive: this.passiveEvents.has(event) || options.passive
    };

    // Add event listener
    element.addEventListener(event, throttledHandler, eventOptions);
    
    // Create cleanup function
    const cleanup = () => {
      element.removeEventListener(event, throttledHandler, eventOptions);
      this.activeHandlers.delete(key);
      this.handlerRegistry.delete(registryKey);
      this.cleanupCallbacks.delete(key);
      this.metrics.handlersRemoved++;
    };

    // Track for cleanup
    const handlerInfo = {
      element,
      event,
      handler: throttledHandler,
      originalHandler: handler,
      options: eventOptions,
      type: 'throttled',
      delay: finalDelay,
      adaptiveDelay: finalDelay !== delay,
      cleanup
    };

    this.activeHandlers.set(key, handlerInfo);
    this.handlerRegistry.set(registryKey, handlerInfo);
    this.cleanupCallbacks.set(key, cleanup);
    this.throttledHandlers.set(key, throttledHandler);
    this.metrics.handlersCreated++;
    
    // Track with memory manager if available
    if (window.memoryManager) {
      window.memoryManager.addEventListener(element, event, throttledHandler, eventOptions);
    }
    
    return handlerInfo.cleanup;
  }

  /**
   * Add debounced event handler for user input events
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {number} delay - Debounce delay in milliseconds
   * @param {Object} options - Event listener options
   */
  addDebouncedHandler(element, event, handler, delay = 300, options = {}) {
    // Use adaptive delay if available and not forced
    let finalDelay = delay;
    if (!options.forceDelay && window.getAdaptiveDelay) {
      try {
        const adaptiveDelay = window.getAdaptiveDelay(event);
        // For debounce, use the larger of adaptive or original delay
        finalDelay = Math.max(adaptiveDelay, delay);
      } catch (e) {
        console.warn('[OptimizedEventHandlers] Adaptive delay failed, using default:', e);
        finalDelay = delay;
      }
    }

    const key = this.generateKey(element, event, finalDelay);
    const registryKey = this.generateRegistryKey(element, event);

    // Check if handler already exists for this element+event combination
    if (this.handlerRegistry.has(registryKey)) {
      const existingHandler = this.handlerRegistry.get(registryKey);

      // If same delay, return existing cleanup
      if (existingHandler.delay === finalDelay && existingHandler.type === 'debounced') {
        this.metrics.handlersDeduped++;
        return existingHandler.cleanup;
      }

      // Different delay - remove old handler first
      existingHandler.cleanup();
      this.metrics.handlersRemoved++;
    }

    // Create debounced wrapper
    const debouncedHandler = this.createDebouncedHandler(handler, finalDelay, event);
    
    // Add event listener
    element.addEventListener(event, debouncedHandler, options);
    
    // Create cleanup function
    const cleanup = () => {
      element.removeEventListener(event, debouncedHandler, options);
      this.activeHandlers.delete(key);
      this.handlerRegistry.delete(registryKey);
      this.cleanupCallbacks.delete(key);
      this.debouncedHandlers.delete(key);
      this.metrics.handlersRemoved++;
    };

    // Track for cleanup
    const handlerInfo = {
      element,
      event,
      handler: debouncedHandler,
      originalHandler: handler,
      options,
      type: 'debounced',
      delay: finalDelay,
      adaptiveDelay: finalDelay !== delay,
      cleanup
    };

    this.activeHandlers.set(key, handlerInfo);
    this.handlerRegistry.set(registryKey, handlerInfo);
    this.cleanupCallbacks.set(key, cleanup);
    this.debouncedHandlers.set(key, debouncedHandler);
    this.metrics.handlersCreated++;
    
    // Track with memory manager if available
    if (window.memoryManager) {
      window.memoryManager.addEventListener(element, event, debouncedHandler, options);
    }
    
    return handlerInfo.cleanup;
  }

  /**
   * Create throttled handler wrapper
   */
  createThrottledHandler(handler, delay, eventType) {
    let lastExecTime = 0;
    let timeoutId = null;
    
    return (event) => {
      const startTime = performance.now();
      const now = Date.now();
      
      if (now - lastExecTime >= delay) {
        lastExecTime = now;
        this.executeHandler(handler, event, startTime, eventType);
      } else {
        // Schedule execution for the remaining time
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          lastExecTime = Date.now();
          this.executeHandler(handler, event, startTime, eventType);
        }, delay - (now - lastExecTime));
      }
    };
  }

  /**
   * Create debounced handler wrapper
   */
  createDebouncedHandler(handler, delay, eventType) {
    let timeoutId = null;
    
    return (event) => {
      const startTime = performance.now();
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.metrics.eventsSkipped++;
      }
      
      timeoutId = setTimeout(() => {
        this.executeHandler(handler, event, startTime, eventType);
      }, delay);
    };
  }

  /**
   * Execute handler with performance tracking
   */
  executeHandler(handler, event, startTime, eventType) {
    try {
      handler(event);
      
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime);
      
      // Log slow handlers
      if (processingTime > 16) { // More than one frame
        console.warn(`[OptimizedEventHandlers] Slow ${eventType} handler: ${processingTime.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('[OptimizedEventHandlers] Handler error:', error);
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics(processingTime) {
    this.metrics.eventsProcessed++;
    
    // Calculate rolling average
    const alpha = 0.1; // Smoothing factor
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (1 - alpha)) + (processingTime * alpha);
  }

  /**
   * Generate unique key for handler tracking
   */
  generateKey(element, event, delay) {
    // Handle window object specially
    if (element === window) {
      return `window-${event}-${delay}`;
    }

    // Handle document object specially
    if (element === document) {
      return `document-${event}-${delay}`;
    }

    // Handle regular DOM elements
    const elementId = element.id || element.tagName || element.constructor?.name || 'unknown';
    return `${elementId}-${event}-${delay}`;
  }

  /**
   * Generate registry key for element+event combination (without delay)
   */
  generateRegistryKey(element, event) {
    // Handle window object specially
    if (element === window) {
      return `window-${event}`;
    }

    // Handle document object specially
    if (element === document) {
      return `document-${event}`;
    }

    // Handle regular DOM elements
    if (element && typeof element.getAttribute === 'function') {
      const elementId = element.id ||
                       element.getAttribute('data-handler-id') ||
                       `${element.tagName}_${Array.from(element.parentNode?.children || []).indexOf(element)}`;
      return `${elementId}-${event}`;
    }

    // Fallback for other objects
    const elementId = element.id || element.constructor?.name || 'unknown';
    return `${elementId}-${event}`;
  }

  /**
   * Remove specific handler
   */
  removeHandler(key) {
    const handlerInfo = this.activeHandlers.get(key);
    if (!handlerInfo) return;

    // Remove event listener
    handlerInfo.element.removeEventListener(
      handlerInfo.event, 
      handlerInfo.handler, 
      handlerInfo.options
    );

    // Clean up tracking
    this.activeHandlers.delete(key);
    this.throttledHandlers.delete(key);
    this.debouncedHandlers.delete(key);
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      ...this.metrics,
      activeHandlers: this.activeHandlers.size,
      throttledHandlers: this.throttledHandlers.size,
      debouncedHandlers: this.debouncedHandlers.size
    };
  }

  /**
   * Clean up all handlers
   */
  cleanup() {
    console.log('[OptimizedEventHandlers] Cleaning up all handlers...');
    
    this.activeHandlers.forEach((handlerInfo, key) => {
      this.removeHandler(key);
    });
    
    this.activeHandlers.clear();
    this.throttledHandlers.clear();
    this.debouncedHandlers.clear();
    
    console.log('[OptimizedEventHandlers] Cleanup completed');
  }

  /**
   * Optimize existing event handlers on the page
   */
  optimizeExistingHandlers() {
    console.log('[OptimizedEventHandlers] Optimizing existing handlers...');
    
    // Common high-frequency event selectors
    const optimizationTargets = [
      { selector: 'input[type="text"], textarea', events: ['input', 'keyup'], type: 'debounced', delay: 300 },
      { selector: '.gradio-gallery', events: ['scroll'], type: 'throttled', delay: 16 },
      { selector: 'button, .clickable', events: ['click'], type: 'debounced', delay: 100 },
      { selector: window, events: ['resize'], type: 'throttled', delay: 100 },
      { selector: window, events: ['scroll'], type: 'throttled', delay: 16 }
    ];

    optimizationTargets.forEach(target => {
      const elements = target.selector === window ? [window] : document.querySelectorAll(target.selector);
      
      elements.forEach(element => {
        target.events.forEach(event => {
          // Check if element already has optimized handlers
          const key = this.generateKey(element, event, target.delay);
          if (!this.activeHandlers.has(key)) {
            // Add placeholder optimized handler
            const placeholderHandler = (e) => {
              // This will be replaced by actual handlers when they're registered
              console.log(`[OptimizedEventHandlers] Placeholder for ${event} on`, element);
            };
            
            if (target.type === 'throttled') {
              this.addThrottledHandler(element, event, placeholderHandler, target.delay);
            } else {
              this.addDebouncedHandler(element, event, placeholderHandler, target.delay);
            }
          }
        });
      });
    });
  }

  /**
   * Comprehensive cleanup of all handlers
   */
  cleanup() {
    // Clean up all active handlers
    this.cleanupCallbacks.forEach(cleanup => {
      try {
        cleanup();
      } catch (e) {
        console.warn('[OptimizedEventHandlers] Cleanup error:', e);
      }
    });

    // Clear all tracking maps
    this.activeHandlers.clear();
    this.handlerRegistry.clear();
    this.cleanupCallbacks.clear();
    this.debouncedHandlers.clear();
    this.throttledHandlers.clear();

    // Reset metrics
    this.metrics = {
      handlersCreated: 0,
      eventsProcessed: 0,
      eventsSkipped: 0,
      averageProcessingTime: 0,
      handlersDeduped: 0,
      handlersRemoved: 0
    };
  }

  /**
   * Get enhanced statistics
   */
  getStats() {
    return {
      ...this.metrics,
      activeHandlers: this.activeHandlers.size,
      registeredElements: this.handlerRegistry.size,
      memoryUsage: {
        activeHandlers: this.activeHandlers.size,
        handlerRegistry: this.handlerRegistry.size,
        cleanupCallbacks: this.cleanupCallbacks.size
      }
    };
  }
}

// Create global instance
window.optimizedEventHandlers = window.optimizedEventHandlers || new OptimizedEventHandlers();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.optimizedEventHandlers) {
    window.optimizedEventHandlers.cleanup();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OptimizedEventHandlers;
}

// Loaded. Use window.optimizedEventHandlers for optimized event handling.
