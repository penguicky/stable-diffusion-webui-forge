/**
 * Response Caching System
 * Intelligent caching with TTL, LRU eviction, and cache invalidation strategies
 */

class ResponseCache {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 100; // Max 100 cached responses
        this.defaultTTL = options.defaultTTL || 300000; // 5 minutes default TTL
        this.maxMemoryMB = options.maxMemoryMB || 50; // 50MB memory limit
        
        // Cache storage
        this.cache = new Map();
        this.accessOrder = new Map(); // For LRU tracking
        this.memoryUsage = 0;
        
        // Cache policies by endpoint pattern
        this.cachePolicies = new Map();
        this.setupDefaultPolicies();
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalRequests: 0,
            memorySaved: 0,
            networkSaved: 0
        };
        
        // Setup periodic cleanup
        this.setupPeriodicCleanup();
        
        console.log('[ResponseCache] System initialized');
    }

    /**
     * Setup default cache policies for common endpoints
     */
    setupDefaultPolicies() {
        // Static data - long cache
        this.setCachePolicy('/api/v1/models', { ttl: 600000, priority: 'high' }); // 10 minutes
        this.setCachePolicy('/api/v1/samplers', { ttl: 600000, priority: 'high' });
        this.setCachePolicy('/api/v1/schedulers', { ttl: 600000, priority: 'high' });
        this.setCachePolicy('/api/v1/upscalers', { ttl: 600000, priority: 'high' });
        
        // Semi-static data - medium cache
        this.setCachePolicy('/api/v1/embeddings', { ttl: 300000, priority: 'medium' }); // 5 minutes
        this.setCachePolicy('/api/v1/hypernetworks', { ttl: 300000, priority: 'medium' });
        this.setCachePolicy('/api/v1/loras', { ttl: 300000, priority: 'medium' });
        
        // Dynamic data - short cache
        this.setCachePolicy('/api/v1/progress', { ttl: 5000, priority: 'low' }); // 5 seconds
        this.setCachePolicy('/api/v1/memory', { ttl: 10000, priority: 'low' }); // 10 seconds
        
        // No cache for generation endpoints
        this.setCachePolicy('/api/v1/txt2img', { ttl: 0, priority: 'none' });
        this.setCachePolicy('/api/v1/img2img', { ttl: 0, priority: 'none' });
        this.setCachePolicy('/api/v1/extra-single-image', { ttl: 0, priority: 'none' });
    }

    /**
     * Set cache policy for endpoint pattern
     */
    setCachePolicy(pattern, policy) {
        this.cachePolicies.set(pattern, {
            ttl: policy.ttl || this.defaultTTL,
            priority: policy.priority || 'medium',
            maxAge: policy.maxAge || policy.ttl,
            staleWhileRevalidate: policy.staleWhileRevalidate || false
        });
    }

    /**
     * Get cached response
     */
    get(key) {
        this.stats.totalRequests++;
        
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        
        // Check if expired
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.memoryUsage -= entry.size;
            this.stats.misses++;
            return null;
        }
        
        // Update access order for LRU
        this.accessOrder.set(key, Date.now());
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        
        this.stats.hits++;
        this.stats.networkSaved++;
        
        return entry.data;
    }

    /**
     * Store response in cache
     */
    set(key, data, options = {}) {
        const policy = this.getCachePolicy(key);
        
        // Don't cache if TTL is 0
        if (policy.ttl === 0) {
            return false;
        }
        
        const size = this.estimateSize(data);
        const ttl = options.ttl || policy.ttl;
        
        // Check if we need to make room
        if (this.shouldEvict(size)) {
            this.evictItems(size);
        }
        
        // Create cache entry
        const entry = {
            data,
            size,
            ttl,
            priority: policy.priority,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 1,
            expiresAt: Date.now() + ttl
        };
        
        // Remove existing entry if present
        if (this.cache.has(key)) {
            const existing = this.cache.get(key);
            this.memoryUsage -= existing.size;
        }
        
        // Add new entry
        this.cache.set(key, entry);
        this.accessOrder.set(key, Date.now());
        this.memoryUsage += size;
        
        return true;
    }

    /**
     * Get cache policy for key
     */
    getCachePolicy(key) {
        // Find matching policy pattern
        for (const [pattern, policy] of this.cachePolicies) {
            if (key.includes(pattern)) {
                return policy;
            }
        }
        
        // Default policy
        return {
            ttl: this.defaultTTL,
            priority: 'medium',
            maxAge: this.defaultTTL,
            staleWhileRevalidate: false
        };
    }

    /**
     * Check if cache entry is expired
     */
    isExpired(entry) {
        return Date.now() > entry.expiresAt;
    }

    /**
     * Check if eviction is needed
     */
    shouldEvict(newItemSize) {
        const wouldExceedMemory = (this.memoryUsage + newItemSize) > (this.maxMemoryMB * 1024 * 1024);
        const wouldExceedCount = this.cache.size >= this.maxSize;
        
        return wouldExceedMemory || wouldExceedCount;
    }

    /**
     * Evict items using LRU and priority strategy
     */
    evictItems(requiredSpace = 0) {
        const targetMemory = (this.maxMemoryMB * 1024 * 1024) * 0.8; // 80% of max
        const targetCount = Math.floor(this.maxSize * 0.8); // 80% of max
        
        // Sort entries by priority and access time
        const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            entry,
            lastAccessed: this.accessOrder.get(key) || 0
        }));
        
        // Sort by priority (low first) then by access time (oldest first)
        entries.sort((a, b) => {
            const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
            const aPriority = priorityOrder[a.entry.priority] || 2;
            const bPriority = priorityOrder[b.entry.priority] || 2;
            
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            return a.lastAccessed - b.lastAccessed;
        });
        
        let freedMemory = 0;
        let evictedCount = 0;
        
        for (const { key, entry } of entries) {
            if (this.memoryUsage - freedMemory <= targetMemory && 
                this.cache.size - evictedCount <= targetCount &&
                freedMemory >= requiredSpace) {
                break;
            }
            
            this.cache.delete(key);
            this.accessOrder.delete(key);
            freedMemory += entry.size;
            evictedCount++;
            this.stats.evictions++;
        }
        
        this.memoryUsage -= freedMemory;
    }

    /**
     * Estimate size of data
     */
    estimateSize(data) {
        if (typeof data === 'string') {
            return data.length * 2; // UTF-16 encoding
        }
        
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        }
        
        if (data instanceof Blob) {
            return data.size;
        }
        
        // Estimate JSON size
        try {
            return JSON.stringify(data).length * 2;
        } catch (e) {
            return 1024; // Default 1KB estimate
        }
    }

    /**
     * Invalidate cache entries by pattern
     */
    invalidate(pattern) {
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            const entry = this.cache.get(key);
            if (entry) {
                this.cache.delete(key);
                this.accessOrder.delete(key);
                this.memoryUsage -= entry.size;
            }
        });
        
        console.log(`[ResponseCache] Invalidated ${keysToDelete.length} entries matching pattern: ${pattern}`);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.accessOrder.clear();
        this.memoryUsage = 0;
    }

    /**
     * Setup periodic cleanup
     */
    setupPeriodicCleanup() {
        // Clean expired entries every 2 minutes
        setInterval(() => {
            this.cleanupExpired();
        }, 120000);
        
        // Memory pressure cleanup every 5 minutes
        setInterval(() => {
            if (this.memoryUsage > (this.maxMemoryMB * 1024 * 1024 * 0.9)) {
                this.evictItems();
            }
        }, 300000);
    }

    /**
     * Clean up expired entries
     */
    cleanupExpired() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => {
            const entry = this.cache.get(key);
            if (entry) {
                this.cache.delete(key);
                this.accessOrder.delete(key);
                this.memoryUsage -= entry.size;
            }
        });
        
        if (expiredKeys.length > 0) {
            console.log(`[ResponseCache] Cleaned up ${expiredKeys.length} expired entries`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const hitRate = this.stats.totalRequests > 0 ? 
            (this.stats.hits / this.stats.totalRequests * 100) : 0;
        
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            currentItems: this.cache.size,
            maxItems: this.maxSize,
            memoryUsageMB: Math.round(this.memoryUsage / 1024 / 1024 * 100) / 100,
            maxMemoryMB: this.maxMemoryMB,
            memoryUtilization: ((this.memoryUsage / (this.maxMemoryMB * 1024 * 1024)) * 100).toFixed(2)
        };
    }

    /**
     * Generate cache key from request
     */
    generateKey(url, options = {}) {
        const method = options.method || 'GET';
        const headers = JSON.stringify(options.headers || {});
        const body = options.body || '';
        
        return `${method}:${url}:${headers}:${body}`;
    }
}

// Create global instance with error handling
try {
    window.responseCache = new ResponseCache({
        maxSize: 100,        // Max 100 cached responses
        defaultTTL: 300000,  // 5 minutes default
        maxMemoryMB: 50      // 50MB memory limit
    });

    // Expose utility functions
    window.getCachedResponse = (key) => window.responseCache.get(key);
    window.setCachedResponse = (key, data, options) => window.responseCache.set(key, data, options);
    window.invalidateCache = (pattern) => window.responseCache.invalidate(pattern);
    window.getCacheStats = () => window.responseCache.getStats();

    console.log('[ResponseCache] Response caching system loaded successfully');

} catch (error) {
    console.error('[ResponseCache] Failed to initialize:', error);
    console.error('[ResponseCache] Error stack:', error.stack);
}
