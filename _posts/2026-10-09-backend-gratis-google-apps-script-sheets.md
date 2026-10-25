---
layout: post
title: "Backend Gratis dengan Google Apps Script dan Sheets"
description: "Cara membuat aplikasi web tanpa server sendiri: Google Sheets sebagai database, Apps Script sebagai API, dan GitHub Pages sebagai tampilan."
date: 2026-10-09 08:00:00 +0700
tags: [tutorial, google-apps-script, web]
# image: /assets/images/backend-gratis-apps-script.png
# image_alt: Diagram alur data dari GitHub Pages ke Apps Script dan Google Sheets
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan pengalaman Anda sendiri di tiga tempat bertanda "TAMBAHKAN", lalu pasang tangkapan layar dan diagram buatan sendiri sebelum menerbitkan. -->

Tidak semua aplikasi butuh server sendiri. Untuk aplikasi kecil seperti pencatatan data, formulir internal, atau prototipe yang ingin cepat diuji, menyewa server atau mengurus database sering terasa berlebihan. Ada cara yang lebih ringan dan gratis: memakai Google Sheets sebagai tempat data, Google Apps Script sebagai API, dan GitHub Pages untuk menampilkan halaman web.

<!-- TAMBAHKAN (1-2 kalimat): proyek nyata Anda yang memakai cara ini dan kenapa Anda memilihnya. -->

Dalam tulisan ini kita akan membangun contoh sederhana: sebuah halaman yang bisa menyimpan dan menampilkan catatan. Anda akan tahu cara menyusun sheet, menulis API, men-deploy-nya, menghubungkannya ke halaman web, serta apa saja batas dan risikonya.

<!--more-->

## Gambaran arsitektur

Alur datanya sederhana dan hanya melibatkan tiga bagian:

1. **Tampilan**: halaman HTML, CSS, dan JavaScript yang dihosting di GitHub Pages.
2. **API**: skrip Google Apps Script yang di-deploy sebagai *web app*. Skrip ini menerima permintaan dari halaman web.
3. **Database**: Google Sheets. Setiap sheet berperan seperti satu tabel.

Saat pengguna menekan tombol simpan, JavaScript mengirim permintaan `fetch` ke URL Apps Script. Skrip memeriksa data, menuliskannya ke Sheets, lalu membalas dengan JSON. Halaman web kemudian menampilkan hasilnya.

<!-- TAMBAHKAN: diagram alur buatan sendiri dengan alt text, lalu pasang di sini. -->

## Kapan cara ini cocok, dan kapan tidak

Cara ini cocok untuk:

- aplikasi internal dengan pengguna puluhan, bukan ribuan,
- prototipe atau MVP yang ingin segera diuji,
- data yang berukuran ribuan baris,
- proyek yang tidak punya anggaran server.

Cara ini kurang cocok untuk:

- aplikasi dengan trafik tinggi atau banyak pengguna bersamaan,
- data yang sangat sensitif, misalnya data keuangan atau kesehatan pribadi,
- logika yang butuh transaksi kompleks dan relasi antartabel yang rumit.

Google Sheets bukan database sungguhan. Tidak ada indeks, tidak ada transaksi, dan kecepatan akan menurun saat data membesar. Mengakui batas ini di awal akan menyelamatkan Anda dari keputusan arsitektur yang salah.

## Langkah 1: menyiapkan Google Sheets

Buat satu spreadsheet baru dan siapkan tiga sheet berikut. Baris pertama setiap sheet berisi nama kolom.

| Sheet | Fungsi | Kolom |
|-------|--------|-------|
| `Data` | Menyimpan catatan | `waktu`, `nama`, `catatan` |
| `Users` | Daftar pengguna yang berhak (jika ada login) | `username`, `peran`, `aktif` |
| `AuditLog` | Jejak aktivitas | `waktu`, `aksi`, `pelaku` |

Pisahkan data per sheet sejak awal. Memisahkan data aplikasi, data pengguna, dan log memudahkan perawatan, dan Anda tidak perlu mengubah struktur ketika aplikasi berkembang.

<!-- TAMBAHKAN: tangkapan layar spreadsheet Anda (samarkan data asli). -->

## Langkah 2: menulis API dengan Apps Script

