/**
 * SOMA.AI System Diagnostics & Logger
 * ─────────────────────────────────────────────────────────────
 * Centralized application logging.
 * Replaces console.log with a structured, queryable telemetry system.
 * Prepares the architecture for production log aggregation and
 * Live Activity Feed generation.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.Logger = (function() {
    // In-memory store for future Live Activity Feed UI integration
    const logHistory = [];
    const MAX_LOGS = 1000;
    let totalLogs = 0;

    // Internal formatter
    function formatLog(level, source, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, source, message, data };
        
        totalLogs++;

        // Store in memory
        logHistory.push(logEntry);
        if (logHistory.length > MAX_LOGS) {
            logHistory.shift(); // Prevent memory leaks
        }

        return logEntry;
    }

    // Output to console with styled formatting based on level
    function flushToConsole(entry) {
        const timeStr = new Date(entry.timestamp).toLocaleTimeString();
        const prefix = `[${timeStr}] [${entry.source}]`;
        
        switch(entry.level) {
            case 'INFO':
                console.log(`%c${prefix} %c${entry.message}`, 'color: #888;', 'color: #fff;', entry.data || '');
                break;
            case 'WARNING':
                console.warn(`${prefix} ${entry.message}`, entry.data || '');
                break;
            case 'ERROR':
                console.error(`${prefix} ${entry.message}`, entry.data || '');
                break;
            case 'SYSTEM':
                // System events get the SOMA neon blue styling
                console.log(`%c${prefix} %c${entry.message}`, 'color: #00f2ff; font-weight: bold;', 'color: #00f2ff;', entry.data || '');
                break;
        }
    }

    return {
        logInfo: function(source, message, data = null) {
            flushToConsole(formatLog('INFO', source, message, data));
        },
        
        logWarning: function(source, message, data = null) {
            flushToConsole(formatLog('WARNING', source, message, data));
        },
        
        logError: function(source, message, error = null) {
            flushToConsole(formatLog('ERROR', source, message, error));
        },
        
        logSystemEvent: function(source, message, data = null) {
            flushToConsole(formatLog('SYSTEM', source, message, data));
        },

        // Expose history for the Activity Feed widget to consume later
        getHistory: function() {
            return [...logHistory];
        },

        // Expose statistics for runtime monitoring
        getStats: function() {
            return {
                totalLogs: totalLogs,
                historySize: logHistory.length
            };
        }
    };
})();
