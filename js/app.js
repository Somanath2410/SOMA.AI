/**
 * SOMA.AI Application Bootstrapper
 * ─────────────────────────────────────────────────────────────
 * Centralized initialization sequence for the frontend.
 * Prepares the architecture for future async setups (APIs, WebSockets).
 * ─────────────────────────────────────────────────────────────
 */

async function initializeApp() {
    console.log('[SOMA] Bootstrapping application...');

    try {
        // 1. Render Modular Views
        // Injects layout structures before component parsing
        renderViews();

        // 2. Initialize Component Engine
        // Scans the DOM and mounts registered components (Widgets, StatCards)
        if (window.SOMA && SOMA.renderAll) {
            SOMA.renderAll();
        }

        // 2.5 Initialize Active Data Store
        if (window.SOMA && SOMA.Data) {
            SOMA.Data.ActiveBimData = SOMA.Data.MockBimData || [];
        }

        // 3. Fetch and Render Dynamic Data (Services)
        // Fetches data from the backend/API and maps to components
        await renderDashboardStats();

        // 4. Restore Application State
        // Recovers user session data from localStorage
        restoreAppState();

        // 5. Initialize Global Systems (Simulations, Telemetry, etc.)
        if (window.SOMA && SOMA.Runtime) {
            SOMA.Runtime.start();
        }

        // 6. Initialize UI Sub-Systems
        initLiveActivityFeed();
        initRuntimeMonitor();
        initTelemetryFeed();
        initFileUpload();
        initPlanForgeListeners();
        renderBimIntelligence();
        renderCoordinationOrchestration();

        // 7. Initialize Command Bus
        initCommands();

        // 8. Register Global Event Listeners (Demonstration of Decoupled Architecture)
        if (window.SOMA && SOMA.Events) {
            SOMA.Events.onEvent('CONNECTOR_CONNECTED', (payload) => {
                if (window.SOMA && SOMA.Logger) {
                    SOMA.Logger.logSystemEvent(
                        'TelemetryService',
                        `Software connected: ${payload.connectorName}`,
                        payload
                    );
                }
                
                // Update live UI feed
                renderLiveActivity({
                    message: `Software connected: ${payload.connectorName}`,
                    timestamp: payload.timestamp,
                    source: 'TelemetryService'
                });
            });

            // Listen to Runtime Engine Telemetry
            SOMA.Events.onEvent('TELEMETRY_UPDATE', (payload) => {
                renderLiveActivity({
                    message: payload.message,
                    timestamp: payload.timestamp,
                    source: payload.source
                });
            });

            // Listen to BIM Connector Imports
            SOMA.Events.onEvent('BIM_DATA_IMPORTED', (payload) => {
                if (window.SOMA && SOMA.Logger) {
                    SOMA.Logger.logInfo('ConnectorService', `BIM Data Imported: ${payload.importedElements} elements from ${payload.sourceType}`, payload);
                }
                
                renderLiveActivity({
                    message: `BIM Data Ingested: ${payload.importedElements} elements (${payload.sourceType})`,
                    timestamp: payload.timestamp,
                    source: 'ConnectorService'
                });
            });

            // Listen for Global Dataset Updates
            SOMA.Events.onEvent('DATASET_UPDATED', (data) => {
                console.log('[SOMA App] Dataset updated. Refreshing intelligence engines...');
                renderBimIntelligence();
                renderCoordinationOrchestration();
                
                // Refresh all modular components (DcAiPreviewPanel, etc)
                if (window.SOMA && SOMA.renderAll) {
                    SOMA.renderAll();
                }
            });

            // Agent Execution Results → Live Feed
            SOMA.Events.onEvent('AGENT_EXECUTION_COMPLETE', (result) => {
                renderLiveActivity({
                    message: `${result.agentLabel}: ${result.detectedIssues} issue(s) detected — ${result.executionStatus}`,
                    timestamp: result.timestamp,
                    source: result.agentLabel
                });
                if (SOMA.Logger) {
                    SOMA.Logger.logInfo(result.agentLabel, `Workflow complete. Issues: ${result.detectedIssues}`, result);
                }
            });
        }

        // 8. Finalize Navigation
        // Shows the initial route
        if (window.showView) {
            showView('home');
        }

        console.log('[SOMA] Boot sequence complete. Systems nominal.');
    } catch (e) {
        console.error('[SOMA App] Critical failure during initialization:', e);
    }
}

