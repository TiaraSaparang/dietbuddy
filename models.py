from dataclasses import dataclass


@dataclass
class Pengguna:
    """Entitas Pengguna untuk Login, Registrasi, Check-In Harian, dan Kuota Gratis"""
    id_pengguna: int
    nama: str
    email: str
    hari_diet: int = 2
    sudah_checkin_hari_ini: bool = False
    sisa_chat_gratis: int = 3
    sisa_menu_gratis: int = 1


@dataclass
class DataDiri:
    """Entitas Data Diri Fisik & Target Diet Bulanan"""
    id_pengguna: int
    usia: int
    jenis_kelamin: str
    berat_badan: float
    tinggi_badan: float
    tingkat_aktivitas: str
    program_bulanan: str = "Turun Ideal & Aman (2 - 3 kg / bulan)"


@dataclass
class MenuMakanan:
    """Entitas Rekomendasi Menu Makanan Harian"""
    waktu_makan: str
    nama_menu: str
    deskripsi_porsi: str
    kalori: int


@dataclass
class HasilPerhitungan:
    """
    Entitas Kalkulasi BMI, BMR, TDEE, dan Target Kalori Harian
    Menggunakan Rumus Mifflin-St Jeor sesuai Dokumen Desain DietBuddy.
    """
    bmi: float
    status_bmi: str
    bmr: int
    tdee: int
    rekomendasi_kalori: int

    @staticmethod
    def hitung_lengkap(
        berat: float,
        tinggi: float,
        usia: int,
        jenis_kelamin: str,
        faktor_aktivitas: float = 1.375,
        selisih_kalori_program: int = -450,
    ) -> "HasilPerhitungan":
        # 1. Hitung BMI = berat (kg) / (tinggi (m))^2
        tinggi_m = tinggi / 100.0
        bmi = round(berat / (tinggi_m * tinggi_m), 1)

        if bmi < 18.5:
            status_bmi = "Kurus"
        elif bmi < 25.0:
            status_bmi = "Normal"
        elif bmi < 30.0:
            status_bmi = "Berlebih"
        else:
            status_bmi = "Obesitas"

        # 2. Hitung BMR (Rumus Mifflin-St Jeor)
        if jenis_kelamin.lower() in ("laki-laki", "l", "pria"):
            bmr = round((10 * berat) + (6.25 * tinggi) - (5 * usia) + 5)
            batas_aman = 1500
        else:
            bmr = round((10 * berat) + (6.25 * tinggi) - (5 * usia) - 161)
            batas_aman = 1200

        # 3. Hitung TDEE = BMR * Faktor Aktivitas
        tdee = round(bmr * faktor_aktivitas)

        # 4. Hitung Target Kalori Harian (batas aman minimal 1200/1500 kkal)
        rekomendasi_kalori = max(batas_aman, tdee + selisih_kalori_program)

        return HasilPerhitungan(
            bmi=bmi,
            status_bmi=status_bmi,
            bmr=bmr,
            tdee=tdee,
            rekomendasi_kalori=rekomendasi_kalori,
        )
