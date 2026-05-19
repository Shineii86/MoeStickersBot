-- ═══════════════════════════════════════════════════════════════
--  MariaDB Setup for MoeStickersBot
--  Run: mysql -u root -p < scripts/setup_mariadb.sql
-- ═══════════════════════════════════════════════════════════════

-- Create database
CREATE DATABASE IF NOT EXISTS `MoeStickersBot_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create bot user (change password!)
CREATE USER IF NOT EXISTS 'moe_bot'@'localhost' IDENTIFIED BY 'CHANGE_ME_NOW';
CREATE USER IF NOT EXISTS 'moe_bot'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME_NOW';
CREATE USER IF NOT EXISTS 'moe_bot'@'%' IDENTIFIED BY 'CHANGE_ME_NOW';

-- Grant permissions
GRANT ALL PRIVILEGES ON `MoeStickersBot_db`.* TO 'moe_bot'@'localhost';
GRANT ALL PRIVILEGES ON `MoeStickersBot_db`.* TO 'moe_bot'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `MoeStickersBot_db`.* TO 'moe_bot'@'%';
FLUSH PRIVILEGES;

-- ═══════════════════════════════════════════════════════════════
--  The tables below are AUTO-CREATED by the bot on first run.
--  You do NOT need to create them manually.
--  Listed here for reference only.
-- ═══════════════════════════════════════════════════════════════

-- USE `MoeStickersBot_db`;

-- CREATE TABLE IF NOT EXISTS `line` (
--   `line_id`    VARCHAR(128),
--   `tg_id`      VARCHAR(128),
--   `tg_title`   VARCHAR(255),
--   `line_link`  VARCHAR(512),
--   `auto_emoji` BOOL
-- ) CHARACTER SET utf8mb4;

-- CREATE TABLE IF NOT EXISTS `stickers` (
--   `user_id`   BIGINT,
--   `tg_id`     VARCHAR(128),
--   `tg_title`  VARCHAR(255),
--   `timestamp` BIGINT
-- ) CHARACTER SET utf8mb4;

-- CREATE TABLE IF NOT EXISTS `properties` (
--   `name`  VARCHAR(128) PRIMARY KEY,
--   `value` VARCHAR(128)
-- ) CHARACTER SET utf8mb4;

-- INSERT IGNORE INTO `properties` (`name`, `value`) VALUES ('DB_VER', '2');
-- INSERT IGNORE INTO `properties` (`name`, `value`) VALUES ('last_line_dedup_index', '-1');
