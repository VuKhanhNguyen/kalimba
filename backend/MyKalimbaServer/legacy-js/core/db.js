var Sequelize = require("sequelize");
var config = require("./config");

function buildDialectOptions() {
  var opts = {
    timezone: config.db.timezone,
  };

  if (config.mysql && config.mysql.ssl) {
    opts.ssl = {
      rejectUnauthorized: Boolean(config.mysql.sslRejectUnauthorized),
    };
    if (config.mysql.sslCa) {
      opts.ssl.ca = config.mysql.sslCa;
    }
  }

  return opts;
}

var sequelize = new Sequelize.Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: "mysql",
    timezone: config.db.timezone,
    dialectOptions: buildDialectOptions(),
    logging: config.db.logging ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
};
