(function () {
  var root = document.documentElement;

  // Ganti tema
  var tema = document.getElementById('tombol-tema');
  if (tema) {
    tema.addEventListener('click', function () {
      var baru = root.getAttribute('data-tema') === 'gelap' ? 'terang' : 'gelap';
      root.setAttribute('data-tema', baru);
      try { localStorage.setItem('tema', baru); } catch (e) {}
    });
  }

  // Menu di layar kecil
  var tombol = document.getElementById('tombol-menu');
  var menu = document.getElementById('menu');
  if (tombol && menu) {
    tombol.addEventListener('click', function () {
      var buka = menu.classList.toggle('terbuka');
      tombol.setAttribute('aria-expanded', buka ? 'true' : 'false');
      tombol.setAttribute('aria-label', buka ? 'Tutup menu' : 'Buka menu');
      tombol.querySelector('use').setAttribute('href', buka ? '#i-close' : '#i-menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('terbuka')) tombol.click();
    });
  }

  // Salin tautan
  document.querySelectorAll('[data-salin]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-salin');
      var label = b.querySelector('span');
      function selesai() {
        if (!label) return;
        var asal = label.textContent;
        label.textContent = 'Tautan disalin';
        setTimeout(function () { label.textContent = asal; }, 2000);
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(selesai);
      } else {
        var t = document.createElement('textarea');
        t.value = url; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); selesai(); } catch (e) {}
        document.body.removeChild(t);
      }
    });
  });
})();
