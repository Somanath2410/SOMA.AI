/**
 * SOMA.AI Dashboard Service
 * ─────────────────────────────────────────────────────────────
 * Abstract service layer for dashboard data operations.
 * Currently returns local data, architected for future REST API,
 * WebSocket streams, or Autodesk Forge integrations.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.DashboardService = (function() {
    return {
        /**
         * Fetch core dashboard statistics.
         * Returns a Promise to simulate an asynchronous API call.
         *
         * @returns {Promise<Array>} Array of stat objects
         */
        getDashboardStats: function() {
            return new Promise((resolve, reject) => {
                // Simulate network latency for realistic API readiness
                setTimeout(() => {
                    if (window.dashboardStats) {
                        // Return deep copy to prevent direct mutation of the raw data layer
                        resolve(JSON.parse(JSON.stringify(window.dashboardStats)));
                    } else {
                        reject(new Error("[SOMA.Services] Dashboard stats not found in data layer."));
                    }
                }, 50); // Small delay to simulate async nature
            });
        }
    };
})();
