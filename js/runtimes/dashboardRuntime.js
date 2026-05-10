/**
 * SOMA.AI Dashboard Runtime
 * ─────────────────────────────────────────────────────────────
 * Isolated runtime module for dashboard-specific simulations.
 * Responsible for health score fluctuations and AI agent
 * activity telemetry generation.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Runtimes = window.SOMA.Runtimes || {};

SOMA.Runtimes.Dashboard = (function() {

    // Update the visual health score
    function updateHealthScore() {
        const health = document.querySelector('.stat-value[style*="success"]');
        if (health) {
            const newVal = (98 + Math.random() * 1).toFixed(1);
            health.innerText = newVal + "%";
        }
    }

    // Simulate random AI Agent tasks
    function simulateAgentActivity() {
        const agents = ['Coordination Agent', 'QA Engine', 'MEP Agent', 'Structural Agent'];
        const actions = ['resolved minor clash', 'validated naming standard', 'optimized cable routing', 'checked column alignment'];
        
        const agent = agents[Math.floor(Math.random() * agents.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        const message = `${agent} ${action}.`;

        // 1. Generate system log
        if (window.SOMA && window.SOMA.Logger) {
            SOMA.Logger.logInfo('DashboardRuntime', message);
        }

        // 2. Emit global telemetry event for UI widgets (e.g. Activity Feed) to consume
        if (window.SOMA && window.SOMA.Events) {
            SOMA.Events.emitEvent('TELEMETRY_UPDATE', {
                source: agent,
                message: message,
                timestamp: Date.now()
            });
        }
    }

    return {
        /**
         * Executed on every tick of the main runtime engine
         */
        tick: function() {
            // 1. Simulate BIM Health Fluctuation
            if (Math.random() > 0.7) {
                updateHealthScore();
            }

            // 2. Simulate AI Telemetry Events
            if (Math.random() > 0.85) {
                simulateAgentActivity();
            }
        }
    };
})();

// Self-Register with the Global Runtime Registry
if (window.SOMA && window.SOMA.RuntimeRegistry && window.SOMA.Runtimes.Dashboard) {
    SOMA.RuntimeRegistry.registerRuntime('DashboardRuntime', SOMA.Runtimes.Dashboard, {
        intervalMs: 3000,
        priority: 10
    });
}
