---
layout: post
title: "Python untuk Pemula: Otomatisasi Rekap Data CSV dalam 30 Baris"
description: "Tutorial Python untuk pemula: membaca CSV dengan modul csv, merekap data dengan defaultdict, menulis hasil ke CSV, memakai pathlib, virtual environment, dan kapan beralih ke pandas."
date: 2026-10-26 02:00:00 +0700
tags: [python, otomatisasi, pemrograman, tutorial]

# image: /assets/images/python-otomatisasi-csv.png
# image_alt: Skrip Python membaca berkas CSV dan menulis rekap per kategori
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan skrip di komputer Anda, lalu tambahkan pengalaman Anda mengotomatiskan pekerjaan dengan skrip di bagian bertanda "TAMBAHKAN". Gunakan data contoh, bukan data kantor atau warga asli. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Banyak pekerjaan kantor yang berulang: membuka berkas Excel, menjumlahkan per kategori, menyalin hasilnya ke berkas baru. Python bisa mengerjakan itu dalam hitungan detik, dan Anda cukup menulis skripnya sekali. Yang menarik, untuk kebutuhan dasar Anda bahkan tidak perlu pustaka tambahan: modul bawaan Python sudah cukup.

<!-- TAMBAHKAN (1-2 kalimat): pekerjaan berulang yang pernah Anda otomatisasi dan waktu yang dihemat. -->

Tulisan ini membangun skrip kecil untuk merekap omzet usaha per kategori dari berkas CSV, lalu menulis hasilnya ke berkas CSV baru.

<!--more-->

## Persiapan

Pasang Python 3 dari situs resminya, lalu pastikan terminal mengenalinya:

```bash
python --version      # di sebagian sistem: python3 --version
```

Untuk proyek yang memakai pustaka tambahan, biasakan membuat *virtual environment* supaya pustaka tiap proyek terpisah:

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
```

Skrip di tulisan ini hanya memakai modul bawaan, jadi langkah itu belum wajib, tetapi layak dibiasakan.

## Data contoh

Buat berkas `data.csv` dengan data karangan:

```text
nama,kategori,omzet
Warung A,Kuliner,5000000
"Kriya, B",Kriya,12000000
Warung C,Kuliner,8000000
```

Perhatikan baris kedua: nama `Kriya, B` memuat koma sehingga dibungkus tanda kutip. Modul `csv` Python menangani hal ini dengan benar, hal yang sering salah jika Anda memecah teks dengan `split(',')` sendiri.

## Skripnya

Simpan sebagai `rekap.py`:

```python
import csv
from collections import defaultdict
from pathlib import Path


