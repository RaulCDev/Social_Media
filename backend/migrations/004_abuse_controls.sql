-- Additive, idempotent abuse-control schema for MySQL 8.x.
SET @schema_name = DATABASE();

SET @statement = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='user' AND COLUMN_NAME='status'), 'SELECT 1', 'ALTER TABLE `user` ADD COLUMN `status` VARCHAR(16) NOT NULL DEFAULT ''active''');
PREPARE abuse_stmt FROM @statement; EXECUTE abuse_stmt; DEALLOCATE PREPARE abuse_stmt;
SET @statement = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='user' AND COLUMN_NAME='role'), 'SELECT 1', 'ALTER TABLE `user` ADD COLUMN `role` VARCHAR(16) NOT NULL DEFAULT ''member''');
PREPARE abuse_stmt FROM @statement; EXECUTE abuse_stmt; DEALLOCATE PREPARE abuse_stmt;
SET @statement = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='user' AND COLUMN_NAME='last_seen_at'), 'SELECT 1', 'ALTER TABLE `user` ADD COLUMN `last_seen_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
PREPARE abuse_stmt FROM @statement; EXECUTE abuse_stmt; DEALLOCATE PREPARE abuse_stmt;

SET @statement = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='post' AND COLUMN_NAME='is_hidden'), 'SELECT 1', 'ALTER TABLE `post` ADD COLUMN `is_hidden` TINYINT(1) NOT NULL DEFAULT 0');
PREPARE abuse_stmt FROM @statement; EXECUTE abuse_stmt; DEALLOCATE PREPARE abuse_stmt;
SET @statement = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='post' AND COLUMN_NAME='hidden_at'), 'SELECT 1', 'ALTER TABLE `post` ADD COLUMN `hidden_at` DATETIME NULL');
PREPARE abuse_stmt FROM @statement; EXECUTE abuse_stmt; DEALLOCATE PREPARE abuse_stmt;
SET @statement = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='post' AND COLUMN_NAME='hidden_by'), 'SELECT 1', 'ALTER TABLE `post` ADD COLUMN `hidden_by` INT NULL');
PREPARE abuse_stmt FROM @statement; EXECUTE abuse_stmt; DEALLOCATE PREPARE abuse_stmt;

CREATE TABLE IF NOT EXISTS `abuse_rate_limit_bucket` (
  `id` INT NOT NULL AUTO_INCREMENT, `identity_type` VARCHAR(8) NOT NULL,
  `identity_hash` VARCHAR(64) NOT NULL, `action` VARCHAR(16) NOT NULL,
  `window_start` DATETIME NOT NULL, `request_count` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_abuse_limit_identity_action_window`
    (`identity_type`, `identity_hash`, `action`, `window_start`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `content_report` (
  `id` INT NOT NULL AUTO_INCREMENT, `reporter_id` INT NOT NULL,
  `post_id` INT NOT NULL, `reason` VARCHAR(280) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'open',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_report_reporter_post` (`reporter_id`, `post_id`),
  CONSTRAINT `fk_report_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_report_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB;
