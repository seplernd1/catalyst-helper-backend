const { TB_URL } = require("../config/thingsboard");
const { getToken } = require("./auth.service");
const { safeGet } = require("./http");

/* ===============================
   ATTRIBUTE & TELEMETRY KEY SETS
================================ */

// attribute keys (server + client + shared combined)
const ATTRIBUTE_KEYS = new Set([
    // --- server attributes ---
    //   "accessControl",
    //   "timeLock",
    //   "imei_id",
    //   "nbgName",
    //   "deviceName",
    //   "zoName",
    //   "type",
    //   "gatewayAlarmCreatedTime",
    //   "notification",
    //   "lastActivityTime",
    //   "usage_history",
    //   "lowDurationCameras",
    //   "lastConnectTime",
    //   "lastDisconnectTime",
    //   "ias",
    //   "cctv",
    //   "gateway",
    //   "active",
    //   "inactivityAlarmTime",
    //   "fas",
    //   "bas",
    //   "deviceType",
    //   "nvrType",
    //   "cctvAlarmCreatedTime",
    //   "gatewayType",
    //   "integratedType",
    //   "iasAlarmCreatedTime",
    //   "iasSystem",
    //   "iasHealth",
    //   "status",
    //   "iasStatus",
    //   "cctvStatus",
    //   "cameraStatus",
    //   "cameraLinkStatus",
    //   "hddStatus",
    //   "integratedStatus",
    //   "gatewayStatus",
    //   "nvrStatus",
    //   "branchName",
    //   "gwStatus",
    //   "gwHealth",
    //   "basSystem",
    //   "timeLockDoor",
    //   "fasSystem",
    //   "basStatus",
    //   "accessControlHealth",
    //   "basHealth",
    //   "fasStatus",
    //   "accessControlStatus",
    //   "fasHealth",
    //   "timeLockHealth",
    //   "accessControlDoor",
    //   "care",
    //   "sw_id",
    //   "provisionState",


    "accessControl",
    "timeLock",
    "imei_id",
    "nbgName",
    "deviceName",
    "zoName",
    "type",
    "undefined",
    "gatewayAlarmCreatedTime",
    "notification",
    "lastActivityTime",
    "Inactive Device(Intrusion)",
    "Total System(Time Lock)",
    "Inactive Device(Time Lock)",
    "Healthy Device(Intrusion)",
    "Faulty Device(Time Lock)",
    "Healthy Device(Time Lock)",
    "Faulty Device(Intrusion)",
    "Total System(Intrusion)",
    "usage_history",
    "lowDurationCameras",
    "lastConnectTime",
    "lastDisconnectTime",
    "ias",
    "cctv",
    "gateway",
    "active",
    "inactivityAlarmTime",
    "fas",
    "bas",
    "deviceType",
    "nvrType",
    "cctvAlarmCreatedTime",
    "gatewayType",
    "integratedType",
    "iasAlarmCreatedTime",
    "iasSystem",
    "iasHealth",
    "status",
    "iasStatus",
    "cctvStatus",
    "cameraStatus",
    "cameraLinkStatus",
    "hddStatus",
    "integratedStatus",
    "DVR/NVR OFF",
    "DVR/NVR ON",
    "gatewayStatus",
    "nvrStatus",
    "branchName",
    "NETWORK",
    "dvrNvrOff_history",
    "POWER OFF",
    "SYSTEM ON",
    "gwStatus",
    "INTEGRATED ALARM SYSTEM ACTIVE",
    "INTEGRATED ALARM SYSTEM ACTIVATION RESTORED",
    "INTEGRATED ALARM SYSTEM FAULT CONDITION RESTORED",
    "INTEGRATED ALARM SYSTEM OFF",
    "INTEGRATED ALARM SYSTEM ON",
    "CAMERA TAMPER", "CAMERA TAMPERED RESTORED",
    "BATTERY LOW",
    "gwHealth",
    "MAINS ON",
    "CAMERA DISCONNECT",
    "CAMERA CONNECTION ESTABLISHED",
    "HDD ERROR",
    "HDD ERROR RESTORED",
    "cameraTamperCH1_history",
    "cameraTamperCH2_history",
    "cameraTamperCH3_history",
    "cameraTamperCH4_history",
    "cameraTamperCH5_history",
    "cameraTamperCH6_history",
    "cameraTamperCH7_history",
    "cameraTamperCH8_history",
    "cameraTamperCH9_history",
    "cameraTamperCH10_history",
    "cameraTamperCH11_history",
    "cameraTamperCH12_history",
    "cameraTamperCH13_history",
    "cameraTamperCH14_history",
    "cameraTamperCH15_history",
    "cameraTamperCH16_history",
    "cameraDisconnectCH1_history",
    "cameraDisconnectCH2_history",
    "cameraDisconnectCH3_history",
    "cameraDisconnectCH4_history",
    "cameraDisconnectCH5_history",
    "cameraDisconnectCH6_history",
    "cameraDisconnectCH7_history",
    "cameraDisconnectCH8_history",
    "cameraDisconnectCH9_history",
    "cameraDisconnectCH10_history",
    "cameraDisconnectCH11_history",
    "cameraDisconnectCH12_history",
    "cameraDisconnectCH13_history",
    "cameraDisconnectCH14_history",
    "cameraDisconnectCH15_history",
    "cameraDisconnectCH16_history",
    "hddError_history",
    "basOff_history",
    "basFault_history",
    "fasOff_history",
    "fasFault_history",
    "tlsOff_history",
    "tlsTamper_history",
    "tlsDoorOpen_history",
    "acsOff_history",
    "acsTamper_history",
    "acsDoorOpen_history",
    "iasOff_history",
    "iasFault_history",
    "basSystem",
    "timeLockDoor",
    "fasSystem",
    "basStatus",
    "accessControlHealth",
    "basHealth",
    "fasStatus",
    "accessControlStatus",
    "fasHealth",
    "timeLockHealth",
    "accessControlDoor",
    "care",
    "sw_id",
    "provisionState",

    // --- client attributes ---
    "Dahua_NVR_deviceAllInfo",
    "Dahua_NVR_cameraInfo",
    "Dahua_NVR_Hardware_Version",
    "Dahua_NVR_Firmware_Version",
    "Dahua_NVR_Model",
    "Dahua_NVR_Processor",
    "Dahua_NVR_DeviceType",
    "Dahua_NVR_SerialNumber",

    // --- shared attributes ---
    "sw_version",
    "sw_tag",
    "sw_checksum",
    "sw_checksum_algorithm",
    "sw_title",
    "sw_size"
]);

