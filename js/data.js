/**
 * SOMA.AI Data Layer
 * ─────────────────────────────────────────────────────────────
 * Centralized data storage for the SOMA dashboard.
 * Simulates an external API or backend BIM database.
 * ─────────────────────────────────────────────────────────────
 */

window.dashboardStats = [
    {
        title: "BIM Health Score",
        value: "98.4%",
        color: "success",
        status: "Optimal",
        animationFlag: true
    },
    {
        title: "Hours Saved",
        value: "1,420",
        color: "",
        status: "Active",
        animationFlag: false
    },
    {
        title: "AI Agents",
        value: "12/12",
        color: "",
        status: "Online",
        animationFlag: false
    }
];

window.SOMA = window.SOMA || {};
window.SOMA.Data = window.SOMA.Data || {};
window.SOMA.Data.ActiveBimData = [];
