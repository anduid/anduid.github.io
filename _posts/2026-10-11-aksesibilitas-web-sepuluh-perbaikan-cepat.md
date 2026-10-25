---
layout: post
title: "Aksesibilitas Web: 10 Perbaikan Cepat agar Situs Ramah untuk Semua"
description: "Sepuluh perbaikan cepat aksesibilitas web: alt text, kontras warna, label formulir, struktur judul, navigasi keyboard, fokus terlihat, dan tombol yang benar."
date: 2026-10-11 00:45:00 +0700
tags: [aksesibilitas, web, desain, panduan]

# image: /assets/images/aksesibilitas-web.png
# image_alt: Ilustrasi situs web yang dapat diakses dengan keyboard dan pembaca layar
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan pengalaman Anda menguji aksesibilitas (misalnya mencoba situs Anda hanya dengan keyboard) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Aksesibilitas web berarti memastikan situs bisa dipakai oleh sebanyak mungkin orang, termasuk pengguna pembaca layar, pengguna yang hanya memakai keyboard, orang dengan penglihatan terbatas atau buta warna, dan pengguna dengan koneksi atau perangkat yang terbatas. Manfaatnya meluas: situs yang ramah akses biasanya juga lebih mudah dipahami mesin pencari dan lebih nyaman bagi semua pengunjung.

<!-- TAMBAHKAN (1-2 kalimat): alasan Anda peduli pada aksesibilitas atau pengalaman Anda memperbaikinya di situs sendiri. -->

Kabar baiknya, banyak perbaikan paling penting bisa dikerjakan dalam hitungan menit. Berikut sepuluh di antaranya, dengan contoh singkat.

<!--more-->

## 1. Gunakan bahasa dan judul halaman yang benar

Atur bahasa halaman di tag `html` supaya pembaca layar memakai pelafalan yang tepat, dan beri setiap halaman judul `<title>` yang unik:

```html
<html lang="id">
<head>
  <title>Panduan Digitalisasi Arsip | Blog Andu</title>
</head>
```

## 2. Susun struktur judul dengan benar

Pengguna pembaca layar sering melompat antar judul untuk memindai halaman. Gunakan satu `<h1>`, lalu `<h2>` untuk bagian utama dan `<h3>` untuk rinciannya, tanpa melompati tingkat. Atur ukuran huruf lewat CSS, bukan dengan memilih tag judul berdasarkan tampilan.

## 3. Beri alt text pada gambar

Setiap gambar yang bermakna butuh teks alternatif yang menjelaskan isi atau fungsinya. Gambar yang hanya dekorasi diberi `alt=""`:

```html
<img src="alur.png" alt="Diagram alur data dari halaman web ke Apps Script dan Sheets">
<img src="garis-hias.png" alt="">
```

Penjelasan lebih lengkap ada di [Optimasi Gambar untuk Blog]({{ site.baseurl }}/2026/10/10/optimasi-gambar-blog-format-ukuran-lazy-loading/).

## 4. Jaga kontras warna

Teks harus cukup kontras dengan latarnya. Pedoman WCAG level AA meminta rasio kontras minimal 4,5:1 untuk teks biasa dan 3:1 untuk teks besar. Periksa dengan alat pemeriksa kontras, dan jangan hanya mengandalkan mata Anda. Abu-abu muda di atas putih adalah kesalahan yang sangat umum.

## 5. Jangan hanya mengandalkan warna

Informasi yang hanya dibedakan lewat warna, seperti "kolom merah berarti salah", tidak terbaca oleh pengguna buta warna. Tambahkan teks atau ikon:

```html
<p class="galat">Galat: jumlah harus lebih dari nol.</p>
```

## 6. Pastikan semuanya bisa dioperasikan dengan keyboard

Coba tekan tombol Tab di situs Anda tanpa menyentuh mouse. Semua tautan, tombol, dan kolom isian harus bisa dijangkau dan dioperasikan, dengan urutan yang masuk akal.

