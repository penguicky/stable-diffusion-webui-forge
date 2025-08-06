/**
 * DOM Update Batcher
 * Batches DOM read and write operations to minimize layout thrashing
 */

class DOMUpdateBatcher {
  constructor() {
    this.pendingReads = [];
    this.pendingWrites = [];
    this.pendingMeasurements = [];
    this.rafId = null;
    this.isScheduled = false;
    this.frameStartTime = 0;
    
    // Performance tracking
    this.metrics = {
      framesProcessed: 0,
      operationsBatched: 0,
      averageFrameTime: 0,
      layoutThrashingPrevented: 0,
      slowFrames: 0
    };
    
    // Frame budget (16ms for 60fps)
    this.frameBudget = 16;
    
    console.log('[DOMUpdateBatcher] Initialized with read/write separation');
  }

  /**
   * Schedule a DOM read operation
   * @param {Function} readFn - Function that reads from DOM
   * @param {number} priority - Priority level (0-10, higher = more important)
   * @returns {Promise} Promise that resolves with read result
   */
  scheduleRead(readFn, priority = 5) {
    return new Promise((resolve, reject) => {
      const operation = {
        type: 'read',
        fn: readFn,
        priority,
        resolve,
        reject,
        timestamp: performance.now()
      };
      
      this.pendingReads.push(operation);
      this.schedule();
    });
  }

  /**
   * Schedule a DOM write operation
   * @param {Function} writeFn - Function that writes to DOM
   * @param {number} priority - Priority level (0-10, higher = more important)
   * @returns {Promise} Promise that resolves when write is complete
   */
  scheduleWrite(writeFn, priority = 5) {
    return new Promise((resolve, reject) => {
      const operation = {
        type: 'write',
        fn: writeFn,
        priority,
        resolve,
        reject,
        timestamp: performance.now()
      };
      
      this.pendingWrites.push(operation);
      this.schedule();
    });
  }

  /**
   * Schedule a DOM measurement operation (read + write)
   * @param {Function} measureFn - Function that measures and updates DOM
   * @param {number} priority - Priority level
   * @returns {Promise} Promise that resolves when measurement is complete
   */
  scheduleMeasurement(measureFn, priority = 5) {
    return new Promise((resolve, reject) => {
      const operation = {
        type: 'measurement',
        fn: measureFn,
        priority,
        resolve,
        reject,
        timestamp: performance.now()
      };
      
      this.pendingMeasurements.push(operation);
      this.schedule();
    });
  }

  /**
   * Batch multiple operations together
   * @param {Array} operations - Array of {type, fn, priority} objects
   * @returns {Promise} Promise that resolves when all operations complete
   */
  batchOperations(operations) {
    const promises = operations.map(op => {
      switch (op.type) {
        case 'read':
          return this.scheduleRead(op.fn, op.priority);
        case 'write':
          return this.scheduleWrite(op.fn, op.priority);
        case 'measurement':
          return this.scheduleMeasurement(op.fn, op.priority);
        default:
          return Promise.reject(new Error(`Unknown operation type: ${op.type}`));
      }
    });
    
    return Promise.all(promises);
  }

  /**
   * Schedule frame processing
   */
  schedule() {
    if (this.isScheduled) return;
    
    this.isScheduled = true;
    this.rafId = requestAnimationFrame(() => {
      this.processFrame();
    });
  }

  /**
   * Process all pending operations in a single frame
   */
  processFrame() {
    this.frameStartTime = performance.now();
    this.isScheduled = false;
    
    try {
      // Sort operations by priority
      this.sortOperationsByPriority();
      
      // Process in optimal order: reads first, then writes
      const readResults = this.processReads();
      this.processMeasurements();
      this.processWrites(readResults);
      
      // Update metrics
      this.updateFrameMetrics();
      
    } catch (error) {
      console.error('[DOMUpdateBatcher] Frame processing error:', error);
      this.rejectPendingOperations(error);
    } finally {
      // Clear processed operations
      this.clearProcessedOperations();
    }
  }

