/**
 * DOM Query Optimizer with Intelligent Caching
 * Reduces expensive DOM queries and provides smart cache invalidation
 */

class DOMQueryOptimizer {
  constructor() {
    this.cache = new Map();
    this.selectorStats = new Map();
    this.defaultCacheTimeout = 5000; // 5 seconds
    this.maxCacheSize = 100;
    this.observedElements = new Set();
    this.mutationObserver = null;
    
    // Performance tracking
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      queriesOptimized: 0,
      averageQueryTime: 0,
      slowQueries: []
    };
    
    this.setupMutationObserver();
    this.setupPeriodicCleanup();
    
    console.log('[DOMQueryOptimizer] Initialized with intelligent caching');
  }

  /**
   * Optimized querySelector with caching
   * @param {string} selector - CSS selector
   * @param {number} maxAge - Maximum cache age in milliseconds
   * @param {Element} context - Context element (default: document)
   * @returns {NodeList} Found elements
   */
  querySelector(selector, maxAge = this.defaultCacheTimeout, context = document) {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(selector, context);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached, maxAge)) {
      this.metrics.cacheHits++;
      this.updateSelectorStats(selector, performance.now() - startTime, true);
      return cached.elements;
    }

    // Perform query
    const elements = context.querySelectorAll(selector);
    const queryTime = performance.now() - startTime;
    
    // Cache results
    this.cacheResults(cacheKey, selector, elements, context);
    
    // Update metrics
    this.metrics.cacheMisses++;
    this.metrics.queriesOptimized++;
    this.updateSelectorStats(selector, queryTime, false);
    this.updateAverageQueryTime(queryTime);
    
    // Track slow queries
    if (queryTime > 10) {
      this.trackSlowQuery(selector, queryTime);
    }
    
    return elements;
  }

  /**
   * Optimized getElementById with caching
   * @param {string} id - Element ID
   * @param {number} maxAge - Maximum cache age
   * @returns {Element|null} Found element
   */
  getElementById(id, maxAge = this.defaultCacheTimeout) {
    const selector = `#${id}`;
    const results = this.querySelector(selector, maxAge);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Optimized getElementsByClassName with caching
   * @param {string} className - Class name
   * @param {number} maxAge - Maximum cache age
   * @param {Element} context - Context element
   * @returns {NodeList} Found elements
   */
  getElementsByClassName(className, maxAge = this.defaultCacheTimeout, context = document) {
    const selector = `.${className}`;
    return this.querySelector(selector, maxAge, context);
  }

  /**
   * Batch multiple queries for better performance
   * @param {Array} queries - Array of {selector, maxAge?, context?} objects
   * @returns {Object} Results keyed by selector
   */
  batchQuery(queries) {
    const results = {};
    const startTime = performance.now();
    
    // Group queries by context for better performance
    const contextGroups = new Map();
    
    queries.forEach(query => {
      const context = query.context || document;
      if (!contextGroups.has(context)) {
        contextGroups.set(context, []);
      }
      contextGroups.get(context).push(query);
    });
    
    // Execute queries by context
    contextGroups.forEach((contextQueries, context) => {
      contextQueries.forEach(query => {
        results[query.selector] = this.querySelector(
          query.selector, 
          query.maxAge || this.defaultCacheTimeout, 
          context
        );
      });
    });
    
    const totalTime = performance.now() - startTime;
    console.log(`[DOMQueryOptimizer] Batch query completed in ${totalTime.toFixed(2)}ms`);
    
    return results;
  }

  /**
   * Generate cache key
   */
  generateCacheKey(selector, context) {
    const contextId = context === document ? 'document' : 
                     (context.id || context.tagName || 'unknown');
    return `${contextId}::${selector}`;
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(cached, maxAge) {
    return (Date.now() - cached.timestamp) < maxAge;
  }

  /**
   * Cache query results
   */
  cacheResults(cacheKey, selector, elements, context) {
    // Implement LRU cache behavior
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const cacheEntry = {
      elements: Array.from(elements),
      timestamp: Date.now(),
      selector,
      context,
      accessCount: 1
    };
    
    this.cache.set(cacheKey, cacheEntry);
    
    // Start observing elements for changes
    this.observeElements(elements);
  }

  /**
   * Observe elements for changes to invalidate cache
   */
  observeElements(elements) {
    elements.forEach(element => {
      if (!this.observedElements.has(element)) {
        this.observedElements.add(element);
      }
    });
  }

  /**
   * Setup mutation observer for cache invalidation
   */
  setupMutationObserver() {
    // Wait for document.body to be available
    const initObserver = () => {
      if (!document.body) {
        // If body doesn't exist yet, wait for it
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initObserver);
          return;
        } else {
          // Fallback: wait a bit and try again
          setTimeout(initObserver, 100);
          return;
        }
      }

      this.mutationObserver = new MutationObserver((mutations) => {
        let shouldInvalidateCache = false;

        mutations.forEach(mutation => {
          // Check if any observed elements were modified
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                shouldInvalidateCache = true;
              }
            });

            mutation.removedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                shouldInvalidateCache = true;
                this.observedElements.delete(node);
              }
            });
          } else if (mutation.type === 'attributes') {
            if (this.observedElements.has(mutation.target)) {
              shouldInvalidateCache = true;
            }
          }
        });

        if (shouldInvalidateCache) {
          this.invalidateRelevantCache(mutations);
        }
      });

      try {
        this.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'id', 'style']
        });

        // Track observer for cleanup
        if (window.memoryManager) {
          window.memoryManager.trackObserver(this.mutationObserver);
        }

        console.log('[DOMQueryOptimizer] MutationObserver initialized successfully');
      } catch (error) {
        console.error('[DOMQueryOptimizer] Failed to setup MutationObserver:', error);
      }
    };

    initObserver();
  }

  /**
   * Invalidate relevant cache entries based on mutations
   */
  invalidateRelevantCache(mutations) {
    const invalidatedKeys = new Set();
    
    mutations.forEach(mutation => {
      // Invalidate cache entries that might be affected
      this.cache.forEach((entry, key) => {
        if (this.shouldInvalidateEntry(entry, mutation)) {
          invalidatedKeys.add(key);
        }
      });
    });
    
    invalidatedKeys.forEach(key => {
      this.cache.delete(key);
    });
    
    if (invalidatedKeys.size > 0) {
      console.log(`[DOMQueryOptimizer] Invalidated ${invalidatedKeys.size} cache entries`);
    }
  }

  /**
   * Determine if cache entry should be invalidated
   */
  shouldInvalidateEntry(entry, mutation) {
    // Simple heuristic: invalidate if selector might be affected
    const selector = entry.selector;
    
    if (mutation.type === 'attributes') {
      const attrName = mutation.attributeName;
      if ((attrName === 'class' && selector.includes('.')) ||
          (attrName === 'id' && selector.includes('#'))) {
        return true;
      }
    }
    
    if (mutation.type === 'childList') {
      // Invalidate structural selectors
      if (selector.includes('>') || selector.includes('+') || selector.includes('~')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Update selector performance statistics
   */
  updateSelectorStats(selector, queryTime, fromCache) {
    if (!this.selectorStats.has(selector)) {
      this.selectorStats.set(selector, {
        totalQueries: 0,
        cacheHits: 0,
        totalTime: 0,
        averageTime: 0,
        slowestQuery: 0
      });
    }
    
    const stats = this.selectorStats.get(selector);
    stats.totalQueries++;
    
    if (fromCache) {
      stats.cacheHits++;
    } else {
      stats.totalTime += queryTime;
      stats.averageTime = stats.totalTime / (stats.totalQueries - stats.cacheHits);
      stats.slowestQuery = Math.max(stats.slowestQuery, queryTime);
    }
  }

  /**
   * Update average query time
   */
  updateAverageQueryTime(queryTime) {
    const alpha = 0.1; // Smoothing factor
    this.metrics.averageQueryTime = 
      (this.metrics.averageQueryTime * (1 - alpha)) + (queryTime * alpha);
  }

  /**
   * Track slow queries for optimization
   */
  trackSlowQuery(selector, queryTime) {
    this.metrics.slowQueries.push({
      selector,
      time: queryTime,
      timestamp: Date.now()
    });
    
    // Keep only recent slow queries
    if (this.metrics.slowQueries.length > 50) {
      this.metrics.slowQueries.shift();
    }
    
    console.warn(`[DOMQueryOptimizer] Slow query detected: "${selector}" took ${queryTime.toFixed(2)}ms`);
  }

  /**
   * Setup periodic cache cleanup
   */
  setupPeriodicCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 30000); // Every 30 seconds
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.defaultCacheTimeout * 2) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`[DOMQueryOptimizer] Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Manually invalidate cache
   * @param {string} selector - Specific selector to invalidate (optional)
   */
  invalidateCache(selector = null) {
    if (selector) {
      const keysToDelete = [];
      this.cache.forEach((entry, key) => {
        if (entry.selector === selector) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`[DOMQueryOptimizer] Invalidated cache for selector: ${selector}`);
    } else {
      this.cache.clear();
      console.log('[DOMQueryOptimizer] Cleared all cache');
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: cacheHitRate.toFixed(2) + '%',
      observedElements: this.observedElements.size,
      selectorStats: Object.fromEntries(this.selectorStats),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check cache hit rate
    const hitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses);
    if (hitRate < 0.5) {
      recommendations.push('Low cache hit rate - consider increasing cache timeout for stable selectors');
    }
    
    // Check for slow queries
    if (this.metrics.slowQueries.length > 10) {
      recommendations.push('Multiple slow queries detected - consider optimizing selectors');
    }
    
    // Check average query time
    if (this.metrics.averageQueryTime > 5) {
      recommendations.push('High average query time - review selector complexity');
    }
    
    return recommendations;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    this.cache.clear();
    this.observedElements.clear();
    this.selectorStats.clear();
    
    console.log('[DOMQueryOptimizer] Cleanup completed');
  }
}

// Create global instance
window.domQueryOptimizer = window.domQueryOptimizer || new DOMQueryOptimizer();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.domQueryOptimizer) {
    window.domQueryOptimizer.cleanup();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMQueryOptimizer;
}

console.log('[DOMQueryOptimizer] Loaded. Use window.domQueryOptimizer for optimized DOM queries.');
