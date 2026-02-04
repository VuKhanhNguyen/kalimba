import * as db from "../core/db";

import defineUser from "./User";
import defineSong from "./Song";
import defineTab from "./Tab";
import definePasswordResetOtp from "./PasswordResetOtp";

const DataTypes: any = (db.Sequelize as any).DataTypes;

export const User = defineUser(db.sequelize, DataTypes);
export const Song = defineSong(db.sequelize, DataTypes);
export const Tab = defineTab(db.sequelize, DataTypes);
export const PasswordResetOtp = definePasswordResetOtp(db.sequelize, DataTypes);

User.hasMany(Song, { foreignKey: "createdBy", as: "songs" });
Song.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Song.hasMany(Tab, { foreignKey: "songId", as: "tabs" });
Tab.belongsTo(Song, { foreignKey: "songId", as: "song" });

User.hasMany(Tab, { foreignKey: "createdBy", as: "tabs" });
Tab.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(PasswordResetOtp, { foreignKey: "userId", as: "passwordOtps" });
PasswordResetOtp.belongsTo(User, { foreignKey: "userId", as: "user" });

export const sequelize = db.sequelize;
export const Sequelize = db.Sequelize;

const models = {
  sequelize,
  Sequelize,
  User,
  Song,
  Tab,
  PasswordResetOtp,
};

export default models;
