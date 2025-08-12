// Inline Performance Optimizations
if (typeof window.performanceOptimizations === 'undefined') {
    window.performanceOptimizations = {
        // Basic debouncing
        debounceTimers: new Map(),

        // Real-time interaction exemptions
        realTimeExemptions: new Set([
            'forge-couple-canvas',
            'shadow-forge-couple-canvas',
            'canvas[data-forge-couple]',
            '.forge-couple-canvas',
            'canvas.forge-couple'
        ]),

        // Register additional real-time elements
        registerRealTimeElement: function(selector) {
            this.realTimeExemptions.add(selector);
            // Registered real-time element: ${selector}
        },

        // Register element instance as real-time
        markElementAsRealTime: function(element) {
            if (element) {
                element.setAttribute('data-real-time', 'true');
                element.classList.add('real-time');
                console.log('[Performance] Marked element as real-time:', element);
            }
        },

        // Check if element should be exempt from optimization
        isRealTimeElement: function(element) {
            if (!element) return false;

            // Check for explicit real-time marking
            if (element.hasAttribute('data-real-time') ||
                (element.classList && element.classList.contains('real-time'))) {
                return true;
            }

            // Check by ID
            if (element.id && this.realTimeExemptions.has(element.id)) {
                return true;
            }

            // Check by class
            if (element.className) {
                const classes = element.className.split(' ');
                if (classes.some(cls => this.realTimeExemptions.has(`.${cls}`))) {
                    return true;
                }
            }

            // Check by tag and attributes
            if (element.tagName === 'CANVAS') {
                // Check for Forge Couple specific attributes or parent containers
                if (element.hasAttribute('data-forge-couple') ||
                    element.closest('.forge-couple-container') ||
                    element.closest('[id*="forge-couple"]') ||
                    element.closest('[class*="forge-couple"]')) {
                    return true;
                }
            }

            return false;
        },

        debounce: function(func, delay, key = 'default') {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            const timerId = setTimeout(() => {
                this.debounceTimers.delete(key);
                func();
            }, delay);
            this.debounceTimers.set(key, timerId);
        },

        // Basic throttling
        throttleTimers: new Map(),
        throttle: function(func, delay, key = 'default', element = null) {
            // Skip throttling for real-time elements
            if (element && this.isRealTimeElement(element)) {
                func();
                return;
            }

            if (this.throttleTimers.has(key)) {
                return; // Already throttled
            }
            func();
            const timerId = setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
            this.throttleTimers.set(key, timerId);
        },

        // DOM query caching
        domCache: new Map(),
        querySelector: function(selector, maxAge = 5000) {
            const cached = this.domCache.get(selector);
            if (cached && (Date.now() - cached.timestamp) < maxAge) {
                return cached.elements;
            }
            const elements = document.querySelectorAll(selector);
            this.domCache.set(selector, {
                elements: Array.from(elements),
                timestamp: Date.now()
            });
            return elements;
        },

        // Smart event listener that respects real-time exemptions
        addSmartEventListener: function(element, eventType, handler, options = {}) {
            // For real-time elements, add listener directly without optimization
            if (this.isRealTimeElement(element)) {
                element.addEventListener(eventType, handler, options);
                // Real-time exemption applied for ${eventType} on element
                return;
            }

            // Apply optimizations for non-real-time elements
            if (['mousemove', 'scroll', 'resize'].includes(eventType)) {
                const throttledHandler = (event) => {
                    this.throttle(() => handler(event), 16, `${eventType}-${element.id || 'unknown'}`, element);
                };
                element.addEventListener(eventType, throttledHandler, { ...options, passive: true });
            } else if (['input', 'keyup'].includes(eventType)) {
                const debouncedHandler = (event) => {
                    this.debounce(() => handler(event), 300, `${eventType}-${element.id || 'unknown'}`);
                };
                element.addEventListener(eventType, debouncedHandler, options);
            } else {
                // Default behavior for other events
                element.addEventListener(eventType, handler, options);
            }
        },

        // Memory cleanup
        cleanup: function() {
            this.debounceTimers.forEach(timerId => clearTimeout(timerId));
            this.throttleTimers.forEach(timerId => clearTimeout(timerId));
            this.debounceTimers.clear();
            this.throttleTimers.clear();
            this.domCache.clear();
        },

        // Performance monitoring
        getStats: function() {
            return {
                debounceTimers: this.debounceTimers.size,
                throttleTimers: this.throttleTimers.size,
                cachedQueries: this.domCache.size,
                memoryUsage: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
                } : 'Not available'
            };
        },

        // Monitor performance
        startMonitoring: function() {
            setInterval(() => {
                const stats = this.getStats();
                if (stats.memoryUsage !== 'Not available') {
                    const usedMB = parseInt(stats.memoryUsage.used);
                    if (usedMB > 300) {
                        console.warn(`[Performance] High memory usage: ${stats.memoryUsage.used}`);
                    }
                }
            }, 30000); // Check every 30 seconds
        }
    };

    // Auto-cleanup on page unload
    window.addEventListener('beforeunload', () => {
        window.performanceOptimizations.cleanup();
    });

    // Periodic cache cleanup
    setInterval(() => {
        const now = Date.now();
        window.performanceOptimizations.domCache.forEach((entry, key) => {
            if (now - entry.timestamp > 10000) { // 10 seconds
                window.performanceOptimizations.domCache.delete(key);
            }
        });
    }, 30000);

    // Optimize common high-frequency events
    setTimeout(() => {
        // Throttle scroll events
        const scrollElements = document.querySelectorAll('.gradio-gallery, [style*="overflow"]');
        scrollElements.forEach(element => {
            element.addEventListener('scroll', () => {
                window.performanceOptimizations.throttle(() => {
                    // Scroll handling logic can be added here
                }, 16, `scroll-${element.id || 'unknown'}`);
            }, { passive: true });
        });

        // Throttle window resize
        window.addEventListener('resize', () => {
            window.performanceOptimizations.throttle(() => {
                // Resize handling logic can be added here
                window.dispatchEvent(new CustomEvent('optimized-resize'));
            }, 100, 'window-resize');
        });

        // Event optimizations applied
    }, 2000); // Wait for DOM to be ready

    // Start performance monitoring
    window.performanceOptimizations.startMonitoring();

    // Add global helper function
    window.getPerformanceStats = () => {
        if (window.performanceOptimizations) {
            const stats = window.performanceOptimizations.getStats();
            console.table(stats);
            return stats;
        } else {
            console.warn('Performance optimizations not available');
            return null;
        }
    };

    // Inline performance optimizations loaded and monitoring started
    // Use window.getPerformanceStats() to check performance statistics
}

