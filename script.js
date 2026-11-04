/* =====================================================================
   FILE: script.js
   FUNGSI: Mengatur Logika Validasi Login, Rumus BMI/BMR/TDEE, Rekomendasi Menu, dan Chat AI
   ===================================================================== */
    let state = {
      loggedIn: false,
      hariDiet: 2,
      sudahCheckInHariIni: false,
      sisaChatGratis: 3,
      sisaMenuGratis: 1,
      indeksPaketMenu: 0,
      registeredUsers: JSON.parse(localStorage.getItem("dietbuddy_users_v2") || "[]"),
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
        nama: "Ikan Segar",
        porsiAman: "120 gram daging ikan (1 ekor sedang, ~150 kkal, 24g protein)",
        caraMasak: "dikukus pepes, sup bening, atau panggang teflon tanpa digoreng kering"
      },
      "ayam": {
        nama: "Dada Ayam Tanpa Kulit",
        porsiAman: "100–120 gram dada ayam tanpa kulit (~165 kkal, 31g protein)",
        caraMasak: "dipanggang teflon bumbu kuning, direbus soto bening, atau ditumis sedikit minyak"
      },
      "telur": {
        nama: "Telur Ayam",
        porsiAman: "2 butir telur rebus atau orak-arik teflon (~145 kkal, 13g protein)",
        caraMasak: "direbus atau didadar tipis minyak dengan irisan tomat/sayur"
      },
      "tempe": {
        nama: "Tempe",
        porsiAman: "2 potong sedang (80–100 gram, ~150 kkal, 15g protein nabati)",
        caraMasak: "dipanggang teflon bumbu bawang/bacem atau dikukus tanpa digoreng tepung"
      },
      "tahu": {
        nama: "Tahu Putih",
        porsiAman: "2–3 potong sedang (~120 kkal, 12g protein)",
        caraMasak: "dibuat pepes tahu, sup tahu bening, atau tumis bawang putih"
      },
      "daging": {
        nama: "Daging Sapi Tanpa Lemak",
        porsiAman: "85–100 gram daging tanpa lemak (~180 kkal, 26g protein)",
        caraMasak: "direbus sup sayur bening atau tumis lada hitam sedikit minyak"
      },
      "nasi putih": {
        nama: "Nasi Putih",
        porsiAman: "100 gram (6–7 sendok makan peres, ~130 kkal)",
        caraMasak: "didampingi semangkuk sayur terlebih dahulu agar kenyang lebih lama"
      },
      "nasi merah": {
        nama: "Nasi Merah",
        porsiAman: "100–120 gram (1 centong sedang, ~120 kkal tinggi serat)",
        caraMasak: "disajikan hangat dengan lauk protein dan sayuran"
      },
      "kentang": {
        nama: "Kentang",
        porsiAman: "150 gram (1–2 buah sedang kukus/rebus, ~130 kkal)",
        caraMasak: "dikukus atau direbus sebagai pengganti nasi"
      },
      "roti": {
        nama: "Roti Gandum / Tawar",
        porsiAman: "2 lembar roti gandum (~140 kkal)",
        caraMasak: "dipanggang teflon dengan isian telur atau pisang"
      },
      "mie": {
        nama: "Mie / Bihun",
        porsiAman: "1 porsi bihun atau ¾ keping mie rebus dengan ½ takaran bumbu",
        caraMasak: "ditambah 1 mangkuk sayur sawi dan 1–2 butir telur rebus"
      },
      "sayur": {
        nama: "Sayuran Hijau (Bayam/Kangkung/Brokoli)",
        porsiAman: "1 mangkuk penuh (150 gram, ~40 kkal kaya serat)",
        caraMasak: "direbus sayur bening atau tumis bawang putih dengan 1 sdt minyak"
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

    function switchAuthTab(mode) {
      document.getElementById("tabBtnLogin").classList.toggle("active", mode === "login");
      document.getElementById("tabBtnRegister").classList.toggle("active", mode === "register");
      document.getElementById("formLogin").style.display = mode === "login" ? "block" : "none";
      document.getElementById("formRegister").style.display = mode === "register" ? "block" : "none";
      // Bersihkan pesan error saat berpindah tab
      ["loginEmail", "loginPassword", "regName", "regEmail", "regPassword"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("input-invalid");
      });
      ["errLoginEmail", "errLoginPass", "errRegName", "errRegEmail", "errRegPass"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ""; el.classList.remove("show"); }
      });
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

      document.getElementById("regName").value = "";
      document.getElementById("regEmail").value = "";
      document.getElementById("regPassword").value = "";
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";

      showToast("Pendaftaran akun berhasil! Silakan masuk menggunakan email dan password Anda.");
      switchAuthTab("login");
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
      const box = document.getElementById("consultChatBox");
      box.innerHTML = `
        <div class="bubble bubble-ai">
          Halo <b>${state.user.nama}</b>! Aku Dr. Buddy AI.<br>
          Program aktifmu saat ini: <b>${state.dataDiri.target_diet}</b> dengan sasaran <b>${state.hasil.target_kalori} kkal/hari</b>.<br><br>
          Silakan tanyakan apa saja seputar pengganti bahan makanan (misalnya <i>ganti ikan ke ayam, telur, atau tempe</i>) atau pembagian porsi makan yang aman sesuai bahan yang ada di rumahmu.
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
        box.innerHTML += `<div class="bubble bubble-ai" style="border-color:#F59E0B; background:#FFFBEB;"><b>Kuota Konsultasi Gratis Habis (0/3)</b><br>Masa percobaan 3 kali konsultasi AI gratis Anda telah selesai. Silakan beralih ke paket <b>Berlangganan Premium</b> (mulai Rp 25.000/bulan) untuk membuka akses konsultasi AI tanpa batas.</div>`;
        box.scrollTop = box.scrollHeight;
        showToast("Kuota 3x chat gratis sudah habis. Silakan berlangganan Premium untuk akses tanpa batas.");
        return;
      }

      box.innerHTML += `<div class="bubble bubble-user">${text}</div>`;
      input.value = "";
      state.sisaChatGratis = state.sisaChatGratis - 1;
      updateAllViews();

      const reply = await getAiConsultationReply(text);
      box.innerHTML += `<div class="bubble bubble-ai">${reply}</div>`;
      box.scrollTop = box.scrollHeight;
    }

    async function getAiConsultationReply(question) {
      const q = question.toLowerCase();
      const allKeys = Object.keys(foodSubstituteDB);
      const mentionedFoods = allKeys.filter(k => q.includes(k));
      const mealCal = Math.round(state.hasil.target_kalori * 0.35);

      const isSwapIntent = q.includes("ganti") || q.includes("tukar") || q.includes("ubah") || q.includes("ke ") || q.includes("jadi ") || q.includes("adanya") || q.includes("cuma ada") || q.includes("ga ada") || q.includes("gak ada") || q.includes("tidak ada");

      if (isSwapIntent && mentionedFoods.length >= 2) {
        mentionedFoods.sort((a, b) => q.indexOf(a) - q.indexOf(b));
        const fromKey = mentionedFoods[0];
        const toKey = mentionedFoods[mentionedFoods.length - 1];
        const fromFood = foodSubstituteDB[fromKey];
        const toFood = foodSubstituteDB[toKey];

        return `Tentu bisa! Kamu <b>tidak perlu mengubah seluruh pola makan harianmu</b>, cukup ganti lauk <b>${fromFood.nama}</b> dengan <b>${toFood.nama}</b> yang tersedia di rumah:<br><br>` +
          `1. <b>Takaran Porsi Pengganti yang Aman:</b> Gunakan <b>${toFood.porsiAman}</b> untuk jatah makan utama (~${mealCal} kkal).<br>` +
          `2. <b>Cara Pengolahan:</b> Sebaiknya ${toFood.caraMasak} agar kalorinya tetap sesuai dengan target <b>${state.hasil.target_kalori} kkal/hari</b>.<br>` +
          `3. <b>Pendamping Tetap Sama:</b> Sayuran dan karbohidrat di jadwal makanmu tetap bisa dikonsumsi seperti biasa.`;
      }

      if ((isSwapIntent || q.includes("kulkas") || q.includes("di rumah") || q.includes("porsi")) && mentionedFoods.length >= 1) {
        const chosenKey = mentionedFoods[mentionedFoods.length - 1];
        const foodInfo = foodSubstituteDB[chosenKey];
        const listBahanText = mentionedFoods.map(k => `<b>${foodSubstituteDB[k].nama}</b> (${foodSubstituteDB[k].porsiAman})`).join(" + ");

        return `Kita bisa manfaatkan bahan yang ada di rumah supaya tetap praktis dan sesuai sasaran <b>${state.hasil.target_kalori} kkal/hari</b>:<br><br>` +
          `• <b>Takaran Porsi Aman:</b> ${listBahanText}.<br>` +
          `• <b>Cara Masak:</b> Sebaiknya ${foodInfo.caraMasak}.<br>` +
          `• <b>Tips:</b> Gunakan bahan ini untuk menggantikan lauk di salah satu waktu makan utamamu tanpa perlu mengubah jadwal makan lainnya.`;
      }

      if (q.includes("malam") || q.includes("lapar") || q.includes("camilan")) {
        return `Jika lapar malam hari, pilih camilan ringan sekitar <b>100–130 kkal</b> tinggi protein atau serat seperti 1 butir telur rebus, segenggam edamame hangat, atau potongan pepaya/apel, lalu minum 1 gelas air hangat.`;
      }

      return `Untuk mendukung program <b>${state.dataDiri.target_diet}</b> kamu (sasaran <b>${state.hasil.target_kalori} kkal/hari</b>), pembagian kalori harian yang disarankan adalah:<br>` +
        `• <b>Sarapan Pagi:</b> ~${Math.round(state.hasil.target_kalori * 0.25)} kkal<br>` +
        `• <b>Makan Siang:</b> ~${Math.round(state.hasil.target_kalori * 0.35)} kkal<br>` +
        `• <b>Selingan Sore:</b> ~${Math.round(state.hasil.target_kalori * 0.12)} kkal<br>` +
        `• <b>Makan Malam:</b> ~${Math.round(state.hasil.target_kalori * 0.28)} kkal<br><br>` +
        `Jika ada bahan makanan yang ingin kamu tanyakan porsi penggantinya (contoh: <i>"ganti ikan ke ayam"</i> atau <i>"di kulkas cuma ada telur dan tempe"</i>), silakan tulis di sini.`;
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
