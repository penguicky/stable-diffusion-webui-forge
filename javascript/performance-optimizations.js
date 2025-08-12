/**
 * Critical Performance Optimizations
 * Implements the highest-priority fixes identified in the performance analysis
 */

(function() {
    'use strict';

    // 1. MEMORY LEAK PREVENTION - Enhanced Shadow DOM Cleanup
    class EnhancedShadowDOMManager {
        constructor() {
            this.containers = new Map();
            this.cleanupCallbacks = new Map();
        }

        createContainer(element, mode) {
            const containerId = this.generateContainerId(element);
            
            // Clean up existing container if it exists
            if (this.containers.has(containerId)) {
                this.destroyContainer(containerId);
            }

            const container = {
                element,
                shadowRoot: element.attachShadow({ mode }),
                eventListeners: new Set(),
                observers: new Set(),
                timers: new Set(),
                created: Date.now()
            };

            this.containers.set(containerId, container);
            return container;
        }

        destroyContainer(containerId) {
            const container = this.containers.get(containerId);
            if (!container) return;

            // Clean up event listeners
            container.eventListeners.forEach(cleanup => {
                try { cleanup(); } catch (e) { console.warn('Cleanup error:', e); }
            });

            // Disconnect observers
            container.observers.forEach(observer => {
                try { observer.disconnect(); } catch (e) { console.warn('Observer cleanup error:', e); }
            });

            // Clear timers
            container.timers.forEach(timerId => {
                try { clearTimeout(timerId); clearInterval(timerId); } catch (e) {}
            });

            // Clear shadow root content
            if (container.shadowRoot) {
                container.shadowRoot.innerHTML = '';
            }

            this.containers.delete(containerId);
        }

        generateContainerId(element) {
            return element.id || `shadow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Periodic cleanup of old containers
        performPeriodicCleanup() {
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 minutes

            this.containers.forEach((container, id) => {
                if (now - container.created > maxAge && !document.contains(container.element)) {
                    this.destroyContainer(id);
                }
            });
        }
    }

    // 2. DOM QUERY OPTIMIZATION - LRU Cache with Size Limits
    class OptimizedDOMQueryCache {
        constructor(maxSize = 100, defaultTTL = 5000) {
            this.cache = new Map();
            this.maxSize = maxSize;
            this.defaultTTL = defaultTTL;
            this.accessOrder = new Map(); // Track access order for LRU
        }

        get(key, maxAge = this.defaultTTL) {
            const entry = this.cache.get(key);
            if (!entry) return null;

            // Check if expired
            if (Date.now() - entry.timestamp > maxAge) {
                this.cache.delete(key);
                this.accessOrder.delete(key);
                return null;
            }

            // Update access order
            this.accessOrder.delete(key);
            this.accessOrder.set(key, Date.now());

            return entry.elements;
        }

        set(key, elements) {
            // Enforce size limit using LRU eviction
            if (this.cache.size >= this.maxSize) {
                const oldestKey = this.accessOrder.keys().next().value;
                this.cache.delete(oldestKey);
                this.accessOrder.delete(oldestKey);
            }

            this.cache.set(key, {
                elements,
                timestamp: Date.now()
            });
            this.accessOrder.set(key, Date.now());
        }

        clear() {
            this.cache.clear();
            this.accessOrder.clear();
        }

        getStats() {
            return {
                size: this.cache.size,
                maxSize: this.maxSize,
                hitRate: this.hitRate || 0
            };
        }
    }

    // 3. EVENT HANDLER DEDUPLICATION
    class DeduplicatedEventManager {
        constructor() {
            this.activeHandlers = new Map();
            this.handlerStats = {
                created: 0,
                deduplicated: 0,
                cleaned: 0
            };
        }

        addHandler(element, event, handler, options = {}) {
            const key = this.generateHandlerKey(element, event);
            
            // Check if handler already exists
            if (this.activeHandlers.has(key)) {
                this.handlerStats.deduplicated++;
                return this.activeHandlers.get(key).cleanup;
            }

            // Create optimized handler based on event type
            const optimizedHandler = this.createOptimizedHandler(event, handler, options);
            
            // Add event listener
            element.addEventListener(event, optimizedHandler, {
                passive: ['scroll', 'wheel', 'touchstart', 'touchmove'].includes(event),
                ...options
            });

            // Create cleanup function
            const cleanup = () => {
                element.removeEventListener(event, optimizedHandler, options);
                this.activeHandlers.delete(key);
                this.handlerStats.cleaned++;
            };

            this.activeHandlers.set(key, { cleanup, created: Date.now() });
            this.handlerStats.created++;

            return cleanup;
        }

        createOptimizedHandler(event, handler, options) {
            const delay = options.delay || this.getDefaultDelay(event);
            const type = options.type || this.getDefaultType(event);

            if (type === 'throttled') {
                return this.throttle(handler, delay);
            } else if (type === 'debounced') {
                return this.debounce(handler, delay);
            }

            return handler;
        }

        getDefaultDelay(event) {
            const delays = {
                'scroll': 16,    // 60fps
                'resize': 100,   // 10fps
                'input': 300,    // 300ms debounce
                'mousemove': 16, // 60fps
                'click': 100     // 100ms debounce
            };
            return delays[event] || 100;
        }

        getDefaultType(event) {
            const throttledEvents = ['scroll', 'resize', 'mousemove'];
            return throttledEvents.includes(event) ? 'throttled' : 'debounced';
        }

        throttle(func, delay) {
            let lastCall = 0;
            return function(...args) {
                const now = Date.now();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    return func.apply(this, args);
                }
            };
        }

        debounce(func, delay) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        }

        generateHandlerKey(element, event) {
            const elementId = element.id || element.tagName + '_' + Array.from(element.parentNode?.children || []).indexOf(element);
            return `${elementId}-${event}`;
        }

        cleanup() {
            this.activeHandlers.forEach(({ cleanup }) => cleanup());
            this.activeHandlers.clear();
        }

        getStats() {
            return {
                ...this.handlerStats,
                active: this.activeHandlers.size
            };
        }
    }

    // 4. NETWORK REQUEST BATCHING
    class NetworkRequestBatcher {
        constructor(batchDelay = 50, maxBatchSize = 10) {
            this.batchDelay = batchDelay;
            this.maxBatchSize = maxBatchSize;
            this.pendingRequests = new Map();
            this.batchTimeouts = new Map();
        }

        request(endpoint, data = null, options = {}) {
            return new Promise((resolve, reject) => {
                const batchKey = this.getBatchKey(endpoint, options.method || 'GET');
                
                if (!this.pendingRequests.has(batchKey)) {
                    this.pendingRequests.set(batchKey, []);
                }

                const batch = this.pendingRequests.get(batchKey);
                batch.push({ data, resolve, reject, timestamp: Date.now() });

                // Process batch if it reaches max size
                if (batch.length >= this.maxBatchSize) {
                    this.processBatch(batchKey);
                } else {
                    // Schedule batch processing
                    this.scheduleBatchProcessing(batchKey);
                }
            });
        }

        scheduleBatchProcessing(batchKey) {
            if (this.batchTimeouts.has(batchKey)) {
                return; // Already scheduled
            }

            const timeoutId = setTimeout(() => {
                this.processBatch(batchKey);
            }, this.batchDelay);

            this.batchTimeouts.set(batchKey, timeoutId);
        }

        async processBatch(batchKey) {
            const batch = this.pendingRequests.get(batchKey);
            if (!batch || batch.length === 0) return;

            // Clear timeout
            const timeoutId = this.batchTimeouts.get(batchKey);
            if (timeoutId) {
                clearTimeout(timeoutId);
                this.batchTimeouts.delete(batchKey);
            }

            // Remove batch from pending
            this.pendingRequests.delete(batchKey);

            try {
                const [endpoint, method] = batchKey.split('|');
                const batchData = batch.map(req => req.data);
                
                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ batch: batchData })
                });

                const results = await response.json();

                // Resolve individual requests
                batch.forEach((req, index) => {
                    req.resolve(results[index] || results);
                });

            } catch (error) {
                // Reject all requests in batch
                batch.forEach(req => req.reject(error));
            }
        }

        getBatchKey(endpoint, method) {
            return `${endpoint}|${method}`;
        }
    }

    // 5. PERFORMANCE MONITORING INTEGRATION
    class PerformanceOptimizer {
        constructor() {
            this.shadowDOMManager = new EnhancedShadowDOMManager();
            this.queryCache = new OptimizedDOMQueryCache();
            this.eventManager = new DeduplicatedEventManager();
            this.networkBatcher = new NetworkRequestBatcher();
            
            this.setupPeriodicCleanup();
            this.setupPerformanceMonitoring();
        }

        setupPeriodicCleanup() {
            // Clean up every 5 minutes
            setInterval(() => {
                this.shadowDOMManager.performPeriodicCleanup();
                this.queryCache.clear();
                
                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }
            }, 5 * 60 * 1000);
        }

        setupPerformanceMonitoring() {
            if (window.performanceMonitor) {
                window.performanceMonitor.onAlert((alert) => {
                    this.handlePerformanceAlert(alert);
                });
            }
        }

        handlePerformanceAlert(alert) {
            switch (alert.type) {
                case 'Memory':
                    if (alert.value > 400) {
                        this.performAggressiveCleanup();
                    }
                    break;
                case 'FPS':
                    if (alert.value < 30) {
                        this.reduceAnimations();
                    }
                    break;
                case 'INP':
                    if (alert.value > 300) {
                        this.optimizeEventHandlers();
                    }
                    break;
            }
        }

        performAggressiveCleanup() {
            this.shadowDOMManager.performPeriodicCleanup();
            this.queryCache.clear();
            
            // Clear unused event handlers
            this.eventManager.cleanup();
            
            // Trigger memory manager cleanup if available
            if (window.memoryManager) {
                window.memoryManager.forceCleanup();
            }
        }

        reduceAnimations() {
            // Disable non-essential animations
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }

        optimizeEventHandlers() {
            // Increase debounce delays for better performance
            const elements = document.querySelectorAll('input, textarea');
            elements.forEach(element => {
                // Re-register with longer delays
                this.eventManager.addHandler(element, 'input', () => {}, { delay: 500 });
            });
        }

        getStats() {
            return {
                shadowDOM: {
                    containers: this.shadowDOMManager.containers.size
                },
                queryCache: this.queryCache.getStats(),
                eventHandlers: this.eventManager.getStats(),
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                } : null
            };
        }
    }

    // Initialize global performance optimizer
    window.performanceOptimizer = new PerformanceOptimizer();

    // Expose individual components for external use
    window.enhancedShadowDOMManager = window.performanceOptimizer.shadowDOMManager;
    window.optimizedDOMQueryCache = window.performanceOptimizer.queryCache;
    window.deduplicatedEventManager = window.performanceOptimizer.eventManager;
    window.networkRequestBatcher = window.performanceOptimizer.networkBatcher;

    // Auto-cleanup on page unload
    window.addEventListener('beforeunload', () => {
        window.performanceOptimizer.performAggressiveCleanup();
    });

})();
