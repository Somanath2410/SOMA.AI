/**
 * CommandBar Component
 * ─────────────────────────────────────────────────────────────
 * The futuristic command input interface.
 * Routes user input to the SOMA.CommandBus for execution.
 * ─────────────────────────────────────────────────────────────
 */

SOMA.register('CommandBar', (props) => {
    // We attach the logic after rendering
    setTimeout(() => {
        const input = document.getElementById('command-input');
        if (!input) return;

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim();
                if (!value) return;

                // Execute command via CommandBus
                if (window.SOMA && SOMA.CommandBus) {
                    const success = SOMA.CommandBus.executeCommand(value);
                    
                    if (success) {
                        input.value = '';
                        input.style.borderColor = 'var(--accent)';
                        
                        // Emit a success event for optional feedback
                        if (SOMA.Events) {
                            SOMA.Events.emitEvent('UI_COMMAND_SUCCESS', { command: value });
                        }
                    } else {
                        // Flash red on failure
                        input.style.borderColor = 'var(--status-critical)';
                        setTimeout(() => {
                            input.style.borderColor = 'rgba(255,255,255,0.1)';
                        }, 500);

                        if (SOMA.Events) {
                            SOMA.Events.emitEvent('UI_COMMAND_FAILURE', { command: value });
                        }
                    }
                }
            }
        });
    }, 0);

    return `
        <div class="command-bar-container" style="width: 100%; margin-bottom: 2rem;">
            <div class="glass" style="padding: 10px; display: flex; align-items: center; gap: 10px; border-radius: 8px;">
                <span style="color: var(--accent); font-family: 'Orbitron'; font-size: 0.8rem; letter-spacing: 1px;">CMD></span>
                <input id="command-input" type="text" 
                       placeholder="Enter system command (e.g. RUN_BIM_SCAN)..." 
                       style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; flex: 1; padding: 8px; font-family: 'Inter', monospace; font-size: 0.85rem; outline: none; border-radius: 4px; transition: border-color 0.3s ease;">
            </div>
        </div>
    `;
});