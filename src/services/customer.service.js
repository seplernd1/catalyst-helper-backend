const { TB_URL } = require("../config/thingsboard");
const { getToken } = require("./auth.service");
const { safeGet } = require("./http");

/**
 * Fetch all customers for the tenant
 * (pagination-safe)
 */
async function getAllCustomers() {
  const token = await getToken();

  let page = 0;
  let hasNext = true;
  const customers = [];

  while (hasNext) {
    const res = await safeGet(
      `${TB_URL}/api/customers?pageSize=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.data?.data?.length) {
      customers.push(...res.data.data);
    }

    hasNext = res.data.hasNext === true;
    page++;
  }

  console.log(`[CustomerService] Loaded ${customers.length} customers`);
  return customers;
}

module.exports = {
  getAllCustomers
};
