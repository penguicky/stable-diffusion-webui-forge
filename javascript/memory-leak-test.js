/**
 * Memory Leak Detection and Testing Suite
 * Run this in browser console to test memory management improvements
 */

class MemoryLeakTester {
  constructor() {
    this.initialMemory = null;
    this.testResults = [];
    this.isRunning = false;
  }

  /**
   * Start comprehensive memory leak testing
   */
  async runTests() {
    if (this.isRunning) {
      console.warn('[MemoryTester] Tests already running');
      return;
    }

    this.isRunning = true;
    console.log('[MemoryTester] Starting memory leak tests...');
    
    // Record initial memory
    this.recordMemory('Initial');
    
    try {
      await this.testEventListeners();
      await this.testMutationObservers();
      await this.testTimers();
      await this.testWebSockets();
      await this.testPerformanceIntegration();
      await this.testMemoryManager();
      await this.testPerformanceOptimizations();

      this.generateReport();
    } catch (error) {
      console.error('[MemoryTester] Test failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test event listener cleanup
   */
  async testEventListeners() {
    console.log('[MemoryTester] Testing event listeners...');
    
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    // Test with memory manager
    const cleanup1 = window.memoryManager?.addEventListener(testElement, 'click', () => {});
    const cleanup2 = window.memoryManager?.addEventListener(window, 'resize', () => {});
    
    // Test without memory manager (should be tracked for cleanup)
    testElement.addEventListener('mouseover', () => {});
    
    this.recordMemory('After adding event listeners');
    
    // Cleanup
    if (cleanup1) cleanup1();
    if (cleanup2) cleanup2();
    
    document.body.removeChild(testElement);
    this.recordMemory('After event listener cleanup');
    
    await this.delay(1000);
  }

  /**
   * Test MutationObserver cleanup
   */
  async testMutationObservers() {
    console.log('[MemoryTester] Testing MutationObservers...');
    
    const observer1 = new MutationObserver(() => {});
    const observer2 = new MutationObserver(() => {});
    
    // Track with memory manager
    if (window.memoryManager) {
      window.memoryManager.trackObserver(observer1);
      window.memoryManager.trackObserver(observer2);
    }
    
    observer1.observe(document.body, { childList: true });
    observer2.observe(document.body, { attributes: true });
    
    this.recordMemory('After creating observers');
    
    // Cleanup
    observer1.disconnect();
    observer2.disconnect();
    
    this.recordMemory('After disconnecting observers');
    
    await this.delay(1000);
  }

  /**
   * Test timer cleanup
   */
  async testTimers() {
    console.log('[MemoryTester] Testing timers...');
    
    const timers = [];
    const intervals = [];
    
    // Create timers with memory manager
    if (window.memoryManager) {
      timers.push(window.memoryManager.setTimeout(() => {}, 5000));
      timers.push(window.memoryManager.setTimeout(() => {}, 10000));
      intervals.push(window.memoryManager.setInterval(() => {}, 1000));
    }
    
    // Create regular timers (should be cleaned up manually)
    timers.push(setTimeout(() => {}, 5000));
    intervals.push(setInterval(() => {}, 1000));
    
    this.recordMemory('After creating timers');
    
    // Cleanup
    timers.forEach(id => {
      if (window.memoryManager) {
        window.memoryManager.clearTimeout(id);
      } else {
        clearTimeout(id);
      }
    });
    
    intervals.forEach(id => {
      if (window.memoryManager) {
        window.memoryManager.clearInterval(id);
      } else {
        clearInterval(id);
      }
    });
    
    this.recordMemory('After clearing timers');
    
    await this.delay(1000);
  }

  /**
   * Test WebSocket cleanup
   */
  async testWebSockets() {
    console.log('[MemoryTester] Testing WebSocket cleanup...');
    
    // Test BackendBridge if available
    if (window.BackendBridge) {
      const bridge = new window.BackendBridge();
      
      this.recordMemory('After creating BackendBridge');
      
      // Simulate some operations
      await this.delay(500);
      
      // Cleanup
      bridge.destroy();
      
      this.recordMemory('After destroying BackendBridge');
    }
    
    await this.delay(1000);
  }

  /**
   * Test performance integration
   */
  async testPerformanceIntegration() {
    console.log('[MemoryTester] Testing Performance Integration...');

    if (!window.performanceIntegration) {
      console.warn('[MemoryTester] Performance Integration not available');
      return;
    }

    // Wait for initialization
    await window.performanceIntegration.initialize();

    const stats = window.performanceIntegration.getPerformanceStats();
    console.log('[MemoryTester] Performance Integration Stats:', stats);

    this.recordMemory('After performance integration test');

    await this.delay(1000);
  }

  /**
   * Test memory manager functionality
   */
  async testMemoryManager() {
    console.log('[MemoryTester] Testing MemoryManager...');

    if (!window.memoryManager) {
      console.warn('[MemoryTester] MemoryManager not available');
      return;
    }
    
    const stats1 = window.memoryManager.getStats();
    console.log('[MemoryTester] Initial stats:', stats1);
    
    // Create some resources
    const testDiv = document.createElement('div');
    document.body.appendChild(testDiv);
    
    const cleanup1 = window.memoryManager.addEventListener(testDiv, 'click', () => {});
    const cleanup2 = window.memoryManager.addEventListener(window, 'scroll', () => {});
    const timer1 = window.memoryManager.setTimeout(() => {}, 5000);
    const interval1 = window.memoryManager.setInterval(() => {}, 1000);
    
    const stats2 = window.memoryManager.getStats();
    console.log('[MemoryTester] After creating resources:', stats2);
    
    this.recordMemory('After creating managed resources');
    
    // Partial cleanup
    window.memoryManager.scheduleCleanup();
    await this.delay(2000);
    
    const stats3 = window.memoryManager.getStats();
    console.log('[MemoryTester] After partial cleanup:', stats3);
    
    // Full cleanup
    cleanup1();
    cleanup2();
    window.memoryManager.clearTimeout(timer1);
    window.memoryManager.clearInterval(interval1);
    document.body.removeChild(testDiv);
    
    const stats4 = window.memoryManager.getStats();
    console.log('[MemoryTester] After full cleanup:', stats4);
    
    this.recordMemory('After full cleanup');
    
    await this.delay(1000);
  }

  /**
   * Test performance optimizations
   */
  async testPerformanceOptimizations() {
    console.log('[MemoryTester] Testing Performance Optimizations...');

    // Test DOM query optimization
    if (window.domQueryOptimizer) {
      const startTime = performance.now();

      // Perform multiple queries to test caching
      for (let i = 0; i < 10; i++) {
        window.domQueryOptimizer.querySelector('#txt2img_prompt');
        window.domQueryOptimizer.querySelector('.gradio-gallery');
      }

      const queryTime = performance.now() - startTime;
      console.log(`[MemoryTester] DOM queries completed in ${queryTime.toFixed(2)}ms`);

      const queryStats = window.domQueryOptimizer.getStats();
      console.log('[MemoryTester] DOM Query Stats:', queryStats);
    }

    // Test DOM update batching
    if (window.domUpdateBatcher) {
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);

      const startTime = performance.now();

      // Batch multiple DOM operations
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push({
          type: 'write',
          fn: () => {
            testDiv.style.left = `${i}px`;
          }
        });
      }

      await window.domUpdateBatcher.batchOperations(operations);

      const batchTime = performance.now() - startTime;
      console.log(`[MemoryTester] Batched operations completed in ${batchTime.toFixed(2)}ms`);

      document.body.removeChild(testDiv);

      const batchStats = window.domUpdateBatcher.getStats();
      console.log('[MemoryTester] DOM Batch Stats:', batchStats);
    }

    // Test optimized event handlers
    if (window.optimizedEventHandlers) {
      const testButton = document.createElement('button');
      document.body.appendChild(testButton);

      let clickCount = 0;
      const cleanup = window.optimizedEventHandlers.addDebouncedHandler(
        testButton,
        'click',
        () => clickCount++,
        100
      );

      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        testButton.click();
      }

      await this.delay(200); // Wait for debouncing

      console.log(`[MemoryTester] Debounced clicks: ${clickCount} (should be 1)`);

      cleanup();
      document.body.removeChild(testButton);

      const handlerStats = window.optimizedEventHandlers.getStats();
      console.log('[MemoryTester] Event Handler Stats:', handlerStats);
    }

    this.recordMemory('After performance optimization tests');

    await this.delay(1000);
  }

