---
layout: post
title: "Regex Dasar di JavaScript: Mencari, Memvalidasi, dan Mengganti Teks dengan Pola"
description: "Belajar regular expression (regex) JavaScript dari nol: sintaks dasar, flag, grup bernama, metode match, replace, dan split, contoh validasi nomor HP, serta jebakan umum seperti flag g dan ReDoS."
date: 2026-10-26 03:00:00 +0700
tags: [javascript, regex, pemrograman, tutorial]

# image: /assets/images/regex-dasar-javascript.png
# image_alt: Pola regex menyorot angka dan hashtag di dalam sebuah kalimat
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan semua contoh di konsol browser atau Node.js, lalu tambahkan pengalaman Anda memakai regex di bagian bertanda "TAMBAHKAN". Gunakan data contoh, bukan data pengguna asli. Hapus tanda # pada image jika gambar sudah dibuat. -->

Pernahkah Anda perlu mengambil semua angka dari sebuah kalimat, memeriksa apakah nomor telepon ditulis benar, atau merapikan teks yang penuh spasi ganda? Mengerjakannya dengan `if` dan `substring` berulang-ulang cepat melelahkan. *Regular expression*, atau **regex**, adalah bahasa kecil untuk menggambarkan pola teks, dan JavaScript sudah memilikinya sejak awal.

<!-- TAMBAHKAN (1-2 kalimat): situasi nyata saat regex menghemat pekerjaan Anda, misalnya merapikan data hasil ekspor. -->

Tulisan ini membahas sintaks dasarnya, metode yang dipakai sehari-hari, beberapa contoh praktis, dan jebakan yang sering menjebak pemula. Semua contoh sudah dijalankan dengan Node.js.

<!--more-->

## Membuat regex

Ada dua cara menulis regex di JavaScript:

```javascript
const a = /\d+/;                 // literal: pola di antara dua garis miring
const b = new RegExp('\\d+');    // konstruktor: berguna jika pola dibuat dari teks
```

Bentuk literal lebih ringkas dan cukup untuk hampir semua kasus. Pada konstruktor, garis miring terbalik harus ditulis ganda (`\\d`) karena berada di dalam string.

Metode paling sederhana adalah `test()`, yang menjawab ya atau tidak:

```javascript
/\d+/.test('Order 123');   // true
/\d+/.test('Order');       // false
```

## Sintaks dasar yang perlu dihafal

Anda tidak perlu menghafal semuanya sekaligus. Kenali kelompok berikut dulu:

| Pola | Artinya |
|---|---|
| `\d` | satu digit (0-9) |
| `\w` | satu huruf, angka, atau garis bawah (`_`); huruf beraksen tidak termasuk |
| `\s` | satu spasi, tab, atau baris baru |
| `.` | satu karakter apa saja, kecuali baris baru |
| `[abc]` | salah satu dari a, b, atau c |
| `[^abc]` | karakter apa saja **selain** a, b, c |
| `[a-z]` | satu huruf kecil dari a sampai z |
| `^` dan `$` | awal dan akhir teks |
| `*` | nol kali atau lebih |
| `+` | satu kali atau lebih |
| `?` | nol atau satu kali (opsional) |
| `{3}` dan `{2,4}` | tepat 3 kali, dan 2 sampai 4 kali |
| `(...)` | grup, untuk mengelompokkan atau menangkap bagian teks |
| `\|` | atau |

Untuk mencari karakter spesial secara harfiah, beri garis miring terbalik di depannya: `\.` untuk titik, `\?` untuk tanda tanya, `\(` untuk kurung buka.

## Flag: mengubah cara regex bekerja

Flag ditulis setelah garis miring penutup:

- **`g`** (*global*): cari semua kecocokan, bukan hanya yang pertama.
- **`i`** (*ignore case*): abaikan huruf besar atau kecil.
- **`m`** (*multiline*): `^` dan `$` berlaku per baris.
- **`u`**: perlakukan teks sebagai Unicode penuh.
- **`s`**: titik (`.`) juga cocok dengan baris baru.

```javascript
/halo/i.test('HALO');                 // true
'Tel 0812-3456-7890'.match(/\d+/g);   // ['0812', '3456', '7890']
'a\nb\nc'.match(/^\w$/gm);            // ['a', 'b', 'c']
```

