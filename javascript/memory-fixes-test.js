/**
 * Memory Fixes Validation Test
 * Tests the critical memory fixes to ensure they're working properly
 */

class MemoryFixesTest {
    constructor() {
        this.testResults = [];
        this.initialMemory = this.getMemoryUsage();
    }

    /**
     * Run all memory fix tests
     */
    async runAllTests() {
        console.log('🧪 Starting Memory Fixes Validation Tests...');
        
        const tests = [
            { name: 'Shadow DOM Cleanup', test: () => this.testShadowDOMCleanup() },
            { name: 'DOM Query Cache Limits', test: () => this.testDOMQueryCacheLimits() },
            { name: 'Event Handler Deduplication', test: () => this.testEventHandlerDeduplication() },
            { name: 'Image Cache Bounds', test: () => this.testImageCacheBounds() },
            { name: 'Memory Leak Prevention', test: () => this.testMemoryLeakPrevention() }
        ];

        for (const { name, test } of tests) {
            console.log(`\n🔍 Testing: ${name}`);
            try {
                const result = await test();
                this.testResults.push({ name, status: 'PASS', result });
                console.log(`✅ ${name}: PASSED`);
            } catch (error) {
                this.testResults.push({ name, status: 'FAIL', error: error.message });
                console.error(`❌ ${name}: FAILED -`, error.message);
            }
        }

        return this.generateReport();
    }

    /**
     * Test Shadow DOM cleanup functionality
     */
    async testShadowDOMCleanup() {
        if (!window.enhancedShadowDOMManager) {
            throw new Error('Enhanced Shadow DOM Manager not available');
        }

        const initialContainers = window.enhancedShadowDOMManager.containers.size;
        
        // Create test containers
        const testElements = [];
        for (let i = 0; i < 5; i++) {
            const element = document.createElement('div');
            element.id = `test-shadow-${i}`;
            document.body.appendChild(element);
            testElements.push(element);
            
            window.enhancedShadowDOMManager.createContainer(element, 'closed');
        }

        // Verify containers were created
        const afterCreation = window.enhancedShadowDOMManager.containers.size;
        if (afterCreation !== initialContainers + 5) {
            throw new Error(`Expected ${initialContainers + 5} containers, got ${afterCreation}`);
        }

        // Remove elements and trigger cleanup
        testElements.forEach(element => {
            document.body.removeChild(element);
        });

        // Wait for cleanup to trigger
        await this.delay(100);
        window.enhancedShadowDOMManager.performPeriodicCleanup();

        // Verify cleanup occurred
        const afterCleanup = window.enhancedShadowDOMManager.containers.size;
        if (afterCleanup > initialContainers + 1) { // Allow for some delay
            throw new Error(`Cleanup failed: ${afterCleanup} containers remaining`);
        }

        return {
            initialContainers,
            afterCreation,
            afterCleanup,
            cleanupEffective: afterCleanup <= initialContainers + 1
        };
    }

    /**
     * Test DOM Query Cache size limits
     */
    async testDOMQueryCacheLimits() {
        if (!window.domQueryOptimizer) {
            throw new Error('DOM Query Optimizer not available');
        }

        const optimizer = window.domQueryOptimizer;
        const initialCacheSize = optimizer.cache.size;
        const maxCacheSize = optimizer.maxCacheSize;

        // Clear cache to start fresh
        optimizer.invalidateCache();

        // Fill cache beyond limit
        const testSelectors = [];
        for (let i = 0; i < maxCacheSize + 20; i++) {
            const selector = `div.test-${i}`;
            testSelectors.push(selector);
            optimizer.querySelector(selector);
        }

        // Verify cache size is limited
        const finalCacheSize = optimizer.cache.size;
        if (finalCacheSize > maxCacheSize) {
            throw new Error(`Cache size exceeded limit: ${finalCacheSize} > ${maxCacheSize}`);
        }

        // Test LRU eviction
        const stats = optimizer.getStats();
        
        return {
            maxCacheSize,
            finalCacheSize,
            evictionsOccurred: finalCacheSize === maxCacheSize,
            cacheStats: stats.cacheStats
        };
    }

    /**
     * Test event handler deduplication
     */
    async testEventHandlerDeduplication() {
        if (!window.deduplicatedEventManager) {
            throw new Error('Deduplicated Event Manager not available');
        }

        const manager = window.deduplicatedEventManager;
        const initialStats = manager.getStats();

        // Create test element
        const testElement = document.createElement('button');
        testElement.id = 'test-dedup-button';
        document.body.appendChild(testElement);

        // Add multiple handlers for same event (should be deduplicated)
        const handler1 = () => console.log('handler1');
        const handler2 = () => console.log('handler2');

        const cleanup1 = manager.addHandler(testElement, 'click', handler1);
        const cleanup2 = manager.addHandler(testElement, 'click', handler2); // Should dedupe

        const afterAddition = manager.getStats();

        // Verify deduplication occurred
        if (afterAddition.handlersDeduped <= initialStats.handlersDeduped) {
            throw new Error('Handler deduplication did not occur');
        }

        // Cleanup
        cleanup1();
        cleanup2();
        document.body.removeChild(testElement);

        const finalStats = manager.getStats();

        return {
            initialHandlers: initialStats.active,
            afterAddition: afterAddition.active,
            deduplicationsOccurred: afterAddition.handlersDeduped - initialStats.handlersDeduped,
            finalHandlers: finalStats.active
        };
    }

