---
layout: post
title: "Trigger Apps Script: Menjadwalkan Tugas Otomatis di Google Workspace"
description: "Panduan trigger Google Apps Script: trigger berbasis waktu, onEdit dan onOpen, cara membuatnya lewat kode, contoh cadangan harian, kuota, dan kesalahan umum."
date: 2026-10-10 00:45:00 +0700
tags: [google-apps-script, otomatisasi, tutorial]

# image: /assets/images/trigger-apps-script.png
# image_alt: Trigger berbasis waktu menjalankan fungsi Apps Script setiap hari
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di akun Anda dan periksa batas kuota di dokumentasi resmi terbaru. Tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Salah satu kekuatan Google Apps Script adalah kemampuannya berjalan sendiri tanpa Anda menekan tombol apa pun. Cadangan data setiap malam, rekap harian, pengingat otomatis, atau pembersihan data lama bisa dijalankan terjadwal. Mekanisme di baliknya disebut **trigger**.

<!-- TAMBAHKAN (1-2 kalimat): tugas otomatis yang Anda jalankan dengan trigger di proyek nyata. -->

Tulisan ini menjelaskan jenis-jenis trigger, cara membuatnya lewat antarmuka maupun kode, contoh cadangan harian, serta batasan yang perlu Anda tahu.

<!--more-->

## Apa itu trigger

Trigger adalah aturan yang membuat Apps Script menjalankan sebuah fungsi saat suatu peristiwa terjadi. Ada dua kelompok besar:

- **Trigger sederhana**: fungsi dengan nama khusus yang berjalan otomatis, seperti `onOpen` dan `onEdit`. Tidak perlu pengaturan, tetapi punya batasan izin.
- **Trigger yang dapat dipasang (*installable*)**: dibuat lewat menu atau kode, lebih fleksibel dan bisa memakai layanan yang butuh otorisasi.

## Jenis trigger yang paling berguna

| Trigger | Dijalankan saat | Contoh pemakaian |
|---------|-----------------|------------------|
| Berbasis waktu | Waktu atau interval tertentu | Cadangan harian, rekap mingguan |
| `onOpen` | Spreadsheet dibuka | Menambah menu khusus |
| `onEdit` | Sel diubah | Mengisi tanggal ubah otomatis |
| `onFormSubmit` | Formulir dikirim | Memproses jawaban formulir |
| Perubahan | Struktur atau isi berubah | Menyinkronkan data |

## Membuat trigger lewat antarmuka

Di editor Apps Script, buka ikon jam (**Triggers**) di sisi kiri, klik **Add Trigger**, lalu pilih fungsi yang akan dijalankan, jenis kejadian (misalnya *Time-driven*), dan jadwalnya. Cara ini paling mudah untuk sekali pasang.

## Membuat trigger lewat kode

Kode berguna jika Anda ingin trigger dibuat otomatis atau dipasang ulang dengan konsisten:

```js
function pasangTriggerHarian() {
  // Hapus trigger lama agar tidak dobel
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'cadanganHarian') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Jalankan setiap hari sekitar pukul 01.00
  ScriptApp.newTrigger('cadanganHarian')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
}
```

Jalankan `pasangTriggerHarian` satu kali secara manual. Setelah itu `cadanganHarian` akan berjalan sendiri setiap hari.

Perhatikan bahwa trigger berbasis waktu tidak tepat pada menit tertentu. Dengan `atHour(1)`, fungsi berjalan di sekitar jam itu, dalam jendela waktu sekitar satu jam. Jika presisi menit penting, trigger ini bukan pilihan yang tepat.

## Contoh: cadangan harian spreadsheet

Fungsi berikut menyalin spreadsheet ke folder cadangan dan menamainya dengan tanggal:

