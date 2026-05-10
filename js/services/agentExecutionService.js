/**
 * SOMA.AI Agent Execution Service
 * ─────────────────────────────────────────────────────────────
 * Orchestrates BIM operational workflow chains for each AI agent.
 * Each agent runs a sequential pipeline of tasks, integrating with
 * existing SOMA services (BimQcService, PlanForgeService, etc.)
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.AgentExecutionService = (function () {

    // ── Workflow Definitions ──────────────────────────────────
    const WORKFLOWS = {
        coordination: {
            label: 'Coordination Agent',
            color: 'var(--accent)',
            icon: '⚡',
            steps: [
                'Connecting to coordination session registry...',
                'Scanning cross-discipline clash matrix...',
                'Evaluating MEP vs Structural interference zones...',
                'Prioritising clashes by severity and location...',
                'Generating resolution pathways...',
                'Dispatching coordination warnings to discipline leads...',
                'Workflow complete. Coordination report ready.'
            ],
            run: function (data) {
                const sessions = (window.SOMA && SOMA.Services.CoordinationSessionService)
                    ? SOMA.Services.CoordinationSessionService.createCoordinationSessions()
                    : [];
                const urgent = sessions.filter(s => s.priority === 'Urgent').length;
                return {
                    detectedIssues: sessions.reduce((s, c) => s + (c.issueCount || 0), 0),
                    criticalIssues: urgent,
                    optimizationSuggestions: [
                        'Resolve MEP-Structural clashes in Grid C3-D5 before structural pour.',
                        'Coordinate fire suppression routing with ceiling grid layout.',
                        'Schedule joint review session with MEP lead within 48 hours.'
                    ],
                    coordinationWarnings: urgent > 0
                        ? [`${urgent} urgent session(s) require immediate triage.`]
                        : ['All coordination sessions within acceptable thresholds.'],
                    workflowProgress: 100
                };
            }
        },

        mep: {
            label: 'MEP Routing Agent',
            color: 'var(--neon-purple)',
            icon: '🌀',
            steps: [
                'Initialising MEP routing intelligence...',
                'Loading active duct and pipe network topology...',
                'Analysing spatial clearance corridors...',
                'Detecting disconnected segments and open connectors...',
                'Calculating optimal re-routing paths...',
                'Validating against fire compartmentalisation rules...',
                'MEP routing analysis complete.'
            ],
            run: function (data) {
                const issues = data.filter(el =>
                    el.discipline === 'MEP' && el.connected === false).length;
                return {
                    detectedIssues: issues + 3,
                    criticalIssues: issues,
                    optimizationSuggestions: [
                        'Re-route chilled water main from Level 4 to avoid beam penetration.',
                        'Combine parallel conduit runs in Zone B to reduce coordination overhead.',
                        'Apply 150mm offset to sprinkler main at Grid 6 to clear structural rib.'
                    ],
                    coordinationWarnings: [
                        `${issues} open MEP connector(s) detected — system calculations invalid.`,
                        'Duct sizing in AHU-03 branch requires re-validation post routing.'
                    ],
                    workflowProgress: 100
                };
            }
        },

        qaqc: {
            label: 'QA/QC Agent',
            color: 'var(--status-success)',
            icon: '✅',
            steps: [
                'Initiating full model metadata scan...',
                'Checking BIM element naming conventions...',
                'Validating tagging completeness...',
                'Scanning for duplicate geometry instances...',
                'Assessing clearance and coordination violations...',
                'Calculating model health score...',
                'QA/QC report generated.'
            ],
            run: function (data) {
                const report = (window.SOMA && SOMA.Services.BimQcService)
                    ? SOMA.Services.BimQcService.analyzeModelHealth()
                    : { healthScore: 92, totalIssues: 4, criticalIssues: 1, issues: [] };
                return {
                    detectedIssues: report.totalIssues,
                    criticalIssues: report.criticalIssues,
                    optimizationSuggestions: [
                        `Model health at ${report.healthScore}% — ${report.criticalIssues} critical items require attention.`,
                        'Apply standard naming prefix to all untagged structural elements.',
                        'Run duplicate instance filter on Level 3 Architecture model.'
                    ],
                    coordinationWarnings: report.criticalIssues > 0
                        ? ['Critical QA/QC violations will block BIM submission milestone.']
                        : [],
                    workflowProgress: 100
                };
            }
        },

        structural: {
            label: 'Structural Agent',
            color: 'var(--neon-gold)',
            icon: '🏗',
            steps: [
                'Loading structural model topology...',
                'Mapping load paths and transfer beams...',
                'Checking column grid alignment vs architectural layout...',
                'Analysing slab penetration requests from MEP...',
                'Validating connection details at transfer levels...',
                'Cross-referencing with seismic/wind zone parameters...',
                'Structural analysis report ready.'
            ],
            run: function (data) {
                const structElements = data.filter(el => el.discipline === 'Structure' || el.discipline === 'Structural');
                return {
                    detectedIssues: 5,
                    criticalIssues: 1,
                    optimizationSuggestions: [
                        'Transfer beam at Grid 8 requires depth increase of 150mm for deflection compliance.',
                        'Rationalise slab penetrations in Zone C — current MEP requests exceed 12% slab area.',
                        'Confirm shear wall layout with architect before Level 6 construction package.'
                    ],
                    coordinationWarnings: [
                        'Slab penetration request at Grid D7 conflicts with primary load path.',
                        'Column offsets on Level 3 require structural engineer sign-off.'
                    ],
                    workflowProgress: 100
                };
            }
        },

        datacenter: {
            label: 'Data Center Agent',
            color: 'var(--accent)',
            icon: '🖥',
            steps: [
                'Scanning data hall rack inventory...',
                'Analysing cold aisle / hot aisle configuration...',
                'Checking rack spacing against ASHRAE A2 guidelines...',
                'Calculating PUE and thermal load distribution...',
                'Validating cable management pathways...',
                'Detecting airflow obstruction risks...',
                'Data center optimisation report ready.'
            ],
            run: function (data) {
                const dcElements = data.filter(el => el.discipline === 'Data Center');
                const critical = dcElements.filter(el => el.healthStatus === 'critical').length;
                return {
                    detectedIssues: critical + 2,
                    criticalIssues: critical,
                    optimizationSuggestions: [
                        'Implement blanking panels on racks with >2U gaps to prevent hot air recirculation.',
                        'Reposition PDU in Row C to achieve symmetrical load distribution.',
                        'Consider in-row cooling units for racks exceeding 8kW density.'
                    ],
                    coordinationWarnings: critical > 0
                        ? [`${critical} rack(s) in thermal risk zone — immediate intervention required.`]
                        : ['Thermal profile within acceptable ASHRAE A2 envelope.'],
                    workflowProgress: 100
                };
            }
        },

        spaceplanner: {
            label: 'Space Planner Agent',
            color: 'var(--neon-purple)',
            icon: '📐',
            steps: [
                'Loading spatial topology from PlanForge engine...',
                'Analysing room adjacency relationships...',
                'Calculating net-to-gross area efficiency...',
                'Evaluating circulation path compliance...',
                'Detecting underutilised zones and dead-ends...',
                'Generating optimised spatial flow recommendations...',
                'Space planning analysis complete.'
            ],
            run: function (data) {
                const concept = (window.SOMA && SOMA.Services.PlanForgeService)
                    ? SOMA.Services.PlanForgeService.getCurrentConcept()
                    : null;
                const efficiency = concept ? concept.metrics.efficiency : '78%';
                return {
                    detectedIssues: 3,
                    criticalIssues: 0,
                    optimizationSuggestions: [
                        `Current area efficiency: ${efficiency}. Target >80% for this typology.`,
                        'Merge secondary corridor with open plan area to recover 12m² of NLA.',
                        'Relocate service core 1.5m east to improve natural light penetration in Zone B.'
                    ],
                    coordinationWarnings: [
                        'Kitchen-Dining adjacency distance exceeds optimal 5m threshold.',
                        'Escape route from Bedroom 2 requires a 900mm min. corridor clearance.'
                    ],
                    workflowProgress: 100
                };
            }
        },

        sheetgen: {
            label: 'Sheet Gen Agent',
            color: 'var(--accent)',
            icon: '📄',
            steps: [
                'Scanning active Revit model for viewports...',
                'Identifying sheets missing mandatory title block data...',
                'Validating drawing scale and annotation consistency...',
                'Cross-referencing sheet index with BIM Execution Plan...',
                'Generating missing elevation and section markers...',
                'Compiling issue sheet package...',
                'Sheet generation report complete.'
            ],
            run: function (data) {
                return {
                    detectedIssues: 7,
                    criticalIssues: 2,
                    optimizationSuggestions: [
                        '14 sheets are missing revision clouds from the last design change.',
                        'Standardise viewport scales on Level Plans — mixed 1:100 / 1:200 detected.',
                        'Generate coordinated reflected ceiling plan for Levels 4-8 before tender.'
                    ],
                    coordinationWarnings: [
                        '2 sheets have conflicting sheet numbers with current issue register.',
                        'Section markers on Sheet A-201 do not match corresponding section sheets.'
                    ],
                    workflowProgress: 100
                };
            }
        }
    };

    return {
        /**
         * Executes the full workflow chain for a given agent type.
         * Returns a structured result object on completion.
         */
        executeAgent: async function (agentType, onLog) {
            const workflow = WORKFLOWS[agentType];
            if (!workflow) {
                console.error(`[AgentExecution] Unknown agent type: ${agentType}`);
                return null;
            }

            const data = (window.SOMA && SOMA.Data && SOMA.Data.ActiveBimData)
                ? SOMA.Data.ActiveBimData
                : [];

            // Stream log lines with delays to simulate execution
            for (let i = 0; i < workflow.steps.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 250));
                if (typeof onLog === 'function') onLog(workflow.steps[i]);
            }

            const result = workflow.run(data);
            result.agentType = agentType;
            result.agentLabel = workflow.label;
            result.executionStatus = 'COMPLETE';
            result.timestamp = Date.now();

            if (window.SOMA && SOMA.Events) {
                SOMA.Events.emitEvent('AGENT_EXECUTION_COMPLETE', result);
            }

            return result;
        },

        getWorkflow: (agentType) => WORKFLOWS[agentType] || null
    };
})();
