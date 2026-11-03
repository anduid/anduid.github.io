/* ANDU landing – penghubung ke backend. Dipasang oleh landing.js lewat window.anduInstall().
   Bila gas_url kosong, seluruh situs tetap berjalan sebagai demo lokal (IndexedDB). */
(function () {
  var C = window.AnduCore;
  if (!C || !C.gas) { console.info('ANDU: gas_url kosong, memakai mode demo lokal.'); return; }

  window.anduInstall = function () {
    var CAT = (window.ANDU && window.ANDU.catalog) || [];
    var sk = function (id) { return String(id).replace(/^(product|course|plan|service|link)-/, ''); };
    var item = function (k) { return CAT.filter(function (c) { return sk(c.id) === k; })[0]; };
    var L = function (id, en) { return LG === 'id' ? id : en; };
    var ERR = function (e) { showT(L('Gagal', 'Error'), (e && e.message) || String(e), '⚠️'); };
    var me = null, lastTs = '', timers = [];
    var ensureK = function (k, title) { if (!D[k]) K(k, title, title); };
    var inp = 'glass-input w-full p-2.5 rounded-xl text-xs', btnP = 'btn btn-p w-full !py-2.5 text-xs', btnO = 'btn btn-o w-full !py-2 text-xs';

    /* ---------- katalog -> kamus bahasa ---------- */
    CAT.forEach(function (c) { var k = sk(c.id); ensureK(k, c.title); ensureK(k + 'd', c.desc || ''); });

    /* ---------- cermin data server ke IndexedDB lokal ---------- */
    async function mirror(m) {
      me = m;
      for (var s of ['licenses', 'projects', 'courses', 'notifs']) await dbClr(s);
      for (var l of m.licenses) {
        var it = item(sk(l.productId)) || {};
        await dbPut('licenses', { id: l.id, pk: sk(l.productId), price: it.price || 0, key: l.key, time: Date.parse(l.createdAt), url: l.downloadUrl || '' });
      }
      for (var p of m.projects) await dbPut('projects', { id: p.id, title: p.title, type: p.type, progress: p.progress, status: p.status, time: Date.parse(p.createdAt) });
      for (var c of m.courses) { ensureK(sk(c.courseId), c.courseTitle); await dbPut('courses', { id: sk(c.courseId), progress: c.progress, done: c.done, xp: c.xp, cert: c.certCode }); }
      m.feed.slice().reverse().forEach(function (n, i) { ensureK('srv' + n.ts, n.title); });
      for (var n of m.feed.slice().reverse()) await dbPut('notifs', { key: 'srv' + n.ts, body: n.body, time: Date.parse(n.ts), read: n.read ? 1 : 0 });
      lastTs = m.feed.length ? m.feed[0].ts : lastTs;
    }
    async function syncMe() { var m = await C.call('me'); await mirror(m); refreshBadge(); dashRender(); return m; }

    /* ---------- login / daftar ---------- */
    window.login = function (mode) {
      mode = mode === 'reg' ? 'reg' : 'in';
      openM('<div class="space-y-4"><h3 class="text-xl font-black text-white">' + t('lT') + '</h3>' +
        '<div class="flex gap-2"><button class="btn ' + (mode === 'in' ? 'btn-p' : 'btn-o') + ' !py-1.5 !px-3 text-xs" onclick="login(\'in\')">' + L('Masuk', 'Sign in') + '</button>' +
        '<button class="btn ' + (mode === 'reg' ? 'btn-p' : 'btn-o') + ' !py-1.5 !px-3 text-xs" onclick="login(\'reg\')">' + L('Daftar', 'Register') + '</button></div>' +
        '<p class="text-xs text-slate-400">' + L('Akun Pesaner yang sama berlaku di Pesaner, ASN Andu, dan ANDU.', 'One Pesaner account works across Pesaner, ASN Andu and ANDU.') + '</p>' +
        '<form onsubmit="return doAuth(event,\'' + mode + '\')" class="space-y-3">' +
        (mode === 'reg' ? '<input name="nm" class="' + inp + '" required placeholder="' + t('lN') + '"><input name="em" type="email" class="' + inp + '" required placeholder="Email">' : '') +
        '<input name="un" class="' + inp + '" required autocomplete="username" placeholder="Username">' +
        '<input name="pw" type="password" class="' + inp + '" required autocomplete="' + (mode === 'reg' ? 'new-password' : 'current-password') + '" placeholder="' + L('Kata sandi', 'Password') + '">' +
        '<p id="aerr" class="text-xs text-red-400"></p><button class="' + btnP + '">' + t('lGo') + '</button></form></div>');
    };
    window.doAuth = async function (e, mode) {
      e.preventDefault(); var f = e.target, b = f.querySelector('button:last-child'); b.disabled = true;
      try {
        var j = mode === 'reg' ? await C.call('authRegister', { name: f.elements.nm.value, email: f.elements.em.value, username: f.elements.un.value, password: f.elements.pw.value }) : await C.call('authLogin', { username: f.elements.un.value, password: f.elements.pw.value });
        C.session(j); user = { id: 'me', name: j.user.name, email: (j.status && j.status.email) || '', admin: j.user.admin };
        await dbPut('users', user); closeM(); render(); var m = await syncMe(); vaultPull(); schedule();
        showT(L('Selamat datang', 'Welcome'), user.name, '👋'); navigate('dash', 1);
        if (m.invoice) invoiceView(m.invoice);
      } catch (err) { var el = $('#aerr'); if (el) el.textContent = err.message; b.disabled = false; }
      return false;
    };
    window.authClick = function () { if (!user) return login(); if (confirm(t('out') + '?')) signOut(); };
    window.signOut = async function () {
      C.clear(); for (var s of ['users', 'licenses', 'projects', 'courses', 'notifs']) await dbClr(s);
      user = null; me = null; timers.forEach(clearInterval); timers = []; render(); closeM(); refreshBadge();
    };

    /* ---------- pembayaran QRIS ---------- */
    var payTimer = null, pollTimer = null;
    var stopPay = function () { clearInterval(payTimer); clearInterval(pollTimer); };
    var _closeM = window.closeM; window.closeM = function () { stopPay(); _closeM(); };
    function row(a, b, cls) { return '<div class="flex justify-between text-xs ' + (cls || 'text-slate-300') + '"><span>' + a + '</span><b class="font-mono">' + b + '</b></div>'; }

    window.payForm = function (it) {
      var pts = me ? me.status.points : 0;
      openM('<div class="space-y-4"><h3 class="text-lg font-black text-white">' + C.esc(it.title) + '</h3>' +
        '<div class="text-2xl font-mono font-black text-[#3DDC84]">' + C.rp(it.price) + '</div>' +
        (pts > 0 ? '<label class="flex items-center gap-2 text-xs text-slate-300"><input id="pp" type="checkbox"> ' + L('Pakai poin ', 'Use points ') + C.rp(pts) + L(' sebagai potongan', ' as discount') + '</label>' : '') +
        '<p class="text-[11px] text-slate-400">' + L('Nominal ditambah kode unik 1–499. Kode unik tidak hilang: setelah diverifikasi masuk sebagai poin di akun Anda.', 'A unique code (1–499) is added. It is not lost: once verified it is credited as points to your account.') + '</p>' +
        '<p id="aerr" class="text-xs text-red-400"></p><button id="pmk" class="' + btnP + '">' + L('Buat Tagihan QRIS', 'Create QRIS invoice') + '</button></div>');
      $('#pmk').onclick = async function () {
        this.disabled = true;
        try { var j = await C.call('createInvoice', { itemId: it.id, usePoints: !!($('#pp') && $('#pp').checked) }); invoiceView(j.invoice); }
        catch (e) { $('#aerr').textContent = e.message; this.disabled = false; }
      };
    };
    function invoiceView(inv) {
      stopPay();
      if (inv.status === 'CLAIMED') return waitView(inv);
      var exp = Date.parse(inv.expiresAt);
      openM('<div class="space-y-3"><h3 class="text-lg font-black text-white">' + L('Bayar dengan QRIS', 'Pay with QRIS') + '</h3>' +
        '<p class="text-xs text-slate-400 font-mono">' + C.esc(inv.code) + ' · ' + C.esc(inv.itemTitle) + '</p>' +
        '<div class="flex justify-center"><div id="qrbox" class="bg-white p-2 rounded-xl"></div></div>' +
        '<div class="glass-card rounded-xl p-3 space-y-1">' + row(L('Harga', 'Price'), C.rp(inv.price)) +
        (inv.pointsUsed ? row(L('Potongan poin', 'Points used'), '−' + C.rp(inv.pointsUsed)) : '') + row(L('Kode unik', 'Unique code'), '+' + inv.uniqueCode) +
        '<div class="border-t border-white/10 pt-2">' + row(L('Total transfer', 'Total'), C.rp(inv.total), 'text-white text-base') + '</div></div>' +
        '<p class="text-[11px] text-amber-300">' + L('Bayar PERSIS sesuai total (termasuk kode unik). Kedaluwarsa dalam ', 'Pay the EXACT total. Expires in ') + '<b id="cd" class="font-mono"></b></p>' +
        '<input id="pn" class="' + inp + '" placeholder="' + L('Nama pengirim di mutasi (opsional)', 'Sender name on statement (optional)') + '">' +
        '<p id="aerr" class="text-xs text-red-400"></p><div class="flex gap-2"><button id="pdone" class="' + btnP + '">' + L('Saya sudah bayar', 'I have paid') + '</button><button id="pcx" class="' + btnO + '">' + L('Batalkan', 'Cancel') + '</button></div></div>');
      C.qr($('#qrbox'), inv.qris);
      var tick = function () { var s = Math.max(0, Math.floor((exp - Date.now()) / 1000)); var el = $('#cd'); if (el) el.textContent = Math.floor(s / 3600) + ':' + ('0' + Math.floor(s % 3600 / 60)).slice(-2) + ':' + ('0' + s % 60).slice(-2); if (!s) { stopPay(); if (el) el.textContent = L('kedaluwarsa', 'expired'); } };
      tick(); payTimer = setInterval(tick, 1000);
      $('#pdone').onclick = async function () {
        this.disabled = true;
        try { var j = await C.call('claimPaid', { code: inv.code, payerName: $('#pn').value }); waitView(j.invoice); } catch (e) { $('#aerr').textContent = e.message; this.disabled = false; }
      };
      $('#pcx').onclick = async function () { try { await C.call('cancelInvoice', { code: inv.code }); await syncMe(); closeM(); } catch (e) { $('#aerr').textContent = e.message; } };
    }
    function waitView(inv) {
      stopPay();
      openM('<div class="space-y-3 text-center"><div class="text-5xl">⏳</div><h3 class="text-lg font-black text-white">' + L('Menunggu verifikasi', 'Awaiting verification') + '</h3>' +
        '<p class="text-xs text-slate-300">' + L('Kode tagihan dan nominal unik sudah dikirim ke admin. Biasanya diverifikasi dalam hitungan menit pada jam kerja.', 'Your invoice code and unique amount were sent to the admin for verification.') + '</p>' +
        '<p class="font-mono text-sm text-[#3DDC84]">' + C.esc(inv.code) + ' · ' + C.rp(inv.total) + '</p><button class="' + btnO + '" onclick="closeM()">' + L('Tutup (tetap dipantau)', 'Close (keeps checking)') + '</button></div>');
      var check = async function () {
        try {
          var m = await C.call('me'), open = m.invoice && m.invoice.code === inv.code;
          if (open) return;
          clearInterval(pollTimer); await mirror(m); refreshBadge(); dashRender();
          var h = m.history.filter(function (x) { return x.code === inv.code; })[0];
          if (h && h.status === 'APPROVED') { showT(L('Pembayaran disetujui', 'Payment approved'), h.itemTitle, '✅'); if ($('#md') && !$('#md').classList.contains('hidden')) _closeM(); navigate('dash', 1); }
          else showT(L('Pembayaran ditolak', 'Payment rejected'), (h && h.adminNote) || '', '⚠️');
        } catch (e) {}
      };
      pollTimer = setInterval(check, 8000);
    }
    pollTimer = null;

    /* ---------- aksi katalog ---------- */
    window.buy = async function (k, price) {
      var it = item(k); if (it && it.type === 'link') return window.open(it.url, '_blank', 'noopener');
      if (needLogin()) return; if (!it) return;
      try {
        if (!(it.price > 0)) { await C.call('claimFree', { itemId: it.id }); await syncMe(); notify('nBuy', t(k)); return navigate('dash', 1); }
        var m = me || await C.call('me');
        if (m.invoice) return invoiceView(m.invoice);
        payForm(it);
      } catch (e) { ERR(e); }
    };
    plan = function (k) {
      if (needLogin()) return;
      var id = { pl2: 'plan-monthly', pl3: 'plan-vip' }[k]; if (!id) return notify('nPl', t(k));
      var it = CAT.filter(function (c) { return c.id === id; })[0]; if (it) (me && me.invoice ? invoiceView(me.invoice) : payForm(it));
    };
    window.enroll = async function (k) {
      if (needLogin()) return; var it = item(k);
      try { await C.call('enroll', { courseId: it.id }); await syncMe(); notify('nE', t(k)); navigate('dash', 3); }
      catch (e) { if (it && it.price > 0 && /berbayar/i.test(e.message)) (me && me.invoice ? invoiceView(me.invoice) : payForm(it)); else ERR(e); }
    };
    window.lesson = async function (k) {
      var it = item(k), c = (await dbAll('courses')).filter(function (x) { return x.id === k; })[0]; if (!it || !c) return;
      var next = (it.modules || []).filter(function (m) { return (c.done || []).indexOf(m.id) < 0; })[0]; if (!next) return;
      if (it.quiz && it.quiz.module === next.id) return quiz(it);
      try { var j = await C.call('markModule', { courseId: it.id, moduleId: next.id }); await syncMe(); if (j.enrollment.progress >= 100) notify('nC', t(k)); else showT(t(k), j.enrollment.progress + '%', '📚'); } catch (e) { ERR(e); }
    };
    function quiz(it) {
      var qs = it.quiz.questions || [];
      if (!qs.length) return showT(t(sk(it.id)), L('Ujian belum tersedia.', 'Exam not available yet.'), 'ℹ️');
      openM('<form class="space-y-4" onsubmit="return false"><h3 class="text-lg font-black text-white">' + L('Ujian akhir', 'Final exam') + '</h3>' +
        qs.map(function (q, i) { return '<div class="space-y-1"><p class="text-xs font-bold text-white">' + (i + 1) + '. ' + C.esc(q.q) + '</p>' + q.options.map(function (o, j) { return '<label class="flex gap-2 text-xs text-slate-300"><input type="radio" name="q' + i + '" value="' + j + '"> ' + C.esc(o) + '</label>'; }).join('') + '</div>'; }).join('') +
        '<p id="aerr" class="text-xs text-red-400"></p><button id="qs" class="' + btnP + '">' + L('Kirim jawaban', 'Submit') + '</button></form>');
      $('#qs').onclick = async function () {
        var ans = qs.map(function (q, i) { var r = document.querySelector('input[name=q' + i + ']:checked'); return r ? +r.value : -1; });
        if (ans.indexOf(-1) >= 0) return ($('#aerr').textContent = L('Jawab semua pertanyaan.', 'Answer all questions.'));
        try {
          var j = await C.call('submitQuiz', { courseId: it.id, answers: ans }); await syncMe();
          $('#mb').innerHTML = '<div class="text-center space-y-3"><div class="text-5xl">' + (j.passed ? '🏆' : '📘') + '</div><h3 class="text-lg font-black text-white">' + L('Nilai: ', 'Score: ') + j.score + '</h3><p class="text-xs text-slate-300">' + (j.passed ? L('Lulus! Klaim sertifikat Anda.', 'Passed! Claim your certificate.') : L('Belum lulus (minimal ' + j.pass + '). Coba lagi.', 'Not passed (min ' + j.pass + '). Try again.')) + '</p><button class="' + btnO + '" onclick="closeM()">OK</button></div>';
        } catch (e) { $('#aerr').textContent = e.message; }
      };
    }
    var _cert = window.certificate;
    window.certificate = async function (k) { var it = item(k); try { var j = await C.call('issueCert', { courseId: it.id }); window.__cc = j.certificate; _cert(k); } catch (e) { ERR(e); } };
    window.dlSrc = async function (k) {
      var l = (await dbAll('licenses')).filter(function (x) { return x.pk === k; })[0];
      if (l && l.url) window.open(l.url, '_blank', 'noopener'); else showT(L('Unduhan belum tersedia', 'Download not ready'), L('Hubungi tim ANDU.', 'Contact the ANDU team.'), 'ℹ️');
    };
    window.bump = function () { showT(L('Progres proyek', 'Project progress'), L('Diperbarui oleh tim ANDU setiap sprint.', 'Updated by the ANDU team each sprint.'), '🛠️'); };

    /* ---------- layanan, kemitraan, newsletter ---------- */
    window.sendQuote = async function (e) {
      e.preventDefault(); var f = e.target, ty = $('#qt').value;
      try {
        await C.call('submitQuote', { name: $('#qn').value, email: $('#qe').value, type: ty, brief: $('#qd').value });
        f.reset(); notify('nQ', t(ty === 'custom' ? 'o1' : ty === 'audit' ? 'o2' : 'o3'));
        if (user) { await syncMe(); navigate('dash', 2); }
      } catch (err) { ERR(err); } return false;
    };
    window.partnerForm = function (k) {
      var type = { k1: 'institution', k2: 'reseller', k3: 'affiliate' }[k];
      openM('<form class="space-y-3" onsubmit="return doPartner(event,\'' + type + '\')"><h3 class="text-lg font-black text-white">' + t(k) + '</h3>' +
        '<input name="nm" class="' + inp + '" required placeholder="' + t('fn') + '" value="' + C.esc(user ? user.name : '') + '"><input name="em" type="email" class="' + inp + '" required placeholder="Email" value="' + C.esc(user ? user.email : '') + '">' +
        '<input name="og" class="' + inp + '" placeholder="' + L('Organisasi', 'Organization') + '"><textarea name="ms" rows="3" class="' + inp + '" placeholder="' + L('Pesan singkat', 'Short message') + '"></textarea>' +
        '<p id="aerr" class="text-xs text-red-400"></p><button class="' + btnP + '">' + t('join') + '</button></form>');
    };
    window.doPartner = async function (e, type) {
      e.preventDefault(); var f = e.target;
      try { await C.call('partnerApply', { type: type, name: f.elements.nm.value, email: f.elements.em.value, org: f.elements.og.value, message: f.elements.ms.value }); closeM(); notify('nJ', f.elements.nm.value); }
      catch (err) { $('#aerr').textContent = err.message; } return false;
    };
    window.sub = async function (e) {
      e.preventDefault(); var f = e.target;
      try { await C.call('subscribe', { email: $('#ne').value, lang: LG }); notify('nS2', $('#ne').value); f.reset(); } catch (err) { ERR(err); } return false;
    };

    /* ---------- notifikasi (polling + Notification API) ---------- */
    async function pollNotifs() {
      if (!C.tok() || !user) return;
      try {
        var j = await C.call('myNotifs', { since: lastTs }), fresh = j.notifs.filter(function (n) { return !lastTs || n.ts > lastTs; });
        if (!fresh.length) return;
        lastTs = fresh[0].ts;
        for (var n of fresh.slice().reverse()) {
          ensureK('srv' + n.ts, n.title); await dbPut('notifs', { key: 'srv' + n.ts, body: n.body, time: Date.parse(n.ts), read: 0 });
          showT(n.title, n.body, '🔔');
          try { if ('Notification' in window && Notification.permission === 'granted') new Notification('ANDU – ' + n.title, { body: n.body }); } catch (e) {}
        }
        refreshBadge(); syncMe();
      } catch (e) {}
    }
    function schedule() { timers.forEach(clearInterval); timers = [setInterval(pollNotifs, 60000)]; }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) pollNotifs(); });

    /* ---------- brankas IndexedDB <-> server ---------- */
    async function vaultPush() { if (!C.tok()) return; try { await C.call('vaultPush', { data: JSON.stringify(await dbAll('sprint_tasks')) }); } catch (e) {} }
    async function vaultPull() {
      try {
        var j = await C.call('vaultPull'), srv = j.data ? JSON.parse(j.data) : [], loc = await dbAll('sprint_tasks');
        if (srv.length && !loc.length) { for (var x of srv) await dbPut('sprint_tasks', x); if (typeof renderTasksFromDB === 'function') renderTasksFromDB(); }
        else if (loc.length && !srv.length) vaultPush();
      } catch (e) {}
    }
    ['handleAddTask', 'deleteTask', 'clearAllTasks', 'seedSampleTasks'].forEach(function (n) {
      var f = window[n]; if (typeof f === 'function') window[n] = async function () { var r = await f.apply(this, arguments); vaultPush(); return r; };
    });

    /* ---------- pemulihan sesi saat halaman dibuka ---------- */
    window.anduRestore = async function () {
      var tk = C.tok();
      if (!tk) { if (user) { user = null; await dbClr('users'); render(); } }
      else { user = { id: 'me', name: tk.name, email: '' }; await dbPut('users', user); render(); try { await syncMe(); vaultPull(); schedule(); } catch (e) { if (e.code === 'AUTH') { user = null; render(); } } }
      if (/[?&]login=1/.test(location.search) && !user) login();
    };
  };
})();
