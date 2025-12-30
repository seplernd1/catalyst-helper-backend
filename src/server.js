require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

/* ===============================
   START SERVER
================================ */
const server = app.listen(PORT, () => {
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
