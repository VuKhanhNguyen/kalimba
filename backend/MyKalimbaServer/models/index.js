var db = require("../core/db");

var User = require("./User")(db.sequelize, db.Sequelize.DataTypes);
var Song = require("./Song")(db.sequelize, db.Sequelize.DataTypes);
var Tab = require("./Tab")(db.sequelize, db.Sequelize.DataTypes);

User.hasMany(Song, { foreignKey: "createdBy", as: "songs" });
Song.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Song.hasMany(Tab, { foreignKey: "songId", as: "tabs" });
Tab.belongsTo(Song, { foreignKey: "songId", as: "song" });

User.hasMany(Tab, { foreignKey: "createdBy", as: "tabs" });
Tab.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

module.exports = {
  sequelize: db.sequelize,
  Sequelize: db.Sequelize,
  User: User,
  Song: Song,
  Tab: Tab,
};
