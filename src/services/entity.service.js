const { TB_URL } = require("../config/thingsboard");
const { getToken } = require("./auth.service");
const { safeGet } = require("./http");

/* ===============================
   FETCH DEVICES BY CUSTOMER
================================ */
async function getDevicesByCustomer(customerId) {
  const token = await getToken();

  let page = 0;
  let hasNext = true;
  const devices = [];

  while (hasNext) {
    const res = await safeGet(
      `${TB_URL}/api/customer/${customerId}/devices?pageSize=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.data?.data?.length) {
      devices.push(
        ...res.data.data.map(d => ({
          id: d.id.id,
          name: d.name,
          type: d.type,
          assetId: d.assetId?.id || null
        }))
      );
    }

    hasNext = res.data.hasNext === true;
    page++;
  }

  return devices;
}

/* ===============================
   FETCH ASSETS BY CUSTOMER
================================ */
async function getAssetsByCustomer(customerId) {
  const token = await getToken();

  let page = 0;
  let hasNext = true;
  const assets = [];

  while (hasNext) {
    const res = await safeGet(
      `${TB_URL}/api/customer/${customerId}/assets?pageSize=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.data?.data?.length) {
      assets.push(
        ...res.data.data.map(a => ({
          id: a.id.id,
          name: a.name,
          type: a.type,
          devices: [] // devices will be attached later
        }))
      );
    }

    hasNext = res.data.hasNext === true;
    page++;
  }

  return assets;
}

module.exports = {
  getDevicesByCustomer,
  getAssetsByCustomer
};
