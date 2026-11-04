import sqlite3
import hashlib

DB_PATH = "dietbuddy.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def init_db():
    """
    Inisialisasi Database SQLite Progres 50%+ Project IPPL.
    Mencakup 5 tabel utama:
    1. pengguna (Autentikasi Login, Registrasi, Check-In & Kuota Gratis)
    2. data_diri (Input Data Diri & Target Diet Bulanan)
    3. hasil_perhitungan (Kalkulasi BMI, BMR, TDEE & Target Kalori)
    4. rekomendasi_menu (Daftar Menu Sarapan, Siang, Selingan, Malam)
    5. pesan_konsultasi (Riwayat Chat Konsultasi AI)
    """
    conn = get_connection()
    cur = conn.cursor()

    # 1. Tabel Pengguna
    cur.execute("""
    CREATE TABLE IF NOT EXISTS pengguna (
        id_pengguna INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        hari_diet INTEGER DEFAULT 2,
        sudah_checkin_hari_ini INTEGER DEFAULT 0,
        sisa_chat_gratis INTEGER DEFAULT 3,
        sisa_menu_gratis INTEGER DEFAULT 1
    )
    """)

    # 2. Tabel Data Diri
    cur.execute("""
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
    )
    """)

    # 3. Tabel Hasil Perhitungan BMI, BMR, TDEE
    cur.execute("""
    CREATE TABLE IF NOT EXISTS hasil_perhitungan (
        id_hasil INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pengguna INTEGER UNIQUE NOT NULL,
        bmi REAL NOT NULL,
        status_bmi TEXT NOT NULL,
        bmr REAL NOT NULL,
        tdee REAL NOT NULL,
        rekomendasi_kalori REAL NOT NULL,
        FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna)
    )
    """)

    # 4. Tabel Rekomendasi Menu Harian
    cur.execute("""
    CREATE TABLE IF NOT EXISTS rekomendasi_menu (
        id_menu INTEGER PRIMARY KEY AUTOINCREMENT,
        waktu_makan TEXT NOT NULL,
        nama_menu TEXT NOT NULL,
        deskripsi_porsi TEXT NOT NULL,
        persentase_kalori REAL NOT NULL
    )
    """)

    # 5. Tabel Pesan Konsultasi AI
    cur.execute("""
    CREATE TABLE IF NOT EXISTS pesan_konsultasi (
        id_pesan INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pengguna INTEGER NOT NULL,
        pengirim TEXT NOT NULL,
        isi_pesan TEXT NOT NULL,
        waktu_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna)
    )
    """)

    conn.commit()
    conn.close()
