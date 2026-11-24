/* AnduDB – wrapper IndexedDB (articles, progress, comments, bookmarks, notes). Fallback memori jika IndexedDB tidak tersedia. */
(function () {
  const STORES = { articles: 'id', progress: 'key', comments: 'id', bookmarks: 'id', notes: 'id' };
  class AnduDB {
    constructor() { this.name = 'andu_news_v2'; this.db = null; this.mem = {}; Object.keys(STORES).forEach(s => this.mem[s] = new Map()); this.ready = this._open(); }
    _open() {
      return new Promise(res => {
        if (!window.indexedDB) return res(null);
        let rq;
        try { rq = indexedDB.open(this.name, 1); } catch (e) { return res(null); }
        rq.onupgradeneeded = () => {
          const d = rq.result;
          Object.keys(STORES).forEach(s => { if (!d.objectStoreNames.contains(s)) { const st = d.createObjectStore(s, { keyPath: STORES[s] }); if (s === 'comments' || s === 'bookmarks') st.createIndex('article', 'article', { unique: false }); } });
        };
        rq.onsuccess = () => { this.db = rq.result; res(this.db); };
        rq.onerror = () => res(null);
        rq.onblocked = () => res(null);
      });
    }
    async _tx(store, mode, fn) {
      await this.ready;
      if (!this.db) return fn(null, true);
      return new Promise((res, rej) => {
        const tx = this.db.transaction(store, mode), st = tx.objectStore(store);
        let out; try { out = fn(st, false); } catch (e) { return rej(e); }
        tx.oncomplete = () => res(out && out.__rq ? out.__rq.result : out);
        tx.onerror = tx.onabort = () => rej(tx.error);
      });
    }
    _rq(r) { return { __rq: r }; }
    async get(store, key) { return this._tx(store, 'readonly', (st, mem) => mem ? this.mem[store].get(key) : this._rq(st.get(key))); }
    async getAll(store) { return this._tx(store, 'readonly', (st, mem) => mem ? Array.from(this.mem[store].values()) : this._rq(st.getAll())); }
    async put(store, val) { return this._tx(store, 'readwrite', (st, mem) => { if (mem) this.mem[store].set(val[STORES[store]], val); else st.put(val); return val; }); }
    async putMany(store, vals) { return this._tx(store, 'readwrite', (st, mem) => { vals.forEach(v => { if (mem) this.mem[store].set(v[STORES[store]], v); else st.put(v); }); return vals.length; }); }
    async del(store, key) { return this._tx(store, 'readwrite', (st, mem) => { if (mem) this.mem[store].delete(key); else st.delete(key); return true; }); }
    async byArticle(store, id) { const all = await this.getAll(store); return all.filter(x => x.article === id); }
    async clear(store) { return this._tx(store, 'readwrite', (st, mem) => { if (mem) this.mem[store].clear(); else st.clear(); return true; }); }
  }
  window.AnduDB = AnduDB;
  window.anduDB = new AnduDB();
})();
