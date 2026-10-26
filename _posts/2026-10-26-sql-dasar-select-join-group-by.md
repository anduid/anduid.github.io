---
layout: post
title: "SQL Dasar untuk Pemula: SELECT, JOIN, dan GROUP BY dengan Contoh Data UMKM"
description: "Belajar SQL dasar dengan contoh data usaha: SELECT, WHERE, ORDER BY, GROUP BY, HAVING, JOIN dan LEFT JOIN, INSERT, UPDATE, DELETE, serta kueri berparameter untuk mencegah SQL injection."
date: 2026-10-26 02:15:00 +0700
tags: [sql, database, pemrograman, tutorial]

# image: /assets/images/sql-dasar-join.png
# image_alt: Diagram dua tabel dihubungkan dengan JOIN
---
<!-- CATATAN PENULIS (tidak tampil di situs): contoh di tulisan ini diuji dengan SQLite. Coba juga di SQLite Online atau aplikasi basis data Anda, lalu tambahkan pengalaman Anda memakai SQL di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Spreadsheet sangat bagus sampai datanya tumbuh dan saling berhubungan: daftar usaha, omzet tiap bulan, dan pemiliknya. Pada titik itu, basis data relasional dan bahasa **SQL** jauh lebih andal. SQL sudah dipakai puluhan tahun, nyaris sama di berbagai basis data, dan keterampilan dasarnya terpakai di mana saja, dari aplikasi Android dengan Room sampai sistem backend.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memakai SQL atau basis data dan kapan Anda merasa spreadsheet tidak cukup lagi. -->

Tulisan ini mengajarkan inti SQL lewat contoh data usaha dan omzet. Semua kueri sudah diuji dengan SQLite, basis data ringan yang bisa dicoba tanpa memasang server.

<!--more-->

## Menyiapkan dua tabel contoh

Kita pakai dua tabel yang berhubungan: `usaha` dan `omzet`. Kolom `id_usaha` di tabel `omzet` menunjuk ke `id` di tabel `usaha`.

```sql
CREATE TABLE usaha (
  id       INTEGER PRIMARY KEY,
  nama     TEXT NOT NULL,
  kategori TEXT NOT NULL,
  rw       TEXT NOT NULL,
  aktif    INTEGER DEFAULT 1
);

CREATE TABLE omzet (
  id        INTEGER PRIMARY KEY,
  id_usaha  INTEGER NOT NULL REFERENCES usaha(id),
  bulan     TEXT NOT NULL,
  jumlah    INTEGER NOT NULL
);

INSERT INTO usaha (id, nama, kategori, rw) VALUES
  (1, 'Warung A', 'Kuliner', 'RW 01'),
  (2, 'Kriya B',  'Kriya',   'RW 02'),
  (3, 'Warung C', 'Kuliner', 'RW 02'),
  (4, 'Jasa D',   'Jasa',    'RW 03');

INSERT INTO omzet (id_usaha, bulan, jumlah) VALUES
  (1, '2026-09',  5000000),
  (1, '2026-10',  6000000),
  (2, '2026-09', 12000000),
  (3, '2026-10',  8000000);
```

Tanda `PRIMARY KEY` memberi identitas unik tiap baris, dan `REFERENCES` menyatakan hubungan antartabel. Ini sama dengan prinsip ID unik yang dibahas di [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/blog/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/).

## SELECT, WHERE, dan ORDER BY

Ambil usaha kuliner, urut menurut nama:

```sql
SELECT nama, kategori
FROM usaha
WHERE kategori = 'Kuliner'
ORDER BY nama;
```

Hasilnya:

```text
Warung A | Kuliner
Warung C | Kuliner
```

Beberapa kata kunci yang sering dipakai bersama `WHERE`: `AND`, `OR`, `NOT`, `IN (...)`, `BETWEEN`, dan `LIKE 'War%'` untuk pencocokan pola. Tambahkan `LIMIT 10` untuk membatasi jumlah baris.

## Fungsi agregat dan GROUP BY

Hitung jumlah usaha per kategori:

```sql
SELECT kategori, COUNT(*) AS jumlah
FROM usaha
GROUP BY kategori
ORDER BY jumlah DESC, kategori;
```

```text
Kuliner | 2
Jasa    | 1
Kriya   | 1
```

Fungsi agregat yang umum: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. Untuk menyaring **hasil kelompok**, pakai `HAVING` (bukan `WHERE`, yang menyaring baris sebelum dikelompokkan):

```sql
SELECT kategori, COUNT(*) AS jumlah
FROM usaha
GROUP BY kategori
HAVING COUNT(*) > 1;
```

```text
Kuliner | 2
```

## JOIN: menggabungkan tabel

Total omzet tiap usaha, dengan menggabungkan dua tabel:

```sql
SELECT u.nama, SUM(o.jumlah) AS total
FROM usaha u
JOIN omzet o ON o.id_usaha = u.id
GROUP BY u.id
ORDER BY total DESC;
```

```text
Kriya B  | 12000000
Warung A | 11000000
Warung C |  8000000
```