// -------------------------------------------------------------
// Initialization Sub-Routines
// -------------------------------------------------------------

function renderViews() {
    const ccContainer = document.getElementById('view-command-center');
    if (ccContainer && window.SOMA && SOMA.Views && SOMA.Views.getCommandCenterView) {
        ccContainer.innerHTML = SOMA.Views.getCommandCenterView();
    }
}

async function renderDashboardStats() {
    const statsContainer = document.getElementById('command-center-stats');
    if (statsContainer && window.SOMA && SOMA.Services && SOMA.Services.DashboardService) {
        try {
            const stats = await SOMA.Services.DashboardService.getDashboardStats();
            statsContainer.innerHTML = stats.map(stat => window.createStatCard(stat)).join('');
        } catch (e) {
            console.error('[SOMA App] Error rendering dashboard stats:', e);
        }
    }
}

function restoreAppState() {
    if (!window.SOMA || !SOMA.State) return;
    
    const state = SOMA.State.get();
    
    // Restore connectors
    if (state.connectors) {
        for (const name in state.connectors) {
            if (state.connectors[name]) {
                const btn = document.querySelector(`button[onclick*="'${name}'"]`);
                if (btn) {
                    btn.innerText = "CONNECTED";
                    btn.style.color = "#00f2ff";
                    btn.style.borderColor = "#00f2ff";
                    btn.disabled = true;
                }
            }
        }
    }
}

/**
 * Functional: Connects the hidden file input to the ConnectorService
 */
function initFileUpload() {
    const fileInput = document.getElementById('bim-file-upload');
    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !window.SOMA || !SOMA.Services.ConnectorService) return;

        try {
            renderLiveActivity({
                message: `Reading local file: ${file.name}...`,
                timestamp: Date.now(),
                source: 'System'
            });

            const summary = await SOMA.Services.ConnectorService.handleFileUpload(file);
            
            if (summary.validationStatus === 'Passed') {
                renderLiveActivity({
                    message: `IMPORT SUCCESS: ${summary.importedElements} elements processed.`,
                    timestamp: Date.now(),
                    source: 'ConnectorService'
                });
            } else {
                renderLiveActivity({
                    message: `IMPORT FAILED: ${summary.importWarnings[0]}`,
                    timestamp: Date.now(),
                    source: 'ConnectorService'
                });
            }
        } catch (err) {
            console.error('[SOMA App] File upload failure:', err);
        }
    });
}

// -------------------------------------------------------------
// Command Bus Registration
// -------------------------------------------------------------