<!-- TAMBAHKAN: hasil Anda mencoba situs hanya dengan keyboard dan hal yang Anda temukan. -->

## 7. Jangan hilangkan indikator fokus

Garis di sekeliling elemen yang sedang aktif menunjukkan posisi pengguna keyboard. Menghapusnya dengan `outline: none` membuat pengguna tersesat. Jika tidak suka tampilan bawaan, ganti dengan yang jelas:

```css
:focus-visible {
  outline: 3px solid #2f6df6;
  outline-offset: 2px;
}
```

## 8. Beri label pada kolom formulir

Setiap kolom isian butuh label yang terhubung agar pembaca layar mengumumkan fungsinya, dan agar mengetuk label memfokuskan kolom:

```html
<label for="email">Alamat email</label>
<input id="email" type="email" autocomplete="email">
```

Jangan menjadikan teks placeholder sebagai satu-satunya label, karena hilang saat pengguna mulai mengetik.

## 9. Gunakan elemen HTML yang tepat

Tombol harus `<button>`, tautan harus `<a href>`. Membuat tombol dari `<div>` dengan penangan klik kehilangan dukungan keyboard dan peran yang dikenali pembaca layar:

```html
<!-- Kurang baik -->
<div onclick="kirim()">Kirim</div>

<!-- Lebih baik -->
<button type="button" onclick="kirim()">Kirim</button>
```

HTML semantik seperti `<nav>`, `<main>`, `<header>`, dan `<footer>` juga memberi struktur yang dipahami teknologi bantu. Gunakan atribut ARIA hanya bila HTML biasa tidak cukup.

## 10. Sediakan tautan lompat dan teks tautan yang jelas

Tautan "Lompat ke konten" di awal halaman membantu pengguna keyboard melewati menu yang panjang. Teks tautan juga harus bermakna di luar konteks. Hindari "klik di sini":

```html
<a class="lompat" href="#isi">Lompat ke konten</a>

<!-- Kurang baik -->
<a href="/panduan">Klik di sini</a>
<!-- Lebih baik -->
<a href="/panduan">Baca panduan digitalisasi arsip</a>
```

## Cara menguji aksesibilitas

- **Uji keyboard.** Telusuri seluruh halaman dengan Tab, Shift+Tab, Enter, dan Spasi.
- **Pembaca layar.** Coba dengan pembaca layar bawaan perangkat, misalnya TalkBack di Android atau VoiceOver di perangkat Apple.
- **Alat otomatis.** Gunakan Lighthouse atau ekstensi pemeriksa aksesibilitas untuk menangkap masalah umum. Alat otomatis hanya menemukan sebagian masalah, jadi pengujian manual tetap perlu.
- **Perbesar teks.** Perbesar tampilan hingga 200 persen dan pastikan tata letak tidak rusak.
- **Mode kontras dan tema gelap.** Pastikan tetap terbaca, seperti yang dibahas di [Dark Mode di Jetpack Compose]({{ site.baseurl }}/2026/10/09/dark-mode-jetpack-compose-android/) untuk sisi Android.

## Kesalahan yang sering terjadi

- Menghapus `outline` tanpa pengganti.
- Teks abu-abu terang yang kontrasnya rendah.
- Gambar tanpa `alt`, atau `alt` berisi nama berkas.
- Menu atau kotak dialog yang tidak bisa dioperasikan dengan keyboard.
- Formulir yang hanya memakai placeholder sebagai label.
- Konten penting yang hanya muncul saat kursor diarahkan (*hover*).

## Kesimpulan

Aksesibilitas bukan fitur tambahan, melainkan bagian dari kualitas situs. Sepuluh perbaikan di atas, mulai dari bahasa halaman, judul, alt text, kontras, keyboard, fokus, label, elemen yang tepat, sampai tautan yang jelas, bisa Anda terapkan dalam satu sore. Mulailah dari menguji situs Anda hanya dengan keyboard, dan perbaiki yang pertama kali Anda temukan.
