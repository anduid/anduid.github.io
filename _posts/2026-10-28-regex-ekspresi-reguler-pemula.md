---
layout: post
title: "Regex untuk Pemula: Ekspresi Reguler dengan Contoh JavaScript dan Python"
description: "Belajar regex (ekspresi reguler) dari nol: karakter, kuantifier, grup, grup bernama, lazy matching, validasi nomor telepon, ekstraksi tanggal, dan jebakan performa, dengan contoh JavaScript dan Python."
date: 2026-10-28 01:15:00 +0700
tags: [regex, javascript, python, pemrograman]

# image: /assets/images/regex-pemula.png
# image_alt: Contoh pola regex yang mencocokkan tanggal dan alamat email
---
<!-- CATATAN PENULIS (tidak tampil di situs): coba setiap pola di Console peramban atau Python, dan tambahkan pengalaman Anda memakai regex di bagian bertanda "TAMBAHKAN". Gunakan data contoh, bukan data pribadi asli. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Regex, singkatan dari *regular expression* atau ekspresi reguler, adalah bahasa kecil untuk mendeskripsikan pola teks. Dengan satu baris, Anda bisa memeriksa apakah sebuah teks berupa tanggal, menarik semua alamat email dari dokumen, atau membersihkan spasi berlebih. Awalnya terlihat seperti kode rahasia, tetapi sebagian besar kebutuhan sehari-hari hanya memakai belasan simbol dasar.

<!-- TAMBAHKAN (1-2 kalimat): situasi nyata ketika regex menyelamatkan pekerjaan Anda. -->

Tulisan ini mengajarkan regex bertahap, dengan contoh JavaScript dan Python yang sudah saya jalankan hasilnya.

<!--more-->

## Cara memakainya

Di JavaScript, pola ditulis di antara garis miring:

```js
const teks = 'Rapat tanggal 2026-10-28 pukul 09.00.';
const pola = /\d{4}-\d{2}-\d{2}/;
console.log(pola.exec(teks)[0]);   // 2026-10-28
```

Di Python, pakai modul `re` dan string mentah (`r'...'`) agar garis miring terbalik tidak diproses dua kali:

```python
import re
t = 'Rapat tanggal 2026-10-28 pukul 09.00.'
print(re.search(r'\d{4}-\d{2}-\d{2}', t).group())   # 2026-10-28
```

Sintaks dasarnya hampir sama di kedua bahasa.

## Blok bangunan dasar

| Simbol | Arti |
|--------|------|
| `.` | Satu karakter apa saja (kecuali baris baru) |
| `\d` `\D` | Digit / bukan digit |
| `\w` `\W` | Huruf, angka, atau garis bawah / kebalikannya |
| `\s` `\S` | Spasi, tab, baris baru / kebalikannya |
| `[abc]` | Salah satu dari a, b, atau c |
| `[^abc]` | Karakter apa pun kecuali a, b, c |
| `[a-z0-9]` | Rentang karakter |
| `^` `$` | Awal dan akhir teks (atau baris) |
| `\b` | Batas kata |

