/* Bilah ekosistem andu.my.id: perilaku tambahan (tanpa pustaka).
   1) Disembunyikan di aplikasi terpasang (PWA/standalone) atau bila alamat memuat ?topbar=0 atau ?app=1
      (berguna untuk WebView aplikasi Android).
   2) Bila <body> berupa flex/grid, bilah dibuat melayang agar tata letak halaman tidak bergeser.
   3) Elemen position:fixed yang menempel di top:0 (header, sidebar) diturunkan sebesar tinggi bilah,
      lalu naik kembali mengikuti gulir, sama seperti perilaku bilah di /market. */
(function () {
  'use strict';
  var bar = document.getElementById('andu-topbar');
  if (!bar || bar.__atb) return;
  bar.__atb = 1;

  var sembunyi = /[?&](topbar=0|app=1)(&|#|$)/.test(location.search);
  try { if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) sembunyi = true; } catch (e) {}
  if (sembunyi) { bar.hidden = true; return; }

  var root = document.documentElement, H = 0, melayang = false, jadwal = 0;

  function ukur() {
    H = Math.round(bar.getBoundingClientRect().height) || H;
    root.style.setProperty('--andu-tb-h', H + 'px');
  }
  function geserVar() {
    var s = window.pageYOffset || root.scrollTop || 0;
    root.style.setProperty('--andu-off', Math.max(0, H - s) + 'px');
  }

  // Bilah di alur biasa hanya aman bila <body> berupa blok tanpa padding/margin di sisi atas dan samping.
  // Selain itu (flex/grid, padding, margin) bilah dibuat melayang di pojok atas dan <body> diberi padding-top
  // sebesar tinggi bilah, sehingga bilah selalu selebar layar dan tata letak halaman tidak berubah.
  function cekBody() {
    var b = document.body, cs = getComputedStyle(b);
    var d = cs.display;
    var perlu = d === 'flex' || d === 'inline-flex' || d === 'grid' || d === 'inline-grid' ||
      !dekat0(cs.paddingTop) || !dekat0(cs.paddingLeft) || !dekat0(cs.paddingRight) ||
      !dekat0(cs.marginTop) || !dekat0(cs.marginLeft) || !dekat0(cs.marginRight);
    if (melayang) { b.style.paddingTop = ''; cs = getComputedStyle(b); }  // baca padding asli halaman
    if (perlu) {
      melayang = true;
      bar.classList.add('atb-abs');
      b.style.paddingTop = ((parseFloat(cs.paddingTop) || 0) + H) + 'px';
    } else if (melayang) {
      melayang = false;
      bar.classList.remove('atb-abs');
    }
  }

  function dekat0(v) { return Math.abs(parseFloat(v)) < 1; }
  function turunkanFixed() {
    var els = document.body.getElementsByTagName('*');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.__atb || bar.contains(e)) continue;
      var cs = getComputedStyle(e);
      if (cs.position !== 'fixed' || !dekat0(cs.top)) continue;
      // Lapisan layar penuh (modal/overlay: top, right, bottom, left semuanya 0) dibiarkan.
      if (dekat0(cs.left) && dekat0(cs.right) && dekat0(cs.bottom)) continue;
      e.__atb = 1;
      e.style.setProperty('top', 'var(--andu-off, 0px)', 'important');
    }
  }

  function jalankan() { ukur(); cekBody(); turunkanFixed(); geserVar(); }

  ukur(); geserVar();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jalankan); else jalankan();
  window.addEventListener('load', jalankan);
  // Tailwind CDN dan skrip halaman bisa menerapkan kelas belakangan: periksa ulang sebentar.
  setTimeout(jalankan, 500);
  setTimeout(jalankan, 2000);

  window.addEventListener('scroll', function () {
    if (jadwal) return;
    jadwal = window.requestAnimationFrame(function () { jadwal = 0; geserVar(); });
  }, { passive: true });
  window.addEventListener('resize', function () { ukur(); cekBody(); geserVar(); });
})();
