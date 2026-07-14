-- Idempotent, non-destructive migration for anonymous identities and revocation.
-- MySQL 8.x. The existing user, post and like rows are preserved.

SET @schema_name = DATABASE();

SET @statement = IF(
    EXISTS(
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @schema_name
          AND TABLE_NAME = 'user'
          AND COLUMN_NAME = 'is_guest'
    ),
    'SELECT 1',
    'ALTER TABLE `user` ADD COLUMN `is_guest` TINYINT(1) NOT NULL DEFAULT 0'
);
PREPARE guest_fields_stmt FROM @statement;
EXECUTE guest_fields_stmt;
DEALLOCATE PREPARE guest_fields_stmt;

SET @statement = IF(
    EXISTS(
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @schema_name
          AND TABLE_NAME = 'user'
          AND COLUMN_NAME = 'guest_public_name'
    ),
    'SELECT 1',
    'ALTER TABLE `user` ADD COLUMN `guest_public_name` VARCHAR(50) NULL'
);
PREPARE guest_fields_stmt FROM @statement;
EXECUTE guest_fields_stmt;
DEALLOCATE PREPARE guest_fields_stmt;

SET @statement = IF(
    EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @schema_name
          AND TABLE_NAME = 'user'
          AND INDEX_NAME = 'uq_user_guest_public_name'
    ),
    'SELECT 1',
    'CREATE UNIQUE INDEX `uq_user_guest_public_name` ON `user` (`guest_public_name`)'
);
PREPARE guest_fields_stmt FROM @statement;
EXECUTE guest_fields_stmt;
DEALLOCATE PREPARE guest_fields_stmt;

CREATE TABLE IF NOT EXISTS `revoked_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jti` VARCHAR(36) NOT NULL,
    `revoked_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_revoked_token_jti` (`jti`)
) ENGINE=InnoDB;
