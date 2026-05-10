/**
 * SOMA.AI BIM Resolution Workflow Intelligence
 * ─────────────────────────────────────────────────────────────
 * Converts detected QA/QC issues into actionable coordination tasks.
 * Assigns owners, suggests technical resolutions, and calculates impact.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.BimResolutionService = (function() {

    /**
     * Map of issue types to resolution steps and impact logic
     */
    const resolutionBrain = {
        'Missing Tag': {
            suggestedActions: [
                "Select element in Revit active view.",
                "Verify Room/Space boundary configuration.",
                "Execute SOMA 'Auto-Tag' command for current level."
            ],
            difficulty: 'Low',
            impact: 'Medium (Documentation Error)'
        },
        'Disconnected System': {
            suggestedActions: [
                "Check system browser for 'Unassigned' elements.",
                "Verify connector 'System Classification' matches pipe/duct.",
                "Use 'Analyze Systems' tool to find air/fluid leaks."
            ],
            difficulty: 'Medium',
            impact: 'High (Calculation Error)'
        },
        'Naming Violation': {
            suggestedActions: [
                "Locate element in project browser.",
                "Apply BEP standard naming template.",
                "Update type parameters to match COBie requirements."
            ],
            difficulty: 'Low',
            impact: 'Low (Standard Compliance)'
        },
        'Clearance Violation': {
            suggestedActions: [
                "Review element spatial clearance against structural linked model.",
                "Verify maintenance access zone requirements in BEP.",
                "Relocate element or adjust structural penetration."
            ],
            difficulty: 'High',
            impact: 'Critical (Coordination Clash)'
        },
        'Duplicate Element': {
            suggestedActions: [
                "Select all instances of the element.",
                "Filter selection by level and location.",
                "Execute 'Remove Redundant' tool to purge duplicates."
            ],
            difficulty: 'Low',
            impact: 'High (Schedule Data Error)'
        },
        'Spacing Violation': {
            suggestedActions: [
                "Verify rack aisle width dimensions against MEP clearances.",
                "Adjust server rack placement grid.",
                "Verify PDU connectivity is maintained during relocation."
            ],
            difficulty: 'Medium',
            impact: 'Critical (Design Error)'
        }
    };

    /**
     * Maps disciplines to coordination owners
     */
    function getOwnerForDiscipline(discipline) {
        const owners = {
            'Architecture': 'Lead Architect / BIM Lead',
            'Structural': 'Structural Engineer / BIM Coord.',
            'MEP': 'MEP Systems Engineer',
            'Data Center': 'DC Facility Manager / IT Architect'
        };
        return owners[discipline] || 'General BIM Coordinator';
    }

    return {
        /**
         * Generates a full resolution workflow for a given issue
         */
        generateResolutionWorkflow: function(issue) {
            const resolutionData = resolutionBrain[issue.issueType] || {
                suggestedActions: ["Investigate issue in Revit.", "Coordinate with discipline lead."],
                difficulty: 'Unknown',
                impact: 'Uncalculated'
            };

            return {
                issueId: issue.id,
                affectedElement: issue.affectedElement,
                disciplineOwner: getOwnerForDiscipline(issue.discipline),
                priority: issue.severity === 'critical' ? 'High' : 'Medium',
                impact: resolutionData.impact,
                difficulty: resolutionData.difficulty,
                suggestedActions: resolutionData.suggestedActions,
                workflowStatus: 'Awaiting Action'
            };
        },

        /**
         * Calculates coordination impact based on issue severity and type
         */
        calculateIssueImpact: function(issue) {
            if (issue.severity === 'critical') return 'HIGH';
            return 'MODERATE';
        }
    };
})();
