/**
 * SOMA.AI PlanForge Preview Panel
 * ─────────────────────────────────────────────────────────────
 * A futuristic 2D canvas/HUD that visualizes conceptual layouts
 * with zoning overlays and circulation paths.
 * ─────────────────────────────────────────────────────────────
 */

SOMA.register('PlanForgePreviewPanel', (props) => {
    
    const concept = (window.SOMA && SOMA.Services && SOMA.Services.PlanForgeService && SOMA.Services.PlanForgeService.getCurrentConcept()) || null;

    if (!concept) {
        return `
            <div class="glass" style="height: 400px; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(255,255,255,0.1); flex-direction: column;">
                <div style="font-family: 'Orbitron'; color: var(--text-dim); font-size: 0.8rem; letter-spacing: 2px;">[ ENGINE STANDBY ]</div>
                <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 10px;">AWAITING GENERATION PROMPT</div>
            </div>
        `;
    }

    // Helper to render blocks
    const renderBlocks = () => {
        const scale = 20; // 1m = 20px
        return concept.blocks.map(block => {
            const color = block.zone === 'Circulation' ? 'rgba(175, 82, 222, 0.3)' : 
                          (block.zone === 'Service' ? 'rgba(255, 159, 10, 0.3)' : 'rgba(0, 242, 255, 0.15)');
            const border = block.zone === 'Circulation' ? 'var(--neon-purple)' : 'var(--accent)';
            
            return `
                <div style="position: absolute; 
                            left: ${block.x * scale + 150}px; 
                            top: ${block.y * scale + 100}px; 
                            width: ${block.width * scale}px; 
                            height: ${block.height * scale}px; 
                            background: ${color}; 
                            border: 1px solid ${border}; 
                            border-radius: 2px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            text-align: center; 
                            overflow: hidden;">
                    <div style="font-size: 0.5rem; color: white; font-weight: bold; text-transform: uppercase;">${block.name}</div>
                </div>
            `;
        }).join('');
    };

    return `
        <div class="glass" style="height: 500px; position: relative; background: rgba(0,0,0,0.4); overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
            <!-- HUD Grid Background -->
            <div style="position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(0,242,255,0.05) 1px, transparent 1px); background-size: 20px 20px; opacity: 0.3;"></div>

            <!-- Canvas Viewport -->
            <div style="position: relative; width: 100%; height: 100%;">
                ${renderBlocks()}
                
                <!-- Circulation Path (Simulated Vector) -->
                <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;">
                    <path d="M 170 140 L 250 140 L 250 280" stroke="var(--neon-purple)" stroke-width="1.5" stroke-dasharray="5,5" fill="none">
                        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>

            <!-- HUD Overlay: Metrics -->
            <div style="position: absolute; top: 20px; right: 20px; text-align: right;">
                <div style="font-family: 'Orbitron'; font-size: 0.6rem; color: var(--accent); margin-bottom: 5px;">CONCEPT ANALYTICS</div>
                <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; border: 1px solid rgba(0,242,255,0.1);">
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 0.5rem; color: var(--text-dim); text-transform: uppercase;">Area Efficiency</div>
                        <div style="font-size: 0.9rem; color: var(--status-success); font-weight: bold;">${concept.metrics.efficiency}</div>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 0.5rem; color: var(--text-dim); text-transform: uppercase;">Circulation Flow</div>
                        <div style="font-size: 0.9rem; color: var(--neon-purple); font-weight: bold;">${concept.metrics.circulationEfficiency}%</div>
                    </div>
                    <div>
                        <div style="font-size: 0.5rem; color: var(--text-dim); text-transform: uppercase;">Gross Area</div>
                        <div style="font-size: 0.7rem; color: var(--text-main);">${concept.metrics.grossArea}</div>
                    </div>
                </div>
            </div>

            <!-- HUD Overlay: Status -->
            <div style="position: absolute; bottom: 20px; left: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; font-family: 'Orbitron'; font-size: 0.6rem; color: var(--accent);">
                    <div class="pulse" style="width: 6px; height: 6px; background: var(--accent); border-radius: 50%;"></div>
                    GENERATIVE ENGINE: ACTIVE
                </div>
                <div style="font-size: 0.5rem; color: var(--text-dim); margin-top: 4px;">TOPOLOGY: ${concept.prompt.toUpperCase()}</div>
            </div>

            <!-- Scanner Animation -->
            <div style="position: absolute; left: 0; width: 100%; height: 1px; background: var(--accent); opacity: 0.2; animation: scanVertical 4s linear infinite;"></div>
        </div>
    `;
});
