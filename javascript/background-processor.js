/**
 * Background Processing System
 * Moves heavy operations to background using Web Workers and requestIdleCallback
 */

class BackgroundProcessor {
    constructor() {
        this.taskQueue = [];
        this.isProcessing = false;
        this.maxConcurrentTasks = 2;
        this.activeTasks = new Set();
        
        // Task priorities
        this.priorities = {
            LOW: 1,
            NORMAL: 2,
            HIGH: 3,
            CRITICAL: 4
        };
        
        // Performance monitoring
        this.stats = {
            tasksProcessed: 0,
            tasksQueued: 0,
            averageProcessingTime: 0,
            backgroundUtilization: 0
        };
        
        this.setupBackgroundProcessing();
    }

    /**
     * Setup background processing capabilities
     */
    setupBackgroundProcessing() {
        // Check for requestIdleCallback support
        this.hasIdleCallback = 'requestIdleCallback' in window;
        
        // Check for Web Worker support
        this.hasWebWorkers = 'Worker' in window;
        
        // Start processing loop
        this.startProcessingLoop();
        
        console.log(`[BackgroundProcessor] Initialized with ${this.hasWebWorkers ? 'Web Workers' : 'no Web Workers'} and ${this.hasIdleCallback ? 'Idle Callback' : 'no Idle Callback'}`);
    }

    /**
     * Add task to background processing queue
     */
    addTask(taskFunction, options = {}) {
        const task = {
            id: this.generateTaskId(),
            function: taskFunction,
            priority: options.priority || this.priorities.NORMAL,
            timeout: options.timeout || 30000, // 30 second timeout
            useWebWorker: options.useWebWorker || false,
            onComplete: options.onComplete || (() => {}),
            onError: options.onError || ((error) => console.error('[BackgroundProcessor] Task error:', error)),
            createdAt: Date.now(),
            data: options.data || null
        };

        // Insert task in priority order
        this.insertTaskByPriority(task);
        this.stats.tasksQueued++;

        // Start processing if not already running
        if (!this.isProcessing) {
            this.processNextTask();
        }

        return task.id;
    }

    /**
     * Insert task in queue based on priority
     */
    insertTaskByPriority(task) {
        let insertIndex = this.taskQueue.length;
        
        for (let i = 0; i < this.taskQueue.length; i++) {
            if (this.taskQueue[i].priority < task.priority) {
                insertIndex = i;
                break;
            }
        }
        
        this.taskQueue.splice(insertIndex, 0, task);
    }

    /**
     * Start the main processing loop
     */
    startProcessingLoop() {
        const processLoop = () => {
            if (this.taskQueue.length > 0 && this.activeTasks.size < this.maxConcurrentTasks) {
                this.processNextTask();
            }
            
            // Schedule next iteration
            if (this.hasIdleCallback) {
                requestIdleCallback(processLoop, { timeout: 1000 });
            } else {
                setTimeout(processLoop, 16); // ~60fps fallback
            }
        };
        
        processLoop();
    }

    /**
     * Process the next task in queue
     */
    async processNextTask() {
        if (this.taskQueue.length === 0 || this.activeTasks.size >= this.maxConcurrentTasks) {
            return;
        }

        const task = this.taskQueue.shift();
        this.activeTasks.add(task.id);
        this.isProcessing = true;

        const startTime = performance.now();

        try {
            let result;
            
            if (task.useWebWorker && this.hasWebWorkers) {
                result = await this.executeInWebWorker(task);
            } else {
                result = await this.executeInMainThread(task);
            }

            const processingTime = performance.now() - startTime;
            this.updateStats(processingTime);

            task.onComplete(result);
            this.stats.tasksProcessed++;

        } catch (error) {
            task.onError(error);
        } finally {
            this.activeTasks.delete(task.id);
            
            if (this.activeTasks.size === 0 && this.taskQueue.length === 0) {
                this.isProcessing = false;
            }
        }
    }

