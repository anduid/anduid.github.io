(function () {
  var tombol = document.getElementById('tombol-tema');
  if (!tombol) return;
  tombol.addEventListener('click', function () {
    var sekarang = document.documentElement.getAttribute('data-tema') === 'gelap' ? 'terang' : 'gelap';
    document.documentElement.setAttribute('data-tema', sekarang);
    try { localStorage.setItem('tema', sekarang); } catch (e) {}
  });
})();
