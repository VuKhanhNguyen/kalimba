-- MySQL table for forgot-password OTPs
-- Used by backend/MyKalimbaServer/models/PasswordResetOtp.js

CREATE TABLE IF NOT EXISTS `password_reset_otps` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `otp_hash` VARCHAR(128) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `consumed_at` DATETIME NULL,
  `sent_to_email` VARCHAR(254) NOT NULL,
  `send_ip` VARCHAR(64) NULL,
  `attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_otps_user_created` (`user_id`, `created_at`),
  KEY `idx_password_reset_otps_user_active` (`user_id`, `consumed_at`, `expires_at`),
  CONSTRAINT `fk_password_reset_otps_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
