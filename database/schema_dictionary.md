# Kamus Data & Skema Database DietBuddy (SQL)

Dokumen ini mendeskripsikan struktur basis data relasional untuk sistem **DietBuddy** pada tahapan proyek IPPL (50% Milestone & Rencana 100% UAS).

---

## 1. Daftar Entitas & Tabel
| No | Nama Tabel | Deskripsi | Status 50% |
|---|---|---|---|
| 1 | `pengguna` | Menyimpan kredensial autentikasi pengguna (ID, Nama, Email, Password Hash). | Selesai (50%) |
| 2 | `data_diri` | Menyimpan data fisik pengguna (Berat, Tinggi, Usia, Gender, Aktivitas, Target). | Selesai (50%) |
| 3 | `hasil_perhitungan` | Menyimpan hasil kalkulasi sistem (BMI, BMR, TDEE, Target Kalori Harian). | Selesai (50%) |
| 4 | `rekomendasi_menu` | Menyimpan paket menu makanan gizi seimbang harian (Pagi, Siang, Selingan, Malam). | Selesai (50%) |
| 5 | `pesan_konsultasi` | Menyimpan riwayat percakapan konsultasi antara pengguna dan asisten nutrisi AI. | Selesai (50%) |

---

## 2. Struktur Relasi Antartabel (ERD)
- `pengguna.id` $\rightarrow$ Relasi 1-to-1 dengan `data_diri.pengguna_id`
- `data_diri.id` $\rightarrow$ Relasi 1-to-many dengan `hasil_perhitungan.data_diri_id`
- `pengguna.id` $\rightarrow$ Relasi 1-to-many dengan `rekomendasi_menu.pengguna_id`
- `pengguna.id` $\rightarrow$ Relasi 1-to-many dengan `pesan_konsultasi.pengguna_id`

---

## 3. Rincian Kolom Tabel

### A. Tabel `pengguna`
- `id` (INTEGER, Primary Key, Auto Increment): ID unik pengguna.
- `nama` (VARCHAR(100)): Nama lengkap pengguna.
- `email` (VARCHAR(100), UNIQUE): Alamat email terdaftar.
- `password_hash` (VARCHAR(255)): Hash keamanan kata sandi.
- `role` (VARCHAR(20), Default 'gratis'): Status akun pengguna ('gratis' / 'premium').
- `dibuat_pada` (TIMESTAMP): Waktu pendaftaran akun.

### B. Tabel `data_diri`
- `id` (INTEGER, Primary Key, Auto Increment)
- `pengguna_id` (INTEGER, Foreign Key ke `pengguna.id`)
- `berat_badan` (DECIMAL(5,2)): Berat badan pengguna (kg).
- `tinggi_badan` (DECIMAL(5,2)): Tinggi badan pengguna (cm).
- `umur` (INTEGER): Usia pengguna (tahun).
- `jenis_kelamin` (VARCHAR(15)): 'Laki-laki' atau 'Perempuan'.
- `faktor_aktivitas` (DECIMAL(4,3)): Nilai pengali aktivitas fisik (1.200 - 1.900).
- `target_diet` (VARCHAR(100)): Kategori target penurunan / kestabilan berat badan.

### C. Tabel `hasil_perhitungan`
- `id` (INTEGER, Primary Key, Auto Increment)
- `data_diri_id` (INTEGER, Foreign Key ke `data_diri.id`)
- `bmi` (DECIMAL(4,1)): Nilai Body Mass Index.
- `kategori_bmi` (VARCHAR(30)): Klasifikasi BMI ('Kurus', 'Normal', 'Berlebih', 'Obesitas').
- `bmr` (INTEGER): Angka metabolisme basal (Mifflin-St Jeor).
- `tdee` (INTEGER): Total kebutuhan energi harian.
- `target_kalori` (INTEGER): Target kalori harian setelah defisit aman.
- `catatan_keamanan` (TEXT): Peringatan keamanan ambang batas kalori minimum.

### D. Tabel `rekomendasi_menu`
- `id` (INTEGER, Primary Key, Auto Increment)
- `pengguna_id` (INTEGER, Foreign Key ke `pengguna.id`)
- `tipe_makan` (VARCHAR(30)): 'Sarapan Pagi', 'Makan Siang', 'Selingan Sore', 'Makan Malam'.
- `nama_menu` (VARCHAR(150)): Nama hidangan sehat.
- `kalori` (INTEGER): Estimasi kalori dalam porsi hidangan.
- `karbohidrat_gram` (DECIMAL(5,1))
- `protein_gram` (DECIMAL(5,1))
- `lemak_gram` (DECIMAL(5,1))
- `resep_olah` (TEXT): Langkah pengolahan praktis & alternatif bahan.

### E. Tabel `pesan_konsultasi`
- `id` (INTEGER, Primary Key, Auto Increment)
- `pengguna_id` (INTEGER, Foreign Key ke `pengguna.id`)
- `pengirim` (VARCHAR(10)): 'pengguna' atau 'ai'.
- `pesan` (TEXT): Konten teks percakapan / pertanyaan gizi.
- `waktu_kirim` (TIMESTAMP): Waktu pesan dikirimkan.