function initCommands() {
    if (!window.SOMA || !SOMA.CommandBus) return;

    SOMA.CommandBus.registerCommand('START_TELEMETRY', 'Start Telemetry Runtime', () => {
        if (SOMA.RuntimeRegistry) SOMA.RuntimeRegistry.startRuntime('TelemetryRuntime');
    });

    SOMA.CommandBus.registerCommand('STOP_TELEMETRY', 'Stop Telemetry Runtime', () => {
        if (SOMA.RuntimeRegistry) SOMA.RuntimeRegistry.stopRuntime('TelemetryRuntime');
    });

    SOMA.CommandBus.registerCommand('RUN_BIM_SCAN', 'Execute an immediate BIM Health Scan', () => {
        if (SOMA.Logger) SOMA.Logger.logInfo('BIM_SCAN', 'Scanning Revit geometries for clashes...');
        // Simulate event emission for UI
        if (SOMA.Events) SOMA.Events.emitEvent('TELEMETRY_UPDATE', {
            source: 'System',
            message: 'Initiated full BIM geometry scan.',
            timestamp: Date.now()
        });
    });

    SOMA.CommandBus.registerCommand('RESTART_RUNTIME', 'Restart the entire Orchestration Engine', () => {
        if (SOMA.Runtime) {
            SOMA.Runtime.stop();
            setTimeout(() => SOMA.Runtime.start(), 1000);
        }
    });

    SOMA.CommandBus.registerCommand('ACTIVATE_AI_AGENT', 'Deploy a specific AI Agent', (payload) => {
        const agent = payload && payload.agent ? payload.agent : 'Generic Agent';
        if (SOMA.Logger) SOMA.Logger.logSystemEvent('AI_DEPLOYMENT', `Activating agent: ${agent}`);
    });

    SOMA.CommandBus.registerCommand('EXECUTE_AGENT', 'Execute a BIM AI Agent workflow', async (payload) => {
        const agentType = payload && payload.agentType ? payload.agentType : 'qaqc';
        if (window.SOMA && SOMA.AgentPanel) {
            SOMA.AgentPanel.open(agentType);
            await SOMA.AgentPanel.run(agentType);
        }
    });

    SOMA.CommandBus.registerCommand('RUN_BIM_QC', 'Run an automated BIM QA/QC Metadata analysis', () => {
        if (SOMA.Logger) SOMA.Logger.logInfo('BIM_QC', 'Initiating model metadata intelligence scan...');
        renderBimIntelligence();
        renderCoordinationOrchestration();
        if (SOMA.Events) {
            SOMA.Events.emitEvent('TELEMETRY_UPDATE', {
                source: 'BimQcService',
                message: 'BIM Workflow Intelligence: Coordination Sync Complete.',
                timestamp: Date.now()
            });
        }
    });

    SOMA.CommandBus.registerCommand('IMPORT_BIM_DATA', 'Simulate BIM data ingestion from JSON/CSV', async (payload) => {
        if (!window.SOMA || !SOMA.Services.ConnectorService) return;
        
        const type = payload && payload.type ? payload.type : 'JSON';
        let data = [];

        if (type === 'CSV') {
            data = "id,discipline,category,status\nCL-001,MEP,Duct,Clash\nCL-002,ST,Beam,Open\nCL-003,AR,Wall,Resolved";
        } else {
            data = [
                { id: "REVIT-001", discipline: "AR", category: "Walls", healthStatus: "healthy" },
                { id: "REVIT-002", discipline: "ME", category: "Pipes", healthStatus: "critical" },
                { id: "REVIT-003", discipline: "ST", category: "Columns", healthStatus: "healthy" }
            ];
        }

        const summary = await SOMA.Services.ConnectorService.importBimDataset(data, type);
        console.log('[SOMA] Import completed:', summary);
    });

    // PlanForge AI Commands
    SOMA.CommandBus.registerCommand('GENERATE_PLAN', 'AI: Generate conceptual spatial layout', async (payload) => {
        if (!window.SOMA || !SOMA.Services.PlanForgeService) return;
        const prompt = payload && payload.prompt ? payload.prompt : 'Generic Layout';
        await SOMA.Services.PlanForgeService.processPromptInput(prompt);
    });

    SOMA.CommandBus.registerCommand('OPTIMIZE_FLOW', 'AI: Optimize circulation and adjacency', () => {
        if (SOMA.Services.PlanForgeService) SOMA.Services.PlanForgeService.optimizeLayout();
    });

    SOMA.CommandBus.registerCommand('UPLOAD_SKETCH', 'AI: Analyze hand-drawn sketch', async (payload) => {
        if (SOMA.Services.PlanForgeService && payload.file) {
            await SOMA.Services.PlanForgeService.processSketchUpload(payload.file);
        }
    });

    SOMA.CommandBus.registerCommand('UPLOAD_REF', 'AI: Analyze architectural reference image', async (payload) => {
        if (SOMA.Services.PlanForgeService && payload.file) {
            await SOMA.Services.PlanForgeService.processReferenceImage(payload.file);
        }
    });
}

