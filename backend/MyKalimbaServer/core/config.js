require("dotenv").config();

function intFromEnv(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  var parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolFromEnv(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  var s = String(value).trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
  if (s === "false" || s === "0" || s === "no" || s === "n") return false;
  return fallback;
}

function stringFromEnv(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function decodeBase64Env(value) {
  if (!value) return "";
  try {
    return Buffer.from(String(value), "base64").toString("utf8");
  } catch (_) {
    return "";
  }
}

module.exports = {
  env: process.env.NODE_ENV || "development",
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: intFromEnv(process.env.MYSQL_PORT, 3306),
    database:
      process.env.MYSQL_DATABASE || process.env.MYSQL_DB || "kalimba_db",
    user: process.env.MYSQL_USER || process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    ssl: boolFromEnv(process.env.MYSQL_SSL, false),
    sslRejectUnauthorized: boolFromEnv(
      process.env.MYSQL_SSL_REJECT_UNAUTHORIZED,
      true,
    ),
    sslCa:
      decodeBase64Env(process.env.MYSQL_SSL_CA_BASE64) ||
      stringFromEnv(process.env.MYSQL_SSL_CA, ""),
  },
  auth: {
    jwtSecret:
      process.env.JWT_SECRET ||
      process.env.SECRET_KEY ||
      "dev_secret_change_me",
    jwtExpiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES
      ? String(intFromEnv(process.env.ACCESS_TOKEN_EXPIRE_MINUTES, 30)) + "m"
      : process.env.JWT_EXPIRES_IN || "30m",
  },
  db: {
    sync: String(process.env.DB_SYNC || "").toLowerCase() === "true",
    logging: String(process.env.DB_LOGGING || "").toLowerCase() === "true",
    timezone: process.env.DB_TIMEZONE || "+07:00",
  },
};
