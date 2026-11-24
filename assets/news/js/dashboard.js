/* Dashboard Pembaca / Penulis / Superadmin – memakai GAS (gas-sync.js) + Code.gs.
   Halaman: <main id="dash" data-dash="reader|writer|superadmin">. Semua teks dinamis di-escape; HTML artikel disanitasi. */
(function () {
  'use strict';
  var C = window.ANDU_CONFIG, G = window.GAS, R = document.getElementById('dash');
  if (!R || !G) return;
  var MODE = R.dataset.dash, B = C.BASE || '', D = null, CUR = '', EDIT = null, AF = '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fmt = function (d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–'; };
  var ST = { draft: ['Draf', 'st-d'], pending_review: ['Menunggu Review', 'st-p'], published: ['Terbit', 'st-ok'], rejected: ['Perlu Revisi', 'st-r'] };
  var ROLE = { reader: 'Pembaca Setia', writer: 'Penulis', superadmin: 'Superadmin' };
  var WST = { none: 'Belum mengajukan', pending: 'Menunggu Persetujuan Redaksi', approved: 'Disetujui', rejected: 'Ditolak' };
  var TABS = { reader: [['bm', '🔖 Tersimpan'], ['lk', '❤️ Disukai'], ['cm', '💬 Komentar Saya'], ['wr', '✍️ Jadi Penulis']], writer: [['ed', '📝 Studio Editor'], ['ls', '📚 Artikel Saya']], superadmin: [['ap', '✅ Approval Penulis'], ['ar', '🗂️ Moderasi Artikel'], ['ed', '📰 Meja Redaksi'], ['an', '📊 Analitik & Komentar']] };

  var badge = function (s) { return ST[s] ? '<span class="st ' + ST[s][1] + '">' + ST[s][0] + '</span>' : ''; };
  var empty = function (t) { return '<p class="empty">' + t + '</p>'; };
  var box = function (h) { return '<section class="panel dbox">' + h + '</section>'; };
  var btn = function (act, id, label, cls, extra) { return '<button class="btn sm ' + (cls === undefined ? 'ghost' : cls) + '" data-act="' + act + '" data-id="' + esc(id) + '"' + (extra || '') + '>' + label + '</button>'; };

  function toast(m, bad) { var t = document.createElement('div'); t.className = 'dtoast' + (bad ? ' bad' : ''); t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3400); }
  function sanitize(html) {
    var doc = new DOMParser().parseFromString('<body>' + String(html || '') + '</body>', 'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,form,link,meta,base,svg,math').forEach(function (n) { n.remove(); });
    doc.querySelectorAll('*').forEach(function (n) {
      [].slice.call(n.attributes).forEach(function (a) {
        var nm = a.name.toLowerCase();
        if (nm.indexOf('on') === 0 || nm === 'style' || nm === 'srcdoc' || nm === 'formaction' || ((nm === 'href' || nm === 'src') && !/^(https?:|mailto:|#|\/(?!\/))/i.test(a.value.trim()) && !/^data:image\/(png|jpe?g|gif|webp);/i.test(a.value.trim()))) n.removeAttribute(a.name);
      });
      if (n.tagName === 'A') n.setAttribute('rel', 'noopener noreferrer');
    });
    return doc.body.innerHTML;
  }
  function modal(h, onclick) {
    var o = document.createElement('div'); o.className = 'dov';
    o.innerHTML = '<div class="dmod" role="dialog" aria-modal="true"><button class="btn sm ghost dx" aria-label="Tutup">✕</button>' + h + '</div>';
    o.onclick = function (e) { if (e.target === o || e.target.closest('.dx')) { o.remove(); return; } var t = e.target.closest('[data-act]'); if (t && onclick) { o.remove(); onclick(t); } };
    document.body.appendChild(o);
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { o.remove(); document.removeEventListener('keydown', k); } });
  }
  async function call(a, d, post) { try { return await G.call(a, d, post); } catch (e) { if (e.code === 401) { G.logout(); setTimeout(function () { location.reload(); }, 1200); } throw e; } }
  async function reload(tab) { D = await call('get_dashboard_data', { mode: MODE }); G.save(G.session.token, true, D.profile); render(tab); }

  /* ---------- boot & login ---------- */
  async function boot() {
    if (!G.enabled) { R.innerHTML = box('<h1>Dashboard</h1><p>Backend belum terhubung. Isi <code>gas_webapp_url</code> di <code>_config.yml</code> dengan URL Web App <code>Code.gs</code>.</p><a class="btn" href="' + B + '/">← Portal</a>'); return; }
    G.load();
    if (!G.session || !G.session.verified) { loginView(); return; }
    try { D = await call('get_dashboard_data', { mode: MODE }); }
    catch (e) { R.innerHTML = box('<h1>Akses ditolak</h1><p>' + esc(e.message) + '</p><a class="btn" href="' + B + '/dashboard-pembaca/">Buka Dashboard Pembaca</a>'); return; }
    G.save(G.session.token, true, D.profile); render();
  }
  function loginView() {
    var pu = G.pesanerUser() || {};
    R.innerHTML = box('<h1>Masuk ke Dashboard</h1><p class="mut">' + (G.session ? 'Akun Pesaner Anda terdeteksi. Masukkan password untuk membuka dashboard.' : 'Gunakan akun Pesaner Anda.') + '</p><form id="f-login" class="dform"><label>Username atau email<input id="l-u" required autocomplete="username" value="' + esc(pu.username || '') + '"></label><label>Password<input id="l-p" type="password" required autocomplete="current-password"></label><p class="derr" id="l-e" role="alert"></p><button class="btn" type="submit">Masuk</button></form><p class="mut">Belum punya akun? <a href="https://andu.my.id/pesaner">Daftar di Pesaner</a>.</p>');
  }

  /* ---------- kerangka ---------- */
  function head() {
    var p = D.profile, nav = [['reader', '/dashboard-pembaca/', 'Mode Pembaca']];
    if (p.can_write) nav.push(['writer', '/dashboard-penulis/', 'Mode Penulis']);
    if (p.role === 'superadmin') nav.push(['superadmin', '/dashboard-superadmin/', 'Mode Superadmin']);
    var av = p.avatar_url ? '<img class="dav" src="' + esc(p.avatar_url) + '" alt="">' : '<span class="dav" aria-hidden="true">' + esc((p.full_name || '?').charAt(0).toUpperCase()) + '</span>';
    return '<section class="panel dhead">' + av + '<div class="dwho"><h1>' + esc(p.full_name) + '</h1><span class="chip" style="--c:#1F64F2;--cl:#5b8cff;--cd:#0F2C7A">' + ROLE[p.role] + '</span> <span class="mut">@' + esc(p.username) + '</span></div><nav class="dsw" aria-label="Mode dashboard">' +
      nav.map(function (n) { return '<a class="btn sm ' + (n[0] === MODE ? '' : 'ghost') + '" href="' + B + n[1] + '">' + n[2] + '</a>'; }).join('') + '<a class="btn sm ghost" href="' + B + '/">Portal</a><button class="btn sm ghost" data-act="logout">Keluar</button></nav></section>';
  }
  function stats() {
    var s = [];
    if (MODE === 'reader') s = [['Tersimpan', D.bookmarks.length], ['Disukai', D.likes.length], ['Komentar', D.comments.length]];
    else if (MODE === 'writer') { var w = D.stats; s = [['Total Artikel', w.total], ['Terbit', w.published], ['Menunggu Review', w.pending_review], ['Perlu Revisi', w.rejected], ['Draf', w.draft], ['Total Pembaca', w.views], ['Total Apresiasi', w.likes]]; }
    else { var c = D.counts; s = [['Pengguna', c.users], ['Penulis', c.writers], ['Antrean Penulis', c.pending_writers], ['Artikel', c.articles], ['Komentar', c.comments], ['Total Views', c.total_views]]; }
    return '<div class="dstats">' + s.map(function (x) { return '<div class="dstat"><b>' + esc(x[1]) + '</b><span>' + x[0] + '</span></div>'; }).join('') + '</div>';
  }
  function render(tab) {
    var T = TABS[MODE]; tab = tab || T[0][0]; CUR = tab;
    R.innerHTML = head() + stats() + '<div class="tabs" id="dt" role="tablist">' + T.map(function (t) { return '<button class="btn sm ' + (t[0] === tab ? '' : 'ghost') + '" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><section class="panel" id="dp"></section>';
    VIEWS[tab]($('#dp'));
  }
  function artRow(a, extra, nb) {
    var pub = nb || a.status === 'published';
    return '<div class="drow"><div class="dmain">' + (pub ? '<a href="' + B + '/#read=g-' + esc(a.article_id) + '">' + esc(a.title) + '</a>' : '<strong>' + esc(a.title) + '</strong>') +
      '<div class="mut">' + esc(a.category) + ' · ' + esc(a.author_name || '') + ' · ' + fmt(a.published_at || a.updated_at) + (a.is_featured ? ' · ⭐ Headline' : '') + '</div>' +
      (a.status === 'rejected' && a.reviewer_note ? '<div class="dnote">📝 Catatan redaksi: ' + esc(a.reviewer_note) + '</div>' : '') + '</div>' + (nb ? '' : badge(a.status)) + '<div class="dact">' + (extra || '') + '</div></div>';
  }

  /* ---------- editor ---------- */
  function mountEditor(c, a) {
    var sa = D.profile.role === 'superadmin';
    c.innerHTML = '<div class="ed"><h3>' + (a ? 'Sunting artikel' : 'Tulis artikel baru') + '</h3><label>Judul<input id="e-title" maxlength="150"></label><div class="two"><label>Kategori<select id="e-cat">' +
      C.CATEGORIES.map(function (k) { return '<option value="' + esc(k.gas) + '">' + esc(k.id) + '</option>'; }).join('') + '</select></label><label>Tag (pisahkan koma)<input id="e-tags"></label></div>' +
      '<label>Gambar sampul (URL https://…)<input id="e-cover"></label><img id="e-prev" class="ecover" alt="Pratinjau sampul" hidden>' +
      '<label>Ringkasan (maks 300 karakter)<textarea id="e-ex" maxlength="300" rows="2"></textarea></label>' +
      '<div class="tb" role="toolbar" aria-label="Format"><button type="button" data-cmd="b"><b>B</b></button><button type="button" data-cmd="i"><i>I</i></button><button type="button" data-cmd="h">H2</button><button type="button" data-cmd="q">❝</button><button type="button" data-cmd="ul">• Daftar</button><button type="button" data-cmd="a">🔗</button><button type="button" data-cmd="img">🖼️</button><button type="button" data-act="epv">👁️ Pratinjau</button></div>' +
      '<div id="e-body" class="ebody" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Isi artikel"></div><div id="e-pv" class="ebody postbody" hidden></div>' +
      (sa ? '<div class="two"><label>Byline redaksi (opsional)<input id="e-by" maxlength="80" placeholder="Redaksi ANDU NEWS"></label><label class="chk"><input type="checkbox" id="e-ft"> Jadikan Headline Utama</label></div>' : '') +
      '<div class="eact">' + btn('save', 'draft', '💾 Simpan Draf') + btn('save', 'submit', '📨 Kirim ke Redaksi', '') + (sa ? btn('save', 'publish', '🚀 Terbitkan Sekarang', 'amber') : '') + (a ? btn('ecancel', '', 'Batal') : '') + '</div></div>';
    if (a) {
      $('#e-title').value = a.title; $('#e-cat').value = a.category; $('#e-tags').value = (a.tags || []).join(', '); $('#e-cover').value = a.cover_image && a.cover_image.indexOf('data:') !== 0 ? a.cover_image : ''; $('#e-ex').value = a.excerpt || '';
      $('#e-body').innerHTML = sanitize(a.content_html); if (sa && $('#e-ft')) $('#e-ft').checked = !!a.is_featured; if ($('#e-by')) $('#e-by').value = '';
      coverPrev();
    }
    $('#e-prev').onerror = function () { this.hidden = true; };
  }
  function coverPrev() { var im = $('#e-prev'), v = ($('#e-cover') || {}).value; if (!im) return; v = (v || '').trim(); if (/^https?:\/\//i.test(v)) { im.src = v; im.hidden = false; } else im.hidden = true; }

  /* ---------- pencarian & paginasi (sisi klien) ---------- */
  var Q = { users: '', ar: '', cm: '' }, PG = { users: 1, ar: 1, cm: 1 }, SZ = 10, ST_T = null;
  function searchBox(k, ph) { return '<input type="search" class="dsearch" data-k="' + k + '" placeholder="' + ph + '" aria-label="' + ph + '" value="' + esc(Q[k]) + '">'; }
  function match(q, parts) { return !q || parts.join(' ').toLowerCase().indexOf(q.trim().toLowerCase()) >= 0; }
  function pages(list) { return Math.max(Math.ceil(list.length / SZ), 1); }
  function slice(k, list) { PG[k] = Math.min(PG[k], pages(list)); return list.slice((PG[k] - 1) * SZ, PG[k] * SZ); }
  function pager(k, total) {
    var n = Math.max(Math.ceil(total / SZ), 1), p = Math.min(PG[k], n); if (n < 2) return '<p class="mut dcount">' + total + ' data</p>';
    var pb = function (to, label, dis, cur, aria) { return '<button class="btn sm ' + (cur ? '' : 'ghost') + '" data-act="pg" data-k="' + k + '" data-p="' + to + '"' + (dis ? ' disabled' : '') + (cur ? ' aria-current="page"' : '') + (aria ? ' aria-label="' + aria + '"' : '') + '>' + label + '</button>'; };
    var h = pb(p - 1, '‹', p < 2, 0, 'Halaman sebelumnya'), last = 0;
    for (var i = 1; i <= n; i++) if (i === 1 || i === n || Math.abs(i - p) <= 1) { if (i - last > 1) h += '<span class="mut">…</span>'; h += pb(i, i, 0, i === p); last = i; }
    return '<nav class="dpager" aria-label="Paginasi">' + h + pb(p + 1, '›', p >= n, 0, 'Halaman berikutnya') + '<span class="mut">' + total + ' data</span></nav>';
  }
  function drawUsers() {
    var el = $('#l-users'); if (!el) return;
    var l = D.users.filter(function (u) { return match(Q.users, [u.full_name, u.username, u.email, u.role, WST[u.writer_status]]); });
    el.innerHTML = (slice('users', l).map(function (u) {
      var me = u.user_id === D.profile.user_id;
      return '<div class="drow"><div class="dmain"><strong>' + esc(u.full_name) + '</strong> <span class="mut">@' + esc(u.username) + ' · ' + (WST[u.writer_status] || '') + '</span></div><div class="dact"><select aria-label="Role ' + esc(u.username) + '"' + (me ? ' disabled' : '') + '>' + ['reader', 'writer', 'superadmin'].map(function (r) { return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' + (me ? '' : btn('role', u.user_id, 'Simpan')) + '</div></div>';
    }).join('') || empty('Tidak ada pengguna yang cocok.')) + pager('users', l.length);
  }
  function drawArt() {
    var el = $('#l-ar'); if (!el) return;
    var l = D.articles.filter(function (a) { return (!AF || a.status === AF) && match(Q.ar, [a.title, a.author_name, a.category, (a.tags || []).join(' ')]); });
    el.innerHTML = (slice('ar', l).map(function (a) {
      return artRow(a, btn('view', a.article_id, '👁️') + (a.status !== 'published' ? btn('pub', a.article_id, 'Terbitkan', '') : '') + (a.status === 'pending_review' || a.status === 'published' ? btn('rej', a.article_id, 'Tolak', 'ghost') : '') + (a.status === 'published' ? btn('ft', a.article_id, a.is_featured ? '⭐' : '☆', 'ghost', ' data-d="' + (a.is_featured ? 1 : 0) + '" aria-label="Headline"') : '') + btn('edit', a.article_id, '✏️') + btn('del', a.article_id, '🗑️'));
    }).join('') || empty('Tidak ada artikel yang cocok.')) + pager('ar', l.length);
  }
  function drawCm() {
    var el = $('#l-cm'); if (!el) return;
    var l = D.recent_comments.filter(function (m) { return match(Q.cm, [m.user_name, m.comment_text, m.article_title, m.status]); });
    el.innerHTML = (slice('cm', l).map(function (m) {
      return '<div class="drow"><div class="dmain"><strong>' + esc(m.user_name) + '</strong> <span class="mut">pada ' + esc(m.article_title) + ' · ' + fmt(m.created_at) + '</span><div>' + esc(m.comment_text) + '</div></div>' + (m.status === 'hidden' ? '<span class="st st-d">Disembunyikan</span>' : '') + '<div class="dact">' + (m.status === 'hidden' ? btn('cmod', m.comment_id, 'Tampilkan', '', ' data-m="restore"') : btn('cmod', m.comment_id, 'Sembunyikan', 'ghost', ' data-m="hide"')) + btn('cmod', m.comment_id, '🗑️', 'ghost', ' data-m="delete"') + '</div></div>';
    }).join('') || empty('Tidak ada komentar yang cocok.')) + pager('cm', l.length);
  }
  var REDRAW = { users: drawUsers, ar: drawArt, cm: drawCm };

  /* ---------- tab ---------- */
  var VIEWS = {
    bm: function (c) { c.innerHTML = D.bookmarks.length ? '<div class="list">' + D.bookmarks.map(function (a) { return artRow(a, btn('unint', a.article_id, 'Hapus', 'ghost', ' data-t="bookmark"'), 1); }).join('') + '</div>' : empty('Belum ada artikel tersimpan. Tekan 🔖 saat membaca.'); },
    lk: function (c) { c.innerHTML = D.likes.length ? '<div class="list">' + D.likes.map(function (a) { return artRow(a, btn('unint', a.article_id, 'Batal suka', 'ghost', ' data-t="like"'), 1); }).join('') + '</div>' : empty('Belum ada artikel yang Anda sukai.'); },
    cm: function (c) {
      c.innerHTML = D.comments.length ? '<div class="list">' + D.comments.map(function (m) { return '<div class="drow"><div class="dmain"><strong>' + esc(m.article_title) + '</strong><div>' + esc(m.comment_text) + '</div><div class="mut">' + fmt(m.created_at) + (m.status === 'hidden' ? ' · disembunyikan redaksi' : '') + '</div></div><div class="dact">' + btn('delc', m.comment_id, 'Hapus') + '</div></div>'; }).join('') + '</div>' : empty('Belum ada komentar.');
    },
    wr: function (c) {
      var wa = D.writer_application, p = D.profile;
      if (p.role !== 'reader') { c.innerHTML = '<p>Anda sudah berperan sebagai <b>' + ROLE[p.role] + '</b>.</p><a class="btn" href="' + B + '/dashboard-penulis/">Buka Dashboard Penulis</a>'; return; }
      var h = '<h3>Ajukan diri sebagai Penulis / Wartawan</h3><p>Status: <span class="st ' + (wa.status === 'pending' ? 'st-p' : wa.status === 'rejected' ? 'st-r' : 'st-d') + '">' + (WST[wa.status] || wa.status) + '</span></p>';
      if (wa.status === 'pending') h += '<div class="dbio">' + esc(wa.bio) + '</div><p class="mut">Redaksi akan meninjau pengajuan Anda. Muat ulang halaman ini untuk melihat status terbaru.</p>';
      else h += (wa.status === 'rejected' ? '<p class="dnote">Pengajuan sebelumnya ditolak. Anda dapat mengajukan ulang dengan portofolio yang diperbarui.</p>' : '') + '<form id="f-apply" class="dform"><label>Bidang minat<input id="w-int" maxlength="150" placeholder="mis. Teknologi, berita daerah"></label><label>Bio singkat / portofolio (min. 20 karakter)<textarea id="w-bio" rows="4" maxlength="800" required></textarea></label><label>Contoh tautan tulisan (opsional)<input id="w-lnk" type="url" placeholder="https://"></label><button class="btn" type="submit">Kirim Pengajuan</button></form>';
      c.innerHTML = h;
    },
    ed: function (c) { mountEditor(c, EDIT); },
    ls: function (c) {
      c.innerHTML = D.articles.length ? '<div class="list">' + D.articles.map(function (a) { return artRow(a, btn('edit', a.article_id, '✏️ Sunting')); }).join('') + '</div>' : empty('Belum ada artikel. Mulai menulis di Studio Editor.');
    },
    ap: function (c) {
      var pw = D.pending_writers;
      c.innerHTML = '<h3>Antrean penulis (' + pw.length + ')</h3>' + (pw.length ? pw.map(function (u) { return '<div class="drow"><div class="dmain"><strong>' + esc(u.full_name) + '</strong> <span class="mut">@' + esc(u.username) + ' · ' + fmt(u.applied_at) + '</span><div class="dbio">' + esc(u.writer_bio) + '</div></div><div class="dact">' + btn('appr', u.user_id, 'Setujui', '', ' data-d="approve"') + btn('appr', u.user_id, 'Tolak', 'ghost', ' data-d="reject"') + '</div></div>'; }).join('') : empty('Tidak ada pengajuan baru.')) +
        '<h3>Semua pengguna</h3>' + searchBox('users', 'Cari nama, username, email, atau role…') + '<div id="l-users"></div>';
      drawUsers();
    },
    ar: function (c) {
      c.innerHTML = '<h3>Semua artikel</h3><div class="dtools"><label class="dfilter">Status <select id="af"><option value="">Semua</option>' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (AF === k ? ' selected' : '') + '>' + ST[k][0] + '</option>'; }).join('') + '</select></label>' + searchBox('ar', 'Cari judul, penulis, kategori, atau tag…') + '</div><div id="l-ar"></div>';
      drawArt();
    },
    an: function (c) {
      var an = D.analytics, sb = an.status_breakdown;
      c.innerHTML = '<div class="two"><div><h3>Distribusi kategori</h3><canvas id="ch1" height="220" aria-label="Grafik kategori"></canvas></div><div><h3>Artikel terpopuler</h3><canvas id="ch2" height="220" aria-label="Grafik artikel populer"></canvas></div></div><p class="mut">Terbit ' + sb.published + ' · Menunggu ' + sb.pending_review + ' · Draf ' + sb.draft + ' · Revisi ' + sb.rejected + '</p><h3>Komentar terbaru</h3>' + searchBox('cm', 'Cari pengguna, isi komentar, atau judul artikel…') + '<div id="l-cm"></div>';
      drawCm(); charts();
    }
  };
  function charts() {
    var an = D.analytics, cols = ['#1F64F2', '#FFB800', '#0D9488', '#E11D48', '#6D28D9', '#D97706', '#2563EB', '#16A34A'];
    function fallback() { ['ch1', 'ch2'].forEach(function (id) { var el = document.getElementById(id); if (!el) return; var d = id === 'ch1' ? an.by_category.map(function (x) { return [x.category, x.count]; }) : an.top_articles.map(function (x) { return [x.title, x.views_count]; }); var max = Math.max.apply(null, d.map(function (x) { return x[1]; }).concat([1])); var div = document.createElement('div'); div.className = 'bars'; div.innerHTML = d.map(function (x) { return '<div class="bar"><span>' + esc(x[0]) + '</span><i style="width:' + Math.round(x[1] / max * 100) + '%"></i><b>' + x[1] + '</b></div>'; }).join('') || empty('Belum ada data.'); el.replaceWith(div); }); }
    var go = function () {
      var a = document.getElementById('ch1'), b = document.getElementById('ch2'); if (!a || !b) return;
      new window.Chart(a, { type: 'doughnut', data: { labels: an.by_category.map(function (x) { return x.category; }), datasets: [{ data: an.by_category.map(function (x) { return x.count; }), backgroundColor: cols }] } });
      new window.Chart(b, { type: 'bar', data: { labels: an.top_articles.map(function (x) { return x.title.slice(0, 24); }), datasets: [{ label: 'Views', data: an.top_articles.map(function (x) { return x.views_count; }), backgroundColor: '#1F64F2' }, { label: 'Likes', data: an.top_articles.map(function (x) { return x.likes_count; }), backgroundColor: '#FFB800' }] }, options: { indexAxis: 'y' } });
    };
    if (window.Chart) return go();
    var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'; s.onload = go; s.onerror = fallback; document.head.appendChild(s);
  }

  /* ---------- aksi ---------- */
  var MOD = async function (op, id, extra) { try { await call('admin_moderate_article', Object.assign({ op: op, article_id: id }, extra || {}), true); toast('Berhasil'); await reload(CUR); } catch (e) { toast(e.message, 1); } };
  var CMDS = { b: ['bold'], i: ['italic'], h: ['formatBlock', 'h2'], q: ['formatBlock', 'blockquote'], ul: ['insertUnorderedList'], a: ['createLink'], img: ['insertImage'] };
  var ACT = {
    pg: function (el) { var k = el.dataset.k; PG[k] = Math.max(+el.dataset.p, 1); REDRAW[k](); var f = $('#l-' + (k === 'ar' ? 'ar' : k === 'cm' ? 'cm' : 'users')); if (f) f.scrollIntoView({ block: 'nearest' }); },
    logout: function () { G.logout(); location.reload(); },
    cmd: function (el) {
      var c = CMDS[el.dataset.cmd], v = c[1] || null; $('#e-body').focus();
      if (c[0] === 'createLink' || c[0] === 'insertImage') { v = prompt(c[0] === 'createLink' ? 'URL tautan (https://…)' : 'URL gambar (https://…)'); if (!v || !/^https?:\/\//i.test(v.trim())) return; v = v.trim(); }
      document.execCommand(c[0], false, v);
    },
    epv: function () { var b = $('#e-body'), p = $('#e-pv'); if (p.hidden) { p.innerHTML = '<h2>' + esc($('#e-title').value) + '</h2>' + sanitize(b.innerHTML); p.hidden = false; b.hidden = true; } else { p.hidden = true; b.hidden = false; } },
    ecancel: function () { EDIT = null; render(CUR); },
    save: async function (el) {
      var d = { mode: el.dataset.id, title: $('#e-title').value, content_html: sanitize($('#e-body').innerHTML), category: $('#e-cat').value, tags: $('#e-tags').value, excerpt: $('#e-ex').value, cover_image: $('#e-cover').value.trim() };
      if (EDIT) d.article_id = EDIT.article_id;
      if ($('#e-by')) { d.byline = $('#e-by').value; d.is_featured = $('#e-ft').checked ? 'true' : 'false'; }
      el.disabled = true;
      try { await call('save_article', d, true); toast(d.mode === 'publish' ? 'Artikel diterbitkan' : d.mode === 'submit' ? 'Terkirim ke redaksi' : 'Draf tersimpan'); EDIT = null; await reload(MODE === 'superadmin' ? 'ar' : 'ls'); }
      catch (e) { toast(e.message, 1); el.disabled = false; }
    },
    edit: async function (el) { try { var j = await call('get_article_detail', { article_id: el.dataset.id, no_count: 'true' }); EDIT = j.article; render('ed'); scrollTo(0, 0); } catch (e) { toast(e.message, 1); } },
    unint: async function (el) { try { await call('toggle_interaction', { article_id: el.dataset.id, type: el.dataset.t }, true); await reload(CUR); } catch (e) { toast(e.message, 1); } },
    delc: async function (el) { if (!confirm('Hapus komentar ini?')) return; try { await call('delete_comment', { comment_id: el.dataset.id }, true); await reload(CUR); } catch (e) { toast(e.message, 1); } },
    cmod: async function (el) { if (el.dataset.m === 'delete' && !confirm('Hapus komentar permanen?')) return; try { await call('delete_comment', { comment_id: el.dataset.id, mode: el.dataset.m }, true); await reload(CUR); } catch (e) { toast(e.message, 1); } },
    appr: async function (el) { try { await call('admin_approve_writer', { user_id: el.dataset.id, decision: el.dataset.d }, true); toast(el.dataset.d === 'approve' ? 'Penulis disetujui' : 'Pengajuan ditolak'); await reload('ap'); } catch (e) { toast(e.message, 1); } },
    role: async function (el) { var v = el.closest('.drow').querySelector('select').value; try { await call('admin_set_role', { user_id: el.dataset.id, role: v }, true); toast('Role diperbarui'); await reload('ap'); } catch (e) { toast(e.message, 1); } },
    pub: function (el) { return MOD('publish', el.dataset.id); },
    rej: function (el) { var n = prompt('Catatan revisi untuk penulis:'); if (n && n.trim()) return MOD('reject', el.dataset.id, { note: n.trim() }); },
    del: function (el) { if (confirm('Hapus artikel beserta komentar dan interaksinya?')) return MOD('delete', el.dataset.id); },
    ft: function (el) { return MOD(el.dataset.d === '1' ? 'unfeature' : 'feature', el.dataset.id); },
    view: async function (el) {
      try {
        var a = (await call('get_article_detail', { article_id: el.dataset.id, no_count: 'true' })).article;
        modal('<h2>' + esc(a.title) + '</h2><p class="mut">' + esc(a.category) + ' · ' + esc(a.author_name) + ' · ' + badge(a.status) + '</p>' + (a.reviewer_note ? '<p class="dnote">📝 ' + esc(a.reviewer_note) + '</p>' : '') + '<div class="postbody">' + sanitize(a.content_html) + '</div><div class="eact">' + (a.status !== 'published' ? btn('pub', a.article_id, 'Terbitkan', '') : '') + btn('rej', a.article_id, 'Tolak dengan catatan') + '</div>', function (t) { ACT[t.dataset.act](t); });
      } catch (e) { toast(e.message, 1); }
    }
  };

  R.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tab],[data-act],[data-cmd]'); if (!t) return;
    if (t.dataset.tab) { EDIT = t.dataset.tab === 'ed' ? EDIT : null; return render(t.dataset.tab); }
    if (t.dataset.cmd) return ACT.cmd(t);
    var f = ACT[t.dataset.act]; if (f) f(t);
  });
  R.addEventListener('mousedown', function (e) { if (e.target.closest('.tb [data-cmd]')) e.preventDefault(); });
  R.addEventListener('input', function (e) {
    if (e.target.id === 'e-cover') coverPrev();
    if (e.target.classList.contains('dsearch')) { var k = e.target.dataset.k, v = e.target.value; clearTimeout(ST_T); ST_T = setTimeout(function () { Q[k] = v; PG[k] = 1; REDRAW[k](); }, 200); }
  });
  R.addEventListener('change', function (e) { if (e.target.id === 'af') { AF = e.target.value; PG.ar = 1; drawArt(); } });
  R.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'f-login') G.login($('#l-u').value.trim(), $('#l-p').value).then(function () { location.reload(); }).catch(function (x) { $('#l-e').textContent = x.message || 'Login gagal'; });
    if (e.target.id === 'f-apply') call('apply_writer', { interest: $('#w-int').value, writer_bio: $('#w-bio').value, sample_link: $('#w-lnk').value }, true).then(function () { toast('Pengajuan terkirim'); return reload('wr'); }).catch(function (x) { toast(x.message, 1); });
  });
  boot();
})();
