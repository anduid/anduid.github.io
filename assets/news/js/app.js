/* ANDU NEWS – mesin portal: sinkronisasi (search.json + GAS + AnduDB), kartu, pencarian, misi, kalender, reader, TTS, XP, tur, ekspor. */
(function () {
  'use strict';
  const C = window.ANDU_CONFIG, DB = window.anduDB, GAS = window.GAS, M3 = window.Monster3D, view = document.body.dataset.view;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'id';
  const BASE = C.BASE || '';
  const day = d => { d = d ? new Date(d) : new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n ---------- */
  const T = {
    id: { theme: '🌓 Tema', search_ph: 'Cari berita, tag, kanal…', write: '+ Tulis Berita', login: 'Masuk via Pesaner', n_home: 'Beranda', n_explore: 'Jelajah', n_cal: 'Kalender', n_mon: 'Monster', n_exp: 'Ekspor', popular: '🔥 Terpopuler', mission: '🎯 Misi Harian', mini_cal: '📅 Kalender Berita', buddy: '🐾 Monster & Level', spotlight: '✨ Sorotan & Topik Hangat', tab_all: 'Semua', tab_new: 'Terbaru', tab_pop: 'Terpopuler', tab_unread: 'Belum Dibaca', all: 'Semua', min: 'mnt baca', cal_title: '📅 Kalender Literasi', day_news: 'Berita pada tanggal ini', reminders: '⏰ Pengingat Baca', rem_ph: 'Contoh: baca berita ekonomi', add: 'Tambah', mon_title: '🐾 Studio Monster', choose: 'Pilih karakter', mon_name: 'Nama monster', hue: 'Warna (hue)', exp_title: '📤 Pusat Ekspor Digest', exp_desc: 'Susun ringkasan berita yang sudah kamu baca atau simpan, lalu bagikan.', scope: 'Isi digest', listen: 'Dengar', bookmark: 'Simpan', claim_hint: 'Gulir sampai 95% untuk klaim +25 XP', claim_done: 'XP berhasil diklaim! 🎉', claim_have: 'Sudah dibaca ✅', notes: '📝 Catatan pribadi', notes_ph: 'Tulis catatan untuk dirimu sendiri…', comments: '💬 Komentar', c_ph: 'Tulis komentar…', send: 'Kirim', read_next: 'Baca Selanjutnya', no_result: 'Tidak ada berita yang cocok.', clear: 'Hapus', you: 'Tulisanmu', pending: 'Menunggu review', m_read: 'Baca berita', m_comment: 'Komentar', m_claim: 'Klaim bonus +40 XP', m_done: 'Bonus sudah diklaim', level: 'Level', streak: 'Streak', xp: 'XP', read_c: 'Dibaca', next: 'Lanjut', skip: 'Lewati', done: 'Mulai!', close: 'Tutup', cancel: 'Batal', title: 'Judul', cat: 'Kanal', body: 'Isi berita (pisahkan paragraf dengan baris kosong)', tags: 'Tag (pisahkan koma)', save: 'Simpan', loading: 'Memuat…', pass: 'Password', user: 'Username atau email', register: 'Daftar', continue_as: 'Lanjutkan sebagai', name: 'Nama lengkap', as_writer: 'Daftar juga sebagai penulis/wartawan', writer_bio: 'Bidang liputan / portofolio (min. 20 karakter)', logout: 'Keluar', offline_gas: 'Mode offline: isi gas_webapp_url di _config.yml agar masuk & sinkron ke Google Sheets aktif.', pet: 'Elus', tour1t: 'Halo, aku {n}!', tour1: 'Aku pemandu monstermu. Setiap berita yang kamu baca tuntas memberi +25 XP, dan XP membuatku naik level.', tour2t: 'Baca, dengar, klaim', tour2: 'Gunakan A-/A/A+ untuk ukuran huruf, tombol Dengar untuk membacakan artikel, dan gulir sampai 95% untuk klaim +25 XP otomatis.', tour3t: 'Masuk & tulis berita', tour3: 'Masuk dengan akun Pesaner agar bisa berkomentar dan mengirim berita komunitas lewat + Tulis Berita.', tour_replay: 'Ulangi tur', saved_local: 'Tersimpan di perangkat ini.', sent_red: 'Dikirim ke redaksi, menunggu review.', need_writer: 'Tersimpan di perangkat. Ajukan jadi penulis agar bisa tayang di portal.', need_login: 'Masuk dengan password untuk menyimpan ke redaksi.', verified: 'terverifikasi', soft: '1-klik (hanya baca, suka, bookmark)', role: 'Peran', due: 'Pengingat:', del: 'Hapus', from_url: 'sumber' },
    en: { theme: '🌓 Theme', search_ph: 'Search news, tags, channels…', write: '+ Write News', login: 'Sign in via Pesaner', n_home: 'Home', n_explore: 'Explore', n_cal: 'Calendar', n_mon: 'Monster', n_exp: 'Export', popular: '🔥 Most Read', mission: '🎯 Daily Mission', mini_cal: '📅 News Calendar', buddy: '🐾 Monster & Level', spotlight: '✨ Spotlight & Hot Topics', tab_all: 'All', tab_new: 'Latest', tab_pop: 'Popular', tab_unread: 'Unread', all: 'All', min: 'min read', cal_title: '📅 Literacy Calendar', day_news: 'News on this date', reminders: '⏰ Reading Reminders', rem_ph: 'e.g. read the economy news', add: 'Add', mon_title: '🐾 Monster Studio', choose: 'Choose a character', mon_name: 'Monster name', hue: 'Colour (hue)', exp_title: '📤 Digest Export Centre', exp_desc: 'Compile a digest of the news you read or saved, then share it.', scope: 'Digest contents', listen: 'Listen', bookmark: 'Save', claim_hint: 'Scroll to 95% to claim +25 XP', claim_done: 'XP claimed! 🎉', claim_have: 'Already read ✅', notes: '📝 Personal notes', notes_ph: 'Write a note to yourself…', comments: '💬 Comments', c_ph: 'Write a comment…', send: 'Send', read_next: 'Read Next', no_result: 'No matching news.', clear: 'Clear', you: 'Your story', pending: 'Pending review', m_read: 'Read articles', m_comment: 'Comments', m_claim: 'Claim +40 XP bonus', m_done: 'Bonus claimed', level: 'Level', streak: 'Streak', xp: 'XP', read_c: 'Read', next: 'Next', skip: 'Skip', done: 'Start!', close: 'Close', cancel: 'Cancel', title: 'Title', cat: 'Channel', body: 'Story (separate paragraphs with a blank line)', tags: 'Tags (comma separated)', save: 'Save', loading: 'Loading…', pass: 'Password', user: 'Username or email', register: 'Register', continue_as: 'Continue as', name: 'Full name', as_writer: 'Also register as a writer/reporter', writer_bio: 'Beat / portfolio (min. 20 characters)', logout: 'Sign out', offline_gas: 'Offline mode: set gas_webapp_url in _config.yml to enable sign-in and Google Sheets sync.', pet: 'Pet', tour1t: "Hi, I'm {n}!", tour1: "I'm your monster guide. Every article you finish earns +25 XP, and XP helps me level up.", tour2t: 'Read, listen, claim', tour2: 'Use A-/A/A+ for text size, the Listen button to read aloud, and scroll to 95% to auto-claim +25 XP.', tour3t: 'Sign in & write news', tour3: 'Sign in with your Pesaner account to comment and send community stories via + Write News.', tour_replay: 'Replay tour', saved_local: 'Saved on this device.', sent_red: 'Sent to the editors, pending review.', need_writer: 'Saved on device. Apply as a writer to get published on the portal.', need_login: 'Sign in with your password to send to the editors.', verified: 'verified', soft: '1-click (read, like, bookmark only)', role: 'Role', due: 'Reminder:', del: 'Delete', from_url: 'source' }
  };
  const t = k => (T[lang()][k] != null ? T[lang()][k] : k);
  function applyI18n() { $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); }); $$('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); }); const b = $('#b-lang'); if (b) b.textContent = lang().toUpperCase(); renderUtilDate(); }

  /* ---------- util ---------- */
  const catInfo = s => C.CATEGORIES.find(c => c.slug === s) || { slug: s || 'lain', id: 'Lainnya', en: 'Other', icon: '📰' };
  const ttl = a => (lang() === 'en' ? (a.title_en || a.title) : a.title) || '';
  const exc = a => { const l = (lang() === 'en' ? a.lang_en : a.lang_id) || a.lang_id || {}; return l.excerpt || ''; };
  const mins = a => (lang() === 'en' ? a.reading_time_en : a.reading_time) || 1;
  const fmtDate = d => { try { return new Date(d).toLocaleDateString(lang() === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const abs = u => { try { return new URL(u, location.href).href; } catch (e) { return u; } };
  function toast(msg, ms) { const h = $('#ts'); if (!h) return; const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = msg; h.appendChild(d); setTimeout(() => d.remove(), ms || 3200); }
  function sanitize(html) {
    const doc = new DOMParser().parseFromString('<body>' + String(html || '') + '</body>', 'text/html');
    $$('script,style,iframe,object,embed,form,link,meta,base', doc).forEach(n => n.remove());
    $$('*', doc.body).forEach(n => { [].slice.call(n.attributes).forEach(at => { const nm = at.name.toLowerCase(); if (nm.indexOf('on') === 0 || ((nm === 'href' || nm === 'src') && /^\s*(javascript|data:text|vbscript)/i.test(at.value) && !/^data:image\//i.test(at.value))) n.removeAttribute(at.name); }); if (n.tagName === 'A') { n.setAttribute('rel', 'noopener noreferrer'); n.setAttribute('target', '_blank'); } });
    return doc.body.innerHTML;
  }
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function download(name, mime, data) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

  /* ---------- state & profil ---------- */
  const S = { articles: [], byId: {}, q: '', cat: '', tab: 'all', page: 1, day: '', bm: new Set(), comments: [], monsters: [] };
  let P = null;
  const level = () => Math.floor(P.xp / C.XP_PER_LEVEL) + 1;
  async function loadProfile() {
    P = (await DB.get('progress', 'profile')) || { key: 'profile', xp: 0, streak: 0, lastDay: '', monster: 'piko', hue: 0, name: 'Piko', onboarded: false, read: {}, daily: {} };
    if (!P.daily || P.daily.date !== day()) P.daily = { date: day(), read: [], comment: 0, claimed: false };
    S.bm = new Set((await DB.getAll('bookmarks')).map(b => b.article));
  }
  const saveProfile = () => DB.put('progress', P);

  /* ---------- monster mounting ---------- */
  function mountMon(el, o) { if (!el) return null; const m = M3.mount(el, Object.assign({ key: P.monster, hue: P.hue }, o || {})); S.monsters.push(m); return m; }
  function refreshMonsters() { S.monsters = S.monsters.filter(m => m.svg && m.svg.isConnected); S.monsters.forEach(m => m.set(P.monster, P.hue)); }
  function rewardFx() { S.monsters.filter(m => m.svg && m.svg.isConnected && m.el.id !== 'pf-mon').forEach(m => m.reward()); }

  /* ---------- gamifikasi ---------- */
  function chime() { try { const A = window.AudioContext || window.webkitAudioContext, c = new A(); [660, 880, 1175].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, c.currentTime + i * 0.1); g.gain.exponentialRampToValueAtTime(0.12, c.currentTime + i * 0.1 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * 0.1 + 0.35); o.connect(g); g.connect(c.destination); o.start(c.currentTime + i * 0.1); o.stop(c.currentTime + i * 0.1 + 0.4); }); setTimeout(() => c.close && c.close(), 900); } catch (e) {} }
  function touchStreak() { const today = day(); if (P.lastDay === today) return; const y = new Date(); y.setDate(y.getDate() - 1); P.streak = P.lastDay === day(y) ? P.streak + 1 : 1; P.lastDay = today; }
  async function addXP(n) { const before = level(); P.xp += n; touchStreak(); if (level() > before) { M3.confetti(); toast('🎉 Level <b>' + level() + '</b>!', 4000); } await saveProfile(); renderStatus(); }
  async function award(a) {
    if (!a || P.read[a.id]) return { gained: 0 };
    P.read[a.id] = Date.now(); if (P.daily.read.indexOf(a.id) < 0) P.daily.read.push(a.id);
    await addXP(C.XP_READ); rewardFx(); chime(); toast('+<b>' + C.XP_READ + ' XP</b> ⭐'); renderMission(); refreshCards();
    return { gained: C.XP_READ };
  }
  const mval = k => k === 'read' ? P.daily.read.length : P.daily.comment;
  function renderMission() {
    const el = $('#mission'); if (!el) return;
    const all = C.MISSIONS.every(m => mval(m.key) >= m.target);
    el.innerHTML = C.MISSIONS.map(m => { const v = Math.min(mval(m.key), m.target); return '<div class="mis-row"><div style="display:flex;justify-content:space-between;font-weight:600"><span>' + esc(m[lang()]) + '</span><span>' + v + '/' + m.target + '</span></div><div class="bar"><i style="width:' + (v / m.target * 100) + '%"></i></div></div>'; }).join('') +
      '<button class="btn amber sm" id="m-claim" type="button" ' + (all && !P.daily.claimed ? '' : 'disabled style="opacity:.5;cursor:default"') + '>' + t(P.daily.claimed ? 'm_done' : 'm_claim') + '</button>';
    $('#m-claim').onclick = async () => { if (!all || P.daily.claimed) return; P.daily.claimed = true; await addXP(C.XP_BONUS); M3.confetti(); rewardFx(); chime(); renderMission(); };
  }
  function renderStatus() {
    const lv = $('#pf-lv'); if (lv) { lv.textContent = 'Lv ' + level(); $('#pf-xp').style.width = (P.xp % C.XP_PER_LEVEL) + '%'; $('#pf-streak').textContent = '🔥 ' + P.streak; }
    const b = $('#buddy'); if (b && view === 'home') { if (!b.firstChild) { b.innerHTML = '<div id="buddy-m" style="width:120px;height:126px"></div><b id="buddy-n"></b><div class="bar" style="width:100%"><i id="buddy-bar"></i></div><small id="buddy-t" class="mut"></small>'; mountMon($('#buddy-m'), { auto: true }); $('#buddy-m').onclick = () => S.monsters.find(m => m.el.id === 'buddy-m').pet(); } $('#buddy-n').textContent = P.name; $('#buddy-bar').style.width = (P.xp % C.XP_PER_LEVEL) + '%'; $('#buddy-t').textContent = t('level') + ' ' + level() + ' · ' + P.xp + ' XP · 🔥 ' + P.streak; }
    const st = $('#mon-stats'); if (st) st.innerHTML = [[t('level'), level()], [t('xp'), P.xp], [t('streak'), '🔥 ' + P.streak], [t('read_c'), Object.keys(P.read).length], ['🔖', S.bm.size], [t('m_comment'), P.daily.comment]].map(x => '<div><b>' + x[1] + '</b>' + x[0] + '</div>').join('');
  }

  /* ---------- artikel: sinkronisasi search.json + GAS + AnduDB ---------- */
  function setArticles(list) { const seen = {}; list.forEach(a => { seen[a.id] = a; }); S.byId = seen; S.articles = Object.keys(seen).map(k => seen[k]).sort((x, y) => String(y.date).localeCompare(String(x.date))); }
  async function loadArticles() {
    setArticles(await DB.getAll('articles')); const ev = () => document.dispatchEvent(new CustomEvent('andu:articles'));
    if (S.articles.length) ev();
    try {
      const r = await fetch(BASE + '/search.json', { cache: 'no-cache' }); const js = (await r.json()).map(a => Object.assign(a, { source: 'jekyll' }));
      const keep = new Set(js.map(a => a.id)); for (const a of await DB.getAll('articles')) if (a.source === 'jekyll' && !keep.has(a.id)) await DB.del('articles', a.id);
      await DB.putMany('articles', js);
    } catch (e) {}
    setArticles(await DB.getAll('articles')); ev();
    if (GAS.enabled) { try { const g = await GAS.fetchArticles(); const keep = new Set(g.map(a => a.id)); for (const a of await DB.getAll('articles')) if (a.source === 'gas' && !keep.has(a.id)) await DB.del('articles', a.id); await DB.putMany('articles', g); setArticles(await DB.getAll('articles')); ev(); } catch (e) {} }
  }

  /* ---------- kartu ---------- */
  const isRead = a => !!P.read[a.id];
  const linkOf = a => a.source === 'jekyll' && a.url ? 'href="' + esc(a.url) + '"' : 'href="#read=' + esc(a.id) + '" data-read="' + esc(a.id) + '"';
  function coverStyle(a) { return /^https?:\/\//i.test(a.image || '') && a.source !== 'jekyll' ? ' style="background-image:url(\'' + esc(a.image) + '\')"' : ''; }
  function card(a, i) {
    const c = catInfo(a.cat), cover = coverStyle(a);
    return '<a class="tcard rev' + (isRead(a) ? ' done' : '') + '" data-cat="' + esc(a.cat) + '" data-aid="' + esc(a.id) + '" ' + linkOf(a) + ' style="--dl:' + ((i || 0) * 0.05) + 's">' + (isRead(a) ? '' : '<span class="badge-xp">+' + C.XP_READ + ' XP</span>') +
      '<span class="art"' + cover + '>' + (cover ? '' : c.icon) + '</span><span class="chip">' + esc(c[lang()] || c.id) + '</span><b>' + esc(ttl(a)) + '</b><p>' + esc(exc(a)) + '</p><small><span>' + mins(a) + ' ' + t('min') + '</span><span>' + fmtDate(a.date) + '</span>' + (a.source === 'mine' ? '<span>✍️ ' + t(a.status === 'pending_review' ? 'pending' : 'you') + '</span>' : '') + '<span class="st">' + (isRead(a) ? '✅' : '') + (S.bm.has(a.id) ? '🔖' : '') + '</span></small></a>';
  }
  function refreshCards() { $$('.tcard[data-aid]').forEach(el => { const a = S.byId[el.dataset.aid]; if (!a) return; el.classList.toggle('done', isRead(a)); const st = $('.st', el); if (st) st.textContent = (isRead(a) ? '✅' : '') + (S.bm.has(a.id) ? '🔖' : ''); const bx = $('.badge-xp', el); if (bx && isRead(a)) bx.remove(); }); }
  function reveal(root) { const els = $$('.rev:not(.in)', root || document); if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in')); const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -5% 0px' }); els.forEach(e => io.observe(e)); }

  /* ---------- filter, feed, paginasi ---------- */
  function matches(a, q) { q = q.toLowerCase(); const c = catInfo(a.cat); return [a.title, a.title_en, exc(a), (a.tags || []).join(' '), c.id, c.en, a.author].join(' ').toLowerCase().indexOf(q) >= 0; }
  function filtered() {
    let l = S.articles.slice();
    if (S.cat) l = l.filter(a => a.cat === S.cat);
    if (S.q) l = l.filter(a => matches(a, S.q));
    if (S.day) l = l.filter(a => day(a.date) === S.day);
    if (S.tab === 'unread') l = l.filter(a => !isRead(a));
    if (S.tab === 'pop') l.sort((x, y) => (y.reads || 0) - (x.reads || 0));
    return l;
  }
  function renderFeed() {
    const feed = $('#feed'); if (!feed) return; const l = filtered(), size = C.PAGE_SIZE, pages = Math.max(1, Math.ceil(l.length / size)); S.page = Math.min(S.page, pages);
    feed.innerHTML = l.length ? l.slice((S.page - 1) * size, S.page * size).map(card).join('') : '<div class="empty">' + t('no_result') + '</div>';
    $('#tabs').innerHTML = [['all', 'tab_all'], ['new', 'tab_new'], ['pop', 'tab_pop'], ['unread', 'tab_unread']].map(x => '<button class="tab" role="tab" data-tab="' + x[0] + '" aria-selected="' + (S.tab === x[0]) + '">' + t(x[1]) + '</button>').join('');
    const chips = []; if (S.q) chips.push(['q', '🔍 ' + S.q]); if (S.cat) chips.push(['cat', catInfo(S.cat).icon + ' ' + catInfo(S.cat)[lang()]]); if (S.day) chips.push(['day', '📅 ' + fmtDate(S.day)]);
    $('#filters').innerHTML = chips.map(c => '<span class="fchip">' + esc(c[1]) + '<button type="button" data-clr="' + c[0] + '" aria-label="' + t('clear') + '">✕</button></span>').join('');
    const pg = []; for (let i = 1; i <= pages; i++) pg.push('<button type="button" data-pg="' + i + '"' + (i === S.page ? ' aria-current="page"' : '') + '>' + i + '</button>');
    $('#pager').innerHTML = pages > 1 ? '<button type="button" data-pg="' + (S.page - 1) + '" ' + (S.page < 2 ? 'disabled' : '') + ' aria-label="Prev">‹</button>' + pg.join('') + '<button type="button" data-pg="' + (S.page + 1) + '" ' + (S.page >= pages ? 'disabled' : '') + ' aria-label="Next">›</button>' : '';
    reveal(feed);
  }
  function renderChannels() {
    const el = $('#channels'); if (!el) return;
    el.innerHTML = '<button class="ch all" type="button" data-ch="" aria-pressed="' + (!S.cat) + '">📰 ' + t('all') + '</button>' + C.CATEGORIES.map(c => '<button class="ch" data-cat="' + c.slug + '" type="button" data-ch="' + c.slug + '" aria-pressed="' + (S.cat === c.slug) + '">' + c.icon + ' ' + esc(c[lang()]) + '</button>').join('');
  }
  function renderHero() {
    const el = $('#hero'); if (!el) return; if (!S.articles.length) { el.innerHTML = ''; return; }
    const pool = S.articles.slice(), big = pool.filter(a => a.featured)[0] || pool[0], subs = pool.filter(a => a.id !== big.id).slice(0, 3);
    const h = (a, cls) => { const c = catInfo(a.cat); return '<a class="hl ' + cls + '" data-cat="' + esc(a.cat) + '" data-aid="' + esc(a.id) + '" ' + linkOf(a) + '><span class="art">' + c.icon + '</span><span class="chip">' + esc(c[lang()] || c.id) + '</span><h3>' + esc(ttl(a)) + '</h3>' + (cls === 'big' ? '<p>' + esc(exc(a)) + '</p>' : '') + '<span class="mi"><span>' + mins(a) + ' ' + t('min') + '</span><span>' + fmtDate(a.date) + '</span><span class="xp" style="color:#FFD966">+' + C.XP_READ + ' XP</span></span></a>'; };
    el.innerHTML = h(big, 'big') + subs.map(a => h(a, '')).join('');
    const bg = $('.hl.big', el); if (bg && !reduced) { bg.addEventListener('pointermove', e => { const r = bg.getBoundingClientRect(); bg.style.transform = 'translate(' + (((e.clientX - r.left) / r.width - .5) * 8).toFixed(1) + 'px,' + (((e.clientY - r.top) / r.height - .5) * 8 - 3).toFixed(1) + 'px)'; }); bg.addEventListener('pointerleave', () => { bg.style.transform = ''; }); }
  }
  function renderRail() { const el = $('#rail'); if (!el) return; el.innerHTML = S.articles.slice().sort((x, y) => (y.reads || 0) - (x.reads || 0)).slice(0, 8).map(card).join(''); reveal(el); }
  function renderPop() { const el = $('#pop'); if (!el) return; el.innerHTML = S.articles.slice().sort((x, y) => (y.reads || 0) - (x.reads || 0)).slice(0, 5).map((a, i) => '<li data-cat="' + esc(a.cat) + '"><span class="n">' + (i + 1) + '</span><a data-aid="' + esc(a.id) + '" ' + linkOf(a) + '>' + esc(ttl(a)) + '</a></li>').join(''); }
  function renderTicker() { const el = $('#tk'); if (!el) return; const l = S.articles.filter(a => a.featured).concat(S.articles).filter((a, i, r) => r.indexOf(a) === i).slice(0, 8); const h = l.map(a => '<a data-aid="' + esc(a.id) + '" ' + linkOf(a) + '>' + esc(ttl(a)) + '</a>').join('<span>•</span>'); el.innerHTML = h + '<span>•</span>' + h; }
  function renderAll() { renderChannels(); renderTicker(); renderHero(); renderRail(); renderPop(); renderFeed(); renderMission(); renderStatus(); renderMiniCals(); renderMonPage(); renderExport(); renderCalPage(); }

  /* ---------- kalender ---------- */
  const calSt = {};
  function calendar(el, id, opts) {
    const st = calSt[id] || (calSt[id] = { y: new Date().getFullYear(), m: new Date().getMonth() }); opts = opts || {};
    const first = new Date(st.y, st.m, 1), n = new Date(st.y, st.m + 1, 0).getDate(), off = first.getDay(), has = {}; S.articles.forEach(a => { has[day(a.date)] = 1; });
    const names = lang() === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['Mi', 'Se', 'Sl', 'Ra', 'Ka', 'Ju', 'Sa'];
    let h = '<div class="cal-h"><button type="button" data-cm="-1" aria-label="Prev">‹</button><span>' + first.toLocaleDateString(lang() === 'en' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' }) + '</span><button type="button" data-cm="1" aria-label="Next">›</button></div><table class="cal"><tr>' + names.map(x => '<th>' + x + '</th>').join('') + '</tr><tr>';
    for (let i = 0; i < off; i++) h += '<td></td>';
    for (let d = 1; d <= n; d++) { const ds = st.y + '-' + String(st.m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); if ((off + d - 1) % 7 === 0 && d > 1) h += '</tr><tr>'; h += '<td><button type="button" data-d="' + ds + '" class="' + (has[ds] ? 'has ' : '') + (ds === day() ? 'today ' : '') + (opts.sel() === ds ? 'sel' : '') + '">' + d + '</button></td>'; }
    el.innerHTML = h + '</tr></table>';
    $$('[data-cm]', el).forEach(b => b.onclick = () => { st.m += +b.dataset.cm; if (st.m < 0) { st.m = 11; st.y--; } if (st.m > 11) { st.m = 0; st.y++; } calendar(el, id, opts); });
    $$('[data-d]', el).forEach(b => b.onclick = () => { opts.pick(b.dataset.d === opts.sel() ? '' : b.dataset.d); calendar(el, id, opts); });
  }
  function renderMiniCals() { const m = $('#minical'); if (m) calendar(m, 'mini', { sel: () => S.day, pick: d => { S.day = d; S.page = 1; renderFeed(); if (d) $('#jelajah').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); } }); }
  let calDay = day();
  async function getRem() { return (await DB.get('progress', 'reminders')) || { key: 'reminders', items: [] }; }
  async function renderCalPage() {
    const bc = $('#bigcal'); if (!bc) return;
    calendar(bc, 'big', { sel: () => calDay, pick: d => { calDay = d || day(); renderCalPage(); } });
    $('#dayfeed').innerHTML = S.articles.filter(a => day(a.date) === calDay).map(a => '<a data-aid="' + esc(a.id) + '" ' + linkOf(a) + '>' + esc(ttl(a)) + '</a>').join('') || '<span class="mut">' + t('no_result') + '</span>';
    const r = await getRem(); $('#rem-list').innerHTML = r.items.sort((x, y) => x.at.localeCompare(y.at)).map(i => '<li style="list-style:none;display:flex;justify-content:space-between;gap:8px"><span>⏰ ' + esc(i.text) + ' <small class="mut">' + esc(i.at.replace('T', ' ')) + '</small></span><button class="btn sm" type="button" data-rdel="' + i.id + '">✕</button></li>').join('');
  }
  async function checkReminders() { const r = await getRem(), now = new Date().toISOString().slice(0, 16), local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16); const due = r.items.filter(i => i.at <= local && !i.fired); if (!due.length) return; due.forEach(i => { i.fired = true; toast('⏰ ' + t('due') + ' <b>' + esc(i.text) + '</b>', 6000); }); await DB.put('progress', r); }

  /* ---------- pencarian pintar ---------- */
  let sg = [], sgi = -1;
  function suggest(q) {
    q = q.trim().toLowerCase(); const box = $('#sugg'); if (!q) { box.hidden = true; return; } const out = [], seen = {};
    const add = (type, label, val, ref) => { const k = type + label.toLowerCase(); if (!seen[k] && label.toLowerCase().indexOf(q) >= 0 && out.length < 7) { seen[k] = 1; out.push({ type, label, val, ref }); } };
    S.articles.forEach(a => add('art', ttl(a), a.id));
    S.articles.forEach(a => (a.tags || []).forEach(tg => add('tag', '#' + tg, tg)));
    C.CATEGORIES.forEach(c => add('cat', c[lang()], c.slug));
    sg = out; sgi = -1; box.innerHTML = out.map((s, i) => '<li role="option" data-i="' + i + '">' + (s.type === 'art' ? '📰' : s.type === 'tag' ? '🏷️' : '📂') + ' <span>' + esc(s.label) + '</span><small>' + (s.type === 'art' ? '' : s.type) + '</small></li>').join(''); box.hidden = !out.length;
  }
  function goSearch(q, cat) { if (view === 'home') { S.q = q || ''; if (cat !== undefined) S.cat = cat; S.page = 1; renderChannels(); renderFeed(); $('#jelajah') && $('#jelajah').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); } else location.href = BASE + '/?' + (cat ? 'cat=' + encodeURIComponent(cat) : 'q=' + encodeURIComponent(q || '')); }
  function pickSuggest(i) { const s = sg[i]; if (!s) return; $('#sugg').hidden = true; if (s.type === 'art') { const a = S.byId[s.val]; if (a.source === 'jekyll') location.href = a.url; else openReader(a.id); } else if (s.type === 'tag') { $('#q').value = s.val; goSearch(s.val); } else { $('#q').value = ''; goSearch('', s.val); } }

  /* ---------- modal ---------- */
  let readerCtl = null;
  function modal(html, cls) { const ov = $('#ov'); ov.hidden = false; ov.innerHTML = '<div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="' + t('close') + '" data-close>✕</button>' + html + '</div>'; const m = $('.modal', ov); const f = $('input,textarea,button:not(.x)', m); return m; }
  function closeModal() { const ov = $('#ov'); if (ov.hidden) return; ov.hidden = true; ov.innerHTML = ''; if (readerCtl) { readerCtl.destroy(); readerCtl = null; } if (/#read=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); }

  /* ---------- reader: TTS, font, XP 95%, bookmark, catatan, komentar ---------- */
  const FS = [0.95, 1.05, 1.2, 1.35];
  function setFS(delta) { let i = +(localStorage.getItem('andu_fs') || 1); i = delta === 0 ? 1 : Math.max(0, Math.min(3, i + delta)); localStorage.setItem('andu_fs', i); document.documentElement.style.setProperty('--rfs', FS[i]); }
  function bindReader(ctx) {
    const a = ctx.art, root = ctx.root, synth = window.speechSynthesis; let claimed = !!P.read[a.id], t0 = Date.now(), alive = true, remote = ctx.remote || [];
    const claimEl = $('#claim', root), claimT = $('#claim-t', root);
    const setClaim = () => { if (!claimEl) return; claimEl.classList.toggle('done', claimed); claimT.textContent = claimed ? (P.read[a.id] && Date.now() - P.read[a.id] < 4000 ? t('claim_done') : t('claim_have')) : t('claim_hint'); };
    function prog() { const r = ctx.body.getBoundingClientRect(), vb = ctx.scroller ? ctx.scroller.getBoundingClientRect().bottom : innerHeight; return Math.max(0, Math.min(1, (vb - r.top) / Math.max(r.height, 1))); }
    function check() { if (!alive) return; const p = prog(); if (ctx.bar) ctx.bar.style.width = (p * 100).toFixed(1) + '%'; if (!claimed && p >= C.SCROLL_CLAIM && Date.now() - t0 >= 3500) { claimed = true; award(a).then(setClaim); } }
    const sc = ctx.scroller || window; sc.addEventListener('scroll', check, { passive: true }); const iv = setInterval(check, 1000); setClaim(); check();
    /* TTS */
    const ttsOk = !!synth && 'SpeechSynthesisUtterance' in window; if (!ttsOk) $$('#tts-play,#tts-pause,#tts-stop', root).forEach(b => { b.disabled = true; });
    function speak() {
      if (!ttsOk) return; if (synth.paused) { synth.resume(); return; } synth.cancel();
      const blocks = $$('[data-lang="' + lang() + '"]', ctx.body), txt = (blocks.length ? blocks : [ctx.body]).map(b => b.innerText || b.textContent).join('\n'), loc = lang() === 'en' ? 'en-US' : 'id-ID', vs = synth.getVoices().filter(v => v.lang.toLowerCase().indexOf(loc.slice(0, 2)) === 0), v = vs.filter(x => x.lang.replace('_', '-') === loc)[0] || vs[0];
      (txt.match(/[^.!?\n]{1,220}[.!?]?/g) || []).map(s => s.trim()).filter(Boolean).forEach(s => { const u = new SpeechSynthesisUtterance(s); u.lang = loc; if (v) u.voice = v; u.rate = 0.98; synth.speak(u); });
    }
    const bp = $('#tts-play', root), bz = $('#tts-pause', root), bs = $('#tts-stop', root); if (bp) bp.onclick = speak; if (bz) bz.onclick = () => ttsOk && synth.pause(); if (bs) bs.onclick = () => ttsOk && synth.cancel();
    /* bookmark */
    const bm = $('#bm-btn', root), paintBm = () => { if (bm) { bm.setAttribute('aria-pressed', S.bm.has(a.id)); bm.style.outline = S.bm.has(a.id) ? '3px solid var(--amber)' : ''; } }; paintBm();
    if (bm) bm.onclick = async () => { if (S.bm.has(a.id)) { S.bm.delete(a.id); await DB.del('bookmarks', 'b-' + a.id); } else { S.bm.add(a.id); await DB.put('bookmarks', { id: 'b-' + a.id, article: a.id, at: Date.now() }); } if (a.source === 'gas' && GAS.session) GAS.toggle(a.gid, 'bookmark').catch(() => {}); paintBm(); refreshCards(); renderStatus(); };
    /* catatan */
    const nt = $('#note', root); if (nt) { DB.get('notes', a.id).then(n => { if (n) nt.value = n.text; }); let tm; nt.oninput = () => { clearTimeout(tm); tm = setTimeout(() => DB.put('notes', { id: a.id, text: nt.value }), 500); }; }
    /* komentar */
    async function paintComments() {
      const list = $('#clist', root); if (!list) return; const local = (await DB.byArticle('comments', a.id)).filter(c => a.source !== 'gas' || !c.sent).map(c => ({ n: c.name, av: c.avatar, tx: c.text, at: c.created })), rm = remote.map(c => ({ n: c.user_name, av: c.user_avatar, tx: c.comment_text, at: c.created_at })), all = rm.concat(local).sort((x, y) => String(x.at).localeCompare(String(y.at)));
      list.innerHTML = all.map(c => '<div class="cm"><span class="av">' + (/^https?:\/\//.test(c.av || '') ? '<img alt="" src="' + esc(c.av) + '">' : esc((c.n || '?').charAt(0).toUpperCase())) + '</span><div><b>' + esc(c.n) + '</b> <small>' + fmtDate(c.at) + '</small><div>' + esc(c.tx) + '</div></div></div>').join('') || '<span class="mut">—</span>';
    }
    paintComments(); const cf = $('#cform', root);
    if (cf) cf.onsubmit = async e => {
      e.preventDefault(); const inp = $('#ctext', root), text = inp.value.trim(); if (text.length < 2) return; const u = GAS.display(), c = { id: 'c-' + Date.now().toString(36), article: a.id, name: u ? u.name : (lang() === 'en' ? 'Guest' : 'Tamu'), avatar: u && u.avatar, text: text, created: new Date().toISOString(), sent: false };
      if (a.source === 'gas') { try { await GAS.ensure(); if (!GAS.session || !GAS.session.verified) { toast(t('need_login')); openAuth(); return; } const j = await GAS.addComment(a.gid, text); remote = remote.concat([j.comment]); c.sent = true; } catch (err) { toast(esc(err.message || 'Error')); if (err.code === 401) openAuth(); return; } }
      await DB.put('comments', c); inp.value = ''; P.daily.comment++; await saveProfile(); renderMission(); renderStatus(); paintComments();
    };
    return { destroy() { alive = false; sc.removeEventListener('scroll', check); clearInterval(iv); if (ttsOk) synth.cancel(); } };
  }
  const auLink = a => '<a class="au" href="#" data-author="' + esc(a.author) + '" data-aid="' + esc(a.author_id || '') + '">' + esc(a.author) + '</a>';
  function openAuthor(name, aid) {
    const en = lang() === 'en', list = S.articles.filter(a => a.author === name || (aid && a.author_id === aid)).sort((x, y) => new Date(y.date) - new Date(x.date));
    const rl = (list.find(a => a.author_role) || {}).author_role, label = rl === 'superadmin' ? (en ? 'Editorial team' : 'Redaksi') : (en ? 'Writer' : 'Penulis');
    const reads = list.reduce((n, a) => n + (+a.reads || 0), 0), likes = list.reduce((n, a) => n + (+a.likes || 0), 0);
    modal('<div style="display:flex;gap:14px;align-items:center"><div aria-hidden="true" style="width:64px;height:64px;border-radius:50%;background:#1546BE;color:#fff;display:grid;place-items:center;font:700 28px sans-serif">' + esc((name || '?').trim().charAt(0).toUpperCase()) + '</div><div><h2 style="margin:0">' + esc(name) + '</h2><span class="chip">' + label + '</span></div></div>' +
      '<p class="mut" style="margin:14px 0"><b>' + list.length + '</b> ' + (en ? 'articles' : 'tulisan') + ' · <b>' + reads + '</b> ' + (en ? 'reads' : 'dibaca') + ' · <b>' + likes + '</b> ' + (en ? 'likes' : 'suka') + '</p>' +
      '<h3>' + (en ? 'Articles' : 'Tulisan') + '</h3><div class="list">' + (list.map(a => '<a class="aurow" ' + linkOf(a) + ' style="display:block;padding:8px 0;border-bottom:1px solid rgba(128,128,128,.25)">' + esc(ttl(a)) + ' <small class="mut">' + fmtDate(a.date) + '</small></a>').join('') || '<span class="mut">' + t('no_result') + '</span>') + '</div>', 'au');
  }
  async function shareLink() {
    const m = /#read=(.+)$/.exec(location.hash), ra = m && S.byId[decodeURIComponent(m[1])], url = ra && ra.url ? abs(ra.url) : location.href;
    try { if (navigator.share) { await navigator.share({ title: document.title, url: url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast(lang() === 'en' ? '🔗 Link copied' : '🔗 Tautan disalin'); } catch (e) { prompt(lang() === 'en' ? 'Copy this link:' : 'Salin tautan ini:', url); }
  }
  async function openReader(id) {
    const a = S.byId[id]; if (!a) { toast(t('no_result')); return; }
    const c = catInfo(a.cat), m = modal('<div class="rbar" style="position:sticky;top:-20px;margin:-20px -20px 12px;border-radius:22px 22px 0 0;z-index:6"><i id="rbar-i"></i></div><span class="chip">' + c.icon + ' ' + esc(c[lang()] || c.id) + '</span><h2 style="font-size:28px;margin-top:8px">' + esc(ttl(a)) + '</h2><p class="meta">' + auLink(a) + ' • ' + fmtDate(a.date) + ' • ' + mins(a) + ' ' + t('min') + ' • <b class="xp">+' + C.XP_READ + ' XP</b></p>' +
      '<div class="tools"><span class="seg"><button type="button" data-fs="-1">A-</button><button type="button" data-fs="0">A</button><button type="button" data-fs="1">A+</button></span><span class="seg"><button type="button" id="tts-play">▶ ' + t('listen') + '</button><button type="button" id="tts-pause">⏸</button><button type="button" id="tts-stop">⏹</button></span><button type="button" class="btn sm ghost" id="bm-btn">🔖 ' + t('bookmark') + '</button><button type="button" class="btn sm ghost" id="sh-btn">🔗 ' + (lang() === 'en' ? 'Share' : 'Bagikan') + '</button></div>' +
      '<div class="postbody" id="postbody">' + t('loading') + '</div><div class="claim" id="claim"><span id="claim-t"></span></div><h3>' + t('notes') + '</h3><textarea id="note" rows="3" placeholder="' + esc(t('notes_ph')) + '"></textarea><h3>' + t('comments') + '</h3><div id="clist" class="list"></div><form id="cform" class="row"><input id="ctext" maxlength="1000" required placeholder="' + esc(t('c_ph')) + '"><button class="btn" type="submit">' + t('send') + '</button></form>', 'rd');
    m.dataset.cat = a.cat; let html = '', remote = [];
    try {
      if (a.source === 'jekyll') { const r = await fetch(a.url), d = new DOMParser().parseFromString(await r.text(), 'text/html'), pb = d.querySelector('.postbody'); html = pb ? pb.innerHTML : '<p>' + esc(exc(a)) + '</p>'; }
      else if (a.source === 'gas') { const j = await GAS.fetchDetail(a.gid); html = j.article.content_html; remote = j.comments || []; }
      else html = a.html || '';
    } catch (e) { html = '<p>' + esc(exc(a)) + '</p>'; }
    const body = $('#postbody', m); body.innerHTML = sanitize(html); if (readerCtl) readerCtl.destroy();
    readerCtl = bindReader({ art: a, root: m, body: body, scroller: m, bar: $('#rbar-i', m), remote: remote });
  }

  /* ---------- auth ---------- */
  function renderUser() { const b = $('#b-login'); if (!b) return; const u = GAS.display(); b.innerHTML = u ? '👤 ' + esc(u.name) : '<span>' + t('login') + '</span>'; }
  function openAccount() {
    const u = GAS.display(); if (!u) return openAuth();
    const m = modal('<h2>👤 ' + esc(u.name) + '</h2><p class="mut">@' + esc(u.username) + '</p><p>' + t('role') + ': <b>' + esc(u.role || 'reader') + '</b> · ' + (u.verified ? '✅ ' + t('verified') : '⚠️ ' + t('soft')) + '</p><div class="row wrapr"><a class="btn" href="https://andu.my.id/pesaner">Pesaner</a><button class="btn ghost" type="button" id="acc-login">' + t('login') + '</button><button class="btn ghost" type="button" id="acc-out">' + t('logout') + '</button><button class="btn ghost" type="button" id="acc-tour">' + t('tour_replay') + '</button></div>');
    $('#acc-login', m).onclick = () => openAuth(); $('#acc-out', m).onclick = () => { GAS.logout(); try { localStorage.removeItem('pesaner_user'); } catch (e) {} renderUser(); closeModal(); }; $('#acc-tour', m).onclick = () => openTour(0);
  }
  function openAuth(tab) {
    const p = GAS.pesanerUser(), one = p ? '<button class="btn amber" type="button" id="a-one" style="width:100%;margin-bottom:12px">⚡ ' + t('continue_as') + ' ' + esc(p.nama || p.name || p.username || p.id) + '</button>' : '';
    const m = modal('<h2>🔐 ' + t('login') + '</h2>' + (GAS.enabled ? '' : '<p class="msg">' + t('offline_gas') + '</p>') + one + '<div class="auth-tabs"><button class="btn sm" type="button" data-at="login">' + t('login') + '</button><button class="btn sm ghost" type="button" data-at="reg">' + t('register') + '</button></div>' +
      '<form id="f-login"><label class="fl"><span>' + t('user') + '</span><input id="l-u" autocomplete="username" required></label><label class="fl"><span>' + t('pass') + '</span><input id="l-p" type="password" autocomplete="current-password" required></label><div class="msg" id="a-msg" role="alert"></div><button class="btn" type="submit">' + t('login') + '</button></form>' +
      '<form id="f-reg" hidden><label class="fl"><span>' + t('name') + '</span><input id="r-n" required maxlength="60"></label><label class="fl"><span>Username</span><input id="r-u" required pattern="[A-Za-z0-9_.]{3,30}"></label><label class="fl"><span>Email</span><input id="r-e" type="email"></label><label class="fl"><span>' + t('pass') + '</span><input id="r-p" type="password" minlength="6" required></label><label class="fl"><input id="r-w" type="checkbox" style="width:auto"> ' + t('as_writer') + '</label><label class="fl" id="r-bw" hidden><span>' + t('writer_bio') + '</span><textarea id="r-b" rows="3" maxlength="1000"></textarea></label><div class="msg" id="a-msg2" role="alert"></div><button class="btn" type="submit">' + t('register') + '</button></form>');
    const msg = (id, s, ok) => { const e = $(id, m); e.textContent = s; e.classList.toggle('ok', !!ok); };
    const done = () => { renderUser(); closeModal(); toast('✅ ' + esc(GAS.display().name)); };
    $$('[data-at]', m).forEach(b => b.onclick = () => { const r = b.dataset.at === 'reg'; $('#f-login', m).hidden = r; $('#f-reg', m).hidden = !r; $$('[data-at]', m).forEach(x => x.classList.toggle('ghost', x !== b)); }); if (tab === 'reg') $('[data-at=reg]', m).click();
    const one$ = $('#a-one', m); if (one$) one$.onclick = async () => { try { GAS.logout(); await GAS.ensure(); if (!GAS.session) throw new Error(t('offline_gas')); done(); } catch (e) { msg('#a-msg', e.message); } };
    $('#f-login', m).onsubmit = async e => { e.preventDefault(); msg('#a-msg', '…', true); try { await GAS.login($('#l-u', m).value.trim(), $('#l-p', m).value); done(); } catch (er) { msg('#a-msg', er.message === 'offline' ? t('offline_gas') : er.message); } };
    $('#r-w', m).onchange = e => { $('#r-bw', m).hidden = !e.target.checked; };
    $('#f-reg', m).onsubmit = async e => { e.preventDefault(); msg('#a-msg2', '…', true); try { await GAS.register({ name: $('#r-n', m).value, username: $('#r-u', m).value, email: $('#r-e', m).value, password: $('#r-p', m).value, as_writer: $('#r-w', m).checked, writer_bio: $('#r-b', m).value }); done(); } catch (er) { msg('#a-msg2', er.message === 'offline' ? t('offline_gas') : er.message); } };
  }

  /* ---------- + Tulis Berita ---------- */
  async function openWrite() {
    if (GAS.enabled) {  /* wajib login & berstatus penulis sebelum formulir dibuka */
      try { await GAS.ensure(); } catch (e) {}
      if (!GAS.session || !GAS.session.verified) { toast(t('need_login'), 4000); openAuth(); return; }
      if (!GAS.session.user || !GAS.session.user.can_write) { toast(t('need_writer'), 5000); return; }
    }
    const m = modal('<h2>✍️ ' + t('write').replace('+ ', '') + '</h2><form id="f-w"><label class="fl"><span>' + t('title') + '</span><input id="w-t" required minlength="5" maxlength="150"></label><label class="fl"><span>' + t('cat') + '</span><select id="w-c">' + C.CATEGORIES.map(c => '<option value="' + c.slug + '">' + c.icon + ' ' + esc(c[lang()]) + '</option>').join('') + '</select></label><label class="fl"><span>' + t('body') + '</span><textarea id="w-b" rows="8" required minlength="20"></textarea></label><label class="fl"><span>' + t('tags') + '</span><input id="w-g"></label><div class="msg ok" id="w-m"></div><button class="btn amber" type="submit">' + t('save') + '</button></form>');
    $('#f-w', m).onsubmit = async e => {
      e.preventDefault(); const title = $('#w-t', m).value.trim(), cat = $('#w-c', m).value, raw = $('#w-b', m).value.trim(), tags = $('#w-g', m).value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 8), u = GAS.display();
      const html = raw.split(/\n\s*\n/).map(p => '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>').join(''), plain = raw.replace(/\s+/g, ' '), words = plain.split(' ').length;
      const a = { id: 'u-' + Date.now().toString(36), source: 'mine', cat: cat, title: title, title_en: title, lang_id: { title: title, excerpt: plain.slice(0, 160) }, lang_en: { title: title, excerpt: plain.slice(0, 160) }, tags: tags, author: u ? u.name : (lang() === 'en' ? 'Guest' : 'Warga'), reading_time: Math.max(1, Math.ceil(words / C.WPM)), reading_time_en: Math.max(1, Math.ceil(words / C.WPM)), reads: 0, featured: false, image: '', date: new Date().toISOString(), status: 'local', html: html, url: '' };
      await DB.put('articles', a); setArticles(await DB.getAll('articles')); renderAll(); let note = t('saved_local');
      if (GAS.enabled) { try { await GAS.ensure(); if (!GAS.session || !GAS.session.verified) note = t('need_login'); else if (!GAS.session.user.can_write) note = t('need_writer'); else { const j = await GAS.submitArticle({ title: title, html: html, cat: cat, tags: tags, excerpt: plain.slice(0, 200) }); a.gid = j.article_id; a.status = 'pending_review'; await DB.put('articles', a); note = t('sent_red'); } } catch (er) { note = esc(er.message === 'offline' ? t('saved_local') : er.message); } }
      closeModal(); toast(note, 5000); addXP(0);
    };
  }

  /* ---------- halaman monster ---------- */
  let bigMon = null;
  function renderMonPage() {
    const big = $('#mon-big'); if (!big) return;
    if (!bigMon || !bigMon.svg.isConnected) bigMon = mountMon(big, { auto: true }); else bigMon.set(P.monster, P.hue);
    big.onclick = () => bigMon.pet();
    $('#mon-pick').innerHTML = C.MONSTERS.map(m => '<button class="pick" type="button" data-pick="' + m.key + '" aria-pressed="' + (P.monster === m.key) + '" aria-label="' + esc(m.name) + '"><span class="mon">' + M3.svg(m.key, { hue: P.monster === m.key ? P.hue : 0 }) + '</span><div style="text-align:center;font:600 13px var(--f1)">' + esc(m.name) + '</div></button>').join('');
    const nm = $('#mon-name'), hu = $('#mon-hue'); if (document.activeElement !== nm) nm.value = P.name; hu.value = P.hue; $('#mon-bio').textContent = M3.data(P.monster)[lang()];
  }
  /* ---------- ekspor ---------- */
  function exportItems() { const sc = ($('#exp-scope') || {}).value || 'read'; return S.articles.filter(a => sc === 'all' ? true : sc === 'bm' ? S.bm.has(a.id) : isRead(a)); }
  function renderExport() {
    const sel = $('#exp-scope'); if (!sel) return; const cur = sel.value || 'read';
    sel.innerHTML = [['read', t('read_c')], ['bm', '🔖'], ['all', t('all')]].map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join(''); sel.value = cur;
    $('#exp-list').innerHTML = exportItems().map(a => '<div>' + esc(ttl(a)) + ' <small class="mut">' + fmtDate(a.date) + '</small></div>').join('') || '<span class="mut">' + t('no_result') + '</span>';
  }
  async function doExport(kind) {
    const items = exportItems(); if (!items.length) { toast(t('no_result')); return; }
    const head = 'ANDU NEWS – Digest ' + fmtDate(new Date()), link = a => a.url ? abs(a.url) : location.origin + BASE + '/#read=' + a.id;
    if (kind === 'txt') download('andu-digest.txt', 'text/plain;charset=utf-8', head + '\n\n' + items.map((a, i) => (i + 1) + '. ' + ttl(a) + '\n' + exc(a) + '\n' + link(a)).join('\n\n'));
    if (kind === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent('*' + head + '*\n\n' + items.map((a, i) => (i + 1) + '. *' + ttl(a) + '*\n' + exc(a) + '\n' + link(a)).join('\n\n')), '_blank', 'noopener');
    if (kind === 'rss') download('andu-digest.xml', 'application/rss+xml;charset=utf-8', '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>' + esc(head) + '</title><link>' + esc(location.origin + BASE + '/') + '</link><description>ANDU NEWS digest</description>' + items.map(a => '<item><title>' + esc(ttl(a)) + '</title><link>' + esc(link(a)) + '</link><guid isPermaLink="false">' + esc(a.id) + '</guid><pubDate>' + new Date(a.date).toUTCString() + '</pubDate><description>' + esc(exc(a)) + '</description></item>').join('') + '</channel></rss>');
    if (kind === 'pdf') {
      try { if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'); const doc = new window.jspdf.jsPDF(), W = 180; let y = 20; doc.setFontSize(18); doc.text(head, 15, y); y += 12;
        items.forEach(a => { const tl = doc.splitTextToSize(ttl(a), W), ex = doc.splitTextToSize(exc(a), W); if (y + 8 * (tl.length + ex.length) + 8 > 285) { doc.addPage(); y = 20; } doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text(tl, 15, y); y += 6.5 * tl.length; doc.setFont(undefined, 'normal'); doc.setFontSize(10); doc.text(ex, 15, y); y += 5 * ex.length + 2; doc.setTextColor(21, 70, 190); doc.text(link(a).slice(0, 95), 15, y); doc.setTextColor(0); y += 10; });
        doc.save('andu-digest.pdf'); } catch (e) { toast('PDF: ' + esc(e.message || 'gagal memuat jsPDF')); }
    }
  }

  /* ---------- tur 3 langkah ---------- */
  function openTour(i) {
    const steps = [['tour1t', 'tour1'], ['tour2t', 'tour2'], ['tour3t', 'tour3']], s = steps[i];
    const m = modal('<div class="step-m"><div id="tour-m"></div><div><h2>' + t(s[0]).replace('{n}', esc(P.name)) + '</h2><p>' + t(s[1]) + '</p></div></div><div class="dots">' + steps.map((x, k) => '<i class="' + (k === i ? 'on' : '') + '"></i>').join('') + '</div><div class="row" style="justify-content:space-between"><button class="btn ghost" type="button" id="tr-skip">' + t('skip') + '</button><button class="btn amber" type="button" id="tr-next">' + t(i === 2 ? 'done' : 'next') + '</button></div>');
    mountMon($('#tour-m', m), { auto: true }); S.monsters[S.monsters.length - 1].jump();
    const fin = async () => { P.onboarded = true; await saveProfile(); closeModal(); };
    $('#tr-skip', m).onclick = fin; $('#tr-next', m).onclick = () => { if (i === 2) { fin(); if (!GAS.display()) openAuth(); } else openTour(i + 1); };
  }
  /* ---------- companion dock ---------- */
  const TIPS = { id: { home: ['Klik kartu berita, baca sampai 95% untuk +25 XP!', 'Coba kolom pencarian, ada saran kata kunci otomatis.', 'Selesaikan Misi Harian untuk bonus XP.'], page: ['Tekan Dengar kalau matamu lelah.', 'Gulir pelan sampai bawah, XP-nya menunggu!', 'Tulis catatan pribadi di bawah artikel.'], cal: ['Klik tanggal untuk melihat berita hari itu.', 'Pasang pengingat baca supaya streak aman.'], mon: ['Ganti warnaku dengan slider hue!', 'Klik aku untuk diusap 💖'], exp: ['Pilih isi digest, lalu bagikan ke WhatsApp.'], night: ['Zzz… sudah malam, baca satu berita lalu istirahat ya.'] },
    en: { home: ['Open a card and read to 95% for +25 XP!', 'Try the search box, it suggests keywords.', 'Finish the Daily Mission for bonus XP.'], page: ['Tap Listen if your eyes are tired.', 'Scroll slowly to the end, the XP is waiting!', 'Jot a personal note below the article.'], cal: ['Click a date to see that day’s news.', 'Set a reading reminder to protect your streak.'], mon: ['Change my colour with the hue slider!', 'Click me for a pet 💖'], exp: ['Pick the digest contents, then share on WhatsApp.'], night: ['Zzz… it’s late, read one story and rest.'] } };
  let dockMon = null, bt;
  function say(msg) { const b = $('#bubble'); b.textContent = msg; b.classList.remove('hide'); clearTimeout(bt); bt = setTimeout(() => b.classList.add('hide'), 7000); }
  function tip() { const set = TIPS[lang()], pool = M3.night() ? set.night : (set[view === 'page' ? 'page' : view] || set.home); say(pool[Math.floor(Math.random() * pool.length)]); }

  /* ---------- widget utilitas ---------- */
  function renderUtilDate() { const e = $('#u-date'); if (e) e.textContent = new Date().toLocaleDateString(lang() === 'en' ? 'en-US' : 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  async function utilWidgets() {
    let c = null; try { c = JSON.parse(localStorage.getItem('andu_util') || 'null'); } catch (e) {}
    if (!c || Date.now() - c.at > 1800000) { c = { at: Date.now() }; try { const w = await (await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.595&longitude=106.816&current=temperature_2m')).json(); c.temp = w.current.temperature_2m; } catch (e) {} try { const k = await (await fetch('https://open.er-api.com/v6/latest/USD')).json(); c.idr = k.rates.IDR; } catch (e) {} try { localStorage.setItem('andu_util', JSON.stringify(c)); } catch (e) {} }
    if (c.temp != null) { const w = $('#u-weather'); w.hidden = false; w.textContent = '🌤️ Bogor ' + Math.round(c.temp) + '°C'; }
    if (c.idr) { const k = $('#u-kurs'); k.hidden = false; k.textContent = '💵 USD ' + Math.round(c.idr).toLocaleString('id-ID'); }
  }

  /* ---------- events global ---------- */
  function wire() {
    document.addEventListener('click', async e => {
      const tg = e.target.closest('[data-read],[data-ch],[data-tab],[data-pg],[data-clr],[data-fs],[data-close],[data-pick],[data-rdel],[data-exp],[data-author],#sh-btn,#b-lang,#b-theme,#b-write,#b-login,#b-profile,#dock-mon,#fab-back,[data-nav=explore],.tcard[href^="#read"],#ov'); if (!tg) { const sb = $('#sugg'); if (sb && !e.target.closest('.search')) sb.hidden = true; return; }
      if (tg.id === 'ov') { if (e.target === tg) closeModal(); return; }
      if (tg.dataset.read) { e.preventDefault(); history.pushState(null, '', '#read=' + tg.dataset.read); openReader(tg.dataset.read); return; }
      if (tg.dataset.ch !== undefined) { if (view === 'home') { S.cat = tg.dataset.ch; S.page = 1; renderChannels(); renderFeed(); } else location.href = BASE + '/' + (tg.dataset.ch ? '?cat=' + tg.dataset.ch : ''); return; }
      if (tg.dataset.tab) { S.tab = tg.dataset.tab; S.page = 1; renderFeed(); return; }
      if (tg.dataset.pg) { S.page = +tg.dataset.pg; renderFeed(); $('#jelajah').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }
      if (tg.dataset.clr) { if (tg.dataset.clr === 'q') { S.q = ''; $('#q').value = ''; } if (tg.dataset.clr === 'cat') S.cat = ''; if (tg.dataset.clr === 'day') S.day = ''; S.page = 1; renderChannels(); renderFeed(); renderMiniCals(); return; }
      if (tg.dataset.fs !== undefined) { setFS(+tg.dataset.fs); return; }
      if (tg.dataset.close !== undefined) { closeModal(); return; }
      if (tg.dataset.pick) { P.monster = tg.dataset.pick; P.name = M3.data(P.monster).name; await saveProfile(); refreshMonsters(); renderMonPage(); renderStatus(); S.monsters.forEach(m => m.jump()); return; }
      if (tg.dataset.rdel) { const r = await getRem(); r.items = r.items.filter(i => i.id !== tg.dataset.rdel); await DB.put('progress', r); renderCalPage(); return; }
      if (tg.dataset.exp) { doExport(tg.dataset.exp); return; }
      if (tg.dataset.author !== undefined) { e.preventDefault(); openAuthor(tg.dataset.author, tg.dataset.aid || ''); return; }
      if (tg.id === 'sh-btn') { shareLink(); return; }
      if (tg.id === 'b-lang') { document.documentElement.lang = lang() === 'id' ? 'en' : 'id'; localStorage.setItem('andu_lang', lang()); if (window.speechSynthesis) speechSynthesis.cancel(); applyI18n(); renderAll(); renderUser(); tip(); return; }
      if (tg.id === 'b-theme') { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; localStorage.setItem('andu_theme', d); return; }
      if (tg.id === 'b-write') { openWrite(); return; }
      if (tg.id === 'b-login') { GAS.display() ? openAccount() : openAuth(); return; }
      if (tg.id === 'b-profile') { location.href = BASE + '/monster/'; return; }
      if (tg.id === 'dock-mon') { dockMon.pet(); tip(); return; }
      if (tg.id === 'fab-back') { if (history.length > 1 && document.referrer.indexOf(location.origin) === 0) history.back(); else location.href = BASE + '/'; return; }
      if (tg.dataset.nav === 'explore' && view === 'home') { e.preventDefault(); $('#jelajah').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); $('#q').focus(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); const s = $('#sugg'); if (s) s.hidden = true; } });
    const q = $('#q'); if (q) {
      q.addEventListener('input', () => suggest(q.value));
      q.addEventListener('keydown', e => { const items = $$('#sugg li'); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; sgi = (sgi + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((li, i) => li.setAttribute('aria-selected', i === sgi)); } else if (e.key === 'Enter' && sgi >= 0) { e.preventDefault(); pickSuggest(sgi); } });
      $('#sugg').addEventListener('click', e => { const li = e.target.closest('li'); if (li) pickSuggest(+li.dataset.i); });
      $('#search-form').addEventListener('submit', e => { e.preventDefault(); $('#sugg').hidden = true; goSearch(q.value.trim()); });
    }
    const mn = $('#mon-name'); if (mn) mn.oninput = async () => { P.name = mn.value.slice(0, 16) || M3.data(P.monster).name; await saveProfile(); renderStatus(); };
    const mh = $('#mon-hue'); if (mh) mh.oninput = async () => { P.hue = +mh.value; await saveProfile(); refreshMonsters(); };
    const rf = $('#rem-form'); if (rf) rf.onsubmit = async e => { e.preventDefault(); const r = await getRem(); r.items.push({ id: 'r' + Date.now().toString(36), text: $('#rem-t').value.trim(), at: $('#rem-d').value }); await DB.put('progress', r); rf.reset(); renderCalPage(); };
    const es = $('#exp-scope'); if (es) es.onchange = renderExport;
    addEventListener('hashchange', () => { const m = /#read=(.+)$/.exec(location.hash); if (m) openReader(decodeURIComponent(m[1])); else closeModal(); });
    document.addEventListener('andu:articles', () => { renderAll(); const m = /#read=(.+)$/.exec(location.hash); if (m && $('#ov').hidden && S.byId[decodeURIComponent(m[1])]) openReader(decodeURIComponent(m[1])); });
    addEventListener('storage', ev => { if (ev.key === 'pesaner_user') renderUser(); });
  }

  /* ---------- init ---------- */
  async function init() {
    applyI18n(); await DB.ready; await loadProfile();
    const qs = new URLSearchParams(location.search); S.q = qs.get('q') || ''; S.cat = C.CATEGORIES.some(c => c.slug === qs.get('cat')) ? qs.get('cat') : ''; if ($('#q')) $('#q').value = S.q;
    mountMon($('#pf-mon'), { track: false }); dockMon = mountMon($('#dock-mon'), { auto: true });
    const nav = $('[data-nav="' + (view === 'page' ? 'home' : view) + '"]'); if (nav) nav.setAttribute('aria-current', 'page');
    if (view !== 'home') $('#fab-back').hidden = false;
    wire(); GAS.load(); renderUser(); renderChannels(); renderStatus(); renderMission();
    setInterval(renderUtilDate, 60000); utilWidgets();
    const art = $('.read[data-id]'); if (art) { const meta = { id: art.dataset.id, source: 'jekyll', cat: art.dataset.catSlug, title: art.dataset.title, title_en: art.dataset.titleEn, author: '' }; bindReader({ art: meta, root: art, body: $('#postbody'), scroller: null, bar: $('#rbar-i') }); }
    await loadArticles(); renderAll(); reveal();
    GAS.ensure().then(() => { renderUser(); return GAS.refreshMe(); }).then(renderUser).catch(() => {});
    const hm = /#read=(.+)$/.exec(location.hash); if (hm) openReader(decodeURIComponent(hm[1])); else if (location.hash === '#jelajah' && $('#q')) $('#q').focus();
    checkReminders(); setInterval(checkReminders, 60000);
    if (view === 'home' && !P.onboarded && !hm) setTimeout(() => openTour(0), 900);
    setTimeout(tip, 2500); setInterval(tip, 32000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
