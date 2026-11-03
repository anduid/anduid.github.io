/* ANDU – klien kecil untuk backend Google Apps Script (Code.gs).
   Memanggil POST text/plain berisi JSON agar tidak memicu preflight CORS. */
(function () {
  var A = window.ANDU || {}, TK = 'andu_tok';
  var C = {
    gas: A.gas || '',
    tok: function () { try { var t = JSON.parse(localStorage.getItem(TK) || 'null'); return t && t.exp > Date.now() ? t : null; } catch (e) { return null; } },
    clear: function () { try { localStorage.removeItem(TK); } catch (e) {} },
    session: function (j) {
      try { localStorage.setItem(TK, JSON.stringify({ token: j.token, exp: Date.now() + 6.9 * 864e5, username: j.user.username, name: j.user.name, admin: !!j.user.admin })); } catch (e) {}
      return j;
    },
    call: function (action, data) {
      if (!C.gas) return Promise.reject(new Error('Backend belum dikonfigurasi (gas_url di _config.yml).'));
      var t = C.tok();
      return fetch(C.gas, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(Object.assign({ action: action, token: t && t.token }, data || {})) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.code === 'AUTH') C.clear();
          if (!j.ok) { var e = new Error(j.message || 'Gagal'); e.code = j.code; throw e; }
          return j;
        });
    },
    rp: function (n) { return 'Rp' + Number(n || 0).toLocaleString('id-ID'); },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    qr: function (el, text) {
      var go = function () { el.innerHTML = ''; new window.QRCode(el, { text: text, width: 208, height: 208, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M }); };
      if (window.QRCode) return go();
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = go; s.onerror = function () { el.textContent = 'QR gagal dimuat. Salin kode QRIS di bawah.'; };
      document.head.appendChild(s);
    }
  };
  window.AnduCore = C;
})();
