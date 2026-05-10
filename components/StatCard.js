/**
 * StatCard Component
 * ─────────────────────────────────────────────────────────────
 * The glass metric card used across dashboards.
 * Renders a title + value pair with optional accent color.
 *
 * Props:
 *   title  {string} - Stat title text  e.g. "BIM Health Score"
 *   value  {string} - Stat value text  e.g. "98.4%"
 *   color  {string} - Optional color token (see colorMap below)
 *                     Omit for default white text.
 *
 * Color tokens:
 *   "success"      → var(--status-success)   green
 *   "warning"      → var(--status-warning)   amber
 *   "critical"     → var(--status-critical)  red
 *   "accent"       → var(--accent)           sky blue
 *   "neon-blue"    → var(--neon-blue)        cyan
 *   "neon-purple"  → var(--neon-purple)      purple
 *   "neon-gold"    → var(--neon-gold)        gold
 *
 * Usage in HTML:
 *   <div data-component="StatCard"
 *        data-title="BIM Health Score"
 *        data-value="98.4%"
 *        data-color="success">
 *   </div>
 *
 * React equivalent (future migration):
 *   const StatCard = ({ title, value, color }) => {
 *     const colorMap = { success: 'var(--status-success)', ... };
 *     return (
 *       <div className="glass stat-card">
 *         <span className="stat-label">{title}</span>
 *         <span className="stat-value" style={{ color: colorMap[color] }}>
 *           {value}
 *         </span>
 *       </div>
 *     );
 *   };
 * ─────────────────────────────────────────────────────────────
 */

// Reusable rendering logic for stat cards
window.createStatCard = function(props) {
    var title = props.title || props.label || '';
    var value = props.value || '';

    // Map token names to CSS variables — keeps HTML clean,
    // avoids hardcoding var() strings in data attributes
    var colorMap = {
        'success': 'var(--status-success)',
        'warning': 'var(--status-warning)',
        'critical': 'var(--status-critical)',
        'accent': 'var(--accent)',
        'neon-blue': 'var(--neon-blue)',
        'neon-purple': 'var(--neon-purple)',
        'neon-gold': 'var(--neon-gold)',
    };

    var valueColor = props.color
        ? (colorMap[props.color] || props.color)
        : 'var(--text-main)';

    return `
        <div class="glass stat-card">
            <span class="stat-label">${title}</span>
            <span class="stat-value" style="color: ${valueColor};">${value}</span>
        </div>
    `;
};

// Register component with SOMA Registry
SOMA.register('StatCard', window.createStatCard);