module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      passwordHash: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: "password_hash",
      },
      email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: "full_name",
      },
      phoneNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: "phone_number",
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      avatarUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: "avatar_url",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "banned"),
        allowNull: false,
        defaultValue: "active",
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );
};
