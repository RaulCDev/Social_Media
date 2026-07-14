-- Persistent fixed-window reservations for Task 4 mutation rate limits.
-- The unique identity/action/window key plus conditional UPDATE in app.py
-- makes the configured maximum enforceable across processes and hosts.

CREATE TABLE IF NOT EXISTS `rate_limit_bucket` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `action` VARCHAR(16) NOT NULL,
    `window_start` DATETIME NOT NULL,
    `request_count` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_rate_limit_identity_action_window`
        UNIQUE (`user_id`, `action`, `window_start`),
    CONSTRAINT `fk_rate_limit_bucket_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB;
