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

    # Jika pengguna bertanya bahan di kulkas (telur dan tempe)
    if "telur" in teks or "tempe" in teks:
        return (
            f"Kita bisa manfaatkan bahan di rumah agar tetap sesuai sasaran **{target_kalori} kkal/hari**: "
            "gunakan **2 butir telur rebus (~145 kkal)** atau **2 potong tempe panggang teflon (~150 kkal)** "
            "didampingi semangkuk sayur bening."
        )

    return (
        f"Saat ini target kalori harianmu adalah **{target_kalori} kkal/hari**. "
        "Kamu bisa menanyakan takaran porsi aman atau pengganti bahan makanan yang ada di rumah kepada AI."
    )
