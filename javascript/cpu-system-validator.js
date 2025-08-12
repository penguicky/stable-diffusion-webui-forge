/**
 * CPU System Validator
 * Permanent validation and testing for all CPU optimization systems
 */

class CPUSystemValidator {
    constructor() {
        this.systems = [
            'performanceMonitor',
            'optimizedEventHandlers', 
            'domQueryOptimizer',
            'memoryManager',
            'adaptiveThrottlingSystem',
            'backgroundProcessor'
        ];
        
        this.utilityFunctions = [
            'getAdaptiveDelay',
            'getThrottlingStats',
            'processInBackground',
            'getBackgroundStats'
        ];
    }

    /**
     * Validate all CPU optimization systems
     */
    validateAllSystems() {
        console.log('🔍 Validating CPU Optimization Systems...');
        
        const results = {
            timestamp: new Date().toISOString(),
            systems: {},
            utilities: {},
            performance: {},
            summary: {}
        };

        // Check core systems
        this.systems.forEach(system => {
            results.systems[system] = {
                available: !!window[system],
                functional: this.testSystemFunctionality(system)
            };
        });

        // Check utility functions
        this.utilityFunctions.forEach(func => {
            results.utilities[func] = {
                available: !!window[func],
                functional: this.testUtilityFunction(func)
            };
        });

        // Performance tests
        results.performance = this.runPerformanceTests();

        // Generate summary
        const systemsWorking = Object.values(results.systems).filter(s => s.available && s.functional).length;
        const utilitiesWorking = Object.values(results.utilities).filter(u => u.available && u.functional).length;
        
        results.summary = {
            systemsWorking: `${systemsWorking}/${this.systems.length}`,
            utilitiesWorking: `${utilitiesWorking}/${this.utilityFunctions.length}`,
            overallStatus: (systemsWorking >= 4 && utilitiesWorking >= 2) ? 'OPERATIONAL' : 'NEEDS_ATTENTION',
            recommendations: this.generateRecommendations(results)
        };

        this.displayResults(results);
        return results;
    }

    /**
     * Test individual system functionality
     */
    testSystemFunctionality(systemName) {
        try {
            const system = window[systemName];
            if (!system) return false;

            switch (systemName) {
                case 'performanceMonitor':
                    return typeof system.recordDOMComplexity === 'function' &&
                           typeof system.getStats === 'function';
                
                case 'optimizedEventHandlers':
                    return typeof system.addThrottledHandler === 'function' &&
                           typeof system.addDebouncedHandler === 'function';
                
                case 'domQueryOptimizer':
                    return typeof system.querySelector === 'function' &&
                           typeof system.getStats === 'function';
                
                case 'memoryManager':
                    return typeof system.cleanup === 'function';
                
                case 'adaptiveThrottlingSystem':
                    return typeof system.getAdaptiveDelay === 'function' &&
                           typeof system.getStats === 'function';
                
                case 'backgroundProcessor':
                    return typeof system.addTask === 'function' &&
                           typeof system.getStats === 'function';
                
                default:
                    return true;
            }
        } catch (error) {
            console.warn(`[CPUValidator] Error testing ${systemName}:`, error);
            return false;
        }
    }

    /**
     * Test utility function functionality
     */
    testUtilityFunction(funcName) {
        try {
            const func = window[funcName];
            if (!func || typeof func !== 'function') return false;

            switch (funcName) {
                case 'getAdaptiveDelay':
                    const delay = func('scroll');
                    return typeof delay === 'number' && delay > 0;
                
                case 'getThrottlingStats':
                    const stats = func();
                    return stats && typeof stats.currentMultiplier === 'number';
                
                case 'processInBackground':
                    // Just check if it's callable, don't actually run a task
                    return true;
                
                case 'getBackgroundStats':
                    const bgStats = func();
                    return bgStats && typeof bgStats.tasksProcessed === 'number';
                
                default:
                    return true;
            }
        } catch (error) {
            console.warn(`[CPUValidator] Error testing ${funcName}:`, error);
            return false;
        }
    }

    /**
     * Run performance tests
     */
    runPerformanceTests() {
        const results = {};

        // Test DOM complexity monitoring speed
        if (window.performanceMonitor) {
            const startTime = performance.now();
            try {
                if (window.performanceMonitor.optimizedNodeCount) {
                    window.performanceMonitor.optimizedNodeCount();
                } else {
                    window.performanceMonitor.recordDOMComplexity();
                }
                results.domMonitoring = {
                    time: Math.round((performance.now() - startTime) * 100) / 100,
                    status: (performance.now() - startTime) < 50 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
                };
            } catch (error) {
                results.domMonitoring = { status: 'ERROR', error: error.message };
            }
        }

        // Test adaptive throttling response
        if (window.getAdaptiveDelay && window.getThrottlingStats) {
            try {
                const scrollDelay = window.getAdaptiveDelay('scroll');
                const stats = window.getThrottlingStats();
                results.adaptiveThrottling = {
                    scrollDelay,
                    performanceLevel: stats.performanceLevel,
                    status: scrollDelay > 0 && stats.performanceLevel ? 'WORKING' : 'ERROR'
                };
            } catch (error) {
                results.adaptiveThrottling = { status: 'ERROR', error: error.message };
            }
        }

        // Test memory usage
        if (performance.memory) {
            results.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
                status: performance.memory.usedJSHeapSize < (performance.memory.jsHeapSizeLimit * 0.8) ? 'GOOD' : 'HIGH'
            };
        }

