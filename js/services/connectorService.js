/**
 * SOMA.AI BIM Connector Service v1
 * ─────────────────────────────────────────────────────────────
 * Handles BIM data ingestion, validation, and normalization.
 * Connects external BIM datasets (JSON, CSV, APS) to SOMA's
 * intelligence and coordination layers.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Services = window.SOMA.Services || {};

SOMA.Services.ConnectorService = (function() {

    // Internal simulation of source-specific field mappings
    const DISCIPLINE_MAPPING = {
        'AR': 'Architecture',
        'ST': 'Structural',
        'ME': 'MEP',
        'DC': 'Data Center',
        'CIV': 'Civil',
        'ARCH': 'Architecture',
        'MEP': 'MEP',
        'STR': 'Structural'
    };

    /**
     * Functional: Handles the browser's File API to read a dataset
     */
    async function handleFileUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const type = file.name.endsWith('.csv') ? 'CSV' : 'JSON';
                const summary = await SOMA.Services.ConnectorService.importBimDataset(content, type);
                resolve(summary);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });
    }

    /**
     * Functional: Validates if the imported dataset meets SOMA BIM schema
     */
    function validateImportedData(data) {
        if (!data || !Array.isArray(data)) return { valid: false, error: 'Dataset must be an array.' };
        if (data.length === 0) return { valid: false, error: 'Dataset is empty.' };
        
        // Critical BIM parameters check
        const sample = data[0];
        const required = ['id', 'discipline'];
        const missing = required.filter(k => !(k in sample));
        
        if (missing.length > 0) {
            return { valid: false, error: `Missing critical BIM parameters: ${missing.join(', ')}` };
        }
        return { valid: true };
    }

    /**
     * Functional: Standardizes imported elements for SOMA engines
     */
    function normalizeImportedElements(data) {
        return data.map(el => {
            const normalized = {
                ...el,
                discipline: mapDisciplineData(el.discipline || el.Discipline),
                healthStatus: el.healthStatus || (el.Status === 'Critical' ? 'critical' : 'healthy'),
                importedAt: Date.now()
            };
            
            // Handle DC specific normalization if missing
            if (normalized.discipline === 'Data Center' && !normalized.category) {
                normalized.category = 'Specialty Equipment';
            }
            
            return normalized;
        });
    }

    /**
     * Functional: Processes CSV strings into JSON objects
     */
    function parseCsvDataset(csvContent) {
        const lines = csvContent.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h] = values[i] ? values[i].trim() : null);
            return obj;
        });
    }

    /**
     * Generates a standardized import summary object
     */
    function generateImportSummary(data, type, validationStatus) {
        const disciplines = new Set(data.map(item => item.discipline));
        const issues = data.filter(item => item.healthStatus === 'critical' || item.severity === 'critical').length;

        return {
            sourceType: type,
            disciplineCount: disciplines.size,
            issueCount: issues,
            importedElements: data.length,
            validationStatus: validationStatus.valid ? 'Passed' : 'Failed',
            importWarnings: validationStatus.error ? [validationStatus.error] : [],
            timestamp: Date.now()
        };
    }

    return {
        /**
         * Main entry point for BIM data ingestion (Supports real file content)
         */
        importBimDataset: async function(sourceData, type = 'JSON') {
            console.log(`[ConnectorService] Processing REAL ${type} ingestion...`);
            
            let data = [];
            
            try {
                // 1. Parsing Phase
                if (type === 'CSV') {
                    data = parseCsvDataset(sourceData);
                } else {
                    data = typeof sourceData === 'string' ? JSON.parse(sourceData) : sourceData;
                }

                // 2. Validation Phase
                const validationStatus = validateImportedData(data);
                if (!validationStatus.valid) {
                    return generateImportSummary(data, type, validationStatus);
                }

                // 3. Normalization Phase
                const normalizedData = normalizeImportedElements(data);

                // 4. State Update: Inject into SOMA Data Store
                if (window.SOMA && SOMA.Data) {
                    SOMA.Data.ActiveBimData = normalizedData;
                    console.log(`[ConnectorService] Injected ${normalizedData.length} elements into ActiveBimData.`);
                }

                // 5. Summarization Phase
                const summary = generateImportSummary(normalizedData, type, validationStatus);
                
                // Emit completion event for runtimes/UI
                if (window.SOMA && SOMA.Events) {
                    SOMA.Events.emitEvent('BIM_DATA_IMPORTED', summary);
                    SOMA.Events.emitEvent('DATASET_UPDATED', normalizedData);
                }

                return summary;
            } catch (e) {
                console.error('[ConnectorService] Critical Import Failure:', e);
                return { validationStatus: 'Failed', error: e.message };
            }
        },

        handleFileUpload: handleFileUpload,
        validateImportedData: validateImportedData,
        normalizeImportedElements: normalizeImportedElements,
        parseCsvDataset: parseCsvDataset,
        mapDisciplineData: mapDisciplineData
    };
})();
