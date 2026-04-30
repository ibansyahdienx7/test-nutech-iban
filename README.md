# SIMS PPOB API

REST API untuk sistem PPOB (Payment Point Online Bank) — Take Home Test API Programmer.

## Tech Stack

- **Runtime** : Node.js
- **Framework** : Express.js v4
- **Database** : MySQL (via mysql2 — prepared statements)
- **Auth** : JWT Bearer Token (12 jam) + Token Blacklist (Logout)
- **Password** : bcrypt
- **Upload** : multer (jpeg/png)
- **Logging** : Custom file logger (`logs/app.log`, `logs/error.log`)

---

## Struktur Project

```
test_nutech/
├── app.js                              # Entry point
├── .env                                # Konfigurasi environment
├── package.json
├── database/
│   └── schema.sql                      # DDL + seed data
├── logs/                               # Auto-generated
│   ├── app.log                         # Semua log
│   └── error.log                       # Hanya WARN & ERROR
├── uploads/                            # Auto-generated (profile image)
└── src/
    ├── config/
    │   └── database.js                 # MySQL connection pool
    ├── middleware/
    │   └── auth.js                     # JWT verification
    ├── helpers/
    │   ├── response.js                 # Format response standar
    │   └── logger.js                   # File & console logger
    └── controllers/
    │   ├── membershipController.js
    │   ├── informationController.js
    │   └── transactionController.js
    └── routes/
        ├── membership.js
        ├── information.js
        └── transaction.js
```

---

## Setup & Instalasi

### 1. Clone / Download Project

```bash
git clone <url-repository>
cd test_nutech
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file `env.example` menjadi `.env`:

```bash
cp env.example .env
```

Lalu sesuaikan isinya:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sims_ppob
DB_PORT=3306
JWT_SECRET=sims_ppob_jwt_secret_key_2024
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=production
```

### 4. Import Database

Buka **phpMyAdmin** → tab **SQL** → paste isi file `database/schema.sql`, lalu klik **Go**.

Atau via MySQL CLI:

```bash
mysql -u root -p < database/schema.sql
```

> Schema otomatis membuat database `sims_ppob`, tabel, dan seed data (6 banner + 12 layanan).

### 5. Jalankan Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start

# Build (install production deps only, tanpa devDependencies)
npm run build
```

Server berjalan di `http://localhost:3000`

---

## API Endpoints

### 🔓 Public (Tanpa Token)

| Method | Endpoint        | Deskripsi                    |
| ------ | --------------- | ---------------------------- |
| POST   | `/registration` | Registrasi user baru         |
| POST   | `/login`        | Login dan dapatkan JWT token |
| GET    | `/banner`       | List semua banner            |

### 🔐 Private (Bearer Token)

#### Module Membership

| Method | Endpoint          | Deskripsi                      |
| ------ | ----------------- | ------------------------------ |
| POST   | `/logout`         | Logout dan invalidate token    |
| GET    | `/profile`        | Ambil data profile             |
| PUT    | `/profile/update` | Update nama                    |
| PUT    | `/profile/image`  | Upload foto profile (jpeg/png) |

#### Module Information — CRUD

| Method | Endpoint        | Deskripsi                     |
| ------ | --------------- | ----------------------------- |
| POST   | `/banner`       | Tambah banner baru            |
| PUT    | `/banner/:id`   | Update banner berdasarkan ID  |
| DELETE | `/banner/:id`   | Hapus banner berdasarkan ID   |
| GET    | `/services`     | List semua layanan PPOB       |
| POST   | `/services`     | Tambah layanan baru           |
| PUT    | `/services/:id` | Update layanan berdasarkan ID |
| DELETE | `/services/:id` | Hapus layanan berdasarkan ID  |

#### Module Transaction

| Method | Endpoint               | Deskripsi          |
| ------ | ---------------------- | ------------------ |
| GET    | `/balance`             | Cek saldo          |
| POST   | `/topup`               | Top up saldo       |
| POST   | `/transaction`         | Pembayaran layanan |
| GET    | `/transaction/history` | Riwayat transaksi  |

---

## Contoh Request & Response

### POST `/registration`

```json
// Request
{
  "email": "user@nutech-integrasi.com",
  "first_name": "User",
  "last_name": "Nutech",
  "password": "abcdef1234"
}

// Response 200
{
  "status": 0,
  "message": "Registrasi berhasil silahkan login",
  "data": null
}
```

### POST `/login`

```json
// Request
{
  "email": "user@nutech-integrasi.com",
  "password": "abcdef1234"
}

// Response 200
{
  "status": 0,
  "message": "Login Sukses",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/topup`

