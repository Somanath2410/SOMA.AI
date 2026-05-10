/**
 * SOMA.AI Mock BIM Metadata Dataset
 * ─────────────────────────────────────────────────────────────
 * Represents raw BIM element data typically extracted from Revit/APS.
 * Used for demonstrating the BIM QA/QC Intelligence Engine.
 * ─────────────────────────────────────────────────────────────
 */

window.SOMA = window.SOMA || {};
window.SOMA.Data = window.SOMA.Data || {};

SOMA.Data.MockBimData = [
    // ARCHITECTURE
    { id: "AR-WAL-101", discipline: "Architecture", category: "Walls", family: "Basic Wall", type: "Interior - 135mm Partition", level: "Level 01", tagged: true, comments: "", healthStatus: "healthy" },
    { id: "AR-WAL-102", discipline: "Architecture", category: "Walls", family: "Basic Wall", type: "Interior - 135mm Partition", level: "Level 01", tagged: false, comments: "Missing Room Tag association", healthStatus: "warning" },
    { id: "AR-DOO-201", discipline: "Architecture", category: "Doors", family: "Single Flush", type: "0915 x 2134mm", level: "Level 01", tagged: true, comments: "", healthStatus: "healthy" },
    { id: "AR-DOO-202", discipline: "Architecture", category: "Doors", family: "Single Flush", type: "0915 x 2134mm", level: "Level 01", tagged: true, comments: "Duplicate instance detected at same coordinates", healthStatus: "critical" },
    
    // STRUCTURAL
    { id: "ST-COL-001", discipline: "Structural", category: "Structural Columns", family: "UC-Universal Column", type: "305x305x97UC", level: "Level 01", healthStatus: "healthy" },
    { id: "ST-BEA-005", discipline: "Structural", category: "Structural Framing", family: "UB-Universal Beam", type: "406x178x54UB", level: "Level 02", healthStatus: "healthy" },
    { id: "ST-BEA-006", discipline: "Structural", category: "Structural Framing", family: "UB-Universal Beam", type: "Unknown Type", level: "Level 02", healthStatus: "critical", comments: "Non-standard family naming convention used" },

    // MEP (Mechanical, Electrical, Plumbing)
    { id: "ME-DUC-501", discipline: "MEP", category: "Ducts", family: "Rectangular Duct", type: "Supply Air", level: "Level 01", system: "SA-01", connected: true, healthStatus: "healthy" },
    { id: "ME-DUC-502", discipline: "MEP", category: "Ducts", family: "Rectangular Duct", type: "Supply Air", level: "Level 01", system: "SA-01", connected: false, healthStatus: "critical", comments: "Open connector - Airflow calculation broken" },
    { id: "ME-PIP-601", discipline: "MEP", category: "Pipes", family: "Chilled Water", type: "CHW-S", level: "Level 02", system: "CHW", connected: true, healthStatus: "healthy" },
    { id: "EE-TRA-701", discipline: "MEP", category: "Cable Trays", family: "Ladder Tray", type: "600mm", level: "Level 02", clearance: 150, healthStatus: "warning", comments: "Clearance violation: < 300mm to structural beam" },

    // DATA CENTER EQUIPMENT
    { id: "DC-RAC-901", discipline: "Data Center", category: "Specialty Equipment", family: "Server Rack", type: "42U Cabinet", level: "Level 01", system: "Row A", healthStatus: "healthy" },
    { id: "DC-RAC-902", discipline: "Data Center", category: "Specialty Equipment", family: "Server Rack", type: "42U Cabinet", level: "Level 01", system: "Row A", healthStatus: "warning", comments: "Rack spacing violation: < 1200mm cold aisle" },
    { id: "DC-PDU-950", discipline: "Data Center", category: "Electrical Equipment", family: "PDU", type: "300kVA", level: "Level 01", system: "UPS-A", connected: true, healthStatus: "healthy" }
];