Karakter khusus seperti `.`, `*`, `+`, `?`, `(`, `)`, `[`, `{`, `|`, dan `\` harus diawali garis miring terbalik jika ingin dicocokkan apa adanya, misalnya `\.` untuk titik sungguhan.

## Kuantifier: berapa kali muncul

| Simbol | Arti |
|--------|------|
| `*` | Nol kali atau lebih |
| `+` | Satu kali atau lebih |
| `?` | Nol atau satu kali (opsional) |
| `{4}` | Tepat 4 kali |
| `{2,5}` | Antara 2 dan 5 kali |
| `{3,}` | Minimal 3 kali |

Contoh: `\d{4}-\d{2}-\d{2}` mencocokkan tanggal berformat `2026-10-28`.

## Grup dan menarik bagian teks

Tanda kurung membentuk **grup** yang bisa diambil terpisah:

```js
const teks = 'Tanggal 2026-10-28.';
const semua = [...teks.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)];
console.log(semua.map(m => m.slice(1)));   // [ [ '2026', '10', '28' ] ]
```

Grup bisa **diberi nama** supaya kode lebih terbaca:

```js
const m = '2026-10-28'.match(/^(?<tahun>\d{4})-(?<bulan>\d{2})-(?<hari>\d{2})$/);
console.log(m.groups);   // { tahun: '2026', bulan: '10', hari: '28' }
```

Di Python, sintaksnya `(?P<nama>...)`:

```python
m = re.match(r'(?P<tahun>\d{4})-(?P<bulan>\d{2})-(?P<hari>\d{2})', '2026-10-28')
print(m.groupdict())   # {'tahun': '2026', 'bulan': '10', 'hari': '28'}
```

## Mengganti teks

```js
'a  b   c'.replace(/\s+/g, ' ');                  // 'a b c'  (rapikan spasi)
'Halo Dunia'.replace(/(\w+) (\w+)/, '$2 $1');     // 'Dunia Halo' (tukar urutan)
'Rp 1.500.000'.replace(/[^\d]/g, '');             // '1500000'    (sisakan digit)
```

Bendera `g` (global) berarti ganti semua kemunculan, bukan hanya yang pertama. Di Python, fungsinya `re.sub(pola, pengganti, teks)`.

<!-- TAMBAHKAN: satu pola regex yang sering Anda pakai di pekerjaan atau proyek Anda. -->

## Greedy dan lazy: jebakan paling umum

Secara bawaan, kuantifier bersifat **serakah** (*greedy*): mengambil sebanyak mungkin. Ini sering mengejutkan:

```js
const html = '<b>x</b><b>y</b>';
html.match(/<b>.*<\/b>/)[0];    // '<b>x</b><b>y</b>'  (terlalu banyak)
html.match(/<b>.*?<\/b>/)[0];   // '<b>x</b>'          (lazy: secukupnya)
```

Tambahkan `?` setelah kuantifier untuk membuatnya **lazy** (mengambil sesedikit mungkin).

## Contoh praktis

**Validasi nomor ponsel Indonesia sederhana** (diawali 08, total 10 sampai 13 digit):

```js
const pola = /^0(8\d{8,11})$/;
pola.test('081234567890');   // true
pola.test('0712345');        // false
```

**Menarik alamat email dari teks:**

```js
const teks = 'Hubungi sari@contoh.id atau admin@situs.co.id.';
teks.match(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g);
```

**Memberi pemisah ribuan:**

```js
'harga: 15000'.replace(/\B(?=(\d{3})+(?!\d))/g, '.');   // 'harga: 15.000'
```

**Membuang tag HTML sederhana dari teks:**

```js
'<b>tebal</b> dan <i>miring</i>'.replace(/<[^>]+>/g, '');   // 'tebal dan miring'
```

Untuk contoh terakhir, ingat bahwa regex **bukan alat yang tepat untuk mengurai HTML sungguhan**. Untuk dokumen yang rumit, pakai pengurai HTML. Dan jangan pernah menganggap membuang tag dengan regex cukup untuk keamanan. Lihat [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

## Validasi dengan regex: hati-hati

- **Regex untuk email yang "sempurna" nyaris tidak ada.** Pola sederhana cukup untuk menyaring salah ketik, tetapi satu-satunya cara memastikan email valid adalah mengirim pesan verifikasi.
- **Validasi di klien hanya kenyamanan.** Validasi yang sebenarnya ada di server, seperti di [REST API Dasar]({{ site.baseurl }}/2026/10/26/rest-api-dasar-http-json-status-kode/).
- **Jangan menyimpulkan data pribadi dari pola tanpa izin.** Memindai teks untuk menarik nomor atau email orang lain menyangkut privasi.

## Performa dan ReDoS

Pola yang ditulis sembarangan dapat menjadi sangat lambat pada masukan tertentu, karena mesin regex mencoba terlalu banyak kemungkinan. Ini dikenal sebagai *ReDoS* dan dapat dipakai untuk membuat server macet. Contoh pola berisiko adalah kuantifier bersarang seperti `(a+)+$`. Beberapa pegangan:

- Hindari kuantifier bersarang yang saling tumpang tindih.
- Batasi panjang masukan sebelum dicocokkan.
- Jangan menjalankan regex dari pengguna terhadap data besar di server.
- Uji pola pada masukan panjang yang sengaja dibuat "nakal".

## Alat bantu belajar

Situs seperti regex101.com memperlihatkan pola, penjelasan tiap bagian, dan hasil pencocokan secara langsung. Pilih mode bahasa yang sesuai (JavaScript atau Python), karena ada perbedaan kecil antarmesin. Tulis pola dalam bagian-bagian kecil dan uji satu per satu, jangan langsung menulis satu pola panjang.

## Kesalahan yang sering terjadi

- **Lupa meng-escape `.`** sehingga cocok dengan karakter apa saja.
- **Greedy yang menelan terlalu banyak.** Pakai `*?` atau `+?`.
- **Lupa jangkar `^` dan `$`** pada validasi, sehingga "abc123xyz" lolos sebagai angka.
- **Memakai regex untuk mengurai HTML atau JSON.**
- **Lupa bendera `g`** saat ingin mengganti atau mencari semua kemunculan.
- **Pola terlalu rumit dan tidak terbaca.** Tambahkan komentar atau pecah menjadi beberapa langkah.

## Kesimpulan

Regex adalah alat ampuh untuk pola teks yang sederhana: karakter, kuantifier, grup, dan jangkar sudah menyelesaikan sebagian besar kebutuhan. Tulis bertahap, uji dengan data nyata, waspadai pola serakah dan ReDoS, dan jangan memaksakan regex untuk pekerjaan yang butuh pengurai sungguhan. Latihan kecil setiap hari lebih ampuh daripada menghafal tabel simbol.

Untuk dasar bahasa yang dipakai pada contoh di atas, lihat [JavaScript Modern untuk Pemula]({{ site.baseurl }}/2026/10/26/javascript-modern-dasar-es6-async-await/) dan [Python untuk Pemula]({{ site.baseurl }}/2026/10/26/python-otomatisasi-csv-untuk-pemula/).
