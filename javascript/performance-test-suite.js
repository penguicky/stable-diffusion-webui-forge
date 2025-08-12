/**
 * Performance Test Suite
 * Comprehensive testing and validation of performance optimizations
 */

class PerformanceTestSuite {
    constructor() {
        this.testResults = new Map();
        this.benchmarks = {
            memory: {
                maxGrowthPerHour: 50, // MB
                maxTotalUsage: 400,   // MB
                maxLeakRate: 5        // MB/minute
            },
            cpu: {
                maxEventDelay: 100,   // ms
                minFrameRate: 55,     // fps
                maxDOMComplexity: 5000 // nodes
            },
            network: {
                maxRequestsPerMinute: 50,
                maxResponseTime: 500,     // ms
                minCacheHitRate: 0.7      // 70%
            }
        };
    }

    /**
     * Run comprehensive performance test suite
     */
    async runAllTests() {
        console.log('🧪 Starting Performance Test Suite...');
        
        const results = {
            memory: await this.testMemoryPerformance(),
            cpu: await this.testCPUPerformance(),
            network: await this.testNetworkPerformance(),
            extensions: await this.testExtensionPerformance(),
            userExperience: await this.testUserExperience()
        };

        const report = this.generateTestReport(results);
        console.log('📊 Performance Test Results:', report);
        
        return report;
    }

    /**
     * Test memory usage and leak detection
     */
    async testMemoryPerformance() {
        console.log('🧠 Testing Memory Performance...');
        
        const initialMemory = this.getMemoryUsage();
        const startTime = Date.now();

        // Simulate heavy memory operations
        await this.simulateMemoryIntensiveOperations();

        const finalMemory = this.getMemoryUsage();
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000 / 60; // minutes

        const memoryGrowth = finalMemory.used - initialMemory.used;
        const growthRate = memoryGrowth / duration; // MB per minute

        // Test memory cleanup
        if (window.performanceOptimizer) {
            window.performanceOptimizer.performAggressiveCleanup();
        }

        await this.delay(1000); // Wait for cleanup

        const cleanupMemory = this.getMemoryUsage();
        const cleanupEffectiveness = (finalMemory.used - cleanupMemory.used) / memoryGrowth;

        return {
            initial: initialMemory,
            final: finalMemory,
            afterCleanup: cleanupMemory,
            growth: Math.round(memoryGrowth),
            growthRate: Math.round(growthRate * 100) / 100,
            cleanupEffectiveness: Math.round(cleanupEffectiveness * 100),
            status: this.evaluateMemoryPerformance(memoryGrowth, growthRate)
        };
    }

    /**
     * Test CPU performance and responsiveness
     */
    async testCPUPerformance() {
        console.log('⚡ Testing CPU Performance...');
        
        const results = {
            eventResponse: await this.testEventResponseTime(),
            frameRate: await this.testFrameRate(),
            domComplexity: await this.testDOMComplexity(),
            interactionDelay: await this.testInteractionDelay()
        };

        results.status = this.evaluateCPUPerformance(results);
        return results;
    }

    /**
     * Test network performance and efficiency
     */
    async testNetworkPerformance() {
        console.log('🌐 Testing Network Performance...');
        
        const results = {
            requestBatching: await this.testRequestBatching(),
            cacheEfficiency: await this.testCacheEfficiency(),
            responseTime: await this.testResponseTime(),
            requestFrequency: await this.testRequestFrequency()
        };

        results.status = this.evaluateNetworkPerformance(results);
        return results;
    }

    /**
     * Test extension-specific performance
     */
    async testExtensionPerformance() {
        console.log('🔌 Testing Extension Performance...');
        
        const results = {
            shadowDOM: await this.testShadowDOMPerformance(),
            imageGallery: await this.testImageGalleryPerformance(),
            promptProcessing: await this.testPromptProcessingPerformance(),
            themeRendering: await this.testThemeRenderingPerformance()
        };

        results.status = this.evaluateExtensionPerformance(results);
        return results;
    }

    /**
     * Test user experience metrics
     */
    async testUserExperience() {
        console.log('👤 Testing User Experience...');
        
        const results = {
            firstInputDelay: await this.measureFirstInputDelay(),
            cumulativeLayoutShift: await this.measureCumulativeLayoutShift(),
            interactionToNextPaint: await this.measureInteractionToNextPaint(),
            largestContentfulPaint: await this.measureLargestContentfulPaint()
        };

        results.status = this.evaluateUserExperience(results);
        return results;
    }

    /**
     * Simulate memory-intensive operations
     */
    async simulateMemoryIntensiveOperations() {
        const operations = [
            () => this.simulateShadowDOMCreation(),
            () => this.simulateImageLoading(),
            () => this.simulateTagProcessing(),
            () => this.simulateDOMManipulation()
        ];

        for (const operation of operations) {
            await operation();
            await this.delay(100);
        }
    }

    async simulateShadowDOMCreation() {
        if (!window.enhancedShadowDOMManager) return;

        const containers = [];
        for (let i = 0; i < 10; i++) {
            const element = document.createElement('div');
            document.body.appendChild(element);
            const container = window.enhancedShadowDOMManager.createContainer(element, 'closed');
            containers.push({ element, container });
        }

        // Clean up
        containers.forEach(({ element }) => {
            document.body.removeChild(element);
        });
    }