// telemetry keys (latest)
const TELEMETRY_KEYS = new Set([
    "rockAI",
    "TotalLat",
    "TotalLon",
    "alerts",
    "attribute",
    "cpu",
    "disk",
    "frequency",
    "lat1",
    "lon1",
    "cameraStatus",
    "camera_tampered_last",
    "camera_disconnect_last",
    "branch_id",
    "battery_status",
    "arrLon",
    "arrLat",
    "ac_status"
]);

/* ===============================
   FETCH ATTRIBUTES (REAL ONES)
================================ */
async function getDeviceAttributes(deviceId) {
    const token = await getToken();

    const res = await safeGet(
        `${TB_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    const server = {};
    const client = {};
    const shared = {};

    for (const attr of res.data || []) {
        if (!ATTRIBUTE_KEYS.has(attr.key)) continue;

        if (attr.scope === "SERVER_SCOPE") server[attr.key] = attr.value;
        if (attr.scope === "CLIENT_SCOPE") client[attr.key] = attr.value;
        if (attr.scope === "SHARED_SCOPE") shared[attr.key] = attr.value;
    }

    return { server, client, shared };
}

/* ===============================
   FETCH LATEST TELEMETRY (REAL)
================================ */
async function getLatestTelemetry(deviceId) {
    const token = await getToken();

    // Fetch ALL latest telemetry (no assumptions)
    const res = await safeGet(
        `${TB_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    const telemetry = {};

    if (!res.data || typeof res.data !== "object") {
        return telemetry;
    }

    for (const [key, values] of Object.entries(res.data)) {
        if (!TELEMETRY_KEYS.has(key)) continue;

        if (Array.isArray(values) && values.length > 0) {
            telemetry[key] = {
                value: values[0].value,
                ts: values[0].ts
            };
        }
    }

    const { normalizeTelemetry } = require("./telemetryNormalizer");

    return normalizeTelemetry(telemetry);

}

module.exports = {
    getDeviceAttributes,
    getLatestTelemetry
};
