---
layout: post
title: "8 Kebiasaan Keamanan Aplikasi Web yang Wajib Dimiliki Pemula"
description: "Delapan kebiasaan keamanan aplikasi web untuk pemula: validasi di server, mencegah XSS, HTTPS, hak akses minimal, pengelolaan rahasia, dependensi, dan cadangan."
date: 2026-10-10 01:15:00 +0700
tags: [keamanan, web, panduan]

# image: /assets/images/keamanan-aplikasi-web.png
# image_alt: Delapan lapisan keamanan melindungi aplikasi web
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan pengalaman nyata (kesalahan yang pernah Anda perbaiki atau hampir terjadi) di bagian bertanda "TAMBAHKAN", tanpa membuka detail sistem sungguhan. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Banyak pengembang pemula menganggap keamanan sebagai urusan nanti, setelah fitur selesai. Padahal sebagian besar celah yang sering diserang bukan serangan canggih, melainkan kelalaian dasar: data tidak divalidasi, kunci rahasia tersimpan di tempat yang salah, atau akses terlalu longgar. Kabar baiknya, kebiasaan dasar saja sudah menutup sebagian besar risiko yang paling umum.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda soal keamanan di aplikasi yang Anda bangun. -->

Tulisan ini merangkum delapan kebiasaan yang bisa Anda terapkan sejak proyek pertama.

<!--more-->

## 1. Jangan percaya data dari pengguna

Semua yang masuk dari peramban atau aplikasi bisa dipalsukan. Periksa tipe, panjang, dan format data **di server**, bukan hanya di halaman. Validasi di sisi klien hanya untuk kenyamanan pengguna, bukan perlindungan. Tolak data yang tidak sesuai, dan batasi nilai yang diterima ke daftar yang jelas.

## 2. Cegah XSS dengan tidak menyisipkan teks sebagai HTML

*Cross-site scripting* (XSS) terjadi ketika teks dari pengguna disisipkan ke halaman sebagai HTML sehingga skrip berbahaya ikut berjalan. Contoh kebiasaan yang berisiko dan yang lebih aman:

```js
// Berisiko: teks pengguna dibaca sebagai HTML
elemen.innerHTML = komentar;

// Lebih aman: teks diperlakukan sebagai teks biasa
elemen.textContent = komentar;
```

Jika Anda harus membangun HTML dari data, ubah karakter khusus seperti `<`, `>`, dan `&` menjadi entitas HTML sebelum disisipkan. Banyak kerangka kerja modern sudah melakukannya otomatis, tetapi hati-hati dengan fitur yang melewatinya.

## 3. Selalu pakai HTTPS

HTTPS mengenkripsi data antara pengguna dan server. GitHub Pages dan banyak layanan hosting menyediakannya gratis, jadi aktifkan dan paksa semua akses lewat HTTPS. Hindari memuat skrip atau gambar lewat `http://` karena bisa diblokir atau disadap.

## 4. Berikan hak akses sekecil mungkin

Prinsip *least privilege*: setiap pengguna, skrip, dan layanan hanya mendapat akses yang benar-benar dibutuhkan.

- Pisahkan peran, misalnya pengguna biasa dan admin.
- Periksa hak akses di server pada setiap permintaan, bukan hanya menyembunyikan tombol di tampilan.
- Beri akun layanan dan kunci API izin yang minimal.
- Hapus akses pengguna yang sudah tidak aktif.

## 5. Simpan rahasia di tempat yang benar

Kunci API, kata sandi basis data, dan token tidak boleh ditulis di kode klien atau repositori publik. Simpan di pengaturan rahasia platform atau variabel lingkungan di server. Jika rahasia pernah bocor, anggap sudah terkompromi: cabut dan ganti. Pembahasan lengkapnya ada di [Mengamankan API Key AI di Aplikasi Web dan Android]({{ site.baseurl }}/2026/10/09/mengamankan-api-key-ai-di-aplikasi/).

## 6. Simpan kata sandi dengan benar

Jika aplikasi punya login sendiri:

- Jangan pernah menyimpan kata sandi asli. Simpan *hash* dengan algoritma yang dirancang untuk kata sandi, seperti bcrypt, scrypt, atau Argon2, lengkap dengan *salt*.
- Jangan membuat algoritma enkripsi sendiri.
- Pertimbangkan memakai penyedia login yang sudah matang, seperti login Google, daripada membangun semuanya dari nol.
- Batasi percobaan login yang gagal.

## 7. Perbarui dependensi dan pustaka

Pustaka yang Anda pakai bisa memiliki celah yang sudah diketahui. Perbarui secara berkala, buang pustaka yang tidak dipakai, dan hanya ambil dari sumber tepercaya. Untuk skrip dari CDN, pakai versi yang dipatok dan hindari memuat skrip dari sumber yang tidak Anda kenal. Fitur peringatan keamanan di GitHub (misalnya Dependabot) bisa memberi tahu saat ada dependensi bermasalah.

<!-- TAMBAHKAN: kebiasaan pembaruan dependensi yang Anda jalankan di proyek Anda. -->

## 8. Siapkan cadangan dan jejak aktivitas

Tidak ada sistem yang kebal. Yang membedakan adalah seberapa cepat Anda pulih dan seberapa jelas Anda melihat apa yang terjadi:

- Buat cadangan terjadwal dan uji pemulihannya. Contoh otomatisasi cadangan ada di [Trigger Apps Script]({{ site.baseurl }}/2026/10/10/trigger-apps-script-tugas-otomatis/).
- Catat aktivitas penting seperti login, perubahan data, dan penghapusan.
- Pantau pola yang tidak biasa, misalnya lonjakan permintaan.

## Tambahan: header keamanan dan CSP

Untuk perlindungan lapis berikutnya, *Content Security Policy* (CSP) membatasi sumber skrip yang boleh dijalankan halaman. Di hosting yang mengizinkan pengaturan header, atur CSP lewat header. Di hosting statis yang tidak mengizinkannya, Anda bisa memakai tag `meta`, meski kemampuannya lebih terbatas:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; img-src 'self' data:">
```

Atur kebijakan sesuai sumber yang memang Anda pakai, dan uji sebelum diterapkan penuh karena kebijakan yang terlalu ketat dapat merusak halaman.

## Kesalahan yang sering terjadi

- **Hanya memvalidasi di JavaScript halaman.**
- **Menyisipkan data pengguna dengan `innerHTML`.**
- **Menaruh kunci API di kode klien atau repositori publik.**
- **Menganggap token di halaman web sebagai perlindungan.**
- **Memberi semua pengguna akses ke semua data.**
- **Tidak pernah menguji cadangan.**

## Daftar periksa singkat

- ☐ Data divalidasi di server
- ☐ Teks pengguna tidak disisipkan sebagai HTML
- ☐ HTTPS aktif dan dipaksakan
- ☐ Hak akses diperiksa di server
- ☐ Rahasia tersimpan aman dan tidak ada di repositori
- ☐ Kata sandi di-hash, bukan disimpan asli
- ☐ Dependensi diperbarui berkala
- ☐ Cadangan dan log aktivitas berjalan

## Kesimpulan

Keamanan bukan fitur tambahan, melainkan kebiasaan yang dibangun sejak awal. Validasi di server, hindari XSS, pakai HTTPS, batasi akses, jaga rahasia, simpan kata sandi dengan benar, perbarui dependensi, dan siapkan cadangan. Delapan hal ini tidak menjamin sistem kebal, tetapi menutup sebagian besar celah yang paling sering dimanfaatkan.
