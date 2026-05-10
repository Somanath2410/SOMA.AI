/**
 * SOMA.AI Layout Generation Service
 * ─────────────────────────────────────────────────────────────
 * Generates geometric room blocks and layout topologies based 
 * on conceptual requirements and prompts.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.LayoutGenerationService = (function() {

    // Templates for different planning concepts
    const TEMPLATES = {
        '2BHK': [
            { name: 'Living Room', type: 'Habitable', width: 5, height: 6, x: 0, y: 0 },
            { name: 'Bedroom 1', type: 'Habitable', width: 4, height: 4, x: 5, y: 0 },
            { name: 'Bedroom 2', type: 'Habitable', width: 4, height: 4, x: 5, y: 4 },
            { name: 'Kitchen', type: 'Service', width: 3, height: 4, x: 0, y: 6 },
            { name: 'Dining', type: 'Habitable', width: 3, height: 4, x: 3, y: 6 },
            { name: 'Corridor', type: 'Circulation', width: 1, height: 10, x: 4, y: 0 }
        ],
        'OFFICE': [
            { name: 'Open Office', type: 'Habitable', width: 12, height: 10, x: 0, y: 0 },
            { name: 'Meeting Room', type: 'Habitable', width: 4, height: 4, x: 12, y: 0 },
            { name: 'Manager Cabin', type: 'Habitable', width: 4, height: 3, x: 12, y: 4 },
            { name: 'Server Room', type: 'Service', width: 4, height: 3, x: 12, y: 7 },
            { name: 'Reception', type: 'Habitable', width: 4, height: 5, x: -4, y: 0 },
            { name: 'Core/Lifts', type: 'Service', width: 4, height: 5, x: -4, y: 5 }
        ],
        'DATA_CENTER': [
            { name: 'Data Hall A', type: 'Service', width: 15, height: 20, x: 0, y: 0 },
            { name: 'UPS Room', type: 'Service', width: 5, height: 10, x: 15, y: 0 },
            { name: 'Battery Room', type: 'Service', width: 5, height: 10, x: 15, y: 10 },
            { name: 'Staging Area', type: 'Service', width: 10, height: 5, x: 0, y: 20 },
            { name: 'NOC Room', type: 'Habitable', width: 5, height: 5, x: 10, y: 20 }
        ]
    };

    return {
        /**
         * Generates a set of room blocks based on a concept name
         */
        generateRoomBlocks: function(concept) {
            const templateKey = Object.keys(TEMPLATES).find(k => concept.toUpperCase().includes(k)) || '2BHK';
            return TEMPLATES[templateKey].map(block => ({
                ...block,
                id: `BL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
            }));
        },

        /**
         * Simulates layout optimization (randomizing offsets slightly)
         */
        optimizeSpatialFlow: function(blocks) {
            return blocks.map(b => ({
                ...b,
                x: b.x + (Math.random() * 0.2 - 0.1),
                y: b.y + (Math.random() * 0.2 - 0.1)
            }));
        },

        /**
         * Generates a zoning overlay visualization
         */
        generateZoningOverlay: function(blocks) {
            // Colors per functional zone
            const zoneColors = {
                'Habitable': 'rgba(0, 242, 255, 0.2)',
                'Service': 'rgba(255, 159, 10, 0.2)',
                'Circulation': 'rgba(175, 82, 222, 0.2)',
                'Exterior': 'rgba(48, 209, 88, 0.2)'
            };

            return blocks.map(b => ({
                ...b,
                color: zoneColors[b.type] || 'rgba(255,255,255,0.1)'
            }));
        }
    };
})();
