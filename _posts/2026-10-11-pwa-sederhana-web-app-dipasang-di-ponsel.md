---
layout: post
title: "Membuat PWA Sederhana: Web App yang Bisa Dipasang di Ponsel"
description: "Panduan membuat Progressive Web App sederhana: manifest, service worker, cache offline, pengujian, dan jebakan umum agar web app bisa dipasang di layar utama ponsel."
date: 2026-10-11 00:30:00 +0700
tags: [pwa, javascript, web, tutorial]

# image: /assets/images/pwa-sederhana.png
# image_alt: Web app dipasang di layar utama ponsel sebagai PWA
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji di perangkat Anda sendiri dan tambahkan pengalaman Anda (perbedaan perilaku PWA di berbagai ponsel, masalah cache) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Tidak semua aplikasi perlu masuk toko aplikasi. Jika Anda sudah punya web app yang berjalan baik, Anda bisa mengubahnya menjadi **Progressive Web App (PWA)**: halaman web yang bisa dipasang di layar utama ponsel, dibuka tanpa bilah alamat, dan sebagian bisa dipakai tanpa internet. Caranya hanya butuh dua tambahan: berkas manifest dan service worker.

<!-- TAMBAHKAN (1-2 kalimat): web app Anda yang dijadikan PWA dan alasan memilih PWA dibanding aplikasi native atau WebView. -->

Tulisan ini membangun PWA sederhana langkah demi langkah dan menjelaskan hal yang sering membuatnya gagal berjalan.

<!--more-->

## Apa itu PWA

PWA adalah web app yang memakai beberapa teknologi peramban agar terasa seperti aplikasi:

- **Bisa dipasang** di layar utama dengan ikon dan nama sendiri.
- **Tampil layar penuh** tanpa bilah alamat peramban.
- **Bisa berjalan offline** atau di koneksi buruk dengan bantuan cache.
- **Tetap berupa web**: diperbarui dengan mengunggah berkas baru, tanpa menunggu peninjauan toko.

PWA cocok untuk aplikasi berbasis formulir dan daftar. Untuk fitur perangkat yang dalam atau performa grafis tinggi, aplikasi native atau [WebView]({{ site.baseurl }}/2026/10/09/webview-android-dari-web-app/) bisa lebih tepat. Dukungan fitur PWA berbeda antarperangkat dan peramban, jadi uji di perangkat yang akan dipakai.

## Persyaratan dasar

- Halaman disajikan lewat **HTTPS** (`localhost` dikecualikan untuk pengembangan). GitHub Pages sudah menyediakannya.
- Ada **manifest** web app.
- Ada **service worker** yang terdaftar.
- Ikon dengan ukuran yang sesuai.

## Langkah 1: berkas manifest

Buat `manifest.json` di folder yang sama dengan `index.html`:

```json
{
  "name": "Catatan Keuangan",
  "short_name": "Keuangan",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2f6df6",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Penjelasan singkat:

- `name` dan `short_name` adalah nama lengkap dan nama pendek di bawah ikon.
- `start_url` dan `scope` menentukan halaman awal dan area yang dianggap bagian aplikasi. Memakai jalur relatif (`./`) membuatnya tetap benar saat aplikasi berada di subfolder.
- `display: standalone` menyembunyikan bilah alamat.
- `theme_color` mewarnai bilah status, dan `background_color` dipakai pada layar pembuka.

Tautkan manifest di bagian `<head>` halaman:

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#2f6df6">
<link rel="apple-touch-icon" href="icon-192.png">
```

Siapkan ikon PNG berukuran 192 dan 512 piksel dengan desain yang jelas bahkan saat dikecilkan.

## Langkah 2: service worker

Service worker adalah skrip yang berjalan di latar belakang dan bisa mencegat permintaan jaringan. Kita memakainya untuk menyimpan berkas penting di cache. Buat `sw.js`:

```js
const CACHE = 'keuangan-v1';
const ASET = ['./', './index.html', './icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASET); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nama) {
      return Promise.all(
        nama.filter(function (n) { return n !== CACHE; })
            .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
```

