require('dotenv').config();

function intFromEnv(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  var parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: intFromEnv(process.env.MYSQL_PORT, 3306),
    database: process.env.MYSQL_DATABASE || process.env.MYSQL_DB || 'kalimba_db',
    user: process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || ''
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || process.env.SECRET_KEY || 'dev_secret_change_me',
    jwtExpiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES
      ? String(intFromEnv(process.env.ACCESS_TOKEN_EXPIRE_MINUTES, 30)) + 'm'
      : (process.env.JWT_EXPIRES_IN || '30m')
  },
  db: {
    sync: String(process.env.DB_SYNC || '').toLowerCase() === 'true',
    logging: String(process.env.DB_LOGGING || '').toLowerCase() === 'true'
  }
};
