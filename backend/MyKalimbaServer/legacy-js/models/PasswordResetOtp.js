module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "PasswordResetOtp",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "user_id",
      },
      otpHash: {
        type: DataTypes.STRING(128),
        allowNull: false,
        field: "otp_hash",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at",
      },
      consumedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "consumed_at",
      },
      sentToEmail: {
        type: DataTypes.STRING(254),
        allowNull: false,
        field: "sent_to_email",
      },
      sendIp: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: "send_ip",
      },
      attempts: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "attempts",
      },
    },
    {
      tableName: "password_reset_otps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
};
