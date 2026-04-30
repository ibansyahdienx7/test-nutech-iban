-- =============================================================
-- SIMS PPOB - Database Schema
-- Database: sims_ppob
-- =============================================================

CREATE DATABASE IF NOT EXISTS sims_ppob
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sims_ppob;

-- -------------------------------------------------------------
-- Table: users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT           NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)  NOT NULL,
  first_name    VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  balance       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  profile_image VARCHAR(500)  NULL,
  created_on    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: token_blacklist
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_blacklist (
  id          INT          NOT NULL AUTO_INCREMENT,
  token_hash  VARCHAR(64)  NOT NULL,
  email       VARCHAR(255) NOT NULL,
  expired_at  TIMESTAMP    NOT NULL,
  created_on  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token_hash (token_hash),
  INDEX idx_expired_at (expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: banners
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id           INT          NOT NULL AUTO_INCREMENT,
  banner_name  VARCHAR(255) NOT NULL,
  banner_image VARCHAR(500) NOT NULL,
  description  TEXT         NULL,
  created_on   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: services
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id              INT            NOT NULL AUTO_INCREMENT,
  service_code    VARCHAR(50)    NOT NULL,
  service_name    VARCHAR(255)   NOT NULL,
  service_icon    VARCHAR(500)   NOT NULL,
  service_tariff  DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
  created_on      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_service_code (service_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table: transactions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id               INT            NOT NULL AUTO_INCREMENT,
  user_id          INT            NOT NULL,
  invoice_number   VARCHAR(50)    NOT NULL,
  service_code     VARCHAR(50)    NULL,
  service_name     VARCHAR(255)   NOT NULL,
  transaction_type ENUM('TOPUP','PAYMENT') NOT NULL,
  total_amount     DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
  created_on       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoice_number (invoice_number),
  INDEX idx_user_id (user_id),
  INDEX idx_created_on (created_on),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- SEED DATA
-- =============================================================

-- -------------------------------------------------------------
-- Seed: users (password: Admin1234)
-- bcrypt hash of "Admin1234" with saltRounds=10
-- -------------------------------------------------------------
INSERT INTO users (email, first_name, last_name, password, balance) VALUES
  ('admin@simsppob.com', 'Admin', 'SIMS', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1000000.00);

-- -------------------------------------------------------------
-- Seed: banners
-- -------------------------------------------------------------
INSERT INTO banners (banner_name, banner_image, description) VALUES
  ('Banner 1',  'https://nutech-integrasi.app/dummy/banner/Banner-1.png',  'Lerem Ipsum Dolor sit amet'),
  ('Banner 2',  'https://nutech-integrasi.app/dummy/banner/Banner-2.png',  'Lerem Ipsum Dolor sit amet'),
  ('Banner 3',  'https://nutech-integrasi.app/dummy/banner/Banner-3.png',  'Lerem Ipsum Dolor sit amet'),
  ('Banner 4',  'https://nutech-integrasi.app/dummy/banner/Banner-4.png',  'Lerem Ipsum Dolor sit amet'),
  ('Banner 5',  'https://nutech-integrasi.app/dummy/banner/Banner-5.png',  'Lerem Ipsum Dolor sit amet'),
  ('Banner 6',  'https://nutech-integrasi.app/dummy/banner/Banner-6.png',  'Lerem Ipsum Dolor sit amet');

-- -------------------------------------------------------------
-- Seed: services
-- -------------------------------------------------------------
INSERT INTO services (service_code, service_name, service_icon, service_tariff) VALUES
  ('PAJAK',         'Pajak PBB',              'https://nutech-integrasi.app/dummy/logo/PBB.png',           40000.00),
  ('PLN',           'Listrik',                'https://nutech-integrasi.app/dummy/logo/Listrik.png',        10000.00),
  ('PDAM',          'PDAM Berlangganan',       'https://nutech-integrasi.app/dummy/logo/PDAM.png',           40000.00),
  ('PULSA',         'Pulsa',                  'https://nutech-integrasi.app/dummy/logo/Pulsa.png',          40000.00),
  ('PGN',           'PGN Berlangganan',        'https://nutech-integrasi.app/dummy/logo/PGN.png',            50000.00),
  ('MUSIK',         'Musik Berlangganan',      'https://nutech-integrasi.app/dummy/logo/Musik.png',          50000.00),
  ('TV',            'TV Berlangganan',         'https://nutech-integrasi.app/dummy/logo/televisi.png',       50000.00),
  ('PAKET_DATA',    'Paket data',              'https://nutech-integrasi.app/dummy/logo/Paket-data.png',     50000.00),
  ('VOUCHER_GAME',  'Voucher Game',            'https://nutech-integrasi.app/dummy/logo/Voucher-Game.png',  100000.00),
  ('VOUCHER_MAKANAN','Voucher Makanan',        'https://nutech-integrasi.app/dummy/logo/Voucher-Makanan.png',100000.00),
  ('QURBAN',        'Qurban',                 'https://nutech-integrasi.app/dummy/logo/Qurban.png',        500000.00),
  ('ZAKAT',         'Zakat',                  'https://nutech-integrasi.app/dummy/logo/Zakat.png',          300000.00);
