/**
 * SOMA.AI Runtime Scheduler
 * ─────────────────────────────────────────────────────────────
 * Centralized timing and execution scheduling.
 * Replaces hardcoded setIntervals with a managed execution queue.
 * Prepares for adaptive refresh rates and prioritized AI workloads.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.Scheduler = (function() {
    // Array of registered tasks: { id, callback, intervalMs, lastRun, priority }
    const tasks = [];
    let masterInterval = null;
    const MASTER_TICK_RATE = 1000; // 1 second base resolution
    let totalTicks = 0;

    function masterTick() {
        const now = Date.now();
        totalTicks++;
        
        // Future: Sort tasks by priority before execution if needed
        
        tasks.forEach(task => {
            if (now - task.lastRun >= task.intervalMs) {
                try {
                    task.callback();
                } catch (e) {
                    if (window.SOMA && window.SOMA.Logger) {
                        SOMA.Logger.logError('Scheduler', `Error executing task: ${task.id}`, e);
                    }
                }
                task.lastRun = now;
            }
        });
    }

    return {
        /**
         * Register a new scheduled task
         * @param {string} id - Unique identifier for the task
         * @param {Function} callback - Function to execute
         * @param {number} intervalMs - Execution interval in milliseconds
         * @param {number} priority - Execution priority (higher = sooner)
         */
        registerTask: function(id, callback, intervalMs, priority = 1) {
            // Remove if already exists
            this.unregisterTask(id);
            
            tasks.push({
                id,
                callback,
                intervalMs,
                priority,
                lastRun: 0 // Will run immediately on next tick
            });
            
            if (window.SOMA && window.SOMA.Logger) {
                SOMA.Logger.logInfo('Scheduler', `Registered task: ${id} at ${intervalMs}ms interval`);
            }
        },

        /**
         * Unregister a task by ID
         */
        unregisterTask: function(id) {
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks.splice(index, 1);
            }
        },

        /**
         * Start the master scheduler loop
         */
        start: function() {
            if (masterInterval) return;
            
            if (window.SOMA && window.SOMA.Logger) {
                SOMA.Logger.logSystemEvent('Scheduler', 'Master scheduling loop started.');
            }
            
            // Run an immediate tick to start tasks without waiting for first interval
            masterTick();
            masterInterval = setInterval(masterTick, MASTER_TICK_RATE);
        },

        /**
         * Stop the master scheduler loop
         */
        stop: function() {
            if (masterInterval) {
                clearInterval(masterInterval);
                masterInterval = null;
                
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logWarning('Scheduler', 'Master scheduling loop halted.');
                }
            }
        },

        /**
         * Get scheduler statistics
         */
        getStats: function() {
            return {
                totalTicks: totalTicks,
                activeTasks: tasks.length
            };
        }
    };
})();