        return results;
    }

    /**
     * Generate recommendations based on results
     */
    generateRecommendations(results) {
        const recommendations = [];

        // Check for missing systems
        const missingSystems = Object.entries(results.systems)
            .filter(([name, info]) => !info.available || !info.functional)
            .map(([name]) => name);

        if (missingSystems.length > 0) {
            recommendations.push(`Missing/broken systems: ${missingSystems.join(', ')}`);
        }

        // Check for missing utilities
        const missingUtilities = Object.entries(results.utilities)
            .filter(([name, info]) => !info.available || !info.functional)
            .map(([name]) => name);

        if (missingUtilities.length > 0) {
            recommendations.push(`Missing/broken utilities: ${missingUtilities.join(', ')}`);
        }

        // Performance recommendations
        if (results.performance.domMonitoring?.status === 'NEEDS_IMPROVEMENT') {
            recommendations.push('DOM monitoring is slow - check optimization implementation');
        }

        if (results.performance.memoryUsage?.status === 'HIGH') {
            recommendations.push('Memory usage is high - consider cleanup');
        }

        if (recommendations.length === 0) {
            recommendations.push('All systems are working optimally!');
        }

        return recommendations;
    }

    /**
     * Display validation results
     */
    displayResults(results) {
        console.log('\n📊 CPU System Validation Results:');
        console.log(`🎯 Overall Status: ${results.summary.overallStatus}`);
        console.log(`🔧 Systems: ${results.summary.systemsWorking}`);
        console.log(`⚡ Utilities: ${results.summary.utilitiesWorking}`);

        console.log('\n🔍 System Details:');
        Object.entries(results.systems).forEach(([name, info]) => {
            const status = info.available && info.functional ? '✅' : '❌';
            console.log(`  ${status} ${name}: ${info.available ? 'Available' : 'Missing'}${info.functional ? ', Functional' : ', Non-functional'}`);
        });

        console.log('\n⚡ Utility Functions:');
        Object.entries(results.utilities).forEach(([name, info]) => {
            const status = info.available && info.functional ? '✅' : '❌';
            console.log(`  ${status} ${name}: ${info.available ? 'Available' : 'Missing'}${info.functional ? ', Functional' : ', Non-functional'}`);
        });

        if (results.performance.domMonitoring) {
            console.log(`\n📈 DOM Monitoring: ${results.performance.domMonitoring.time}ms (${results.performance.domMonitoring.status})`);
        }

        if (results.performance.adaptiveThrottling) {
            console.log(`⚡ Adaptive Throttling: ${results.performance.adaptiveThrottling.performanceLevel} level, ${results.performance.adaptiveThrottling.scrollDelay}ms scroll delay`);
        }

        if (results.performance.memoryUsage) {
            console.log(`💾 Memory Usage: ${results.performance.memoryUsage.used}MB / ${results.performance.memoryUsage.limit}MB (${results.performance.memoryUsage.status})`);
        }

        console.log('\n💡 Recommendations:');
        results.summary.recommendations.forEach(rec => {
            console.log(`  • ${rec}`);
        });
    }

    /**
     * Quick system check
     */
    quickCheck() {
        const systems = this.systems.map(name => ({
            name,
            available: !!window[name]
        }));

        const utilities = this.utilityFunctions.map(name => ({
            name, 
            available: !!window[name]
        }));

        const systemsCount = systems.filter(s => s.available).length;
        const utilitiesCount = utilities.filter(u => u.available).length;

        console.log('🔍 Quick CPU Systems Check:');
        console.log(`Systems: ${systemsCount}/${systems.length}`);
        console.log(`Utilities: ${utilitiesCount}/${utilities.length}`);
        
        return {
            systems: systemsCount,
            utilities: utilitiesCount,
            total: systemsCount + utilitiesCount,
            maxTotal: systems.length + utilities.length
        };
    }
}

// Create global instance
window.cpuSystemValidator = new CPUSystemValidator();

// Expose validation functions
window.validateCPUSystems = () => window.cpuSystemValidator.validateAllSystems();
window.quickCPUCheck = () => window.cpuSystemValidator.quickCheck();

console.log('[CPUSystemValidator] Validator loaded - use window.validateCPUSystems() or window.quickCPUCheck()');
