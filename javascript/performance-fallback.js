/**
 * Performance Systems Fallback Loader
 * Provides basic performance optimizations when main systems fail to load
 */

class PerformanceFallback {
  constructor() {
    this.isActive = false;
    this.basicOptimizations = {
      debounceTimers: new Map(),
      throttleTimers: new Map(),
      domCache: new Map()
    };
    
    // Fallback system initialized
  }

  /**
   * Activate fallback optimizations
   */
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('[PerformanceFallback] Activating basic performance optimizations');
    
    // Basic event optimization
    this.setupBasicEventOptimization();
    
    // Basic DOM caching
    this.setupBasicDOMCaching();
    
    // Basic memory management
    this.setupBasicMemoryManagement();
    
    console.log('[PerformanceFallback] Basic optimizations active');
  }

  /**
   * Basic debouncing function
   */
  debounce(func, delay, key = 'default') {
    if (this.basicOptimizations.debounceTimers.has(key)) {
      clearTimeout(this.basicOptimizations.debounceTimers.get(key));
    }
    
    const timerId = setTimeout(() => {
      this.basicOptimizations.debounceTimers.delete(key);
      func();
    }, delay);
    
    this.basicOptimizations.debounceTimers.set(key, timerId);
  }

  /**
   * Basic throttling function
   */
  throttle(func, delay, key = 'default') {
    if (this.basicOptimizations.throttleTimers.has(key)) {
      return; // Already throttled
    }
    
    func();
    
    const timerId = setTimeout(() => {
      this.basicOptimizations.throttleTimers.delete(key);
    }, delay);
    
    this.basicOptimizations.throttleTimers.set(key, timerId);
  }

  /**
   * Basic DOM query caching
   */
  querySelector(selector, maxAge = 5000) {
    const cacheKey = selector;
    const cached = this.basicOptimizations.domCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.elements;
    }
    
    const elements = document.querySelectorAll(selector);
    this.basicOptimizations.domCache.set(cacheKey, {
      elements: Array.from(elements),
      timestamp: Date.now()
    });
    
    return elements;
  }

  /**
   * Check if element should be exempt from optimization (real-time interactions)
   */
  isRealTimeElement(element) {
    if (!element) return false;

    // Check for Forge Couple canvas elements
    if (element.tagName === 'CANVAS') {
      if (element.hasAttribute('data-forge-couple') ||
          element.closest('.forge-couple-container') ||
          element.closest('[id*="forge-couple"]') ||
          element.closest('[class*="forge-couple"]') ||
          element.id && element.id.includes('forge-couple')) {
        return true;
      }
    }

    // Check for other real-time interaction elements
    if (element.classList && (
        element.classList.contains('real-time') ||
        element.classList.contains('no-optimize') ||
        element.hasAttribute('data-real-time'))) {
      return true;
    }

    return false;
  }

  /**
   * Setup basic event optimization
   */
  setupBasicEventOptimization() {
    // Override common event patterns with basic optimization
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function(type, listener, options) {
      // Skip optimization for real-time elements
      if (window.performanceFallback.isRealTimeElement(this)) {
        console.log(`[PerformanceFallback] Real-time exemption for ${type} on`, this);
        return originalAddEventListener.call(this, type, listener, options);
      }

      // Apply basic throttling to high-frequency events
      if (['scroll', 'resize', 'mousemove'].includes(type)) {
        const throttledListener = (event) => {
          window.performanceFallback.throttle(() => listener(event), 16, `${type}-${Math.random()}`);
        };
        return originalAddEventListener.call(this, type, throttledListener, { ...options, passive: true });
      }

      // Apply basic debouncing to input events
      if (['input', 'keyup'].includes(type)) {
        const debouncedListener = (event) => {
          window.performanceFallback.debounce(() => listener(event), 300, `${type}-${Math.random()}`);
        };
        return originalAddEventListener.call(this, type, debouncedListener, options);
      }

      // Default behavior for other events
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  /**
   * Setup basic DOM caching
   */
  setupBasicDOMCaching() {
    // Override querySelector methods
    const originalQuerySelector = Document.prototype.querySelector;
    const originalQuerySelectorAll = Document.prototype.querySelectorAll;
    
    Document.prototype.querySelector = function(selector) {
      const results = window.performanceFallback.querySelector(selector);
      return results.length > 0 ? results[0] : null;
    };
    
    Document.prototype.querySelectorAll = function(selector) {
      return window.performanceFallback.querySelector(selector);
    };
  }

  /**
   * Setup basic memory management
   */
  setupBasicMemoryManagement() {
    // Basic cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // Periodic cache cleanup
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 30000);
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    const maxAge = 10000; // 10 seconds
    
    this.basicOptimizations.domCache.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        this.basicOptimizations.domCache.delete(key);
      }
    });
  }

  /**
   * Clean up all resources
   */
  cleanup() {
    // Clear all timers
    this.basicOptimizations.debounceTimers.forEach(timerId => clearTimeout(timerId));
    this.basicOptimizations.throttleTimers.forEach(timerId => clearTimeout(timerId));
    
    // Clear caches
    this.basicOptimizations.debounceTimers.clear();
    this.basicOptimizations.throttleTimers.clear();
    this.basicOptimizations.domCache.clear();
    
    this.isActive = false;
    console.log('[PerformanceFallback] Cleanup completed');
  }

  /**
   * Get basic stats
   */
  getStats() {
    return {
      isActive: this.isActive,
      debounceTimers: this.basicOptimizations.debounceTimers.size,
      throttleTimers: this.basicOptimizations.throttleTimers.size,
      cachedQueries: this.basicOptimizations.domCache.size
    };
  }
}

// Create global fallback instance
window.performanceFallback = window.performanceFallback || new PerformanceFallback();

// Check if main systems failed to load and activate fallback
setTimeout(() => {
  const mainSystemsLoaded = window.memoryManager && 
                           window.optimizedEventHandlers && 
                           window.domQueryOptimizer;
  
  if (!mainSystemsLoaded) {
    console.warn('[PerformanceFallback] Main performance systems not detected, activating fallback');
    window.performanceFallback.activate();
  } else {
    // Main systems detected, fallback not needed
  }
}, 5000); // Wait 5 seconds for main systems to load

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceFallback;
}

// Loaded. Will activate automatically if main systems fail.
