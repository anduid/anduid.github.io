---
layout: post
title: "Ekspor CSV dari Aplikasi Web: Benar, Aman, dan Terbaca di Excel"
description: "Cara mengekspor data ke CSV dari aplikasi web dengan JavaScript: kutip dan escape yang benar, BOM untuk Excel, pemisah titik koma, dan pencegahan CSV injection."
date: 2026-10-17 01:15:00 +0700
tags: [javascript, csv, excel, tutorial]

# image: /assets/images/ekspor-csv-web.png
# image_alt: Data tabel diekspor menjadi berkas CSV dan dibuka di Excel
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji hasil ekspor di Excel dan Google Sheets dengan data yang memuat koma, tanda kutip, baris baru, dan huruf berakses. Tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Hampir setiap aplikasi data akhirnya diminta fitur "unduh Excel". Cara paling sederhana adalah mengekspor ke CSV, format teks yang bisa dibuka Excel, Google Sheets, dan hampir semua alat lain. Tetapi CSV yang dibuat asal-asalan sering rusak: kolom bergeser karena ada koma di dalam data, huruf berakses jadi aneh, atau yang lebih berbahaya, berkas menjalankan rumus yang disisipkan penyerang.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda membuat fitur ekspor dan masalah yang muncul, misalnya karakter rusak atau kolom bergeser. -->

Tulisan ini membahas cara membuat CSV dengan benar dari JavaScript, supaya hasilnya rapi dan aman.

<!--more-->

## Aturan dasar CSV

CSV adalah teks dengan satu baris per rekaman dan nilai dipisahkan tanda tertentu. Aturan yang wajib diingat:

- Nilai yang mengandung **pemisah, tanda kutip ganda, atau baris baru** harus dibungkus tanda kutip ganda.
- Tanda kutip ganda di dalam nilai ditulis **dua kali** (`""`).
- Setiap baris diakhiri pemisah baris, umumnya `\r\n`.
- Baris pertama biasanya berisi nama kolom.

Contoh: nilai `Warung "Bu Mumun", Jl. Swatantra` ditulis sebagai `"Warung ""Bu Mumun"", Jl. Swatantra"`.

## Fungsi pembuat CSV

```js
function selCsv(nilai) {
  let t = nilai == null ? '' : String(nilai);

  // Cegah CSV injection: sel yang diawali = + - @ dianggap rumus oleh Excel/Sheets
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;

  if (/[",;\r\n]/.test(t)) t = '"' + t.replace(/"/g, '""') + '"';
  return t;
}

function keCsv(baris, kolom, pemisah) {
  pemisah = pemisah || ',';
  const kepala = kolom.map(function (k) { return selCsv(k.judul); }).join(pemisah);
  const isi = baris.map(function (b) {
    return kolom.map(function (k) { return selCsv(b[k.kunci]); }).join(pemisah);
  });
  return [kepala].concat(isi).join('\r\n');
}
```

Contoh pemakaian dengan data karangan:

```js
const kolom = [
  { kunci: 'nama', judul: 'Nama Usaha' },
  { kunci: 'rw', judul: 'RW' },
  { kunci: 'omzet', judul: 'Omzet' }
];
const data = [
  { nama: 'Warung "Contoh", Jl. A', rw: 'RW 01', omzet: 'Rp 5 - 15 Juta' },
  { nama: '=HYPERLINK("http://contoh.invalid")', rw: 'RW 02', omzet: '-' }
];
const csv = keCsv(data, kolom);
```

Baris kedua dengan awalan `=` sengaja dimasukkan untuk menguji pengamanannya.

## CSV injection: bahaya yang sering terlewat

Jika sebuah sel diawali `=`, `+`, `-`, atau `@`, Excel dan Google Sheets dapat menganggapnya sebagai **rumus** saat berkas dibuka. Penyerang bisa mengisi kolom nama dengan rumus berbahaya, dan rumus itu berjalan di komputer petugas yang membuka hasil ekspor. Menambahkan tanda petik tunggal di depan nilai membuatnya diperlakukan sebagai teks. Fungsi di atas melakukannya, termasuk untuk sel yang diawali karakter tab atau pemisah baris.

Satu catatan: tanda petik di depan nilai ikut terlihat di sebagian aplikasi. Itu harga yang wajar demi keamanan, terutama jika data berasal dari pengguna. Pertimbangan serupa untuk menulis ke Sheets ada di [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/).

<!-- TAMBAHKAN: bagaimana Anda menangani data dari pengguna sebelum diekspor. -->

## Supaya huruf berakses terbaca di Excel