Dari spreadsheet, buka **Ekstensi > Apps Script**. Di sana kita menulis dua fungsi utama: `doGet(e)` untuk membaca data dan `doPost(e)` untuk menerima data. Apps Script memanggil keduanya otomatis setiap ada permintaan GET atau POST ke URL web app.

```js
const SHEET_DATA = 'Data';
const SHEET_LOG = 'AuditLog';

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_DATA);
    const nilai = sheet.getDataRange().getValues();
    const header = nilai[0];
    const data = nilai.slice(1).map(function (baris) {
      const obj = {};
      header.forEach(function (kolom, i) { obj[kolom] = baris[i]; });
      return obj;
    });
    return json_({ ok: true, data: data });
  } catch (err) {
    return json_({ ok: false, pesan: 'Gagal membaca data' });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
    const nama = bersihkan_(body.nama, 60);
    const catatan = bersihkan_(body.catatan, 500);
    if (!nama || !catatan) {
      return json_({ ok: false, pesan: 'Nama dan catatan wajib diisi' });
    }
    const ss = SpreadsheetApp.getActive();
    ss.getSheetByName(SHEET_DATA).appendRow([new Date(), nama, catatan]);
    ss.getSheetByName(SHEET_LOG).appendRow([new Date(), 'tambah', nama]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, pesan: 'Gagal menyimpan data' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function bersihkan_(teks, maks) {
  let t = String(teks || '').trim().slice(0, maks);
  if (/^[=+\-@]/.test(t)) t = "'" + t; // cegah rumus disuntikkan ke sheet
  return t;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Beberapa hal penting dari kode di atas:

- **`doGet`** membaca seluruh sheet dengan sekali panggilan `getValues()`, lalu mengubah tiap baris menjadi objek berdasarkan nama kolom. Membaca per sel jauh lebih lambat.
- **`doPost`** membaca isi permintaan dari `e.postData.contents`, memvalidasinya, lalu menambahkan baris baru dengan `appendRow`.
- **`LockService`** memastikan dua pengiriman yang datang bersamaan tidak saling menimpa. Kunci selalu dilepas di blok `finally`.
- **`bersihkan_`** memotong panjang teks dan menambahkan tanda petik di depan nilai yang diawali `=`, `+`, `-`, atau `@`, supaya input pengguna tidak dibaca Sheets sebagai rumus. Nama fungsi berakhiran garis bawah bersifat privat di Apps Script.
- **`json_`** menyatukan format balasan agar halaman web selalu menerima JSON yang konsisten.

## Langkah 3: deploy sebagai web app

Klik **Deploy > New deployment**, pilih jenis **Web app**, lalu atur dua opsi penting:

- **Execute as**: pilih *Me* agar skrip berjalan dengan akun Anda. Dengan begitu pengguna tidak perlu punya akses langsung ke spreadsheet.
- **Who has access**: pilih *Anyone* jika halaman web akan dibuka publik tanpa login Google. Pilihan ini membuat siapa pun yang memegang URL bisa memanggil API, jadi validasi di sisi server wajib (lihat bagian keamanan).

Setelah deploy, Anda mendapat URL berakhiran `/exec`. Itulah alamat API Anda.

Satu jebakan yang sering terjadi: setiap kali kode diubah, perubahan **tidak otomatis** muncul di URL `/exec`. Buka **Deploy > Manage deployments**, edit deployment yang ada, lalu pilih **New version**. Jika Anda membuat deployment baru, URL-nya ikut berganti dan halaman web Anda harus diperbarui. URL berakhiran `/dev` selalu memakai kode terbaru, tetapi hanya bisa dibuka oleh pemilik skrip, jadi cocok untuk uji coba saja.

<!-- TAMBAHKAN: pengalaman Anda dengan jebakan deploy atau izin akses saat pertama kali menjalankan. -->

## Langkah 4: menghubungkan ke tampilan di GitHub Pages

Di halaman web, panggil API memakai `fetch`:

```js
const API = 'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec';

async function ambilCatatan() {
  const res = await fetch(API);
  return res.json();
}

