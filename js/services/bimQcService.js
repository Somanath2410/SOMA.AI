/**
 * SOMA.AI BIM QA/QC Intelligence Engine v1
 * ─────────────────────────────────────────────────────────────
 * Analyzes model metadata to detect coordination and health issues.
 * This service forms the bridge between raw BIM data and SOMA's
 * operational intelligence dashboards.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.BimQcService = (function() {
    
    /**
     * Internal logic to identify issues based on BIM metadata rules
     */
    function scanForIssues(data) {
        const issues = [];
        
        data.forEach(element => {
            // 1. Check for tagging violations
            if (element.discipline === 'Architecture' && element.tagged === false) {
                issues.push({
                    id: `ISSUE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    discipline: element.discipline,
                    severity: 'warning',
                    issueType: 'Missing Tag',
                    affectedElement: element.id,
                    description: `${element.category} element is missing a required room/identification tag.`,
                    recommendation: 'Verify tag association in Revit properties or use SOMA Auto-Tag tool.'
                });
            }

            // 2. Check for MEP connectivity issues
            if (element.discipline === 'MEP' && element.connected === false) {
                issues.push({
                    id: `ISSUE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    discipline: element.discipline,
                    severity: 'critical',
                    issueType: 'Disconnected System',
                    affectedElement: element.id,
                    description: `Open connector detected on ${element.category}. System calculations (Airflow/Hydraulic) are currently invalid.`,
                    recommendation: 'Close connector or snap to adjacent element to complete the circuit.'
                });
            }

            // 3. Check for naming standard violations
            if (element.healthStatus === 'critical' && element.comments.includes('naming')) {
                issues.push({
                    id: `ISSUE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    discipline: element.discipline,
                    severity: 'critical',
                    issueType: 'Naming Violation',
                    affectedElement: element.id,
                    description: `Element "${element.type}" does not follow the project's BEP naming convention.`,
                    recommendation: 'Rename family/type according to the BIM Execution Plan standards.'
                });
            }

            // 4. Check for coordination/clearance issues
            if (element.clearance && element.clearance < 300) {
                issues.push({
                    id: `ISSUE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    discipline: element.discipline,
                    severity: 'warning',
                    issueType: 'Clearance Violation',
                    affectedElement: element.id,
                    description: `Insufficient maintenance/structural clearance (${element.clearance}mm) detected.`,
                    recommendation: 'Relocate element or adjust structural layout to maintain 300mm minimum clearance.'
                });
            }

            // 5. Check for duplicate elements
            if (element.comments && element.comments.includes('Duplicate')) {
                issues.push({
                    id: `ISSUE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    discipline: element.discipline,
                    severity: 'critical',
                    issueType: 'Duplicate Element',
                    affectedElement: element.id,
                    description: 'Redundant element detected at the exact same spatial coordinates.',
                    recommendation: 'Perform "Select All Instances" and delete the duplicate element to avoid double-counting in schedules.'
                });
            }

            // 6. Check for Data Center rack spacing violations
            if (element.discipline === 'Data Center' && element.comments && element.comments.includes('spacing')) {
                issues.push({
                    id: `ISSUE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    discipline: element.discipline,
                    severity: 'warning',
                    issueType: 'Spacing Violation',
                    affectedElement: element.id,
                    description: `Insufficient rack spacing detected: ${element.comments}.`,
                    recommendation: 'Adjust rack layout to ensure minimum cold aisle width of 1200mm.'
                });
            }
        });

        return issues;
    }

    return {
        /**
         * Analyzes the model health and returns a summary object
         */
        analyzeModelHealth: function() {
            const data = (window.SOMA && SOMA.Data && SOMA.Data.ActiveBimData) || SOMA.Data.MockBimData || [];
            const issues = scanForIssues(data);
            
            const totalElements = data.length;
            const issueCount = issues.length;
            const criticalCount = issues.filter(i => i.severity === 'critical').length;
            
            // Calculate a basic health score (0-100)
            const healthScore = Math.max(0, 100 - (criticalCount * 15) - ((issueCount - criticalCount) * 5));

            return {
                healthScore: Math.round(healthScore),
                totalElements: totalElements,
                totalIssues: issueCount,
                criticalIssues: criticalCount,
                issues: issues
            };
        },

        /**
         * Returns issues grouped by discipline
         */
        getIssuesByDiscipline: function() {
            const result = this.analyzeModelHealth();
            const grouped = {};

            result.issues.forEach(issue => {
                if (!grouped[issue.discipline]) grouped[issue.discipline] = [];
                grouped[issue.discipline].push(issue);
            });

            return grouped;
        },

        /**
         * Prioritizes issues (Critical first)
         */
        prioritizeIssues: function() {
            const result = this.analyzeModelHealth();
            return result.issues.sort((a, b) => {
                if (a.severity === 'critical' && b.severity !== 'critical') return -1;
                if (a.severity !== 'critical' && b.severity === 'critical') return 1;
                return 0;
            });
        }
    };
})();
