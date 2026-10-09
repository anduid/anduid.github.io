(function () {
  var kolom = document.getElementById('kolom-cari');
  var daftar = document.getElementById('hasil-cari');
  var status = document.getElementById('status-cari');
  var indeks = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  fetch(window.URL_INDEKS).then(function (r) { return r.json(); }).then(function (data) {
    indeks = data;
    var q = new URLSearchParams(location.search).get('q');
    if (q) { kolom.value = q; cari(); }
  }).catch(function () { status.textContent = 'Indeks pencarian gagal dimuat.'; });

  function cari() {
    var q = kolom.value.trim().toLowerCase();
    daftar.innerHTML = '';
    if (!q) { status.textContent = ''; return; }
    var kata = q.split(/\s+/);
    var hasil = indeks.filter(function (p) {
      var teks = (p.title + ' ' + p.content).toLowerCase();
      return kata.every(function (k) { return teks.indexOf(k) !== -1; });
    });
    status.textContent = hasil.length ? hasil.length + ' tulisan ditemukan' : 'Tidak ada tulisan yang cocok dengan "' + q + '".';
    daftar.innerHTML = hasil.map(function (p) {
      return '<li><time>' + esc(p.date) + '</time><span><a href="' + esc(p.url) + '">' + esc(p.title) + '</a><br><small>' + esc(p.excerpt) + '</small></span></li>';
    }).join('');
  }
  kolom.addEventListener('input', cari);
})();
