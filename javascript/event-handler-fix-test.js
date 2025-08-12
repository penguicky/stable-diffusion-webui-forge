/**
 * Event Handler Fix Test
 * Tests the fix for the window object getAttribute error
 */

(function() {
    'use strict';

    function testEventHandlerFix() {
        console.log('🧪 Testing Event Handler Fix...');

        if (!window.optimizedEventHandlers) {
            console.error('❌ OptimizedEventHandlers not available');
            return false;
        }

        const manager = window.optimizedEventHandlers;

        try {
            // Test 1: Window object handler (this was causing the error)
            console.log('🔍 Testing window object handler...');
            const windowCleanup = manager.addThrottledHandler(
                window, 
                'resize', 
                () => console.log('Window resize'), 
                100
            );

            if (!windowCleanup || typeof windowCleanup !== 'function') {
                throw new Error('Window handler creation failed');
            }

            // Test 2: Document object handler
            console.log('🔍 Testing document object handler...');
            const documentCleanup = manager.addDebouncedHandler(
                document, 
                'click', 
                () => console.log('Document click'), 
                200
            );

            if (!documentCleanup || typeof documentCleanup !== 'function') {
                throw new Error('Document handler creation failed');
            }

            // Test 3: Regular DOM element handler
            console.log('🔍 Testing DOM element handler...');
            const testElement = document.createElement('div');
            testElement.id = 'test-element';
            document.body.appendChild(testElement);

            const elementCleanup = manager.addThrottledHandler(
                testElement, 
                'click', 
                () => console.log('Element click'), 
                50
            );

            if (!elementCleanup || typeof elementCleanup !== 'function') {
                throw new Error('Element handler creation failed');
            }

            // Test 4: Deduplication test
            console.log('🔍 Testing handler deduplication...');
            const initialStats = manager.getStats();
            
            // Add duplicate handler (should be deduplicated)
            const duplicateCleanup = manager.addThrottledHandler(
                window, 
                'resize', 
                () => console.log('Duplicate window resize'), 
                100
            );

            const afterDuplicateStats = manager.getStats();
            
            if (afterDuplicateStats.handlersDeduped <= initialStats.handlersDeduped) {
                throw new Error('Handler deduplication not working');
            }

            // Cleanup all handlers
            windowCleanup();
            documentCleanup();
            elementCleanup();
            duplicateCleanup();
            document.body.removeChild(testElement);

            console.log('✅ All event handler tests passed!');
            console.log('📊 Final stats:', manager.getStats());
            
            return true;

        } catch (error) {
            console.error('❌ Event handler test failed:', error.message);
            return false;
        }
    }

    // Test key generation functions directly
    function testKeyGeneration() {
        console.log('🧪 Testing key generation functions...');

        if (!window.optimizedEventHandlers) {
            console.error('❌ OptimizedEventHandlers not available');
            return false;
        }

        const manager = window.optimizedEventHandlers;

        try {
            // Test window key generation
            const windowKey = manager.generateKey(window, 'resize', 100);
            const windowRegistryKey = manager.generateRegistryKey(window, 'resize');
            
            console.log('🔍 Window keys:', { windowKey, windowRegistryKey });
            
            if (!windowKey.includes('window') || !windowRegistryKey.includes('window')) {
                throw new Error('Window key generation failed');
            }

            // Test document key generation
            const documentKey = manager.generateKey(document, 'click', 200);
            const documentRegistryKey = manager.generateRegistryKey(document, 'click');
            
            console.log('🔍 Document keys:', { documentKey, documentRegistryKey });
            
            if (!documentKey.includes('document') || !documentRegistryKey.includes('document')) {
                throw new Error('Document key generation failed');
            }

            // Test DOM element key generation
            const testElement = document.createElement('div');
            testElement.id = 'test-key-element';
            
            const elementKey = manager.generateKey(testElement, 'click', 50);
            const elementRegistryKey = manager.generateRegistryKey(testElement, 'click');
            
            console.log('🔍 Element keys:', { elementKey, elementRegistryKey });
            
            if (!elementKey || !elementRegistryKey) {
                throw new Error('Element key generation failed');
            }

            console.log('✅ Key generation tests passed!');
            return true;

        } catch (error) {
            console.error('❌ Key generation test failed:', error.message);
            return false;
        }
    }

    // Run tests when DOM is ready
    function runTests() {
        console.log('🚀 Starting Event Handler Fix Tests...');
        
        const keyGenTest = testKeyGeneration();
        const handlerTest = testEventHandlerFix();
        
        const allPassed = keyGenTest && handlerTest;
        
        console.log('\n📊 Test Results:');
        console.log(`Key Generation: ${keyGenTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Event Handlers: ${handlerTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        return allPassed;
    }

    // Expose test function globally
    window.testEventHandlerFix = runTests;

    // Auto-run tests if this script is loaded after the optimized event handlers
    if (window.optimizedEventHandlers) {
        setTimeout(runTests, 1000);
    } else {
        // Wait for optimized event handlers to load
        const checkInterval = setInterval(() => {
            if (window.optimizedEventHandlers) {
                clearInterval(checkInterval);
                setTimeout(runTests, 1000);
            }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('⚠️ OptimizedEventHandlers not loaded within 10 seconds');
        }, 10000);
    }

})();
