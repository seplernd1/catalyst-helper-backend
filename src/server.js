require("dotenv").config();
const app = require("./app");

// Priority 1: Catalyst Port, Priority 2: Standard Env Port, Priority 3: Local Dev 3000
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 3000;

/* ===============================
   START SERVER
================================ */
// Added '0.0.0.0' to ensure the server binds to all interfaces, which is often required in PaaS environments
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log("====================================");
  console.log(" ThingsBoard Hierarchy Backend");
  console.log(` Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log("====================================");
});

/* ===============================
   GRACEFUL ERROR HANDLING
================================ */
process.on("unhandledRejection", err => {
  console.error("[UNHANDLED REJECTION]", err);
});

process.on("uncaughtException", err => {
  console.error("[UNCAUGHT EXCEPTION]", err);
  server.close(() => process.exit(1));
});