    /**
     * Test image cache bounds
     */
    async testImageCacheBounds() {
        if (!window.iibMemoryBoundedCache) {
            throw new Error('Memory Bounded Image Cache not available');
        }

        const cache = window.iibMemoryBoundedCache;
        const initialStats = cache.getStats();

        // Fill cache with test data
        const testData = [];
        for (let i = 0; i < 50; i++) {
            const data = new Array(1024 * 100).fill('x').join(''); // ~100KB each
            testData.push(data);
            cache.set(`test-image-${i}`, data);
        }

        const afterFilling = cache.getStats();

        // Verify memory bounds are respected
        if (afterFilling.memoryUsageMB > cache.maxMemoryMB * 1.1) { // Allow 10% tolerance
            throw new Error(`Memory usage exceeded bounds: ${afterFilling.memoryUsageMB}MB > ${cache.maxMemoryMB}MB`);
        }

        // Test eviction
        const evictionsOccurred = afterFilling.evictions > initialStats.evictions;

        // Cleanup
        cache.clear();

        return {
            maxMemoryMB: cache.maxMemoryMB,
            peakMemoryUsageMB: afterFilling.memoryUsageMB,
            evictionsOccurred,
            memoryBoundsRespected: afterFilling.memoryUsageMB <= cache.maxMemoryMB * 1.1
        };
    }

    /**
     * Test overall memory leak prevention
     */
    async testMemoryLeakPrevention() {
        const initialMemory = this.getMemoryUsage();
        
        // Simulate heavy operations that could cause leaks
        await this.simulateHeavyOperations();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Wait for cleanup
        await this.delay(1000);
        
        const finalMemory = this.getMemoryUsage();
        const memoryIncrease = finalMemory.used - initialMemory.used;
        
        // Memory increase should be reasonable (less than 50MB)
        if (memoryIncrease > 50) {
            throw new Error(`Excessive memory increase: ${memoryIncrease}MB`);
        }

        return {
            initialMemoryMB: initialMemory.used,
            finalMemoryMB: finalMemory.used,
            increaseMB: memoryIncrease,
            leakPrevented: memoryIncrease < 50
        };
    }

    /**
     * Simulate heavy operations that could cause memory leaks
     */
    async simulateHeavyOperations() {
        // Create and destroy shadow DOM containers
        if (window.enhancedShadowDOMManager) {
            const elements = [];
            for (let i = 0; i < 10; i++) {
                const element = document.createElement('div');
                document.body.appendChild(element);
                elements.push(element);
                window.enhancedShadowDOMManager.createContainer(element, 'closed');
            }
            
            // Clean up
            elements.forEach(element => {
                document.body.removeChild(element);
            });
            window.enhancedShadowDOMManager.performPeriodicCleanup();
        }

        // Create many DOM queries
        if (window.domQueryOptimizer) {
            for (let i = 0; i < 200; i++) {
                window.domQueryOptimizer.querySelector(`div.heavy-test-${i}`);
            }
        }

        // Create many event handlers
        if (window.deduplicatedEventManager) {
            const testElement = document.createElement('div');
            document.body.appendChild(testElement);
            
            const cleanups = [];
            for (let i = 0; i < 50; i++) {
                const cleanup = window.deduplicatedEventManager.addHandler(
                    testElement, 'click', () => {}, { delay: 100 }
                );
                cleanups.push(cleanup);
            }
            
            // Cleanup
            cleanups.forEach(cleanup => cleanup());
            document.body.removeChild(testElement);
        }

        // Fill and clear image cache
        if (window.iibMemoryBoundedCache) {
            for (let i = 0; i < 100; i++) {
                const data = new Array(1024 * 50).fill('y').join(''); // 50KB each
                window.iibMemoryBoundedCache.set(`heavy-test-${i}`, data);
            }
            window.iibMemoryBoundedCache.clear();
        }
    }

    /**
     * Get current memory usage
     */
    getMemoryUsage() {
        if (!performance.memory) {
            return { used: 0, total: 0, limit: 0 };
        }
        
        return {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate test report
     */
    generateReport() {
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const finalMemory = this.getMemoryUsage();
        const memoryChange = finalMemory.used - this.initialMemory.used;

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.length,
                passed,
                failed,
                successRate: Math.round((passed / this.testResults.length) * 100)
            },
            memoryAnalysis: {
                initialMemoryMB: this.initialMemory.used,
                finalMemoryMB: finalMemory.used,
                changeMB: memoryChange,
                status: memoryChange < 25 ? 'EXCELLENT' : memoryChange < 50 ? 'GOOD' : 'NEEDS_ATTENTION'
            },
            testResults: this.testResults,
            recommendations: this.generateRecommendations()
        };

        console.log('\n📊 Memory Fixes Test Report:');
        console.log(`✅ Tests Passed: ${passed}/${this.testResults.length}`);
        console.log(`💾 Memory Change: ${memoryChange}MB (${report.memoryAnalysis.status})`);
        
        if (failed > 0) {
            console.log(`❌ Failed Tests:`, this.testResults.filter(r => r.status === 'FAIL'));
        }

        return report;
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];
        const failedTests = this.testResults.filter(r => r.status === 'FAIL');

        if (failedTests.length > 0) {
            recommendations.push('Some memory fixes are not working properly - review failed tests');
        }

        const finalMemory = this.getMemoryUsage();
        const memoryChange = finalMemory.used - this.initialMemory.used;

        if (memoryChange > 50) {
            recommendations.push('Memory usage increased significantly - investigate potential leaks');
        } else if (memoryChange > 25) {
            recommendations.push('Memory usage increased moderately - monitor for trends');
        }

        if (recommendations.length === 0) {
            recommendations.push('All memory fixes are working correctly!');
        }

        return recommendations;
    }
}

// Create global test instance
window.memoryFixesTest = new MemoryFixesTest();

// Expose test runner
window.runMemoryFixesTest = () => window.memoryFixesTest.runAllTests();
