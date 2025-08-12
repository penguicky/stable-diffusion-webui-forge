/**
 * Memory Management System for Browser Extension
 * Prevents memory leaks by tracking and cleaning up resources
 */

class MemoryManager {
  constructor() {
    this.eventListeners = new Map();
    this.timers = new Set();
    this.intervals = new Set();
    this.observers = new Set();
    this.animationFrames = new Set();
    this.webSockets = new Set();
    this.isCleanupScheduled = false;
    
    // Auto-cleanup on page unload
    this.setupAutoCleanup();
    
    // Initialized
  }

  /**
   * Add event listener with automatic cleanup tracking
   * @param {Element|Window|Document} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   * @returns {Function} Cleanup function
   */
  addEventListener(element, event, handler, options = {}) {
    if (!element || typeof handler !== 'function') {
      console.warn('[MemoryManager] Invalid element or handler for addEventListener');
      return () => {};
    }

    element.addEventListener(event, handler, options);

    // Track for cleanup
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }

    const elementListeners = this.eventListeners.get(element);
    if (!elementListeners.has(event)) {
      elementListeners.set(event, []);
    }

    const listenerInfo = { handler, options };
    elementListeners.get(event).push(listenerInfo);

    // Return cleanup function
    return () => {
      this.removeEventListener(element, event, handler);
    };
  }

  /**
   * Remove specific event listener
   * @param {Element|Window|Document} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, event, handler) {
    if (!this.eventListeners.has(element)) return;

    const elementListeners = this.eventListeners.get(element);
    if (!elementListeners.has(event)) return;

    const listeners = elementListeners.get(event);
    const index = listeners.findIndex(l => l.handler === handler);
    
    if (index !== -1) {
      element.removeEventListener(event, handler);
      listeners.splice(index, 1);
      
      // Clean up empty arrays/maps
      if (listeners.length === 0) {
        elementListeners.delete(event);
      }
      if (elementListeners.size === 0) {
        this.eventListeners.delete(element);
      }
    }
  }

  /**
   * Set timeout with automatic cleanup tracking
   * @param {Function} callback - Callback function
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Timer ID
   */
  setTimeout(callback, delay) {
    const timerId = setTimeout(() => {
      this.timers.delete(timerId);
      callback();
    }, delay);

    this.timers.add(timerId);
    return timerId;
  }

  /**
   * Set interval with automatic cleanup tracking
   * @param {Function} callback - Callback function
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Interval ID
   */
  setInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervals.add(intervalId);
    return intervalId;
  }

  /**
   * Clear specific timeout
   * @param {number} timerId - Timer ID
   */
  clearTimeout(timerId) {
    if (this.timers.has(timerId)) {
      clearTimeout(timerId);
      this.timers.delete(timerId);
    }
  }

  /**
   * Clear specific interval
   * @param {number} intervalId - Interval ID
   */
  clearInterval(intervalId) {
    if (this.intervals.has(intervalId)) {
      clearInterval(intervalId);
      this.intervals.delete(intervalId);
    }
  }

  /**
   * Request animation frame with cleanup tracking
   * @param {Function} callback - Callback function
   * @returns {number} Frame ID
   */
  requestAnimationFrame(callback) {
    const frameId = requestAnimationFrame(() => {
      this.animationFrames.delete(frameId);
      callback();
    });

    this.animationFrames.add(frameId);
    return frameId;
  }

  /**
   * Cancel animation frame
   * @param {number} frameId - Frame ID
   */
  cancelAnimationFrame(frameId) {
    if (this.animationFrames.has(frameId)) {
      cancelAnimationFrame(frameId);
      this.animationFrames.delete(frameId);
    }
  }

  /**
   * Track MutationObserver for cleanup
   * @param {MutationObserver} observer - Observer instance
   */
  trackObserver(observer) {
    this.observers.add(observer);
    return observer;
  }

  /**
   * Track WebSocket for cleanup
   * @param {WebSocket} webSocket - WebSocket instance
   */
  trackWebSocket(webSocket) {
    this.webSockets.add(webSocket);
    return webSocket;
  }

  /**
   * Setup automatic cleanup on page unload
   */
  setupAutoCleanup() {
    const cleanup = () => this.cleanup();
    
    // Multiple events to ensure cleanup happens
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('unload', cleanup);
    
    // Cleanup on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.scheduleCleanup();
      }
    });
  }

  /**
   * Schedule cleanup to run after current execution
   */
  scheduleCleanup() {
    if (this.isCleanupScheduled) return;
    
    this.isCleanupScheduled = true;
    setTimeout(() => {
      this.partialCleanup();
      this.isCleanupScheduled = false;
    }, 1000);
  }

  /**
   * Partial cleanup for periodic maintenance
   */
  partialCleanup() {
    // Clean up stale DOM references
    this.eventListeners.forEach((events, element) => {
      // Check if element is a valid Node before calling document.contains
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

  /**
   * Clean up all listeners for a specific element
   * @param {Element} element - Target element
   */
  cleanupElementListeners(element) {
    if (!this.eventListeners.has(element)) return;
    
    const elementListeners = this.eventListeners.get(element);
    elementListeners.forEach((listeners, event) => {
      listeners.forEach(({ handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.eventListeners.delete(element);
  }

  /**
   * Complete cleanup of all tracked resources
   */
  cleanup() {
    console.log('[MemoryManager] Starting complete cleanup...');
    
    // Remove all event listeners
    this.eventListeners.forEach((events, element) => {
      events.forEach((listeners, event) => {
        listeners.forEach(({ handler }) => {
          try {
            element.removeEventListener(event, handler);
          } catch (e) {
            console.warn('[MemoryManager] Error removing event listener:', e);
          }
        });
      });
    });
    this.eventListeners.clear();

    // Clear all timers
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();

    // Cancel all animation frames
    this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    this.animationFrames.clear();

    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn('[MemoryManager] Error disconnecting observer:', e);
      }
    });
    this.observers.clear();

    // Close all WebSockets
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

  /**
   * Get current resource usage statistics
   * @returns {Object} Usage statistics
   */
  getStats() {
    return {
      eventListeners: this.eventListeners.size,
      timers: this.timers.size,
      intervals: this.intervals.size,
      observers: this.observers.size,
      animationFrames: this.animationFrames.size,
      webSockets: this.webSockets.size,
      totalElements: Array.from(this.eventListeners.keys()).length
    };
  }
}

// Create global instance
window.memoryManager = window.memoryManager || new MemoryManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryManager;
}
