/* =====================================================================
   FILE: script.js
   FUNGSI: Mengatur Logika Validasi Login, Rumus BMI/BMR/TDEE, Rekomendasi Menu, dan Chat AI
   ===================================================================== */
    let savedInitialUsers = [];
    try {
      savedInitialUsers = JSON.parse(localStorage.getItem("dietbuddy_users_v2") || "[]");
    } catch(e) {
      savedInitialUsers = [];
    }
    if (!Array.isArray(savedInitialUsers) || savedInitialUsers.length === 0) {
      savedInitialUsers = [
        { nama: "Tiara Saparang", email: "tiara@dietbuddy.id", password: "password123" }
      ];
      try {
        localStorage.setItem("dietbuddy_users_v2", JSON.stringify(savedInitialUsers));
      } catch (e) {}
    }

    let state = {
      loggedIn: false,
      hariDiet: 2,
      sudahCheckInHariIni: false,
      sisaChatGratis: 3,
      sisaMenuGratis: 1,
      indeksPaketMenu: 0,
      lastTopicFood: "ikan",
      fallbackCounter: 0,
      registeredUsers: savedInitialUsers,
      user: {
        nama: "Tiara Saparang",
        email: "tiara@dietbuddy.id"
      },
      dataDiri: {
        berat_badan: 62,
        tinggi_badan: 160,
        umur: 20,
        jenis_kelamin: "Perempuan",
        faktor_aktivitas: 1.375,
        kalori_delta: -450,
        target_diet: "Turun Ideal & Aman (2 – 3 kg / bulan)"
      },
      hasil: {
        bmi: 24.2,
        kategori_bmi: "Normal",
        bmr: 1359,
        tdee: 1869,
        target_kalori: 1420,
        catatan_aman: "Target kalori berada dalam batas aman (minimal 1.200 kkal/hari)."
      }
    };

    const foodSubstituteDB = {
      "ikan": {
        nama: "Ikan Segar (Kembung / Nila / Tuna / Patin)",
        porsiAman: "120 gram daging ikan (1 ekor sedang, ~150 kkal, 24g protein)",
        caraMasak: "dikukus pepes bumbu kuning, dibuat sup ikan kuah bening, atau dipanggang teflon tanpa minyak",
        caraOlahDetail: "1) Lumuri 1 ekor ikan (120g) dengan perasan jeruk nipis, bawang putih, kunyit, jahe, serai, daun kemangi, dan irisan tomat.<br>2) Bungkus pakai daun pisang (atau taruh di wadah tahan panas/aluminium foil kalau gak ada daun pisang), lalu <b>kukus 15–20 menit</b> sampai matang dan wangi!",
        alternatif: "1) <b>Ikan Panggang Teflon:</b> Panggang di teflon anti lengket pakai bumbu kunyit-bawang (0 minyak).<br>2) <b>Sup Ikan Kuah Asam Bening:</b> Rebus ikan dengan tomat, daun bawang, dan jahe.<br>3) <b>Ganti Bahan Protein Lain:</b> Bisa diganti <b>100g Dada Ayam</b> (~165 kkal) atau <b>2 butir Telur + 1 potong Tempe</b> (~210 kkal)."
      },
      "ayam": {
        nama: "Dada Ayam Tanpa Kulit",
        porsiAman: "100–120 gram dada ayam tanpa kulit (~165 kkal, 31g protein)",
        caraMasak: "dipanggang teflon bumbu kuning, direbus suwir soto bening, atau ditumis dengan 1 sdt minyak",
        caraOlahDetail: "1) Potong dadu atau iris tipis 100–120g dada ayam tanpa kulit, marinasi dengan bawang putih halus, lada, sedikit garam, dan perasan jeruk nipis.<br>2) <b>Panggang di teflon anti lengket</b> selama 5–7 menit per sisi dengan api sedang sampai matang kecokelatan (cukup oles 1/2 sendok teh minyak).",
        alternatif: "1) <b>Ayam Kukus Jahe/Bawang Putih:</b> Empuk banget dan bebas minyak.<br>2) <b>Soto Ayam Kuah Bening (Tanpa Santan):</b> Ayam rebus suwir ditambah soun sedikit dan tauge.<br>3) <b>Ganti Bahan Lain:</b> Bisa diganti <b>1 ekor Ikan Kukus/Bakar</b> (~150 kkal) atau <b>2 butir Telur Rebus + Tahu</b> (~185 kkal)."
      },
      "telur": {
        nama: "Telur Ayam",
        porsiAman: "2 butir telur rebus atau orak-arik teflon (~145 kkal, 13g protein)",
        caraMasak: "direbus matang, dibuat telur kukus, atau didadar tipis minyak dengan irisan tomat dan daun bawang",
        caraOlahDetail: "1) Kocok 2 butir telur dengan irisan daun bawang, tomat, cabai, dan sedikit garam.<br>2) Masak di <b>teflon anti lengket tanpa minyak</b> (atau semprot sedikit minyak) dengan api kecil sampai matang merata, atau rebus langsung 8 menit.",
        alternatif: "1) <b>Telur Orak-Arik Sayur:</b> Tumis telur bareng wortel & sawi pakai 1 sdt air/kaldu.<br>2) <b>Sup Telur Tomat Bening:</b> Rebus air mendidih dengan tomat, lalu tuang kocokan telur.<br>3) <b>Ganti Bahan Lain:</b> Bisa diganti <b>100g Dada Ayam</b> (~165 kkal) atau <b>2 potong Tempe + 2 potong Tahu</b> (~190 kkal)."
      },
      "tempe": {
        nama: "Tempe",
        porsiAman: "2 potong sedang (80–100 gram, ~150 kkal, 15g protein nabati)",
        caraMasak: "dipanggang teflon bumbu bawang/ketumbar, dibuat pepes tempe kemangi, atau dikukus",
        caraOlahDetail: "1) Potong 2 iris sedang tempe (80–100g), rendam sebentar di air bumbu bawang putih, ketumbar, dan sedikit kecap/garam.<br>2) <b>Panggang di atas teflon</b> tanpa minyak (atau oles 1/2 sdt minyak) sambil dibolak-balik sampai kecokelatan dan harum.",
        alternatif: "1) <b>Pepes Tempe Kemangi:</b> Haluskan tempe dengan bumbu cabai-bawang & kemangi, lalu kukus 15 menit.<br>2) <b>Tempe Ungkep Air Kelapa/Bumbu Kuning:</b> Rebus bumbu sampai meresap tanpa digoreng.<br>3) <b>Ganti Bahan Lain:</b> Bisa diganti <b>2–3 potong Tahu Putih</b> (~120 kkal) atau <b>2 butir Telur Rebus</b> (~145 kkal)."
      },
      "tahu": {
        nama: "Tahu Putih / Tahu Sutra",
        porsiAman: "2–3 potong sedang (~120 kkal, 12g protein)",
        caraMasak: "dibuat pepes tahu kemangi, sup tahu kuah bening, atau panggang teflon bumbu bawang",
        caraOlahDetail: "1) Hancurkan 2–3 potong tahu putih, campur dengan irisan daun bawang, kemangi, tomat, bawang putih, dan sedikit putih telur.<br>2) Kukus di wadah tahan panas atau daun pisang selama <b>15 menit</b> sampai padat dan gurih!",
        alternatif: "1) <b>Sup Tahu Sawi Putih:</b> Kuah kaldu bawang putih hangat, cocok buat makan malam.<br>2) <b>Tahu Panggang Teflon Sambal Kecap:</b> Panggang tahu tanpa minyak, cocol irisan cabai rawit.<br>3) <b>Ganti Bahan Lain:</b> Bisa diganti <b>2 potong Tempe</b> (~150 kkal) atau <b>2 butir Telur</b> (~145 kkal)."
      },
      "daging": {
        nama: "Daging Sapi Tanpa Lemak",
        porsiAman: "85–100 gram daging sapi tanpa gajih/lemak (~180 kkal, 26g protein)",
        caraMasak: "direbus sup sayur bening (wortel & kentang) atau ditumis lada hitam dengan 1 sdt minyak",
        caraOlahDetail: "1) Pilih bagian daging has dalam (tenderloin) tanpa lemak putih, iris tipis melawan serat.<br>2) Rebus jadi <b>sup daging bening</b> dengan wortel & buncis, atau tumis cepat di teflon pakai bawang bombay dan lada hitam.",
        alternatif: "1) <b>Soto Daging Kuah Bening:</b> Segar, berempah, dan rendah lemak.<br>2) <b>Daging Panggang Sambal Matah:</b> Irisan daging panggang teflon dengan bawang merah & serai segar.<br>3) <b>Ganti Bahan Lain:</b> Bisa diganti <b>100g Dada Ayam</b> (~165 kkal) atau <b>120g Ikan Segar</b> (~150 kkal)."
      },
      "nasi putih": {
        nama: "Nasi Putih",
        porsiAman: "100 gram (6–7 sendok makan peres, ~130 kkal)",
        caraMasak: "didampingi 1 mangkuk sayur dan lauk protein agar gula darah stabil dan kenyang lebih lama",
        caraOlahDetail: "1) Takar sekitar <b>6–7 sendok makan peres</b> (100 gram) di piringmu.<br>2) Trik biar gak gampang lapar: makan <b>sayur dan lauk proteinnya dulu</b> di suapan pertama, baru makan nasinya!",
        alternatif: "1) <b>Nasi Merah (100–120g):</b> Seratnya 3x lebih tinggi, bikin kenyang awet (~120 kkal).<br>2) <b>Kentang Kukus/Rebus (150g):</b> Kalori setara tapi bikin perut kenyang lebih lama (~130 kkal).<br>3) <b>Ubi Rebus (150g) atau Oatmeal (4–5 sdm):</b> Cocok banget buat variasi karbohidrat sehat."
      },
      "nasi merah": {
        nama: "Nasi Merah",
        porsiAman: "100–120 gram (1 centong sedang, ~120 kkal tinggi serat)",
        caraMasak: "dimasak dengan sedikit tambahan air agar pulen dan disajikan hangat dengan lauk protein",
        caraOlahDetail: "1) Cuci beras merah dan rendam 15 menit sebelum dimasak di rice cooker dengan rasio air sedikit lebih banyak dari beras putih.<br>2) Sajikan 1 centong sedang (100–120g) bersama lauk tinggi protein dan sayuran hijau.",
        alternatif: "1) <b>Nasi Putih Porsi Terukur (6–7 sdm):</b> Tetap aman kok kalau belum terbiasa nasi merah!<br>2) <b>Kentang Rebus (150g):</b> Lembut dan mengenyangkan (~130 kkal).<br>3) <b>Oatmeal Gurih (4–5 sdm):</b> Diseduh air kaldu hangat dengan topping telur dan sayur."
      },
      "kentang": {
        nama: "Kentang",
        porsiAman: "150 gram (1–2 buah sedang kukus/rebus, ~130 kkal)",
        caraMasak: "dikukus atau direbus beserta kulit bersihnya, atau dipanggang teflon dengan taburan lada & oregano",
        caraOlahDetail: "1) Cuci bersih 1–2 buah kentang sedang (150g), potong wedges atau belah dua.<br>2) <b>Kukus 15 menit</b> sampai empuk, lalu beri sedikit garam, lada hitam, dan daun seledri cincang.",
        alternatif: "1) <b>Mashed Potato Diet:</b> Haluskan kentang kukus dengan sedikit susu rendah lemak & bawang putih.<br>2) <b>Ubi Jalar Kukus (150g):</b> Rasa manis alami dan tinggi serat (~130 kkal).<br>3) <b>Nasi Putih/Merah (100g):</b> 6–7 sendok makan (~120–130 kkal)."
      },
      "roti": {
        nama: "Roti Gandum / Tawar",
        porsiAman: "2 lembar roti gandum utuh (~140 kkal)",
        caraMasak: "dipanggang teflon tanpa mentega berlebih, diisi telur dadar tipis, selada, dan irisan tomat",
        caraOlahDetail: "1) Panggang 2 lembar roti gandum di atas teflon kering sampai agak renyah.<br>2) Isi dengan <b>1 butir telur mata sapi/rebus, lembaran sayur selada, dan tomat</b> (hindari kental manis atau mentega tebal).",
        alternatif: "1) <b>Roti Gandum + Pisang Iris:</b> Cocok buat sarapan cepat sebelum kuliah/aktivitas.<br>2) <b>Oatmeal Hangat (4–5 sdm):</b> Lebih tinggi serat larut (~150 kkal).<br>3) <b>Kentang/Ubi Kukus (150g):</b> Bebas tepung dan bikin kenyang lama."
      },
      "mie": {
        nama: "Mie / Bihun",
        porsiAman: "1 porsi bihun rebus atau ¾ keping mie dengan ½ takaran bumbu (~220–280 kkal)",
        caraMasak: "direbus dengan tambahan 1 mangkuk penuh sayur sawi/tauge dan 1–2 butir telur rebus",
        caraOlahDetail: "1) Rebus mie/bihun lalu buang air rebusan pertamanya dan ganti dengan air kaldu baru.<br>2) Gunakan <b>setengah bungkus bumbu aja</b> (biar gak tinggi natrium/garam), lalu masukkan banyak sayur sawi hijau, tomat, dan telur rebus!",
        alternatif: "1) <b>Bihun Kuah Bening Ayam Suwir:</b> Kalorinya lebih ramah dibanding mie goreng instan.<br>2) <b>Soun / Shirataki Rebus:</b> Rendah kalori dan enak dimasak kuah soto/tom yam.<br>3) <b>Nasi Hangat (6 sdm) + Sup Telur:</b> Lebih mengenyangkan untuk makan utama."
      },
      "sayur": {
        nama: "Sayuran Hijau (Bayam / Kangkung / Brokoli / Sawi / Capcay)",
        porsiAman: "1 mangkuk penuh (150–200 gram, ~40–60 kkal kaya serat & vitamin)",
        caraMasak: "direbus sayur bening jagung, dikukus sebentar, atau ditumis bawang putih dengan 1 sdt minyak",
        caraOlahDetail: "1) Cuci bersih sayuran, potong-potong, lalu masak cepat (2–3 menit) supaya nutrisinya terjaga dan tetap renyah.<br>2) Bisa dibuat <b>sayur bening temu kunci/bawang</b> atau <b>capcay kuah bening</b> pakai bawang putih dan sedikit minyak wijen.",
        alternatif: "1) <b>Lalapan Segar / Salad Timun Tomat:</b> Praktis tanpa dimasak.<br>2) <b>Pecel / Gado-Gado Sayur Rebus:</b> Pakai 1–2 sdm bumbu kacang yang diseduh air hangat (jangan diguyur banyak-banyak).<br>3) <b>Sup Sayur Wortel Buncis:</b> Hangat dan bikin perut nyaman."
      },
      "udang": {
        nama: "Udang Segar",
        porsiAman: "100–120 gram udang kupas (~115 kkal, 24g protein tinggi & rendah lemak)",
        caraMasak: "direbus sup tom yam bening, dikukus bawang putih, atau ditumis cepat dengan 1 sdt minyak",
        caraOlahDetail: "1) Kupas kulit udang dan bersihkan punggungnya, beri perasan jeruk nipis dan bawang putih cincang.<br>2) Tumis cepat 3–4 menit di teflon bersama brokoli/buncis, atau rebus jadi <b>sup udang kuah asam segar</b>.",
        alternatif: "1) <b>Udang Panggang Teflon Bumbu Jimbaran/Madu Tipis:</b> Wangi dan rendah kalori.<br>2) <b>Pepes Tahu Udang:</b> Campur udang cincang dengan tahu putih lalu kukus.<br>3) <b>Ganti Bahan Lain:</b> Bisa diganti <b>120g Ikan Segar</b> (~150 kkal) atau <b>100g Dada Ayam</b> (~165 kkal)."
      },
      "ubi": {
        nama: "Ubi Jalar / Singkong",
        porsiAman: "150 gram (1 buah sedang kukus/rebus, ~130 kkal tinggi serat)",
        caraMasak: "dikukus atau direbus hangat tanpa digoreng sebagai pengganti nasi",
        caraOlahDetail: "1) Cuci bersih 1 buah ubi jalar (ungu/kuning/madu), potong sedang.<br>2) <b>Kukus selama 15–20 menit</b> sampai lembut dan manis alami keluar tanpa perlu tambahan gula.",
        alternatif: "1) <b>Kentang Kukus (150g):</b> Gurih untuk pendamping lauk ayam/ikan (~130 kkal).<br>2) <b>Oatmeal Pisang (4–5 sdm):</b> Lembut dan kaya serat (~150 kkal).<br>3) <b>Nasi Merah/Putih (100g):</b> 6–7 sendok makan peres (~120–130 kkal)."
      },
      "oat": {
        nama: "Oatmeal",
        porsiAman: "4–5 sendok makan (40 gram, ~150 kkal kaya serat larut)",
        caraMasak: "diseduh air hangat/susu rendah lemak dengan potongan buah, atau dimasak gurih seperti bubur ayam",
        caraOlahDetail: "1) Seduh 4–5 sdm oatmeal dengan air panas atau susu low-fat selama 3 menit.<br>2) Kalau suka manis: beri potongan pisang/apel & sedikit kayu manis. Kalau suka <b>gurih</b>: masak pakai air kaldu, suwiran ayam/telur rebus, dan daun bawang!",
        alternatif: "1) <b>Bubur Oat Ayam Suwir:</b> Rasanya mirip bubur ayam tapi jauh lebih tinggi serat!<br>2) <b>Overnight Oats:</b> Rendam oat dengan susu/yogurt rendah lemak di kulkas semalaman.<br>3) <b>Ganti Bahan Lain:</b> <b>2 lembar Roti Gandum</b> (~140 kkal) atau <b>Ubi Kukus 150g</b> (~130 kkal)."
      },
      "buah": {
        nama: "Buah Segar (Apel / Pepaya / Pisang / Pir / Jambu / Semangka)",
        porsiAman: "1 porsi sedang (100–150 gram, ~70–90 kkal)",
        caraMasak: "dikonsumsi langsung dalam kondisi segar atau dingin tanpa tambahan kental manis/sirup gula",
        caraOlahDetail: "1) Potong 100–150g buah segar dan simpan di kulkas biar segar dimakan saat jam camilan sore (pukul 15.30–16.30).<br>2) Kalau mau dibuat jus/smoothie, <b>blender beserta ampasnya tanpa gula pasir/kental manis</b> ya!",
        alternatif: "1) <b>Rujak Buah Tanpa Gula Berlebih:</b> Segar untuk siang hari.<br>2) <b>Buah Potong + Yogurt Plain:</b> Camilan sehat yang bagus buat pencernaan.<br>3) <b>Pepaya / Apel Potong:</b> Paling ampuh nahan lapar malam hari."
      }
    };

    function showToast(msg) {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.style.display = "block";
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(() => { t.style.display = "none"; }, 3200);
    }

    // FUNGSI VALIDASI KOLOM INPUT (MENAMPILKAN KETERANGAN MERAH DI BAWAH KOLOM)
    function setFieldError(inputId, errId, message) {
      const inp = document.getElementById(inputId);
      const err = document.getElementById(errId);
      if (message) {
        inp.classList.add("input-invalid");
        err.textContent = message;
        err.classList.add("show");
        return false;
      } else {
        inp.classList.remove("input-invalid");
        err.textContent = "";
        err.classList.remove("show");
        return true;
      }
    }

    function isValidEmailFormat(email) {
      // Cek format email standar (harus ada teks, @, domain, dan titik seperti .com / .id)
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateEmailField(inputId, errId) {
      const val = document.getElementById(inputId).value.trim();
      if (!val) {
        return setFieldError(inputId, errId, "Email wajib diisi.");
      }
      if (!isValidEmailFormat(val)) {
        return setFieldError(inputId, errId, "Email salah! Masukkan format email yang benar (contoh: nama@gmail.com).");
      }
      return setFieldError(inputId, errId, "");
    }

    // FUNGSI TOMBOL MATA UNTUK MELIHAT / MENYEMBUNYIKAN PASSWORD
    function togglePassword(inputId, iconId) {
      const inp = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (inp.type === "password") {
        inp.type = "text";
        icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
      } else {
        inp.type = "password";
        icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      }
    }

    function validatePassField(inputId, errId) {
      const val = document.getElementById(inputId).value.trim();
      if (!val) {
        return setFieldError(inputId, errId, "Password wajib diisi.");
      }
      if (val.length < 8) {
        return setFieldError(inputId, errId, "Password kurang dari 8 karakter! Minimal harus 8 karakter.");
      }
      return setFieldError(inputId, errId, "");
    }

    function validateNameField() {
      const val = document.getElementById("regName").value.trim();
      if (!val) {
        return setFieldError("regName", "errRegName", "Nama lengkap wajib diisi.");
      }
      return setFieldError("regName", "errRegName", "");
    }

    // RENDER DAFTAR EMAIL TERDAFTAR (DATALIST & PILIHAN TOMBOL AKUN CEPAT)
    function renderEmailSuggestions() {
      const listEl = document.getElementById("registeredEmailsList");
      const wrapEl = document.getElementById("emailSuggestionsWrap");
      if (!listEl) return;

      listEl.innerHTML = "";
      if (wrapEl) wrapEl.innerHTML = "";

      const users = state.registeredUsers || [];
      if (users.length === 0) return;

      // 1. Masukkan ke Datalist bawaan browser
      users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.email;
        opt.label = `${u.nama} (${u.email})`;
        listEl.appendChild(opt);
      });

      // 2. Tampilkan pil tombol akun tersimpan jika ada akun terdaftar
      if (wrapEl) {
        const container = document.createElement("div");
        container.className = "email-suggestions-box";

        const label = document.createElement("div");
        label.style.fontSize = "11px";
        label.style.color = "var(--text-muted)";
        label.style.fontWeight = "600";
        label.style.width = "100%";
        label.style.marginTop = "4px";
        label.textContent = "Pilihan Akun Terdaftar (Klik untuk memilih):";
        container.appendChild(label);

        users.forEach(u => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "email-badge-pill";
          btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${u.email}`;
          btn.onclick = () => selectLoginEmail(u.email);
          container.appendChild(btn);
        });
        wrapEl.appendChild(container);
      }
    }

    function selectLoginEmail(email) {
      const inp = document.getElementById("loginEmail");
      if (inp) {
        inp.value = email;
        validateEmailField("loginEmail", "errLoginEmail");
      }
      const passInp = document.getElementById("loginPassword");
      if (passInp) passInp.focus();
    }

    function switchAuthTab(mode) {
      const tabWrap = document.getElementById("authTabsContainer");
      const formLog = document.getElementById("formLogin");
      const formReg = document.getElementById("formRegister");
      const formForgot = document.getElementById("formForgotPassword");

      if (mode === "forgot") {
        if (tabWrap) tabWrap.style.display = "none";
        if (formLog) formLog.style.display = "none";
        if (formReg) formReg.style.display = "none";
        if (formForgot) formForgot.style.display = "block";

        // Salin email dari form login jika sebelumnya sudah diketik/dipilih
        const currentEmail = document.getElementById("loginEmail") ? document.getElementById("loginEmail").value.trim() : "";
        const forgotInp = document.getElementById("forgotEmail");
        if (forgotInp && currentEmail) {
          forgotInp.value = currentEmail;
        }
      } else {
        if (tabWrap) tabWrap.style.display = "flex";
        document.getElementById("tabBtnLogin").classList.toggle("active", mode === "login");
        document.getElementById("tabBtnRegister").classList.toggle("active", mode === "register");
        if (formLog) formLog.style.display = mode === "login" ? "block" : "none";
        if (formReg) formReg.style.display = mode === "register" ? "block" : "none";
        if (formForgot) formForgot.style.display = "none";
      }

      // Bersihkan pesan error saat berpindah tab
      ["loginEmail", "loginPassword", "regName", "regEmail", "regPassword", "forgotEmail", "forgotNewPass", "forgotConfirmPass"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("input-invalid");
      });
      ["errLoginEmail", "errLoginPass", "errRegName", "errRegEmail", "errRegPass", "errForgotEmail", "errForgotPass", "errForgotConfirm"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ""; el.classList.remove("show"); }
      });
    }

    function validateForgotConfirmPass() {
      const p1 = document.getElementById("forgotNewPass").value.trim();
      const p2 = document.getElementById("forgotConfirmPass").value.trim();
      if (!p2) {
        return setFieldError("forgotConfirmPass", "errForgotConfirm", "Konfirmasi password wajib diisi.");
      }
      if (p1 !== p2) {
        return setFieldError("forgotConfirmPass", "errForgotConfirm", "Konfirmasi password tidak cocok dengan password baru.");
      }
      return setFieldError("forgotConfirmPass", "errForgotConfirm", "");
    }

    function handleResetPassword() {
      const validEmail = validateEmailField("forgotEmail", "errForgotEmail");
      const validPass = validatePassField("forgotNewPass", "errForgotPass");
      const validConfirm = validateForgotConfirmPass();
      if (!validEmail || !validPass || !validConfirm) return;

      const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
      const newPass = document.getElementById("forgotNewPass").value.trim();

      const foundUser = state.registeredUsers.find(u => u.email.toLowerCase() === email);
      if (!foundUser) {
        setFieldError("forgotEmail", "errForgotEmail", "Email tidak terdaftar! Silakan periksa kembali email akunmu.");
        showToast("Email tidak ditemukan dalam daftar akun terdaftar.");
        return;
      }

      // Update password baru di state & localStorage
      foundUser.password = newPass;
      try {
        localStorage.setItem("dietbuddy_users_v2", JSON.stringify(state.registeredUsers));
      } catch (e) {}

      // Otomatis isikan ke form login
      const loginEmailInp = document.getElementById("loginEmail");
      const loginPassInp = document.getElementById("loginPassword");
      if (loginEmailInp) loginEmailInp.value = email;
      if (loginPassInp) loginPassInp.value = newPass;

      // Bersihkan form forgot
      document.getElementById("forgotNewPass").value = "";
      document.getElementById("forgotConfirmPass").value = "";

      showToast(`Password untuk ${email} berhasil diperbarui! Silakan klik Masuk Sekarang.`);
      switchAuthTab("login");
    }

    function handleRegister() {
      const validName = validateNameField();
      const validEmail = validateEmailField("regEmail", "errRegEmail");
      const validPass = validatePassField("regPassword", "errRegPass");
      if (!validName || !validEmail || !validPass) {
        return;
      }

      const nama = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim().toLowerCase();
      const pass = document.getElementById("regPassword").value.trim();

      // Simpan atau perbarui akun di daftar pengguna terdaftar
      const existing = state.registeredUsers.find(u => u.email.toLowerCase() === email);
      if (existing) {
        existing.nama = nama;
        existing.password = pass;
      } else {
        state.registeredUsers.push({ nama: nama, email: email, password: pass });
      }
      try {
        localStorage.setItem("dietbuddy_users_v2", JSON.stringify(state.registeredUsers));
      } catch (e) {}

      // Perbarui dropdown dan pil pilihan email
      renderEmailSuggestions();

      // Bersihkan form pendaftaran
      document.getElementById("regName").value = "";
      document.getElementById("regEmail").value = "";
      document.getElementById("regPassword").value = "";

      // Otomatis isikan email yang baru didaftarkan ke kolom login!
      const loginEmailInp = document.getElementById("loginEmail");
      const loginPassInp = document.getElementById("loginPassword");
      if (loginEmailInp) {
        loginEmailInp.value = email;
        validateEmailField("loginEmail", "errLoginEmail");
      }
      if (loginPassInp) loginPassInp.value = "";

      showToast(`Pendaftaran akun "${email}" berhasil! Email sudah otomatis terisi, silakan masukkan password Anda.`);
      switchAuthTab("login");
      if (loginPassInp) setTimeout(() => loginPassInp.focus(), 250);
    }

    function handleLogin() {
      const validEmail = validateEmailField("loginEmail", "errLoginEmail");
      const validPass = validatePassField("loginPassword", "errLoginPass");
      if (!validEmail || !validPass) {
        return;
      }

      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const pass = document.getElementById("loginPassword").value.trim();

      // Cek apakah email sudah terdaftar di sistem
      const foundUser = state.registeredUsers.find(u => u.email.toLowerCase() === email);
      if (!foundUser) {
        setFieldError("loginEmail", "errLoginEmail", "Akun belum terdaftar! Silakan daftar akun terlebih dahulu sebelum masuk.");
        showToast("Akun belum terdaftar. Silakan daftar terlebih dahulu di tab Daftar Akun.");
        return;
      }

      // Cek apakah password sesuai dengan yang didaftarkan
      if (foundUser.password.trim() !== pass) {
        setFieldError("loginPassword", "errLoginPass", "Password yang Anda masukkan salah.");
        return;
      }

      state.user.nama = foundUser.nama;
      state.user.email = foundUser.email;
      state.loggedIn = true;
      document.getElementById("authWrapper").style.display = "none";
      document.getElementById("dashboardLayout").classList.add("active");
      updateAllViews();
      initConsultChat();
      navigateTo("home");
    }

    function handleLogout() {
      state.loggedIn = false;
      document.getElementById("dashboardLayout").classList.remove("active");
      document.getElementById("authWrapper").style.display = "flex";
      renderEmailSuggestions();
      switchAuthTab("login");
      showToast("Berhasil keluar dari akun.");
    }

    function navigateTo(screenId) {
      document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));
      document.getElementById("screen-" + screenId).classList.add("active");

      ["home", "menu", "chat", "settings"].forEach(id => {
        const sBtn = document.getElementById("sidenav-" + id);
        if (sBtn) sBtn.classList.toggle("active", id === screenId);
      });

      const profBtn = document.getElementById("topProfileBtn");
      if (profBtn) profBtn.classList.toggle("active", screenId === "profile");

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function calculateMetrics() {
      const bb = parseFloat(state.dataDiri.berat_badan);
      const tb = parseFloat(state.dataDiri.tinggi_badan);
      const umur = parseInt(state.dataDiri.umur);
      const gender = state.dataDiri.jenis_kelamin;
      const faktor = parseFloat(state.dataDiri.faktor_aktivitas);
      const delta = parseInt(state.dataDiri.kalori_delta || -450);

      const tbM = tb / 100.0;
      const bmi = +(bb / (tbM * tbM)).toFixed(1);
      let kategori = "Normal";
      if (bmi < 18.5) kategori = "Kurus";
      else if (bmi < 25.0) kategori = "Normal";
      else if (bmi < 30.0) kategori = "Berlebih";
      else kategori = "Obesitas";

      let bmr = gender === "Laki-laki"
        ? Math.round(10 * bb + 6.25 * tb - 5 * umur + 5)
        : Math.round(10 * bb + 6.25 * tb - 5 * umur - 161);
      let minAman = gender === "Laki-laki" ? 1500 : 1200;

      const tdee = Math.round(bmr * faktor);
      let targetKal = tdee + delta;
      let catatan = `Target kalori berada dalam batas aman (minimal ${minAman} kkal/hari).`;
      if (targetKal < minAman) {
        targetKal = minAman;
        catatan = `Disesuaikan ke batas aman minimum (${minAman} kkal/hari).`;
      }

      state.hasil = { bmi, kategori_bmi: kategori, bmr, tdee, target_kalori: targetKal, catatan_aman: catatan };
    }

    function saveDataDiriAndRecalculate() {
      const bb = parseFloat(document.getElementById("inputBB").value);
      const tb = parseFloat(document.getElementById("inputTB").value);
      const umur = parseInt(document.getElementById("inputUmur").value);

      if (isNaN(bb) || bb < 25 || bb > 300 || isNaN(tb) || tb < 100 || tb > 250 || isNaN(umur) || umur < 12 || umur > 100) {
        showToast("Mohon isi berat, tinggi, dan umur dengan angka yang wajar.");
        return;
      }

      const rawGoal = document.getElementById("inputGoal").value.split("|");
      state.dataDiri.berat_badan = bb;
      state.dataDiri.tinggi_badan = tb;
      state.dataDiri.umur = umur;
      state.dataDiri.jenis_kelamin = document.getElementById("inputGender").value;
      state.dataDiri.faktor_aktivitas = parseFloat(document.getElementById("inputActivity").value);
      state.dataDiri.kalori_delta = parseInt(rawGoal[0]);
      state.dataDiri.target_diet = rawGoal[1];

      calculateMetrics();
      updateAllViews();
      initConsultChat();
      showToast("Data diri berhasil disimpan & dihitung ulang!");
      navigateTo("home");
    }

    // CHAT KONSULTASI AI
    function initConsultChat() {
      const firstName = state.user.nama.split(" ")[0];
      const box = document.getElementById("consultChatBox");
      box.innerHTML = `
        <div class="bubble bubble-ai">
          Hai <b>${firstName}</b>! Senang banget bisa nemenin perjalanan diet sehatmu hari ini.<br>
          Saat ini kamu lagi fokus di program <b>${state.dataDiri.target_diet}</b> dengan target <b>${state.hasil.target_kalori} kkal/hari</b>.<br><br>
          Jangan sungkan cerita atau tanya apa aja ke aku ya! Mau tanya soal <i>tukar bahan makanan di kulkas, pengen jajan bakso/seblak, tips olahraga,</i> atau lagi lapar malam hari? Yuk, ketik aja di bawah!
        </div>
      `;
    }

    function sendQuickQuestion(q) {
      document.getElementById("consultInput").value = q;
      sendConsultMessage();
    }

    async function sendConsultMessage() {
      const input = document.getElementById("consultInput");
      const text = input.value.trim();
      if (!text) return;

      const box = document.getElementById("consultChatBox");
      if (state.sisaChatGratis <= 0) {
        box.innerHTML += `<div class="bubble bubble-ai" style="border-color:#F59E0B; background:#FFFBEB;"><b>Kuota Konsultasi Gratis Habis (0/3)</b><br>Wah, jatah 3 kali ngobrol gratis kamu hari ini udah kepakai semua nih. Yuk, aktifkan paket <b>Berlangganan Premium</b> (mulai Rp 25.000/bulan) biar kita bisa lanjut konsultasi sepuasnya tanpa batas!</div>`;
        box.scrollTop = box.scrollHeight;
        showToast("Kuota 3x chat gratis sudah habis. Silakan berlangganan Premium untuk akses tanpa batas.");
        return;
      }

      box.innerHTML += `<div class="bubble bubble-user">${text}</div>`;
      input.value = "";
      state.sisaChatGratis = state.sisaChatGratis - 1;
      updateAllViews();

      // Tampilkan indikator sedang berpikir (jeda ~1.8 detik agar terasa alami seperti sedang mengetik)
      const loadingId = "ai-loading-" + Date.now();
      box.innerHTML += `<div class="bubble bubble-ai" id="${loadingId}" style="color:var(--text-muted); font-style:italic;">Dr. Buddy AI sedang berpikir & menyiapkan saran terbaik buatmu...</div>`;
      box.scrollTop = box.scrollHeight;

      const [reply] = await Promise.all([
        getAiConsultationReply(text),
        new Promise(resolve => setTimeout(resolve, 1800))
      ]);

      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) {
        loadingEl.style.color = "";
        loadingEl.style.fontStyle = "";
        loadingEl.innerHTML = reply;
      } else {
        box.innerHTML += `<div class="bubble bubble-ai">${reply}</div>`;
      }
      box.scrollTop = box.scrollHeight;
    }

    async function getAiConsultationReply(question) {
      const q = question.toLowerCase().trim();
      const firstName = state.user.nama.split(" ")[0];
      const allKeys = Object.keys(foodSubstituteDB);
      const mentionedFoods = allKeys.filter(k => q.includes(k));
      const tk = state.hasil.target_kalori;
      const mealCal = Math.round(tk * 0.35);
      const airLiter = (state.dataDiri.berat_badan * 0.035).toFixed(1);

      // Simpan topik bahan makanan terakhir agar pertanyaan lanjutan ("hah maksudnya gimana", "cara masaknya gimana", "alternatif lainnya apa") tetap nyambung!
      if (mentionedFoods.length > 0) {
        state.lastTopicFood = mentionedFoods[mentionedFoods.length - 1];
      }
      const activeFoodKey = mentionedFoods.length > 0 ? mentionedFoods[mentionedFoods.length - 1] : (state.lastTopicFood || "ikan");
      const activeFood = foodSubstituteDB[activeFoodKey] || foodSubstituteDB["ikan"];

      // Deteksi jenis pertanyaan pengguna
      const isCookingHowTo = q.includes("cara") || q.includes("kelola") || q.includes("mengelola") || q.includes("olah") || q.includes("mengolah") || q.includes("masak") || q.includes("bikin") || q.includes("buat") || q.includes("resep") || q.includes("bumbu") || q.includes("pepes") || q.includes("kukus") || q.includes("panggang") || q.includes("bakar") || q.includes("rebus") || q.includes("tumis") || q.includes("ungkep");
      const isAskingAlternative = q.includes("alternatif") || q.includes("saran") || q.includes("selain") || q.includes("pengganti") || q.includes("lainnya") || q.includes("apa lagi") || q.includes("bosan") || q.includes("pilihan") || q.includes("rekomendasi");
      const isSwapIntent = q.includes("ganti") || q.includes("tukar") || q.includes("ubah") || q.includes("ke ") || q.includes("jadi ") || q.includes("adanya") || q.includes("cuma ada") || q.includes("ga ada") || q.includes("gak ada") || q.includes("tidak ada") || q.includes("alergi");
      const isFollowUpClarification = q.includes("maksud") || q.includes("mksd") || q.includes("hah") || q.includes("gimana") || q.includes("gmna") || q.includes("gimna") || q.includes("contoh") || q.includes("jelasin") || q.includes("terus");

      // 1. CEK INTENSI MENUKAR 2 BAHAN MAKANAN SPESIFIK (MISAL: GANTI IKAN KE AYAM)
      if (isSwapIntent && mentionedFoods.length >= 2) {
        mentionedFoods.sort((a, b) => q.indexOf(a) - q.indexOf(b));
        const fromKey = mentionedFoods[0];
        const toKey = mentionedFoods[mentionedFoods.length - 1];
        const fromFood = foodSubstituteDB[fromKey];
        const toFood = foodSubstituteDB[toKey];
        state.lastTopicFood = toKey;

        return `Bisa banget dong, <b>${firstName}</b>! Diet itu gak boleh ribet kok. Kamu bisa langsung tukar <b>${fromFood.nama}</b> pakai <b>${toFood.nama}</b>:<br><br>` +
          `• <b>Takaran Porsi Pas Buatmu:</b> Gunakan <b>${toFood.porsiAman}</b> untuk sekali makan utama (~${mealCal} kkal).<br>` +
          `• <b>Cara Mengolahnya:</b> ${toFood.caraOlahDetail}<br>` +
          `• <b>Alternatif Lain Kalau Bosan:</b><br>${toFood.alternatif}<br><br>` +
          `Nasi dan sayurannya tetap lanjut seperti biasa ya. Semangat terus, kamu keren banget udah konsisten!`;
      }

      // 2. CEK PERTANYAAN CARA MENGOLAH / MENGELOLA / MEMASAK / RESEP (MISAL: "hah mksdnya, cara mengelola pepes ikan gimna")
      if (isCookingHowTo && (mentionedFoods.length >= 1 || isFollowUpClarification || q.includes("pepes") || q.includes("sup") || q.includes("menu") || q.includes("lauk"))) {
        const targetKey = mentionedFoods.length >= 1 ? mentionedFoods[mentionedFoods.length - 1] : (q.includes("pepes") && !mentionedFoods.length ? "ikan" : activeFoodKey);
        const info = foodSubstituteDB[targetKey] || activeFood;
        state.lastTopicFood = targetKey;

        return `Oalah, maksudnya gini lho <b>${firstName}</b>! Cara mengolah <b>${info.nama}</b> biar enak, praktis, dan tetap rendah kalori buat program dietmu itu gampang banget:<br><br>` +
          `• <b>Cara Mengolah Praktis (Tanpa Digoreng Minyak):</b><br>${info.caraOlahDetail}<br><br>` +
          `• <b>Takaran Porsi Sekali Makan:</b><br>Cukup <b>${info.porsiAman}</b> (pas banget buat jatah makan utamamu ~${mealCal} kkal dari target <b>${tk} kkal/hari</b>).<br><br>` +
          `• <b>3 Alternatif Lain (Kalau Gak Sempat / Gak Ada Bahannya):</b><br>${info.alternatif}<br><br>` +
          `Gimana, gampang banget kan dipraktikkan di rumah? Kalau mau tanya bahan lain, langsung ketik aja ya!`;
      }

      // 3. CEK PERTANYAAN MINTA SARAN / ALTERNATIF PENGGANTI BAHAN
      if ((isAskingAlternative || isSwapIntent) && (mentionedFoods.length >= 1 || isFollowUpClarification)) {
        return `Siap <b>${firstName}</b>! Buat ganti atau variasi dari <b>${activeFood.nama}</b> supaya kamu gak bosan dan tetap sesuai target <b>${tk} kkal/hari</b>, ini 3 alternatif terbaik yang bisa kamu pilih:<br><br>` +
          `${activeFood.alternatif}<br><br>` +
          `• <b>Saran Cara Masak Biar Praktis:</b><br>${activeFood.caraOlahDetail}<br><br>` +
          `Kamu paling suka atau paling gampang cari bahan yang nomor berapa nih di rumah?`;
      }

      // 4. CEK SEMUA PERTANYAAN YANG MENYEBUT BAHAN MAKANAN DI DATABASE (TANPA SYARAT KATA KUNCI SEMPIT)
      if (mentionedFoods.length >= 1) {
        const listBahanText = mentionedFoods.map(k => `<b>${foodSubstituteDB[k].nama}</b> (${foodSubstituteDB[k].porsiAman})`).join(" + ");
        return `Pilihan mantap nih, <b>${firstName}</b>! <b>${activeFood.nama}</b> itu bagus banget buat bantu capai target <b>${tk} kkal/hari</b> kamu:<br><br>` +
          `• <b>Takaran Porsi Amannya:</b> Gunakan ${listBahanText}.<br>` +
          `• <b>Cara Mengolah Biar Enak & Sehat:</b><br>${activeFood.caraOlahDetail}<br><br>` +
          `• <b>Pilihan Alternatif Kalau Mau Variasi:</b><br>${activeFood.alternatif}<br><br>` +
          `Jangan lupa dampingi sama sayur hijau dan air putih <b>${airLiter} liter/hari</b> ya. Semangat terus!`;
      }

      // 5. CEK PERTANYAAN JAJANAN / MAKANAN FAVORIT (BAKSO, SEBLAK, GORENGAN, MIE AYAM, NASI PADANG, MARTABAK, ES KRIM, COKLAT)
      const jajananMap = [
        {
          keys: ["gorengan", "bakwan", "risol", "mendoan", "cireng", "kentang goreng"],
          nama: "Gorengan / Camilan Gurih",
          kal: "130–180 kkal per potong",
          tips: "Cukup icip <b>1 potong aja</b> buat obat kangen dan tiriskan minyaknya pakai tisu makan.",
          alt: "1) <b>Tempe/Tahu Panggang Teflon:</b> Tetap gurih renyah tapi hemat ~100 kkal!<br>2) <b>Edamame Rebus / Jagung Rebus:</b> Gurih alami dan tinggi serat.<br>3) <b>Telur Rebus Tabur Lada Cabai:</b> Kenyangnya awet sampai jam makan berikutnya."
        },
        {
          keys: ["bakso", "pentol", "cilok", "soto", "rawon", "sup", "kuah"],
          nama: "Bakso / Makanan Berkuah",
          kal: "320–400 kkal per mangkuk",
          tips: "Pilih <b>bakso daging urat/halus tanpa gajih</b> (4–5 butir), minta bihun setengah porsi, banyakin sayur sawi/tauge, dan kuahnya jangan dihabiskan semua biar gak kelebihan garam.",
          alt: "1) <b>Soto Ayam Kuah Bening (Tanpa Santan):</b> Tinggi protein dan segar (~310 kkal).<br>2) <b>Sup Dada Ayam / Ikan Tomat:</b> Lebih rendah lemak dan bikin kenyang.<br>3) <b>Bakso Bikin Sendiri / Kuah Kaldu Telur Sawi:</b> Jauh lebih aman buat progres dietmu!"
        },
        {
          keys: ["seblak", "pedas", "mie instan", "indomie", "mie ayam", "ramen", "kwetiau", "pasta"],
          nama: "Seblak / Mie Pedas Favorit",
          kal: "380–480 kkal per porsi",
          tips: "Boleh kok sesekali (1x seminggu). Triknya: minta <b>kuah jangan berminyak, bumbu setengah aja, kurangi kerupuk aci</b>, lalu ganti isiannya pakai <b>telur, dada ayam, dan sayur sawi yang banyak</b>!",
          alt: "1) <b>Seblak Diet Kuah Bening:</b> Isian telur rebus, tahu putih, jamur, dan sawi hijau (~250 kkal).<br>2) <b>Bihun / Soun Kuah Pedas Tomat:</b> Lebih ramah kalori dibanding kerupuk basah.<br>3) <b>Sup Tom Yam Ikan/Udang:</b> Tetap pedas segar tapi tinggi protein!"
        },
        {
          keys: ["padang", "rendang", "sate", "nasi goreng", "pecel", "gado", "ayam bakar", "warteg"],
          nama: "Makan di Luar / Nasi Padang / Warteg",
          kal: "450–550 kkal per porsi",
          tips: "Ambil <b>nasi setengah porsi (6–7 sdm)</b>, pilih lauk yang <b>dibakar/dikukus/pepes</b> (hindari guyuran kuah santan kental), dan minta sayur rebus atau lalapan timun yang banyak.",
          alt: "1) <b>Ayam Bakar / Ikan Bakar + Lalapan:</b> Protein tinggi dan minim minyak (~420 kkal).<br>2) <b>Sate Ayam 8–10 Tusuk (Bumbu Kacang Dipisah 1 sdm):</b> Enak dan mengenyangkan.<br>3) <b>Menu Warteg Sehat:</b> Nasi setengah + Telur Dadar/Ayam Ungkep + Sayur Bening + Tempe."
        },
        {
          keys: ["manis", "coklat", "es krim", "kue", "martabak", "roti bakar", "donat", "biskuit", "permen", "dessert"],
          nama: "Camilan Manis / Dessert",
          kal: "200–350 kkal per porsi",
          tips: "Makan <b>1–2 potong kecil aja setelah makan siang</b> (jangan pas perut kosong supaya gula darah gak melonjak), lalu minum segelas air putih.",
          alt: "1) <b>Buah Dingin + Yogurt Plain:</b> Manis segar alami (~110 kkal).<br>2) <b>Pisang Kukus / Panggang Teflon Tabur Coklat Bubuk:</b> Enak banget buat pengganti kue!<br>3) <b>Dark Chocolate (2 kotak kecil) + Apel Potong:</b> Bikin mood naik tanpa merusak kalori."
        }
      ];
      for (const item of jajananMap) {
        if (item.keys.some(k => q.includes(k))) {
          return `Tenang aja <b>${firstName}</b>, diet bareng DietBuddy itu gak boleh bikin kamu stres! Kalau lagi pengen <b>${item.nama}</b> (~${item.kal}), <b>boleh kok</b> asal tahu trik dan alternatifnya:<br><br>` +
            `• <b>Trik Makan Aman:</b> ${item.tips}<br><br>` +
            `• <b>3 Alternatif Lebih Sehat & Rendah Kalori:</b><br>${item.alt}<br><br>` +
            `Kalau siang udah icip ini, nanti malam pilih menu yang ringan seperti sayur bening dan protein kukus/rebus ya!`;
        }
      }

      // 6. CEK PERTANYAAN TENTANG MINUMAN (KOPI, BOBA, TEH MANIS, SUSU, JUS, AIR PUTIH)
      if (q.includes("kopi") || q.includes("boba") || q.includes("teh") || q.includes("minum") || q.includes("susu") || q.includes("jus") || q.includes("air") || q.includes("matcha") || q.includes("soda")) {
        return `Pertanyaan bagus banget nih, <b>${firstName}</b>! Sering kali kalori tambahan justru datang dari minuman manis:<br><br>` +
          `• <b>Saran Saat Pengen Minuman Segar:</b> Kalau pesan kopi susu, matcha, atau es teh, selalu minta <b>less sugar (gula 25%)</b> atau <b>no sugar</b>.<br><br>` +
          `• <b>3 Alternatif Minuman Ramah Diet:</b><br>` +
          `1) <b>Es Americano / Kopi Hitam + Susu Low-Fat:</b> Cuma ~40–60 kkal dan bantu bakar energi.<br>` +
          `2) <b>Es Teh Tawar + Perasan Jeruk Nipis (Lemon Tea Tanpa Gula):</b> Segar banget di siang hari (~10 kkal).<br>` +
          `3) <b>Infused Water / Air Putih Dingin (${airLiter} liter/hari):</b> Terbaik buat berat badanmu (${state.dataDiri.berat_badan} kg) agar metabolisme lancar!`;
      }

      // 7. CEK PERTANYAAN TENTANG OLAHRAGA / AKTIVITAS FISIK / PERUT BUNCIT
      if (q.includes("olahraga") || q.includes("gym") || q.includes("lari") || q.includes("jalan") || q.includes("senam") || q.includes("workout") || q.includes("perut") || q.includes("buncit") || q.includes("lemak") || q.includes("kardio") || q.includes("gerak")) {
        return `Semangat olahragamu keren banget, <b>${firstName}</b>! Buat kondisi tubuhmu (BMI <b>${state.hasil.bmi} — ${state.hasil.kategori_bmi}</b>), pilih olahraga yang nyaman biar konsisten:<br><br>` +
          `• <b>Saran Durasi Efektif:</b> Cukup <b>25–30 menit (3–4x seminggu)</b> sudah membakar ~180–220 kkal.<br><br>` +
          `• <b>3 Pilihan Alternatif Olahraga Praktis (Bisa di Kos/Rumah):</b><br>` +
          `1) <b>Jalan Cepat Pagi/Sore (Brisk Walk):</b> Paling aman buat sendi dan efektif bakar lemak perut.<br>` +
          `2) <b>Senam Aerobik / Dance Workout YouTube (20 Menit):</b> Seru di dalam kamar sambil dengerin musik!<br>` +
          `3) <b>Latihan Kencangkan Perut (Plank 30 detik + Squat 12x):</b> Lakukan 3 set sebelum mandi sore.<br><br>` +
          `Padukan sama target makan <b>${tk} kkal/hari</b>, dijamin badan makin bugar dan enteng!`;
      }

      // 8. CEK PERTANYAAN TENTANG LAPAR MALAM / CAMILAN / JAM MAKAN / SARAPAN / MAKAN SIANG / MAAG
      if (q.includes("malam") || q.includes("lapar") || q.includes("camilan") || q.includes("ngemil") || q.includes("snack") || q.includes("jam makan") || q.includes("jadwal") || q.includes("puasa") || q.includes("maag") || q.includes("lambung") || q.includes("sarapan") || q.includes("siang") || q.includes("pagi") || q.includes("telat")) {
        return `Jangan khawatir <b>${firstName}</b>, saat diet kamu <b>gak boleh menahan lapar sampai lemas atau sakit maag</b> ya!<br><br>` +
          `• <b>Saran Jadwal Makan Ideal (${tk} kkal/hari):</b> Sarapan pukul 07.00–08.30 (~${Math.round(tk * 0.25)} kkal), Makan Siang 12.00–13.30 (~${mealCal} kkal), Camilan Sore 16.00 (~${Math.round(tk * 0.10)} kkal), dan Makan Malam sebelum 19.30 (~${ Math.round(tk * 0.30) } kkal).<br><br>` +
          `• <b>3 Alternatif Penyelamat Saat Lapar Malam / Ngemil:</b><br>` +
          `1) <b>1 Butir Telur Rebus Hangat / Sup Tahu Bening:</b> Tinggi protein, bikin perut tenang (~75–110 kkal).<br>` +
          `2) <b>1 Porsi Buah Pepaya / Apel / Pir Potong:</b> Manis segar dan kaya serat (~80 kkal).<br>` +
          `3) <b>Segelas Susu Rendah Lemak Hangat / Edamame Rebus:</b> Bantu tidur lebih nyenyak tanpa takut gemuk!`;
      }

      // 9. CEK PERTANYAAN TENTANG TARGET BERAT BADAN / BERAPA LAMA / SUSAH TURUN / TIPS KONSISTEN
      if (q.includes("berapa lama") || q.includes("susah") || q.includes("stagnan") || q.includes("turun") || q.includes("naik") || q.includes("berat") || q.includes("target") || q.includes("tips") || q.includes("konsisten") || q.includes("bmi") || q.includes("bmr")) {
        return `Aku paham banget rasanya, <b>${firstName}</b>! Yuk kita bedah progres sehat buat tubuhmu sekarang (<b>${state.dataDiri.berat_badan} kg, ${state.dataDiri.tinggi_badan} cm</b>):<br><br>` +
          `• <b>Estimasi Progres Aman:</b> Dengan menjaga kalori di <b>${tk} kkal/hari</b> (defisit sehat dari TDEE ${state.hasil.tdee} kkal), penurunan paling ideal adalah <b>0,5 – 0,75 kg per minggu (2 – 3 kg sebulan)</b>.<br><br>` +
          `• <b>3 Tips & Alternatif Kalau Berat Badan Lagi Stagnan:</b><br>` +
          `1) <b>Cek Cara Masak Lauk:</b> Kurangi gorengan tepung, ganti ke kukus/pepes/panggang teflon.<br>` +
          `2) <b>Perbanyak Protein & Air Putih (${airLiter} L/hari):</b> Supaya yang turun itu lemaknya, bukan ototmu.<br>` +
          `3) <b>Tidur Cukup 7–8 Jam:</b> Kurang tidur bikin hormon lapar naik lho. Semangat, pelan-pelan asal konsisten pasti sampai target!`;
      }

      // 10. CEK PERTANYAAN LANJUTAN ("hah maksudnya gimana", "jelasin lagi", "terus gimana")
      if (isFollowUpClarification) {
        return `Oh iya <b>${firstName}</b>, biar lebih jelas aku kasih contoh langsung yang gampang dipraktikkan buat menu harianmu (terutama olahan <b>${activeFood.nama}</b> yang lagi kita bahas):<br><br>` +
          `• <b>Cara Mengolah Praktis di Rumah:</b><br>${activeFood.caraOlahDetail}<br><br>` +
          `• <b>3 Pilihan Alternatif Penggantinya:</b><br>${activeFood.alternatif}<br><br>` +
          `• <b>Patokan Porsi Sekali Makan:</b><br>1 porsi karbohidrat (6–7 sdm nasi) + 1 porsi protein (${activeFood.porsiAman}) + 1 mangkuk sayur (~${mealCal} kkal). Kalau masih ada yang bikin bingung, tanya lagi aja ya!`;
      }

      // 11. RESPONS CERDAS & DINAMIS UNTUK PERTANYAAN BEBAS APAPUN (SELALU NYAMBUNG, BERI SARAN & 3 ALTERNATIF, TIDAK MONOTON)
      state.fallbackCounter = (state.fallbackCounter || 0) + 1;
      if (state.fallbackCounter % 2 === 1) {
        return `Pertanyaan menarik nih <b>${firstName}</b> tentang <b>"${question}"</b>! Biar tetap nyambung dan aman sama program <b>${state.dataDiri.target_diet} (${tk} kkal/hari)</b> kamu, ini saran dan alternatif praktis dariku:<br><br>` +
          `• <b>Saran Praktis Buatmu:</b><br>Setiap kali memilih makanan atau menu harian, pastikan ada sumber <b>protein (seperti ikan, ayam, telur, atau tempe)</b> dan <b>sayuran</b> supaya kamu kenyang lebih lama di porsi <b>~${mealCal} kkal sekali makan</b>.<br><br>` +
          `• <b>3 Alternatif Menu Enak & Gampang Dibuat Hari Ini:</b><br>` +
          `1) <b>Menu Kukus/Pepes:</b> Nasi hangat 6 sdm + Pepes Ikan/Tahu Kemangi + Sayur Bening (~430 kkal).<br>` +
          `2) <b>Menu Panggang Teflon:</b> Nasi 6 sdm + Dada Ayam/Tempe Panggang Bumbu Kuning + Lalapan (~450 kkal).<br>` +
          `3) <b>Menu Berkuah Segar:</b> Sup Telur Tomat + Kentang Rebus + Sawi Hijau (~390 kkal).<br><br>` +
          `Kamu lagi pengen masak sendiri di rumah atau beli makan di luar nih hari ini? Cerita aja ya!`;
      } else {
        return `Siap <b>${firstName}</b>! Menjawab pertanyaanmu soal <b>"${question}"</b>, kuncinya adalah pilih bahan yang mudah kamu dapat dan diolah dengan minim minyak:<br><br>` +
          `• <b>Tips Mengatur Porsinya:</b><br>Gunakan rumus <b>Isi Piringku DietBuddy</b>: ½ piring sayur hijau, ¼ piring lauk protein (kukus/panggang/rebus), dan ¼ piring karbohidrat (~${mealCal} kkal sekali makan).<br><br>` +
          `• <b>3 Alternatif Bahan Lauk Hemat & Mudah Dicari:</b><br>` +
          `1) <b>Telur Ayam (2 butir ~145 kkal):</b> Bisa direbus, dadar teflon tomat, atau sup telur.<br>` +
          `2) <b>Tempe & Tahu (2 potong ~140 kkal):</b> Enak dipanggang teflon kecap bawang atau dipepes.<br>` +
          `3) <b>Ikan / Dada Ayam (100–120g ~155 kkal):</b> Tinggi protein untuk jaga metabolisme tubuhmu.<br><br>` +
          `Jangan lupa minum air putih <b>${airLiter} liter/hari</b> ya. Kalau mau tanya resep atau cara masak salah satu menu di atas, langsung ketik aja!`;
      }
    }

    // FUNGSI SEDERHANA CHECK-IN HARI DIET (MUDAH DIJELASKAN SAAT PRESENTASI)
    function checkInHariIni() {
      if (state.sudahCheckInHariIni) {
        showToast("Kamu sudah melakukan check-in untuk hari ini.");
        return;
      }
      state.hariDiet = state.hariDiet + 1;
      state.sudahCheckInHariIni = true;
      updateAllViews();
      showToast("Check-in berhasil! Kamu sudah konsisten menjalankan diet selama " + state.hariDiet + " hari.");
    }

    // FUNGSI PENGATURAN AKUN & RESET CHECK-IN HARIAN
    function simpanPengaturanAkun() {
      const namaBaru = document.getElementById("setNamaInput").value.trim();
      const passBaru = document.getElementById("setNewPassInput").value.trim();

      if (!namaBaru) {
        showToast("Nama pengguna tidak boleh kosong.");
        return;
      }
      if (passBaru && passBaru.length < 8) {
        showToast("Password baru minimal harus 8 karakter.");
        return;
      }

      state.user.nama = namaBaru;
      const found = state.registeredUsers.find(u => u.email.toLowerCase() === state.user.email.toLowerCase());
      if (found) {
        found.nama = namaBaru;
        if (passBaru) found.password = passBaru;
        try {
          localStorage.setItem("dietbuddy_users_v2", JSON.stringify(state.registeredUsers));
        } catch (e) {}
      }

      document.getElementById("setNewPassInput").value = "";
      updateAllViews();
      showToast("Pengaturan akun berhasil disimpan!");
    }

    // FUNGSI REKOMENDASI MENU HARIAN (KUOTA AKUN GRATIS 1X GANTI MENU / HARI)
    const daftarPaketMenu = [
      {
        label: "Paket Menu Harian #1",
        sarapanNama: "Oatmeal Pisang & Telur Rebus",
        sarapanDesk: "4 sdm oatmeal hangat + 1 buah pisang iris + 1 butir telur ayam rebus matang dan 1 gelas air hangat.",
        siangNama: "Nasi Putih, Dada Ayam Panggang & Sayur Bening",
        siangDesk: "100g nasi putih (6-7 sdm) + 110g dada ayam panggang teflon bumbu kuning + 1 mangkuk sayur bayam jagung.",
        selinganNama: "Pepaya Potong Segar & Edamame Rebus",
        selinganDesk: "150g buah pepaya potong dingin + segenggam kecil kacang edamame rebus tinggi serat.",
        malamNama: "Pepes Ikan Segar, Tahu Kukus & Tumis Brokoli",
        malamDesk: "120g ikan pepes/panggang teflon + 1 potong tahu kukus + 1 mangkuk tumis brokoli wortel sedikit minyak."
      },
      {
        label: "Paket Menu Harian #2 (Alternatif)",
        sarapanNama: "Roti Gandum Panggang & Telur Orak-Arik",
        sarapanDesk: "2 lembar roti gandum panggang teflon + 2 butir telur orak-arik tomat tanpa mentega dan 1 gelas air hangat.",
        siangNama: "Nasi Merah, Ikan Bakar Teflon & Lalapan Sayur",
        siangDesk: "100g nasi merah hangat + 120g ikan bakar teflon sambal tomat segar + 1 mangkuk sayur asem bening.",
        selinganNama: "Apel Segar Potong & Kacang Rebus",
        selinganDesk: "1 buah apel segar potong + segenggam kecil kacang tanah/kacang hijau rebus rendah gula.",
        malamNama: "Sup Ayam Bening, Tempe Panggang & Sayur Sawi",
        malamDesk: "100g dada ayam suwir kuah sup bening + 2 potong tempe panggang teflon + 1 mangkuk sawi hijau rebus."
      }
    ];

    function gantiMenuHarian() {
      if (state.sisaMenuGratis <= 0) {
        showToast("Kuota ganti rekomendasi menu gratis hari ini sudah habis (0/1). Silakan berlangganan Premium untuk ganti menu sepuasnya.");
        return;
      }
      state.sisaMenuGratis = 0;
      state.indeksPaketMenu = 1;
      updateAllViews();
      showToast("Rekomendasi menu berhasil diganti ke Paket Alternatif! (Kuota gratis hari ini: 0/1)");
    }

    function resetCheckInHarian() {
      state.hariDiet = 2;
      state.sudahCheckInHariIni = false;
      state.sisaChatGratis = 3;
      state.sisaMenuGratis = 1;
      state.indeksPaketMenu = 0;
      updateAllViews();
      showToast("Status Check-In, kuota 3x chat AI, dan kuota 1x rekomendasi menu berhasil direset.");
    }

    function updateAllViews() {
      const firstName = state.user.nama.split(" ")[0];
      const initials = state.user.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
      document.getElementById("greetTitle").textContent = `Halo, ${firstName}!`;
      document.getElementById("topUserName").textContent = state.user.nama;
      document.getElementById("topUserInitial").textContent = initials;
      const ringkasEl = document.getElementById("badgeRingkasData");
      if (ringkasEl) ringkasEl.textContent = `${state.dataDiri.berat_badan} kg • ${state.dataDiri.tinggi_badan} cm`;

      // Update tampilan kuota chat AI gratis di bagian kanan header Konsultasi AI
      const badgeKuota = document.getElementById("badgeKuotaChat");
      if (badgeKuota) {
        if (state.sisaChatGratis > 0) {
          badgeKuota.textContent = `Kuota Konsultasi Gratis: Tersisa ${state.sisaChatGratis}x Chat`;
          badgeKuota.style.background = "var(--surface-ice)";
          badgeKuota.style.color = "var(--primary-deep)";
          badgeKuota.style.borderColor = "var(--border-blue)";
        } else {
          badgeKuota.textContent = "Kuota Gratis Habis (0/3) • Wajib Berlangganan Premium";
          badgeKuota.style.background = "#FEF2F2";
          badgeKuota.style.color = "#DC2626";
          badgeKuota.style.borderColor = "#FECACA";
        }
      }

      // Update tampilan halaman Rekomendasi Menu & kuota 1x gratis/hari
      const tk = state.hasil.target_kalori;
      const paket = daftarPaketMenu[state.indeksPaketMenu] || daftarPaketMenu[0];
      const badgeMenu = document.getElementById("badgeKuotaMenu");
      const btnMenu = document.getElementById("btnGantiMenu");
      if (badgeMenu) {
        if (state.sisaMenuGratis > 0) {
          badgeMenu.textContent = `Kuota Akun Gratis: Tersisa ${state.sisaMenuGratis}x Ganti Menu / Hari`;
          badgeMenu.style.background = "var(--surface-ice)";
          badgeMenu.style.color = "var(--primary-deep)";
          badgeMenu.style.borderColor = "var(--border-blue)";
        } else {
          badgeMenu.textContent = "Kuota Gratis Habis (0/1) • Wajib Berlangganan Premium";
          badgeMenu.style.background = "#FEF2F2";
          badgeMenu.style.color = "#DC2626";
          badgeMenu.style.borderColor = "#FECACA";
        }
      }
      if (btnMenu) {
        if (state.sisaMenuGratis > 0) {
          btnMenu.textContent = "Ganti Alternatif Menu Hari Ini (1x Gratis)";
          btnMenu.className = "btn btn-primary btn-sm";
        } else {
          btnMenu.textContent = "Kuota Ganti Menu Habis (Perlu Premium)";
          btnMenu.className = "btn btn-outline btn-sm";
        }
      }
      const elMenuHeader = document.getElementById("menuHeaderKalori");
      if (elMenuHeader) elMenuHeader.textContent = `${tk.toLocaleString('id-ID')} kkal / hari — ${paket.label}`;
      if (document.getElementById("menuKalSarapan")) {
        document.getElementById("menuKalSarapan").textContent = `${Math.round(tk * 0.25)} kkal`;
        document.getElementById("menuNamaSarapan").textContent = paket.sarapanNama;
        document.getElementById("menuDeskSarapan").textContent = paket.sarapanDesk;
        document.getElementById("menuKalSiang").textContent = `${Math.round(tk * 0.35)} kkal`;
        document.getElementById("menuNamaSiang").textContent = paket.siangNama;
        document.getElementById("menuDeskSiang").textContent = paket.siangDesk;
        document.getElementById("menuKalSelingan").textContent = `${Math.round(tk * 0.12)} kkal`;
        document.getElementById("menuNamaSelingan").textContent = paket.selinganNama;
        document.getElementById("menuDeskSelingan").textContent = paket.selinganDesk;
        document.getElementById("menuKalMalam").textContent = `${Math.round(tk * 0.28)} kkal`;
        document.getElementById("menuNamaMalam").textContent = paket.malamNama;
        document.getElementById("menuDeskMalam").textContent = paket.malamDesk;
      }

      const setNamaEl = document.getElementById("setNamaInput");
      const setEmailEl = document.getElementById("setEmailInput");
      const setInfoHariEl = document.getElementById("setInfoHariDiet");
      if (setNamaEl) setNamaEl.value = state.user.nama;
      if (setEmailEl) setEmailEl.value = state.user.email;
      if (setInfoHariEl) setInfoHariEl.textContent = `Tercatat sudah ${state.hariDiet} hari konsisten menjalankan diet`;

      // Update tampilan jumlah hari diet
      document.getElementById("badgeHariDiet").textContent = `Hari ke-${state.hariDiet} Diet`;
      document.getElementById("teksJumlahHari").textContent = `Sudah ${state.hariDiet} Hari`;
      const btnCheck = document.getElementById("btnCheckIn");
      if (state.sudahCheckInHariIni) {
        btnCheck.textContent = "Target Hari Ini Sudah Selesai";
        btnCheck.className = "btn btn-secondary";
      } else {
        btnCheck.textContent = "Check-In Target Hari Ini Selesai";
        btnCheck.className = "btn btn-primary";
      }

      document.getElementById("dispTargetKalori").innerHTML = `${tk.toLocaleString('id-ID')} <span style="font-size:15px; font-weight:600; color:var(--text-body);">kkal / hari</span>`;
      document.getElementById("dispKaloriSplit").innerHTML = `
        <span>Sarapan: ${Math.round(tk * 0.25)} kkal</span>
        <span>Siang: ${Math.round(tk * 0.35)} kkal</span>
        <span>Selingan: ${Math.round(tk * 0.12)} kkal</span>
        <span>Malam: ${Math.round(tk * 0.28)} kkal</span>
      `;
      document.getElementById("dispKategoriBmi").textContent = state.hasil.kategori_bmi;
      document.getElementById("dispProgramTarget").textContent = state.dataDiri.target_diet;
      document.getElementById("dispBmi").textContent = state.hasil.bmi;
      document.getElementById("dispBmr").textContent = state.hasil.bmr.toLocaleString('id-ID');
      document.getElementById("dispTdee").textContent = state.hasil.tdee.toLocaleString('id-ID');
      document.getElementById("dispCatatanAman").textContent = state.hasil.catatan_aman;
    }

    calculateMetrics();
    updateAllViews();
    initConsultChat();
    renderEmailSuggestions();
