---
layout: post
title: "Membuat Laporan PDF Otomatis dari Google Sheets"
description: "Cara membuat laporan PDF otomatis dari data Google Sheets dengan Apps Script: template Google Docs, penggantian data, konversi ke PDF, dan penyimpanan di Drive."
date: 2026-10-10 00:30:00 +0700
tags: [google-apps-script, google-sheets, pdf, tutorial]

# image: /assets/images/laporan-pdf-apps-script.png
# image_alt: Alur data dari Google Sheets ke template Docs lalu menjadi PDF di Drive
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di akun Anda dan jangan memakai ID berkas atau data asli di contoh. Tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Banyak pekerjaan kantor berakhir dengan selembar dokumen resmi: surat, kuitansi, laporan bulanan, atau lembar rekap. Jika datanya sudah ada di Google Sheets, mengetik ulang ke Word atau Docs adalah pekerjaan yang membosankan dan mudah salah. Padahal Apps Script bisa mengisi template dan mengubahnya menjadi PDF dalam hitungan detik.

<!-- TAMBAHKAN (1-2 kalimat): dokumen yang Anda otomatisasi di pekerjaan atau proyek nyata dan waktu yang dihemat. -->

Tulisan ini menunjukkan alurnya: membuat template di Google Docs, mengisi data dari Sheets, mengonversinya ke PDF, lalu menyimpannya di folder Drive.

<!--more-->

## Gambaran alur

1. Siapkan **template** dokumen di Google Docs dengan penanda untuk data yang akan diganti.
2. Apps Script membaca satu baris data dari Sheets.
3. Skrip menyalin template, mengganti penanda dengan data, dan menyimpan salinannya.
4. Salinan dikonversi menjadi PDF dan disimpan di folder tujuan.
5. Salinan sementara dihapus, dan tautan PDF dicatat kembali di Sheets.

## Langkah 1: membuat template di Google Docs

Buat dokumen biasa dengan tata letak yang Anda inginkan, lengkap dengan kop, tabel, dan teks tetap. Di tempat data yang harus berubah, tulis **penanda** yang unik dan tidak mungkin muncul di teks biasa, misalnya:

```text
Nomor      : @@nomor@@
Nama       : @@nama@@
Tanggal    : @@tanggal@@
Jumlah     : @@jumlah@@
```

Pakai awalan dan akhiran yang sama untuk semua penanda agar mudah diganti. Salin ID dokumen dari alamatnya (bagian di antara `/d/` dan `/edit`).

## Langkah 2: menyiapkan data di Sheets

Siapkan sheet dengan kolom yang sesuai penanda, misalnya `nomor`, `nama`, `tanggal`, `jumlah`, dan satu kolom `tautan_pdf` untuk hasilnya. Prinsip penyusunan tabel yang baik dibahas di tulisan [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/).

<!-- TAMBAHKAN: contoh struktur sheet dari proyek Anda (generik, tanpa data nyata). -->

## Langkah 3: menulis skrip

Buka **Ekstensi > Apps Script** dari spreadsheet, lalu tulis fungsi berikut. Ganti ID template dan ID folder dengan milik Anda:

```js
const ID_TEMPLATE = 'ID_TEMPLATE_DOCS_ANDA';
const ID_FOLDER_HASIL = 'ID_FOLDER_DRIVE_ANDA';

function buatPdf_(data) {
  const folder = DriveApp.getFolderById(ID_FOLDER_HASIL);
  const namaDasar = 'Laporan_' + data.nomor;

  // 1. Salin template
  const salinan = DriveApp.getFileById(ID_TEMPLATE).makeCopy(namaDasar, folder);
  const doc = DocumentApp.openById(salinan.getId());
  const body = doc.getBody();

  // 2. Ganti penanda dengan data
  Object.keys(data).forEach(function (kunci) {
    body.replaceText('@@' + kunci + '@@', String(data[kunci]));
  });
  doc.saveAndClose();

  // 3. Konversi ke PDF
  const pdf = salinan.getAs(MimeType.PDF).setName(namaDasar + '.pdf');
  const berkasPdf = folder.createFile(pdf);

  // 4. Hapus salinan Docs sementara
  salinan.setTrashed(true);

  return berkasPdf.getUrl();
}
```

