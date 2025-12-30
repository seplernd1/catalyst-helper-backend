const axios = require("axios");

/**
 * Shared axios instance
 */
const http = axios.create({
  timeout: 10000 // 10 seconds
});

/**
 * Safe GET with retry & backoff
 */
async function safeGet(url, config = {}, retries = 2) {
  try {
    return await http.get(url, config);
  } catch (err) {
    const status = err.response?.status;
    const retryable =
      err.code === "ECONNRESET" ||
      err.code === "ETIMEDOUT" ||
      status === 429 ||
      status === 502 ||
      status === 503;

    if (retryable && retries > 0) {
      console.warn(
        `[HTTP] Retry ${3 - retries} for ${url} (status=${status || err.code})`
      );
      await new Promise(r => setTimeout(r, 1500));
      return safeGet(url, config, retries - 1);
    }

    throw err;
  }
}

module.exports = {
  safeGet
};
