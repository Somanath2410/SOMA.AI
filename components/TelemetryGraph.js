/**
 * TelemetryGraph Component
 * ─────────────────────────────────────────────────────────────
 * A cinematic realtime data visualization component.
 * Uses SVG polyline for lightweight, high-performance rendering.
 * ─────────────────────────────────────────────────────────────
 */

SOMA.register('TelemetryGraph', (props) => {
    const id = props.id || `graph-${Math.random().toString(36).substr(2, 9)}`;
    const label = props.label || 'SYSTEM METRIC';
    const color = props.color || 'var(--accent)';
    const maxPoints = 50;
    
    // Initial data points
    let dataPoints = new Array(maxPoints).fill(0.5);
    
    // Attach update logic
    setTimeout(() => {
        const svg = document.getElementById(`${id}-svg`);
        const polyline = document.getElementById(`${id}-polyline`);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        if (!svg || !polyline) return;

        // Listen for specific telemetry updates
        if (window.SOMA && SOMA.Events) {
            SOMA.Events.onEvent('TELEMETRY_DATA_UPDATE', (payload) => {
                if (payload.metricId !== id) return;
                
                const val = payload.value; // Expected 0.0 to 1.0
                dataPoints.push(val);
                if (dataPoints.length > maxPoints) dataPoints.shift();
                
                // Calculate SVG points
                const width = svg.clientWidth || 200;
                const height = svg.clientHeight || 50;
                const step = width / (maxPoints - 1);
                
                const pointsStr = dataPoints.map((v, i) => {
                    const x = i * step;
                    const y = height - (v * height);
                    return `${x},${y}`;
                }).join(' ');
                
                polyline.setAttribute('points', pointsStr);
                
                if (valueDisplay) {
                    valueDisplay.innerText = `${Math.round(val * 100)}%`;
                }
            });
        }
    }, 0);

    return `
        <div class="telemetry-container" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; font-family: 'Orbitron'; font-size: 0.6rem; color: var(--text-dim); margin-bottom: 8px; letter-spacing: 1px;">
                <span>${label}</span>
                <span id="${id}-value" style="color: ${color};">--%</span>
            </div>
            <div class="glass" style="height: 50px; padding: 4px; overflow: hidden; border-radius: 4px; background: rgba(0,0,0,0.2);">
                <svg id="${id}-svg" width="100%" height="100%" preserveAspectRatio="none" style="overflow: visible;">
                    <defs>
                        <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${color};stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                        </linearGradient>
                    </defs>
                    <polyline id="${id}-polyline"
                        points="0,50 200,50"
                        fill="none"
                        stroke="${color}"
                        stroke-width="1.5"
                        style="transition: all 0.3s ease-in-out;"
                    />
                </svg>
            </div>
        </div>
    `;
});