def baca_csv(path):
    with open(path, newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def rekap_per_kategori(baris):
    total = defaultdict(int)
    for b in baris:
        total[b['kategori']] += int(b['omzet'])
    return dict(total)


def tulis_csv(path, data):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        penulis = csv.writer(f)
        penulis.writerow(['kategori', 'total_omzet'])
        for kategori, jumlah in sorted(data.items(), key=lambda x: -x[1]):
            penulis.writerow([kategori, jumlah])


if __name__ == '__main__':
    hasil = rekap_per_kategori(baca_csv('data.csv'))
    print(hasil)
    tulis_csv('rekap.csv', hasil)
```

Jalankan dengan `python rekap.py`. Pada data contoh di atas, keluarannya:

```text
{'Kuliner': 13000000, 'Kriya': 12000000}
```

Dan berkas `rekap.csv` berisi:

```text
kategori,total_omzet
Kuliner,13000000
Kriya,12000000
```

## Menjelaskan bagian-bagian penting

- **`csv.DictReader`** membaca tiap baris sebagai kamus dengan nama kolom sebagai kunci, sehingga kode terbaca seperti `b['kategori']`, bukan indeks angka.
- **`encoding='utf-8-sig'`** membuang penanda BOM di awal berkas yang sering ditambahkan Excel, supaya nama kolom pertama tidak berubah aneh.
- **`newline=''`** wajib saat membuka berkas CSV agar baris baru ditangani modul `csv` dengan benar, terutama di Windows.
- **`defaultdict(int)`** membuat nilai awal 0 untuk kunci baru, sehingga Anda tidak perlu memeriksa apakah kategori sudah ada.
- **`sorted(..., key=lambda x: -x[1])`** mengurutkan dari omzet terbesar.
- **`if __name__ == '__main__':`** membuat fungsi bisa dipakai ulang oleh skrip lain tanpa menjalankan bagian utama.

<!-- TAMBAHKAN: skrip otomatisasi nyata yang Anda buat dan hasilnya (tanpa data asli). -->

## Menangani data yang kotor

Data dunia nyata jarang bersih. Tambahkan penjagaan agar satu baris rusak tidak menghentikan seluruh proses:

```python
def rekap_aman(baris):
    total = defaultdict(int)
    dilewati = []
    for nomor, b in enumerate(baris, start=2):   # baris 1 adalah judul kolom
        try:
            kategori = b['kategori'].strip()
            jumlah = int(b['omzet'])             # ubah dulu, baru dijumlahkan
        except (KeyError, ValueError, AttributeError):
            dilewati.append(nomor)
            continue
        total[kategori] += jumlah
    return dict(total), dilewati
```

Perhatikan urutannya: nilai diubah dengan `int()` **sebelum** dijumlahkan. Jika ditulis `total[kategori] += int(...)`, `defaultdict` sudah telanjur membuat entri kategori bernilai 0 sebelum `int()` gagal, sehingga baris rusak meninggalkan kategori hantu di hasil. Cetak `dilewati` agar Anda tahu baris mana yang bermasalah, jangan diam-diam membuangnya. Pemeriksaan semacam ini juga penting pada data dari pengguna, seperti dibahas di [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/blog/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/).

## Memproses banyak berkas sekaligus

`pathlib` membuat urusan berkas dan folder lebih rapi:

```python
from pathlib import Path

for berkas in sorted(Path('laporan').glob('*.csv')):
    baris = baca_csv(berkas)
    print(berkas.name, len(baris), 'baris')
```

Dengan pola ini, Anda bisa merekap seluruh berkas bulanan dalam satu folder hanya dengan satu perulangan.

## Kapan beralih ke pandas

Untuk rekap sederhana, modul bawaan cukup. Saat kebutuhan membesar, yaitu data puluhan ribu baris, penggabungan beberapa tabel, atau analisis lanjutan, pustaka **pandas** jauh lebih praktis. Rekap yang sama dengan pandas:

```python
import pandas as pd

df = pd.read_csv('data.csv')
rekap = df.groupby('kategori')['omzet'].sum().sort_values(ascending=False)
rekap.to_csv('rekap.csv')
```

Pasang dengan `pip install pandas` di dalam virtual environment. Pahami dulu cara kerja dasarnya sebelum memakai pustaka besar, supaya Anda tahu apa yang terjadi di balik layar.

## Keamanan dan privasi

- Berkas CSV dari orang lain bisa memuat sel yang diawali `=`, `+`, `-`, atau `@`. Saat menulis hasil untuk dibuka di Excel, amankan sel seperti itu, sebagaimana dibahas di [Ekspor CSV dari Aplikasi Web]({{ site.baseurl }}/blog/2026/10/17/ekspor-csv-excel-dari-aplikasi-web/).
- Jangan menaruh data pribadi di repositori publik. Masukkan berkas data ke `.gitignore`.
- Jangan menyimpan kata sandi atau kunci API di dalam skrip.

## Kesalahan yang sering terjadi

- **Memecah baris CSV dengan `split(',')`**, yang rusak jika data memuat koma.
- **Lupa `newline=''`** sehingga muncul baris kosong ekstra di Windows.
- **Tidak menentukan `encoding`**, sehingga huruf beraksen rusak.
- **Menjumlahkan teks, bukan angka.** Nilai dari CSV selalu berupa teks. Ubah dengan `int()` atau `float()`.
- **Menimpa berkas asli** secara tidak sengaja. Tulis hasil ke berkas baru.
- **Tidak memeriksa baris yang gagal diproses.**

## Kesimpulan

Dengan modul bawaan `csv`, `collections`, dan `pathlib`, Anda bisa mengotomatiskan rekap data dalam sekitar 30 baris. Tulis fungsi kecil, tangani data kotor, jangan menimpa berkas asli, dan beralihlah ke pandas hanya ketika kebutuhan menuntutnya. Mulailah dari satu pekerjaan berulang yang paling menyita waktu Anda.