function gradioApp() {
    const elems = document.getElementsByTagName('gradio-app');
    const elem = elems.length == 0 ? document : elems[0];

    if (elem !== document) {
        elem.getElementById = function(id) {
            return document.getElementById(id);
        };
    }
    return elem.shadowRoot ? elem.shadowRoot : elem;
}

/**
 * Get the currently selected top-level UI tab button (e.g. the button that says "Extras").
 */
function get_uiCurrentTab() {
    return gradioApp().querySelector('#tabs > .tab-nav > button.selected');
}

/**
 * Get the first currently visible top-level UI tab content (e.g. the div hosting the "txt2img" UI).
 */
function get_uiCurrentTabContent() {
    return gradioApp().querySelector('#tabs > .tabitem[id^=tab_]:not([style*="display: none"])');
}

var uiUpdateCallbacks = [];
var uiAfterUpdateCallbacks = [];
var uiLoadedCallbacks = [];
var uiTabChangeCallbacks = [];
var optionsChangedCallbacks = [];
var optionsAvailableCallbacks = [];
var uiAfterUpdateTimeout = null;
var uiCurrentTab = null;

/**
 * Register callback to be called at each UI update.
 * The callback receives an array of MutationRecords as an argument.
 */
function onUiUpdate(callback) {
    uiUpdateCallbacks.push(callback);
}

/**
 * Register callback to be called soon after UI updates.
 * The callback receives no arguments.
 *
 * This is preferred over `onUiUpdate` if you don't need
 * access to the MutationRecords, as your function will
 * not be called quite as often.
 */
function onAfterUiUpdate(callback) {
    uiAfterUpdateCallbacks.push(callback);
}

/**
 * Register callback to be called when the UI is loaded.
 * The callback receives no arguments.
 */
function onUiLoaded(callback) {
    uiLoadedCallbacks.push(callback);
}

/**
 * Register callback to be called when the UI tab is changed.
 * The callback receives no arguments.
 */
function onUiTabChange(callback) {
    uiTabChangeCallbacks.push(callback);
}

/**
 * Register callback to be called when the options are changed.
 * The callback receives no arguments.
 * @param callback
 */
