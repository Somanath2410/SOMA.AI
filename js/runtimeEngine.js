/**
 * SOMA.AI Runtime Orchestration Engine
 * ─────────────────────────────────────────────────────────────
 * Centralized loop for live application updates.
 * Orchestrates individual runtime modules dynamically using the
 * Runtime Registry and Scheduler.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.Runtime = (function() {
    return {
        /**
         * Start the centralized runtime engine
         */
        start: function() {
            if (window.SOMA && window.SOMA.Logger) {
                SOMA.Logger.logSystemEvent('RuntimeEngine', 'Initializing Orchestrator...');
            }

            if (window.SOMA && window.SOMA.RuntimeRegistry && window.SOMA.Scheduler) {
                // Get all registered runtimes dynamically
                const allRuntimes = SOMA.RuntimeRegistry.getAllRuntimes();
                
                // Start every registered runtime
                for (const id in allRuntimes) {
                    SOMA.RuntimeRegistry.startRuntime(id);
                }

                // Start the global scheduler to execute the runtimes
                SOMA.Scheduler.start();
            } else {
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logError('RuntimeEngine', 'Failed to initialize Orchestrator: Missing Registry or Scheduler.');
                }
            }
        },

        /**
         * Stop the runtime engine
         */
        stop: function() {
            if (window.SOMA && window.SOMA.RuntimeRegistry && window.SOMA.Scheduler) {
                // Stop the scheduler execution
                SOMA.Scheduler.stop();
                
                // Mark all runtimes as stopped in the registry
                const allRuntimes = SOMA.RuntimeRegistry.getAllRuntimes();
                for (const id in allRuntimes) {
                    SOMA.RuntimeRegistry.stopRuntime(id);
                }

                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logWarning('RuntimeEngine', 'Orchestrator halted all runtime modules.');
                }
            }
        }
    };
})();
