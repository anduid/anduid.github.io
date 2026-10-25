---
layout: post
title: "Mengamankan API Key AI di Aplikasi Web dan Android"
description: "Cara aman memakai API key layanan AI di aplikasi web dan Android: kenapa kunci tidak boleh di kode klien, proxy server, batas pemakaian, dan rotasi kunci."
date: 2026-10-09 14:00:00 +0700
tags: [keamanan, api, ai, tutorial]

# image: /assets/images/amankan-api-key.png
# image_alt: Alur aplikasi memanggil proxy server sebelum API layanan AI
---
<!-- CATATAN PENULIS (tidak tampil di situs): sesuaikan contoh dengan penyedia AI yang Anda pakai dan jangan menampilkan kunci asli. Tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Hapus published: false saat selesai. -->

Fitur AI seperti ringkasan teks, ekstraksi data dari dokumen, atau asisten percakapan kini mudah ditambahkan ke aplikasi lewat API. Tetapi ada satu kesalahan yang sangat sering terjadi: menaruh **API key** langsung di dalam aplikasi. Akibatnya bisa mahal, karena siapa pun yang menemukan kunci itu bisa memakainya dengan tagihan Anda.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda menambahkan fitur AI ke aplikasi dan hal yang Anda pelajari soal kunci API. -->

Tulisan ini menjelaskan kenapa kunci tidak boleh ada di sisi klien, bagaimana pola proxy yang aman, serta kebiasaan lain yang melindungi kunci dan anggaran Anda.

<!--more-->

## Mengapa kunci di aplikasi tidak aman

Apa pun yang dikirim ke perangkat pengguna bisa dibaca pengguna:

- **Aplikasi web.** Semua HTML dan JavaScript terlihat lewat alat pengembang peramban, termasuk kunci yang Anda tulis di sana.
- **Aplikasi Android.** File APK bisa diunduh dan dibongkar. Kunci di dalam kode, `strings.xml`, atau `BuildConfig` tetap ikut terkemas dan bisa diekstrak. Mengaburkan kode (*obfuscation*) hanya mempersulit, tidak mencegah.
- **Repositori publik.** Kunci yang pernah di-*commit* ke GitHub publik bisa ditemukan oleh pemindai otomatis dalam hitungan menit, bahkan jika kemudian dihapus, karena tetap ada di riwayat Git.

Kesimpulannya sederhana: kunci rahasia hanya boleh hidup di server yang Anda kendalikan.

## Pola yang aman: proxy server

Alih-alih memanggil API AI langsung, aplikasi memanggil **proxy** milik Anda. Proxy menyimpan kunci, memeriksa permintaan, lalu meneruskannya ke penyedia AI.

```text
Aplikasi (web/Android)  ->  Proxy Anda  ->  API penyedia AI
                         (kunci disimpan di sini)
```

Proxy tidak harus rumit. Beberapa pilihan ringan: fungsi serverless dari penyedia awan, server kecil, atau Google Apps Script untuk aplikasi kecil. Kuncinya disimpan di pengaturan rahasia platform, bukan di kode.

## Contoh proxy sederhana dengan Apps Script

Contoh berikut menyimpan kunci di *Script properties* dan meneruskan teks ke penyedia AI. Alamat dan format isi permintaan harus disesuaikan dengan dokumentasi penyedia Anda:

```js
function doPost(e) {
  const kunci = PropertiesService.getScriptProperties().getProperty('API_KEY');
  const body = JSON.parse(e.postData.contents);
  const teks = String(body.teks || '').slice(0, 4000);
  if (!teks) return json_({ ok: false, pesan: 'Teks kosong' });

  const res = UrlFetchApp.fetch('https://ALAMAT-API-PENYEDIA-AI', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + kunci }, // sesuaikan format header penyedia
    payload: JSON.stringify({ input: teks }),      // sesuaikan isi permintaan
    muteHttpExceptions: true
  });

  return json_({ ok: res.getResponseCode() === 200, hasil: res.getContentText() });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Isi kunci lewat **Project Settings > Script properties** di editor Apps Script, bukan lewat kode. Cara memanggil proxy dari halaman web dibahas di tulisan [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).

<!-- TAMBAHKAN: arsitektur proxy yang Anda pakai di proyek nyata, tanpa membuka kunci atau alamat internal. -->

## Proxy bukan akhir cerita: batasi penyalahgunaan

Proxy yang terbuka untuk siapa saja hanya memindahkan masalah. Orang masih bisa memanggilnya berulang kali dengan tagihan Anda. Tambahkan pengaman:

- **Batasi panjang dan jenis masukan.** Tolak teks yang terlalu panjang atau kosong, seperti pada contoh di atas.
- **Batasi jumlah panggilan.** Hitung panggilan per pengguna atau per hari, misalnya dengan `CacheService`, lalu tolak jika melebihi jatah.
- **Wajibkan identitas pengguna.** Untuk fitur berbayar atau mahal, minta login dan periksa sesi di server.
- **Catat pemakaian.** Simpan log sederhana agar lonjakan yang mencurigakan cepat terlihat.
- **Pasang batas di sisi penyedia.** Atur anggaran atau kuota bulanan dan peringatan tagihan di dasbor penyedia AI.

## Kebiasaan lain yang melindungi kunci

- **Jangan commit kunci ke Git.** Simpan di berkas konfigurasi lokal yang masuk `.gitignore` (misalnya `local.properties` di Android) atau di pengelola rahasia.
- **Batasi kunci bila penyedia mendukungnya.** Pembatasan berdasarkan API yang diizinkan, alamat, atau aplikasi mengurangi dampak jika kunci bocor.
- **Gunakan kunci terpisah** untuk pengembangan dan produksi.
- **Putar kunci secara berkala**, dan segera cabut serta ganti jika dicurigai bocor.
- **Jangan menaruh kunci di log atau pesan galat** yang bisa terlihat pengguna.

## Kalau kunci sudah terlanjur bocor

Bertindaklah cepat: cabut atau hapus kunci di dasbor penyedia, buat kunci baru, perbarui proxy, lalu periksa riwayat pemakaian dan tagihan untuk melihat apakah ada penyalahgunaan. Menghapus kunci dari kode saja tidak cukup, karena salinan lama mungkin sudah ada di riwayat Git atau APK yang beredar.

## Kesimpulan

Aturan intinya satu: **kunci rahasia tidak boleh ada di aplikasi klien**. Simpan di server, buat proxy kecil yang meneruskan permintaan, batasi pemakaian, dan siapkan rencana jika kunci bocor. Perlindungan ini tidak butuh infrastruktur besar, dan biayanya jauh lebih murah dibanding tagihan akibat kunci yang disalahgunakan.

<!-- TAMBAHKAN: 1-2 kalimat pelajaran pribadi Anda dan tautan ke tulisan lain di blog ini. -->
