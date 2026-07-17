-- Additive, idempotent GitHub identity schema for MySQL 8.x.
SET @schema_name = DATABASE();

SET @statement = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='user' AND COLUMN_NAME='github_id'
  ),
  'SELECT 1',
  'ALTER TABLE `user` ADD COLUMN `github_id` BIGINT NULL'
);
PREPARE github_column_stmt FROM @statement;
EXECUTE github_column_stmt;
DEALLOCATE PREPARE github_column_stmt;

SET @statement = IF(
  EXISTS(
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='user'
      AND COLUMN_NAME='github_id' AND NON_UNIQUE=0
  ),
  'SELECT 1',
  'CREATE UNIQUE INDEX `uq_user_github_id` ON `user` (`github_id`)'
);
PREPARE github_index_stmt FROM @statement;
EXECUTE github_index_stmt;
DEALLOCATE PREPARE github_index_stmt;
