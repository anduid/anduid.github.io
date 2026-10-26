---
layout: post
title: "Big-O dan Struktur Data Dasar: Kenapa Set dan Map Bisa Membuat Kode Lebih Cepat"
description: "Memahami Big-O dengan contoh JavaScript: O(1), O(n), O(n log n), O(n kuadrat), memilih Array, Set, atau Map, pencarian biner, dan cara menghindari perulangan bersarang."
date: 2026-10-26 01:30:00 +0700
tags: [algoritma, struktur-data, javascript, pemrograman]

# image: /assets/images/big-o-struktur-data.png
# image_alt: Grafik pertumbuhan waktu proses menurut notasi Big-O
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan contoh dan ukur waktunya sendiri di komputer Anda (angka bisa berbeda), lalu tambahkan pengalaman Anda mengoptimasi kode di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Kode yang berjalan lancar dengan seratus data bisa merayap dengan seratus ribu data. Penyebabnya sering bukan komputer yang lambat, melainkan pilihan algoritma dan struktur data yang tidak cocok dengan pertumbuhan data. Notasi **Big-O** adalah bahasa untuk membicarakan hal itu: bagaimana waktu proses tumbuh saat jumlah data bertambah.

<!-- TAMBAHKAN (1-2 kalimat): kasus nyata aplikasi Anda yang melambat saat datanya membesar dan cara Anda memperbaikinya. -->

Tulisan ini menjelaskan Big-O tanpa matematika berat, memakai contoh JavaScript yang bisa Anda jalankan sendiri.

<!--more-->

## Apa itu Big-O

Big-O menggambarkan **laju pertumbuhan** pekerjaan terhadap ukuran masukan `n`, bukan waktu persis dalam detik. Yang penting adalah bentuk kurvanya:

| Notasi | Nama | Contoh |
|--------|------|--------|
| O(1) | Konstan | Mengambil elemen array lewat indeks |
| O(log n) | Logaritmik | Pencarian biner pada data terurut |
| O(n) | Linear | Menelusuri seluruh array sekali |
| O(n log n) | Linearitmik | Pengurutan yang efisien |
| O(n²) | Kuadratik | Perulangan di dalam perulangan |

Jika data menjadi 10 kali lebih banyak: O(n) memakan sekitar 10 kali waktu, sedangkan O(n²) sekitar 100 kali. Itulah sebabnya O(n²) cepat menjadi masalah.

## O(1): akses langsung

```js
const daftar = [10, 20, 30, 40];
const ketiga = daftar[2];       // O(1): langsung ke posisinya

const harga = { apel: 5000, jeruk: 7000 };
const hargaApel = harga.apel;   // O(1) rata-rata: pencarian kunci pada objek
```

## O(n): menelusuri semua elemen

```js
function adaNilai(daftar, target) {
  for (const x of daftar) {
    if (x === target) return true;
  }
  return false;
}
```

Pada kasus terburuk, seluruh elemen diperiksa. `includes`, `indexOf`, `find`, `filter`, dan `map` pada array semuanya O(n).

## O(n²): jebakan perulangan bersarang

Misalkan Anda ingin mencari ID yang muncul dua kali dalam daftar:

```js
// O(n^2): untuk setiap elemen, telusuri lagi seluruh daftar
function duplikatLambat(ids) {
  const hasil = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (ids[i] === ids[j] && !hasil.includes(ids[i])) hasil.push(ids[i]);
    }
  }
  return hasil;
}
```

Dengan 100 ribu data, jumlah perbandingannya mencapai miliaran. Perbaikannya memakai struktur data yang punya pencarian cepat.

## Set dan Map: pencarian rata-rata O(1)

`Set` menyimpan nilai unik, dan `Map` menyimpan pasangan kunci-nilai. Keduanya mengecek keberadaan elemen dengan sangat cepat (rata-rata O(1)):

```js
// O(n): satu kali telusur
function duplikatCepat(ids) {
  const dilihat = new Set();
  const duplikat = new Set();
  for (const id of ids) {
    if (dilihat.has(id)) duplikat.add(id);
    else dilihat.add(id);
  }
  return [...duplikat];
}

// Menghitung kemunculan dengan Map
function hitung(daftar) {
  const m = new Map();
  for (const x of daftar) m.set(x, (m.get(x) || 0) + 1);
  return m;
}
```

Versi dengan `Set` hanya menelusuri daftar sekali. Selisih kecepatannya pada data besar bisa dari menit menjadi milidetik.

Satu contoh klasik lain, mencari dua angka yang berjumlah target (*two sum*):

