-- ============================================================
--  DDL - SIMS PPOB Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS sims_ppob
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sims_ppob;

-- ------------------------------------------------------------
--  Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT             NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)    NOT NULL,
  first_name    VARCHAR(100)    NOT NULL,
  last_name     VARCHAR(100)    NOT NULL,
  password      VARCHAR(255)    NOT NULL,
  profile_image VARCHAR(500)    DEFAULT NULL,
  balance       DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
  created_on    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Table: banners
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id           INT          NOT NULL AUTO_INCREMENT,
  banner_name  VARCHAR(100) NOT NULL,
  banner_image VARCHAR(500) NOT NULL,
  description  TEXT         DEFAULT NULL,
  created_on   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Table: services
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id             INT            NOT NULL AUTO_INCREMENT,
  service_code   VARCHAR(50)    NOT NULL,
  service_name   VARCHAR(100)   NOT NULL,
  service_icon   VARCHAR(500)   NOT NULL,
  service_tariff DECIMAL(15, 2) NOT NULL,
  created_on     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_code (service_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Table: transactions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id               INT            NOT NULL AUTO_INCREMENT,
  user_id          INT            NOT NULL,
  invoice_number   VARCHAR(50)    NOT NULL,
  service_code     VARCHAR(50)    DEFAULT NULL,
  service_name     VARCHAR(100)   DEFAULT NULL,
  transaction_type ENUM('TOPUP','PAYMENT') NOT NULL,
  total_amount     DECIMAL(15, 2) NOT NULL,
  created_on       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_invoice (invoice_number),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Seed: banners
-- ------------------------------------------------------------
INSERT INTO banners (banner_name, banner_image, description)
SELECT * FROM (
  SELECT 'Banner 1' AS banner_name, 'https://nutech-integrasi.app/dummy.jpg' AS banner_image, 'Lerem Ipsum Dolor sit amet' AS description UNION ALL
  SELECT 'Banner 2', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet' UNION ALL
  SELECT 'Banner 3', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet' UNION ALL
  SELECT 'Banner 4', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet' UNION ALL
  SELECT 'Banner 5', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet' UNION ALL
  SELECT 'Banner 6', 'https://nutech-integrasi.app/dummy.jpg', 'Lerem Ipsum Dolor sit amet'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM banners LIMIT 1);

-- ------------------------------------------------------------
--  Seed: services
-- ------------------------------------------------------------
INSERT INTO services (service_code, service_name, service_icon, service_tariff)
SELECT * FROM (
  SELECT 'PAJAK'          AS service_code, 'Pajak PBB'            AS service_name, 'https://nutech-integrasi.app/dummy.jpg' AS service_icon, 40000  AS service_tariff UNION ALL
  SELECT 'PLN',            'Listrik',                              'https://nutech-integrasi.app/dummy.jpg', 10000  UNION ALL
  SELECT 'PDAM',           'PDAM Berlangganan',                    'https://nutech-integrasi.app/dummy.jpg', 40000  UNION ALL
  SELECT 'PULSA',          'Pulsa',                                'https://nutech-integrasi.app/dummy.jpg', 40000  UNION ALL
  SELECT 'PGN',            'PGN Berlangganan',                     'https://nutech-integrasi.app/dummy.jpg', 50000  UNION ALL
  SELECT 'MUSIK',          'Musik Berlangganan',                   'https://nutech-integrasi.app/dummy.jpg', 50000  UNION ALL
  SELECT 'TV',             'TV Berlangganan',                      'https://nutech-integrasi.app/dummy.jpg', 50000  UNION ALL
  SELECT 'PAKET_DATA',     'Paket data',                           'https://nutech-integrasi.app/dummy.jpg', 50000  UNION ALL
  SELECT 'VOUCHER_GAME',   'Voucher Game',                         'https://nutech-integrasi.app/dummy.jpg', 100000 UNION ALL
  SELECT 'VOUCHER_MAKANAN','Voucher Makanan',                      'https://nutech-integrasi.app/dummy.jpg', 100000 UNION ALL
  SELECT 'QURBAN',         'Qurban',                               'https://nutech-integrasi.app/dummy.jpg', 200000 UNION ALL
  SELECT 'ZAKAT',          'Zakat',                                'https://nutech-integrasi.app/dummy.jpg', 300000
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);
