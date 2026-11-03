/* ANDU Terminal – penghubung ke backend. Dipanggil dari bootstrapDatabase() lewat window.anduBoot. */
(function () {
  var C = window.AnduCore;
  if (!C || !C.gas) { console.info('ANDU Terminal: gas_url kosong, memakai mode demo lokal.'); return; }
  var CAT = (window.ANDU && window.ANDU.catalog) || [];
  var byId = function (id) { return CAT.filter(function (c) { return c.id === id; })[0] || {}; };
  var toLogin = function () { location.replace('/portal/?login=1'); return new Promise(function () {}); };
  var lastTs = '';

  window.anduInstall = function () {
    window.simulateBuyLicense = function () { location.href = '/portal/#products'; };
    window.simulateNewProject = function () { location.href = '/portal/#services'; };
    window.bumpProjectProgress = function () { showToast('Progres proyek diperbarui oleh tim ANDU setiap sprint.', '🛠️'); };
    window.advanceCourseLesson = async function (id) {
      var it = byId(id), c = (await dbGetAll('courses')).filter(function (x) { return x.id === id; })[0];
      if (!it.modules || !c) return;
      var next = it.modules.filter(function (m) { return (c.done || []).indexOf(m.id) < 0; })[0];
      if (!next) return;
      if (it.quiz && it.quiz.module === next.id) { showToast('Ujian akhir dikerjakan di portal utama (tab Ruang Belajar).', '📝'); return; }
      try { await C.call('markModule', { courseId: id, moduleId: next.id }); await window.anduBoot(true); showToast('Modul selesai: ' + next.title, '📚'); }
      catch (e) { showToast(e.message, '⚠️'); }
    };
    window.downloadSourceFile = async function (name) {
      var l = (await dbGetAll('licenses')).filter(function (x) { return x.product === name; })[0];
      if (l && l.url) window.open(l.url, '_blank', 'noopener'); else showToast('Unduhan belum tersedia. Hubungi tim ANDU.', 'ℹ️');
    };
    var _dl = window.downloadCourseCertificate;
    window.downloadCourseCertificate = async function (title) {
      var c = (await dbGetAll('courses')).filter(function (x) { return x.title === title; })[0];
      try { var j = await C.call('issueCert', { courseId: c && c.id }); window.__cc = j.certificate; _dl(title); } catch (e) { showToast(e.message, '⚠️'); }
    };
    window.handleUpdateProfile = async function (ev) {
      ev.preventDefault();
      try {
        var n = document.getElementById('set-input-name').value, em = document.getElementById('set-input-email').value;
        await C.call('setProfile', { name: n, email: em }); currentUser.name = n; currentUser.email = em;
        await dbPut('user', currentUser); updateUserUI(); showToast('Profil disimpan.', '✅');
      } catch (e) { showToast(e.message, '⚠️'); }
    };
    var h = document.getElementById('user-display-name');
    if (h && !document.getElementById('andu-logout')) {
      var b = document.createElement('button');
      b.id = 'andu-logout'; b.textContent = 'Keluar'; b.className = 'ml-3 text-xs underline text-slate-400 hover:text-white';
      b.onclick = function () { C.clear(); location.href = '/portal/'; };
      h.parentNode.appendChild(b);
    }
    setInterval(poll, 60000);
  };

  async function poll() {
    if (!C.tok()) return;
    try {
      var j = await C.call('myNotifs', { since: lastTs }), fresh = j.notifs.filter(function (n) { return !lastTs || n.ts > lastTs; });
      if (!fresh.length) return;
      lastTs = fresh[0].ts;
      for (var n of fresh.slice().reverse()) {
        await addNotification(n.title, n.body);
        try { if ('Notification' in window && Notification.permission === 'granted') new Notification('ANDU – ' + n.title, { body: n.body }); } catch (e) {}
      }
      window.anduBoot(true);
    } catch (e) {}
  }

  window.anduBoot = async function (silent) {
    var tk = C.tok(); if (!tk) return toLogin();
    var m;
    try { m = await C.call('me'); } catch (e) { return toLogin(); }
    for (var s of ['user', 'licenses', 'projects', 'courses', 'notifications']) await dbClear(s);
    currentUser = { id: 'me', name: tk.name, email: m.status.email || '', role: tk.admin ? 'SUPERADMIN' : 'MEMBER' };
    await dbPut('user', currentUser);
    for (var l of m.licenses) { var p = byId(l.productId); await dbPut('licenses', { id: l.id, product: l.product, category: l.category || 'License', key: l.key, version: l.version || '', price: p.price || 0, date: Date.parse(l.createdAt), url: l.downloadUrl || '' }); }
    for (var pr of m.projects) {
      var step = (pr.milestones.filter(function (x) { return !x.done; })[0] || {}).t || pr.status;
      await dbPut('projects', { id: pr.id, title: pr.title, client: tk.name, progress: pr.progress, sprint: step, date: Date.parse(pr.createdAt) });
    }
    for (var c of m.courses) await dbPut('courses', { id: c.courseId, title: c.courseTitle, progress: c.progress, level: byId(c.courseId).level || '', done: c.done });
    for (var n of m.feed.slice().reverse()) await dbPut('notifications', { title: n.title, desc: n.body, time: Date.parse(n.ts), read: n.read ? 1 : 0 });
    lastTs = m.feed.length ? m.feed[0].ts : lastTs;
    if (silent) { updateUserUI(); renderAllViews(); refreshNotificationBadge(); }
  };
})();
