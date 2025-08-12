/**
 * CPU Optimization Test Suite
 * Tests the effectiveness of CPU performance optimizations
 */

class CPUOptimizationTest {
    constructor() {
        this.testResults = [];
        this.initialCPUMetrics = this.getCPUMetrics();
    }

    /**
     * Run all CPU optimization tests
     */
    async runAllTests() {
        console.log('🧪 Starting CPU Optimization Tests...');
        
        const tests = [
            { name: 'DOM Complexity Monitoring', test: () => this.testDOMComplexityOptimization() },
            { name: 'Adaptive Throttling', test: () => this.testAdaptiveThrottling() },
            { name: 'Background Processing', test: () => this.testBackgroundProcessing() },
            { name: 'Event Handler Performance', test: () => this.testEventHandlerPerformance() },
            { name: 'Frame Rate Stability', test: () => this.testFrameRateStability() }
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
     * Test DOM complexity monitoring optimization
     */
    async testDOMComplexityOptimization() {
        if (!window.performanceMonitor) {
            throw new Error('Performance Monitor not available');
        }

        const monitor = window.performanceMonitor;
        
        // Measure time for DOM complexity calculation
        const startTime = performance.now();
        monitor.recordDOMComplexity();
        const endTime = performance.now();
        
        const measurementTime = endTime - startTime;
        
        // Should be much faster than the old querySelectorAll('*') approach
        if (measurementTime > 50) { // Should be under 50ms
            throw new Error(`DOM complexity measurement too slow: ${measurementTime}ms`);
        }

        // Test caching effectiveness
        const secondStartTime = performance.now();
        monitor.recordDOMComplexity();
        const secondEndTime = performance.now();
        
        const secondMeasurementTime = secondEndTime - secondStartTime;
        
        // Second measurement should be faster due to caching
        if (secondMeasurementTime >= measurementTime) {
            console.warn('DOM complexity caching may not be working optimally');
        }

        return {
            firstMeasurementTime: Math.round(measurementTime * 100) / 100,
            secondMeasurementTime: Math.round(secondMeasurementTime * 100) / 100,
            cachingEffective: secondMeasurementTime < measurementTime,
            optimizationWorking: measurementTime < 50
        };
    }

    /**
     * Test adaptive throttling system
     */
    async testAdaptiveThrottling() {
        if (!window.adaptiveThrottlingSystem) {
            throw new Error('Adaptive Throttling System not available');
        }

        const throttling = window.adaptiveThrottlingSystem;
        
        // Test different performance levels
        const performanceLevels = ['excellent', 'good', 'medium', 'poor', 'critical'];
        const results = {};

        for (const level of performanceLevels) {
            throttling.setPerformanceLevel(level);
            
            results[level] = {
                scrollDelay: throttling.getAdaptiveDelay('scroll'),
                resizeDelay: throttling.getAdaptiveDelay('resize'),
                inputDelay: throttling.getAdaptiveDelay('input')
            };
        }

        // Verify that delays increase with worse performance
        const excellentScroll = results.excellent.scrollDelay;
        const criticalScroll = results.critical.scrollDelay;
        
        if (criticalScroll <= excellentScroll) {
            throw new Error('Adaptive throttling not working - delays should increase with poor performance');
        }

        return {
            performanceLevels: results,
            adaptiveWorking: criticalScroll > excellentScroll,
            stats: throttling.getStats()
        };
    }

    /**
     * Test background processing system
     */
    async testBackgroundProcessing() {
        if (!window.backgroundProcessor) {
            throw new Error('Background Processor not available');
        }

        const processor = window.backgroundProcessor;
        const initialStats = processor.getStats();

        // Test simple background task
        const simpleTaskResult = await new Promise((resolve, reject) => {
            processor.addTask(
                (data) => {
                    // Simple computation
                    let sum = 0;
                    for (let i = 0; i < data.iterations; i++) {
                        sum += i;
                    }
                    return sum;
                },
                {
                    data: { iterations: 10000 },
                    onComplete: resolve,
                    onError: reject,
                    timeout: 5000
                }
            );
        });

        // Test heavy computation task
        const heavyTaskResult = await new Promise((resolve, reject) => {
            processor.addTask(
                (data) => {
                    // Heavy computation that would block main thread
                    const array = new Array(data.size).fill(0).map((_, i) => i);
                    return array.filter(n => n % 2 === 0).reduce((sum, n) => sum + n, 0);
                },
                {
                    data: { size: 100000 },
                    onComplete: resolve,
                    onError: reject,
                    useWebWorker: true,
                    timeout: 10000
                }
            );
        });

        const finalStats = processor.getStats();

        return {
            simpleTaskResult,
            heavyTaskResult,
            tasksProcessed: finalStats.tasksProcessed - initialStats.tasksProcessed,
            averageProcessingTime: finalStats.averageProcessingTime,
            backgroundWorking: finalStats.tasksProcessed > initialStats.tasksProcessed
        };
    }

    /**
     * Test event handler performance
     */
    async testEventHandlerPerformance() {
        if (!window.optimizedEventHandlers) {
            throw new Error('Optimized Event Handlers not available');
        }

        const handlers = window.optimizedEventHandlers;
        const initialStats = handlers.getStats();

        // Create test element
        const testElement = document.createElement('div');
        testElement.id = 'cpu-test-element';
        document.body.appendChild(testElement);

        // Test throttled handler performance
        const startTime = performance.now();
        
        const cleanups = [];
        for (let i = 0; i < 10; i++) {
            const cleanup = handlers.addThrottledHandler(
                testElement,
                'scroll',
                () => console.log(`Handler ${i}`),
                16
            );
            cleanups.push(cleanup);
        }

        const handlerCreationTime = performance.now() - startTime;

        // Test event firing performance
        const eventStartTime = performance.now();
        
        // Simulate rapid events
        for (let i = 0; i < 100; i++) {
            const event = new Event('scroll');
            testElement.dispatchEvent(event);
        }
        
        const eventProcessingTime = performance.now() - eventStartTime;

        // Cleanup
        cleanups.forEach(cleanup => cleanup());
        document.body.removeChild(testElement);

        const finalStats = handlers.getStats();

        return {
            handlerCreationTime: Math.round(handlerCreationTime * 100) / 100,
            eventProcessingTime: Math.round(eventProcessingTime * 100) / 100,
            handlersDeduped: finalStats.handlersDeduped - initialStats.handlersDeduped,
            performanceGood: handlerCreationTime < 10 && eventProcessingTime < 50
        };
    }

    /**
     * Test frame rate stability during heavy operations
     */
    async testFrameRateStability() {
        return new Promise((resolve) => {
            const frameRates = [];
            let frameCount = 0;
            let startTime = performance.now();
            
            const measureFrameRate = () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - startTime >= 1000) { // Every second
                    const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
                    frameRates.push(fps);
                    frameCount = 0;
                    startTime = currentTime;
                }
                
                if (frameRates.length < 5) { // Measure for 5 seconds
                    requestAnimationFrame(measureFrameRate);
                } else {
                    const avgFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
                    const minFPS = Math.min(...frameRates);
                    const maxFPS = Math.max(...frameRates);
                    const stability = 1 - ((maxFPS - minFPS) / avgFPS); // Stability score
                    
                    resolve({
                        averageFPS: Math.round(avgFPS),
                        minFPS,
                        maxFPS,
                        stability: Math.round(stability * 100) / 100,
                        frameRates,
                        stableFrameRate: avgFPS > 50 && stability > 0.8
                    });
                }
            };
            
            // Start heavy operations while measuring frame rate
            this.simulateHeavyOperations();
            measureFrameRate();
        });
    }