Tanpa flag `g`, `match()` hanya mengembalikan kecocokan pertama beserta detailnya. Dengan `g`, hasilnya larik berisi semua kecocokan.

## Metode yang dipakai sehari-hari

### match dan matchAll

`match()` cocok untuk mengambil semua kecocokan sederhana. Jika Anda butuh isi grup dan posisinya, pakai `matchAll()` (flag `g` wajib):

```javascript
for (const x of 'a=1, b=22, c=333'.matchAll(/(\w)=(\d+)/g)) {
  console.log(x[1], x[2], x.index);
}
// a 1 0
// b 22 5
// c 333 11
```

### replace dan replaceAll

`replace()` mengganti kecocokan pertama, atau semuanya jika regex memakai flag `g`:

```javascript
'  halo    dunia   ini  '.trim().replace(/\s+/g, ' ');   // 'halo dunia ini'
'a.b.c'.replaceAll('.', '-');                            // 'a-b-c'
```

Pengganti juga boleh berupa fungsi, berguna untuk mengubah isi kecocokan:

```javascript
'harga 5000 dan 12000'.replace(/\d+/g, n => Number(n).toLocaleString('id-ID'));
// 'harga 5.000 dan 12.000'
```

### split

`split()` bisa memakai regex sebagai pemisah, sehingga beberapa jenis pemisah ditangani sekaligus:

```javascript
'apel, jeruk;mangga  pisang'.split(/[,;\s]+/);
// ['apel', 'jeruk', 'mangga', 'pisang']
```

## Grup bernama: kode yang mudah dibaca

Mengambil bagian teks dengan `x[1]`, `x[2]` cepat membingungkan. Beri nama pada grup dengan `(?<nama>...)`:

```javascript
const m = '26-10-2026'.match(/(?<hari>\d{2})-(?<bulan>\d{2})-(?<tahun>\d{4})/);
console.log(m.groups.hari, m.groups.bulan, m.groups.tahun);   // 26 10 2026

// Mengubah format tanggal Indonesia menjadi format ISO
'26-10-2026'.replace(
  /(?<hari>\d{2})-(?<bulan>\d{2})-(?<tahun>\d{4})/,
  '$<tahun>-$<bulan>-$<hari>'
);   // '2026-10-26'
```

## Contoh praktis

### 1. Memeriksa nomor HP Indonesia

```javascript
const hp = /^(?:\+62|62|0)8\d{8,11}$/;

const bersih = s => s.replace(/[\s-]/g, '');   // buang spasi dan tanda hubung

hp.test(bersih('0812-3456 7890'));   // true
hp.test('+6281234567890');           // true
hp.test('0212345');                  // false (bukan nomor seluler)
```

Pola ini sengaja sederhana: nomor seluler diawali `08`, `628`, atau `+628`, diikuti 8 sampai 11 digit. Bagian `(?:...)` adalah grup yang tidak menangkap isi, hanya mengelompokkan alternatif.

### 2. Mengambil hashtag

```javascript
'Belajar #javascript dan #regex_hebat hari ini'.match(/#\w+/g);
// ['#javascript', '#regex_hebat']
```

### 3. Membuat slug URL dari judul

```javascript
const slug = t => t.toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g, '')   // buang tanda baca
  .replace(/[\s-]+/g, '-');       // spasi menjadi tanda hubung

slug('Belajar Regex: Dasar & Praktik!');   // 'belajar-regex-dasar-praktik'
```

<!-- TAMBAHKAN: satu contoh regex yang pernah Anda pakai di proyek sendiri, beserta pola dan hasilnya (tanpa data asli). -->

## Serakah atau malas? Greedy dan lazy

Secara bawaan, `*` dan `+` bersifat **serakah**: mereka mengambil teks sebanyak mungkin. Tambahkan `?` setelahnya untuk membuatnya **malas**, yaitu mengambil sesedikit mungkin:

```javascript
const html = '<b>satu</b> dan <b>dua</b>';

html.match(/<b>.*<\/b>/)[0];    // '<b>satu</b> dan <b>dua</b>'  (serakah)
html.match(/<b>.*?<\/b>/)[0];   // '<b>satu</b>'                 (malas)
```

Ini sumber kebingungan paling umum bagi pemula. Jika hasil pencarian Anda terlalu panjang, curigai kuantifier yang serakah.

