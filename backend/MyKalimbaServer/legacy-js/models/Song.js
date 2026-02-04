module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Song",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      artist: { type: DataTypes.STRING(255), allowNull: true },
      createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "created_by",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_public",
      },
    },
    {
      tableName: "songs",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );
};