function initPlanForgeListeners() {
    if (!window.SOMA || !SOMA.Events) return;

    SOMA.Events.onEvent('PLAN_CONCEPT_GENERATED', (concept) => {
        renderLiveActivity({
            message: `AI: Generated "${concept.prompt}" concept. Efficiency: ${concept.metrics.efficiency}`,
            timestamp: Date.now(),
            source: 'PlanForgeAI'
        });
        if (SOMA.renderAll) SOMA.renderAll();
    });

    SOMA.Events.onEvent('PLAN_CONCEPT_UPDATED', (concept) => {
        renderLiveActivity({
            message: `AI: Optimized circulation flow. New Efficiency: ${concept.metrics.circulationEfficiency}%`,
            timestamp: Date.now(),
            source: 'PlanForgeAI'
        });
        if (SOMA.renderAll) SOMA.renderAll();
    });
}

function renderCoordinationOrchestration() {
    const panel = document.getElementById('coordination-sessions-panel');
    if (!panel || !window.SOMA || !SOMA.Services.CoordinationSessionService) return;

    const sessions = SOMA.Services.CoordinationSessionService.createCoordinationSessions();
    const summary = SOMA.Services.CoordinationSessionService.getSessionSummary();

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
            <div>
                <div style="font-size: 0.55rem; color: var(--text-dim); text-transform: uppercase;">Active Sessions</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--text-main);">${summary.totalSessions}</div>
            </div>
            <div>
                <div style="font-size: 0.55rem; color: var(--text-dim); text-transform: uppercase;">Urgent Triage</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--status-critical);">${summary.urgentSessions}</div>
            </div>
            <div>
                <div style="font-size: 0.55rem; color: var(--text-dim); text-transform: uppercase;">Avg. Resolution</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--status-success);">${summary.overallProgress}%</div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${sessions.map(session => `
                <div class="glass" style="padding: 10px; border-radius: 4px; background: rgba(0,0,0,0.2); border-left: 2px solid ${session.priority === 'Urgent' ? 'var(--status-critical)' : 'var(--accent)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div>
                            <span style="font-size: 0.6rem; color: var(--text-dim); font-family: monospace;">${session.sessionId}</span>
                            <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">${session.coordinationType}</div>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.55rem; padding: 2px 6px; border-radius: 10px; background: ${session.priority === 'Urgent' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 242, 255, 0.1)'}; color: ${session.priority === 'Urgent' ? 'var(--status-critical)' : 'var(--accent)'}; font-weight: bold; text-transform: uppercase;">${session.priority}</span>
                        </div>
                    </div>

                    <div style="font-size: 0.65rem; color: var(--text-dim); margin-bottom: 8px;">
                        Systems: <span style="color: var(--text-main)">${session.affectedSystems}</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="flex-grow: 1; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
                            <div style="width: ${session.resolutionProgress}%; height: 100%; background: var(--status-success); box-shadow: 0 0 5px var(--status-success);"></div>
                        </div>
                        <span style="font-size: 0.6rem; color: var(--text-dim); min-width: 25px;">${session.resolutionProgress}%</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        <span style="color: var(--text-dim);">Issues: <span style="color: var(--text-main)">${session.issueCount}</span></span>
                        <span style="color: var(--text-dim);">Complexity: <span style="color: var(--text-main)">${session.coordinationComplexity}</span></span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBimIntelligence() {
    const panel = document.getElementById('bim-intelligence-panel');
    if (!panel || !window.SOMA || !SOMA.Services.BimQcService) return;

    const report = SOMA.Services.BimQcService.analyzeModelHealth();
    const grouped = SOMA.Services.BimQcService.getIssuesByDiscipline();

    const scoreColor = report.healthScore > 80 ? 'var(--status-success)' : (report.healthScore > 50 ? 'var(--status-warning)' : 'var(--status-critical)');

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
                <div style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Model Health Score</div>
                <div style="font-size: 2.2rem; font-weight: bold; color: ${scoreColor}; font-family: 'Orbitron';">${report.healthScore}%</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase;">Total Issues</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--text-main);">${report.totalIssues}</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem;">
            ${Object.keys(grouped).map(discipline => {
                const count = grouped[discipline].length;
                const criticalCount = grouped[discipline].filter(i => i.severity === 'critical').length;
                return `
                    <div class="glass" style="padding: 8px; border-radius: 4px; background: rgba(255,255,255,0.03);">
                        <div style="font-size: 0.6rem; color: var(--accent); font-weight: bold;">${discipline.toUpperCase()}</div>
                        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                            <span style="font-size: 0.8rem; color: var(--text-main);">${count} issues</span>
                            ${criticalCount > 0 ? `<span style="font-size: 0.6rem; color: var(--status-critical); font-weight: bold;">${criticalCount} CRIT</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem;">
            <div style="font-size: 0.6rem; color: var(--text-dim); margin-bottom: 8px; letter-spacing: 1px;">INTELLIGENT RESOLUTION WORKFLOWS</div>
            ${SOMA.Services.BimQcService.prioritizeIssues().slice(0, 3).map(issue => {
                const workflow = SOMA.Services.BimResolutionService.generateResolutionWorkflow(issue);
                return `
                    <div class="glass" style="margin-bottom: 12px; padding: 10px; border-radius: 4px; border-left: 3px solid ${issue.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)'}; background: rgba(0,0,0,0.2);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: bold; color: var(--text-main); font-size: 0.8rem;">${issue.issueType}</span>
                                    <span style="color: var(--text-dim); font-size: 0.6rem; font-family: monospace; background: rgba(255,255,255,0.05); padding: 1px 4px; border-radius: 2px;">${issue.affectedElement}</span>
                                </div>
                                <div style="color: var(--text-dim); font-size: 0.7rem; margin-top: 2px;">${issue.description}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.5rem; color: var(--text-dim); text-transform: uppercase;">Owner</div>
                                <div style="font-size: 0.65rem; color: var(--accent); font-weight: bold;">${workflow.disciplineOwner}</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 15px; margin: 8px 0; font-size: 0.6rem; text-transform: uppercase; color: var(--text-dim);">
                            <span>Impact: <span style="color: var(--text-main)">${workflow.impact}</span></span>
                            <span>Difficulty: <span style="color: var(--text-main)">${workflow.difficulty}</span></span>
                        </div>

                        <div style="background: rgba(0,242,255,0.03); padding: 6px; border-radius: 3px; border: 1px solid rgba(0,242,255,0.1);">
                            <div style="font-size: 0.55rem; color: var(--accent); font-weight: bold; margin-bottom: 4px; letter-spacing: 0.5px;">SUGGESTED RESOLUTION STEPS:</div>
                            <ul style="margin: 0; padding-left: 12px; font-size: 0.65rem; color: var(--text-main); line-height: 1.4;">
                                ${workflow.suggestedActions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// -------------------------------------------------------------
// Live Activity Feed UI logic
// -------------------------------------------------------------

function initLiveActivityFeed() {
    const feed = document.getElementById('live-activity-feed');
    if (!feed) return;
    
    // Populate from logger history (useful if user navigates away and back)
    if (window.SOMA && SOMA.Logger) {
        const history = SOMA.Logger.getHistory().reverse().slice(0, 10);
        history.forEach(log => {
            renderLiveActivity({
                message: log.message,
                timestamp: log.timestamp || Date.now(),
                source: log.source
            }, true); // append flag
        });
    }
}

function renderLiveActivity(activity, append = false) {
    const feed = document.getElementById('live-activity-feed');
    if (!feed) return;
    
    const item = document.createElement('div');
    item.className = 'timeline-item';
    
    const timeStr = new Date(activity.timestamp).toLocaleTimeString();
    
    item.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-main);">${activity.message}</div>
        <div style="font-size: 0.6rem; color: var(--text-dim);">${timeStr} • ${activity.source}</div>
    `;
    
    if (append) {
        feed.appendChild(item);
    } else {
        item.style.animation = 'fadeIn 0.5s ease-out';
        feed.insertBefore(item, feed.firstChild);
    }
    
    // Keep feed to max 10 items to prevent DOM bloat
    if (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
    }
}

// -------------------------------------------------------------
// Runtime Monitor UI logic
// -------------------------------------------------------------

function initRuntimeMonitor() {
    // Update monitor every 1 second to reflect runtime engine state
    setInterval(updateRuntimeMonitor, 1000);
}

function updateRuntimeMonitor() {
    const panel = document.getElementById('runtime-monitor-panel');
    if (!panel) return;

    let registryStats = { totalRegistered: 0, totalRunning: 0 };
    let schedulerStats = { totalTicks: 0, activeTasks: 0 };
    let loggerStats = { totalLogs: 0 };
    let eventStats = { totalEmitted: 0 };

    if (window.SOMA && SOMA.RuntimeRegistry) registryStats = SOMA.RuntimeRegistry.getStats();
    if (window.SOMA && SOMA.Scheduler) schedulerStats = SOMA.Scheduler.getStats();
    if (window.SOMA && SOMA.Logger) loggerStats = SOMA.Logger.getStats();
    if (window.SOMA && SOMA.Events) eventStats = SOMA.Events.getStats();

    panel.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
            <div>
                <span style="color: var(--text-dim);">ACTIVE RUNTIMES:</span>
                <span style="color: var(--neon-purple); font-weight: bold; margin-left: 5px;">${registryStats.totalRunning} / ${registryStats.totalRegistered}</span>
            </div>
            <div>
                <span style="color: var(--text-dim);">SYSTEM STATUS:</span>
                <span style="color: var(--accent); font-weight: bold; margin-left: 5px;">NOMINAL</span>
            </div>
            <div>
                <span style="color: var(--text-dim);">ORCHESTRATOR TICKS:</span>
                <span style="color: var(--text-main); font-weight: bold; margin-left: 5px;">${schedulerStats.totalTicks}</span>
            </div>
            <div>
                <span style="color: var(--text-dim);">ACTIVE TASKS:</span>
                <span style="color: var(--text-main); font-weight: bold; margin-left: 5px;">${schedulerStats.activeTasks}</span>
            </div>
            <div>
                <span style="color: var(--text-dim);">EVENTS EMITTED:</span>
                <span style="color: var(--text-main); font-weight: bold; margin-left: 5px;">${eventStats.totalEmitted}</span>
            </div>
            <div>
                <span style="color: var(--text-dim);">SYSTEM LOGS:</span>
                <span style="color: var(--text-main); font-weight: bold; margin-left: 5px;">${loggerStats.totalLogs}</span>
            </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; margin-top: 0.5rem;">
            <div style="color: var(--text-dim); margin-bottom: 5px;">RUNTIME TOPOLOGY</div>
            ${Object.keys(window.SOMA && SOMA.RuntimeRegistry ? SOMA.RuntimeRegistry.getAllRuntimes() : {}).map(id => {
                const rt = SOMA.RuntimeRegistry.getAllRuntimes()[id];
                const color = rt.status === 'running' ? 'var(--accent)' : 'var(--text-dim)';
                return `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span style="color: var(--text-main);">${id}</span>
                        <span style="color: ${color};">[${rt.status.toUpperCase()}]</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// -------------------------------------------------------------
// Telemetry Data Feed logic
// -------------------------------------------------------------

function initTelemetryFeed() {
    let lastEventCount = 0;
    
    // We use the same frequency as the runtime monitor for consistency
    setInterval(() => {
        if (!window.SOMA || !SOMA.Events) return;

        // 1. BIM Telemetry (Fluctuates based on active connectors)
        // Semantic: Higher connector count and active dashboard runtime = higher health
        const connectors = SOMA.State ? Object.values(SOMA.State.get().connectors || {}).filter(v => v).length : 0;
        const bimHealthBase = 0.75 + (connectors * 0.05); 
        const bimHealth = Math.min(0.99, bimHealthBase + (Math.random() * 0.04 - 0.02));
        SOMA.Events.emitEvent('TELEMETRY_DATA_UPDATE', { metricId: 'bim-health', value: bimHealth });

        // 2. Runtime Telemetry (Orchestrator Load)
        // Semantic: Calculated from active tasks in Scheduler vs capacity
        const schedStats = SOMA.Scheduler ? SOMA.Scheduler.getStats() : { activeTasks: 0 };
        const runtimeLoad = Math.min(1.0, (schedStats.activeTasks / 15) + (Math.random() * 0.05));
        SOMA.Events.emitEvent('TELEMETRY_DATA_UPDATE', { metricId: 'runtime-load', value: runtimeLoad });

        // 3. Event Telemetry (Throughput / Frequency)
        // Semantic: Delta of total events emitted since last tick
        const eventStats = SOMA.Events ? SOMA.Events.getStats() : { totalEmitted: 0 };
        const eventDelta = eventStats.totalEmitted - lastEventCount;
        lastEventCount = eventStats.totalEmitted;
        const eventFreq = Math.min(1.0, (eventDelta / 10) + (Math.random() * 0.05));
        SOMA.Events.emitEvent('TELEMETRY_DATA_UPDATE', { metricId: 'event-freq', value: eventFreq });

        // 4. AI Telemetry (Simulated based on Command History)
        // Semantic: High if commands were executed recently in the Command Bus
        const cmdHistory = SOMA.CommandBus ? SOMA.CommandBus.commandHistory() : [];
        const recentCmds = cmdHistory.filter(h => Date.now() - h.timestamp < 10000).length;
        const aiIntensity = Math.min(1.0, (recentCmds / 5) + (Math.random() * 0.1));
        SOMA.Events.emitEvent('TELEMETRY_DATA_UPDATE', { metricId: 'ai-intensity', value: aiIntensity });

        // 5. Connector Telemetry (Stability)
        // Semantic: Percentage of possible connectors that are active
        const connectorStability = Math.min(1.0, (connectors / 4) + (Math.random() * 0.05));
        SOMA.Events.emitEvent('TELEMETRY_DATA_UPDATE', { metricId: 'connector-stability', value: connectorStability });
        
    }, 1000);
}

// -------------------------------------------------------------
// Interactive Behaviors
// -------------------------------------------------------------

function connectSoftware(btn, name) {
    btn.innerText = "CONNECTING...";
    setTimeout(() => {
        btn.innerText = "CONNECTED";
        btn.style.color = "#00f2ff";
        btn.style.borderColor = "#00f2ff";
        btn.disabled = true;
        
        // Persist connection state
        if (window.SOMA && SOMA.State) {
            SOMA.State.update('connectors', { [name]: true });
        }
        
        // Emit global event
        if (window.SOMA && SOMA.Events) {
            SOMA.Events.emitEvent('CONNECTOR_CONNECTED', {
                connectorName: name,
                timestamp: Date.now()
            });

            // Trigger BIM ingestion specifically for Revit
            if (name === 'Revit' && SOMA.CommandBus) {
                SOMA.CommandBus.executeCommand('IMPORT_BIM_DATA', { type: 'JSON' });
            }
        }
    }, 1500);
}

function startPlanForge() {
    const status = document.getElementById('planforge-status');
    const img = document.getElementById('planforge-img');
    status.style.display = 'block';
    status.innerText = "[ SOMA BRAIN: OPTIMIZING LAYOUT... ]";
    img.style.opacity = "0.3";
    setTimeout(() => {
        status.innerText = "[ LAYOUT GENERATED SUCCESSFULLY ]";
        status.style.color = "#00f2ff";
        img.style.opacity = "1";
        img.style.filter = "hue-rotate(90deg)";
    }, 3000);
}

// -------------------------------------------------------------
// Boot Application
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', initializeApp);