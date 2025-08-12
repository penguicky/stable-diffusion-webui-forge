/**
 * Inline CPU Optimization Test
 * A simplified version that can be run directly in the console
 */

window.runInlineCPUTest = async function() {
    console.log('🧪 Running Inline CPU Optimization Test...');
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: []
    };

    // Test 1: DOM Complexity Monitoring
    console.log('\n🔍 Testing DOM Complexity Monitoring...');
    try {
        const startTime = performance.now();
        
        // Test optimized node counting
        let nodeCount = 0;
        if (window.performanceMonitor && window.performanceMonitor.optimizedNodeCount) {
            nodeCount = window.performanceMonitor.optimizedNodeCount();
        } else {
            // Fallback to basic counting
            nodeCount = document.querySelectorAll('*').length;
        }
        
        const endTime = performance.now();
        const measurementTime = endTime - startTime;
        
        const domTest = {
            name: 'DOM Complexity Monitoring',
            status: measurementTime < 50 ? 'PASS' : 'FAIL',
            measurementTime: Math.round(measurementTime * 100) / 100,
            nodeCount,
            optimized: !!window.performanceMonitor?.optimizedNodeCount
        };
        
        results.tests.push(domTest);
        console.log(`${domTest.status === 'PASS' ? '✅' : '❌'} DOM Test: ${measurementTime}ms for ${nodeCount} nodes`);
        
    } catch (error) {
        results.tests.push({
            name: 'DOM Complexity Monitoring',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ DOM Test Error:', error.message);
    }

    // Test 2: Event Handler Performance
    console.log('\n🔍 Testing Event Handler Performance...');
    try {
        const testElement = document.createElement('div');
        testElement.id = 'inline-test-element';
        document.body.appendChild(testElement);
        
        const startTime = performance.now();
        
        // Test event handler creation
        const handlers = [];
        for (let i = 0; i < 10; i++) {
            const handler = () => console.log(`Test handler ${i}`);
            
            if (window.optimizedEventHandlers) {
                const cleanup = window.optimizedEventHandlers.addThrottledHandler(
                    testElement, 'click', handler, 16
                );
                handlers.push(cleanup);
            } else {
                testElement.addEventListener('click', handler);
                handlers.push(() => testElement.removeEventListener('click', handler));
            }
        }
        
        const creationTime = performance.now() - startTime;
        
        // Test event firing
        const eventStartTime = performance.now();
        for (let i = 0; i < 50; i++) {
            testElement.dispatchEvent(new Event('click'));
        }
        const eventTime = performance.now() - eventStartTime;
        
        // Cleanup
        handlers.forEach(cleanup => cleanup());
        document.body.removeChild(testElement);
        
        const eventTest = {
            name: 'Event Handler Performance',
            status: creationTime < 10 && eventTime < 50 ? 'PASS' : 'FAIL',
            creationTime: Math.round(creationTime * 100) / 100,
            eventTime: Math.round(eventTime * 100) / 100,
            optimized: !!window.optimizedEventHandlers
        };
        
        results.tests.push(eventTest);
        console.log(`${eventTest.status === 'PASS' ? '✅' : '❌'} Event Test: ${creationTime}ms creation, ${eventTime}ms events`);
        
    } catch (error) {
        results.tests.push({
            name: 'Event Handler Performance',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Event Test Error:', error.message);
    }

    // Test 3: Memory Usage
    console.log('\n🔍 Testing Memory Usage...');
    try {
        const initialMemory = performance.memory ? 
            Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
        
        // Simulate some operations
        const tempElements = [];
        for (let i = 0; i < 100; i++) {
            const element = document.createElement('div');
            element.textContent = `Temp element ${i}`;
            document.body.appendChild(element);
            tempElements.push(element);
        }
        
        // Clean up
        tempElements.forEach(element => document.body.removeChild(element));
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = performance.memory ? 
            Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
        
        const memoryIncrease = finalMemory - initialMemory;
        
        const memoryTest = {
            name: 'Memory Usage',
            status: memoryIncrease < 10 ? 'PASS' : 'FAIL',
            initialMemory,
            finalMemory,
            increase: memoryIncrease,
            hasMemoryAPI: !!performance.memory
        };
        
        results.tests.push(memoryTest);
        console.log(`${memoryTest.status === 'PASS' ? '✅' : '❌'} Memory Test: ${memoryIncrease}MB increase`);
        
    } catch (error) {
        results.tests.push({
            name: 'Memory Usage',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Memory Test Error:', error.message);
    }

    // Test 4: Frame Rate Stability
    console.log('\n🔍 Testing Frame Rate Stability...');
    try {
        const frameRateTest = await new Promise((resolve) => {
            let frameCount = 0;
            let startTime = performance.now();
            const frameRates = [];
            
            const measureFrames = () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - startTime >= 1000) { // Every second
                    const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
                    frameRates.push(fps);
                    frameCount = 0;
                    startTime = currentTime;
                }
                
                if (frameRates.length < 3) { // Measure for 3 seconds
                    requestAnimationFrame(measureFrames);
                } else {
                    const avgFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
                    resolve({
                        name: 'Frame Rate Stability',
                        status: avgFPS > 50 ? 'PASS' : 'FAIL',
                        averageFPS: Math.round(avgFPS),
                        frameRates,
                        stable: avgFPS > 50
                    });
                }
            };
            
            measureFrames();
        });
        
        results.tests.push(frameRateTest);
        console.log(`${frameRateTest.status === 'PASS' ? '✅' : '❌'} Frame Rate Test: ${frameRateTest.averageFPS} fps average`);
        
    } catch (error) {
        results.tests.push({
            name: 'Frame Rate Stability',
            status: 'ERROR',
            error: error.message
        });
        console.error('❌ Frame Rate Test Error:', error.message);
    }

    // Generate summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    const errors = results.tests.filter(t => t.status === 'ERROR').length;
    
    results.summary = {
        total: results.tests.length,
        passed,
        failed,
        errors,
        successRate: Math.round((passed / results.tests.length) * 100)
    };

    // Display results
    console.log('\n📊 Inline CPU Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Errors: ${errors}`);
    console.log(`📈 Success Rate: ${results.summary.successRate}%`);
    
    // Check for optimizations
    const optimizations = {
        performanceMonitor: !!window.performanceMonitor,
        optimizedEventHandlers: !!window.optimizedEventHandlers,
        domQueryOptimizer: !!window.domQueryOptimizer,
        adaptiveThrottling: !!window.adaptiveThrottlingSystem,
        backgroundProcessor: !!window.backgroundProcessor
    };
    
    console.log('\n🔧 Available Optimizations:');
    Object.entries(optimizations).forEach(([name, available]) => {
        console.log(`${available ? '✅' : '❌'} ${name}`);
    });
    
    results.optimizations = optimizations;
    
    return results;
};

// Also create a simple system check
window.checkCPUOptimizations = function() {
    console.log('🔍 Checking CPU Optimization Systems...');
    
    const systems = {
        'Performance Monitor': window.performanceMonitor,
        'Optimized Event Handlers': window.optimizedEventHandlers,
        'DOM Query Optimizer': window.domQueryOptimizer,
        'Adaptive Throttling': window.adaptiveThrottlingSystem,
        'Background Processor': window.backgroundProcessor,
        'Memory Manager': window.memoryManager
    };
    
    console.log('\n📋 System Status:');
    Object.entries(systems).forEach(([name, system]) => {
        const status = system ? '✅ Available' : '❌ Not Available';
        console.log(`${status} - ${name}`);
        
        if (system && typeof system.getStats === 'function') {
            try {
                const stats = system.getStats();
                console.log(`   📊 Stats:`, stats);
            } catch (e) {
                console.log(`   ⚠️ Stats unavailable`);
            }
        }
    });
    
    return systems;
};

console.log('🧪 Inline CPU Test loaded! Run:');
console.log('• window.runInlineCPUTest() - Run CPU performance tests');
console.log('• window.checkCPUOptimizations() - Check system status');