Cara kerjanya:

- **install**: saat pertama kali terpasang, berkas inti disimpan di cache.
- **activate**: membersihkan cache versi lama agar tidak menumpuk.
- **fetch**: untuk setiap permintaan GET, ambil dari cache lebih dulu, dan jika tidak ada baru ke jaringan.

Daftarkan service worker dari halaman:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
```

<!-- TAMBAHKAN: strategi cache yang Anda pakai (cache dulu atau jaringan dulu) dan alasannya. -->

## Strategi cache yang perlu dipilih dengan sadar

Kode di atas memakai *cache-first*: cepat dan bisa offline, tetapi pengguna bisa melihat berkas lama. Beberapa alternatif:

| Strategi | Cara kerja | Cocok untuk |
|----------|-----------|-------------|
| Cache dulu | Cache, lalu jaringan jika tidak ada | Berkas statis (HTML, CSS, ikon) |
| Jaringan dulu | Jaringan, lalu cache jika gagal | Data yang harus segar |
| Cache lalu perbarui | Tampilkan cache, perbarui di latar | Konten yang boleh sedikit usang |

Jangan men-cache respons API data keuangan atau data pribadi tanpa pertimbangan. Data sensitif tidak seharusnya tersimpan di cache perangkat bersama, dan data yang berubah cepat akan terlihat kedaluwarsa.

## Memperbarui aplikasi

Karena berkas disimpan di cache, perubahan tidak langsung muncul. Setiap kali Anda mengubah berkas yang di-cache, **naikkan nama cache**, misalnya dari `keuangan-v1` menjadi `keuangan-v2`. Service worker baru akan memasang cache baru dan membuang yang lama saat `activate`. Lupa langkah ini adalah sebab paling umum pengguna terjebak pada versi lama.

## Menguji PWA

- Buka halaman di Chrome, lalu buka **DevTools > Application** untuk memeriksa manifest dan service worker.
- Gunakan audit **Lighthouse** untuk melihat apa yang masih kurang.
- Uji mode offline dengan mencentang **Offline** di tab Network atau mematikan internet.
- Coba pasang di ponsel sungguhan: di Android Chrome lewat menu pemasangan, di iPhone lewat **Tambah ke Layar Utama** di Safari.

## Jebakan yang sering terjadi

- **Tidak HTTPS.** Service worker tidak akan terdaftar.
- **Jalur salah di subfolder.** Jika aplikasi berada di `domain.com/aplikasi/`, jalur mutlak seperti `/sw.js` akan salah. Pakai jalur relatif dan atur `scope` dengan benar.
- **Lupa menaikkan versi cache**, sehingga perubahan tidak tampil.
- **Cache terlalu besar** karena semua berkas dimasukkan tanpa pilihan.
- **Mengira semua perangkat berperilaku sama.** Fitur seperti pemasangan, notifikasi, dan penyimpanan offline berbeda antarplatform.
- **Data pribadi tersimpan di cache** tanpa disadari.

## Kapan memilih PWA

Pilih PWA jika aplikasi Anda sudah berbasis web, tidak butuh fitur perangkat yang dalam, dan Anda ingin distribusi mudah tanpa toko. Jika Anda butuh kehadiran di Google Play, pertimbangkan membungkusnya, seperti dibahas di [Mengubah Web App Menjadi Aplikasi Android dengan WebView]({{ site.baseurl }}/2026/10/09/webview-android-dari-web-app/).

## Kesimpulan

Mengubah web app menjadi PWA hanya membutuhkan manifest, service worker, dan HTTPS. Mulailah dari cache untuk berkas statis, naikkan versi cache setiap ada perubahan, uji di perangkat sungguhan, dan hati-hati dengan data sensitif. Hasilnya, aplikasi web Anda terasa lebih dekat dengan aplikasi biasa tanpa proses toko aplikasi. Contoh aplikasi yang bisa dijadikan PWA ada di [Membuat Aplikasi Catatan Keuangan Sederhana dengan Google Sheets dan HTML]({{ site.baseurl }}/2026/10/10/aplikasi-catatan-keuangan-google-sheets-html/).
