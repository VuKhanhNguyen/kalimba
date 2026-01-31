var path = require("path");
var dotenv = require("dotenv");

// Flexible env loading:
// - In production (e.g. Render), you typically set env vars in the dashboard and no .env file is needed.
// - Locally, you can keep separate files: .env.development and .env.production.
// - You can also override with DOTENV_CONFIG_PATH.
(function loadEnv() {
  var explicitPath = process.env.DOTENV_CONFIG_PATH;
  var nodeEnv = String(process.env.NODE_ENV || "development").toLowerCase();

  // Prefer env-specific file locally.
  var preferredFile =
    nodeEnv === "production" ? ".env.production" : ".env.development";
  var preferredPath = path.resolve(process.cwd(), preferredFile);

  if (explicitPath) {
    dotenv.config({ path: path.resolve(process.cwd(), String(explicitPath)) });
    return;
  }

  // Try env-specific file first; if missing, fall back to plain .env.
  var r = dotenv.config({ path: preferredPath });
  if (r && r.error) {
    dotenv.config();
  }
})();

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
  mail: {
    // Gmail SMTP (use an App Password if 2FA is enabled)
    // Prefer GMAIL_* vars, but accept legacy MAIL_* vars already used in this repo.
    gmailUser:
      process.env.GMAIL_USER ||
      process.env.MAIL_USERNAME ||
      process.env.MAIL_USER ||
      "",
    gmailAppPassword:
      process.env.GMAIL_APP_PASSWORD ||
      process.env.GMAIL_PASS ||
      process.env.MAIL_PASSWORD ||
      process.env.MAIL_PASS ||
      "",
    fromName: process.env.MAIL_FROM_NAME || "MyKalimba",
    fromEmail:
      process.env.MAIL_FROM_EMAIL ||
      process.env.MAIL_FROM ||
      process.env.GMAIL_USER ||
      process.env.MAIL_USERNAME ||
      "",
  },
};
