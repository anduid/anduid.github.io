---
layout: post
title: "Login yang Aman di Aplikasi Web Statis: Jangan Taruh Kata Sandi di Kode"
description: "Kenapa kata sandi dan pemeriksaan hak akses tidak boleh ada di JavaScript klien, dan pola login yang aman untuk aplikasi web statis dengan backend Apps Script."
date: 2026-10-17 00:45:00 +0700
tags: [keamanan, autentikasi, google-apps-script, panduan]

# image: /assets/images/login-aman-web-statis.png
# image_alt: Alur login yang memeriksa kredensial di server, bukan di peramban
---
<!-- CATATAN PENULIS (tidak tampil di situs): jangan menampilkan kredensial, kode, atau kerentanan dari sistem nyata siapa pun, termasuk klien Anda. Gunakan contoh buatan. Tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Saat membuat aplikasi web statis, godaan yang sering muncul adalah membuat halaman login langsung di JavaScript: bandingkan kata sandi yang diketik dengan nilai di kode, lalu tampilkan menu admin. Cara ini terlihat berfungsi, tetapi sebenarnya tidak melindungi apa pun. Siapa pun yang membuka "Lihat Sumber" atau konsol peramban bisa melihat kata sandinya atau melewati pemeriksaannya.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda dengan login di aplikasi web dan pelajaran dari kesalahan yang pernah terjadi. -->

Tulisan ini menjelaskan kenapa pemeriksaan di klien tidak aman, apa yang harus dipindahkan ke server, dan pola login sederhana yang bisa dibangun dengan Apps Script.

<!--more-->

## Prinsip utama: klien tidak bisa dipercaya

Semua kode dan data yang sampai ke peramban bisa dibaca dan diubah pengguna. Jadi apa pun yang Anda periksa di JavaScript hanya bersifat kenyamanan tampilan, bukan keamanan. Contoh pola yang tidak aman:

```js
// TIDAK AMAN: kata sandi tertulis di kode klien
const KATA_SANDI_ADMIN = 'rahasia123';

function login(masukan) {
  if (masukan === KATA_SANDI_ADMIN) {
    localStorage.setItem('admin', 'true'); // dan status disimpan di tempat yang bisa disunting
    tampilkanMenuAdmin();
  }
}
```

Ada dua masalah sekaligus. Kata sandi terbaca oleh siapa pun yang membuka kode sumber, dan status `admin` bisa dibuat sendiri lewat konsol hanya dengan mengetik satu baris.

## Apakah hash di sisi klien cukup?

Sering muncul ide: kalau begitu simpan *hash* kata sandi di kode, lalu bandingkan hasil hash masukan pengguna. Ini lebih baik daripada teks polos, karena kata sandinya tidak langsung terbaca. Tetapi ini **tetap bukan keamanan sungguhan**:

- Penyerang bisa mengambil hash itu dan menebak kata sandi secara luring tanpa batas percobaan. Kata sandi yang lemah bisa ditemukan dalam hitungan detik.
- Pemeriksaan tetap berjalan di peramban, jadi bisa dilewati dengan menyunting kode atau status di konsol.
- Hash dan algoritmanya sudah terlihat oleh semua orang.

Hash di klien hanya menutup pembacaan sekilas. Perlindungan sungguhan harus berada di server.

## Apa yang harus dipindahkan ke server

- **Pemeriksaan kredensial.** Server menerima nama pengguna dan kata sandi, lalu memverifikasinya terhadap data yang tidak pernah dikirim ke klien.
- **Penerbitan sesi.** Setelah login berhasil, server mengeluarkan token acak berumur terbatas.
- **Pemeriksaan hak akses pada setiap permintaan.** Setiap aksi yang butuh izin diperiksa di server memakai token, bukan berdasarkan status yang dikirim klien.
- **Pembatasan percobaan.** Server membatasi jumlah login gagal.

## Pola login sederhana dengan Apps Script

Alurnya: klien mengirim kredensial lewat POST, server memverifikasi, lalu menyimpan token sesi di `CacheService` dengan masa berlaku. Setiap permintaan berikutnya membawa token itu. Berikut kerangka konsepnya (data pengguna ada di sheet `Users`, dengan kolom `username`, `hash`, `salt`, `peran`, `aktif`):

