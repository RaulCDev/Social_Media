-- Idempotent, additive migration preventing duplicate likes per user and post.
-- MySQL 8.x. Existing rows are not changed; resolve historical duplicates before
-- applying this migration if any pair of (user_id, post_id) occurs more than once.

SET @schema_name = DATABASE();

SET @statement = IF(
    EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @schema_name
          AND TABLE_NAME = 'like'
          AND INDEX_NAME = 'uq_like_user_post'
    ),
    'SELECT 1',
    'CREATE UNIQUE INDEX `uq_like_user_post` ON `like` (`user_id`, `post_id`)'
);
PREPARE unique_like_stmt FROM @statement;
EXECUTE unique_like_stmt;
DEALLOCATE PREPARE unique_like_stmt;
