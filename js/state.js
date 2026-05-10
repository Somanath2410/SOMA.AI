/**
 * SOMA.AI State Management
 * ─────────────────────────────────────────────────────────────
 * Lightweight centralized state store using localStorage.
 * Prepares the architecture for future backend/API integration.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.State = (function() {
    const STORAGE_KEY = 'soma_app_state';

    // Default application state schema — highly scalable
    const defaultState = {
        connectors: {
            AutoCAD: false,
            Navisworks: false
        },
        theme: 'dark',        // Future usage
        navigation: 'home',   // Future usage
        planForge: {},        // Future usage
        bimSession: null      // Future usage
    };

    // Load state from localStorage or use defaults
    let currentState = { ...defaultState };
    
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge saved state with default state to ensure schema integrity
            currentState = { ...defaultState, ...parsed };
            
            // Deep merge for nested objects like connectors
            if (parsed.connectors) {
                currentState.connectors = { ...defaultState.connectors, ...parsed.connectors };
            }
        }
    } catch (e) {
        console.error('[SOMA State] Failed to load state from localStorage', e);
    }

    // Persist current state to localStorage safely
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        } catch (e) {
            console.error('[SOMA State] Failed to save state to localStorage', e);
        }
    }

    return {
        // Get the entire state object
        get: function() {
            return currentState;
        },
        
        // Update a specific slice of the state
        update: function(key, value) {
            if (typeof currentState[key] === 'object' && !Array.isArray(currentState[key]) && value !== null) {
                // Merge nested objects
                currentState[key] = { ...currentState[key], ...value };
            } else {
                // Direct assignment for primitives
                currentState[key] = value;
            }
            saveState();
        },
        
        // Reset state to defaults (useful for debugging/logout)
        reset: function() {
            currentState = { ...defaultState };
            saveState();
        }
    };
})();
