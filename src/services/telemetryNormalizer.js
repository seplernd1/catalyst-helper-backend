function safeJSON(value) {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function normalizeTelemetry(raw = {}) {
    const out = {
        health: {},
        power: {},
        location: {},
        system: {},
        raw: {} // optional fallback
    };

    for (const [key, obj] of Object.entries(raw)) {
        const value = safeJSON(obj.value);

        // CPU / DISK / MEMORY
        if (key === "cpu") out.health.cpu = Number(value);
        else if (key === "disk") out.health.disk = Number(value);
        else if (key === "memory") out.health.memory = Number(value);

        // LOCATION
        else if (key === "lat" || key === "lat1")
            out.location.lat = Number(value);
        else if (key === "lon" || key === "lon1")
            out.location.lon = Number(value);

        // BATTERY / POWER
        else if (key === "battery_status") {
            if (value?.battery_voltage !== undefined) {
                out.power.batteryVoltage = value.battery_voltage;
            }
        }

        // SYSTEM STATUS
        else if (key === "system_status") {
            out.system = value;
        } else if (key === "status") {
            out.system.status = value;
        }

        // keep raw if needed
        out.raw[key] = value;
    }

    return out;
}

module.exports = { normalizeTelemetry };
