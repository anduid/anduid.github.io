/* ANDU Admin – penghubung ke backend + modul Pembayaran. Dipanggil lewat window.adminInstall setelah init. */
(function () {
  var C = window.AnduCore;
  if (!C || !C.gas) { console.info('ANDU Admin: gas_url kosong, memakai mode demo lokal.'); return; }
  var esc = C.esc, SC = {}, lastClaimed = -1, payTimer = null, payRows = [];
  var num = function (v) { return parseInt(String(v).replace(/[^\d]/g, ''), 10) || 0; };
  var $ = function (s) { return document.querySelector(s); };
  var fld = 'bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary w-full';

  /* ---------- gerbang login superadmin ---------- */
  function gate() {
    return new Promise(function (ok) {
      var tk = C.tok();
      if (tk && tk.admin) return ok();
      var g = document.createElement('div');
      g.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur';
      g.innerHTML = '<form class="bg-surface-container rounded-xl p-6 w-full max-w-sm flex flex-col gap-3"><h2 class="font-headline-md text-headline-md text-on-surface">Superadmin ANDU</h2>' +
        '<input name="un" required placeholder="Username" class="' + fld + '"><input name="pw" type="password" required placeholder="Password" class="' + fld + '">' +
        '<p id="gerr" class="text-xs text-red-400"></p><button class="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-bold">Masuk</button></form>';
      document.body.appendChild(g);
      g.querySelector('form').onsubmit = function (e) {
        e.preventDefault(); var f = e.target;
        C.call('authLogin', { username: f.un.value, password: f.pw.value }).then(function (j) {
          if (!j.user.admin) { C.clear(); throw new Error('Akun ini bukan superadmin.'); }
          C.session(j); g.remove(); ok();
        }).catch(function (err) { $('#gerr').textContent = err.message; });
      };
    });
  }

  /* ---------- pemetaan server <-> bentuk data admin ---------- */
  var titleCase = function (s) { return s ? s.charAt(0) + s.slice(1).toLowerCase() : s; };
  async function load() {
    var r = await Promise.all([C.call('adminCatalogList'), C.call('adminMembers', {}), C.call('adminPartners'), C.call('adminProjects', {})]);
    SC = {}; r[0].items.forEach(function (c) { SC[c.id] = c; });
    var by = function (t) { return r[0].items.filter(function (c) { return c.type === t; }); };
    cacheData.products = by('product').map(function (c) { return { id: c.id, title: c.title, category: c.category || 'SaaS', price: c.price ? C.rp(c.price) : 'Rp0', version: c.version || '1.0.0', targetSdk: c.targetSdk || 'API 35 (Android 15)', icon: c.matIcon || 'layers' }; });
    cacheData.services = by('service').map(function (c) { return { id: c.id, name: c.title, sla: c.sla || '7 Days', rate: c.rate || '-', status: c.status || 'Active' }; });
    cacheData.courses = by('course').map(function (c) { return { id: c.id, title: c.title, level: c.level || 'Beginner', modules: (c.modules || []).length, price: c.price ? C.rp(c.price) : 'Rp0', cert: !!c.cert }; });
    cacheData.partners = r[2].partners.map(function (p) { return { id: p.id, name: p.name + (p.org ? ' (' + p.org + ')' : ''), type: titleCase(p.type), commission: p.commission || 0, status: titleCase(p.status) }; });
    cacheData.members = r[1].members.map(function (m) { return { id: m.username, name: m.name || m.username, email: m.email || '-', plan: m.plan, licenses: m.licenses, status: m.active ? 'Active' : 'Free' }; });
    cacheData.posts = (window.ANDU && window.ANDU.posts || []).map(function (p) { return { id: p.slug, title: p.title, category: p.tags[0] || 'Post', author: 'andu', views: '-', date: String(p.date).slice(0, 10) }; });
    renderAllViews();
  }
  var done = function (msg) { closeCrudModal(); return load().then(function () { showToast(msg, 'success'); }); };

  /* ---------- CRUD ke server ---------- */
  async function saveCatalog(it) { var j = await C.call('adminCatalogSave', { item: it }); return j; }
  window.handleCrudFormSubmit = async function (ev) {
    ev.preventDefault();
    var f = ev.target, entity = $('#crud-input-entity').value, id = $('#crud-input-id').value, v = {};
    new FormData(f).forEach(function (val, k) { v[k] = val; });
    try {
      if (entity === 'products') {
        var ex = SC[id] || {};
        await saveCatalog(Object.assign({}, ex, { id: id || undefined, type: 'product', title: v.title, price: num(v.price), category: v.category, version: v.version, targetSdk: v.targetSdk, matIcon: v.icon || ex.matIcon || 'layers' }));
        return done('Produk disimpan & katalog disinkronkan.');
      }
      if (entity === 'services') {
        var es = SC[id] || {};
        await saveCatalog(Object.assign({}, es, { id: id || undefined, type: 'service', title: v.name, price: 0, sla: v.sla, rate: v.rate, status: v.status }));
        return done('Layanan disimpan.');
      }
      if (entity === 'courses') {
        var ec = SC[id] || {}, n = Math.max(1, parseInt(v.modules, 10) || 1), mods = ec.modules || [];
        if (mods.length !== n) mods = Array.from({ length: n }, function (_, i) { return mods[i] || { id: i + 1, title: 'Modul ' + (i + 1), xp: 100 }; });
        await saveCatalog(Object.assign({}, ec, { id: id || undefined, type: 'course', title: v.title, price: num(v.price), level: v.level, modules: mods, cert: !!(f.elements.cert && f.elements.cert.checked) }));
        return done('Kelas disimpan.');
      }
      if (entity === 'partners') {
        if (!id) return showToast('Kemitraan dibuat dari formulir publik; di sini hanya ubah status.', 'info');
        await C.call('adminPartnerUpdate', { id: id, status: String(v.status).toUpperCase() === 'ACTIVE' ? 'ACTIVE' : String(v.status).toUpperCase() === 'PENDING' ? 'PENDING' : 'REJECTED', commission: parseInt(v.commission, 10) || 0 });
        return done('Status mitra diperbarui.');
      }
      if (entity === 'posts') {
        var j = await C.call('adminPublishPost', { title: v.title, description: v.description, tags: v.tags || v.category, body: v.body });
        closeCrudModal();
        showToast(j.github && j.github.skipped ? 'GH_TOKEN belum diisi: artikel belum terbit.' : 'Terbit ke GitHub. Situs diperbarui setelah build (±2 menit).', j.github && j.github.skipped ? 'error' : 'success');
        return;
      }
      showToast('Anggota dikelola otomatis dari pembelian/paket. Gunakan modul Pembayaran untuk poin.', 'info'); closeCrudModal();
    } catch (e) { showToast(e.message, 'error'); }
  };
  window.confirmDeleteRecord = async function (entity, id) {
    if (['products', 'services', 'courses'].indexOf(entity) < 0) return showToast('Entitas ini tidak dapat dihapus dari konsol (hapus file di GitHub untuk artikel).', 'info');
    if (!confirm('Hapus ' + id + ' dari katalog?')) return;
    try { await C.call('adminCatalogDelete', { id: id }); await load(); showToast('Dihapus & katalog disinkronkan.', 'info'); } catch (e) { showToast(e.message, 'error'); }
  };
  var _inj = window.injectFormFields;
  window.injectFormFields = function (entity, item) {
    _inj(entity, item);
    if (entity !== 'posts') return;
    $('#crud-dynamic-fields').insertAdjacentHTML('beforeend',
      '<label class="flex flex-col gap-1"><span class="font-label-md text-on-surface-variant">Meta description (min. 50 karakter)</span><input name="description" required minlength="50" maxlength="160" class="' + fld + '"></label>' +
      '<label class="flex flex-col gap-1"><span class="font-label-md text-on-surface-variant">Tag (pisah koma)</span><input name="tags" class="' + fld + '"></label>' +
      '<label class="flex flex-col gap-1"><span class="font-label-md text-on-surface-variant">Isi artikel (Markdown)</span><textarea name="body" required rows="8" class="' + fld + '"></textarea></label>');
  };

  /* ---------- modul Pembayaran ---------- */
  var STAT = { CLAIMED: 'bg-tertiary-container text-on-tertiary-container', PENDING: 'bg-surface-container-high text-on-surface-variant', APPROVED: 'bg-primary-container text-on-primary-container', REJECTED: 'bg-error-container text-on-error-container', EXPIRED: 'bg-surface-container-high text-on-surface-variant', CANCELLED: 'bg-surface-container-high text-on-surface-variant' };
  function addModule() {
    if ($('#view-payments')) return;
    var src = document.querySelector('.module-tab-btn[data-view="members"]'), btn = src.cloneNode(true);
    btn.setAttribute('data-view', 'payments'); btn.querySelector('.material-symbols-outlined').textContent = 'payments';
    btn.querySelector('[data-i18n]').removeAttribute('data-i18n'); btn.querySelector('.font-body-md').textContent = 'Pembayaran (QRIS)';
    var bd = btn.querySelector('[id^=badge-count]'); bd.id = 'badge-count-payments'; bd.textContent = '0';
    src.parentNode.insertBefore(btn, src);
    btn.addEventListener('click', function () { switchModule('payments'); });
    var sec = document.createElement('section');
    sec.className = 'view-panel hidden flex flex-col gap-gutter'; sec.id = 'view-payments';
    sec.innerHTML = '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm"><div><h2 class="font-headline-lg text-headline-lg text-on-surface">Verifikasi Pembayaran</h2>' +
      '<p class="font-body-md text-body-md text-on-surface-variant">Cocokkan nominal unik dengan mutasi. Lebihan nominal otomatis menjadi poin member.</p></div>' +
      '<button class="px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface font-label-md" id="pay-points">Sesuaikan poin</button></div>' +
      '<div class="grid grid-cols-2 lg:grid-cols-4 gap-space-sm" id="pay-kpi"></div>' +
      '<div class="flex flex-wrap gap-space-sm p-space-sm rounded-xl bg-surface-container-low"><select id="pay-status" class="' + fld + ' !w-auto"><option value="">Semua status</option><option value="CLAIMED">Menunggu verifikasi</option><option value="PENDING">Belum dibayar</option><option value="APPROVED">Disetujui</option><option value="REJECTED">Ditolak</option><option value="EXPIRED">Kedaluwarsa</option></select>' +
      '<input id="pay-q" placeholder="Cari kode, user, nominal…" class="' + fld + ' flex-1 min-w-[180px]"></div>' +
      '<div class="rounded-xl bg-surface-container-low shadow-md overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-left border-collapse"><thead class="bg-surface-container-high/80 text-on-surface-variant font-label-md uppercase font-mono"><tr>' +
      ['Kode', 'User', 'Item', 'Total (kode unik)', 'Status', 'Aksi'].map(function (h) { return '<th class="py-space-md px-space-md">' + h + '</th>'; }).join('') +
      '</tr></thead><tbody class="divide-y divide-surface-container-high/40 font-body-md text-on-surface" id="pay-body"></tbody></table></div></div>';
    $('#view-members').parentNode.insertBefore(sec, $('#view-members'));
    $('#pay-status').onchange = loadPay; $('#pay-q').oninput = function () { clearTimeout(window.__pq); window.__pq = setTimeout(loadPay, 300); };
    $('#pay-points').onclick = adjustPoints;
    var _sw = window.switchModule;
    window.switchModule = function (v) { _sw(v); clearInterval(payTimer); if (v === 'payments') { loadPay(); payTimer = setInterval(loadPay, 45000); } };
  }
  async function loadPay() {
    try {
      var r = await Promise.all([C.call('adminInvoices', { status: $('#pay-status').value, q: $('#pay-q').value }), C.call('adminDashboard')]);
      payRows = r[0].invoices; var d = r[1], c = d.counts || {};
      $('#badge-count-payments').textContent = c.CLAIMED || 0;
      $('#pay-kpi').innerHTML = [['Menunggu verifikasi', c.CLAIMED || 0], ['Pendapatan bulan ini', C.rp(d.revenueMonth)], ['Total pendapatan', C.rp(d.revenueAll)], ['Poin beredar', C.rp(d.pointsOutstanding)]]
        .map(function (k) { return '<div class="rounded-xl bg-surface-container-low p-space-md"><div class="font-label-sm text-on-surface-variant">' + k[0] + '</div><div class="font-headline-md text-on-surface font-mono">' + k[1] + '</div></div>'; }).join('');
      $('#pay-body').innerHTML = payRows.length ? payRows.map(function (i, x) {
        var act = i.status === 'CLAIMED' || i.status === 'PENDING' || i.status === 'EXPIRED' ? '<button class="px-3 py-1 rounded bg-primary-container text-on-primary-container font-bold text-xs" onclick="anduApprove(' + x + ')">Setujui</button> <button class="px-3 py-1 rounded bg-error-container text-on-error-container text-xs" onclick="anduReject(' + x + ')">Tolak</button>' : '<span class="text-xs text-on-surface-variant">' + esc(i.adminNote || '') + '</span>';
        return '<tr><td class="py-space-sm px-space-md font-mono text-xs">' + esc(i.code) + '<div class="text-on-surface-variant">' + esc((i.claimedAt || i.createdAt).slice(0, 16).replace('T', ' ')) + '</div></td>' +
          '<td class="py-space-sm px-space-md">' + esc(i.name) + '<div class="text-xs text-on-surface-variant">@' + esc(i.username) + (i.payerName ? ' · pengirim: ' + esc(i.payerName) : '') + '</div></td>' +
          '<td class="py-space-sm px-space-md text-xs">' + esc(i.itemTitle) + '</td>' +
          '<td class="py-space-sm px-space-md font-mono"><b>' + C.rp(i.total) + '</b><div class="text-xs text-on-surface-variant">pokok ' + C.rp(i.baseNet) + ' + ' + i.uniqueCode + '</div></td>' +
          '<td class="py-space-sm px-space-md"><span class="px-2 py-0.5 rounded text-xs font-mono ' + (STAT[i.status] || '') + '">' + i.status + '</span></td><td class="py-space-sm px-space-md whitespace-nowrap">' + act + '</td></tr>';
      }).join('') : '<tr><td colspan="6" class="py-space-lg px-space-md text-center text-on-surface-variant">Belum ada tagihan.</td></tr>';
      if (lastClaimed >= 0 && (c.CLAIMED || 0) > lastClaimed) { showToast('Konfirmasi pembayaran baru masuk.', 'success'); try { if ('Notification' in window && Notification.permission === 'granted') new Notification('ANDU Admin', { body: 'Ada pembayaran menunggu verifikasi.' }); } catch (e) {} }
      lastClaimed = c.CLAIMED || 0;
    } catch (e) { showToast(e.message, 'error'); }
  }
  window.anduApprove = function (x) {
    var i = payRows[x], m = document.createElement('div');
    m.className = 'fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur';
    m.innerHTML = '<form class="bg-surface-container rounded-xl p-6 w-full max-w-md flex flex-col gap-3"><h3 class="font-headline-md text-on-surface">Setujui ' + esc(i.code) + '</h3>' +
      '<p class="text-xs text-on-surface-variant">' + esc(i.name) + ' · ' + esc(i.itemTitle) + '<br>Tagihan: <b>' + C.rp(i.total) + '</b> (pokok ' + C.rp(i.baseNet) + ' + kode unik ' + i.uniqueCode + ')</p>' +
      '<label class="flex flex-col gap-1 text-xs text-on-surface-variant">Nominal diterima di mutasi<input id="ap-amt" type="number" min="0" value="' + i.total + '" class="' + fld + '"></label>' +
      '<p class="text-sm text-on-surface">Lebihan jadi poin: <b id="ap-ex" class="font-mono"></b></p>' +
      '<label class="flex items-center gap-2 text-xs text-on-surface-variant"><input id="ap-force" type="checkbox"> Paksa setujui walau kurang dari pokok</label>' +
      '<input id="ap-note" placeholder="Catatan (opsional)" class="' + fld + '"><p id="ap-err" class="text-xs text-red-400"></p>' +
      '<div class="flex gap-2"><button class="flex-1 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-bold">Setujui</button><button type="button" id="ap-x" class="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface">Batal</button></div></form>';
    document.body.appendChild(m);
    var calc = function () { $('#ap-ex').textContent = C.rp(Math.max(0, (+$('#ap-amt').value || 0) - i.baseNet)); }; calc();
    $('#ap-amt').oninput = calc; $('#ap-x').onclick = function () { m.remove(); };
    m.querySelector('form').onsubmit = async function (e) {
      e.preventDefault();
      try { await C.call('adminApprove', { code: i.code, receivedAmount: +$('#ap-amt').value, force: $('#ap-force').checked, note: $('#ap-note').value }); m.remove(); showToast('Disetujui & item diaktifkan.', 'success'); loadPay(); }
      catch (err) { $('#ap-err').textContent = err.message; }
    };
  };
  window.anduReject = async function (x) {
    var why = prompt('Alasan penolakan:', 'Pembayaran tidak ditemukan di mutasi'); if (why === null) return;
    try { await C.call('adminReject', { code: payRows[x].code, reason: why }); showToast('Ditolak.', 'info'); loadPay(); } catch (e) { showToast(e.message, 'error'); }
  };
  async function adjustPoints() {
    var u = prompt('Username member:'); if (!u) return; var d = prompt('Jumlah poin (negatif untuk mengurangi):'); if (!d) return; var why = prompt('Alasan:', 'Penyesuaian admin') || '';
    try { var j = await C.call('adminAdjustPoints', { username: u, delta: +d, reason: why }); showToast('Poin sekarang: ' + C.rp(j.points), 'success'); } catch (e) { showToast(e.message, 'error'); }
  }

  window.adminInstall = async function () {
    var ind = document.getElementById('idb-status-indicator'); if (ind) ind.innerText = 'API: ONLINE';
    await gate(); addModule();
    try { await load(); loadPay(); } catch (e) { showToast(e.message, 'error'); }
  };
})();
