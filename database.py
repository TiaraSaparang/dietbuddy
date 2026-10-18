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
    Inisialisasi Database SQLite Progres UTS (~35%).
    Hanya mencakup 4 tabel utama:
    1. pengguna (Autentikasi Login & Registrasi)
    2. data_diri (Input Data Diri Manual & via AI)
    3. hasil_perhitungan (Kalkulasi BMI, BMR, TDEE & Target Kalori)
    4. pesan_konsultasi (Riwayat Chat Konsultasi AI)
    """
    conn = get_connection()
    cur = conn.cursor()

    # 1. Tabel Pengguna (UC-01, UC-02, UC-03)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS pengguna (
        id_pengguna INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        hari_diet INTEGER DEFAULT 2,
        sudah_checkin_hari_ini INTEGER DEFAULT 0
    )
    """)

    # 2. Tabel Data Diri (UC-04, UC-05, UC-06)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS data_diri (
        id_data INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pengguna INTEGER UNIQUE NOT NULL,
        usia INTEGER NOT NULL,
        jenis_kelamin TEXT NOT NULL,
        berat_badan REAL NOT NULL,
        tinggi_badan REAL NOT NULL,
        tingkat_aktivitas TEXT NOT NULL,
        target_berat REAL NOT NULL,
        program_bulanan TEXT DEFAULT 'Turun Ideal & Aman (2 - 3 kg / bulan)',
        FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna)
    )
    """)

    # 3. Tabel Hasil Perhitungan BMI, BMR, TDEE (UC-07, UC-08)
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

    # 4. Tabel Pesan Konsultasi AI (UC-04, UC-11)
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

    # Data awal akun demo Tiara Saparang
    cur.execute("SELECT COUNT(*) as c FROM pengguna WHERE email = ?", ("tiara@itk.ac.id",))
    if cur.fetchone()["c"] == 0:
        cur.execute(
            "INSERT INTO pengguna (nama, email, password, hari_diet, sudah_checkin_hari_ini) VALUES (?, ?, ?, ?, ?)",
            ("Tiara Saparang", "tiara@itk.ac.id", hash_password("tiara12345"), 2, 0),
        )
        uid = cur.lastrowid
        cur.execute(
            """INSERT INTO data_diri 
               (id_pengguna, usia, jenis_kelamin, berat_badan, tinggi_badan, tingkat_aktivitas, target_berat, program_bulanan)
               VALUES (?, 20, 'Perempuan', 63.0, 160.0, 'Ringan (Olahraga 1-3x/minggu)', 55.0, 'Turun Ideal & Aman (2 - 3 kg / bulan)')""",
            (uid,),
        )
        cur.execute(
            """INSERT INTO hasil_perhitungan
               (id_pengguna, bmi, status_bmi, bmr, tdee, rekomendasi_kalori)
               VALUES (?, 24.6, 'Overweight Ringan', 1411, 1940, 1440)""",
            (uid,),
        )

    conn.commit()
    conn.close()
