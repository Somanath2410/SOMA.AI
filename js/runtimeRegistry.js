/**
 * SOMA.AI Runtime Registry
 * ─────────────────────────────────────────────────────────────
 * Centralized repository for all autonomous runtime modules.
 * Manages the lifecycle (registration, startup, shutdown) of
 * modular runtime components like Telemetry and Agents.
 * Prepares the architecture for dynamic Plugin loading.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.RuntimeRegistry = (function() {
    // Internal dictionary to hold registered runtimes
    // Format: { "RuntimeId": { instance, config, status } }
    const registry = {};

    return {
        /**
         * Register a new runtime module
         * @param {string} id - Unique identifier (e.g., 'DashboardRuntime')
         * @param {Object} runtimeInstance - The runtime module containing a .tick() method
         * @param {Object} config - Configuration options (intervalMs, priority)
         */
        registerRuntime: function(id, runtimeInstance, config = {}) {
            if (registry[id]) {
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logWarning('RuntimeRegistry', `Runtime ${id} is already registered. Overwriting.`);
                }
            }

            registry[id] = {
                instance: runtimeInstance,
                config: {
                    intervalMs: config.intervalMs || 3000,
                    priority: config.priority || 5
                },
                status: 'registered' // 'registered', 'running', 'stopped'
            };

            if (window.SOMA && window.SOMA.Logger) {
                SOMA.Logger.logInfo('RuntimeRegistry', `Successfully registered ${id}`);
            }
        },

        /**
         * Get a specific runtime by ID
         */
        getRuntime: function(id) {
            return registry[id] || null;
        },

        /**
         * Get all registered runtimes
         */
        getAllRuntimes: function() {
            return registry;
        },

        /**
         * Start a specific runtime (delegates to Scheduler)
         */
        startRuntime: function(id) {
            const runtime = registry[id];
            if (!runtime) {
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logError('RuntimeRegistry', `Cannot start ${id}: Not found.`);
                }
                return;
            }

            if (window.SOMA && window.SOMA.Scheduler && runtime.instance.tick) {
                SOMA.Scheduler.registerTask(
                    id,
                    () => runtime.instance.tick(),
                    runtime.config.intervalMs,
                    runtime.config.priority
                );
                runtime.status = 'running';
                
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logSystemEvent('RuntimeRegistry', `Started runtime: ${id}`);
                }
            } else {
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logError('RuntimeRegistry', `Failed to start ${id}: Scheduler missing or no tick() method.`);
                }
            }
        },

        /**
         * Stop a specific runtime
         */
        stopRuntime: function(id) {
            const runtime = registry[id];
            if (!runtime) return;

            if (window.SOMA && window.SOMA.Scheduler) {
                SOMA.Scheduler.unregisterTask(id);
                runtime.status = 'stopped';
                
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logWarning('RuntimeRegistry', `Stopped runtime: ${id}`);
                }
            }
        },

        /**
         * Get registry statistics
         */
        getStats: function() {
            const all = Object.keys(registry);
            const running = all.filter(id => registry[id].status === 'running');
            return {
                totalRegistered: all.length,
                totalRunning: running.length
            };
        }
    };
})();