## Jebakan yang sering terjadi

### Flag `g` dan `test()` yang berubah-ubah

Regex dengan flag `g` menyimpan posisi pencarian terakhir di properti `lastIndex`. Memakai satu regex yang sama berulang kali dengan `test()` memberi hasil yang berselang-seling:

```javascript
const g = /a/g;
g.test('aa');   // true
g.test('aa');   // true
g.test('aa');   // false  (posisi sudah di ujung, lalu diulang dari awal)
```

Untuk validasi, **jangan pakai flag `g`**. Jika perlu `g`, buat regex baru setiap kali dipakai.

### Memasukkan teks pengguna ke dalam regex

Jika pola dibangun dari masukan pengguna, karakter spesial di dalamnya akan dianggap sebagai sintaks. Amankan dulu:

```javascript
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

new RegExp(escape('1+1=2?')).test('hasil 1+1=2?');   // true
```

### Regex yang membuat peramban atau server macet (ReDoS)

Pola dengan kuantifier bersarang, seperti `^(a+)+$`, bisa menghabiskan waktu secara eksponensial pada teks tertentu. Pada uji coba di Node.js, pola itu butuh sekitar dua detik hanya untuk teks 27 karakter, dan waktunya berlipat dua setiap karakter ditambah. Jika aplikasi menerima teks dari luar, hindari pola bersarang yang ambigu, batasi panjang masukan, dan uji pola Anda dengan teks yang sengaja dibuat buruk.

### Regex bukan alat untuk segalanya

- **Email:** pola sederhana seperti `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` cukup untuk memeriksa bentuk kasar. Satu-satunya pemeriksaan sejati adalah mengirim email konfirmasi.
- **HTML:** jangan mengurai HTML dengan regex. Pakai `DOMParser` atau pustaka pengurai.
- **Validasi keamanan:** pemeriksaan di sisi klien hanya membantu kenyamanan pengguna. Validasi ulang di server, seperti dibahas di [Delapan Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/blog/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

## Tips agar regex tetap terbaca

- Bangun pola sedikit demi sedikit dan uji tiap tahap, misalnya di konsol browser.
- Pakai **grup bernama** supaya maksud tiap bagian jelas.
- Simpan pola panjang di variabel dengan nama bermakna, seperti `polaNomorHp`, dan beri komentar di atasnya.
- Jika sebuah pola sudah sulit dibaca, pecah menjadi beberapa langkah. Kode yang jelas lebih berharga daripada satu baris yang ringkas.

Jika Anda masih baru dengan fitur JavaScript modern seperti `matchAll`, `replaceAll`, dan fungsi panah, lihat dulu [JavaScript Modern: Dasar ES6 dan Async/Await]({{ site.baseurl }}/blog/2026/10/26/javascript-modern-dasar-es6-async-await/). Untuk data dari berkas CSV yang sering memerlukan pembersihan teks, baca juga [Ekspor CSV dan Excel dari Aplikasi Web]({{ site.baseurl }}/blog/2026/10/17/ekspor-csv-excel-dari-aplikasi-web/).

## Kesalahan yang sering terjadi

- **Lupa menandai karakter spesial** seperti titik atau tanda tanya dengan garis miring terbalik.
- **Memakai flag `g` pada regex validasi**, sehingga hasil `test()` tidak konsisten.
- **Lupa `^` dan `$`** saat validasi, sehingga `'abc123xyz'` dianggap lolos pemeriksaan angka.
- **Kuantifier serakah** yang mengambil teks terlalu panjang.
- **Mengurai HTML atau email secara sempurna dengan regex.**
- **Tidak menguji dengan masukan aneh**: teks kosong, sangat panjang, atau berisi karakter spesial.

## Kesimpulan

Regex adalah alat kecil yang sangat berguna: cukup kuasai `\d`, `\w`, `\s`, kelas karakter, kuantifier, grup, dan beberapa flag, lalu kombinasikan dengan `test`, `match`, `matchAll`, `replace`, dan `split`. Gunakan grup bernama agar kode terbaca, hindari flag `g` untuk validasi, waspadai pola bersarang, dan ingat bahwa regex membantu memeriksa bentuk teks, bukan menggantikan validasi di server. Mulailah dari satu pekerjaan membersihkan teks yang paling sering Anda ulang.
