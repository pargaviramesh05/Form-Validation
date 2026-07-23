-- =====================================================================
-- FormApp Database Schema (MySQL 8+)
-- =====================================================================
-- Run this file first to create the database and all tables.
-- Usage:  mysql -u root -p < schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS formapp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE formapp_db;

-- ---------------------------------------------------------------------
-- Table: admins
-- Stores admin login credentials. Password is ALWAYS stored as a
-- bcrypt hash -- never plain text. The application seeds the first
-- admin automatically on server startup (see backend/utils/seedAdmin.js)
-- using ADMIN_USERNAME / ADMIN_PASSWORD from the backend .env file.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) DEFAULT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admins_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Table: submissions
-- Stores every public form submission.
-- Extend this table with whatever fields your real form needs --
-- the columns below cover a typical contact / application form.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(150)  NOT NULL,
  email        VARCHAR(190)  NOT NULL,
  phone        VARCHAR(20)   DEFAULT NULL,
  subject      VARCHAR(200)  DEFAULT NULL,
  message      TEXT          NOT NULL,
  status       ENUM('new','reviewed','resolved') NOT NULL DEFAULT 'new',
  ip_address   VARCHAR(45)   DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_submissions_created_at (created_at),
  INDEX idx_submissions_email (email),
  INDEX idx_submissions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Table: admin_activity_log (optional but useful for auditing)
-- Foreign key demonstrates a proper relational link back to admins.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id     INT UNSIGNED NOT NULL,
  action       VARCHAR(100) NOT NULL,
  details      VARCHAR(255) DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_admin
    FOREIGN KEY (admin_id) REFERENCES admins(id)
    ON DELETE CASCADE,
  INDEX idx_activity_admin_id (admin_id),
  INDEX idx_activity_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
