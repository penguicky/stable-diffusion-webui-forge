/**
 * Console Warnings Fix for Forge WebUI
 * Addresses common console warnings and errors
 */

(function() {
    'use strict';

    // Fix 1: Suppress Tauri metadata warning for browser environments
    function suppressTauriWarnings() {
        // Create a mock Tauri metadata object to prevent the warning
        if (typeof window !== 'undefined' && !window.__TAURI_METADATA__) {
            Object.defineProperty(window, '__TAURI_METADATA__', {
                value: {
                    __currentWindow: { label: 'main' },
                    __windows: [{ label: 'main' }]
                },
                writable: false,
                configurable: false
            });
        }
    }

    // Fix 2: Enhance console message filtering
    function enhanceConsoleFiltering() {
        // Override console.warn to filter out non-critical warnings
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.warn = function(...args) {
            const message = args.join(' ');

            // Filter out known non-critical warnings
            if (message.includes('Splitpanes: Could not resize panes correctly due to their constraints')) {
                console.debug('[Splitpanes - Non-critical]:', ...args);
                return;
            }

            // Pass through other warnings
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            // Filter out empty or undefined messages
            if (args.length === 0 || (args.length === 1 && (args[0] === undefined || args[0] === ''))) {
                return;
            }

            const message = args.join(' ');

            // Filter out known debug messages that clutter the console
            if (message.includes('restoreFeGlobalSetting') ||
                message.includes('save global setting') ||
                message.includes('tauriConf.value') ||
                message.includes('onTextareaChange') ||
                message.includes('tags change')) {
                return;
            }

            // Pass through other log messages
            originalLog.apply(console, args);
        };
    }

    // Fix 3: Enhance tab selection with safety checks
    function enhanceTabSelection() {
        // Override common tab selection methods to add safety checks
        const originalQuerySelector = Document.prototype.querySelector;
        const originalQuerySelectorAll = Document.prototype.querySelectorAll;

        // Add safety wrapper for tab operations
        window.safeTabSelect = function(tabSelector, options = {}) {
            try {
                const tab = document.querySelector(tabSelector);
                if (!tab) {
                    console.debug(`[SafeTabSelect] Tab not found: ${tabSelector}`);
                    return false;
                }

                // Check if tab is visible and interactive
                const isVisible = tab.offsetParent !== null;
                const isInteractive = !tab.hasAttribute('disabled') && 
                                    !tab.classList.contains('disabled') &&
                                    !tab.hasAttribute('aria-disabled');

                if (!isVisible) {
                    console.debug(`[SafeTabSelect] Tab is hidden: ${tabSelector}`);
                    return false;
                }

                if (!isInteractive) {
                    console.debug(`[SafeTabSelect] Tab is not interactive: ${tabSelector}`);
                    return false;
                }

                // Safely click the tab
                if (options.click !== false) {
                    tab.click();
                }

                return true;
            } catch (error) {
                console.debug(`[SafeTabSelect] Error selecting tab ${tabSelector}:`, error);
                return false;
            }
        };
    }

    // Fix 4: Enhance Gradio endpoint argument handling
    function enhanceGradioEndpoints() {
        // Create a wrapper for Gradio functions to handle variable arguments
        window.createRobustGradioFunction = function(originalFunction, functionName = 'unknown') {
            return function(...args) {
                try {
                    // Log argument count for debugging
                    console.debug(`[GradioFunction] ${functionName} called with ${args.length} arguments`);
                    
                    // Call original function
                    const result = originalFunction.apply(this, args);
                    
                    // Ensure consistent return format
                    if (args.length === 0) {
                        return [];
                    } else if (args.length === 1) {
                        return result !== undefined ? result : args[0];
                    } else {
                        return result !== undefined ? result : args;
                    }
                } catch (error) {
                    // TEMPORARILY DISABLED - Show all errors for debugging
                    console.log(`[DEBUG] GradioFunction error in ${functionName}:`, error);
                    console.warn(`[GradioFunction] Error in ${functionName}:`, error);
                    // Return safe fallback
                    return args.length <= 1 ? (args[0] || []) : args;
                }
            };
        };
    }

    // Fix 5: Add general error boundary for UI operations
    function addErrorBoundary() {
        // TEMPORARILY DISABLED - Unhandled promise rejection suppression
        window.addEventListener('unhandledrejection', function(event) {
            const error = event.reason;
            const message = error?.message || error?.toString() || 'Unknown error';

            console.log('[DEBUG] Unhandled promise rejection:', message, error);
            // Allow all errors to be logged normally for debugging
        });

        // TEMPORARILY DISABLED - General error suppression
        window.addEventListener('error', function(event) {
            const message = event.message || '';

            console.log('[DEBUG] General error caught:', message, event);
            // Allow all errors to be logged normally for debugging
        });
    }

    // Fix 6: Enhance DOM element safety checks
    function enhanceDOMSafety() {
        // Add utility function for safe DOM operations
        window.safeDOM = {
            querySelector: function(selector, context = document) {
                try {
                    return context.querySelector(selector);
                } catch (error) {
                    console.debug(`[SafeDOM] Invalid selector: ${selector}`, error);
                    return null;
                }
            },
            
            querySelectorAll: function(selector, context = document) {
                try {
                    return context.querySelectorAll(selector);
                } catch (error) {
                    console.debug(`[SafeDOM] Invalid selector: ${selector}`, error);
                    return [];
                }
            },
            
            getElementById: function(id, context = document) {
                try {
                    return context.getElementById(id);
                } catch (error) {
                    console.debug(`[SafeDOM] Error getting element by ID: ${id}`, error);
                    return null;
                }
            }
        };
    }

    // TEMPORARILY DISABLED - Yargs error interception
    function interceptYargsErrors() {
        console.log('[DEBUG] Yargs error interception DISABLED for debugging');
        // All yargs error interception is disabled
    }

    // Initialize all fixes
    function initializeWarningsFixes() {
        console.debug('[Console Warnings Fix] Initializing...');

        suppressTauriWarnings();
        enhanceConsoleFiltering();
        enhanceTabSelection();
        enhanceGradioEndpoints();
        addErrorBoundary();
        enhanceDOMSafety();
        interceptYargsErrors();

        console.debug('[Console Warnings Fix] Initialized successfully');
    }

    // Run fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWarningsFixes);
    } else {
        initializeWarningsFixes();
    }

    // Also run on UI loaded if available
    if (typeof onUiLoaded === 'function') {
        onUiLoaded(initializeWarningsFixes);
    }

})();
