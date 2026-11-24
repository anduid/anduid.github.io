/* GAS – jembatan sesi Pesaner (pesaner_user) dan Code.gs. Semua pemanggilan aman: tanpa URL / offline → mode lokal. */
(function () {
  const C = window.ANDU_CONFIG, KEY = 'andu_gas_session', CAT_BY_GAS = {};
  C.CATEGORIES.forEach(c => CAT_BY_GAS[c.gas] = c.slug);
  const GAS = {
    enabled: !!(C.GAS_WEBAPP_URL && /^https?:\/\//.test(C.GAS_WEBAPP_URL)),
    session: null,
    slugOf(gasCat) { return CAT_BY_GAS[gasCat] || 'lain'; },
    gasCatOf(slug) { const c = C.CATEGORIES.find(x => x.slug === slug); return c ? c.gas : 'Teknologi'; },
    async call(action, data, post) {
      if (!GAS.enabled) throw new Error('offline');
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
      try {
        const body = Object.assign({ action }, data || {}); if (GAS.session && GAS.session.token && !body.token) body.token = GAS.session.token;
        let r;
        if (post) r = await fetch(C.GAS_WEBAPP_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl.signal, redirect: 'follow' });
        else { const q = new URLSearchParams(); Object.keys(body).forEach(k => { if (body[k] !== undefined && body[k] !== null && body[k] !== '') q.set(k, body[k]); }); r = await fetch(C.GAS_WEBAPP_URL + '?' + q.toString(), { signal: ctl.signal, redirect: 'follow' }); }
        const j = await r.json();
        if (!j.success) { const e = new Error(j.message || 'Gagal'); e.code = j.code; throw e; }
        return j;
      } finally { clearTimeout(to); }
    },
    pesanerUser() { try { const u = JSON.parse(localStorage.getItem('pesaner_user') || 'null'); return u && (u.username || u.id) ? u : null; } catch (e) { return null; } },
    load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.token && s.exp > Date.now()) GAS.session = s; else localStorage.removeItem(KEY); } catch (e) {} return GAS.session; },
    save(token, verified, user) { GAS.session = { token, verified: !!verified, user, exp: Date.now() + 6 * 24 * 3600 * 1000 }; try { localStorage.setItem(KEY, JSON.stringify(GAS.session)); } catch (e) {} return GAS.session; },
    logout() { GAS.session = null; try { localStorage.removeItem(KEY); } catch (e) {} },
    /* Profil tampilan: sesi GAS → pesaner_user → null */
    display() {
      if (GAS.session && GAS.session.user) { const u = GAS.session.user; return { name: u.full_name || u.username, username: u.username, avatar: u.avatar_url, role: u.role, can_write: !!u.can_write, verified: GAS.session.verified, source: 'gas' }; }
      const p = GAS.pesanerUser(); if (!p) return null;
      return { name: p.nama || p.name || p.username || p.id, username: p.username || p.id, avatar: p.avatar, role: p.role, can_write: false, verified: false, source: 'pesaner' };
    },
    async ensure() {
      GAS.load(); if (GAS.session || !GAS.enabled) return GAS.session;
      const p = GAS.pesanerUser(); if (!p) return null;
      try { const j = await GAS.call('auth_sync_pesaner', { user: JSON.stringify({ username: p.username || p.id }) }, true); return GAS.save(j.token, false, j.user); } catch (e) { return null; }
    },
    async login(id, pw) { const j = await GAS.call('auth_login', { username: id, password: pw }, true); return GAS.save(j.token, true, j.user); },
    async register(o) { const j = await GAS.call('auth_register', o, true); return GAS.save(j.token, true, j.user); },
    async refreshMe() { if (!GAS.session) return null; try { const j = await GAS.call('get_me', {}); GAS.save(GAS.session.token, j.verified, j.user); } catch (e) { if (e.code === 401) GAS.logout(); } return GAS.session; },
    /* Artikel Sheets → bentuk portal */
    toPortal(a) {
      return { id: 'g-' + a.article_id, source: 'gas', gid: a.article_id, slug: a.slug, cat: GAS.slugOf(a.category), gasCat: a.category, title: a.title, title_en: a.title, lang_id: { title: a.title, excerpt: a.excerpt }, lang_en: { title: a.title, excerpt: a.excerpt },
        tags: a.tags || [], author: a.author_name, featured: !!a.is_featured, reading_time: Math.max(1, Math.ceil(((a.excerpt || '').split(/\s+/).length * 8) / C.WPM)), reading_time_en: 1, reads: a.views_count || 0, likes: a.likes_count || 0, image: a.cover_image || '', date: a.published_at || a.updated_at, status: a.status, url: '' };
    },
    async fetchArticles() { const out = []; for (let p = 1; p <= 3; p++) { const j = await GAS.call('get_articles', { page: p, page_size: 50 }); j.articles.forEach(a => out.push(GAS.toPortal(a))); if (p >= j.total_pages) break; } return out; },
    async fetchDetail(gid) { const j = await GAS.call('get_article_detail', { article_id: gid, no_count: 'true' }); return j; },
    submitArticle(a) { return GAS.call('save_article', { mode: 'submit', title: a.title, content_html: a.html, category: GAS.gasCatOf(a.cat), tags: (a.tags || []).join(','), excerpt: a.excerpt, cover_image: a.cover || '' }, true); },
    addComment(gid, text) { return GAS.call('post_comment', { article_id: gid, comment_text: text }, true); },
    toggle(gid, type) { return GAS.call('toggle_interaction', { article_id: gid, type }, true); }
  };
  window.GAS = GAS;
})();