  /**
   * Sort operations by priority (higher priority first)
   */
  sortOperationsByPriority() {
    this.pendingReads.sort((a, b) => b.priority - a.priority);
    this.pendingWrites.sort((a, b) => b.priority - a.priority);
    this.pendingMeasurements.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process all read operations
   */
  processReads() {
    const results = [];
    const startTime = performance.now();
    
    this.pendingReads.forEach((operation, index) => {
      try {
        const result = operation.fn();
        results[index] = result;
        operation.resolve(result);
        
        // Check frame budget
        if (performance.now() - startTime > this.frameBudget * 0.3) {
          console.warn('[DOMUpdateBatcher] Read operations exceeding frame budget');
        }
      } catch (error) {
        operation.reject(error);
      }
    });
    
    return results;
  }

  /**
   * Process measurement operations
   */
  processMeasurements() {
    const startTime = performance.now();
    
    this.pendingMeasurements.forEach(operation => {
      try {
        const result = operation.fn();
        operation.resolve(result);
        
        // Check frame budget
        if (performance.now() - startTime > this.frameBudget * 0.4) {
          console.warn('[DOMUpdateBatcher] Measurement operations exceeding frame budget');
        }
      } catch (error) {
        operation.reject(error);
      }
    });
  }

  /**
   * Process all write operations
   */
  processWrites(readResults) {
    const startTime = performance.now();
    
    this.pendingWrites.forEach((operation, index) => {
      try {
        const result = operation.fn(readResults[index]);
        operation.resolve(result);
        
        // Check frame budget
        if (performance.now() - startTime > this.frameBudget * 0.3) {
          console.warn('[DOMUpdateBatcher] Write operations exceeding frame budget');
        }
      } catch (error) {
        operation.reject(error);
      }
    });
  }

  /**
   * Update frame processing metrics
   */
  updateFrameMetrics() {
    const frameTime = performance.now() - this.frameStartTime;
    const operationsCount = this.pendingReads.length + this.pendingWrites.length + this.pendingMeasurements.length;
    
    this.metrics.framesProcessed++;
    this.metrics.operationsBatched += operationsCount;
    
    // Update average frame time
    const alpha = 0.1;
    this.metrics.averageFrameTime = 
      (this.metrics.averageFrameTime * (1 - alpha)) + (frameTime * alpha);
    
    // Track slow frames
    if (frameTime > this.frameBudget) {
      this.metrics.slowFrames++;
      console.warn(`[DOMUpdateBatcher] Slow frame: ${frameTime.toFixed(2)}ms (${operationsCount} operations)`);
    }
    
    // Estimate layout thrashing prevented
    if (operationsCount > 1) {
      this.metrics.layoutThrashingPrevented += Math.max(0, operationsCount - 1);
    }
  }

  /**
   * Clear processed operations
   */
  clearProcessedOperations() {
    this.pendingReads = [];
    this.pendingWrites = [];
    this.pendingMeasurements = [];
  }

  /**
   * Reject all pending operations with error
   */
  rejectPendingOperations(error) {
    [...this.pendingReads, ...this.pendingWrites, ...this.pendingMeasurements]
      .forEach(operation => operation.reject(error));
  }

  /**
   * Utility methods for common DOM operations
   */
  
  /**
   * Batch style updates
   * @param {Array} styleUpdates - Array of {element, styles} objects
   * @returns {Promise} Promise that resolves when styles are applied
   */
  batchStyleUpdates(styleUpdates) {
    return this.scheduleWrite(() => {
      styleUpdates.forEach(update => {
        Object.assign(update.element.style, update.styles);
      });
    }, 7); // High priority for visual updates
  }

  /**
   * Batch class updates
   * @param {Array} classUpdates - Array of {element, add?, remove?, toggle?} objects
   * @returns {Promise} Promise that resolves when classes are updated
   */
  batchClassUpdates(classUpdates) {
    return this.scheduleWrite(() => {
      classUpdates.forEach(update => {
        if (update.add) {
          update.element.classList.add(...(Array.isArray(update.add) ? update.add : [update.add]));
        }
        if (update.remove) {
          update.element.classList.remove(...(Array.isArray(update.remove) ? update.remove : [update.remove]));
        }
        if (update.toggle) {
          update.element.classList.toggle(update.toggle);
        }
      });
    }, 6);
  }

  /**
   * Batch element measurements
   * @param {Array} elements - Elements to measure
   * @returns {Promise} Promise that resolves with measurement results
   */
  batchMeasurements(elements) {
    return this.scheduleRead(() => {
      return elements.map(element => ({
        element,
        rect: element.getBoundingClientRect(),
        computedStyle: window.getComputedStyle(element),
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft
      }));
    }, 8); // High priority for measurements
  }

  /**
   * Batch text content updates
   * @param {Array} textUpdates - Array of {element, text} objects
   * @returns {Promise} Promise that resolves when text is updated
   */
  batchTextUpdates(textUpdates) {
    return this.scheduleWrite(() => {
      textUpdates.forEach(update => {
        if (update.html) {
          update.element.innerHTML = update.html;
        } else {
          update.element.textContent = update.text;
        }
      });
    }, 5);
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const slowFrameRate = this.metrics.framesProcessed > 0 ? 
      (this.metrics.slowFrames / this.metrics.framesProcessed * 100) : 0;
    
    return {
      ...this.metrics,
      slowFrameRate: slowFrameRate.toFixed(2) + '%',
      averageOperationsPerFrame: this.metrics.framesProcessed > 0 ? 
        (this.metrics.operationsBatched / this.metrics.framesProcessed).toFixed(1) : 0,
      pendingOperations: this.pendingReads.length + this.pendingWrites.length + this.pendingMeasurements.length,
      isScheduled: this.isScheduled
    };
  }

  /**
   * Force immediate processing of pending operations
   */
  flush() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.pendingReads.length > 0 || this.pendingWrites.length > 0 || this.pendingMeasurements.length > 0) {
      this.processFrame();
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Reject all pending operations
    this.rejectPendingOperations(new Error('DOMUpdateBatcher cleanup'));
    
    this.clearProcessedOperations();
    this.isScheduled = false;
    
    console.log('[DOMUpdateBatcher] Cleanup completed');
  }
}

// Create global instance
window.domUpdateBatcher = window.domUpdateBatcher || new DOMUpdateBatcher();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.domUpdateBatcher) {
    window.domUpdateBatcher.cleanup();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUpdateBatcher;
}

console.log('[DOMUpdateBatcher] Loaded. Use window.domUpdateBatcher for batched DOM operations.');
