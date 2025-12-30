const express = require("express");
const router = express.Router();
const { getFullHierarchy } = require("../services/hierarchy.service");

/**
 * GET /api/hierarchy
 *
 * Query params:
 *  - includeAssets=true
 *  - includeDevices=true
 *  - includeDeviceAttributes=true
 *  - includeDeviceTelemetry=true
 */
router.get("/hierarchy", async (req, res) => {
  try {
    const options = {
      includeAssets: req.query.includeAssets === "true",
      includeDevices: req.query.includeDevices === "true",
      includeDeviceAttributes:
        req.query.includeDeviceAttributes === "true",
      includeDeviceTelemetry:
        req.query.includeDeviceTelemetry === "true"
    };

    const data = await getFullHierarchy(options);
    res.json(data);
  } catch (err) {
    console.error("[Hierarchy API Error]", err);
    res.status(500).json({
      error: "Failed to build hierarchy",
      details: err.message
    });
  }
});

module.exports = router;