    /**
     * Execute task in Web Worker
     */
    executeInWebWorker(task) {
        return new Promise((resolve, reject) => {
            // Create worker with task function
            const workerCode = `
                self.onmessage = function(e) {
                    try {
                        const taskFunction = new Function('data', e.data.functionCode);
                        const result = taskFunction(e.data.taskData);
                        self.postMessage({ success: true, result: result });
                    } catch (error) {
                        self.postMessage({ success: false, error: error.message });
                    }
                };
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            // Set timeout
            const timeout = setTimeout(() => {
                worker.terminate();
                reject(new Error('Task timeout'));
            }, task.timeout);
            
            worker.onmessage = (e) => {
                clearTimeout(timeout);
                worker.terminate();
                URL.revokeObjectURL(blob);
                
                if (e.data.success) {
                    resolve(e.data.result);
                } else {
                    reject(new Error(e.data.error));
                }
            };
            
            worker.onerror = (error) => {
                clearTimeout(timeout);
                worker.terminate();
                URL.revokeObjectURL(blob);
                reject(error);
            };
            
            // Send task to worker
            worker.postMessage({
                functionCode: task.function.toString(),
                taskData: task.data
            });
        });
    }

    /**
     * Execute task in main thread with time slicing
     */
    executeInMainThread(task) {
        return new Promise((resolve, reject) => {
            const executeWithTimeSlicing = () => {
                if (this.hasIdleCallback) {
                    requestIdleCallback((deadline) => {
                        try {
                            const result = task.function(task.data);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }, { timeout: task.timeout });
                } else {
                    // Fallback: execute with setTimeout to yield control
                    setTimeout(() => {
                        try {
                            const result = task.function(task.data);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                }
            };
            
            executeWithTimeSlicing();
        });
    }

    /**
     * Update processing statistics
     */
    updateStats(processingTime) {
        const currentAvg = this.stats.averageProcessingTime;
        const totalTasks = this.stats.tasksProcessed + 1;
        
        this.stats.averageProcessingTime = (currentAvg * this.stats.tasksProcessed + processingTime) / totalTasks;
        this.stats.backgroundUtilization = (this.activeTasks.size / this.maxConcurrentTasks) * 100;
    }

    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Cancel task by ID
     */
    cancelTask(taskId) {
        const taskIndex = this.taskQueue.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.taskQueue.splice(taskIndex, 1);
            return true;
        }
        return false;
    }

    /**
     * Clear all pending tasks
     */
    clearQueue() {
        this.taskQueue.length = 0;
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            queueLength: this.taskQueue.length,
            activeTasks: this.activeTasks.size,
            maxConcurrentTasks: this.maxConcurrentTasks,
            capabilities: {
                webWorkers: this.hasWebWorkers,
                idleCallback: this.hasIdleCallback
            }
        };
    }

    /**
     * Process heavy DOM operations in background
     */
    processDOMOperation(operation, data, options = {}) {
        return this.addTask(
            (taskData) => {
                // DOM operations that can be processed in background
                switch (taskData.operation) {
                    case 'parseHTML':
                        const parser = new DOMParser();
                        return parser.parseFromString(taskData.html, 'text/html');
                    
                    case 'processImageData':
                        // Process image data without blocking main thread
                        return taskData.imageData.map(img => ({
                            ...img,
                            processed: true,
                            timestamp: Date.now()
                        }));
                    
                    case 'filterLargeArray':
                        return taskData.array.filter(taskData.filterFunction);
                    
                    case 'sortLargeArray':
                        return taskData.array.sort(taskData.sortFunction);
                    
                    default:
                        throw new Error(`Unknown DOM operation: ${taskData.operation}`);
                }
            },
            {
                data: { operation, ...data },
                priority: options.priority || this.priorities.NORMAL,
                useWebWorker: options.useWebWorker !== false, // Default to true
                ...options
            }
        );
    }

    /**
     * Process syntax highlighting in background
     */
    processSyntaxHighlighting(text, language, options = {}) {
        return this.addTask(
            (taskData) => {
                // Simplified syntax highlighting that can run in worker
                const { text, language } = taskData;
                
                // Basic highlighting patterns
                const patterns = {
                    javascript: [
                        { pattern: /\b(function|var|let|const|if|else|for|while|return)\b/g, class: 'keyword' },
                        { pattern: /\/\/.*$/gm, class: 'comment' },
                        { pattern: /"[^"]*"/g, class: 'string' }
                    ],
                    python: [
                        { pattern: /\b(def|class|if|else|for|while|return|import)\b/g, class: 'keyword' },
                        { pattern: /#.*$/gm, class: 'comment' },
                        { pattern: /"[^"]*"|'[^']*'/g, class: 'string' }
                    ]
                };
                
                let highlightedText = text;
                const langPatterns = patterns[language] || patterns.javascript;
                
                langPatterns.forEach(({ pattern, class: className }) => {
                    highlightedText = highlightedText.replace(pattern, `<span class="${className}">$&</span>`);
                });
                
                return highlightedText;
            },
            {
                data: { text, language },
                priority: options.priority || this.priorities.NORMAL,
                useWebWorker: true,
                ...options
            }
        );
    }
}

// Create global instance
window.backgroundProcessor = new BackgroundProcessor();

// Expose utility functions
window.processInBackground = (taskFunction, options) => 
    window.backgroundProcessor.addTask(taskFunction, options);

window.getBackgroundStats = () => window.backgroundProcessor.getStats();