Fungsi ini menerima objek `data` yang kuncinya sama dengan nama penanda. `replaceText` mengganti setiap kemunculan penanda di dokumen, termasuk di dalam tabel. Hasilnya berupa tautan berkas PDF.

Untuk memanggilnya per baris dan mencatat tautan hasil ke Sheets:

```js
function buatLaporanBaris(nomorBaris) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Laporan');
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const nilai = sheet.getRange(nomorBaris, 1, 1, header.length).getValues()[0];

  const data = {};
  header.forEach(function (kolom, i) { data[kolom] = nilai[i]; });

  const tautan = buatPdf_(data);
  const kolomTautan = header.indexOf('tautan_pdf') + 1;
  sheet.getRange(nomorBaris, kolomTautan).setValue(tautan);
}
```

Jalankan dengan memberikan nomor baris, misalnya `buatLaporanBaris(2)`. Saat pertama kali dijalankan, Google meminta Anda memberi izin akses ke Drive, Docs, dan Sheets.

## Merapikan format tanggal dan angka

Data tanggal dari Sheets berupa objek tanggal, dan angka tidak otomatis berformat rupiah. Ubah dulu sebelum dimasukkan ke dokumen:

```js
data.tanggal = Utilities.formatDate(new Date(data.tanggal), 'Asia/Jakarta', 'dd MMMM yyyy');
data.jumlah = 'Rp ' + Number(data.jumlah).toLocaleString('id-ID');
```

Perhatikan bahwa nama bulan hasil `formatDate` bergantung pada lokal dan bisa tampil dalam bahasa Inggris. Jika Anda butuh nama bulan bahasa Indonesia, buat daftar nama bulan sendiri dan ambil berdasarkan nomor bulan.

## Menghubungkan ke menu atau tombol

Agar pengguna non-teknis bisa menjalankannya, tambahkan menu khusus di Sheets:

```js
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Laporan')
    .addItem('Buat PDF baris terpilih', 'buatDariBarisAktif')
    .addToUi();
}

function buatDariBarisAktif() {
  const baris = SpreadsheetApp.getActiveRange().getRow();
  if (baris < 2) {
    SpreadsheetApp.getUi().alert('Pilih salah satu baris data, bukan judul.');
    return;
  }
  buatLaporanBaris(baris);
  SpreadsheetApp.getUi().alert('PDF selesai dibuat.');
}
```

Sekarang pengguna cukup memilih baris, lalu klik menu **Laporan > Buat PDF baris terpilih**.

## Hal yang perlu diperhatikan

- **Kuota dan waktu eksekusi.** Membuat banyak PDF sekaligus bisa melewati batas waktu satu eksekusi. Proses per kelompok kecil dan cek [dokumentasi kuota Apps Script](https://developers.google.com/apps-script/guides/services/quotas).
- **Data sensitif.** Folder hasil berisi dokumen asli. Atur akses folder dengan ketat dan jangan membagikan ke publik tanpa alasan.
- **Jangan menimpa template.** Selalu bekerja pada salinan, seperti pada kode di atas.
- **Penanda yang tidak ketemu.** Jika penanda salah ketik, `replaceText` tidak memberi galat dan penandanya tetap tampil di PDF. Periksa hasil PDF setelah mengubah template.
- **Karakter khusus.** `replaceText` memakai ekspresi reguler untuk pola pencarian, tetapi penandanya di atas aman karena hanya berisi huruf dan tanda `@`.

## Kesalahan yang sering terjadi

- **ID template atau folder salah**, sehingga muncul galat akses.
- **Lupa memberi izin** saat pertama kali dijalankan.
- **Nama kolom Sheets tidak sama dengan penanda**, sehingga data tidak terisi.
- **Tidak menghapus salinan Docs sementara**, sehingga Drive penuh berkas yang tidak perlu.
- **Menguji langsung pada data asli** tanpa mencoba dengan data contoh lebih dulu.

## Kesimpulan

Dengan template Docs, `replaceText`, dan konversi ke PDF, Anda bisa mengubah baris data di Sheets menjadi dokumen resmi hanya dengan satu klik. Mulailah dari satu jenis dokumen sederhana, uji dengan data contoh, lalu perluas ke dokumen lain dan proses massal.

Jika Anda ingin laporan dibuat dari halaman web, hubungkan dengan API dari tulisan [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).
