---
layout: post
title: "Chrome DevTools untuk Debugging Aplikasi Web: Console, Network, Application"
description: "Panduan memakai Chrome DevTools untuk mencari masalah di aplikasi web: Console, Network untuk CORS dan API, Application untuk localStorage dan service worker, serta breakpoint."
date: 2026-10-17 01:45:00 +0700
tags: [debugging, chrome, javascript, panduan]

# image: /assets/images/chrome-devtools-debugging.png
# image_alt: Panel Network pada Chrome DevTools menampilkan permintaan ke API
---
<!-- CATATAN PENULIS (tidak tampil di situs): nama menu DevTools bisa berubah antarversi, jadi cocokkan dengan tampilan terbaru dan pasang tangkapan layar dari peramban Anda sendiri. Tambahkan pengalaman debugging nyata Anda di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Setiap pengembang web akhirnya menghadapi hal yang sama: halaman tidak berfungsi dan tidak ada pesan yang jelas. Tombol tidak bereaksi, data tidak muncul, atau tampilan berantakan hanya di satu perangkat. Banyak pemula menebak-nebak lalu mengubah kode secara acak. Cara yang lebih cepat adalah memakai alat bawaan peramban: **Chrome DevTools**.

<!-- TAMBAHKAN (1-2 kalimat): satu kasus debugging nyata yang pernah Anda selesaikan dengan DevTools. -->

Tulisan ini mengenalkan panel yang paling berguna dan menunjukkan cara memakainya untuk masalah yang sering muncul: galat JavaScript, permintaan API yang gagal, CORS, penyimpanan data, dan service worker.

<!--more-->

## Membuka DevTools

Tekan **F12** atau **Ctrl+Shift+I** (di Mac: **Cmd+Option+I**). Atau klik kanan elemen dan pilih **Inspect**. Panel yang akan sering Anda pakai adalah **Console**, **Network**, **Elements**, **Sources**, dan **Application**.

## Console: membaca galat dan mencoba kode

Console menampilkan pesan galat, peringatan, dan hasil `console.log`. Mulailah selalu dari sini. Pesan berwarna merah biasanya menyebutkan jenis galat, pesan, dan berkas serta baris asalnya. Klik nama berkas untuk melompat ke baris tersebut.

Beberapa galat umum dan artinya:

| Pesan | Artinya biasanya |
|-------|------------------|
| `Uncaught TypeError: Cannot read properties of null` | Elemen atau data yang dicari tidak ada (id salah atau skrip jalan sebelum halaman siap) |
| `Uncaught ReferenceError: x is not defined` | Variabel atau fungsi belum dibuat atau salah ketik |
| `Failed to load resource: 404` | Berkas atau alamat tidak ditemukan |
| `blocked by CORS policy` | Server tidak mengizinkan permintaan dari asal halaman Anda |

Anda juga bisa mengetik kode langsung di Console untuk mencoba hal cepat:

```js
document.querySelectorAll('img').length   // berapa gambar di halaman?
localStorage.getItem('tema')              // apa isi penyimpanan?
```

Untuk mencatat nilai, gunakan `console.log()`, atau `console.table()` agar data berbentuk daftar tampil rapi:

```js
console.table(daftarUmkm);
```

## Network: memeriksa permintaan ke server

Panel Network menampilkan setiap permintaan yang dikirim halaman. Ini alat utama untuk masalah API.

1. Buka panel **Network**, lalu muat ulang halaman (atau jalankan aksi yang bermasalah).
2. Klik permintaan yang dicurigai.
3. Periksa tab **Headers** (alamat, metode, status), **Payload** (data yang dikirim), dan **Response** (jawaban server).

Yang perlu diperhatikan:

- **Status 200** berarti berhasil. **404** tidak ditemukan, **403** ditolak, **500** galat di server.
- **Merah** pada daftar berarti permintaan gagal, biasanya karena CORS, jaringan, atau alamat salah.
- Pastikan data yang dikirim sesuai harapan. Banyak galat ternyata berasal dari data kosong atau salah format.
- Kolom **Time** menunjukkan permintaan yang lambat.

Untuk aplikasi dengan backend Apps Script, lihat di tab Response apakah balasan berupa JSON yang Anda harapkan atau halaman galat HTML. Pola API-nya dibahas di [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).

<!-- TAMBAHKAN: kasus masalah API atau CORS yang Anda temukan lewat panel Network dan cara memperbaikinya. -->

## Memahami galat CORS

Pesan "blocked by CORS policy" sangat sering membingungkan. Maknanya: peramban menolak membaca jawaban karena server tidak memberi izin untuk asal halaman Anda. Hal yang bisa diperiksa di DevTools:

