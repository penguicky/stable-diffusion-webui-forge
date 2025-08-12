/**
 * Manual CPU Test Loader
 * Loads the CPU optimization test if it's not already available
 */

(function() {
    'use strict';

    // Check if CPU test is already loaded
    if (window.runCPUOptimizationTest) {
        console.log('[LoadCPUTest] CPU optimization test already available');
        return;
    }

    // Function to load script
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                console.log(`[LoadCPUTest] Successfully loaded ${src}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`[LoadCPUTest] Failed to load ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }

    // Load required scripts in order
    async function loadCPUTestSuite() {
        try {
            console.log('[LoadCPUTest] Loading CPU optimization test suite...');
            
            // Load adaptive throttling first
            if (!window.adaptiveThrottlingSystem) {
                await loadScript('/src/javascript/adaptive-throttling.js');
            }
            
            // Load background processor
            if (!window.backgroundProcessor) {
                await loadScript('/src/javascript/background-processor.js');
            }
            
            // Load CPU optimization test
            if (!window.runCPUOptimizationTest) {
                await loadScript('/src/javascript/cpu-optimization-test.js');
            }
            
            // Load memory fixes test
            if (!window.runMemoryFixesTest) {
                await loadScript('/src/javascript/memory-fixes-test.js');
            }
            
            console.log('[LoadCPUTest] All CPU test components loaded successfully');
            
            // Verify everything is working
            setTimeout(() => {
                if (window.runCPUOptimizationTest) {
                    console.log('✅ CPU optimization test is now available!');
                    console.log('Run: window.runCPUOptimizationTest()');
                } else {
                    console.error('❌ CPU optimization test failed to load');
                }
            }, 1000);
            
        } catch (error) {
            console.error('[LoadCPUTest] Failed to load CPU test suite:', error);
        }
    }

    // Start loading
    loadCPUTestSuite();

})();
