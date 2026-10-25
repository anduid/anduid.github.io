---
layout: post
title: "Merancang Tabel Google Sheets untuk Aplikasi Web"
description: "Panduan merancang struktur Google Sheets sebagai database aplikasi web: ID unik, kolom wajib, relasi antar sheet, hapus lunak, dan pembacaan data yang efisien."
date: 2026-10-09 15:45:00 +0700
tags: [google-sheets, google-apps-script, database, panduan]

# image: /assets/images/rancang-tabel-sheets.png
# image_alt: Contoh struktur sheet Data, Users, dan AuditLog yang saling terhubung lewat ID
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan pengalaman merancang tabel di proyek Anda sendiri di bagian bertanda "TAMBAHKAN", pakai contoh generik (jangan data asli), dan pasang tangkapan layar buatan sendiri. Hapus published: false saat selesai. -->

Google Sheets sering dipakai sebagai database untuk aplikasi kecil, dan itu bisa bekerja dengan baik. Tetapi Sheets dirancang untuk manusia membaca angka, bukan untuk menjadi basis data. Kalau tabelnya disusun seperti laporan, dengan sel digabung, judul di tengah, dan ringkasan di sela-sela data, aplikasi Anda akan sulit membacanya dan mudah rusak.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memakai Sheets sebagai database dan masalah yang pernah muncul akibat desain tabel. -->

Tulisan ini membahas aturan praktis merancang sheet agar bersih, aman diubah, dan cepat dibaca dari Apps Script.

<!--more-->

## Perlakukan satu sheet sebagai satu tabel

Aturan dasarnya: satu sheet berisi satu jenis data, dengan **baris pertama sebagai nama kolom** dan setiap baris berikutnya sebagai satu rekaman. Tidak ada judul besar di atas, tidak ada baris kosong di tengah, dan tidak ada ringkasan di bawah.

Hindari hal-hal berikut di sheet data:

- sel yang digabung (*merge*),
- beberapa tabel dalam satu sheet,
- warna atau format sebagai satu-satunya penanda status,
- rumus yang bergantung pada posisi sel tertentu.

Jika Anda butuh laporan atau rekap yang rapi, buat sheet terpisah yang membaca dari sheet data, bukan menimpa sheet data itu.

## Beri setiap baris ID unik

Jangan memakai nomor baris sebagai identitas. Nomor baris berubah saat ada baris disisipkan atau dihapus. Gunakan kolom `id` yang nilainya tidak pernah berubah. Cara termudah di Apps Script adalah UUID:

```js
const id = Utilities.getUuid();
sheet.appendRow([id, new Date(), nama, catatan]);
```

ID unik memudahkan Anda mencari, mengubah, dan menautkan baris dari sheet lain tanpa salah sasaran.

## Kolom yang hampir selalu berguna

Tambahkan beberapa kolom standar di setiap sheet data:

| Kolom | Fungsi |
|-------|--------|
| `id` | Identitas unik baris |
| `dibuat` | Waktu data dibuat |
| `diubah` | Waktu terakhir diubah |
| `dibuat_oleh` | Siapa yang membuat |
| `dihapus` | Penanda hapus lunak (lihat di bawah) |

Kolom-kolom ini memudahkan pelacakan dan pemulihan, dan hampir tidak menambah beban.

## Hubungkan antar sheet dengan ID

Jika data saling terkait, jangan menyalin isi yang sama berulang kali. Simpan ID rujukannya. Contoh: sheet `Transaksi` menyimpan `id_pengguna`, bukan nama lengkap pengguna.

| Sheet | Kolom |
|-------|-------|
| `Users` | `id`, `nama`, `peran`, `aktif` |
| `Transaksi` | `id`, `id_pengguna`, `jumlah`, `dibuat` |
| `AuditLog` | `id`, `waktu`, `id_pengguna`, `aksi` |

Jika nama pengguna berubah, Anda cukup memperbaikinya di satu tempat. Saat menampilkan data, gabungkan di Apps Script berdasarkan `id_pengguna`.

<!-- TAMBAHKAN: contoh relasi antar sheet dari proyek Anda (generik, tanpa data nyata). -->

## Gunakan nilai yang konsisten

