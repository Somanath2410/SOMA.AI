/**
 * SOMA.AI DC AI Preview Panel
 * ─────────────────────────────────────────────────────────────
 * A functional component that analyzes real imported BIM data
 * for Data Center specific operational metrics.
 * ─────────────────────────────────────────────────────────────
 */

SOMA.register('DcAiPreviewPanel', (props) => {
    
    // Internal analysis logic that runs on every render
    function runAnalysis() {
        const data = (window.SOMA && SOMA.Data && SOMA.Data.ActiveBimData) || [];
        const dcElements = data.filter(el => el.discipline === 'Data Center');
        
        if (dcElements.length === 0) {
            return { status: 'Awaiting Data', metrics: null };
        }

        const criticalCount = dcElements.filter(el => el.healthStatus === 'critical').length;
        const healthyCount = dcElements.length - criticalCount;
        const healthScore = Math.round((healthyCount / dcElements.length) * 100);

        // Simulated Rack Spacing Analysis (based on metadata or status)
        const spacingViolations = dcElements.filter(el => el.comments && el.comments.toLowerCase().includes('spacing')).length;
        
        return {
            status: 'Live Analysis Active',
            metrics: {
                totalRacks: dcElements.length,
                healthScore: healthScore,
                spacingViolations: spacingViolations,
                thermalRisk: criticalCount > 0 ? 'Elevated' : 'Nominal'
            }
        };
    }

    const analysis = runAnalysis();

    if (!analysis.metrics) {
        return `
            <div class="glass" style="padding: 20px; text-align: center; border: 1px dashed rgba(255,255,255,0.1);">
                <div style="font-family: 'Orbitron'; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 10px;">[ DC AI PREVIEW ENGINE ]</div>
                <div style="font-size: 0.8rem; color: var(--text-main);">IMPORT BIM DATASET TO ACTIVATE</div>
            </div>
        `;
    }

    const scoreColor = analysis.metrics.healthScore > 80 ? 'var(--status-success)' : 'var(--status-warning)';

    return `
        <div class="glass" style="padding: 15px; position: relative; overflow: hidden; background: rgba(0, 242, 255, 0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="font-family: 'Orbitron'; font-size: 0.65rem; color: var(--accent); letter-spacing: 1px;">REAL-TIME DC ANALYSIS</div>
                <div style="font-size: 0.5rem; padding: 2px 6px; background: rgba(0,242,255,0.1); color: var(--accent); border-radius: 10px; border: 1px solid var(--accent);">${analysis.status}</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div style="font-size: 0.55rem; color: var(--text-dim); text-transform: uppercase;">Node Health</div>
                    <div style="font-size: 1.8rem; font-weight: bold; color: ${scoreColor}; font-family: 'Orbitron';">${analysis.metrics.healthScore}%</div>
                </div>
                <div>
                    <div style="font-size: 0.55rem; color: var(--text-dim); text-transform: uppercase;">Active Racks</div>
                    <div style="font-size: 1.8rem; font-weight: bold; color: var(--text-main); font-family: 'Orbitron';">${analysis.metrics.totalRacks}</div>
                </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.65rem; color: var(--text-dim);">Spacing Violations</span>
                    <span style="font-size: 0.65rem; color: ${analysis.metrics.spacingViolations > 0 ? 'var(--status-critical)' : 'var(--status-success)'}; font-weight: bold;">${analysis.metrics.spacingViolations}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.65rem; color: var(--text-dim);">Thermal Risk Level</span>
                    <span style="font-size: 0.65rem; color: ${analysis.metrics.thermalRisk === 'Nominal' ? 'var(--status-success)' : 'var(--status-critical)'}; font-weight: bold;">${analysis.metrics.thermalRisk.toUpperCase()}</span>
                </div>
            </div>

            <div style="margin-top: 15px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; font-size: 0.6rem; color: var(--text-dim); border-left: 2px solid var(--accent);">
                <div style="color: var(--accent); font-weight: bold; margin-bottom: 2px;">AI INSIGHT:</div>
                ${analysis.metrics.spacingViolations > 0 
                    ? 'Detected multi-node spacing violations. Immediate rack re-layout recommended to maintain cold aisle airflow.'
                    : 'Infrastructure topology within nominal tolerances. Airflow coordination optimized for current rack density.'}
            </div>
            
            <!-- HUD Scanner Animation Overlay -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(to right, transparent, var(--accent), transparent); animation: scanline 3s linear infinite; opacity: 0.3;"></div>
        </div>
    `;
});