```js
const ID_FOLDER_CADANGAN = 'ID_FOLDER_CADANGAN_ANDA';

function cadanganHarian() {
  const ss = SpreadsheetApp.getActive();
  const tanggal = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
  const folder = DriveApp.getFolderById(ID_FOLDER_CADANGAN);

  DriveApp.getFileById(ss.getId()).makeCopy(ss.getName() + '_' + tanggal, folder);
  hapusCadanganLama_(folder, 30);
}

function hapusCadanganLama_(folder, hariSimpan) {
  const batas = new Date().getTime() - hariSimpan * 24 * 60 * 60 * 1000;
  const berkas = folder.getFiles();
  while (berkas.hasNext()) {
    const f = berkas.next();
    if (f.getDateCreated().getTime() < batas) f.setTrashed(true);
  }
}
```

Kode ini membuat satu salinan per hari dan membuang salinan yang lebih lama dari 30 hari, supaya Drive tidak penuh. Ini sejalan dengan prinsip cadangan yang dibahas di [Panduan Digitalisasi Arsip untuk Kantor Kecil]({{ site.baseurl }}/2026/10/09/panduan-digitalisasi-arsip-kantor-kecil/).

<!-- TAMBAHKAN: bagaimana Anda menjadwalkan cadangan atau rekap di proyek Anda, dan kendala yang ditemui. -->

## Contoh: mencatat waktu perubahan dengan onEdit

`onEdit` berguna untuk tindakan ringan setiap kali sel berubah. Misalnya mengisi kolom `diubah` otomatis:

```js
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'Data') return;
  if (e.range.getRow() < 2) return;

  const kolomDiubah = 5; // misalnya kolom E berisi waktu ubah
  if (e.range.getColumn() === kolomDiubah) return; // hindari perulangan

  sheet.getRange(e.range.getRow(), kolomDiubah).setValue(new Date());
}
```

Trigger sederhana seperti `onEdit` punya batasan: tidak bisa memakai layanan yang butuh otorisasi penuh (misalnya mengirim email), dan hanya berjalan singkat. Jika Anda perlu layanan itu, buat trigger *installable* untuk kejadian edit.

## Batas dan kuota

- Ada **batas total waktu eksekusi trigger per hari**, dan satu eksekusi punya batas waktu maksimum.
- Layanan seperti email (`MailApp`) dan `UrlFetchApp` punya kuota harian sendiri.
- Akun biasa dan akun Google Workspace punya batas berbeda.

Angka-angkanya dapat berubah, jadi lihat [dokumentasi kuota resmi](https://developers.google.com/apps-script/guides/services/quotas). Rancang fungsi trigger agar cepat selesai dan bekerja dalam kelompok kecil bila datanya banyak.

## Kesalahan yang sering terjadi

- **Trigger dobel.** Memasang trigger yang sama berulang kali membuat fungsi berjalan berkali-kali. Hapus trigger lama sebelum memasang yang baru, seperti pada contoh.
- **Fungsi terlalu lama.** Eksekusi yang melewati batas waktu dihentikan tanpa menyelesaikan pekerjaan.
- **Lupa memberi otorisasi.** Trigger tidak berjalan jika izin belum diberikan.
- **`onEdit` yang mengubah sel pemicunya sendiri**, sehingga terjadi perulangan.
- **Tidak ada pencatatan galat.** Aktifkan notifikasi kegagalan di pengaturan trigger agar Anda tahu saat fungsi gagal.

## Kesimpulan

Trigger mengubah skrip Apps Script dari alat yang harus dijalankan manual menjadi mesin otomatisasi: cadangan harian, rekap, dan pemrosesan data berjalan sendiri. Pasang trigger dengan hati-hati, hindari duplikasi, perhatikan kuota, dan catat galat. Mulailah dari satu tugas terjadwal sederhana seperti cadangan harian.

Jika Anda menyiapkan laporan dokumen otomatis, baca juga [Membuat Laporan PDF Otomatis dari Google Sheets]({{ site.baseurl }}/2026/10/10/laporan-pdf-dari-google-sheets-apps-script/).
