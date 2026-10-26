---
layout: post
title: "JavaScript Modern untuk Pemula: Dari let dan const sampai async/await"
description: "Panduan JavaScript modern: let dan const, arrow function, destructuring, spread, optional chaining, method array, modul, Promise, dan async/await lengkap dengan contoh kode."
date: 2026-10-26 01:00:00 +0700
tags: [javascript, pemrograman, tutorial]

# image: /assets/images/javascript-modern-dasar.png
# image_alt: Contoh kode JavaScript modern dengan arrow function dan async/await
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan setiap contoh di Console peramban atau Node.js, lalu tambahkan pengalaman Anda belajar atau memakai JavaScript di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

JavaScript yang ditulis hari ini sangat berbeda dari JavaScript sepuluh tahun lalu. Sejak ES6 (2015) dan pembaruan tahunan setelahnya, bahasa ini punya sintaks yang jauh lebih ringkas dan aman. Jika Anda masih menulis `var` dan fungsi berantai callback, banyak pekerjaan bisa dipersingkat dengan fitur-fitur modern.

<!-- TAMBAHKAN (1-2 kalimat): bagaimana Anda memakai JavaScript di proyek nyata dan fitur modern yang paling membantu. -->

Tulisan ini merangkum fitur JavaScript modern yang paling sering dipakai, masing-masing dengan contoh kecil yang bisa langsung dicoba di Console peramban.

<!--more-->

## let dan const, tinggalkan var

`var` punya cakupan yang membingungkan dan bisa dideklarasi ulang tanpa peringatan. Pakai `const` secara bawaan, dan `let` hanya jika nilainya akan diubah:

```js
const namaBlog = 'Blog Andu';   // tidak bisa diisi ulang
let jumlah = 0;                 // boleh berubah
jumlah += 1;
```

Perhatikan: `const` mencegah penugasan ulang variabel, bukan mengubah isi objek. `const daftar = []; daftar.push(1);` tetap sah.

## Template literal

Gabungkan teks dan nilai dengan tanda backtick:

```js
const nama = 'Sari';
const pesan = `Halo, ${nama}! Jumlah catatan: ${3 + 2}.`;
```

Template literal juga bisa berbaris-baris tanpa perlu `\n`.

## Arrow function

Sintaks fungsi yang lebih ringkas:

```js
const kuadrat = (x) => x * x;
const sapa = (nama) => `Halo, ${nama}`;
const jumlahkan = (a, b) => {
  const hasil = a + b;
  return hasil;
};
```

Jika isinya satu ekspresi, `return` bisa dihilangkan. Arrow function juga tidak punya `this` sendiri, yang sering menjadi keuntungan di dalam callback.

## Destructuring: membongkar objek dan array

Ambil beberapa nilai sekaligus:

```js
const pengguna = { nama: 'Sari', umur: 28, kota: 'Bekasi' };
const { nama, kota } = pengguna;

const [pertama, kedua] = ['a', 'b', 'c'];

// nilai bawaan dan nama baru
const { umur: usia = 0, hobi = 'membaca' } = pengguna;
```

Destructuring sangat berguna pada parameter fungsi:

```js
function tampilkan({ nama, kota = '-' }) {
  return `${nama} (${kota})`;
}
```

## Spread dan rest

Tiga titik (`...`) menyalin atau mengumpulkan elemen:

```js
const a = [1, 2];
const b = [...a, 3, 4];          // [1, 2, 3, 4]

const dasar = { tema: 'gelap', bahasa: 'id' };
const pengaturan = { ...dasar, bahasa: 'en' }; // salin lalu timpa

function total(...angka) {       // rest: kumpulkan argumen
  return angka.reduce((s, x) => s + x, 0);
}
```

Spread membuat salinan dangkal. Objek bersarang tetap dibagi referensinya.

## Optional chaining dan nullish coalescing

Dua operator ini menghilangkan banyak `if` pemeriksaan:

```js
const kota = pengguna?.alamat?.kota ?? 'Tidak diketahui';
```

`?.` berhenti dan menghasilkan `undefined` jika bagian di tengah kosong, bukan melempar galat. `??` memberi nilai cadangan **hanya** jika nilai kiri `null` atau `undefined`. Berbeda dengan `||` yang juga menganggap `0` dan teks kosong sebagai "salah":

```js
const jumlah = 0;
console.log(jumlah || 10); // 10  (mungkin tidak diinginkan)
console.log(jumlah ?? 10); // 0
```

