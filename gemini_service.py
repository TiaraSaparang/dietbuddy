import re
from typing import Dict, Any


def ekstrak_data_diri_dari_chat(pesan: str) -> Dict[str, Any]:
    """
    Mengekstrak data diri (Berat, Tinggi, Usia, Jenis Kelamin, dan Target Diet Bulanan)
    secara otomatis dari percakapan pengguna dengan AI (UC-04).
    """
    teks = pesan.lower()
    hasil: Dict[str, Any] = {}

    # Deteksi Berat Badan (contoh: "berat 63 kg" atau "bb 63")
    m_berat = re.search(r"(?:berat|bb)\s*(?:badan|aku|saya)?\s*(\d{2,3}(?:\.\d+)?)\s*(?:kg|kilo)?", teks)
    if not m_berat:
        m_berat = re.search(r"(\d{2,3})\s*(?:kg|kilo)", teks)
    if m_berat:
        val = float(m_berat.group(1))
        if 30 <= val <= 200:
            hasil["berat_badan"] = val

    # Deteksi Tinggi Badan (contoh: "tinggi 160 cm" atau "tb 160")
    m_tinggi = re.search(r"(?:tinggi|tb)\s*(?:badan|aku|saya)?\s*(\d{3})\s*(?:cm)?", teks)
    if not m_tinggi:
        m_tinggi = re.search(r"(\d{3})\s*cm", teks)
    if m_tinggi:
        val = float(m_tinggi.group(1))
        if 120 <= val <= 220:
            hasil["tinggi_badan"] = val

    # Deteksi Usia (contoh: "umur 20 tahun")
    m_usia = re.search(r"(?:umur|usia)\s*(?:aku|saya)?\s*(\d{2})\s*(?:tahun|thn)?", teks)
    if m_usia:
        val = int(m_usia.group(1))
        if 12 <= val <= 80:
            hasil["usia"] = val

    # Deteksi Jenis Kelamin
    if any(k in teks for k in ("perempuan", "wanita", "cewek")):
        hasil["jenis_kelamin"] = "Perempuan"
    elif any(k in teks for k in ("laki-laki", "pria", "cowok")):
        hasil["jenis_kelamin"] = "Laki-laki"

    # Deteksi Program Bulanan (Turun / Jaga / Naik)
    if any(k in teks for k in ("turun", "kurus", "diet", "defisit")):
        if any(k in teks for k in ("4", "cepat")):
            hasil["selisih_kalori"] = -750
            hasil["program_bulanan"] = "Turun Cepat (3 - 4 kg / bulan)"
        elif any(k in teks for k in ("1", "santai")):
            hasil["selisih_kalori"] = -300
            hasil["program_bulanan"] = "Turun Santai (1 - 1.5 kg / bulan)"
        else:
            hasil["selisih_kalori"] = -500
            hasil["program_bulanan"] = "Turun Ideal & Aman (2 - 3 kg / bulan)"
    elif any(k in teks for k in ("naik", "gemuk", "bulking", "tambah")):
        hasil["selisih_kalori"] = 350
        hasil["program_bulanan"] = "Naik Berat Badan (+1.5 - 2 kg / bulan)"
    elif any(k in teks for k in ("jaga", "stabil", "maintain")):
        hasil["selisih_kalori"] = 0
        hasil["program_bulanan"] = "Jaga Berat Badan Tetap Stabil (0 kg / bulan)"

    return hasil


def jawab_konsultasi_ai(pesan: str, target_kalori: int = 1440) -> str:
    """
    Memberikan respons konsultasi gizi dan penggantian bahan makanan (UC-11).
    """
    teks = pesan.lower()

    # Jika pengguna meminta ganti ikan ke ayam
    if "ikan" in teks and "ayam" in teks:
        return (
            "Bisa banget! Untuk menggantikan porsi ikan tanpa mengubah total kalori harianmu, "
            "kamu cukup menggantinya dengan **100-120 gram dada ayam tanpa kulit** (sekitar **165 kkal**, "
            "26g protein). Olah dengan cara dipanggang teflon, direbus, atau pepes agar tetap rendah lemak."
        )

    # Jika pengguna memasukkan data diri
    data_baru = ekstrak_data_diri_dari_chat(pesan)
    if data_baru:
        return (
            f"Data dirimu berhasil diperbarui! Berdasarkan kalkulasi Mifflin-St Jeor, "
            f"target kalori harianmu saat ini adalah **{target_kalori} kkal/hari**."
        )

    return (
        f"Saat ini target kalori harianmu adalah **{target_kalori} kkal/hari**. "
        "Kamu bisa menyebutkan berat badan, tinggi badan, umur, target diet bulanan, "
        "atau menanyakan pengganti bahan makanan kepada AI."
    )