```js
const MASA_SESI_DETIK = 6 * 60 * 60; // maksimum CacheService: 6 jam

function login_(body) {
  const username = String(body.username || '').trim().toLowerCase();
  const sandi = String(body.password || '');
  const cache = CacheService.getScriptCache();

  // batasi percobaan gagal per pengguna
  const kunciGagal = 'gagal:' + username;
  const gagal = Number(cache.get(kunciGagal) || 0);
  if (gagal >= 5) return { ok: false, pesan: 'Terlalu banyak percobaan. Coba lagi nanti.' };

  const user = cariUser_(username); // baca dari sheet Users
  if (!user || String(user.aktif).toUpperCase() === 'FALSE' ||
      !verifikasiSandi_(sandi, user.salt, user.hash)) {
    cache.put(kunciGagal, String(gagal + 1), 15 * 60);
    return { ok: false, pesan: 'Username atau kata sandi salah.' };
  }

  cache.remove(kunciGagal);
  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('sesi:' + token, JSON.stringify({ username: user.username, peran: user.peran }), MASA_SESI_DETIK);
  return { ok: true, token: token, peran: user.peran };
}

function sesi_(token) {
  const mentah = CacheService.getScriptCache().get('sesi:' + String(token || ''));
  return mentah ? JSON.parse(mentah) : null;
}
```

Setiap aksi yang butuh izin lalu memeriksa token di server:

```js
function hapusData_(body) {
  const s = sesi_(body.token);
  if (!s || s.peran !== 'admin') return { ok: false, pesan: 'Tidak diizinkan' };
  // ... lakukan penghapusan
}
```

Pesan galat sengaja dibuat sama untuk "pengguna tidak ada" dan "sandi salah" agar penyerang tidak bisa mengetahui nama pengguna mana yang valid.

<!-- TAMBAHKAN: bagaimana Anda mengelola sesi dan hak akses di aplikasi Anda sendiri. -->

## Menyimpan kata sandi dengan benar

Kata sandi tidak boleh disimpan dalam bentuk asli. Simpan *hash* dengan *salt* unik per pengguna, memakai algoritma yang memang dirancang untuk kata sandi dan sengaja lambat, seperti bcrypt, scrypt, Argon2, atau PBKDF2. Apps Script tidak menyediakan algoritma-algoritma itu secara bawaan, dan membuatnya sendiri dari fungsi dasar mudah keliru. Karena itu, untuk aplikasi yang menyimpan data penting, pertimbangkan alternatif yang lebih aman:

- **Login dengan akun Google** atau penyedia identitas lain, sehingga Anda tidak menyimpan kata sandi sama sekali.
- **Layanan autentikasi pihak ketiga** yang sudah matang.
- **Backend sungguhan** yang punya pustaka kata sandi yang teruji.

Dan sekali lagi: jangan membuat algoritma enkripsi sendiri.

## Token sesi di klien

Klien perlu menyimpan token agar tidak login ulang di setiap halaman. Beberapa catatan:

- Token berumur pendek dan bisa dicabut di server.
- Simpan di `sessionStorage` bila cukup, atau `localStorage` jika perlu bertahan, dengan sadar bahwa skrip di halaman bisa membacanya jika ada celah XSS. Lihat [localStorage di Aplikasi Web: Kapan Aman, Kapan Tidak]({{ site.baseurl }}/2026/10/17/localstorage-aplikasi-web-kapan-aman/).
- Jangan menaruh peran atau status admin sebagai kebenaran di klien. Peran hanya untuk menampilkan atau menyembunyikan menu, sedangkan izin sebenarnya diperiksa server.
- Sediakan tombol keluar yang menghapus token dan mencabut sesinya di server.

## Kesalahan yang sering terjadi

- **Kata sandi atau hash di kode klien.**
- **Status admin disimpan di `localStorage` lalu dipercaya.**
- **Menyembunyikan tombol dianggap sebagai pembatasan akses.** Server tetap harus menolak aksi tanpa izin.
- **Pesan galat yang membocorkan** apakah pengguna ada atau tidak.
- **Tidak ada batas percobaan login.**
- **Menyimpan kata sandi asli di Sheets.**
- **Token tanpa masa berlaku.**

## Daftar periksa singkat

- ☐ Tidak ada kredensial di kode klien
- ☐ Verifikasi login dilakukan di server
- ☐ Kata sandi tersimpan sebagai hash dengan salt, atau memakai login pihak ketiga
- ☐ Token sesi berumur terbatas dan bisa dicabut
- ☐ Setiap aksi yang butuh izin diperiksa di server
- ☐ Percobaan login dibatasi
- ☐ Pesan galat tidak membocorkan informasi
- ☐ Ada tombol keluar yang benar-benar mengakhiri sesi

## Kesimpulan

Keamanan login tidak bisa dibangun di sisi klien. Pindahkan pemeriksaan kredensial dan hak akses ke server, simpan kata sandi dengan benar atau hindari menyimpannya sama sekali, beri sesi masa berlaku, dan batasi percobaan. Pola ini juga selaras dengan kebiasaan lain di [8 Kebiasaan Keamanan Aplikasi Web yang Wajib Dimiliki Pemula]({{ site.baseurl }}/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/) dan pembahasan kunci rahasia di [Mengamankan API Key AI di Aplikasi Web dan Android]({{ site.baseurl }}/2026/10/09/mengamankan-api-key-ai-di-aplikasi/).