function onOptionsChanged(callback) {
    optionsChangedCallbacks.push(callback);
}

/**
 * Register callback to be called when the options (in opts global variable) are available.
 * The callback receives no arguments.
 * If you register the callback after the options are available, it's just immediately called.
 */
function onOptionsAvailable(callback) {
    if (Object.keys(opts).length != 0) {
        callback();
        return;
    }

    optionsAvailableCallbacks.push(callback);
}

function executeCallbacks(queue, arg) {
    for (const callback of queue) {
        try {
            callback(arg);
        } catch (e) {
            console.error("error running callback", callback, ":", e);
        }
    }
}

/**
 * Schedule the execution of the callbacks registered with onAfterUiUpdate.
 * The callbacks are executed after a short while, unless another call to this function
 * is made before that time. IOW, the callbacks are executed only once, even
 * when there are multiple mutations observed.
 */
function scheduleAfterUiUpdateCallbacks() {
    clearTimeout(uiAfterUpdateTimeout);
    uiAfterUpdateTimeout = setTimeout(function() {
        executeCallbacks(uiAfterUpdateCallbacks);
    }, 200);
}

var executedOnLoaded = false;
var mainMutationObserver = null;

document.addEventListener("DOMContentLoaded", function() {
    // Create managed MutationObserver
    mainMutationObserver = new MutationObserver(function(m) {
        if (!executedOnLoaded && gradioApp().querySelector('#txt2img_prompt')) {
            executedOnLoaded = true;
            executeCallbacks(uiLoadedCallbacks);
        }

        executeCallbacks(uiUpdateCallbacks, m);
        scheduleAfterUiUpdateCallbacks();
        const newTab = get_uiCurrentTab();
        if (newTab && (newTab !== uiCurrentTab)) {
            uiCurrentTab = newTab;
            executeCallbacks(uiTabChangeCallbacks);
        }
    });

    // Track observer for cleanup
    if (window.memoryManager) {
        window.memoryManager.trackObserver(mainMutationObserver);
    }

    mainMutationObserver.observe(gradioApp(), {childList: true, subtree: true});

    // Cleanup on page unload
    const cleanup = () => {
        if (mainMutationObserver) {
            mainMutationObserver.disconnect();
            mainMutationObserver = null;
        }
    };

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
});

/**
 * Add keyboard shortcuts:
 * Ctrl+Enter to start/restart a generation
 * Alt/Option+Enter to skip a generation
 * Esc to interrupt a generation
 */
document.addEventListener('keydown', function(e) {
    const isEnter = e.key === 'Enter' || e.keyCode === 13;
    const isCtrlKey = e.metaKey || e.ctrlKey;
    const isAltKey = e.altKey;
    const isEsc = e.key === 'Escape';

    const generateButton = get_uiCurrentTabContent().querySelector('button[id$=_generate]');
    const interruptButton = get_uiCurrentTabContent().querySelector('button[id$=_interrupt]');
    const skipButton = get_uiCurrentTabContent().querySelector('button[id$=_skip]');

    if (isCtrlKey && isEnter) {
        if (interruptButton.style.display === 'block') {
            interruptButton.click();
            const callback = (mutationList) => {
                for (const mutation of mutationList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (interruptButton.style.display === 'none') {
                            generateButton.click();
                            observer.disconnect();
                        }
                    }
                }
            };
            const observer = new MutationObserver(callback);
            observer.observe(interruptButton, {attributes: true});
        } else {
            generateButton.click();
        }
        e.preventDefault();
    }

    if (isAltKey && isEnter) {
        skipButton.click();
        e.preventDefault();
    }

    if (isEsc) {
        const globalPopup = document.querySelector('.global-popup');
        const lightboxModal = document.querySelector('#lightboxModal');
        if (!globalPopup || globalPopup.style.display === 'none') {
            if (document.activeElement === lightboxModal) return;
            if (interruptButton.style.display === 'block') {
                interruptButton.click();
                e.preventDefault();
            }
        }
    }
});

/**
 * checks that a UI element is not in another hidden element or tab content
 */
function uiElementIsVisible(el) {
    if (el === document) {
        return true;
    }

    const computedStyle = getComputedStyle(el);
    const isVisible = computedStyle.display !== 'none';

    if (!isVisible) return false;
    return uiElementIsVisible(el.parentNode);
}

function uiElementInSight(el) {
    const clRect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isOnScreen = clRect.bottom > 0 && clRect.top < windowHeight;

    return isOnScreen;
}