```js
function duaAngka(angka, target) {
  const peta = new Map(); // nilai -> indeks
  for (let i = 0; i < angka.length; i++) {
    const kebutuhan = target - angka[i];
    if (peta.has(kebutuhan)) return [peta.get(kebutuhan), i];
    peta.set(angka[i], i);
  }
  return null;
}
```

Versi naif memakai dua perulangan bersarang (O(n²)). Versi ini O(n) karena `Map` menggantikan perulangan kedua.

<!-- TAMBAHKAN: contoh dari pekerjaan Anda di mana mengganti Array dengan Set atau Map mempercepat proses. -->

## Pencarian biner: O(log n)

Jika data **sudah terurut**, Anda tidak perlu memeriksa semuanya. Bagi dua ruang pencarian di setiap langkah:

```js
function cariBiner(arr, target) {
  let kiri = 0;
  let kanan = arr.length - 1;
  while (kiri <= kanan) {
    const tengah = Math.floor((kiri + kanan) / 2);
    if (arr[tengah] === target) return tengah;
    if (arr[tengah] < target) kiri = tengah + 1;
    else kanan = tengah - 1;
  }
  return -1;
}
```

Pada satu juta elemen, paling banyak sekitar 20 langkah. Syaratnya data terurut. Biaya mengurutkan sendiri O(n log n), jadi pencarian biner menguntungkan jika Anda mencari berkali-kali.

## Mengurutkan dengan benar

`Array.prototype.sort` umumnya O(n log n), tetapi hati-hati dengan perilaku bawaannya: tanpa pembanding, ia mengurutkan sebagai **teks**:

```js
[10, 9, 1].sort();              // [1, 10, 9]  (urutan teks!)
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]  (urutan angka)
```

`sort` juga mengubah array aslinya. Salin dulu jika perlu: `[...daftar].sort(...)`.

## Memilih struktur data

| Kebutuhan | Pilihan yang cocok |
|-----------|--------------------|
| Daftar berurutan, akses lewat indeks | Array |
| Cek keberadaan cepat, nilai unik | Set |
| Cari berdasarkan kunci, hitung, kelompokkan | Map atau objek |
| Antrean (masuk dulu, keluar dulu) | Array dengan `push` dan `shift`, atau struktur khusus untuk data besar |
| Data terurut dan sering dicari | Array terurut dengan pencarian biner |

Catatan: `shift()` pada array besar bisa lambat karena menggeser semua elemen. Untuk antrean besar, gunakan penunjuk indeks atau struktur khusus.

## Mengukur, bukan menebak

Jangan mengoptimasi sebelum ada bukti bahwa itu masalah. Ukur dengan `console.time`:

```js
console.time('proses');
duplikatCepat(dataBesar);
console.timeEnd('proses');
```

Gunakan tab **Performance** di Chrome DevTools untuk menemukan fungsi yang paling memakan waktu. Panduan alatnya ada di [Chrome DevTools untuk Debugging Aplikasi Web]({{ site.baseurl }}/blog/2026/10/17/chrome-devtools-debugging-aplikasi-web/). Optimasi yang paling berharga hampir selalu berupa perubahan algoritma (misalnya dari O(n²) ke O(n)), bukan trik kecil.

## Bukan hanya soal waktu: memori juga

Struktur seperti `Set` dan `Map` menukar sedikit memori tambahan dengan kecepatan. Pada data sangat besar, perhatikan keduanya. Untuk penyimpanan di peramban, ingat batas kapasitas yang dibahas di [localStorage di Aplikasi Web]({{ site.baseurl }}/blog/2026/10/17/localstorage-aplikasi-web-kapan-aman/).

## Kesalahan yang sering terjadi

- **Perulangan bersarang** untuk mencocokkan dua daftar, padahal `Set` atau `Map` cukup.
- **`includes` di dalam perulangan** pada array besar (O(n²) tersembunyi).
- **Mengurutkan berulang kali** di dalam perulangan.
- **Mengoptimasi terlalu dini** tanpa mengukur.
- **Lupa pembanding angka** pada `sort`.
- **Mengabaikan ukuran data sebenarnya.** Untuk puluhan data, perbedaannya tidak terasa, jadi pilih kode yang paling mudah dibaca.

## Kesimpulan

Big-O membantu Anda memprediksi bagaimana kode berperilaku saat data tumbuh. Kenali bentuk-bentuk dasarnya (O(1), O(log n), O(n), O(n log n), O(n²)), hindari perulangan bersarang yang tidak perlu, pakai `Set` dan `Map` untuk pencarian cepat, dan selalu ukur sebelum mengoptimasi. Fondasi ini berlaku di bahasa apa pun, termasuk Kotlin yang dibahas di [Kotlin untuk Pemula Android]({{ site.baseurl }}/blog/2026/10/26/kotlin-dasar-null-safety-data-class/).
