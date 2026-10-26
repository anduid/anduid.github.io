---
layout: post
title: "Peta Interaktif UMKM dengan Leaflet dan OpenStreetMap"
description: "Tutorial membuat peta interaktif sebaran UMKM dengan Leaflet dan OpenStreetMap: marker, popup aman, filter, lokasi pengguna, atribusi, dan pertimbangan privasi."
date: 2026-10-17 01:00:00 +0700
tags: [leaflet, peta, javascript, tutorial]
apps: [siplokal]

# image: /assets/images/peta-umkm-leaflet.png
# image_alt: Peta interaktif dengan penanda lokasi usaha menggunakan Leaflet
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di peramban Anda, ambil tangkapan layar peta dengan data contoh (bukan data warga asli), dan tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Peta membuat data lokasi jauh lebih mudah dipahami: sebaran usaha, titik layanan, atau lokasi kegiatan langsung terlihat pola dan celahnya. Kabar baiknya, Anda tidak butuh layanan peta berbayar untuk memulai. Leaflet, pustaka JavaScript ringan, dan data peta OpenStreetMap cukup untuk peta interaktif yang rapi.

<!-- TAMBAHKAN (1-2 kalimat): proyek Anda yang memakai peta dan data apa yang dipetakan. -->

Tulisan ini membangun peta sebaran UMKM sederhana, lengkap dengan marker, popup yang aman, filter kategori, tombol lokasi pengguna, dan catatan tentang atribusi serta privasi.

<!--more-->

## Menyiapkan Leaflet