## Method array: map, filter, reduce

Olah daftar tanpa perulangan manual:

```js
const usaha = [
  { nama: 'Warung A', omzet: 5, aktif: true },
  { nama: 'Kriya B', omzet: 12, aktif: false },
  { nama: 'Jasa C', omzet: 8, aktif: true }
];

const namaAktif = usaha.filter((u) => u.aktif).map((u) => u.nama);
// ['Warung A', 'Jasa C']

const totalOmzet = usaha.reduce((jumlah, u) => jumlah + u.omzet, 0); // 25

const adaBesar = usaha.some((u) => u.omzet > 10);    // true
const semuaAktif = usaha.every((u) => u.aktif);      // false
const kriya = usaha.find((u) => u.nama.startsWith('Kriya'));
```

Method ini tidak mengubah array asli (kecuali `sort`, yang mengubahnya), dan hasilnya mudah dirangkai.

## Modul: memecah kode ke beberapa berkas

```js
// matematika.js
export const pi = 3.14159;
export function luasLingkaran(r) { return pi * r * r; }
export default function sapa() { return 'Halo'; }

// app.js
import sapa, { luasLingkaran } from './matematika.js';
```

Di halaman web, muat dengan `<script type="module" src="app.js"></script>`. Modul berjalan di mode ketat dan punya cakupan sendiri, sehingga tidak mengotori variabel global.

## Promise dan async/await

Operasi yang butuh waktu, seperti memanggil API, mengembalikan **Promise**. Dengan `async/await`, kodenya terbaca seperti urutan biasa:

```js
async function ambilCatatan(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal: ' + res.status);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Terjadi galat:', err.message);
    return [];
  }
}
```

Beberapa hal penting:

- `await` hanya boleh dipakai di dalam fungsi `async` (atau di tingkat atas modul).
- `fetch` **tidak** melempar galat untuk status 404 atau 500. Periksa `res.ok` sendiri.
- Gunakan `try/catch` untuk menangani kegagalan jaringan.

Untuk beberapa permintaan yang saling bebas, jalankan bersamaan:

```js
const [profil, statistik] = await Promise.all([
  fetch('/api/profil').then((r) => r.json()),
  fetch('/api/statistik').then((r) => r.json())
]);
```

`Promise.all` gagal jika salah satu gagal. Gunakan `Promise.allSettled` bila Anda ingin hasil setiap permintaan apa pun statusnya. Penerapan nyata pola `fetch` dan CORS ada di [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/blog/2026/10/09/backend-gratis-google-apps-script-sheets/).

<!-- TAMBAHKAN: satu contoh dari proyek Anda (misalnya mengambil data dari API) dan kendala yang ditemui. -->

## Kesalahan yang sering terjadi

- **Memakai `==`** yang melakukan konversi tipe. Gunakan `===`.
- **Lupa `await`**, sehingga yang didapat adalah Promise, bukan datanya.
- **Mengubah array atau objek asli** secara tidak sengaja. Salin dulu dengan spread.
- **`sort()` tanpa pembanding** pada angka. Hasilnya diurutkan sebagai teks: `[10, 9, 1].sort()` menjadi `[1, 10, 9]`. Pakai `sort((a, b) => a - b)`.
- **Menelan galat** dengan `catch` kosong.
- **Memakai `innerHTML` dengan data pengguna** sehingga membuka celah XSS, seperti dibahas di [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/blog/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

## Cara belajar yang efektif

- Ketik dan jalankan contoh sendiri di Console, jangan hanya membaca.
- Bangun proyek kecil, misalnya daftar tugas atau [aplikasi catatan keuangan]({{ site.baseurl }}/blog/2026/10/10/aplikasi-catatan-keuangan-google-sheets-html/).
- Baca dokumentasi resmi di MDN Web Docs untuk detail dan kompatibilitas peramban.
- Pakai alat pemeriksa gaya seperti ESLint agar kebiasaan buruk cepat terdeteksi.

## Kesimpulan

Fitur JavaScript modern membuat kode lebih pendek, jelas, dan aman: `const` dan `let`, arrow function, destructuring, spread, `?.` dan `??`, method array, modul, dan `async/await`. Kuasai fitur-fitur ini satu per satu lewat proyek kecil, dan Anda akan jauh lebih nyaman membaca serta menulis kode JavaScript apa pun.
