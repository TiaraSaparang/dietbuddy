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
      },
      "udang": {
        nama: "Udang Segar",
        porsiAman: "100–120 gram udang kupas (~115 kkal, 24g protein tinggi)",
        caraMasak: "direbus sup tom yam bening, dikukus, atau ditumis bawang putih sedikit minyak"
      },
      "ubi": {
        nama: "Ubi Jalar / Singkong",
        porsiAman: "150 gram (1 buah sedang kukus/rebus, ~130 kkal tinggi serat)",
        caraMasak: "dikukus atau direbus hangat tanpa digoreng sebagai pengganti nasi"
      },
      "oat": {
        nama: "Oatmeal",
        porsiAman: "4–5 sendok makan (40 gram, ~150 kkal kaya serat larut)",
        caraMasak: "diseduh air hangat/susu rendah lemak dengan potongan pisang atau telur rebus"
      },
      "buah": {
        nama: "Buah Segar (Apel/Pepaya/Pisang/Pir)",
        porsiAman: "1 porsi sedang (100–150 gram, ~70–90 kkal)",
        caraMasak: "dikonsumsi langsung dalam kondisi segar tanpa tambahan kental manis atau sirup"
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

      // Tampilkan indikator sedang mengetik sementara
      const loadingId = "ai-loading-" + Date.now();
      box.innerHTML += `<div class="bubble bubble-ai" id="${loadingId}" style="color:var(--text-muted); font-style:italic;">Dr. Buddy AI sedang menganalisis pertanyaanmu...</div>`;
      box.scrollTop = box.scrollHeight;

      const reply = await getAiConsultationReply(text);
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
      const allKeys = Object.keys(foodSubstituteDB);
      const mentionedFoods = allKeys.filter(k => q.includes(k));
      const tk = state.hasil.target_kalori;
      const mealCal = Math.round(tk * 0.35);
      const airLiter = (state.dataDiri.berat_badan * 0.035).toFixed(1);

      // 1. CEK INTENSI MENGGANTI / MENUKAR BAHAN MAKANAN (MISAL: GANTI IKAN KE AYAM)
      const isSwapIntent = q.includes("ganti") || q.includes("tukar") || q.includes("ubah") || q.includes("ke ") || q.includes("jadi ") || q.includes("adanya") || q.includes("cuma ada") || q.includes("ga ada") || q.includes("gak ada") || q.includes("tidak ada") || q.includes("alergi");

      if (isSwapIntent && mentionedFoods.length >= 2) {
        mentionedFoods.sort((a, b) => q.indexOf(a) - q.indexOf(b));
        const fromKey = mentionedFoods[0];
        const toKey = mentionedFoods[mentionedFoods.length - 1];
        const fromFood = foodSubstituteDB[fromKey];
        const toFood = foodSubstituteDB[toKey];

        return `Tentu bisa! Kamu <b>tidak perlu mengubah seluruh pola makan harianmu</b>, cukup ganti <b>${fromFood.nama}</b> dengan <b>${toFood.nama}</b> yang kamu inginkan:<br><br>` +
          `1. <b>Takaran Porsi Pengganti yang Aman:</b> Gunakan <b>${toFood.porsiAman}</b> untuk porsi makan utamamu (~${mealCal} kkal).<br>` +
          `2. <b>Cara Pengolahan:</b> Sebaiknya ${toFood.caraMasak} agar kalorinya tetap pas dengan sasaran <b>${tk} kkal/hari</b>.<br>` +
          `3. <b>Pendamping Tetap Sama:</b> Sayuran dan karbohidrat pendamping tetap bisa dikonsumsi sesuai jadwal.`;
      }

      // 2. CEK PERTANYAAN TENTANG BAHAN MAKANAN SPESIFIK DI KULKAS / PORSI MAKANAN
      if (mentionedFoods.length >= 1 && (isSwapIntent || q.includes("kulkas") || q.includes("di rumah") || q.includes("porsi") || q.includes("boleh") || q.includes("bagus") || q.includes("kalori") || q.includes("makan"))) {
        const chosenKey = mentionedFoods[mentionedFoods.length - 1];
        const foodInfo = foodSubstituteDB[chosenKey];
        const listBahanText = mentionedFoods.map(k => `<b>${foodSubstituteDB[k].nama}</b> (${foodSubstituteDB[k].porsiAman})`).join(" + ");

        return `Mengenai <b>${foodInfo.nama}</b> yang kamu tanyakan, bahan tersebut sangat bagus untuk mendukung target <b>${tk} kkal/hari</b> kamu:<br><br>` +
          `• <b>Takaran Porsi Aman:</b> ${listBahanText}.<br>` +
          `• <b>Cara Pengolahan Terbaik:</b> Sebaiknya ${foodInfo.caraMasak}.<br>` +
          `• <b>Tips:</b> Padukan dengan sayuran hijau agar perut kenyang lebih lama dan pencernaan lancar.`;
      }

      // 3. CEK PERTANYAAN TENTANG JAJANAN / MAKANAN FAVORIT (BAKSO, SEBLAK, GORENGAN, MIE AYAM, NASI PADANG, MARTABAK, ES KRIM, COKLAT)
      const jajananMap = [
        { keys: ["gorengan", "bakwan", "risol", "tempe goreng", "ayam goreng"], nama: "Gorengan / Makanan Digoreng", kal: "130–180 kkal per potong", tips: "Batasi maksimal <b>1 potong</b> saja dan tiriskan minyaknya dengan tisu makanan, atau ganti cara masaknya menggunakan teflon/air fryer tanpa minyak." },
        { keys: ["bakso", "pentol", "cilok", "soto"], nama: "Bakso / Kuah Hangat", kal: "320–400 kkal per mangkuk", tips: "Pilih <b>bakso daging tanpa tetelan lemak</b>, kurangi porsi mie/bihun menjadi setengah, perbanyak sayur sawi/tauge, dan jangan habiskan seluruh kuahnya untuk mengurangi natrium (garam)." },
        { keys: ["seblak", "pedas", "mie instan", "indomie", "mie ayam", "ramen"], nama: "Seblak / Mie Berbumbu", kal: "380–480 kkal per porsi", tips: "Kamu tetap boleh makan sesekali (maksimal 1x seminggu), tetapi gunakan <b>setengah takaran bumbu/minyak</b>, kurangi kerupuk aci, dan tambahkan <b>1–2 butir telur rebus serta sayur sawi</b> agar gizinya seimbang." },
        { keys: ["padang", "rendang", "sate", "nasi goreng", "pecel", "gado"], nama: "Makanan Berbumbu / Santan", kal: "450–600 kkal per porsi", tips: "Minta <b>nasi setengah porsi saja</b>, pilih lauk ayam bakar/ikan bakar dibanding kuah santan kental, dan perbanyak sayur rebus/mentimun." },
        { keys: ["manis", "coklat", "es krim", "kue", "martabak", "roti bakar", "donat", "biskuit"], nama: "Camilan Manis / Dessert", kal: "200–350 kkal per porsi", tips: "Ambil porsi kecil (sharing atau 1–2 gigitan) setelah makan siang agar gula darah tidak melonjak tajam, lalu imbangi dengan minum air putih hangat." }
      ];
      for (const item of jajananMap) {
        if (item.keys.some(k => q.includes(k))) {
          return `Menjawab pertanyaanmu tentang <b>${item.nama}</b> (~${item.kal}):<br><br>` +
            `Saat menjalani program <b>${state.dataDiri.target_diet}</b> (target <b>${tk} kkal/hari</b>), kamu <b>tetap boleh mengonsumsinya secara terkontrol</b> dengan aturan aman berikut:<br>` +
            `• <b>Tips Porsi Aman:</b> ${item.tips}<br>` +
            `• <b>Penyesuaian Harian:</b> Jika sudah mengonsumsi menu ini di siang hari, pilih menu makan malam yang lebih ringan seperti protein kukus/rebus dan sayur bening.`;
        }
      }

      // 4. CEK PERTANYAAN TENTANG MINUMAN (KOPI, BOBA, TEH MANIS, SUSU, JUS, AIR PUTIH)
      if (q.includes("kopi") || q.includes("boba") || q.includes("teh") || q.includes("minum") || q.includes("susu") || q.includes("jus") || q.includes("air") || q.includes("matcha") || q.includes("soda")) {
        return `Mengenai minuman yang kamu tanyakan untuk mendukung target <b>${tk} kkal/hari</b>:<br><br>` +
          `• <b>Aturan Minuman Manis/Kopi/Teh:</b> Kopi hitam atau teh tawar hampir <b>0 kkal</b> dan aman untuk diet. Namun jika memakai susu kental manis, gula aren, atau boba, kalorinya bisa mencapai <b>200–350 kkal/gelas</b>. Mintalah opsi <b>less sugar / tanpa gula</b> atau gunakan susu rendah lemak.<br>` +
          `• <b>Kebutuhan Air Putih Tubuhmu:</b> Dengan berat badan <b>${state.dataDiri.berat_badan} kg</b>, kamu disarankan minum air putih minimal <b>${airLiter} liter (sekitar 8–9 gelas) per hari</b> untuk membantu metabolisme lemak.`;
      }

      // 5. CEK PERTANYAAN TENTANG OLAHRAGA / AKTIVITAS FISIK / PERUT BUNCIT
      if (q.includes("olahraga") || q.includes("gym") || q.includes("lari") || q.includes("jalan") || q.includes("senam") || q.includes("workout") || q.includes("perut") || q.includes("buncit") || q.includes("lemak") || q.includes("kardio") || q.includes("gerak")) {
        return `Untuk kondisi tubuhmu saat ini (BMI <b>${state.hasil.bmi} — ${state.hasil.kategori_bmi}</b>, TDEE <b>${state.hasil.tdee} kkal</b>), berikut kombinasi olahraga yang paling efektif:<br><br>` +
          `1. <b>Kardio Ringan–Sedang (3–4x seminggu):</b> Jalan cepat 30 menit, jogging santai, bersepeda, atau senam aerobik membakar sekitar <b>180–250 kkal/sesi</b>.<br>` +
          `2. <b>Latihan Pengencangan Otot (2x seminggu):</b> Squat, plank 30 detik, dan wall push-up di rumah selama 15 menit agar tubuh kencang dan metabolisme basal (BMR) meningkat.<br>` +
          `3. <b>Kunci Utama:</b> 70% keberhasilan perubahan berat badan berasal dari konsistensi menjaga target kalorimu di <b>${tk} kkal/hari</b>.`;
      }

      // 6. CEK PERTANYAAN TENTANG LAPAR MALAM / CAMILAN / JAM MAKAN / PUASA / MAAG
      if (q.includes("malam") || q.includes("lapar") || q.includes("camilan") || q.includes("ngemil") || q.includes("snack") || q.includes("jam makan") || q.includes("jadwal") || q.includes("puasa") || q.includes("maag") || q.includes("lambung") || q.includes("sarapan") || q.includes("telat")) {
        return `Menjawab pertanyaanmu seputar pengaturan waktu makan & rasa lapar:<br><br>` +
          `• <b>Jadwal Makan Ideal:</b> Sarapan pukul 07.00–08.30 (~${Math.round(tk * 0.25)} kkal), Makan Siang pukul 12.00–13.30 (~${Math.round(tk * 0.35)} kkal), Selingan Sore pukul 16.00 (~${Math.round(tk * 0.12)} kkal), dan Makan Malam maksimal pukul 19.30 (~${Math.round(tk * 0.28)} kkal).<br>` +
          `• <b>Solusi Lapar Malam / Ramah Lambung:</b> Jangan menahan lapar hingga asam lambung naik. Konsumsi camilan sehat <b>100–130 kkal</b> seperti 1 butir telur rebus hangat, potongan buah pepaya/pisang, atau segenggam edamame, disertai 1 gelas air hangat.`;
      }

      // 7. CEK PERTANYAAN TENTANG TARGET BERAT BADAN / BERAPA LAMA / SUSAH TURUN / TIPS KONSISTEN
      if (q.includes("berapa lama") || q.includes("susah") || q.includes("stagnan") || q.includes("turun") || q.includes("naik") || q.includes("berat") || q.includes("target") || q.includes("tips") || q.includes("konsisten") || q.includes("bmi") || q.includes("bmr")) {
        return `Berdasarkan profil tubuhmu (Berat <b>${state.dataDiri.berat_badan} kg</b>, Tinggi <b>${state.dataDiri.tinggi_badan} cm</b>, BMI <b>${state.hasil.bmi}</b>) dan program <b>${state.dataDiri.target_diet}</b>:<br><br>` +
          `• <b>Estimasi Progres yang Sehat:</b> Dengan menjaga asupan di angka <b>${tk} kkal/hari</b> (dari kebutuhan TDEE ${state.hasil.tdee} kkal), tubuhmu akan mengalami perubahan berat badan yang stabil sekitar <b>0,5 – 0,75 kg per minggu (2 – 3 kg per bulan)</b> tanpa kehilangan massa otot.<br>` +
          `• <b>Tips Agar Tidak Stagnan:</b> Pastikan tidur cukup 7–8 jam per malam, cukupi protein di setiap waktu makan, dan minum air putih minimal <b>${airLiter} liter/hari</b>.`;
      }

      // 8. COBA PANGGIL LIVE AI (UNTUK PERTANYAAN BEBAS APAPUN) DENGAN TIMEOUT CEPAT 4 DETIK
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4500);
        const promptSystem = `Kamu adalah Dr. Buddy AI, ahli gizi ramah di aplikasi web DietBuddy. Pengguna bernama ${state.user.nama} (Berat ${state.dataDiri.berat_badan} kg, Tinggi ${state.dataDiri.tinggi_badan} cm, Umur ${state.dataDiri.umur} thn, BMI ${state.hasil.bmi} ${state.hasil.kategori_bmi}, Program: ${state.dataDiri.target_diet}, Target Kalori: ${tk} kkal/hari). Jawab pertanyaan berikut secara langsung, nyambung, jelas, dan singkat (maksimal 3-4 kalimat atau poin singkat) dalam Bahasa Indonesia: "${question}"`;
        const res = await fetch("https://text.pollinations.ai/" + encodeURIComponent(promptSystem), { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const aiText = (await res.text()).trim();
          if (aiText && aiText.length > 15 && !aiText.startsWith("<!DOCTYPE")) {
            return aiText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
          }
        }
      } catch (err) {
        // Jika offline / Wi-Fi kampus lambat, lanjut ke respons pintar lokal di bawah
      }

      // 9. RESPONS KONTEKSTUAL CERDAS JIKA OFFLINE (MENJAWAB LANGSUNG TOPIK PERTANYAAN PENGGUNA)
      return `Menanggapi pertanyaanmu mengenai <b>"${question}"</b>:<br><br>` +
        `Dalam program <b>${state.dataDiri.target_diet}</b> dengan sasaran <b>${tk} kkal/hari</b>, prinsip utamanya adalah menjaga keseimbangan porsi gizi harianmu:<br>` +
        `• <b>Aturan Porsi:</b> Pastikan setiap kali makan utama (~${mealCal} kkal) tetap mengandung sumber protein (ayam/ikan/telur/tempe), serat sayuran, dan karbohidrat terukur.<br>` +
        `• <b>Keseimbangan Kalori:</b> Selama total asupan harianmu tidak melewati <b>${tk} kkal/hari</b> dan kebutuhan air putih (<b>${airLiter} liter/hari</b>) terpenuhi, progres dietmu akan tetap berjalan optimal.`;
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