    /**
     * Simulate heavy operations to test CPU optimization
     */
    simulateHeavyOperations() {
        // Simulate DOM operations
        const elements = [];
        for (let i = 0; i < 50; i++) {
            const element = document.createElement('div');
            element.textContent = `Heavy operation ${i}`;
            element.style.transform = `translateX(${i * 10}px)`;
            document.body.appendChild(element);
            elements.push(element);
        }

        // Simulate event handlers
        if (window.optimizedEventHandlers) {
            elements.forEach((element, i) => {
                window.optimizedEventHandlers.addThrottledHandler(
                    element,
                    'click',
                    () => console.log(`Click ${i}`),
                    16
                );
            });
        }

        // Clean up after test
        setTimeout(() => {
            elements.forEach(element => {
                if (element.parentNode) {
                    document.body.removeChild(element);
                }
            });
        }, 6000);
    }

    /**
     * Get current CPU metrics
     */
    getCPUMetrics() {
        const metrics = {
            timestamp: Date.now()
        };

        if (performance.memory) {
            metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }

        if (window.adaptiveThrottlingSystem) {
            const stats = window.adaptiveThrottlingSystem.getStats();
            metrics.avgFrameRate = stats.avgFrameRate;
            metrics.performanceLevel = stats.performanceLevel;
        }

        return metrics;
    }

    /**
     * Generate test report
     */
    generateReport() {
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const finalCPUMetrics = this.getCPUMetrics();

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.length,
                passed,
                failed,
                successRate: Math.round((passed / this.testResults.length) * 100)
            },
            cpuMetrics: {
                initial: this.initialCPUMetrics,
                final: finalCPUMetrics
            },
            testResults: this.testResults,
            recommendations: this.generateRecommendations()
        };

        console.log('\n📊 CPU Optimization Test Report:');
        console.log(`✅ Tests Passed: ${passed}/${this.testResults.length}`);
        console.log(`⚡ CPU Performance: ${finalCPUMetrics.performanceLevel || 'Unknown'}`);
        
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
            recommendations.push('Some CPU optimizations are not working properly - review failed tests');
        }

        // Check specific test results for recommendations
        const domTest = this.testResults.find(r => r.name === 'DOM Complexity Monitoring');
        if (domTest && domTest.result && !domTest.result.cachingEffective) {
            recommendations.push('DOM complexity caching needs improvement');
        }

        const frameTest = this.testResults.find(r => r.name === 'Frame Rate Stability');
        if (frameTest && frameTest.result && !frameTest.result.stableFrameRate) {
            recommendations.push('Frame rate stability needs improvement - consider more aggressive throttling');
        }

        if (recommendations.length === 0) {
            recommendations.push('All CPU optimizations are working correctly!');
        }

        return recommendations;
    }
}

// Create global test instance
window.cpuOptimizationTest = new CPUOptimizationTest();

// Expose test runner
window.runCPUOptimizationTest = () => window.cpuOptimizationTest.runAllTests();
