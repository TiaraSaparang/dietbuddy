# DietBuddy — AI Nutrition & Diet Companion Web App
**Proyek Rekayasa Perangkat Lunak (IPPL) — Capaian Progres 50%+ (55%)**

- **Pengembang:** Tiara Saparang (11241085)
- **Demo Live:** [https://tiarasaparang.github.io/dietbuddy/](https://tiarasaparang.github.io/dietbuddy/)
- **Repository:** [https://github.com/TiaraSaparang/dietbuddy](https://github.com/TiaraSaparang/dietbuddy)

---

## 🌟 Tentang DietBuddy
**DietBuddy** adalah aplikasi asisten nutrisi berbasis AI yang dirancang untuk membantu mahasiswa dan masyarakat luas menjalankan pola makan sehat tanpa stres, tanpa kelaparan ekstrem, dan sesuai dengan bahan makanan yang tersedia di rumah/kulkas.

### Fitur Unggulan (50% Milestone):
1. **Autentikasi Aman & Validasi Real-Time:** Pendaftaran akun baru, validasi format email & minimal 8 karakter password, serta ikon intip kata sandi.
2. **Kalkulator Kalori Medis Akurat:** Perhitungan BMI, BMR (Mifflin-St Jeor), TDEE, dan batas aman kalori harian.
3. **Rekomendasi Menu 4 Waktu:** Sarapan, Makan Siang, Selingan Sore, dan Makan Malam beserta kuota ganti menu harian.
4. **Asisten Nutrisi AI Konsultatif:** Dilengkapi jeda berpikir alami (1.8 detik), panduan resep praktis (tanpa minyak berlebih), dan rekomendasi 3 alternatif pengganti bahan makanan.
5. **Check-In Konsistensi Harian:** Pencatatan hari konsistensi diet pengguna.

---

## 📁 Struktur Direktori Berbasis Arsitektur Tiga Lapis (Three-Tier)

```text
dietbuddy/
├── ai-service/             # Modul Kecerdasan Buatan & Prompting
│   ├── gemini_service.py   # Integrasi AI Nutritionist
│   └── prompts.json        # Template prompt persona & instruksi gizi
├── backend/                # Layanan REST API & Backend
│   ├── app.py              # Server backend Flask
│   ├── database.py         # Konfigurasi ORM SQLite
│   ├── models.py           # Model entitas tabel
│   └── requirements.txt    # Dependensi library Python
├── database/               # Skema Basis Data Relasional
│   ├── dietbuddy.sql       # Skema DDL 5 tabel utama
│   └── schema_dictionary.md# Kamus data & relasi ERD
├── docs/                   # Dokumentasi Proyek & Spesifikasi Sistem
│   ├── arsitektur_sistem.md# Diagram aliran sistem & analisis 50%
│   └── README.md           # Salinan arsip panduan
├── index.html              # Antarmuka Pengguna (Frontend Web)
├── style.css               # Desain Responsif & Tema DietBuddy
├── script.js               # Logika Kalkulator Medis & Engine AI
└── README.md               # Dokumentasi utama proyek
```

---

## 🚀 Cara Menjalankan Aplikasi
1. **Langsung Lewat Browser:**  
   Buka file `index.html` dengan cara klik dua kali atau drag ke browser (Google Chrome / Edge).
2. **Live Melalui GitHub Pages:**  
   Akses langsung secara daring di: [https://tiarasaparang.github.io/dietbuddy/](https://tiarasaparang.github.io/dietbuddy/)