- Apakah ada permintaan **preflight** (`OPTIONS`) sebelum permintaan utama? Permintaan yang memakai `Content-Type: application/json` memicunya, sedangkan `text/plain` tidak.
- Apakah header respons memuat `Access-Control-Allow-Origin`?
- Apakah alamat yang dipanggil benar, atau server mengalihkan ke halaman lain?

Perbaikan CORS selalu ada di sisi server atau cara permintaan dikirim, bukan di kode tampilan.

## Application: penyimpanan dan service worker

Panel **Application** menunjukkan data yang disimpan peramban:

- **Local storage** dan **Session storage**: lihat, ubah, dan hapus kunci. Berguna untuk mengecek apakah data benar tersimpan. Lihat [localStorage di Aplikasi Web: Kapan Aman, Kapan Tidak]({{ site.baseurl }}/2026/10/17/localstorage-aplikasi-web-kapan-aman/).
- **Cookies**: periksa nilai dan masa berlakunya.
- **Service workers**: lihat apakah terdaftar, matikan, atau paksa pembaruan. Centang **Update on reload** saat mengembangkan PWA supaya cache lama tidak menjebak Anda. Dasarnya ada di [Membuat PWA Sederhana]({{ site.baseurl }}/2026/10/11/pwa-sederhana-web-app-dipasang-di-ponsel/).
- **Storage > Clear site data**: menghapus semua data situs sekaligus untuk memulai dari kondisi bersih.

## Elements: memeriksa HTML dan CSS

Panel **Elements** menampilkan struktur halaman *setelah* diproses JavaScript. Klik ikon pemilih di sudut kiri atas, lalu klik elemen di halaman untuk melihat HTML dan CSS-nya. Di panel **Styles** Anda bisa:

- melihat aturan CSS mana yang berlaku dan mana yang tertimpa (dicoret),
- mengubah nilai langsung untuk mencoba hasilnya,
- mencentang atau menghapus centang aturan untuk melihat dampaknya.

Perubahan di sini bersifat sementara. Salin yang berhasil ke berkas kode Anda.

Untuk menguji tampilan ponsel, aktifkan **Toggle device toolbar** (**Ctrl+Shift+M**) dan pilih ukuran layar. Tetap uji juga di perangkat nyata. Dasar tata letaknya ada di [CSS Grid dan Flexbox]({{ site.baseurl }}/2026/10/17/css-grid-flexbox-tata-letak-responsif/).

## Sources: breakpoint untuk menelusuri kode

Jika `console.log` tidak cukup, hentikan kode di tengah jalan:

1. Buka panel **Sources** dan pilih berkas JavaScript Anda.
2. Klik nomor baris untuk memasang **breakpoint**.
3. Jalankan aksi yang memicu kode itu. Eksekusi berhenti di baris tersebut.
4. Periksa nilai variabel di panel **Scope** atau arahkan kursor ke variabel.
5. Gunakan tombol **Step over** untuk berjalan baris demi baris.

Anda juga bisa menulis kata kunci `debugger;` di kode untuk memaksa berhenti saat DevTools terbuka. Hapus sebelum rilis.

## Lighthouse: pemeriksaan kualitas otomatis

Panel **Lighthouse** menjalankan audit kinerja, aksesibilitas, praktik terbaik, dan SEO, lalu memberi daftar perbaikan. Jalankan di mode penyamaran agar ekstensi peramban tidak memengaruhi hasil, dan gunakan skornya sebagai petunjuk arah, bukan sasaran mutlak.

## Kebiasaan debugging yang efisien

- **Mulai dari Console.** Baca galat pertama, karena galat berikutnya sering akibatnya.
- **Perkecil masalah.** Hapus bagian-bagian sampai masalahnya hilang untuk menemukan penyebabnya.
- **Ubah satu hal setiap kali**, lalu uji ulang.
- **Muat ulang keras** (**Ctrl+Shift+R**) untuk melewati cache.
- **Cek versi yang dilayani.** Pastikan peramban memuat berkas terbaru, bukan salinan lama dari cache atau service worker.
- **Catat apa yang sudah dicoba**, agar tidak mengulang.

## Kesalahan yang sering terjadi

- **Mengabaikan galat merah di Console.**
- **Menebak penyebab tanpa melihat panel Network.**
- **Tidak menyadari cache atau service worker** menyajikan berkas lama.
- **Mengubah banyak hal sekaligus**, sehingga tidak tahu mana yang memperbaiki.
- **Meninggalkan `console.log` dan `debugger` di kode produksi**, apalagi yang mencetak data pribadi.

## Kesimpulan

DevTools mengubah debugging dari menebak menjadi menyelidiki: Console untuk galat, Network untuk permintaan dan CORS, Application untuk penyimpanan dan service worker, Elements untuk HTML dan CSS, dan Sources untuk breakpoint. Biasakan membuka DevTools sejak awal pengembangan, bukan hanya saat ada masalah.