Muat CSS dan JavaScript Leaflet dari CDN. Sertakan atribut `integrity` agar berkas diverifikasi peramban, dan periksa nilai terbaru di [situs resmi Leaflet](https://leafletjs.com/download.html):

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin="">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>

<div id="peta" style="height: 420px" role="region" aria-label="Peta sebaran UMKM"></div>
```

Elemen peta **wajib punya tinggi** yang jelas. Tanpa itu, peta tidak terlihat. Atribut `role` dan `aria-label` membantu pembaca layar mengenali area peta.

## Membuat peta dasar

```js
const peta = L.map('peta').setView([-6.30, 106.96], 14); // lintang, bujur, zoom

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(peta);
```

Koordinat di atas hanya contoh. Ganti dengan pusat wilayah Anda. Perhatikan urutan koordinat Leaflet: **lintang dulu, baru bujur** (`[lat, lng]`). Banyak peta gagal tampil di tempat yang benar karena urutannya terbalik.

Atribusi OpenStreetMap wajib ditampilkan. Jangan menghapusnya.

## Menyiapkan data

Simpan data dalam bentuk daftar objek sederhana. Contoh data karangan:

```js
const umkm = [
  { id: 'u1', nama: 'Warung Contoh A', kategori: 'Kuliner', lat: -6.3021, lng: 106.9610 },
  { id: 'u2', nama: 'Kriya Contoh B',  kategori: 'Kriya',   lat: -6.3075, lng: 106.9652 },
  { id: 'u3', nama: 'Jasa Contoh C',   kategori: 'Jasa',    lat: -6.3090, lng: 106.9690 }
];
```

Pada aplikasi nyata, data ini berasal dari server atau Google Sheets. Penataan tabelnya dibahas di [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/blog/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/). Pastikan lintang dan bujur disimpan sebagai angka, bukan teks.

## Menambahkan marker dan popup yang aman

Popup menerima HTML. Jika nama usaha berasal dari input pengguna, **jangan memasukkannya mentah-mentah**, karena itu membuka celah XSS. Buat fungsi pengaman dan pakai untuk semua teks dari luar:

```js
function esc(teks) {
  return String(teks == null ? '' : teks)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const lapisan = L.layerGroup().addTo(peta);

function gambarMarker(daftar) {
  lapisan.clearLayers();
  daftar.forEach(function (u) {
    if (!isFinite(u.lat) || !isFinite(u.lng)) return; // lewati koordinat rusak
    L.marker([u.lat, u.lng])
      .bindPopup('<strong>' + esc(u.nama) + '</strong><br>' + esc(u.kategori))
      .addTo(lapisan);
  });
}

gambarMarker(umkm);
```

Pemeriksaan `isFinite` mencegah satu data rusak menghentikan seluruh peta. Kebiasaan keamanan lain ada di [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/blog/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

<!-- TAMBAHKAN: kendala yang Anda temui, misalnya koordinat terbalik atau peta tidak muncul karena tinggi elemen. -->

## Menyesuaikan tampilan awal dengan fitBounds

Daripada menebak zoom, biarkan peta menyesuaikan diri dengan semua marker:

```js
function sesuaikan(daftar) {
  const titik = daftar
    .filter(function (u) { return isFinite(u.lat) && isFinite(u.lng); })
    .map(function (u) { return [u.lat, u.lng]; });
  if (titik.length) peta.fitBounds(titik, { padding: [30, 30], maxZoom: 16 });
}
sesuaikan(umkm);
```

## Filter berdasarkan kategori

Hubungkan menu pilihan dengan fungsi `gambarMarker`:

```html
<label for="filter">Kategori</label>
<select id="filter">
  <option value="">Semua</option>
  <option>Kuliner</option>
  <option>Kriya</option>
  <option>Jasa</option>
</select>
```

```js
document.getElementById('filter').addEventListener('change', function (e) {
  const k = e.target.value;
  const hasil = k ? umkm.filter(function (u) { return u.kategori === k; }) : umkm;
  gambarMarker(hasil);
  sesuaikan(hasil);
});
```

## Marker berwarna dengan divIcon

Marker bawaan Leaflet semuanya biru. Untuk membedakan kategori, pakai `divIcon` dengan kelas CSS sendiri:

```js
const WARNA = { Kuliner: '#e11d48', Kriya: '#7c3aed', Jasa: '#0d9488' };

function ikon(kategori) {
  const w = WARNA[kategori] || '#475569';
  return L.divIcon({
    className: '',
    html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:' + w +
          ';border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}
// gunakan: L.marker([u.lat, u.lng], { icon: ikon(u.kategori) })
```

Warna berasal dari tabel `WARNA` buatan Anda sendiri, bukan dari input pengguna, sehingga aman disisipkan ke atribut gaya. Jangan hanya mengandalkan warna untuk menyampaikan informasi; sediakan juga daftar atau legenda teks.

## Lokasi pengguna

Leaflet bisa meminta lokasi perangkat:

```js
document.getElementById('lokasiku').addEventListener('click', function () {
  peta.locate({ setView: true, maxZoom: 16 });
});
peta.on('locationfound', function (e) {
  L.circle(e.latlng, { radius: e.accuracy }).addTo(peta);
});
peta.on('locationerror', function () {
  alert('Lokasi tidak bisa diakses. Periksa izin lokasi di peramban.');
});
```

Fitur ini membutuhkan HTTPS dan izin dari pengguna. Minta lokasi hanya setelah pengguna menekan tombol, jangan otomatis saat halaman dibuka.

## Atribusi dan penggunaan tile

Server tile gratis OpenStreetMap ditujukan untuk penggunaan ringan. Baca [kebijakan penggunaan tile OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) sebelum meluncurkan aplikasi yang ramai. Untuk lalu lintas besar, pertimbangkan penyedia tile berbayar atau server tile sendiri, dan selalu tampilkan atribusi.

## Pertimbangan privasi

Koordinat bisa sangat sensitif, terutama jika menunjuk ke rumah warga:

- Petakan hanya data yang pemiliknya setuju dipublikasikan. Untuk usaha rumahan, pertimbangkan menampilkan titik perkiraan, bukan alamat persis.
- Pisahkan data publik (nama usaha, kategori) dari data pribadi (nomor telepon, alamat rumah).
- Jangan membuat peta publik yang memuat data yang seharusnya hanya dilihat petugas.
- Jelaskan di kebijakan privasi data apa yang tampil di peta. Ketentuan pelindungan data pribadi yang berlaku, seperti UU No. 27 Tahun 2022, perlu Anda pahami.

## Kesalahan yang sering terjadi

- **Peta tidak tampil** karena elemen tidak punya tinggi.
- **Koordinat terbalik** (bujur lalu lintang).
- **Memasukkan teks pengguna mentah ke popup.**
- **Lupa atribusi OpenStreetMap.**
- **Menyimpan lintang dan bujur sebagai teks**, sehingga perhitungan dan filter gagal.
- **Memuat ratusan ribu marker sekaligus.** Untuk data sangat banyak, pakai pengelompokan marker (*marker clustering*) atau tampilkan sesuai area yang terlihat.

## Kesimpulan

Dengan Leaflet dan OpenStreetMap, peta interaktif bisa dibuat dalam puluhan baris kode: peta dasar, marker, popup yang di-escape, filter, dan lokasi pengguna. Yang sering luput adalah sisi non-teknis: atribusi, kebijakan penggunaan tile, dan privasi data lokasi. Mulailah dari data contoh, pastikan semuanya aman, baru sambungkan ke data sungguhan.

Jika data peta Anda disimpan di perangkat pengguna, baca dulu [localStorage di Aplikasi Web: Kapan Aman, Kapan Tidak]({{ site.baseurl }}/blog/2026/10/17/localstorage-aplikasi-web-kapan-aman/).