  /**
   * Record current memory usage
   */
  recordMemory(label) {
    if (!performance.memory) {
      console.warn('[MemoryTester] Performance.memory not available');
      return;
    }
    
    const memory = {
      label,
      timestamp: Date.now(),
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
    
    this.testResults.push(memory);
    console.log(`[MemoryTester] ${label}: ${memory.used}MB used, ${memory.total}MB total`);
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('\n=== MEMORY LEAK TEST REPORT ===');
    
    if (this.testResults.length === 0) {
      console.log('No memory data collected');
      return;
    }
    
    const initial = this.testResults[0];
    const final = this.testResults[this.testResults.length - 1];
    
    console.log(`Initial Memory: ${initial.used}MB`);
    console.log(`Final Memory: ${final.used}MB`);
    console.log(`Memory Change: ${final.used - initial.used}MB`);
    
    // Detailed breakdown
    console.log('\nDetailed Memory Usage:');
    this.testResults.forEach(result => {
      const change = result.used - initial.used;
      const changeStr = change >= 0 ? `+${change}` : `${change}`;
      console.log(`  ${result.label}: ${result.used}MB (${changeStr}MB)`);
    });
    
    // Analysis
    const memoryIncrease = final.used - initial.used;
    if (memoryIncrease > 10) {
      console.warn(`⚠️  Significant memory increase detected: ${memoryIncrease}MB`);
      console.log('Recommendations:');
      console.log('- Check for uncleaned event listeners');
      console.log('- Verify MutationObserver disconnection');
      console.log('- Ensure timer cleanup');
      console.log('- Review WebSocket connection management');
    } else if (memoryIncrease > 5) {
      console.log(`⚡ Moderate memory increase: ${memoryIncrease}MB (acceptable for testing)`);
    } else {
      console.log(`✅ Memory usage stable: ${memoryIncrease}MB change`);
    }
    
    // Memory manager stats
    if (window.memoryManager) {
      const stats = window.memoryManager.getStats();
      console.log('\nMemory Manager Stats:');
      console.log(`  Event Listeners: ${stats.eventListeners}`);
      console.log(`  Timers: ${stats.timers}`);
      console.log(`  Intervals: ${stats.intervals}`);
      console.log(`  Observers: ${stats.observers}`);
      console.log(`  Animation Frames: ${stats.animationFrames}`);
      console.log(`  WebSockets: ${stats.webSockets}`);
      
      if (stats.timers > 0 || stats.intervals > 0 || stats.observers > 0) {
        console.warn('⚠️  Some resources still tracked - check for cleanup issues');
      }
    }
    
    console.log('\n=== END REPORT ===\n');
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Force garbage collection if available
   */
  forceGC() {
    if (window.gc) {
      window.gc();
      console.log('[MemoryTester] Forced garbage collection');
    } else {
      console.log('[MemoryTester] Garbage collection not available (run with --expose-gc)');
    }
  }
}

// Create global instance
window.memoryLeakTester = new MemoryLeakTester();

// Auto-run tests if requested
if (window.location.search.includes('run-memory-tests')) {
  window.memoryLeakTester.runTests();
}

// Loaded. Run window.memoryLeakTester.runTests() to start testing.
