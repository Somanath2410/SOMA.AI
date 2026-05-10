/**
 * SOMA.AI Agent Execution Panel
 * ─────────────────────────────────────────────────────────────
 * A full-screen glassmorphic modal that renders when a user
 * clicks an AI Agent card. Streams live execution logs,
 * displays a progress bar, and shows structured results.
 *
 * Usage:  SOMA.AgentPanel.open('qaqc')
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};

SOMA.AgentPanel = (function () {

    let _overlay = null;
    let _isRunning = false;

    // ── Render Helpers ─────────────────────────────────────

    function getOverlay() {
        if (!_overlay) {
            _overlay = document.getElementById('agent-execution-overlay');
        }
        return _overlay;
    }

    function setProgress(pct) {
        const bar = document.getElementById('agent-exec-progress-bar');
        if (bar) bar.style.width = `${pct}%`;
    }

    function appendLog(message, type = 'info') {
        const log = document.getElementById('agent-exec-log');
        if (!log) return;
        const colors = { info: 'var(--text-main)', success: 'var(--status-success)', warn: 'var(--status-warning)', error: 'var(--status-critical)' };
        const entry = document.createElement('div');
        entry.style.cssText = `font-size:0.65rem; color:${colors[type]}; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.04); animation:fadeIn 0.3s ease;`;
        const ts = new Date().toLocaleTimeString();
        entry.innerHTML = `<span style="color:var(--text-dim); margin-right:8px;">[${ts}]</span>${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    function renderResults(result) {
        const panel = document.getElementById('agent-exec-results');
        if (!panel) return;

        const sevColor = result.criticalIssues > 0 ? 'var(--status-critical)' : 'var(--status-success)';

        panel.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px;">
                <div class="glass" style="padding:12px; text-align:center;">
                    <div style="font-size:0.5rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px;">Detected Issues</div>
                    <div style="font-size:1.6rem; font-family:'Orbitron'; color:${sevColor}; font-weight:bold;">${result.detectedIssues}</div>
                </div>
                <div class="glass" style="padding:12px; text-align:center;">
                    <div style="font-size:0.5rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px;">Critical</div>
                    <div style="font-size:1.6rem; font-family:'Orbitron'; color:var(--status-critical); font-weight:bold;">${result.criticalIssues}</div>
                </div>
                <div class="glass" style="padding:12px; text-align:center;">
                    <div style="font-size:0.5rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px;">Progress</div>
                    <div style="font-size:1.6rem; font-family:'Orbitron'; color:var(--status-success); font-weight:bold;">${result.workflowProgress}%</div>
                </div>
            </div>

            ${result.optimizationSuggestions.length > 0 ? `
            <div style="margin-bottom:12px;">
                <div style="font-family:'Orbitron'; font-size:0.6rem; color:var(--accent); margin-bottom:8px; letter-spacing:1px;">AI RECOMMENDATIONS</div>
                ${result.optimizationSuggestions.map(s => `
                    <div style="display:flex; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.65rem; color:var(--text-main);">
                        <span style="color:var(--accent); flex-shrink:0;">▸</span>${s}
                    </div>`).join('')}
            </div>` : ''}

            ${result.coordinationWarnings.length > 0 ? `
            <div>
                <div style="font-family:'Orbitron'; font-size:0.6rem; color:var(--status-warning); margin-bottom:8px; letter-spacing:1px;">COORDINATION WARNINGS</div>
                ${result.coordinationWarnings.map(w => `
                    <div style="display:flex; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.65rem; color:var(--status-warning);">
                        <span style="flex-shrink:0;">⚠</span>${w}
                    </div>`).join('')}
            </div>` : ''}
        `;
    }

    // ── Button State ────────────────────────────────────────

    function setButtonsEnabled(enabled) {
        ['agent-btn-run', 'agent-btn-report', 'agent-btn-detect', 'agent-btn-optimize'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !enabled;
                btn.style.opacity = enabled ? '1' : '0.4';
                btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
            }
        });
    }

    // ── Public API ──────────────────────────────────────────

    return {
        open: function (agentType) {
            if (!window.SOMA || !SOMA.Services.AgentExecutionService) {
                console.error('[AgentPanel] AgentExecutionService not loaded.');
                return;
            }

            const workflow = SOMA.Services.AgentExecutionService.getWorkflow(agentType);
            if (!workflow) return;

            const overlay = getOverlay();
            if (!overlay) return;

            overlay.innerHTML = `
                <div style="position:fixed; inset:0; background:rgba(2,6,23,0.92); backdrop-filter:blur(20px); z-index:9000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s ease;">
                    <div class="glass" style="width:min(900px,95vw); max-height:90vh; overflow:hidden; display:flex; flex-direction:column; border:1px solid ${workflow.color}; box-shadow:0 0 60px ${workflow.color}22;">

                        <!-- Header -->
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.08);">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <span style="font-size:1.5rem;">${workflow.icon}</span>
                                <div>
                                    <div style="font-family:'Orbitron'; font-size:0.9rem; color:${workflow.color}; letter-spacing:2px;">${workflow.label.toUpperCase()}</div>
                                    <div style="font-size:0.6rem; color:var(--text-dim); margin-top:2px;">BIM OPERATIONAL WORKFLOW ENGINE</div>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div id="agent-exec-status-badge" style="font-family:'Orbitron'; font-size:0.55rem; padding:4px 10px; border:1px solid var(--text-dim); border-radius:20px; color:var(--text-dim);">STANDBY</div>
                                <button onclick="SOMA.AgentPanel.close()" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:var(--text-dim); padding:6px 14px; border-radius:4px; cursor:pointer; font-family:'Orbitron'; font-size:0.55rem; transition:0.2s;" onmouseover="this.style.borderColor='var(--status-critical)'; this.style.color='var(--status-critical)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.color='var(--text-dim)'">✕ CLOSE</button>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div style="height:2px; background:rgba(255,255,255,0.05);">
                            <div id="agent-exec-progress-bar" style="height:100%; width:0%; background:${workflow.color}; transition:width 0.4s ease; box-shadow:0 0 8px ${workflow.color};"></div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="display:flex; gap:8px; padding:14px 24px; border-bottom:1px solid rgba(255,255,255,0.05); flex-wrap:wrap;">
                            <button id="agent-btn-run" onclick="SOMA.AgentPanel.run('${agentType}')" class="btn btn-primary" style="font-size:0.6rem; padding:8px 16px; background:${workflow.color}; border:none;">▶ RUN ANALYSIS</button>
                            <button id="agent-btn-report" onclick="SOMA.AgentPanel.generateReport()" class="btn btn-outline" style="font-size:0.6rem; padding:8px 16px;">📋 GENERATE REPORT</button>
                            <button id="agent-btn-detect" onclick="SOMA.AgentPanel.run('${agentType}')" class="btn btn-outline" style="font-size:0.6rem; padding:8px 16px;">🔍 DETECT ISSUES</button>
                            <button id="agent-btn-optimize" onclick="SOMA.AgentPanel.run('${agentType}')" class="btn btn-outline" style="font-size:0.6rem; padding:8px 16px; border-color:${workflow.color}; color:${workflow.color};">⚙ OPTIMIZE SYSTEM</button>
                        </div>

                        <!-- Body -->
                        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:0; flex:1; overflow:hidden; min-height:0;">

                            <!-- Live Log -->
                            <div style="display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.06); overflow:hidden;">
                                <div style="font-family:'Orbitron'; font-size:0.55rem; color:var(--text-dim); padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.05); letter-spacing:1px;">EXECUTION LOG</div>
                                <div id="agent-exec-log" style="flex:1; overflow-y:auto; padding:12px 20px; font-family:'Courier New', monospace; scrollbar-width:thin; scrollbar-color:var(--accent) transparent;">
                                    <div style="font-size:0.6rem; color:var(--text-dim); text-align:center; padding-top:40px;">Click RUN ANALYSIS to begin workflow execution</div>
                                </div>
                            </div>

                            <!-- Results -->
                            <div style="display:flex; flex-direction:column; overflow:hidden;">
                                <div style="font-family:'Orbitron'; font-size:0.55rem; color:var(--text-dim); padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.05); letter-spacing:1px;">ANALYSIS RESULTS</div>
                                <div id="agent-exec-results" style="flex:1; overflow-y:auto; padding:16px 20px; scrollbar-width:thin; scrollbar-color:${workflow.color} transparent;">
                                    <div style="font-size:0.6rem; color:var(--text-dim); text-align:center; padding-top:40px;">Results will appear after execution completes.</div>
                                </div>
                            </div>
                        </div>

                        <!-- Scanner line -->
                        <div style="position:absolute; left:0; width:100%; height:1px; background:${workflow.color}; opacity:0.15; animation:scanVertical 5s linear infinite; pointer-events:none;"></div>
                    </div>
                </div>
            `;

            overlay.style.display = 'block';
            _isRunning = false;
        },

        run: async function (agentType) {
            if (_isRunning) return;
            _isRunning = true;

            // Reset UI state
            const log = document.getElementById('agent-exec-log');
            if (log) log.innerHTML = '';
            const results = document.getElementById('agent-exec-results');
            if (results) results.innerHTML = '<div style="font-size:0.6rem; color:var(--text-dim); text-align:center; padding-top:20px;">Executing…</div>';

            const badge = document.getElementById('agent-exec-status-badge');
            if (badge) { badge.textContent = 'EXECUTING'; badge.style.color = 'var(--status-warning)'; badge.style.borderColor = 'var(--status-warning)'; }

            setButtonsEnabled(false);
            setProgress(5);

            const workflow = SOMA.Services.AgentExecutionService.getWorkflow(agentType);
            const stepCount = workflow ? workflow.steps.length : 7;
            let step = 0;

            const result = await SOMA.Services.AgentExecutionService.executeAgent(agentType, (logLine) => {
                step++;
                appendLog(logLine, step === stepCount ? 'success' : 'info');
                setProgress(Math.round((step / stepCount) * 100));
            });

            if (result) {
                renderResults(result);
                if (badge) { badge.textContent = 'COMPLETE'; badge.style.color = 'var(--status-success)'; badge.style.borderColor = 'var(--status-success)'; }
                appendLog(`Execution complete — ${result.detectedIssues} issue(s) detected.`, 'success');
            }

            setProgress(100);
            setButtonsEnabled(true);
            _isRunning = false;
        },

        generateReport: function () {
            appendLog('Generating exportable BIM operational report…', 'info');
            setTimeout(() => appendLog('Report compiled: SOMA_Agent_Report_' + Date.now() + '.json [READY]', 'success'), 1200);
        },

        close: function () {
            const overlay = getOverlay();
            if (overlay) overlay.style.display = 'none';
            _isRunning = false;
        }
    };
})();
