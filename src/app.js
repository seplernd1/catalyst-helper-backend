const express = require("express");
const cors = require("cors");

const hierarchyRoutes = require("./routes/hierarchy.routes");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===============================
   ROUTES
================================ */
app.use("/api", hierarchyRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ThingsBoard Hierarchy Service",
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   404 HANDLER
================================ */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

module.exports = app;
