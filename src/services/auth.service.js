const axios = require("axios");
const { TB_URL, TB_USERNAME, TB_PASSWORD } = require("../config/thingsboard");

/**
 * Cached JWT token + expiry
 */
let TOKEN = null;
let TOKEN_EXPIRES_AT = 0;

/**
 * Login to ThingsBoard and fetch JWT
 */
async function login() {
  const res = await axios.post(
    `${TB_URL}/api/auth/login`,
    {
      username: TB_USERNAME,
      password: TB_PASSWORD
    },
    {
      timeout: 10000
    }
  );

  const token = res.data.token;

  // JWT expires in ~2 hours (ThingsBoard default)
  // We refresh it 5 minutes earlier for safety
  const expiresInMs = 2 * 60 * 60 * 1000; // 2 hours
  TOKEN_EXPIRES_AT = Date.now() + expiresInMs - 5 * 60 * 1000;

  TOKEN = token;

  console.log("[AUTH] ThingsBoard token refreshed");
  return TOKEN;
}

/**
 * Get valid JWT token (cached)
 */
async function getToken() {
  if (TOKEN && Date.now() < TOKEN_EXPIRES_AT) {
    return TOKEN;
  }

  return await login();
}

/**
 * Force token reset (used if TB returns 401)
 */
function resetToken() {
  TOKEN = null;
  TOKEN_EXPIRES_AT = 0;
}

module.exports = {
  getToken,
  resetToken
};
