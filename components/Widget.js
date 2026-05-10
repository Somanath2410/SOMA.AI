/**
 * Widget Component
 * ─────────────────────────────────────────────────────────────
 * A reusable container for dashboard widgets.
 * Renders a glassmorphism card with an optional title and inner content.
 *
 * Props:
 *   title     {string} - Widget title (optional)
 *   className {string} - Extra CSS classes to append (optional)
 *   content   {string} - Inner HTML content
 *
 * Usage in HTML:
 *   <div data-component="Widget" data-title="Live Activity Feed">
 *       <div class="scroll-container">...</div>
 *   </div>
 * ─────────────────────────────────────────────────────────────
 */

window.createWidget = function(props) {
    var title = props.title || '';
    var className = props.className ? ' ' + props.className : '';
    var content = props.content || '';

    var titleHtml = title ? `<div class="widget-title">${title}</div>` : '';

    return `
        <div class="glass widget${className}">
            ${titleHtml}
            ${content}
        </div>
    `;
};

// Register component with SOMA Registry
if (window.SOMA && SOMA.register) {
    SOMA.register('Widget', window.createWidget);
}
