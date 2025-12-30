const { getAllCustomers } = require("./customer.service");
const { getChildCustomers } = require("./relation.service");
const {
  getDevicesByCustomer,
  getAssetsByCustomer
} = require("./entity.service");
const {
  getDeviceAttributes,
  getLatestTelemetry
} = require("./deviceData.service");

/* ===============================
   GLOBAL STATE (RESET PER CALL)
================================ */
let CUSTOMER_MAP = {};
let ADJ = {};
let IN_DEGREE = {};
let USED_IN_TREE = new Set();

/* ===============================
   BUILD CUSTOMER GRAPH
================================ */
async function buildCustomerGraph(customers) {
  // initialize all known customers
  customers.forEach(c => {
    const id = c.id.id;
    ADJ[id] = [];
    IN_DEGREE[id] = 0;
  });

  for (const c of customers) {
    const fromId = c.id.id;
    let children = [];

    try {
      children = await getChildCustomers(fromId);
    } catch {
      continue;
    }

    // SAFETY: if fromId somehow missing, skip
    if (!ADJ[fromId]) {
      ADJ[fromId] = [];
    }

    for (const toId of children) {
      // SAFETY: skip relations to unknown customers
      if (!CUSTOMER_MAP[toId]) {
        console.warn(
          `[Hierarchy] Ignoring relation to unknown customer ${toId}`
        );
        continue;
      }

      ADJ[fromId].push(toId);
      IN_DEGREE[toId] = (IN_DEGREE[toId] || 0) + 1;
    }
  }
}


/* ===============================
   ENRICH DEVICES (SEQUENTIAL)
================================ */
async function enrichDevices(devices, options) {
  for (const device of devices) {
    if (options.includeDeviceAttributes) {
      try {
        device.attributes = await getDeviceAttributes(device.id);
      } catch {
        device.attributes = {};
      }
    }

    if (options.includeDeviceTelemetry) {
      try {
        device.telemetry = await getLatestTelemetry(device.id);
      } catch {
        device.telemetry = {};
      }
    }
  }
}



/* ===============================
   BUILD TREE NODE
================================ */
async function buildTree(customerId, options, path = new Set()) {
  if (path.has(customerId)) return null;
  path.add(customerId);

  USED_IN_TREE.add(customerId);
  const customer = CUSTOMER_MAP[customerId];

  /* ===============================
     FETCH DATA ONCE
  ================================ */
  let assets = [];
  let devices = [];

  if (options.includeAssets) {
    assets = await getAssetsByCustomer(customerId);
  }

  if (options.includeDevices) {
    devices = await getDevicesByCustomer(customerId);

    // 🔥 ENRICH DEVICES ONCE (VERY IMPORTANT)
    await enrichDevices(devices, options);
  }

  /* ===============================
     MAP DEVICES → ASSETS
  ================================ */
  if (options.includeAssets && options.includeDevices) {
    const assetMap = {};
    assets.forEach(a => {
      a.devices = [];
      assetMap[a.id] = a;
    });

    devices.forEach(d => {
      if (d.assetId && assetMap[d.assetId]) {
        assetMap[d.assetId].devices.push(d);
      }
    });

    // keep only devices without asset at customer level
    devices = devices.filter(d => !d.assetId);
  }

  /* ===============================
     CHILD CUSTOMERS
  ================================ */
  const children = [];
  for (const childId of ADJ[customerId] || []) {
    if (USED_IN_TREE.has(childId)) continue;

    const childTree = await buildTree(
      childId,
      options,
      new Set(path)
    );
    if (childTree) children.push(childTree);
  }

  return {
    id: customerId,
    name: customer.name,
    assets,
    devices,
    children
  };
}


/* ===============================
   MAIN ENTRY
================================ */
async function getFullHierarchy(options = {}) {
  CUSTOMER_MAP = {};
  ADJ = {};
  IN_DEGREE = {};
  USED_IN_TREE = new Set();

  /* -------- LOAD CUSTOMERS -------- */
  const customers = await getAllCustomers();
  customers.forEach(c => {
    CUSTOMER_MAP[c.id.id] = c;
  });

  /* -------- BUILD GRAPH -------- */
  await buildCustomerGraph(customers);

  /* -------- ROOTS -------- */
  let roots = Object.keys(IN_DEGREE).filter(id => IN_DEGREE[id] === 0);
  if (roots.length === 0) {
    roots = Object.keys(CUSTOMER_MAP);
  }

  /* -------- BUILD TREE -------- */
  const trees = [];
  for (const rootId of roots) {
    const tree = await buildTree(rootId, options);
    if (tree) trees.push(tree);
  }

  /* -------- ORPHANS -------- */
  const orphans = Object.keys(CUSTOMER_MAP)
    .filter(id => !USED_IN_TREE.has(id))
    .map(id => ({
      id,
      name: CUSTOMER_MAP[id].name,
      assets: [],
      devices: [],
      children: []
    }));

  if (orphans.length) {
    trees.push({
      id: "ORPHAN_CUSTOMERS",
      name: "ORPHAN_CUSTOMERS",
      assets: [],
      devices: [],
      children: orphans
    });
  }

  return {
    name: "Tenant",
    tree: {
      children: trees
    },
    stats: {
      totalCustomers: customers.length,
      mainGroups: roots.length,
      orphanCustomers: orphans.length
    }
  };
}

module.exports = {
  getFullHierarchy
};
