# DietBuddy — Aplikasi Web Pendamping Diet & Kalkulasi Gizi Berbasis AI

**Mata Kuliah:** Implementasi Perangkat Lunak (IPPL)  
**Nama Mahasiswa:** Tiara Saparang  
**NIM:** 11241085  
**Tahap Evaluasi:** Presentasi Progres 50% Project IPPL (Realisasi Saat Ini: ~52,6%)

---

## 1. Deskripsi Singkat Aplikasi
**DietBuddy** adalah aplikasi berbasis web yang membantu pengguna mengatur kebutuhan kalori harian untuk **menurunkan berat badan**, **menjaga berat badan tetap stabil**, maupun **menaikkan berat badan** secara aman dan konsisten sesuai rumus medis **Mifflin-St Jeor** serta didampingi fitur konsultasi gizi berbasis **AI**.

---

## 2. Kesesuaian Rencana & Realisasi Implementasi (Progres >50%)

Berikut adalah rincian kesesuaian antara dokumen perancangan dengan fitur yang **telah selesai diimplementasikan (>50%)** serta fitur tahap selanjutnya menuju UAS:

| No | Modul / Fitur Sistem | Status Implementasi | Keterangan Realisasi |
| :--- | :--- | :--- | :--- |
| **1** | **Registrasi Akun Pengguna Baru** (`UC-01`) | **Selesai (100%)** | Validasi nama, format email, password min. 8 karakter & ikon mata |
| **2** | **Login & Logout Pengguna** (`UC-02`, `UC-03`) | **Selesai (100%)** | Cek akun belum terdaftar, validasi password & simpan di `localStorage` |
| **3** | **Ubah Data Diri & Target Diet** (`UC-05`, `UC-06`) | **Selesai (100%)** | Input Berat, Tinggi, Umur, Gender, Aktivitas & Program Bulanan |
| **4** | **Kalkulasi Otomatis BMI, BMR, TDEE & Kalori** (`UC-07`, `UC-08`) | **Selesai (100%)** | Rumus Mifflin-St Jeor & batas aman kalori minimal (1.200/1.500 kkal) |
| **5** | **Rekomendasi Menu Makanan Harian** (`UC-09`) | **Selesai (100%)** | Susunan menu Sarapan, Siang, Selingan, Malam + Kuota Gratis 1x/hari |
| **6** | **Check-In Konsistensi Harian** (`UC-12`) | **Selesai (100%)** | Pencatatan jumlah hari konsisten menjalankan target diet harian |
| **7** | **Konsultasi Diet & Bahan Makanan via AI** (`UC-11`) | **Selesai (100%)** | Tanya jawab porsi & pengganti bahan makanan + Kuota Gratis 3x chat |
| **8** | **Pengaturan Akun & Aplikasi** | **Selesai (100%)** | Ubah nama pengguna, ubah password baru, dan reset status harian |
| *9* | *Riwayat Aktivitas & Catatan Kalori* | *Segera (Tahap UAS)* | *Grafik perkembangan berat badan & log riwayat kalori harian* |
| *10* | *Berlangganan Premium & Simulasi Pembayaran* | *Segera (Tahap UAS)* | *Paket Premium 1 Bulan (Rp 25rb), 3 Bulan (Rp 65rb), 6 Bulan (Rp 100rb)* |

---

## 3. Struktur File Proyek
- `index.html` — Antarmuka utama aplikasi Web DietBuddy (HTML5, CSS3 Soft Sky Blue & Clean White, JavaScript).
- `app.py` — *Entry point* aplikasi berbasis Python & Streamlit.
- `models.py` — Implementasi *Class Diagram* (`Pengguna`, `DataDiri`, `HasilPerhitungan`, `MenuMakanan`).
- `database.py` — Modul basis data SQLite (`pengguna`, `data_diri`, `hasil_perhitungan`, `rekomendasi_menu`, `pesan_konsultasi`).
- `gemini_service.py` — Modul layanan respons konsultasi gizi dan pengganti bahan makanan.
- `requirements.txt` — Daftar pustaka Python yang digunakan.

---

## 4. Cara Menjalankan Aplikasi
1. **Melalui Browser Langsung:**  
   Buka file `index.html` di Google Chrome / Microsoft Edge, atau akses melalui GitHub Pages: `https://tiarasaparang.github.io/dietbuddy/`
2. **Melalui Python Streamlit:**  
   ```bash
   pip install -r requirements.txt
   streamlit run app.py
   ```
