/**
 * SOMA.AI Command Bus Architecture
 * ─────────────────────────────────────────────────────────────
 * Centralized command execution pipeline.
 * Routes imperative requests (commands) to the appropriate 
 * runtime or service, preparing for natural language AI workflows
 * and autonomous agent execution.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.CommandBus = (function() {
    // Registry of available commands
    // Format: { "COMMAND_ID": { description, execute: function(payload) } }
    const commands = {};
    const history = [];

    return {
        /**
         * Register a new actionable command
         * @param {string} commandId - Unique command identifier
         * @param {string} description - Human/AI readable description
         * @param {Function} executeCallback - The function to run
         */
        registerCommand: function(commandId, description, executeCallback) {
            commands[commandId] = {
                description: description,
                execute: executeCallback
            };
            if (window.SOMA && window.SOMA.Logger) {
                SOMA.Logger.logInfo('CommandBus', `Registered command: ${commandId}`);
            }
        },

        /**
         * Execute a registered command by ID
         * @param {string} commandId - The command to execute
         * @param {Object} payload - Optional parameters
         */
        executeCommand: function(commandId, payload = {}) {
            // Support for string-based commands with arguments (e.g. "IMPORT_BIM_DATA CSV")
            if (typeof commandId === 'string' && !commands[commandId]) {
                const parts = commandId.split(' ');
                const baseId = parts[0];
                if (commands[baseId]) {
                    const arg = parts.slice(1).join(' ');
                    // If we have an argument, package it into the payload
                    if (arg) {
                        payload = { ...payload, type: arg.toUpperCase() };
                        commandId = baseId;
                    }
                }
            }

            if (!commands[commandId]) {
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logError('CommandBus', `Command not found: ${commandId}`);
                }
                return false;
            }

            const commandObj = commands[commandId];
            
            // Log to history
            history.push({
                command: commandId,
                payload: payload,
                timestamp: Date.now()
            });

            if (window.SOMA && window.SOMA.Logger) {
                SOMA.Logger.logSystemEvent('CommandBus', `Executing: ${commandId}`);
            }

            try {
                // Execute the callback
                const result = commandObj.execute(payload);
                
                // Emit global event that a command was executed
                if (window.SOMA && window.SOMA.Events) {
                    SOMA.Events.emitEvent('COMMAND_EXECUTED', {
                        command: commandId,
                        result: result,
                        payload: payload
                    });
                }
                return true;
            } catch (e) {
                if (window.SOMA && window.SOMA.Logger) {
                    SOMA.Logger.logError('CommandBus', `Failed to execute ${commandId}`, e);
                }
                return false;
            }
        },

        /**
         * Get all available registered commands
         */
        getAvailableCommands: function() {
            return Object.keys(commands).map(id => ({
                id: id,
                description: commands[id].description
            }));
        },

        /**
         * Get execution history
         */
        commandHistory: function() {
            return [...history];
        }
    };
})();
