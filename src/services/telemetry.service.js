const { TB_URL } = require("../config/thingsboard");
const { getToken } = require("./auth.service");
const { safeGet } = require("./http");

/**
 * Fetch latest telemetry values for a device
 * @param {string} deviceId
 * @param {string[]} keys
 */
async function getLatestTelemetry(deviceId, keys = []) {
  if (!keys.length) return {};

  const token = await getToken();

  const res = await safeGet(
    `${TB_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keys.join(
      ","
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const telemetry = {};
  for (const key of Object.keys(res.data || {})) {
    if (res.data[key]?.length) {
      telemetry[key] = {
        value: res.data[key][0].value,
        ts: res.data[key][0].ts
      };
    }
  }

  return telemetry;
}

module.exports = {
  getLatestTelemetry
};
