/**
 * Connection Pooling System
 * Optimizes network connections through connection reuse and request queuing
 */

class ConnectionPool {
    constructor(options = {}) {
        this.maxConnections = options.maxConnections || 6; // Max concurrent connections
        this.maxConnectionsPerHost = options.maxConnectionsPerHost || 4; // Max per host
        this.connectionTimeout = options.connectionTimeout || 30000; // 30 second timeout
        this.keepAliveTimeout = options.keepAliveTimeout || 60000; // 1 minute keep-alive
        
        // Connection tracking
        this.activeConnections = new Map(); // host -> connection count
        this.connectionQueue = new Map(); // host -> request queue
        this.connectionTimers = new Map(); // connection -> timeout timer
        
        // Request queuing
        this.globalQueue = [];
        this.isProcessingQueue = false;
        
        // Statistics
        this.stats = {
            totalRequests: 0,
            queuedRequests: 0,
            activeConnections: 0,
            connectionReuse: 0,
            timeoutErrors: 0,
            averageWaitTime: 0
        };
        
        // Setup connection monitoring
        this.setupConnectionMonitoring();
        
        console.log('[ConnectionPool] System initialized');
    }

    /**
     * Make request through connection pool
     */
    async request(url, options = {}) {
        this.stats.totalRequests++;
        
        const host = this.getHost(url);
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const request = {
                url,
                options,
                host,
                resolve,
                reject,
                startTime,
                timeout: options.timeout || this.connectionTimeout
            };
            
            this.queueRequest(request);
        });
    }

    /**
     * Queue request for processing
     */
    queueRequest(request) {
        const host = request.host;
        
        // Check if we can process immediately
        if (this.canProcessRequest(host)) {
            this.processRequest(request);
        } else {
            // Add to queue
            if (!this.connectionQueue.has(host)) {
                this.connectionQueue.set(host, []);
            }
            
            this.connectionQueue.get(host).push(request);
            this.stats.queuedRequests++;
            
            // Start queue processing if not already running
            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        }
    }

    /**
     * Check if request can be processed immediately
     */
    canProcessRequest(host) {
        const hostConnections = this.activeConnections.get(host) || 0;
        const totalConnections = this.getTotalActiveConnections();
        
        return hostConnections < this.maxConnectionsPerHost && 
               totalConnections < this.maxConnections;
    }

    /**
     * Process request immediately
     */
    async processRequest(request) {
        const host = request.host;
        
        // Increment connection count
        this.incrementConnections(host);
        
        try {
            // Set request timeout
            const timeoutId = setTimeout(() => {
                this.stats.timeoutErrors++;
                request.reject(new Error('Request timeout'));
            }, request.timeout);
            
            // Make the actual request
            const response = await fetch(request.url, {
                ...request.options,
                signal: this.createAbortSignal(request.timeout)
            });
            
            clearTimeout(timeoutId);
            
            // Update statistics
            const waitTime = Date.now() - request.startTime;
            this.updateAverageWaitTime(waitTime);
            
            // Parse response
            const data = await this.parseResponse(response);
            request.resolve(data);
            
        } catch (error) {
            request.reject(error);
        } finally {
            // Decrement connection count after delay (keep-alive simulation)
            setTimeout(() => {
                this.decrementConnections(host);
                this.processQueue(); // Process next queued request
            }, 100); // Small delay to simulate connection reuse
        }
    }

    /**
     * Process queued requests
     */
    async processQueue() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;
        
        try {
            while (this.hasQueuedRequests()) {
                let processed = false;
                
                // Try to process requests from each host
                for (const [host, queue] of this.connectionQueue) {
                    if (queue.length > 0 && this.canProcessRequest(host)) {
                        const request = queue.shift();
                        this.stats.queuedRequests--;
                        
                        // Process request without awaiting (parallel processing)
                        this.processRequest(request);
                        processed = true;
                    }
                }
                
                // If no requests could be processed, wait a bit
                if (!processed) {
                    await this.delay(10);
                }
            }
        } finally {
            this.isProcessingQueue = false;
        }
    }

    /**
     * Check if there are queued requests
     */
    hasQueuedRequests() {
        for (const queue of this.connectionQueue.values()) {
            if (queue.length > 0) return true;
        }
        return false;
    }

    /**
     * Increment connection count for host
     */
    incrementConnections(host) {
        const current = this.activeConnections.get(host) || 0;
        this.activeConnections.set(host, current + 1);
        this.stats.activeConnections++;
    }

    /**
     * Decrement connection count for host
     */
    decrementConnections(host) {
        const current = this.activeConnections.get(host) || 0;
        if (current > 0) {
            this.activeConnections.set(host, current - 1);
            this.stats.activeConnections--;
            this.stats.connectionReuse++;
        }
    }

    /**
     * Get total active connections across all hosts
     */
    getTotalActiveConnections() {
        let total = 0;
        for (const count of this.activeConnections.values()) {
            total += count;
        }
        return total;
    }

    /**
     * Get host from URL
     */
    getHost(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.host;
        } catch (e) {
            return window.location.host;
        }
    }

    /**
     * Create abort signal with timeout
     */
    createAbortSignal(timeout) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller.signal;
    }

    /**
     * Parse response based on content type
     */
    async parseResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    }

    /**
     * Update average wait time
     */
    updateAverageWaitTime(waitTime) {
        const currentAvg = this.stats.averageWaitTime;
        const totalRequests = this.stats.totalRequests;
        this.stats.averageWaitTime = (currentAvg * (totalRequests - 1) + waitTime) / totalRequests;
    }

    /**
     * Setup connection monitoring
     */
    setupConnectionMonitoring() {
        // Monitor connection health every 30 seconds
        setInterval(() => {
            this.monitorConnections();
        }, 30000);
        
        // Cleanup stale connections every minute
        setInterval(() => {
            this.cleanupStaleConnections();
        }, 60000);
    }

    /**
     * Monitor connection health
     */
    monitorConnections() {
        const totalActive = this.getTotalActiveConnections();
        const totalQueued = this.getTotalQueuedRequests();
        
        if (totalQueued > 10) {
            console.warn(`[ConnectionPool] High queue depth: ${totalQueued} requests queued`);
        }
        
        if (totalActive >= this.maxConnections * 0.8) {
            console.warn(`[ConnectionPool] High connection usage: ${totalActive}/${this.maxConnections}`);
        }
    }

    /**
     * Get total queued requests
     */
    getTotalQueuedRequests() {
        let total = 0;
        for (const queue of this.connectionQueue.values()) {
            total += queue.length;
        }
        return total;
    }

    /**
     * Cleanup stale connections
     */
    cleanupStaleConnections() {
        // Reset connection counts for hosts with no activity
        for (const [host, count] of this.activeConnections) {
            if (count === 0) {
                this.activeConnections.delete(host);
            }
        }
        
        // Clear empty queues
        for (const [host, queue] of this.connectionQueue) {
            if (queue.length === 0) {
                this.connectionQueue.delete(host);
            }
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get connection pool statistics
     */
    getStats() {
        return {
            ...this.stats,
            maxConnections: this.maxConnections,
            maxConnectionsPerHost: this.maxConnectionsPerHost,
            currentActiveConnections: this.getTotalActiveConnections(),
            currentQueuedRequests: this.getTotalQueuedRequests(),
            hostsWithConnections: this.activeConnections.size,
            averageWaitTime: Math.round(this.stats.averageWaitTime),
            connectionEfficiency: this.stats.totalRequests > 0 ? 
                Math.round((this.stats.connectionReuse / this.stats.totalRequests) * 100) : 0
        };
    }

    /**
     * Force process all queued requests
     */
    forceProcessQueue() {
        this.processQueue();
    }

    /**
     * Clear all queues and reset connections
     */
    reset() {
        // Clear all queues
        for (const queue of this.connectionQueue.values()) {
            queue.forEach(request => {
                request.reject(new Error('Connection pool reset'));
            });
        }
        
        this.connectionQueue.clear();
        this.activeConnections.clear();
        this.globalQueue.length = 0;
        this.isProcessingQueue = false;
        
        // Reset stats
        this.stats.queuedRequests = 0;
        this.stats.activeConnections = 0;
    }
}

// Create global instance with error handling
try {
    window.connectionPool = new ConnectionPool({
        maxConnections: 6,           // Max 6 concurrent connections
        maxConnectionsPerHost: 4,    // Max 4 per host
        connectionTimeout: 30000,    // 30 second timeout
        keepAliveTimeout: 60000      // 1 minute keep-alive
    });

    // Expose utility functions
    window.pooledFetch = (url, options) => window.connectionPool.request(url, options);
    window.getConnectionStats = () => window.connectionPool.getStats();
    window.resetConnectionPool = () => window.connectionPool.reset();

    console.log('[ConnectionPool] Connection pooling system loaded successfully');

} catch (error) {
    console.error('[ConnectionPool] Failed to initialize:', error);
    console.error('[ConnectionPool] Error stack:', error.stack);
}
