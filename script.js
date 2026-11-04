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

      // 1. CEK INTENSI MENGGANTI / MENUKAR BAHAN MAKANAN (MISAL: GANTI IKAN KE AYAM)
      const isSwapIntent = q.includes("ganti") || q.includes("tukar") || q.includes("ubah") || q.includes("ke ") || q.includes("jadi ") || q.includes("adanya") || q.includes("cuma ada") || q.includes("ga ada") || q.includes("gak ada") || q.includes("tidak ada") || q.includes("alergi");

      if (isSwapIntent && mentionedFoods.length >= 2) {
        mentionedFoods.sort((a, b) => q.indexOf(a) - q.indexOf(b));
        const fromKey = mentionedFoods[0];
        const toKey = mentionedFoods[mentionedFoods.length - 1];
        const fromFood = foodSubstituteDB[fromKey];
        const toFood = foodSubstituteDB[toKey];

        return `Bisa banget dong, <b>${firstName}</b>! Diet itu gak boleh ribet kok. Kamu cukup tukar lauk <b>${fromFood.nama}</b> pakai <b>${toFood.nama}</b> aja:<br><br>` +
          `• <b>Porsi Pas Buatmu:</b> Pakai sekitar <b>${toFood.porsiAman}</b> buat sekali makan utama (~${mealCal} kkal).<br>` +
          `• <b>Tips Masaknya:</b> Biar tetap enak tapi hemat kalori, coba ${toFood.caraMasak} ya.<br><br>` +
          `Nasi dan sayurannya tetap lanjut kayak biasa. Semangat terus ya, kamu keren banget udah jaga porsi makanmu hari ini!`;
      }

      // 2. CEK PERTANYAAN TENTANG BAHAN MAKANAN SPESIFIK DI KULKAS / PORSI MAKANAN
      if (mentionedFoods.length >= 1 && (isSwapIntent || q.includes("kulkas") || q.includes("di rumah") || q.includes("porsi") || q.includes("boleh") || q.includes("bagus") || q.includes("kalori") || q.includes("makan"))) {
        const chosenKey = mentionedFoods[mentionedFoods.length - 1];
        const foodInfo = foodSubstituteDB[chosenKey];
        const listBahanText = mentionedFoods.map(k => `<b>${foodSubstituteDB[k].nama}</b> (${foodSubstituteDB[k].porsiAman})`).join(" + ");

        return `Wah, pilihan bagus itu <b>${firstName}</b>! Bahan yang ada di rumahmu justru sehat dan pas banget buat ngejar target <b>${tk} kkal/hari</b>:<br><br>` +
          `• <b>Takaran Porsi Amannya:</b> Cukup gunakan ${listBahanText}.<br>` +
          `• <b>Cara Masak Biar Tetap Nikmat:</b> Enaknya ${foodInfo.caraMasak}.<br><br>` +
          `Jangan lupa tambahin sayur hijau biar makin kenyang ya. Yuk, lanjut terus progres positifmu!`;
      }

      // 3. CEK PERTANYAAN TENTANG JAJANAN / MAKANAN FAVORIT (BAKSO, SEBLAK, GORENGAN, MIE AYAM, NASI PADANG, MARTABAK, ES KRIM, COKLAT)
      const jajananMap = [
        { keys: ["gorengan", "bakwan", "risol", "tempe goreng", "ayam goreng"], nama: "Gorengan", kal: "130–180 kkal per potong", tips: "Cukup icip <b>1 potong aja</b> buat obat kangen, tiriskan minyaknya pakai tisu, atau lebih mantap lagi kalau dipanggang di teflon!" },
        { keys: ["bakso", "pentol", "cilok", "soto"], nama: "Bakso / Makanan Berkuah", kal: "320–400 kkal per mangkuk", tips: "Pilih <b>bakso daging tanpa gajih/lemak</b>, minta bihunnya setengah porsi aja, banyakin sayur sawinya, dan kuahnya jangan dihabisin semua ya biar gak kebanyakan garam." },
        { keys: ["seblak", "pedas", "mie instan", "indomie", "mie ayam", "ramen"], nama: "Seblak / Mie Favoritmu", kal: "380–480 kkal per porsi", tips: "Boleh kok sesekali (maksimal 1x seminggu), triknya pakai <b>bumbu setengah aja</b>, kurangi kerupuknya, terus tambahin <b>telur rebus + sayur sawi yang banyak</b> biar tetap mengenyangkan!" },
        { keys: ["padang", "rendang", "sate", "nasi goreng", "pecel", "gado"], nama: "Menu Berbumbu / Nasi Padang", kal: "450–600 kkal per porsi", tips: "Ambil <b>nasinya setengah porsi aja</b>, pilih lauk ayam bakar/ikan bakar tanpa kuah santan kental, dan perbanyak lalapan timun atau sayur rebusnya." },
        { keys: ["manis", "coklat", "es krim", "kue", "martabak", "roti bakar", "donat", "biskuit"], nama: "Camilan Manis", kal: "200–350 kkal per porsi", tips: "Makan <b>1–2 potong kecil aja setelah makan siang</b> (jangan pas perut kosong), lalu minum segelas air putih hangat." }
      ];
      for (const item of jajananMap) {
        if (item.keys.some(k => q.includes(k))) {
          return `Tenang aja <b>${firstName}</b>, diet bareng DietBuddy itu gak boleh bikin kamu stres! Kalau lagi pengen <b>${item.nama}</b> (~${item.kal}), <b>boleh banget kok</b> asal tahu trik amannya:<br><br>` +
            `• <b>Trik Makan Tanpa Rasa Bersalah:</b> ${item.tips}<br>` +
            `• <b>Biar Kalori Tetap Seimbang:</b> Kalau siang udah makan ini, nanti malam pilih menu yang lebih ringan kayak sayur bening dan protein rebus ya. Semangat, nikmati prosesnya!`;
        }
      }

      // 4. CEK PERTANYAAN TENTANG MINUMAN (KOPI, BOBA, TEH MANIS, SUSU, JUS, AIR PUTIH)
      if (q.includes("kopi") || q.includes("boba") || q.includes("teh") || q.includes("minum") || q.includes("susu") || q.includes("jus") || q.includes("air") || q.includes("matcha") || q.includes("soda")) {
        return `Pertanyaan bagus banget nih, <b>${firstName}</b>! Sering kali kalori tersembunyi itu datangnya dari minuman:<br><br>` +
          `• <b>Tips Ngopi / Minum Segar Saat Diet:</b> Kalau kopi hitam atau teh tawar itu hampir <b>0 kalori</b> jadi aman banget! Tapi kalau kopi susu kekinian, es teh manis, atau boba, minta <b>less sugar (sedikit gula)</b> atau ganti susu rendah lemak ya.<br>` +
          `• <b>Target Air Putihmu:</b> Untuk berat badanmu sekarang (<b>${state.dataDiri.berat_badan} kg</b>), yuk rutin minum air putih sekitar <b>${airLiter} liter (8–9 gelas) sehari</b> biar badan segar dan pembakaran lemakmu makin ngebut!`;
      }

      // 5. CEK PERTANYAAN TENTANG OLAHRAGA / AKTIVITAS FISIK / PERUT BUNCIT
      if (q.includes("olahraga") || q.includes("gym") || q.includes("lari") || q.includes("jalan") || q.includes("senam") || q.includes("workout") || q.includes("perut") || q.includes("buncit") || q.includes("lemak") || q.includes("kardio") || q.includes("gerak")) {
        return `Wah, mantap banget semangat olahragamu, <b>${firstName}</b>! Buat kondisi tubuhmu sekarang (BMI <b>${state.hasil.bmi} — ${state.hasil.kategori_bmi}</b>), gak perlu olahraga yang berat-berat kok:<br><br>` +
          `• <b>Mulai yang Santai Tapi Rutin:</b> Cukup <b>jalan cepat 25–30 menit</b>, jogging sore, atau senam aerobik di kamar 3–4x seminggu udah bisa bakar <b>~200 kkal</b>!<br>` +
          `• <b>Biar Badan Makin Kencang:</b> Tambahin plank 30 detik dan squat ringan 10–15 menit di rumah.<br><br>` +
          `Ingat ya, 70% keberhasilan diet itu dari pola makanmu di <b>${tk} kkal/hari</b>, dan olahraga bikin hasilnya makin maksimal. Kamu pasti bisa!`;
      }

      // 6. CEK PERTANYAAN TENTANG LAPAR MALAM / CAMILAN / JAM MAKAN / PUASA / MAAG
      if (q.includes("malam") || q.includes("lapar") || q.includes("camilan") || q.includes("ngemil") || q.includes("snack") || q.includes("jam makan") || q.includes("jadwal") || q.includes("puasa") || q.includes("maag") || q.includes("lambung") || q.includes("sarapan") || q.includes("telat")) {
        return `Jangan khawatir <b>${firstName}</b>, kalau perut keroncongan jangan disiksa tahan lapar sampai sakit maag ya!<br><br>` +
          `• <b>Penyelamat Lapar Malam:</b> Ambil camilan ringan sekitar <b>100–130 kkal</b> yang tinggi serat/protein seperti <b>1 butir telur rebus hangat, potongan buah pepaya/apel, atau segenggam edamame</b>, lalu minum 1 gelas air hangat.<br>` +
          `• <b>Tips Besok Hari:</b> Usahakan jam makanmu teratur (Sarapan 07.30, Siang 12.30, Selingan 16.00, Malam sebelum 19.30) biar gula darah stabil dan gak gampang lapar malam. Semangat terus ya!`;
      }

      // 7. CEK PERTANYAAN TENTANG TARGET BERAT BADAN / BERAPA LAMA / SUSAH TURUN / TIPS KONSISTEN
      if (q.includes("berapa lama") || q.includes("susah") || q.includes("stagnan") || q.includes("turun") || q.includes("naik") || q.includes("berat") || q.includes("target") || q.includes("tips") || q.includes("konsisten") || q.includes("bmi") || q.includes("bmr")) {
        return `Aku paham banget rasanya, <b>${firstName}</b>! Tapi percayalah, pelan-pelan asal konsisten itu jauh lebih awet hasilnya:<br><br>` +
          `• <b>Progres Sehat Tubuhmu:</b> Dengan berat <b>${state.dataDiri.berat_badan} kg</b> dan rutin menjaga porsi di <b>${tk} kkal/hari</b>, progres yang paling sehat dan aman adalah sekitar <b>0,5 – 0,75 kg per minggu (2 – 3 kg sebulan)</b>.<br>` +
          `• <b>Kunci Biar Gak Gampang Menyerah:</b> Cukup tidur 7–8 jam, jangan skip makan protein, dan nikmati prosesnya hari demi hari. Aku yakin kamu pasti berhasil capai targetmu!`;
      }

      // 8. COBA PANGGIL LIVE AI (UNTUK PERTANYAAN BEBAS APAPUN) DENGAN BAHASA SANTAI & MENYEMANGATI
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4500);
        const promptSystem = `Kamu adalah Dr. Buddy AI, teman diet yang sangat ramah, santai, hangat, dan selalu menyemangati di aplikasi DietBuddy. Pengguna bernama ${firstName} (Berat ${state.dataDiri.berat_badan} kg, Tinggi ${state.dataDiri.tinggi_badan} cm, BMI ${state.hasil.bmi} ${state.hasil.kategori_bmi}, Program: ${state.dataDiri.target_diet}, Target Kalori: ${tk} kkal/hari). Jawab pertanyaan berikut dengan bahasa Indonesia yang santai, nyambung, tidak kaku, dan beri kalimat penyemangat di akhir (maksimal 3-4 kalimat): "${question}"`;
        const res = await fetch("https://text.pollinations.ai/" + encodeURIComponent(promptSystem), { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const aiText = (await res.text()).trim();
          if (aiText && aiText.length > 15 && !aiText.startsWith("<!DOCTYPE")) {
            return aiText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
          }
        }
      } catch (err) {
        // Lanjut ke respons lokal santai jika offline
      }

      // 9. RESPONS KONTEKSTUAL SANTAI & MENYEMANGATI JIKA OFFLINE
      return `Wah, pertanyaan seru nih <b>${firstName}</b> soal <b>"${question}"</b>!<br><br>` +
        `Intinya selama kamu jalani program <b>${state.dataDiri.target_diet}</b> ini, kamu gak perlu pantang makanan secara ekstrem kok. Cukup jaga porsi sekali makan utamamu di kisaran <b>~${mealCal} kkal</b> (ada lauk protein, sayur, dan karbohidrat secukupnya) supaya total harianmu tetap aman di <b>${tk} kkal/hari</b>.<br><br>` +
        `Jangan lupa minum air putih <b>${airLiter} liter/hari</b> ya. Semangat terus jalani diet sehatnya, kamu pasti bisa!`;
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
