---
layout: post
title: "Mengunggah Foto ke Google Drive Lewat Apps Script"
description: "Cara mengunggah foto dan PDF dari halaman web ke Google Drive dengan Apps Script: base64, validasi tipe dan ukuran, penamaan aman, dan pencatatan di Sheets."
date: 2026-10-09 15:30:00 +0700
tags: [google-apps-script, google-drive, web, tutorial]

# image: /assets/images/unggah-drive-apps-script.png
# image_alt: Alur unggah berkas dari halaman web ke Apps Script dan Google Drive
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di proyek Anda dan jangan memakai ID folder atau berkas asli di contoh. Tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Hapus published: false saat selesai. -->

Banyak aplikasi web kecil butuh fitur unggah: foto bukti, lampiran dokumen, atau pindaian arsip. Jika Anda sudah memakai Google Apps Script sebagai backend, Google Drive adalah tempat penyimpanan yang alami dan gratis dalam batas kuota. Anda tidak perlu menyewa server atau layanan penyimpanan terpisah.

<!-- TAMBAHKAN (1-2 kalimat): proyek Anda yang memakai unggah ke Drive dan alasan memilih cara ini. -->

Tulisan ini menunjukkan alur lengkapnya: membaca berkas di peramban, mengirimnya ke Apps Script, menyimpannya di Drive dengan aman, dan mencatatnya di Google Sheets.

<!--more-->

## Gambaran alur

1. Pengguna memilih berkas di halaman web.
2. JavaScript mengubah berkas menjadi teks **base64** dan mengirimnya lewat `fetch`.
3. Apps Script memeriksa tipe dan ukuran, mengubahnya kembali menjadi berkas, dan menyimpannya di folder Drive.
4. Apps Script mencatat ID berkas ke Sheets dan membalas dengan hasilnya.

Apps Script web app tidak menerima unggahan berkas biasa (`multipart/form-data`) dengan mudah, jadi pola base64 lewat JSON adalah cara yang paling sederhana. Dasar membuat API Apps Script dibahas di tulisan [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).

## Sisi halaman web

Baca berkas dengan `FileReader`, ambil bagian base64-nya, lalu kirim sebagai JSON dengan `Content-Type: text/plain` agar terhindar dari masalah CORS:

```js
const API = 'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec';

function bacaBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function unggah(file) {
  const data = await bacaBase64(file);
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      aksi: 'unggah',
      nama: file.name,
      tipe: file.type,
      data: data
    })
  });
  return res.json();
}
```

Periksa ukuran berkas di sisi halaman juga supaya pengguna langsung mendapat pesan jelas, tetapi jangan mengandalkannya sebagai satu-satunya pemeriksaan.

## Sisi Apps Script

Siapkan folder tujuan di Drive, lalu salin ID-nya dari alamat folder. Berikut fungsi yang menerima, memvalidasi, dan menyimpan berkas:

```js
const ID_FOLDER = 'ID_FOLDER_DRIVE_ANDA';
const TIPE_BOLEH = ['image/jpeg', 'image/png', 'application/pdf'];
const MAKS_BYTE = 5 * 1024 * 1024; // 5 MB

function unggah_(body) {
  if (TIPE_BOLEH.indexOf(body.tipe) === -1) {
    return { ok: false, pesan: 'Tipe berkas tidak diizinkan' };
  }

  const bytes = Utilities.base64Decode(body.data);
  if (bytes.length > MAKS_BYTE) {
    return { ok: false, pesan: 'Ukuran berkas terlalu besar' };
  }

  const nama = new Date().getTime() + '_' + bersihkanNama_(body.nama);
  const blob = Utilities.newBlob(bytes, body.tipe, nama);
  const berkas = DriveApp.getFolderById(ID_FOLDER).createFile(blob);

  SpreadsheetApp.getActive().getSheetByName('Berkas')
    .appendRow([new Date(), berkas.getId(), nama, body.tipe, bytes.length]);

  return { ok: true, id: berkas.getId(), nama: nama };
}

function bersihkanNama_(nama) {
  return String(nama || 'berkas').replace(/[^\w.\-]+/g, '_').slice(0, 80);
}
```