`JOIN` (disebut juga `INNER JOIN`) hanya menampilkan usaha yang **punya** data omzet. Perhatikan bahwa "Jasa D" tidak muncul karena belum ada omzetnya. Jika Anda ingin semua usaha tetap tampil, pakai `LEFT JOIN`:

```sql
SELECT u.nama, COALESCE(SUM(o.jumlah), 0) AS total
FROM usaha u
LEFT JOIN omzet o ON o.id_usaha = u.id
GROUP BY u.id
ORDER BY u.id;
```

```text
Warung A | 11000000
Kriya B  | 12000000
Warung C |  8000000
Jasa D   |        0
```

`LEFT JOIN` mempertahankan semua baris tabel kiri, dan isi kolom dari tabel kanan menjadi `NULL` jika tidak ada pasangan. `COALESCE` mengganti `NULL` dengan nilai cadangan, di sini 0.

Untuk mencari usaha yang belum punya omzet sama sekali:

```sql
SELECT nama
FROM usaha
WHERE id NOT IN (SELECT id_usaha FROM omzet);
```

<!-- TAMBAHKAN: kueri nyata yang pernah Anda tulis untuk menjawab pertanyaan dari data (generik). -->

## Mengubah data: INSERT, UPDATE, DELETE

```sql
INSERT INTO usaha (nama, kategori, rw) VALUES ('Toko E', 'Dagang', 'RW 01');

UPDATE usaha SET aktif = 0 WHERE id = 4;

DELETE FROM omzet WHERE id_usaha = 4;
```

**Selalu sertakan `WHERE`** pada `UPDATE` dan `DELETE`. Tanpanya, seluruh tabel ikut berubah atau terhapus. Biasakan menjalankan `SELECT` dengan `WHERE` yang sama lebih dulu untuk melihat baris mana yang akan terkena. Untuk data penting, pertimbangkan hapus lunak (kolom `aktif`) daripada menghapus permanen.

## NULL itu spesial

`NULL` berarti "tidak diketahui", dan bukan sama dengan 0 atau teks kosong. Perbandingannya memakai `IS NULL` atau `IS NOT NULL`, bukan `= NULL`:

```sql
SELECT nama FROM usaha WHERE aktif IS NULL;
```

Agregat seperti `SUM` dan `AVG` mengabaikan `NULL`, dan itu sering mengejutkan pemula.

## Kueri berparameter: mencegah SQL injection

Jangan pernah menyusun kueri dengan menggabungkan teks dari pengguna. Itu membuka celah **SQL injection**, ketika masukan berbahaya mengubah makna kueri Anda. Gunakan parameter:

```python
import sqlite3

db = sqlite3.connect('usaha.db')
kategori = input('Kategori: ')

# Aman: nilai dikirim terpisah dari teks kueri
for baris in db.execute('SELECT nama FROM usaha WHERE kategori = ?', (kategori,)):
    print(baris)

# TIDAK aman: jangan lakukan ini
# db.execute("SELECT nama FROM usaha WHERE kategori = '" + kategori + "'")
```

Hampir semua pustaka basis data punya fitur serupa (`?` atau `:nama`, `@nama`). Prinsip lain yang selaras ada di [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/blog/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/): jangan percaya masukan dari pengguna.

## Indeks: mempercepat pencarian

Jika Anda sering mencari berdasarkan kolom tertentu pada tabel besar, buat indeks:

```sql
CREATE INDEX idx_omzet_usaha ON omzet (id_usaha);
```

Indeks mempercepat pencarian dan `JOIN`, tetapi sedikit memperlambat penulisan dan memakai ruang. Buat indeks untuk kolom yang memang sering dipakai di `WHERE` dan `JOIN`, bukan semuanya. Konsep ini berkaitan dengan Big-O: pencarian dengan indeks tumbuh jauh lebih lambat daripada penelusuran seluruh tabel, seperti di [Big-O dan Struktur Data Dasar]({{ site.baseurl }}/blog/2026/10/26/big-o-struktur-data-array-set-map-javascript/).

## Kesalahan yang sering terjadi

- **`UPDATE` atau `DELETE` tanpa `WHERE`.**
- **Memakai `WHERE` untuk menyaring hasil agregat** (seharusnya `HAVING`).
- **Memakai `JOIN` padahal butuh `LEFT JOIN`**, sehingga baris tanpa pasangan hilang diam-diam.
- **`SELECT *` di kode produksi.** Sebutkan kolom yang dibutuhkan.
- **Menggabungkan teks pengguna ke dalam kueri.**
- **Membandingkan dengan `= NULL`.**
- **Menyimpan beberapa nilai dalam satu kolom** (misalnya daftar dipisah koma) sehingga sulit dikueri.

## Kesimpulan

Dengan `SELECT`, `WHERE`, `GROUP BY`, `HAVING`, dan `JOIN`, Anda sudah bisa menjawab sebagian besar pertanyaan dari data. Tambahkan kebiasaan memakai kueri berparameter, `WHERE` pada setiap perubahan data, dan indeks seperlunya. Coba semua contoh di SQLite, lalu terapkan pada data Anda sendiri.