```json
// Request (Bearer Token required)
{
  "top_up_amount": 1000000
}

// Response 200
{
  "status": 0,
  "message": "Top Up Balance berhasil",
  "data": {
    "balance": 1000000
  }
}
```

### POST `/transaction`

```json
// Request (Bearer Token required)
{
  "service_code": "PULSA"
}

// Response 200
{
  "status": 0,
  "message": "Transaksi berhasil",
  "data": {
    "invoice_number": "INV30042026-123456",
    "service_code": "PULSA",
    "service_name": "Pulsa",
    "transaction_type": "PAYMENT",
    "total_amount": 40000,
    "created_on": "2026-04-30T05:47:00.000Z"
  }
}
```

### GET `/transaction/history?offset=0&limit=5`

```json
// Response 200
{
  "status": 0,
  "message": "Get History Berhasil",
  "data": {
    "offset": 0,
    "limit": 5,
    "records": [
      {
        "invoice_number": "INV30042026-123456",
        "transaction_type": "PAYMENT",
        "description": "Pulsa",
        "total_amount": 40000,
        "created_on": "2026-04-30T05:47:00.000Z"
      }
    ]
  }
}
```

---

## Internal Status Code

| Status | Keterangan                         |
| ------ | ---------------------------------- |
| `0`    | Sukses                             |
| `102`  | Bad Request / Validasi gagal       |
| `103`  | Username atau password salah       |
| `108`  | Token tidak valid atau kadaluwarsa |
| `500`  | Internal server error              |

---

## Daftar Layanan PPOB

| Service Code      | Nama Layanan       | Tarif      |
| ----------------- | ------------------ | ---------- |
| `PAJAK`           | Pajak PBB          | Rp 40.000  |
| `PLN`             | Listrik            | Rp 10.000  |
| `PDAM`            | PDAM Berlangganan  | Rp 40.000  |
| `PULSA`           | Pulsa              | Rp 40.000  |
| `PGN`             | PGN Berlangganan   | Rp 50.000  |
| `MUSIK`           | Musik Berlangganan | Rp 50.000  |
| `TV`              | TV Berlangganan    | Rp 50.000  |
| `PAKET_DATA`      | Paket data         | Rp 50.000  |
| `VOUCHER_GAME`    | Voucher Game       | Rp 100.000 |
| `VOUCHER_MAKANAN` | Voucher Makanan    | Rp 100.000 |
| `QURBAN`          | Qurban             | Rp 200.000 |
| `ZAKAT`           | Zakat              | Rp 300.000 |

---

## Testing dengan Postman

Import file `SIMS_PPOB_API.postman_collection.json` ke Postman.

> Token JWT otomatis tersimpan ke collection variable setelah request **Login** berhasil — semua request private langsung bisa dipakai.

**Urutan testing yang disarankan:**

1. Registration
2. Login ← token tersimpan otomatis
3. Top Up
4. Transaction
5. Get Balance
6. Transaction History
7. Store Banner → Update Banner → Delete Banner
8. Store Service → Update Service → Delete Service
9. Logout

---

## Logging

Log tersimpan otomatis di folder `logs/`:

| File             | Isi                                        |
| ---------------- | ------------------------------------------ |
| `logs/app.log`   | Semua aktivitas (DEBUG, INFO, WARN, ERROR) |
| `logs/error.log` | Hanya WARN & ERROR                         |

Contoh output log:

```
[2026-04-30T05:47:00.000Z] [INFO]  SIMS PPOB API running on port 3000
[2026-04-30T05:47:01.000Z] [INFO]  POST /login 200 - 120ms
[2026-04-30T05:47:02.000Z] [INFO]  User berhasil login | {"email":"user@nutech-integrasi.com"}
[2026-04-30T05:47:03.000Z] [WARN]  Login gagal - password salah | {"email":"user@nutech-integrasi.com"}
```

---

## Deploy

### Railway (Direkomendasikan)

Railway cocok untuk REST API dengan database dan file upload.

1. Push project ke GitHub
2. Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Di tab **Variables**, tambahkan semua isi `.env`
4. Railway otomatis jalankan `npm start` ✅

### Vercel

> ⚠️ Fitur upload file (`multer`) tidak berfungsi di Vercel karena filesystem read-only.

1. Buka [vercel.com](https://vercel.com) → **New Project** → Import dari GitHub
2. **Framework Preset**: Other
3. Tambahkan environment variables
4. Deploy — Vercel menggunakan `vercel.json` yang sudah tersedia ✅

---

## API Reference

Swagger documentation: [https://api-doc-tht.nutech-integrasi.com](https://api-doc-tht.nutech-integrasi.com)
