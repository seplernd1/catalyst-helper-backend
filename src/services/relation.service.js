const { TB_URL } = require("../config/thingsboard");
const { getToken } = require("./auth.service");
const { safeGet } = require("./http");

/**
 * Get child customers for a customer
 */
async function getChildCustomers(customerId) {
  const token = await getToken();

  const res = await safeGet(
    `${TB_URL}/api/relations/info?fromId=${customerId}&fromType=CUSTOMER`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return (res.data || [])
    .filter(r => r.to?.entityType === "CUSTOMER")
    .map(r => r.to.id);
}

module.exports = {
  getChildCustomers
};