Excel versi Windows sering salah membaca berkas CSV UTF-8 yang tidak memiliki penanda awal, sehingga huruf seperti "é" atau tanda kutip melengkung rusak. Solusinya menambahkan **BOM** (*byte order mark*) di awal berkas, yaitu karakter `\uFEFF`:

```js
function unduhCsv(teks, namaBerkas) {
  const blob = new Blob(['\uFEFF' + teks], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaBerkas;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

unduhCsv(csv, 'rekap-' + new Date().toISOString().slice(0, 10) + '.csv');
```

Google Sheets dan sebagian besar aplikasi lain membaca CSV dengan BOM tanpa masalah.

## Koma atau titik koma?

Excel memakai *pemisah daftar* dari pengaturan regional komputer. Pada banyak pengaturan Indonesia dan Eropa, pemisahnya adalah **titik koma** karena koma dipakai sebagai pemisah desimal. Akibatnya, CSV berpemisah koma dibuka Excel sebagai satu kolom panjang.

Beberapa cara menanganinya:

- Sediakan pilihan pemisah (koma atau titik koma) di antarmuka ekspor.
- Gunakan titik koma sebagai bawaan jika pengguna Anda mayoritas memakai Excel berbahasa Indonesia, dan cantumkan petunjuk impor.
- Tawarkan ekspor ke format lain, misalnya `.xlsx` lewat pustaka, bila kebutuhan makin kompleks.

Cukup panggil `keCsv(data, kolom, ';')` untuk memakai titik koma.

## Angka, tanggal, dan nomor telepon

- **Angka.** Ekspor angka mentah tanpa pemisah ribuan atau awalan "Rp", agar bisa dijumlahkan. Tampilkan format rupiah di kolom lain atau di Excel.
- **Tanggal.** Gunakan format `YYYY-MM-DD`. Format ini tidak ambigu dan terurut dengan benar.
- **Nomor telepon dan ID dengan nol di depan.** Excel sering menghapus nol di depan (misalnya `0812...` menjadi `812...`). Jika perlu mempertahankannya, tambahkan awalan petik tunggal atau ekspor ke format yang menyimpan tipe data.

## Pertimbangan privasi

Hasil ekspor sering berisi nomor telepon, alamat, atau data lain milik warga. Karena berkas CSV tersimpan di komputer pengguna tanpa perlindungan:

- Ekspor hanya kolom yang benar-benar dibutuhkan.
- Batasi fitur ekspor untuk peran yang berhak.
- Ingatkan pengguna agar menyimpan berkas dengan aman dan menghapusnya setelah selesai.
- Jangan mengekspor data pribadi ke tempat yang tidak aman.

Kebiasaan lain ada di [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

## Kesalahan yang sering terjadi

- **Menggabung teks dengan koma tanpa membungkusnya kutip**, sehingga kolom bergeser.
- **Lupa menggandakan tanda kutip** di dalam nilai.
- **Tidak mengamankan sel dari rumus** (CSV injection).
- **Tidak memakai BOM**, sehingga huruf berakses rusak di Excel.
- **Memakai koma di lingkungan yang memakai titik koma.**
- **Mengekspor nilai yang sudah diformat** (misalnya "Rp 1.500.000") sehingga tidak bisa dihitung.
- **Tidak menguji dengan data yang memuat karakter khusus.**

## Daftar periksa singkat

- ☐ Nilai dengan pemisah, kutip, atau baris baru dibungkus kutip ganda
- ☐ Tanda kutip di dalam nilai digandakan
- ☐ Sel yang diawali `=`, `+`, `-`, `@` diamankan
- ☐ BOM ditambahkan untuk Excel
- ☐ Pemisah sesuai kebutuhan pengguna
- ☐ Angka dan tanggal diekspor dalam bentuk yang bisa diolah
- ☐ Hanya kolom yang diperlukan yang diekspor
- ☐ Sudah diuji di Excel dan Google Sheets

## Kesimpulan

CSV terlihat sederhana, tetapi detailnya menentukan apakah hasil ekspor rapi dan aman: kutip yang benar, BOM untuk Excel, pemisah yang sesuai, dan perlindungan dari rumus. Dengan satu fungsi kecil yang menangani semuanya, fitur ekspor Anda akan jauh lebih andal. Selalu uji dengan data yang sengaja dibuat "nakal".

Untuk kebutuhan laporan berformat resmi, lihat [Membuat Laporan PDF Otomatis dari Google Sheets]({{ site.baseurl }}/2026/10/10/laporan-pdf-dari-google-sheets-apps-script/).