Fungsi ini dipanggil dari `doPost` berdasarkan nilai `aksi`:

```js
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.aksi === 'unggah') return json_(unggah_(body));
    return json_({ ok: false, pesan: 'Aksi tidak dikenal' });
  } catch (err) {
    return json_({ ok: false, pesan: 'Terjadi kesalahan di server' });
  }
}
```

Cara kerja bagian-bagiannya:

- **Daftar tipe yang diizinkan** menolak berkas yang tidak Anda harapkan.
- **Batas ukuran** dicek setelah base64 didekode, sehingga ukuran yang diperiksa adalah ukuran berkas sebenarnya.
- **Awalan waktu pada nama** mencegah dua berkas dengan nama sama saling menimpa.
- **`bersihkanNama_`** membuang karakter berbahaya atau aneh dari nama berkas.
- **Pencatatan di Sheets** menyimpan ID berkas sehingga Anda bisa menampilkannya atau mencarinya nanti.

<!-- TAMBAHKAN: kendala yang Anda alami saat mengunggah ke Drive, misalnya soal izin saat pertama kali deploy atau ukuran berkas. -->

## Keamanan yang perlu diperhatikan

Unggahan adalah salah satu fitur yang paling sering disalahgunakan:

- **Jangan percaya tipe dari klien.** Nilai `tipe` dikirim oleh halaman web, jadi bisa dipalsukan. Untuk perlindungan lebih kuat, periksa juga beberapa byte awal berkas (tanda tangan berkas), misalnya JPEG diawali `FF D8 FF`.
- **Batasi akses endpoint.** Jika deployment dibuka untuk siapa saja, wajibkan login atau token dan batasi jumlah unggahan per pengguna.
- **Jangan membuka folder ke publik tanpa alasan.** Biarkan berkas privat dan tampilkan hanya kepada pengguna yang berhak.
- **Hindari menyimpan data sensitif** tanpa pertimbangan, terutama jika folder Drive dibagikan ke banyak orang.
- **Gunakan `LockService`** bila pencatatan ke Sheets bisa terjadi bersamaan.

## Batas dan kuota

Beberapa batas yang perlu diketahui:

- Base64 membuat data sekitar sepertiga lebih besar daripada berkas aslinya, jadi unggahan 5 MB dikirim sebagai sekitar 6,7 MB.
- Apps Script punya batas ukuran permintaan dan waktu eksekusi, serta kuota harian untuk layanan Drive. Berkas besar bisa gagal atau lambat.
- Untuk unggahan besar atau banyak, pertimbangkan mengompres gambar di peramban sebelum dikirim, misalnya dengan mengecilkan resolusi lewat elemen `canvas`.

Angka batas dapat berubah, jadi cek [dokumentasi kuota Apps Script](https://developers.google.com/apps-script/guides/services/quotas) untuk nilai terbaru.

## Kesalahan yang sering terjadi

- **Mengirim data URL lengkap** (`data:image/jpeg;base64,...`) ke server. Ambil hanya bagian setelah koma.
- **Lupa membuat deployment versi baru** setelah mengubah kode, sehingga perubahan tidak berlaku.
- **ID folder salah atau akun tidak punya akses**, yang menyebabkan galat saat membuat berkas.
- **Tidak ada pesan galat yang jelas** di halaman, sehingga pengguna tidak tahu apa yang gagal.
- **Tidak menguji berkas besar** sebelum dipakai pengguna.

## Kesimpulan

Mengunggah berkas ke Google Drive lewat Apps Script bisa dilakukan hanya dengan base64, `DriveApp`, dan sedikit validasi. Yang terpenting adalah memeriksa tipe dan ukuran di server, memberi nama berkas yang aman, mencatat ID di Sheets, dan membatasi akses. Mulailah dari fitur sederhana, lalu tambahkan kompresi gambar dan login saat dibutuhkan.

Jika Anda ingin membungkus aplikasi ini menjadi aplikasi Android, baca [Mengubah Web App Menjadi Aplikasi Android dengan WebView]({{ site.baseurl }}/2026/10/09/webview-android-dari-web-app/).
