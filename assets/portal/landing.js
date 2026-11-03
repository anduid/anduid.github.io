
    /* ---------- i18n Dictionary ---------- */
    const D = {};
    const K = (k, e, i) => D[k] = { en: e, id: i };
    let LG = 'en';
    try { LG = localStorage.getItem('andu_lg') || ((navigator.language || '').startsWith('id') ? 'id' : 'en'); } catch(e){}
    const t = k => D[k] ? D[k][LG] : k;

    [
      ['login','Sign in / Register','Masuk / Daftar'],
      ['logout','Sign out','Keluar Akun'],
      ['badge','Next-gen Android native hub','Pusat Android native masa depan'],
      ['h1a','We build premium apps &','Kami membangun aplikasi premium &'],
      ['h1b','grow tomorrow’s Android developers','mencetak developer Android masa depan'],
      ['sub','Ready-made SaaS licenses, custom B2B software and a beginner-friendly academy — one friendly ecosystem by El-Salam Technology, Inc.','Lisensi SaaS siap pakai, software B2B kustom, dan akademi ramah pemula — satu ekosistem dari El-Salam Technology, Inc.'],
      ['cta1','🚀 Try our SaaS apps','🚀 Coba aplikasi SaaS kami'],
      ['cta2','💼 Consult custom services','💼 Konsultasi jasa kustom'],
      ['btnTestNotify','Test Push API','Uji API Push'],
      ['n_home','Overview','Ringkasan'],
      ['n_about','About & Legality','Tentang & Legalitas'],
      ['n_products','Products & SaaS','Produk & SaaS'],
      ['n_services','Services','Jasa'],
      ['n_academy','Academy','Akademi'],
      ['n_partner','Partners','Kemitraan'],
      ['n_blog','Blog','Blog'],
      ['n_dash','My Terminal','Terminal Saya'],
      ['h_prod','Products & licenses','Produk & lisensi'],
      ['h_serv','Build with us','Bangun bersama kami'],
      ['h_acad','Learn Android','Belajar Android'],
      ['h_blog','Read insights','Baca wawasan'],
      ['aT','About ANDU & legality','Tentang ANDU & legalitas'],
      ['aP','ANDU is the Android Native Development Unit of El-Salam Technology, Inc. — engineering clean, secure, high-performance software to international standards.','ANDU adalah Android Native Development Unit dari El-Salam Technology, Inc. — merekayasa software bersih, aman, dan berperforma tinggi sesuai standar internasional.'],
      ['a1t','🌍 Vision','🌍 Visi'],
      ['a1','Be the most trusted native Android partner worldwide.','Menjadi mitra Android native paling tepercaya di dunia.'],
      ['a2t','🎯 Mission','🎯 Misi'],
      ['a2','Deliver clean architecture, transparent delivery and learning for everyone.','Menghadirkan arsitektur bersih, proses transparan, dan pembelajaran untuk semua.'],
      ['a3t','🛡️ Trust','🛡️ Kepercayaan'],
      ['a3','Corporate transparency, privacy by design and global security standards.','Transparansi korporat, privasi sejak desain, dan standar keamanan global.'],
      ['tm1','Kotlin/Java Engineers','Engineer Kotlin/Java'],
      ['tm2','UI/UX Designers','Desainer UI/UX'],
      ['tm3','Security Experts','Ahli Keamanan'],
      ['tm4','Mentors','Mentor'],
      ['pT','Apps, code & libraries','Aplikasi, kode & pustaka'],
      ['pP','Buy instantly — your license key appears in your dashboard.','Beli instan — kunci lisensi muncul di dasbor Anda.'],
      ['f_all','All','Semua'],
      ['f_saas','SaaS','SaaS'],
      ['f_tpl','Templates','Template'],
      ['f_free','Free / Open source','Gratis / Open source'],
      ['pos','Smart POS System','Sistem Smart POS'],
      ['posd','Cashier app built with Kotlin Clean Architecture & offline Room SQLite.','Aplikasi kasir dengan Kotlin Clean Architecture & offline Room SQLite.'],
      ['crm','Enterprise Mobile CRM','CRM Mobile Enterprise'],
      ['crmd','Real-time synced customer data model, GPS telemetries & biometric auth.','Model data pelanggan sinkron real-time, telemetri GPS & autentikasi biometrik.'],
      ['kit','Compose UI Kit (MVVM/MVI)','Compose UI Kit (MVVM/MVI)'],
      ['kitd','Premium screens, clean architecture, Hilt DI & unified Material 3 theme.','Layar produksi premium, arsitektur bersih, Hilt DI & tema Material 3.'],
      ['sdk','ANDU Android Library','Pustaka Android ANDU'],
      ['sdkd','Free open-source SDK components, coroutines flow & keystore helpers.','Komponen SDK open-source gratis, coroutines flow & utilitas keystore.'],
      ['buy','Buy / Get','Beli / Ambil'],
      ['free','Free','Gratis'],
      ['sT','Custom software house','Software house kustom'],
      ['sP','Agile/Scrum delivery with transparent tracking in your dashboard.','Pengerjaan Agile/Scrum dengan pelacakan transparan di dasbor Anda.'],
      ['s1','Custom Android Apps','Aplikasi Android Kustom'],
      ['s1d','Native apps & mobile prototyping from idea to Play Store.','Aplikasi native & prototipe mobile dari ide hingga Play Store.'],
      ['s2','Audit, Progita & Optima AI','Audit, Progita & Optima AI'],
      ['s2d','Security audits, archive digitization (Progita) and AI performance tuning (Optima).','Audit keamanan, digitalisasi arsip (Progita), dan optimasi performa AI (Optima).'],
      ['s3','Agile Workflow','Alur Kerja Agile'],
      ['s3d','Sprints, demos and clear milestones every two weeks.','Sprint, demo, dan milestone jelas setiap dua minggu.'],
      ['fT','Request a quote','Ajukan penawaran'],
      ['fP','Tell us about your project. Our process:','Ceritakan proyek Anda. Proses kami:'],
      ['st1','Submit brief','Kirim brief'],
      ['st2','Discovery & quote','Discovery & penawaran'],
      ['st3','Sprints & demos','Sprint & demo'],
      ['st4','Launch & support','Rilis & dukungan'],
      ['fn','Your name','Nama Anda'],
      ['fe','Email','Email'],
      ['fd','Project description','Deskripsi proyek'],
      ['fS','Send request','Kirim permintaan'],
      ['o1','Custom Android app','Aplikasi Android kustom'],
      ['o2','Security audit / Progita / Optima','Audit keamanan / Progita / Optima'],
      ['o3','Mobile prototype','Prototipe mobile'],
      ['cT','ANDU Academy','ANDU Academy'],
      ['cP','From zero to native master. Video classes, quizzes and official certificates.','Dari nol hingga master native. Kelas video, kuis, dan sertifikat resmi.'],
      ['c1','Kotlin for Beginners','Kotlin untuk Pemula'],
      ['c1d','Zero-to-hero syntax, functional constructs, and Coroutines primer.','Dari nol hingga paham sintaksis, functional constructs, dan Coroutines primer.'],
      ['c2','APIs & Room Database','API & Room Database'],
      ['c2d','Modern REST networking, offline SQLite caching, and Kotlin Flow observables.','Networking REST, caching offline SQLite, dan observables Kotlin Flow.'],
      ['c3','Hilt & Jetpack Compose Pro','Hilt & Jetpack Compose Pro'],
      ['c3d','Declarative UI, state hoisting, custom canvas drawing, and smooth animations.','UI deklaratif, state hoisting, custom canvas drawing, dan animasi interaktif halus.'],
      ['lv1','Beginner','Pemula'],
      ['lv2','Intermediate','Menengah'],
      ['lv3','Advanced','Mahir'],
      ['enr','Enroll','Daftar kelas'],
      ['pl1','Free Tier','Paket Gratis'],
      ['pl2','Premium Monthly','Premium Bulanan'],
      ['pl3','VIP Lifetime','VIP Seumur Hidup'],
      ['pl1d','Intro lessons & community forum','Materi pengantar & forum komunitas'],
      ['pl2d','All classes + quizzes + verified certificates','Semua kelas + kuis + sertifikat resmi'],
      ['pl3d','Everything forever + live bootcamps & 1-on-1 reviews','Semua selamanya + bootcamp live & review 1-on-1'],
      ['pick','Choose plan','Pilih paket'],
      ['wT','🎥 Live bootcamp & webinar','🎥 Bootcamp & webinar live'],
      ['wP','Live coding with global mentors every Saturday.','Live coding bersama mentor global tiap Sabtu.'],
      ['wB','Remind me','Ingatkan saya'],
      ['kT','Partnership hub','Pusat kemitraan'],
      ['k1','Institution collaboration','Kolaborasi institusi'],
      ['k2','License reseller','Reseller lisensi'],
      ['k3','EdTech affiliate','Afiliasi EdTech'],
      ['join','Apply','Ajukan'],
      ['bT','Tech blog & insights','Blog teknologi & wawasan'],
      ['bP','Case studies, tutorials, changelogs and mobile trends.','Studi kasus, tutorial, changelog, dan tren mobile.'],
      ['b_all','All','Semua'],
      ['b_case','Case study','Studi kasus'],
      ['b_tut','Tutorial','Tutorial'],
      ['b_log','Changelog','Changelog'],
      ['b_trend','Trends','Tren'],
      ['bl1','How a retailer cut checkout time by 40%','Retailer memangkas waktu checkout 40%'],
      ['bl2','Room + Flow: a gentle guide','Room + Flow: panduan santai'],
      ['bl3','POS v2.4 release notes','Catatan rilis POS v2.4'],
      ['bl4','Why Compose wins in 2026','Mengapa Compose unggul di 2026'],
      ['read','Read more →','Baca →'],
      ['nS','Subscribe','Berlangganan'],
      ['dT','My terminal','Terminal saya'],
      ['t1','📦 My licenses','📦 Lisensi saya'],
      ['t2','🛠️ Project tracker','🛠️ Pelacak proyek'],
      ['t3','🎓 Classroom & Certificates','🎓 Kelas & Sertifikat'],
      ['t4','💾 IndexedDB Target Vault','💾 Brankas Target IndexedDB'],
      ['t5','⚙️ Dev Tools & Diagnostics','⚙️ Alat Diagnostik & Monitor'],
      ['empty','Nothing here yet.','Belum ada data.'],
      ['dl','Download source','Unduh source'],
      ['cert','Get certificate','Unduh sertifikat'],
      ['learn','+ Lesson','+ Pelajaran'],
      ['key','License key','Kunci lisensi'],
      ['faqT','Help center & FAQ','Pusat bantuan & FAQ'],
      ['ctT','Contact','Kontak'],
      ['addr','Jakarta, Indonesia (head office)','Jakarta, Indonesia (kantor pusat)'],
      ['priv','Privacy Policy','Kebijakan Privasi'],
      ['terms','Terms & Conditions','Syarat & Ketentuan'],
      ['q1','Is it beginner friendly?','Apakah ramah pemula?'],
      ['a1x','Yes — the Free Tier starts from zero with Kotlin basics.','Ya — paket Gratis dimulai dari nol dengan dasar Kotlin.'],
      ['q2','How do I get my license?','Bagaimana mendapat lisensi?'],
      ['a2x','Buy a product and the key appears under “My licenses”.','Beli produk dan kunci muncul di “Lisensi saya”.'],
      ['q3','Can I order a custom app?','Bisakah memesan aplikasi kustom?'],
      ['a3x','Yes, send the quote form and track progress in your dashboard.','Bisa, kirim formulir penawaran dan pantau progres di dasbor.'],
      ['q4','Where is my data stored?','Di mana data saya disimpan?'],
      ['a4x','This demo stores everything locally in your browser (IndexedDB). Zero-Leak storage.','Aplikasi ini menyimpan data secara lokal di IndexedDB browser (Zero-Leak).'],
      ['lT','Welcome to ANDU','Selamat datang di ANDU'],
      ['lN','Full name','Nama lengkap'],
      ['lGo','Continue','Lanjutkan'],
      ['out','Sign out','Keluar'],
      ['needLogin','Please sign in first.','Silakan masuk dulu.'],
      ['ok','Done!','Berhasil!'],
      ['e_p','Direct distribution','Distribusi langsung'],
      ['e_s','Custom engineering','Rekayasa kustom'],
      ['e_a','Newbie to senior','Pemula hingga senior'],
      ['e_b','Insights','Wawasan'],
      ['pushT','Notifications','Notifikasi'],
      ['pushOn','Enable push notifications','Aktifkan notifikasi push'],
      ['pushNo','No notifications yet.','Belum ada notifikasi.'],
      ['clr','Clear all','Hapus semua'],
      ['nBuy','License purchased','Lisensi dibeli'],
      ['nQ','Quote request received','Permintaan penawaran diterima'],
      ['nE','Enrolled in class','Terdaftar di kelas'],
      ['nW','Webinar reminder set','Pengingat webinar diset'],
      ['nS2','Subscribed to newsletter','Berlangganan newsletter'],
      ['nP','Progress update','Pembaruan progres'],
      ['nC','Certificate ready','Sertifikat siap'],
      ['nPl','Plan selected','Paket dipilih'],
      ['nJ','Application sent','Pengajuan terkirim'],
      ['pTxt','We respect your privacy. Data in this demo stays locally in your browser via IndexedDB. We never sell personal data.','Kami menghormati privasi Anda. Data pada aplikasi ini tersimpan lokal di peramban via IndexedDB. Kami tidak menjual data pribadi.'],
      ['tTxt','Licenses are per-organization, non-transferable. Services follow signed statements of work. Governing law: Republic of Indonesia and applicable international IP rules.','Lisensi per organisasi dan tidak dapat dipindahtangankan. Jasa mengikuti SOW yang ditandatangani. Hukum yang berlaku: Republik Indonesia dan aturan internasional.'],
      ['titleTasks','IndexedDB Project Target Vault','Brankas Target Proyek IndexedDB'],
      ['badgeIndexedDb','Offline-First W3C','Offline-Utama W3C'],
      ['descTasks','All notes and sprint targets are stored locally inside browser IndexedDB (Zero-Leak Data).','Semua catatan dan target sprint disimpan secara lokal di dalam IndexedDB browser Anda.'],
      ['formTitleNewTask','Create Task / Target','Buat Tugas / Target'],
      ['lblTaskTitle','Project / Feature Title','Judul Proyek / Fitur'],
      ['phTaskTitle','e.g., Integrate Biometric Auth','contoh: Integrasi Otentikasi Biometrik'],
      ['lblCategory','Module Category','Kategori Modul'],
      ['lblPriority','Priority Level','Tingkat Prioritas'],
      ['lblDescription','Details / Acceptance Criteria','Detail / Kriteria Penerimaan'],
      ['phTaskDesc','Notes on implementation...','Catatan implementasi...'],
      ['btnSaveTask','Save to IndexedDB','Simpan ke IndexedDB'],
      ['lblVaultList','Stored Targets','Target Tersimpan'],
      ['btnClearVault','Clear All','Hapus Semua'],
      ['btnSeedTasks','Load Sprint Samples','Muat Contoh Sprint'],
      ['emptyVaultTitle','No Tasks Stored Yet','Belum Ada Tugas Tersimpan'],
      ['emptyVaultDesc','Add a task using the form on the left to test IndexedDB persistence.','Tambahkan tugas menggunakan formulir di sebelah kiri untuk menguji IndexedDB.'],
      ['titleTools','Dev Tools & System Health Monitor','Alat Pengembang & Pemantau Sistem'],
      ['descTools','Interactive diagnostic tools for Android developers & build optimizations.','Alat diagnostik interaktif untuk pengembang Android & optimasi build.'],
      ['toolGradleTitle','Gradle Build Benchmark','Uji Tolok Ukur Build Gradle'],
      ['toolGradleDesc','Simulate native Gradle build execution with build cache & daemon enabled.','Simulasi eksekusi build Gradle native dengan cache & daemon aktif.'],
      ['btnRunBenchmark','Run Build Simulation','Jalankan Simulasi Build'],
      ['toolApiTitle','Android SDK Version Inspector','Inspektur Versi Android SDK'],
      ['lblSelectApi','Select API Level:','Pilih Tingkat API:']
    ].forEach(a => K(...a));

    /* SPA Navigation Routes */
    const spaRoutes = [
      { id: 'home', key: 'n_home', icon: '🏠' },
      { id: 'about', key: 'n_about', icon: 'ℹ️' },
      { id: 'products', key: 'n_products', icon: '🛍️' },
      { id: 'services', key: 'n_services', icon: '💼' },
      { id: 'academy', key: 'n_academy', icon: '🎓' },
      { id: 'partner', key: 'n_partner', icon: '🤝' },
      { id: 'blog', key: 'n_blog', icon: '📰' },
      { id: 'dash', key: 'n_dash', icon: '💻' }
    ];

    let currentView = 'home';
    let tab = 1; // 1: Licenses, 2: Projects, 3: Classroom, 4: Target Vault, 5: Dev Tools

    const _A = window.ANDU || {}, _CAT = _A.catalog || [];
    const _sk = id => String(id).replace(/^(product|course|plan|service|link)-/, '');
    const _rp = n => 'Rp' + Number(n || 0).toLocaleString('id-ID');
    _CAT.forEach(c => { const k = _sk(c.id); if (!D[k]) K(k, c.title, c.title); if (!D[k+'d']) K(k+'d', c.desc || '', c.desc || ''); });
    const _planPrice = (id, fb) => { const c = _CAT.find(x => x.id === id); return c ? _rp(c.price) : fb; };
    const _prods = _CAT.filter(c => c.type === 'product' || c.type === 'link').map(c => [_sk(c.id), c.category === 'Template' ? 'tpl' : c.category === 'Free' ? 'free' : 'saas', c.price, c.icon || '📦', c.priceNote || '']);
    const prods = _prods.length ? _prods : [['pos','saas',2400000,'🧾',''],['crm','saas',4800000,'📱',''],['kit','tpl',1250000,'🎨',''],['sdk','free',0,'🧩','']];
    const _lv = { Beginner: 'lv1', Intermediate: 'lv2', Advanced: 'lv3' };
    const _crs = _CAT.filter(c => c.type === 'course').map(c => [_sk(c.id), _lv[c.level] || 'lv1', c.level === 'Advanced' ? '🚀' : c.level === 'Intermediate' ? '🗄️' : '🌱']);
    const crs = _crs.length ? _crs : [['c1','lv1','🌱'],['c2','lv2','🗄️'],['c3','lv3','🚀']];
    const _pcat = tags => { const s = (tags || []).join(' ').toLowerCase(); return /studi|case/.test(s) ? 'case' : /changelog|rilis|release/.test(s) ? 'log' : /tren|trend/.test(s) ? 'trend' : 'tut'; };
    const _posts = (_A.posts || []).map(p => { if (!D['post_'+p.slug]) K('post_'+p.slug, p.title, p.title); return ['post_'+p.slug, _pcat(p.tags), _pcat(p.tags) === 'case' ? '📈' : _pcat(p.tags) === 'log' ? '🧾' : _pcat(p.tags) === 'trend' ? '✨' : '🌊', p.url]; });
    const blogs = _posts.length ? _posts : [['bl1','case','📈'],['bl2','tut','🌊'],['bl3','log','🧾'],['bl4','trend','✨']];
    function openPost(k) { const b = blogs.find(x => x[0] === k); if (b && b[3]) location.href = b[3]; else showT(t(k), 'Article opened in ANDU Reader', '📖'); }
    function partnerForm(k) { notify('nJ', t(k)); }
    const code = `class AnduViewModel : ViewModel() {\n  val state = MutableStateFlow(UiState())\n\n  fun build(idea: String) = viewModelScope.launch {\n    val app = repo.ship(idea)   // 🚀\n    state.update { it.copy(app = app) }\n  }\n}`;

    /* ---------- IndexedDB Engine ---------- */
    let db; const mem = {};
    function openDB(){
      return new Promise(r => {
        try {
          const q = indexedDB.open('andu_complete_db', 2);
          q.onupgradeneeded = () => {
            ['users','licenses','projects','courses','notifs','sprint_tasks'].forEach(s => {
              if(!q.result.objectStoreNames.contains(s)) q.result.createObjectStore(s, { keyPath: 'id', autoIncrement: s!=='users'&&s!=='courses' });
            });
          };
          q.onsuccess = () => { db = q.result; r(); };
          q.onerror = () => r();
        } catch(e){ r(); }
      });
    }
    const tx = (s,m) => db.transaction(s,m).objectStore(s);
    const rq = q => new Promise(r => { q.onsuccess = () => r(q.result); q.onerror = () => r(null); });
    const dbAll = async s => db ? await rq(tx(s,'readonly').getAll()) || [] : (mem[s] || []);
    const dbPut = async (s,o) => {
      if (db) return rq(tx(s,'readwrite').put(o));
      o.id = o.id || Date.now() + Math.random();
      mem[s] = (mem[s]||[]).filter(x => x.id !== o.id).concat(o);
    };
    const dbDel = async (s,id) => {
      if (db) return rq(tx(s,'readwrite').delete(id));
      mem[s] = (mem[s]||[]).filter(x => x.id !== id);
    };
    const dbClr = async s => db ? rq(tx(s,'readwrite').clear()) : mem[s] = [];

    let user = null, pf = 'all', bf = 'all';

    /* ---------- UI Helpers ---------- */
    const $ = s => document.querySelector(s);
    const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    let tt;
    function showT(ti, b, icon = '🔔') {
      $('#tI').textContent = icon;
      $('#tT').textContent = ti;
      $('#tB').textContent = b;
      $('#toast').classList.add('on');
      clearTimeout(tt);
      tt = setTimeout(hideT, 4000);
    }
    function hideT() { $('#toast').classList.remove('on'); }

    async function notify(k, body) {
      const o = { key: k, body, time: Date.now(), read: 0 };
      await dbPut('notifs', o);
      showT(t(k), body);
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('ANDU – ' + t(k), { body });
        }
      } catch(e){}
      refreshBadge();
    }

    async function refreshBadge() {
      const n = (await dbAll('notifs')).filter(x => !x.read).length;
      const b = $('#badge');
      b.textContent = n;
      b.classList.toggle('hidden', !n);
    }

    function openM(h) { $('#mb').innerHTML = h; $('#md').classList.remove('hidden'); }
    function closeM() { $('#md').classList.add('hidden'); }
    function needLogin() {
      if (user) return false;
      showT(t('needLogin'), '', '🔒');
      setTimeout(login, 400);
      return true;
    }
    const fmt = ts => new Date(ts).toLocaleString(LG==='id'?'id-ID':'en-US', { dateStyle:'medium', timeStyle:'short' });

    /* ---------- SPA View Navigation Engine ---------- */
    function navigate(viewId, terminalTabTarget = null) {
      if (!document.getElementById('view-' + viewId)) viewId = 'home';
      currentView = viewId;
      window.location.hash = '#' + viewId;

      document.querySelectorAll('.spa-page').forEach(sec => {
        sec.classList.remove('active');
      });
      const activeSec = document.getElementById('view-' + viewId);
      if (activeSec) {
        activeSec.classList.add('active');
      }

      if (viewId === 'dash' && terminalTabTarget) {
        tab = terminalTabTarget;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderNavButtons();

      if (viewId === 'dash') {
        dashRender();
      }
    }

    function renderNavButtons() {
      // Desktop nav links
      $('#navLinks').innerHTML = spaRoutes.map(r => `
        <button onclick="navigate('${r.id}')" class="nav-btn-link flex items-center gap-1.5 ${currentView === r.id ? 'active-link' : 'hover:text-[#3DDC84]'}">
          <span>${r.icon}</span>
          <span>${t(r.key)}</span>
        </button>
      `).join('');

      // Mobile drawer links
      $('#drawerNavLinks').innerHTML = spaRoutes.map(r => `
        <button onclick="navigate('${r.id}'); closeMobileDrawer();" class="w-full text-left flex items-center gap-3 p-3 rounded-xl ${currentView === r.id ? 'bg-[#3DDC84]/15 text-[#3DDC84] font-bold border border-[#3DDC84]/30' : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 border border-white/5'} transition">
          <span class="text-base">${r.icon}</span>
          <span class="flex-1">${t(r.key)}</span>
          <span class="text-xs text-slate-500 font-mono">→</span>
        </button>
      `).join('');
    }

    function openMobileDrawer() {
      const backdrop = $('#drawerBackdrop');
      const panel = $('#drawerPanel');
      backdrop.classList.remove('pointer-events-none', 'opacity-0');
      backdrop.classList.add('opacity-100');
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      const backdrop = $('#drawerBackdrop');
      const panel = $('#drawerPanel');
      backdrop.classList.add('pointer-events-none', 'opacity-0');
      backdrop.classList.remove('opacity-100');
      panel.classList.add('translate-x-full');
      panel.classList.remove('translate-x-0');
      document.body.style.overflow = '';
    }

    /* ---------- Render App View Contents ---------- */
    function render() {
      document.documentElement.lang = LG;

      // Sliding Capsule Glider update
      const glider = $('#langGlider');
      const enEl = $('#lgEn');
      const idEl = $('#lgId');
      if (LG === 'id') {
        glider.classList.add('id-active');
        idEl.className = 'lang-pill-opt text-[#041009]';
        enEl.className = 'lang-pill-opt text-slate-400';
      } else {
        glider.classList.remove('id-active');
        enEl.className = 'lang-pill-opt text-[#041009]';
        idEl.className = 'lang-pill-opt text-slate-400';
      }

      document.querySelectorAll('[data-i]').forEach(e => e.textContent = t(e.dataset.i));
      document.querySelectorAll('[data-p]').forEach(e => e.placeholder = t(e.dataset.p));

      $('#authBtn').textContent = t(user ? 'logout' : 'login');
      $('#drawerAuthTxt').textContent = t(user ? 'logout' : 'login');

      renderNavButtons();

      // Home bento quick switchers
      const hubItems = [
        ['🛍️','n_products','products'],
        ['💼','n_services','services'],
        ['🎓','n_academy','academy'],
        ['📰','n_blog','blog']
      ];
      $('#hub').innerHTML = hubItems.map((h,i) => `
        <div onclick="navigate('${h[2]}')" class="glass-card p-5 rounded-2xl ${i===0?'col-span-2':''} group cursor-pointer">
          <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">${h[0]}</div>
          <b class="text-sm sm:text-base text-white block">${t(h[1])}</b>
          <p class="text-xs text-[#3DDC84] mt-1 font-semibold">Switch view →</p>
        </div>
      `).join('');

      // About
      $('#aboutGrid').innerHTML = [['a1t','a1'],['a2t','a2'],['a3t','a3']].map(a => `
        <div class="glass-card p-6 rounded-3xl space-y-2">
          <h3 class="font-extrabold text-white text-base">${t(a[0])}</h3>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${t(a[1])}</p>
        </div>
      `).join('');

      $('#team').innerHTML = ['👩‍💻tm1','🎨tm2','🔐tm3','🧑‍🏫tm4'].map(x => `
        <div class="glass-card p-4 rounded-2xl text-center">
          <div class="text-4xl mb-2">${x.slice(0,2)}</div>
          <p class="text-xs font-bold text-white">${t(x.slice(2))}</p>
        </div>
      `).join('');

      // Products
      const chip = (a, cur, fn) => a.map(x => `
        <button onclick="${fn}('${x[0]}')" class="btn !py-1.5 !px-3 !text-xs ${cur===x[0]?'btn-p':'btn-o'}">${t(x[1])}</button>
      `).join('');

      $('#pf').innerHTML = chip([['all','f_all'],['saas','f_saas'],['tpl','f_tpl'],['free','f_free']], pf, 'setPf');
      $('#pg').innerHTML = prods.filter(p => pf==='all' || p[1]===pf).map(p => `
        <article class="glass-card p-5 rounded-3xl flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-3xl p-2 rounded-2xl bg-white/5">${p[3]}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3DDC84]/20 text-[#3DDC84] font-bold uppercase">${p[1]}</span>
            </div>
            <h3 class="font-extrabold text-white text-base">${t(p[0])}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">${t(p[0]+'d')}</p>
          </div>
          <div class="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
            <b class="text-[#3DDC84] font-mono text-lg">${p[4] ? p[4] : (p[2] ? _rp(p[2]) : t('free'))}</b>
            <button class="btn btn-p !py-2 !px-4" onclick="buy('${p[0]}',${p[2]})">${t('buy')}</button>
          </div>
        </article>
      `).join('');

      // Services
      $('#sg').innerHTML = [['s1','🛠️'],['s2','🛡️'],['s3','🔄']].map(s => `
        <div class="glass-card p-6 rounded-3xl space-y-2">
          <div class="text-3xl mb-2">${s[1]}</div>
          <h3 class="font-extrabold text-white text-base">${t(s[0])}</h3>
          <p class="text-xs text-slate-300 leading-relaxed">${t(s[0]+'d')}</p>
        </div>
      `).join('');

      $('#steps').innerHTML = ['st1','st2','st3','st4'].map((s,i) => `
        <li class="flex gap-3 items-center">
          <span class="w-6 h-6 rounded-full grid place-items-center text-xs font-black bg-[#3DDC84] text-[#041009]">${i+1}</span>
          <span>${t(s)}</span>
        </li>
      `).join('');

      // Academy
      $('#cg').innerHTML = crs.map(c => `
        <article class="glass-card p-6 rounded-3xl space-y-3 flex flex-col justify-between">
          <div>
            <div class="text-4xl mb-2">${c[2]}</div>
            <span class="text-[10px] text-[#38bdf8] font-mono font-bold uppercase">${t(c[1])}</span>
            <h3 class="font-extrabold text-white text-base my-1">${t(c[0])}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">${t(c[0]+'d')}</p>
          </div>
          <button class="btn btn-p w-full !py-2.5 mt-2" onclick="enroll('${c[0]}')">🎓 ${t('enr')}</button>
        </article>
      `).join('');

      $('#plans').innerHTML = [['pl1','Rp0'],['pl2',_planPrice('plan-monthly','Rp189.000')],['pl3',_planPrice('plan-vip','Rp2.999.000')]].map((p,i) => `
        <div class="glass-card p-6 rounded-3xl text-center space-y-2 ${i===1?'ring-2 ring-[#c084fc]':''}">
          <h3 class="font-extrabold text-white text-base">${t(p[0])}</h3>
          <b class="text-3xl block my-2 grad font-mono">${p[1]}</b>
          <p class="text-xs text-slate-400 mb-4 leading-relaxed">${t(p[0]+'d')}</p>
          <button class="btn btn-o w-full !py-2.5" onclick="plan('${p[0]}')">${t('pick')}</button>
        </div>
      `).join('');

      // Partners
      $('#kg').innerHTML = [['k1','🏛️'],['k2','🏷️'],['k3','🤝']].map(k => `
        <div class="glass-card p-6 rounded-3xl space-y-3 flex flex-col justify-between">
          <div>
            <div class="text-3xl mb-2">${k[1]}</div>
            <h3 class="font-extrabold text-white text-base">${t(k[0])}</h3>
          </div>
          <button class="btn btn-o w-full !py-2" onclick="partnerForm('${k[0]}')">${t('join')}</button>
        </div>
      `).join('');

      // Blog
      $('#bf').innerHTML = chip([['all','b_all'],['case','b_case'],['tut','b_tut'],['log','b_log'],['trend','b_trend']], bf, 'setBf');
      $('#bg').innerHTML = blogs.filter(b => bf==='all' || b[1]===bf).map(b => `
        <article class="glass-card rounded-3xl overflow-hidden flex flex-col justify-between">
          <div class="h-28 grid place-items-center text-5xl bg-gradient-to-tr from-[#c084fc]/20 to-[#3DDC84]/20">${b[2]}</div>
          <div class="p-5 space-y-2">
            <span class="text-[10px] text-[#3DDC84] font-mono font-bold">${t('b_'+b[1])}</span>
            <h3 class="font-extrabold text-sm text-white">${t(b[0])}</h3>
            <span class="text-xs text-[#c084fc] cursor-pointer hover:underline block pt-1" onclick="openPost('${b[0]}')">${t('read')}</span>
          </div>
        </article>
      `).join('');

      // FAQ
      $('#faq').innerHTML = [1,2,3,4].map(i => `
        <details class="glass rounded-2xl p-4 border border-white/5">
          <summary class="flex justify-between items-center font-bold text-xs sm:text-sm text-white">${t('q'+i)}<span class="ch text-sm text-slate-400">⌄</span></summary>
          <p class="text-xs text-slate-300 mt-2 leading-relaxed">${t('a'+i+'x')}</p>
        </details>
      `).join('');

      dashRender();
    }

    const setPf = v => { pf = v; render(); };
    const setBf = v => { bf = v; render(); };
    function toggleLang() {
      LG = LG==='en' ? 'id' : 'en';
      try { localStorage.setItem('andu_lg', LG); } catch(e){}
      render();
      showT(LG==='en' ? 'Language switched' : 'Bahasa diganti', LG==='en' ? 'English activated' : 'Bahasa Indonesia aktif', '🌐');
    }

    /* ---------- Auth Modal & Flow ---------- */
    function login() {
      openM(`
        <div class="space-y-4">
          <h3 class="text-xl font-black text-white">${t('lT')}</h3>
          <p class="text-xs text-slate-400">Authenticate to bind licenses, project quotes, and certificates.</p>
          <form onsubmit="return doLogin(event)" class="space-y-3">
            <input id="ln" class="glass-input w-full p-2.5 rounded-xl text-xs" required placeholder="${t('lN')}">
            <input id="le" type="email" class="glass-input w-full p-2.5 rounded-xl text-xs" required placeholder="${t('fe')}">
            <button class="btn btn-p w-full !py-2.5 text-xs">${t('lGo')}</button>
          </form>
        </div>
      `);
    }

    async function doLogin(e) {
      e.preventDefault();
      user = { id:'me', name:$('#ln').value.trim(), email:$('#le').value.trim() };
      await dbPut('users', user);
      closeM();
      render();
      notify('ok', user.name);
      navigate('dash', 1);
      return false;
    }

    function authClick() {
      if (!user) return login();
      if (confirm(t('out') + '?')) signOut();
    }

    async function signOut() {
      await dbClr('users');
      user = null;
      render();
      closeM();
    }

    function legal(k) {
      openM(`
        <div class="space-y-3">
          <h3 class="text-lg font-black text-white">${t(k)}</h3>
          <p class="text-xs text-slate-300 leading-relaxed">${t(k==='priv'?'pTxt':'tTxt')}</p>
        </div>
      `);
    }

    /* ---------- Push Notification Bell Modal ---------- */
    async function openNotifModal() {
      const ns = (await dbAll('notifs')).sort((a,b) => b.time - a.time);
      const perm = 'Notification' in window ? Notification.permission : 'denied';
      openM(`
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white flex items-center gap-2">🔔 ${t('pushT')}</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">${perm}</span>
          </div>
          ${perm === 'default' ? `<button class="btn btn-p w-full !py-2 text-xs" onclick="askPerm()">${t('pushOn')}</button>` : ''}
          <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            ${ns.length ? ns.map(n => `
              <div class="glass-card p-3 rounded-2xl border border-white/5 space-y-1">
                <div class="flex justify-between items-center"><b class="text-xs text-white">${t(n.key)}</b><small class="text-[10px] text-slate-500 font-mono">${fmt(n.time)}</small></div>
                <p class="text-xs text-slate-300">${esc(n.body)}</p>
              </div>
            `).join('') : `<p class="text-xs text-slate-400 py-6 text-center">${t('pushNo')}</p>`}
          </div>
          ${ns.length ? `<button class="btn btn-o w-full !py-2 text-xs text-red-400 border-red-500/20" onclick="clrN()">${t('clr')}</button>` : ''}
        </div>
      `);
      for (const n of ns) {
        if (!n.read) { n.read = 1; await dbPut('notifs', n); }
      }
      refreshBadge();
    }

    async function askPerm() {
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') notify('ok', '🔔 Push ON');
      } catch(e){}
      openNotifModal();
    }

    async function clrN() {
      await dbClr('notifs');
      refreshBadge();
      closeM();
      showT(t('clr'), '', '🧹');
    }

    function testPushNotification() {
      if (!('Notification' in window)) {
        showT('Push API', 'Web Notification not supported in browser', '⚠️');
        return;
      }
      if (Notification.permission === 'granted') {
        notify('pushT', 'System check: Push Notification operational.');
      } else {
        askPerm();
      }
    }

    /* ---------- Action Handlers ---------- */
    async function buy(k, price) {
      if (needLogin()) return;
      const key = 'ANDU-' + Math.random().toString(36).slice(2,6).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
      await dbPut('licenses', { pk: k, price, key, time: Date.now() });
      notify('nBuy', t(k) + ' (Key: ' + key + ')');
      navigate('dash', 1);
    }

    async function sendQuote(e) {
      e.preventDefault();
      if (needLogin()) return false;
      const ty = $('#qt').value;
      await dbPut('projects', { title: $('#qd').value.slice(0,60), type: ty, progress: 10, time: Date.now() });
      e.target.reset();
      notify('nQ', t(ty==='custom'?'o1':ty==='audit'?'o2':'o3'));
      navigate('dash', 2);
      return false;
    }

    async function enroll(k) {
      if (needLogin()) return;
      const ex = (await dbAll('courses')).find(c => c.id === k);
      if (!ex) await dbPut('courses', { id: k, progress: 0 });
      notify('nE', t(k));
      navigate('dash', 3);
    }

    let plan = k => { if (needLogin()) return; notify('nPl', t(k)); };
    const remind = () => { if (needLogin()) return; notify('nW', 'Sat 19:00 WIB - Kotlin Bootcamp'); };
    async function sub(e) { e.preventDefault(); notify('nS2', $('#ne').value); e.target.reset(); return false; }

    async function bump(id) {
      const p = (await dbAll('projects')).find(x => x.id === id);
      if (p) {
        p.progress = Math.min(100, p.progress + 15);
        await dbPut('projects', p);
        notify('nP', p.progress + '%');
        dashRender();
      }
    }

    async function lesson(k) {
      const c = (await dbAll('courses')).find(x => x.id === k);
      if (c) {
        c.progress = Math.min(100, c.progress + 25);
        await dbPut('courses', c);
        if (c.progress === 100) notify('nC', t(k));
        else showT(t(k), c.progress + '%', '📚');
        dashRender();
      }
    }

    function certificate(k) {
      const c = document.createElement('canvas');
      c.width = 1000; c.height = 640;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0,0,1000,640);
      g.addColorStop(0,'#080c18'); g.addColorStop(1,'#1b1236');
      x.fillStyle = g; x.fillRect(0,0,1000,640);
      x.strokeStyle = '#3DDC84'; x.lineWidth = 6; x.strokeRect(24,24,952,592);
      x.fillStyle = '#38bdf8'; x.textAlign = 'center';
      x.font = '800 40px sans-serif'; x.fillText('ANDU Academy • El-Salam Technology', 500, 130);
      x.fillStyle = '#fff'; x.font = '22px sans-serif';
      x.fillText(LG==='id'?'Sertifikat Kompetensi Digital':'Digital Competency Certificate', 500, 190);
      x.font = '800 48px sans-serif'; x.fillStyle = '#3DDC84';
      x.fillText(user ? user.name : 'Android Engineer', 500, 320);
      x.fillStyle = '#fff'; x.font = '26px sans-serif';
      x.fillText(t(k), 500, 400);
      x.font = '16px monospace'; x.fillStyle = '#94a3b8';
      x.fillText('Issued: ' + new Date().toLocaleDateString() + ' · ' + (window.__cc ? window.__cc.code : 'Verified Hash: ANDU-OK'), 500, 560);
      const a = document.createElement('a');
      a.download = 'ANDU-certificate-' + (user ? user.name.replace(/\s+/g,'_') : 'dev') + '.png';
      a.href = c.toDataURL();
      a.click();
      showT(t('cert'), '', '🏆');
    }

    function dlSrc(k) {
      const b = new Blob(['// ANDU Official Source: ' + k + '\nfun main(){\n    println("Hello ANDU - ' + k + '")\n}\n'], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = k + '-source.kt';
      a.click();
      showT(t('dl'), k + '-source.kt', '⬇️');
    }

    /* ---------- Dashboard Renderer (5 Integrated Tabs) ---------- */
    async function dashRender() {
      $('#who').textContent = user ? '👤 ' + user.name : 'RBAC · guest';
      
      const tabDefs = [
        { id: 1, name: t('t1') },
        { id: 2, name: t('t2') },
        { id: 3, name: t('t3') },
        { id: 4, name: t('t4') },
        { id: 5, name: t('t5') }
      ];

      $('#terminalTabsNav').innerHTML = tabDefs.map(tb => `
        <button class="tab btn btn-o whitespace-nowrap !py-2 !px-4 text-xs ${tab===tb.id ? 'act' : ''}" onclick="tab=${tb.id}; dashRender()">${tb.name}</button>
      `).join('');

      // Top action buttons dependent on active terminal tab
      const topActions = $('#dashTopActions');
      if (tab === 4) {
        topActions.innerHTML = `
          <button class="btn btn-o !py-1.5 !px-3 text-xs font-mono text-[#38bdf8]" onclick="seedSampleTasks()">✨ ${t('btnSeedTasks')}</button>
          <button class="btn btn-o !py-1.5 !px-3 text-xs font-mono text-red-400 border-red-500/20" onclick="clearAllTasks()">🗑️ ${t('btnClearVault')}</button>
        `;
      } else if (user) {
        topActions.innerHTML = `<button class="text-xs text-slate-400 hover:text-white underline" onclick="signOut()">${t('out')}</button>`;
      } else {
        topActions.innerHTML = '';
      }

      const b = $('#dbody');

      // TABS 1, 2, 3 Require sign in
      if ((tab === 1 || tab === 2 || tab === 3) && !user) {
        b.innerHTML = `
          <div class="text-center py-12 glass-card rounded-2xl border border-white/5 space-y-2">
            <span class="text-3xl block opacity-60">🔒</span>
            <p class="text-slate-400 text-xs">${t('needLogin')}</p>
            <button class="btn btn-p !py-2 !px-4 text-xs mt-2" onclick="login()">${t('login')}</button>
          </div>
        `;
        return;
      }

      const empty = `<p class="text-slate-400 text-xs py-10 text-center">${t('empty')}</p>`;

      // TAB 1: LICENSES
      if (tab === 1) {
        const l = await dbAll('licenses');
        b.innerHTML = l.length ? l.sort((a,b)=>b.time-a.time).map(x => `
          <div class="glass-card rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center mb-2.5 border border-white/5">
            <div>
              <b class="text-white text-sm">${t(x.pk)}</b>
              <p class="text-[11px] text-slate-400 font-mono">${fmt(x.time)} · INV-${String(x.time).slice(-6)} · ${_rp(x.price)}</p>
              <p class="font-mono text-xs text-[#3DDC84] mt-1 font-bold">${t('key')}: ${x.key}</p>
            </div>
            <button class="btn btn-o !py-2 !px-3 text-xs" onclick="dlSrc('${x.pk}')">⬇ ${t('dl')}</button>
          </div>
        `).join('') : empty;
      }
      
      // TAB 2: PROJECTS
      else if (tab === 2) {
        const p = await dbAll('projects');
        b.innerHTML = p.length ? p.map(x => `
          <div class="glass-card rounded-2xl p-4 mb-2.5 border border-white/5 space-y-2">
            <div class="flex justify-between text-xs">
              <b class="text-white">${esc(x.title)}</b>
              <span class="text-[#3DDC84] font-mono font-bold">${x.progress}%</span>
            </div>
            <div class="bar"><i style="width:${x.progress}%"></i></div>
            <div class="pt-1 flex justify-between items-center">
              <small class="text-[10px] text-slate-500 font-mono">${fmt(x.time)}</small>
              ${x.progress<100 ? `<button class="btn btn-o !py-1 !px-2.5 text-xs font-bold" onclick="bump(${x.id})">⏩ Sprint (+15%)</button>` : `<span class="text-xs text-[#3DDC84] font-bold">✅ Completed</span>`}
            </div>
          </div>
        `).join('') : empty;
      }
      
      // TAB 3: CLASSROOM
      else if (tab === 3) {
        const c = await dbAll('courses');
        b.innerHTML = c.length ? c.map(x => `
          <div class="glass-card rounded-2xl p-4 mb-2.5 border border-white/5 space-y-2">
            <div class="flex justify-between text-xs">
              <b class="text-white">${t(x.id)}</b>
              <span class="text-[#38bdf8] font-mono font-bold">${x.progress}%</span>
            </div>
            <div class="bar"><i style="width:${x.progress}%"></i></div>
            <div class="pt-1 flex justify-end">
              ${x.progress<100 ? `<button class="btn btn-o !py-1 !px-2.5 text-xs font-bold" onclick="lesson('${x.id}')">${t('learn')} (+25%)</button>` : `<button class="btn btn-p !py-1.5 !px-3 text-xs font-bold" onclick="certificate('${x.id}')">🏆 ${t('cert')}</button>`}
            </div>
          </div>
        `).join('') : empty;
      }

      // TAB 4: INTEGRATED INDEXEDDB TARGET VAULT
      else if (tab === 4) {
        b.innerHTML = `
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-white/5 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-white">${t('titleTasks')}</span>
                <span class="px-2 py-0.5 rounded-full bg-[#3DDC84]/20 text-[#3DDC84] text-[10px] font-mono border border-[#3DDC84]/30">${t('badgeIndexedDb')}</span>
              </div>
              <p class="text-xs text-slate-400 hidden sm:block">${t('descTasks')}</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <!-- Form Left -->
              <div class="lg:col-span-5 glass-card rounded-2xl p-5 space-y-4 border border-white/10">
                <h3 class="font-bold text-white text-xs flex items-center gap-2 border-b border-white/10 pb-2">
                  <span>✍️</span> <span>${t('formTitleNewTask')}</span>
                </h3>
                <form class="space-y-3" id="task-form" onsubmit="handleAddTask(event)">
                  <div>
                    <label class="block text-xs font-bold text-zinc-300 mb-1">${t('lblTaskTitle')}</label>
                    <input class="w-full glass-input p-2.5 rounded-xl text-xs" id="input-task-title" placeholder="${t('phTaskTitle')}" required="" type="text"/>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-zinc-300 mb-1">${t('lblCategory')}</label>
                      <select class="w-full glass-input p-2.5 rounded-xl text-xs text-white" id="input-task-category">
                        <option value="Jetpack Compose">Jetpack Compose UI</option>
                        <option value="Coroutines Flow">Coroutines &amp; Async</option>
                        <option value="Room Database">Room SQLite DB</option>
                        <option value="Gradle Build">Gradle CI/CD</option>
                        <option value="Security Keystore">Security Keystore</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-zinc-300 mb-1">${t('lblPriority')}</label>
                      <select class="w-full glass-input p-2.5 rounded-xl text-xs text-white" id="input-task-priority">
                        <option value="High">🔴 High Priority</option>
                        <option selected="" value="Medium">🟡 Medium Priority</option>
                        <option value="Low">🟢 Low Priority</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-zinc-300 mb-1">${t('lblDescription')}</label>
                    <textarea class="w-full glass-input p-2.5 rounded-xl text-xs" id="input-task-desc" placeholder="${t('phTaskDesc')}" rows="2"></textarea>
                  </div>
                  <button class="w-full py-2.5 rounded-xl btn btn-p text-xs uppercase tracking-wider flex items-center justify-center gap-2" type="submit">
                    <span>💾</span> <span>${t('btnSaveTask')}</span>
                  </button>
                </form>
              </div>
              <!-- Task List Right -->
              <div class="lg:col-span-7 space-y-3">
                <div class="flex items-center justify-between glass-card p-3 rounded-2xl border border-white/5">
                  <span class="text-xs font-bold text-white flex items-center gap-2">
                    <span>📁</span> <span>${t('lblVaultList')}</span>
                  </span>
                  <span class="text-[10px] font-mono font-bold bg-[#3DDC84]/20 text-[#3DDC84] px-2.5 py-0.5 rounded-full border border-[#3DDC84]/30" id="task-count-badge">0</span>
                </div>
                <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1" id="tasks-list"></div>
                <div class="flex-col items-center justify-center p-8 glass-card rounded-2xl border border-dashed border-white/10 text-center flex" id="tasks-empty-state">
                  <span class="text-3xl mb-2 opacity-50">📥</span>
                  <h4 class="font-bold text-white text-xs mb-1">${t('emptyVaultTitle')}</h4>
                  <p class="text-[11px] text-zinc-400">${t('emptyVaultDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        `;
        renderTasksFromDB();
      }

      // TAB 5: INTEGRATED DEV TOOLS & DIAGNOSTICS
      else if (tab === 5) {
        b.innerHTML = `
          <div class="space-y-6">
            <div class="border-b border-white/5 pb-2">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <span>⚙️</span> <span>${t('titleTools')}</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">${t('descTools')}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Gradle Build Benchmark -->
              <div class="glass-card p-6 rounded-2xl space-y-4 border border-white/10">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-white text-sm flex items-center gap-2">
                    <span>⚙️</span> <span>${t('toolGradleTitle')}</span>
                  </h4>
                  <span class="text-[10px] font-mono text-[#3DDC84] bg-[#3DDC84]/10 px-2 py-0.5 rounded border border-[#3DDC84]/20" id="gradleBadge">READY</span>
                </div>
                <p class="text-xs text-zinc-300">${t('toolGradleDesc')}</p>
                <div class="space-y-2 p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div class="flex justify-between text-xs font-mono text-zinc-400">
                    <span id="gradle-status-text">Idle</span>
                    <span class="text-[#3DDC84]" id="gradle-time-text">0.0s</span>
                  </div>
                  <div class="w-full bg-black/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div class="h-full bg-gradient-to-r from-[#3DDC84] to-[#38bdf8] rounded-full w-0 transition-all duration-150" id="gradle-progress-bar"></div>
                  </div>
                </div>
                <button class="w-full py-2.5 rounded-xl btn btn-o text-xs font-bold" id="btn-run-gradle" onclick="runGradleSimulation()">
                  ⚡ <span>${t('btnRunBenchmark')}</span>
                </button>
              </div>

              <!-- Android SDK Version Inspector -->
              <div class="glass-card p-6 rounded-2xl space-y-4 border border-white/10">
                <h4 class="font-bold text-white text-sm flex items-center gap-2">
                  <span>🎯</span> <span>${t('toolApiTitle')}</span>
                </h4>
                <div class="space-y-3">
                  <label class="block text-xs text-zinc-400">${t('lblSelectApi')}</label>
                  <select class="w-full glass-input p-2.5 rounded-xl text-xs text-white" id="api-selector" onchange="updateApiDetails()">
                    <option value="35">API 35 - Android 15 (Vanilla Ice Cream)</option>
                    <option selected="" value="34">API 34 - Android 14 (Upside Down Cake)</option>
                    <option value="33">API 33 - Android 13 (Tiramisu)</option>
                    <option value="31">API 31 - Android 12 (Snow Cone)</option>
                    <option value="30">API 30 - Android 11 (Red Velvet Cake)</option>
                  </select>
                  <div class="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono" id="api-details-card">
                    <div class="flex justify-between text-zinc-300">
                      <span>Codename:</span>
                      <strong class="text-[#3DDC84]" id="api-code-name">UpsideDownCake</strong>
                    </div>
                    <div class="flex justify-between text-zinc-300">
                      <span>Release Year:</span>
                      <strong class="text-white" id="api-year">2023</strong>
                    </div>
                    <div class="flex justify-between text-zinc-300">
                      <span>Min Gradle Version:</span>
                      <strong class="text-[#38bdf8]" id="api-gradle">8.1+</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    /* ---------- IndexedDB Target Vault Handlers ---------- */
    async function handleAddTask(e) {
      e.preventDefault();
      const title = $('#input-task-title').value.trim();
      const category = $('#input-task-category').value;
      const priority = $('#input-task-priority').value;
      const desc = $('#input-task-desc').value.trim();

      const newTask = {
        title,
        category,
        priority,
        desc: desc || 'IndexedDB persistent task.',
        createdAt: Date.now()
      };
      await dbPut('sprint_tasks', newTask);
      e.target.reset();
      showT(t('ok'), title, '💾');
      renderTasksFromDB();
      notify('ok', `${title} (${priority})`);
    }

    async function renderTasksFromDB() {
      const tasks = (await dbAll('sprint_tasks')).sort((a,b)=>b.createdAt-a.createdAt);
      const container = $('#tasks-list');
      const emptyState = $('#tasks-empty-state');
      const badge = $('#task-count-badge');
      if (badge) badge.textContent = tasks.length;
      if (!container || !emptyState) return;

      if (!tasks.length) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
      }
      emptyState.classList.add('hidden');
      emptyState.classList.remove('flex');

      container.innerHTML = tasks.map(tk => {
        let badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/30";
        if (tk.priority === 'High') badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";
        if (tk.priority === 'Low') badgeColor = "bg-[#3DDC84]/20 text-[#3DDC84] border-[#3DDC84]/30";

        return `
          <div class="glass-card p-3 rounded-xl border border-white/5 flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}">${tk.priority}</span>
                <span class="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-mono">${tk.category}</span>
                <span class="text-[10px] text-slate-500 font-mono">${new Date(tk.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              <h4 class="font-bold text-white text-xs sm:text-sm">${esc(tk.title)}</h4>
              <p class="text-xs text-slate-400 leading-snug">${esc(tk.desc)}</p>
            </div>
            <button onclick="deleteTask(${tk.id})" class="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs border border-red-500/20 transition" title="Delete">
              🗑️
            </button>
          </div>
        `;
      }).join('');
    }

    async function deleteTask(id) {
      await dbDel('sprint_tasks', id);
      showT('Deleted', 'Task removed from IndexedDB', '🗑️');
      renderTasksFromDB();
    }

    async function clearAllTasks() {
      if (confirm('Clear all tasks from IndexedDB?')) {
        await dbClr('sprint_tasks');
        showT('Cleared', 'IndexedDB Vault is empty', '🧹');
        renderTasksFromDB();
      }
    }

    async function seedSampleTasks() {
      const samples = [
        { title: 'Integrate Biometric Auth Keystore', category: 'Security Keystore', priority: 'High', desc: 'Hardware-backed CryptoObject verification.' },
        { title: 'Room Database Auto-Migration Flow', category: 'Room Database', priority: 'Medium', desc: 'Schema export validation and Flow testing.' },
        { title: 'Compose LazyColumn Staggered Grid', category: 'Jetpack Compose', priority: 'Low', desc: 'Optimize recompositions with derivedStateOf.' }
      ];
      for (const s of samples) {
        await dbPut('sprint_tasks', { ...s, createdAt: Date.now() });
      }
      showT('Loaded', 'Sample sprint targets added', '✨');
      renderTasksFromDB();
    }

    /* ---------- Diagnostics & Gradle Simulator ---------- */
    function runGradleSimulation() {
      const btn = $('#btn-run-gradle');
      const bar = $('#gradle-progress-bar');
      const status = $('#gradle-status-text');
      const time = $('#gradle-time-text');
      const badge = $('#gradleBadge');
      if (!btn || !bar) return;

      btn.disabled = true;
      badge.textContent = "BUILDING";
      badge.className = "text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/20";
      status.textContent = "Compiling Kotlin & Compose plugins...";

      let progress = 0;
      let duration = 0;
      const interval = setInterval(() => {
        progress += 12.5;
        duration += 0.18;
        bar.style.width = progress + '%';
        time.textContent = duration.toFixed(1) + 's';

        if (progress >= 100) {
          clearInterval(interval);
          status.textContent = "BUILD SUCCESSFUL in 1.4s (daemon cached)";
          badge.textContent = "PASSED";
          badge.className = "text-[10px] font-mono text-[#3DDC84] bg-[#3DDC84]/10 px-2 py-0.5 rounded border border-[#3DDC84]/20";
          btn.disabled = false;
          showT('Gradle Build', 'Daemon incremental build finished successfully!', '⚡');
        }
      }, 150);
    }

    const apiLookup = {
      "35": { name: "VanillaIceCream", year: "2024", gradle: "8.7+" },
      "34": { name: "UpsideDownCake", year: "2023", gradle: "8.1+" },
      "33": { name: "Tiramisu", year: "2022", gradle: "7.4+" },
      "31": { name: "SnowCone", year: "2021", gradle: "7.0+" },
      "30": { name: "RedVelvetCake", year: "2020", gradle: "6.8+" }
    };

    function updateApiDetails() {
      const val = $('#api-selector').value;
      const info = apiLookup[val];
      if (info) {
        $('#api-code-name').textContent = info.name;
        $('#api-year').textContent = info.year;
        $('#api-gradle').textContent = info.gradle;
      }
    }

    /* ---------- Handle URL Hash Routing & Boot ---------- */
    window.addEventListener('hashchange', () => {
      const targetHash = window.location.hash.replace('#', '') || 'home';
      navigate(targetHash);
    });

    (async () => {
      if (window.anduInstall) window.anduInstall();
      await openDB();
      const u = await dbAll('users');
      user = u[0] || null;
      render();
      refreshBadge();
      if (window.anduRestore) await window.anduRestore();

      // Read initial hash route
      const initialRoute = window.location.hash.replace('#', '') || 'home';
      navigate(initialRoute);

      // Typing code simulator
      let i = 0;
      const el = $('#code');
      const tick = () => {
        el.textContent = code.slice(0, i++);
        if (i <= code.length) setTimeout(tick, 28);
      };
      tick();

      setTimeout(() => {
        showT(t('pushT'), LG==='id'?'Sistem SPA siap. Ketuk tab navigasi untuk berpindah layar.':'SPA System ready. Tap tabs to switch screens.', '🚀');
      }, 1800);
    })();
  