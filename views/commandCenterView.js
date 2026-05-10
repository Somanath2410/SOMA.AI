/**
 * SOMA.AI Command Center View
 * ─────────────────────────────────────────────────────────────
 * Modular view definition.
 * Returns the HTML structure for the Command Center.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Views = window.SOMA.Views || {};

SOMA.Views.getCommandCenterView = function() {
    return `
        <div class="dc-grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
                <h2 class="hud-font" style="font-size: 2.5rem; margin-bottom: 0.5rem;">MISSION <span
                        style="color: var(--accent);">CONTROL</span></h2>
                <p style="color: var(--text-dim); margin-bottom: 2rem; font-size: 0.8rem;">Autonomous BIM Operations &
                    Health Orchestration</p>

                <div data-component="CommandBar"></div>

                <!--
                    STAT CARDS — dynamically rendered via js/app.js + data.js
                -->
                <div id="command-center-stats" class="grid-3" style="margin-bottom: 1.5rem;">
                </div>

                <div data-component="Widget" data-title="BIM Workflow Intelligence (QA/QC)" style="margin-bottom: 1.5rem;">
                    <div id="bim-intelligence-panel">
                        <div style="color: var(--text-dim); font-size: 0.75rem; font-family: monospace;">AWAITING BIM METADATA SCAN...</div>
                    </div>
                </div>

                <div data-component="Widget" data-title="BIM Coordination Orchestration" style="margin-bottom: 1.5rem;">
                    <div id="coordination-sessions-panel">
                        <div style="color: var(--text-dim); font-size: 0.75rem; font-family: monospace;">INITIALIZING COORDINATION SESSIONS...</div>
                    </div>
                </div>

                <div data-component="Widget" data-title="Live Activity Feed">
                    <div class="scroll-container" style="max-height: 200px;">
                        <div class="timeline" id="live-activity-feed">
                            <!-- Populated dynamically by app.js via events and logger -->
                        </div>
                    </div>
                </div>

                <div data-component="Widget" data-title="Runtime Orchestration Monitor" style="margin-top: 1.5rem;">
                    <div id="runtime-monitor-panel" style="font-family: monospace; font-size: 0.75rem; color: var(--text-main);">
                        <div style="color: var(--text-dim);">AWAITING TELEMETRY...</div>
                    </div>
                </div>
            </div>
            <div>
                <div class="glass view-port" style="height: 450px; margin-bottom: 1.5rem;">
                    <img src="./assets/soma_command_center_hologram_1778157836776.png"
                        style="width:100%; height:100%; object-fit:cover">
                    <div class="hud-overlay">
                        <div class="hud-tag">SCANNING: OPERATIONAL</div>
                        <div class="hud-tag" style="border-color: var(--neon-purple); color: var(--neon-purple);">AI
                            CORE: ACTIVE</div>
                    </div>
                </div>
                <div class="grid-3">
                    <div class="glass widget" style="text-align:center">
                        <div class="widget-title">Clash Reduction</div>
                        <svg class="circular-chart" viewBox="0 0 36 36">
                            <path class="circle-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="circle" stroke-dasharray="85, 100" stroke="var(--accent)"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div style="font-size: 1.2rem; font-weight: 700; margin-top: 5px;">85%</div>
                    </div>
                    <div class="glass widget" style="text-align:center">
                        <div class="widget-title">Tasks Done</div>
                        <svg class="circular-chart" viewBox="0 0 36 36">
                            <path class="circle-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="circle" stroke-dasharray="92, 100" stroke="var(--neon-purple)"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div style="font-size: 1.2rem; font-weight: 700; margin-top: 5px;">92%</div>
                    </div>
                    <div class="glass widget" style="text-align:center">
                        <div class="widget-title">Compliance</div>
                        <svg class="circular-chart" viewBox="0 0 36 36">
                            <path class="circle-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="circle" stroke-dasharray="78, 100" stroke="var(--neon-gold)"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div style="font-size: 1.2rem; font-weight: 700; margin-top: 5px;">78%</div>
                    </div>
                </div>

                <div data-component="Widget" data-title="Operational Telemetry (Semantic)" style="margin-top: 1.5rem;">
                    <div data-component="TelemetryGraph" data-id="bim-health" data-label="BIM GEOMETRY HEALTH" data-color="var(--accent)"></div>
                    <div data-component="TelemetryGraph" data-id="ai-intensity" data-label="AI CORE INTENSITY" data-color="var(--neon-purple)"></div>
                    <div data-component="TelemetryGraph" data-id="connector-stability" data-label="CONNECTOR STABILITY" data-color="var(--neon-blue)"></div>
                    <div data-component="TelemetryGraph" data-id="runtime-load" data-label="ORCHESTRATOR LOAD" data-color="var(--neon-gold)"></div>
                    <div data-component="TelemetryGraph" data-id="event-freq" data-label="EVENT THROUGHPUT" data-color="#ffffff"></div>
                </div>
            </div>
        </div>
    `;
};