async function kirimCatatan(nama, catatan) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ nama: nama, catatan: catatan })
  });
  return res.json();
}
```

Perhatikan header `Content-Type: text/plain`. Ini sengaja dipilih untuk menghindari masalah **CORS**. Jika Anda mengirim `application/json`, peramban lebih dulu mengirim permintaan pemeriksaan (*preflight* `OPTIONS`) yang tidak ditangani Apps Script, sehingga permintaan gagal. Dengan `text/plain`, permintaan dianggap sederhana dan langsung dikirim. Isinya tetap JSON; skrip tinggal memproses teks tersebut dengan `JSON.parse`, seperti pada `doPost` di atas.

Cara ini tidak memerlukan pengaturan server tambahan, dan hasilnya bisa dipakai oleh halaman di GitHub Pages maupun dari domain lain.

## Keamanan yang sering terlewat

Karena URL API bersifat publik, anggap semua permintaan sebagai tidak tepercaya:

- **Validasi di server.** Jangan percaya validasi di JavaScript halaman. Periksa tipe, panjang, dan isi data di Apps Script, seperti pada fungsi `bersihkan_`.
- **Jangan simpan rahasia di frontend.** Kunci API pihak ketiga harus disimpan di `PropertiesService` (Project Settings > Script properties), bukan ditulis di HTML atau JavaScript halaman.
- **Batasi aksi.** Terima hanya aksi yang Anda definisikan. Jangan membuat endpoint yang bisa menghapus atau mengubah data tanpa pemeriksaan.
- **Kunci penulisan bersamaan.** Gunakan `LockService` agar data tidak rusak saat dua orang menyimpan di saat yang sama.
- **Catat aktivitas.** Tulis setiap aksi penting ke sheet `AuditLog`, lengkap dengan waktu dan pelaku. Jejak ini sangat berguna saat ada kesalahan.
- **Login yang sebenarnya.** Token yang ditanam di halaman web bisa dilihat siapa saja, jadi itu bukan perlindungan sungguhan. Untuk data yang perlu dibatasi, buat sistem login: simpan pengguna di sheet `Users`, simpan hash kata sandi (bukan kata sandi asli), dan keluarkan token sesi yang diperiksa di server pada setiap permintaan.

Dan sekali lagi: untuk data yang sangat sensitif, pertimbangkan layanan yang memang dirancang sebagai database.

## Batas kuota dan cara mengatasinya

Layanan gratis punya batas. Dua yang paling sering terasa:

- **Waktu eksekusi.** Satu eksekusi skrip dibatasi sekitar 6 menit, dan jumlah eksekusi bersamaan juga dibatasi.
- **Ukuran spreadsheet.** Google Sheets membatasi jumlah sel per spreadsheet. Sheet yang sangat besar juga membuat pembacaan makin lambat.

Beberapa cara menanganinya:

- Baca dan tulis data dalam bentuk blok (`getValues` dan `setValues`), bukan sel demi sel.
- Simpan hasil yang jarang berubah di `CacheService` supaya tidak membaca sheet berulang kali.
- Arsipkan data lama ke spreadsheet atau sheet terpisah secara berkala.
- Tampilkan data per halaman, jangan mengirim ribuan baris sekaligus.

Angka kuota bisa berubah dari waktu ke waktu dan berbeda antara akun biasa dan Google Workspace. Selalu cek [dokumentasi kuota Apps Script](https://developers.google.com/apps-script/guides/services/quotas) untuk angka terbaru, dan baca juga [panduan web app resmi](https://developers.google.com/apps-script/guides/web).

## Kesimpulan

Kombinasi Google Sheets, Apps Script, dan GitHub Pages memberi Anda aplikasi web lengkap tanpa biaya server. Kuncinya ada pada empat hal: pisahkan data per sheet, validasi semuanya di server, gunakan `text/plain` untuk menghindari masalah CORS, dan selalu perbarui versi deployment setelah mengubah kode.

Pendekatan ini ideal untuk aplikasi kecil dan prototipe, tetapi bukan pengganti database sungguhan saat aplikasi tumbuh besar. Mulailah dari yang sederhana, ukur, lalu pindah ke arsitektur yang lebih kuat ketika memang dibutuhkan.

<!-- TAMBAHKAN: 1-2 kalimat pelajaran pribadi Anda dan tautan ke tulisan lain di blog ini, misalnya panduan WebView Android atau digitalisasi arsip. -->