Sheets menerima apa saja, jadi disiplin harus datang dari Anda:

- **Status.** Pakai daftar nilai tetap seperti `baru`, `proses`, `selesai`, bukan teks bebas yang bisa diketik berbeda-beda. Anda bisa memakai validasi data (menu pilihan) di sheet.
- **Tanggal.** Simpan sebagai tanggal sungguhan, bukan teks. Hindari menulis tanggal dalam beberapa format berbeda.
- **Angka.** Simpan angka murni tanpa satuan atau tanda pemisah. Format tampilannya bisa diatur terpisah.
- **Satu nilai per sel.** Jangan menaruh beberapa nilai dalam satu sel yang dipisah koma jika Anda perlu mencarinya.

## Hapus lunak, bukan hapus permanen

Menghapus baris langsung berbahaya: datanya hilang, dan nomor baris bergeser. Gunakan **hapus lunak**. Tambahkan kolom `dihapus`, ubah nilainya menjadi `TRUE` saat pengguna menghapus data, dan sembunyikan baris itu dari tampilan aplikasi. Data tetap ada untuk audit atau pemulihan, dan Anda bisa membersihkannya secara berkala.

## Membaca data dengan efisien

Setiap panggilan ke Sheets dari Apps Script memakan waktu, jadi baca data sekaligus dalam satu panggilan, lalu olah di memori:

```js
function bacaTabel_(namaSheet) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(namaSheet);
  const nilai = sheet.getDataRange().getValues();
  const header = nilai.shift();
  return nilai.map(function (baris) {
    const obj = {};
    header.forEach(function (kolom, i) { obj[kolom] = baris[i]; });
    return obj;
  });
}

function petaById_(daftar) {
  const peta = {};
  daftar.forEach(function (o) { peta[o.id] = o; });
  return peta;
}
```

Dengan `petaById_`, mencari satu rekaman berdasarkan ID tidak perlu mengulang seluruh daftar. Untuk mengubah satu baris, cari posisinya lewat kolom ID, lalu tulis hanya baris itu:

```js
function ubahCatatan_(id, catatanBaru) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Data');
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  const posisi = ids.indexOf(id);
  if (posisi === -1) return false;
  sheet.getRange(posisi + 2, 3).setValue(catatanBaru); // kolom ke-3 = catatan
  return true;
}
```

Hindari membaca sel satu per satu di dalam perulangan. Itu cara paling umum membuat aplikasi Sheets terasa lambat.

## Kapan tabel mulai terlalu besar

Sheets cocok untuk data ribuan baris dan pengguna yang tidak banyak. Tanda-tanda Anda mendekati batasnya: pembacaan makin lambat, penulisan bersamaan sering bentrok, atau data mendekati batas sel per spreadsheet. Beberapa langkah: arsipkan data lama ke spreadsheet lain, tampilkan data per halaman, dan simpan hasil yang jarang berubah di `CacheService`. Jika kebutuhan terus tumbuh, pertimbangkan basis data sungguhan. Cek [dokumentasi resmi](https://developers.google.com/apps-script/guides/services/quotas) untuk batas terbaru.

## Kesalahan yang sering terjadi

- **Memakai nomor baris sebagai ID.** Rusak saat baris disisipkan atau dihapus.
- **Menggabungkan sel atau menaruh judul di atas tabel.** Membuat pembacaan data gagal.
- **Mengubah nama kolom tanpa mengubah kode.** Aplikasi tidak menemukan kolom yang dicari.
- **Menyimpan teks bebas untuk status.** Menghasilkan nilai yang tidak konsisten.
- **Mengedit data langsung di sheet tanpa aturan.** Tentukan siapa yang boleh mengubah sheet dan lindungi baris judul.

## Kesimpulan

Desain tabel yang baik membuat aplikasi berbasis Sheets jauh lebih tahan banting: satu sheet satu tabel, ID unik, kolom standar, relasi lewat ID, hapus lunak, dan pembacaan data sekaligus. Mulailah dengan aturan sederhana ini sebelum menulis kode, karena memperbaiki desain setelah data banyak jauh lebih sulit.

Untuk membangun API di atas tabel ini, baca [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).
