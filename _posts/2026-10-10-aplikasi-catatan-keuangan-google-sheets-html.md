---
layout: post
title: "Membuat Aplikasi Catatan Keuangan Sederhana dengan Google Sheets dan HTML"
description: "Tutorial lengkap membuat aplikasi catatan keuangan sederhana: tabel Google Sheets, API Apps Script, dan halaman HTML yang menampilkan transaksi dan saldo."
date: 2026-10-10 01:30:00 +0700
tags: [tutorial, google-apps-script, google-sheets, javascript]

# image: /assets/images/catatan-keuangan-sheets.png
# image_alt: Halaman catatan keuangan sederhana dengan daftar transaksi dan saldo
---
<!-- CATATAN PENULIS (tidak tampil di situs): ini tutorial praktik yang menyatukan beberapa tulisan Anda. Uji seluruh kode dari awal sampai akhir di akun Anda, ambil tangkapan layar asli, dan tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Jangan memakai data keuangan asli di contoh. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Mencatat pemasukan dan pengeluaran adalah kebutuhan yang paling sederhana sekaligus paling sering diabaikan. Aplikasi pencatat keuangan di toko aplikasi umumnya penuh iklan atau fitur yang tidak Anda butuhkan. Alternatifnya, Anda bisa membuat sendiri versi paling sederhana: data tersimpan di Google Sheets milik Anda, dan halamannya berupa satu berkas HTML.

<!-- TAMBAHKAN (1-2 kalimat): alasan Anda membuat aplikasi keuangan sendiri atau proyek serupa yang pernah Anda bangun. -->

Tutorial ini membangun aplikasi itu dari nol dalam tiga bagian: tabel di Sheets, API dengan Apps Script, dan halaman web yang menampilkan transaksi serta saldo. Hasil akhirnya bisa dihosting gratis di GitHub Pages.

<!--more-->

## Gambaran aplikasi

Fitur yang akan kita bangun sengaja minimal:

- menambah transaksi (pemasukan atau pengeluaran),
- menampilkan daftar transaksi terbaru,
- menghitung saldo,
- menghapus transaksi dengan cara hapus lunak.

Arsitekturnya sama dengan yang dibahas di [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/): halaman HTML memanggil Apps Script, dan Apps Script membaca serta menulis ke Sheets.

## Langkah 1: menyiapkan tabel

Buat spreadsheet baru dengan satu sheet bernama `Transaksi`. Isi baris pertama dengan nama kolom berikut, sesuai prinsip di [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/):

| Kolom | Isi |
|-------|-----|
| `id` | ID unik baris |
| `waktu` | Waktu dicatat |
| `keterangan` | Deskripsi singkat |
| `jumlah` | Angka murni tanpa satuan |
| `jenis` | `masuk` atau `keluar` |
| `dihapus` | `TRUE` jika dihapus lunak |

<!-- TAMBAHKAN: tangkapan layar sheet Anda dengan data contoh. -->

## Langkah 2: menulis API di Apps Script

Buka **Ekstensi > Apps Script** dan tempel kode berikut. Fungsi `doGet` mengembalikan transaksi yang belum dihapus, dan `doPost` menangani penambahan serta penghapusan:

