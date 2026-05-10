/**
 * SOMA.AI BIM Coordination Session Intelligence
 * ─────────────────────────────────────────────────────────────
 * Organizes raw BIM issues into structured, manageable coordination sessions.
 * Helps BIM leads prioritize meetings and track resolution progress.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.CoordinationSessionService = (function() {

    return {
        /**
         * Groups detected issues into logical coordination sessions
         */
        createCoordinationSessions: function() {
            const qcResult = SOMA.Services.BimQcService.analyzeModelHealth();
            const issues = qcResult.issues;
            const sessions = [];

            // 1. Group by Discipline and Type
            const disciplineMap = {};
            issues.forEach(issue => {
                if (!disciplineMap[issue.discipline]) disciplineMap[issue.discipline] = [];
                disciplineMap[issue.discipline].push(issue);
            });

            // 2. Generate Session objects
            Object.keys(disciplineMap).forEach((discipline, index) => {
                const discIssues = disciplineMap[discipline];
                const criticalCount = discIssues.filter(i => i.severity === 'critical').length;
                
                // Determine coordination type based on discipline
                let coordType = 'General Coordination';
                if (discipline === 'MEP') coordType = 'MEP Routing Review';
                if (discipline === 'Structural') coordType = 'Structural Clash Review';
                if (discipline === 'Architecture') coordType = 'Documentation QA';
                if (discipline === 'Data Center') coordType = 'Rack & Power Coordination';

                sessions.push({
                    sessionId: `SESS-${200 + index}`,
                    discipline: discipline,
                    priority: criticalCount > 0 ? 'Urgent' : 'Routine',
                    coordinationType: coordType,
                    issueCount: discIssues.length,
                    affectedSystems: [...new Set(discIssues.map(i => i.issueType))].join(', '),
                    resolutionProgress: Math.round(Math.random() * 30), // Simulate initial progress
                    coordinationComplexity: discIssues.length > 2 ? 'High' : 'Moderate'
                });
            });

            return sessions;
        },

        /**
         * Generates a high-level summary of the coordination state
         */
        getSessionSummary: function() {
            const sessions = this.createCoordinationSessions();
            return {
                totalSessions: sessions.length,
                urgentSessions: sessions.filter(s => s.priority === 'Urgent').length,
                overallProgress: Math.round(sessions.reduce((acc, s) => acc + s.resolutionProgress, 0) / sessions.length)
            };
        }
    };
})();