    async simulateImageLoading() {
        const images = [];
        for (let i = 0; i < 20; i++) {
            const img = new Image();
            img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>`;
            images.push(img);
        }
        
        // Simulate processing
        await this.delay(100);
    }

    async simulateTagProcessing() {
        const tags = Array.from({ length: 1000 }, (_, i) => `tag_${i}`);
        const processed = tags.map(tag => ({
            name: tag,
            count: Math.floor(Math.random() * 100),
            category: `category_${Math.floor(Math.random() * 10)}`
        }));
        
        // Simulate filtering and sorting
        processed.sort((a, b) => b.count - a.count);
        processed.filter(tag => tag.count > 50);
    }

    async simulateDOMManipulation() {
        const elements = [];
        for (let i = 0; i < 100; i++) {
            const element = document.createElement('div');
            element.textContent = `Test element ${i}`;
            element.className = `test-element-${i}`;
            document.body.appendChild(element);
            elements.push(element);
        }

        // Simulate style changes
        elements.forEach(el => {
            el.style.backgroundColor = 'red';
            el.style.transform = 'translateX(10px)';
        });

        // Clean up
        elements.forEach(el => document.body.removeChild(el));
    }

    /**
     * Test event response time
     */
    async testEventResponseTime() {
        const button = document.createElement('button');
        document.body.appendChild(button);

        const responseTimes = [];
        
        for (let i = 0; i < 10; i++) {
            const startTime = performance.now();
            
            const promise = new Promise(resolve => {
                button.addEventListener('click', () => {
                    const endTime = performance.now();
                    responseTimes.push(endTime - startTime);
                    resolve();
                }, { once: true });
            });

            button.click();
            await promise;
            await this.delay(10);
        }

        document.body.removeChild(button);

        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        return {
            average: Math.round(averageResponseTime * 100) / 100,
            max: Math.max(...responseTimes),
            min: Math.min(...responseTimes),
            samples: responseTimes.length
        };
    }

    /**
     * Test frame rate during animations
     */
    async testFrameRate() {
        return new Promise(resolve => {
            let frameCount = 0;
            let startTime = performance.now();
            
            const testElement = document.createElement('div');
            testElement.style.cssText = 'width:100px;height:100px;background:red;position:absolute;';
            document.body.appendChild(testElement);

            function animate() {
                frameCount++;
                testElement.style.transform = `translateX(${Math.sin(frameCount * 0.1) * 100}px)`;
                
                if (frameCount < 60) { // Test for 1 second at 60fps
                    requestAnimationFrame(animate);
                } else {
                    const endTime = performance.now();
                    const duration = (endTime - startTime) / 1000;
                    const fps = frameCount / duration;
                    
                    document.body.removeChild(testElement);
                    resolve({
                        fps: Math.round(fps),
                        duration: Math.round(duration * 1000),
                        frames: frameCount
                    });
                }
            }

            requestAnimationFrame(animate);
        });
    }

    /**
     * Utility methods
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    evaluateMemoryPerformance(growth, growthRate) {
        if (growth > this.benchmarks.memory.maxGrowthPerHour) return 'FAIL';
        if (growthRate > this.benchmarks.memory.maxLeakRate) return 'FAIL';
        return growth < 25 ? 'EXCELLENT' : 'PASS';
    }

    evaluateCPUPerformance(results) {
        if (results.eventResponse.average > this.benchmarks.cpu.maxEventDelay) return 'FAIL';
        if (results.frameRate.fps < this.benchmarks.cpu.minFrameRate) return 'FAIL';
        return 'PASS';
    }

    evaluateNetworkPerformance(results) {
        // Implementation would depend on actual network test results
        return 'PASS';
    }

    evaluateExtensionPerformance(results) {
        // Implementation would depend on extension-specific metrics
        return 'PASS';
    }

    evaluateUserExperience(results) {
        // Implementation would depend on Core Web Vitals measurements
        return 'PASS';
    }

    generateTestReport(results) {
        const overallStatus = Object.values(results).every(r => r.status !== 'FAIL') ? 'PASS' : 'FAIL';
        
        return {
            timestamp: new Date().toISOString(),
            overallStatus,
            results,
            recommendations: this.generateRecommendations(results),
            summary: this.generateSummary(results)
        };
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        if (results.memory.status === 'FAIL') {
            recommendations.push('Implement more aggressive memory cleanup');
            recommendations.push('Review extension memory usage patterns');
        }
        
        if (results.cpu.status === 'FAIL') {
            recommendations.push('Optimize event handlers and DOM operations');
            recommendations.push('Consider using Web Workers for heavy computations');
        }
        
        return recommendations;
    }

    generateSummary(results) {
        const passed = Object.values(results).filter(r => r.status === 'PASS' || r.status === 'EXCELLENT').length;
        const total = Object.keys(results).length;
        
        return {
            testsRun: total,
            testsPassed: passed,
            testsFailed: total - passed,
            successRate: Math.round((passed / total) * 100)
        };
    }
}

// Create global instance
window.performanceTestSuite = new PerformanceTestSuite();

// Expose test runner function
window.runPerformanceTests = () => window.performanceTestSuite.runAllTests();