```js
const NAMA_SHEET = 'Transaksi';

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(NAMA_SHEET);
  const nilai = sheet.getDataRange().getValues();
  const header = nilai.shift();

  const data = nilai
    .map(function (baris) {
      const obj = {};
      header.forEach(function (kolom, i) { obj[kolom] = baris[i]; });
      return obj;
    })
    .filter(function (t) { return String(t.dihapus).toUpperCase() !== 'TRUE'; })
    .reverse();

  return json_({ ok: true, data: data });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents);
    if (body.aksi === 'tambah') return json_(tambah_(body));
    if (body.aksi === 'hapus') return json_(hapus_(body));
    return json_({ ok: false, pesan: 'Aksi tidak dikenal' });
  } catch (err) {
    return json_({ ok: false, pesan: 'Terjadi kesalahan di server' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function tambah_(body) {
  const keterangan = String(body.keterangan || '').trim().slice(0, 100);
  const jumlah = Number(body.jumlah);
  const jenis = body.jenis === 'masuk' ? 'masuk' : 'keluar';

  if (!keterangan || !isFinite(jumlah) || jumlah <= 0) {
    return { ok: false, pesan: 'Keterangan dan jumlah wajib diisi dengan benar' };
  }
  const aman = /^[=+\-@]/.test(keterangan) ? "'" + keterangan : keterangan;

  SpreadsheetApp.getActive().getSheetByName(NAMA_SHEET)
    .appendRow([Utilities.getUuid(), new Date(), aman, jumlah, jenis, 'FALSE']);
  return { ok: true };
}

function hapus_(body) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(NAMA_SHEET);
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  const posisi = ids.indexOf(body.id);
  if (posisi === -1) return { ok: false, pesan: 'Data tidak ditemukan' };
  sheet.getRange(posisi + 2, 6).setValue('TRUE'); // kolom ke-6 = dihapus
  return { ok: true };
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Hal penting dari kode ini: jumlah divalidasi sebagai angka positif, jenis dibatasi dua nilai, teks dipotong panjangnya, kunci mencegah penulisan bersamaan, dan penghapusan hanya mengubah penanda sehingga data tetap tersimpan.

Setelah itu klik **Deploy > New deployment > Web app**, pilih *Execute as: Me*, dan atur akses sesuai kebutuhan. Salin URL berakhiran `/exec`.

## Langkah 3: membuat halaman HTML

Buat berkas `index.html` berikut. Ganti `ID_DEPLOYMENT_ANDA` dengan URL dari langkah sebelumnya:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Catatan Keuangan</title>
</head>
<body>
  <h1>Catatan Keuangan</h1>

  <form id="form">
    <input id="keterangan" placeholder="Keterangan" required>
    <input id="jumlah" type="number" min="1" placeholder="Jumlah" required>
    <select id="jenis">
      <option value="keluar">Pengeluaran</option>
      <option value="masuk">Pemasukan</option>
    </select>
    <button type="submit">Simpan</button>
  </form>

  <p id="saldo"></p>
  <ul id="daftar"></ul>

  <script>
    const API = 'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec';
    const rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };

    async function panggil(data) {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      return res.json();
    }

    async function muat() {
      const res = await fetch(API);
      const hasil = await res.json();
      const daftar = document.getElementById('daftar');
      daftar.textContent = '';
      let saldo = 0;

      hasil.data.forEach(function (t) {
        const li = document.createElement('li');
        li.textContent = t.keterangan + ': ' + rupiah(t.jumlah) + ' (' + t.jenis + ') ';
        const tombol = document.createElement('button');
        tombol.textContent = 'Hapus';
        tombol.addEventListener('click', async function () {
          await panggil({ aksi: 'hapus', id: t.id });
          muat();
        });
        li.appendChild(tombol);
        daftar.appendChild(li);
        saldo += t.jenis === 'masuk' ? Number(t.jumlah) : -Number(t.jumlah);
      });
      document.getElementById('saldo').textContent = 'Saldo: ' + rupiah(saldo);
    }

    document.getElementById('form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const hasil = await panggil({
        aksi: 'tambah',
        keterangan: document.getElementById('keterangan').value,
        jumlah: document.getElementById('jumlah').value,
        jenis: document.getElementById('jenis').value
      });
      if (hasil.ok) {
        e.target.reset();
        muat();
      } else {
        alert(hasil.pesan || 'Gagal menyimpan');
      }
    });

    muat();
  </script>
</body>
</html>
```

Perhatikan bahwa teks transaksi dimasukkan dengan `textContent`, bukan `innerHTML`, sehingga isi dari pengguna tidak dijalankan sebagai HTML. Kebiasaan ini dibahas di [8 Kebiasaan Keamanan Aplikasi Web yang Wajib Dimiliki Pemula]({{ site.baseurl }}/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

<!-- TAMBAHKAN: tangkapan layar halaman jadi, dan kendala yang Anda temui saat menjalankannya. -->

## Langkah 4: menghosting di GitHub Pages

Unggah `index.html` ke repo GitHub, lalu aktifkan Pages di **Settings > Pages** (branch `main`, folder root). Alamat halaman akan muncul beberapa menit kemudian. Langkah lengkapnya ada di [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/), dan prinsipnya sama untuk halaman biasa.

## Pengembangan lanjutan

Setelah versi dasar berjalan, Anda bisa menambahkan:

- **Kategori pengeluaran** dan ringkasan per kategori.
- **Filter bulan** dan total per bulan.
- **Login sederhana** supaya hanya Anda yang bisa melihat data.
- **Grafik** pengeluaran dengan pustaka grafik di peramban.
- **Cadangan otomatis** memakai trigger seperti di [Trigger Apps Script]({{ site.baseurl }}/2026/10/10/trigger-apps-script-tugas-otomatis/).

## Peringatan keamanan

Aplikasi ini dibuat sederhana untuk belajar. Jika deployment dibuka untuk siapa saja, semua orang yang memegang URL dapat membaca dan menulis data. Untuk data keuangan nyata, tambahkan login dan pemeriksaan akses di server, atau batasi deployment hanya untuk akun Google tertentu. Jangan menyimpan informasi yang sangat sensitif di sini.

## Kesimpulan

Dengan satu sheet, satu skrip, dan satu halaman HTML, Anda sudah punya aplikasi catatan keuangan yang berjalan dan bisa dikembangkan. Yang terpenting bukan fiturnya, tetapi pola yang Anda pelajari: tabel yang tertata, API dengan validasi, dan tampilan yang aman. Pola yang sama bisa dipakai untuk aplikasi data lain.
