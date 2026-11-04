# Dokumentasi Arsitektur Sistem DietBuddy (Milestone 50% IPPL)

Proyek ini dikembangkan oleh **11241085 - Tiara Saparang** untuk memenuhi capaian **Presentasi 50% Proyek Rekayasa Perangkat Lunak (IPPL)** di Ruang B207.

---

## 1. Diagram Arsitektur Sistem (Three-Tier Architecture)

```
[ Pengguna (Browser / Client) ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│                   FRONTEND TIER                        │
│  - index.html (UI & Form Validasi Real-time)           │
│  - style.css  (Sistem Desain, Responsive Mobile & Web) │
│  - script.js  (Mesin Hitung BMI/BMR & Logika AI)       │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌──────────────────────────────┐    ┌─────────────────────────────────┐
│        AI SERVICE TIER       │    │          BACKEND TIER           │
│  - ai-service/               │    │  - backend/app.py (REST API)    │
│    • gemini_service.py       │    │  - backend/database.py (ORM)    │
│    • prompts.json (Config)   │    │  - backend/models.py (Schema)   │
└──────────────┬───────────────┘    └────────────────┬────────────────┘
               │                                     │
               └───────────────────┬─────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────┐
│                    DATABASE TIER                       │
│  - database/dietbuddy.sql (5 Tabel Relasional)         │
│  - database/schema_dictionary.md (Kamus Data)          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Capaian Fitur (Status Progres 55%)

| Modul Fitur | Status 50% IPPL | Keterangan Uji |
|---|---|---|
| **Autentikasi (Masuk & Daftar)** | Selesai (100%) | Validasi email standar regex, password >= 8 karakter, show/hide password mata, feedback merah instan. |
| **Kalkulator Nutrisi & BMI** | Selesai (100%) | Menggunakan rumus standar medis **Mifflin-St Jeor** & TDEE dengan proteksi batas aman minimal (1.200 kkal). |
| **Rekomendasi Menu 4 Waktu** | Selesai (100%) | Sarapan, Makan Siang, Selingan, Makan Malam lengkap dengan rincian kalori, protein, karbohidrat, dan lemak. |
| **Konsultasi Nutrisi AI** | Selesai (100%) | Jeda berpikir alami (1.8 detik), memori percakapan, panduan resep & pengolahan praktis, serta 3 alternatif bahan. |
| **Check-in Konsistensi Harian** | Selesai (100%) | Pengguna mencatat komitmen harian dengan visual feedback dinamis. |
| **Riwayat Progres Berat Badan** | Ditunda (UAS 100%) | Berstatus `Segera` pada sidebar menu. |
| **Berlangganan Paket Premium** | Ditunda (UAS 100%) | Berstatus `Segera` pada sidebar menu. |

---

## 3. Struktur Direktori Proyek
```text
dietbuddy/
├── ai-service/
│   ├── gemini_service.py
│   └── prompts.json
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   └── requirements.txt
├── database/
│   ├── dietbuddy.sql
│   └── schema_dictionary.md
├── docs/
│   ├── arsitektur_sistem.md
│   └── README.md
├── index.html
├── style.css
├── script.js
└── README.md
```
