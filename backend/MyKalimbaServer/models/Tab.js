module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Tab",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      songId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "song_id",
      },
      createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "created_by",
      },
      instrument: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "kalimba",
      },
      format: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "text",
      },
      content: { type: DataTypes.TEXT("long"), allowNull: false },
      baseNote: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "base_note",
      },
      keysCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "keys_count",
      },
      arrangement: { type: DataTypes.STRING(50), allowNull: true },
      labelType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "label_type",
      },
      soundfont: { type: DataTypes.STRING(100), allowNull: true },
      version: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: "tabs",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );
};
