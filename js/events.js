/**
 * SOMA.AI Event Bus
 * ─────────────────────────────────────────────────────────────
 * Centralized, lightweight event-driven architecture.
 * Enables decoupled communication between components, services,
 * and the application layer. Prepares for WebSockets & Telemetry.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.Events = (function() {
    // Internal dictionary to hold event listeners
    // Format: { "EVENT_NAME": [callback1, callback2, ...] }
    const listeners = {};
    let eventCount = 0;

    return {
        /**
         * Subscribe to an event
         * @param {string} eventName - Name of the event (e.g., 'CONNECTOR_CONNECTED')
         * @param {Function} callback - Function to execute when event is emitted
         */
        onEvent: function(eventName, callback) {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName].push(callback);
        },

        /**
         * Unsubscribe from an event
         * @param {string} eventName - Name of the event
         * @param {Function} callback - Specific function reference to remove
         */
        removeEventListener: function(eventName, callback) {
            if (!listeners[eventName]) return;
            
            listeners[eventName] = listeners[eventName].filter(cb => cb !== callback);
        },

        /**
         * Publish/Emit an event to all subscribers
         * @param {string} eventName - Name of the event
         * @param {any} payload - Optional data payload to pass to listeners
         */
        emitEvent: function(eventName, payload) {
            if (!listeners[eventName]) return;

            eventCount++;

            // Execute all callbacks synchronously
            listeners[eventName].forEach(callback => {
                try {
                    callback(payload);
                } catch (e) {
                    console.error(`[SOMA.Events] Error in listener for ${eventName}:`, e);
                }
            });
        },

        /**
         * Get event bus statistics for runtime monitoring
         */
        getStats: function() {
            return {
                totalEmitted: eventCount,
                registeredTopics: Object.keys(listeners).length
            };
        }
    };
})();
