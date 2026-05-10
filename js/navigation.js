/**
 * SOMA.AI Navigation Controller
 * ─────────────────────────────────────────────────────────────
 * Centralized navigation logic.
 * Currently manages DOM-based SPA view switching.
 * Architected to support future URL routing, browser history,
 * deep linking, lazy loading, and route guards.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.Navigation = (function() {
    
    // Internal state for router
    let currentRoute = null;

    // The core navigation function (migrated from app.js)
    function navigateTo(viewId) {
        // Future: Add route guards here (e.g., check SOMA.State for authentication)
        
        // Hide all views
        document.querySelectorAll('main').forEach(m => m.style.display = 'none');
        
        // Remove active state from all nav links
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        
        // Show target view
        const target = document.getElementById('view-' + viewId);
        if (target) {
            // Future: Implement lazy loading here
            // e.g., if (!target.innerHTML) { await loadView(viewId); }
            
            if (viewId === 'home') target.style.display = 'flex';
            else if (viewId === 'modules') target.style.display = 'grid';
            else target.style.display = 'block';
        }
        
        // Highlight active nav link
        const nav = document.getElementById('nav-' + viewId);
        if (nav) nav.classList.add('active');
        
        // Scroll to top on navigation
        window.scrollTo(0, 0);
        
        // Update internal state
        currentRoute = viewId;
        
        // Future: Update browser history for deep linking
        // window.history.pushState({ viewId }, '', `/${viewId}`);
    }

    return {
        showView: navigateTo,
        getCurrentRoute: function() { return currentRoute; }
    };
})();

// Expose globally for backward compatibility with existing inline onclick attributes
window.showView = SOMA.Navigation.showView;
