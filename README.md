# DietBuddy — Pendamping Diet Sehat Berbasis AI

**Mata Kuliah:** Implementasi Perangkat Lunak (IPPL)  
**Nama Mahasiswa:** Tiara Saparang  
**NIM:** 11241085  
**Tahap Pengumpulan:** Evaluasi Tengah Semester (UTS — Progres ~31,6%)

---

## 1. Deskripsi Singkat Aplikasi
**DietBuddy** adalah aplikasi berbasis web yang membantu pengguna mengatur kebutuhan kalori harian untuk **menurunkan berat badan**, **menjaga berat badan ideal**, maupun **menaikkan berat badan** secara aman dan konsisten dengan bantuan **Google Gemini AI**.

---

## 2. Status Progres Implementasi (Tahap UTS: 6 dari 19 Use Case / ~31,6%)

Sesuai ketentuan UTS (minimal progres 30% dari keseluruhan spesifikasi SRS & SDD), berikut rincian modul inti yang telah diimplementasikan pada tahap UTS beserta rencana pengembangan tahap selanjutnya menuju UAS:

| Kode Use Case | Nama Fitur / Kebutuhan Fungsional | Status UTS |
| :--- | :--- | :--- |
| **UC-01** | Registrasi Akun Pengguna Baru | **Selesai (100%)** |
| **UC-02** | Login & Logout Akun Pengguna | **Selesai (100%)** |
| **UC-03** | Input & Ubah Data Diri Fisik Secara Manual (Melalui Profil) | **Selesai (100%)** |
| **UC-04** | Input Data Diri melalui Percakapan AI | **Selesai (100%)** |
| **UC-05** | Perhitungan Otomatis Indeks Massa Tubuh (BMI) | **Selesai (100%)** |
| **UC-06 & UC-11** | Perhitungan Otomatis BMR, TDEE, Target Kalori & Konsultasi Diet AI | **Selesai (100%)** |
| *UC-07 s/d UC-10* | *Rekomendasi Menu Harian, Olahraga & Pilihan Durasi Waktu* | *Tahap Berikutnya (Menuju UAS)* |
| *UC-12 s/d UC-15* | *Motivasi Harian, Pencatatan & Riwayat Aktivitas, Streak* | *Tahap Berikutnya (Menuju UAS)* |
| *UC-16* | *Pengaturan Notifikasi Pengingat Harian* | *Tahap Berikutnya (Menuju UAS)* |
| *UC-17 s/d UC-19* | *Langganan Premium, Pembayaran & Panel Admin* | *Tahap Berikutnya (Menuju UAS)* |

---

## 3. Struktur File Proyek
- `index.html` — Antarmuka utama aplikasi Web (HTML5, CSS3 Soft Blue & Clean White, JavaScript).
- `app.py` — *Entry point* aplikasi berbasis Python & Streamlit.
- `models.py` — Implementasi *Class Diagram* berorientasi objek (`Pengguna`, `User`, `DataDiri`, `HasilPerhitungan`).
- `database.py` — Modul basis data SQLite untuk tabel inti tahap UTS (`pengguna`, `data_diri`, `hasil_perhitungan`, `pesan_konsultasi`).
- `gemini_service.py` — Modul layanan integrasi **Google Gemini API** (`LayananGemini`) untuk konsultasi gizi dan *onboarding* data diri via percakapan.
- `manifest.json` & `sw.js` — Konfigurasi Web Manifest.
- `requirements.txt` — Daftar pustaka Python yang digunakan.

---

## 4. Cara Menjalankan Aplikasi
1. **Melalui Browser Langsung:**  
   Klik dua kali berkas `index.html` untuk membuka aplikasi langsung di Google Chrome / Microsoft Edge.
2. **Melalui Python Streamlit:**  
   ```bash
   pip install -r requirements.txt
   streamlit run app.py
   ```
