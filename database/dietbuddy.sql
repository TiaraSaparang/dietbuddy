-- =====================================================================
-- FILE: dietbuddy.sql
-- FUNGSI: Struktur Tabel Database SQLite DietBuddy (Progres 50%+ IPPL)
-- =====================================================================

-- 1. Tabel Pengguna (Menyimpan Akun Login, Registrasi, Check-In & Sisa Kuota Gratis)
CREATE TABLE IF NOT EXISTS pengguna (
    id_pengguna INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    hari_diet INTEGER DEFAULT 2,
    sudah_checkin_hari_ini INTEGER DEFAULT 0,
    sisa_chat_gratis INTEGER DEFAULT 3,
    sisa_menu_gratis INTEGER DEFAULT 1
);

-- 2. Tabel Data Diri (Menyimpan Data Fisik & Target Diet Bulanan Pengguna)
CREATE TABLE IF NOT EXISTS data_diri (
    id_data INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pengguna INTEGER UNIQUE NOT NULL,
    usia INTEGER NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    berat_badan REAL NOT NULL,
    tinggi_badan REAL NOT NULL,
    tingkat_aktivitas TEXT NOT NULL,
    program_bulanan TEXT DEFAULT 'Turun Ideal & Aman (2 - 3 kg / bulan)',
    FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna)
);

-- 3. Tabel Hasil Perhitungan (Menyimpan Hasil Kalkulasi BMI, BMR, TDEE & Target Kalori)
CREATE TABLE IF NOT EXISTS hasil_perhitungan (
    id_hasil INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pengguna INTEGER UNIQUE NOT NULL,
    bmi REAL NOT NULL,
    status_bmi TEXT NOT NULL,
    bmr REAL NOT NULL,
    tdee REAL NOT NULL,
    rekomendasi_kalori REAL NOT NULL,
    FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna)
);

-- 4. Tabel Rekomendasi Menu (Menyimpan Susunan Menu Sarapan, Siang, Selingan, Malam)
CREATE TABLE IF NOT EXISTS rekomendasi_menu (
    id_menu INTEGER PRIMARY KEY AUTOINCREMENT,
    waktu_makan TEXT NOT NULL,
    nama_menu TEXT NOT NULL,
    deskripsi_porsi TEXT NOT NULL,
    persentase_kalori REAL NOT NULL
);

-- 5. Tabel Pesan Konsultasi (Menyimpan Riwayat Chat Konsultasi Gizi dengan AI)
CREATE TABLE IF NOT EXISTS pesan_konsultasi (
    id_pesan INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pengguna INTEGER NOT NULL,
    pengirim TEXT NOT NULL,
    isi_pesan TEXT NOT NULL,
    waktu_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna)
);

-- Data Awal Rekomendasi Menu Harian
INSERT INTO rekomendasi_menu (waktu_makan, nama_menu, deskripsi_porsi, persentase_kalori) VALUES
('Sarapan Pagi', 'Oatmeal Pisang & Telur Rebus', '4 sdm oatmeal hangat + 1 buah pisang iris + 1 butir telur ayam rebus matang', 0.25),
('Makan Siang', 'Nasi Putih, Dada Ayam Panggang & Sayur Bening', '100g nasi putih + 110g dada ayam panggang teflon + 1 mangkuk sayur bayam', 0.35),
('Selingan Sore', 'Pepaya Potong Segar & Edamame Rebus', '150g buah pepaya potong + segenggam edamame rebus tinggi serat', 0.12),
('Makan Malam', 'Pepes Ikan Segar, Tahu Kukus & Tumis Brokoli', '120g ikan pepes/panggang teflon + 1 potong tahu kukus + 1 mangkuk tumis brokoli', 0.28);
