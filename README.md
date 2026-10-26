# andu.my.id: situs Jekyll terpadu (beranda + aplikasi + blog)

Satu repo (`anduid/anduid.github.io`), satu sitemap, satu jaringan tautan internal.
Diterbitkan oleh GitHub Actions (`.github/workflows/situs.yml`) setiap kali ada push ke `main`.

## Struktur

| Lokasi | Isi | URL |
|---|---|---|
| `index.html` | Beranda studio. Daftar aplikasi dan 3 tulisan terbaru terisi otomatis | `/` |
| `NAMA.html` di root | Aplikasi HTML utuh, **tidak diubah** di repo | `/NAMA` |
| `_apps/NAMA.md` | Deskriptor kecil per aplikasi (judul, deskripsi, kategori, tags) | `/aplikasi/NAMA/` |
| `aplikasi/index.html` | Hub semua aplikasi, dikelompokkan per kategori | `/aplikasi/` |
| `_posts/` | Tulisan blog | `/blog/TAHUN/BULAN/TANGGAL/judul/` |
| `blog/` | Beranda blog, arsip, topik, cari, tentang, kontak, privasi | `/blog/...` |
| `sitemap.xml`, `robots.txt` | Dibuat otomatis, mencakup semuanya | `/sitemap.xml` |
| `tools/` | Skrip Python yang dipanggil Actions | (tidak diterbitkan) |

## Menambah aplikasi baru

1. Unggah `namaapp.html` ke **root** repo (nama huruf kecil, tanpa spasi). Selesai.

Saat build berikutnya, otomatis:
- dibuat `_apps/namaapp.md` dari `<title>` dan meta description berkasnya (jika belum ada),
- aplikasi tampil di hub `/aplikasi/`, masuk `sitemap.xml`, dan punya halaman `/aplikasi/namaapp/`,
- berkasnya mendapat title, description, canonical, Open Graph, dan JSON-LD yang benar,
- tulisan yang tag-nya cocok otomatis ditautkan.

Agar hasilnya maksimal, buat sendiri `_apps/namaapp.md` (salin salah satu yang sudah ada):

```yaml
---
title: "Nama Aplikasi"
tagline: "Frasa pendek tentang fungsinya"
judul_seo: "Nama Aplikasi: frasa pendek"        # <title> berkas aplikasi, maks. ~60 karakter
description: "Satu atau dua kalimat, 70-160 karakter, yang jelas menyebut fungsinya."
file: namaapp                                   # nama berkas tanpa .html
kategori: "Alat Bantu"                          # pengelompokan di hub
schema_kategori: UtilitiesApplication
tags: [seo]                                     # dicocokkan dengan tag tulisan
urutan: 30                                      # makin kecil makin awal
beranda: false                                  # true = tampil di "Index Sistem Unggulan" beranda
bahasa: id
fitur:
  - "Fitur pertama"
  - "Fitur kedua"
---
(Opsional) paragraf penjelasan panjang dalam Markdown, tampil di halaman aplikasi.
```

Pilihan lain di deskriptor: `published: false` (sembunyikan sepenuhnya dari hub, sitemap, dan beranda),
`noindex: true` (tetap tampil tetapi jangan diindeks), `tautan_balik: true` (tombol kecil "andu.my.id" di sudut
aplikasi), `gambar:` (gambar pratinjau 1200x630), `diperbarui: 2026-11-01` (mengisi `lastmod` sitemap).

## Menulis tulisan baru

Buat `_posts/TAHUN-BULAN-TANGGAL-judul.md` seperti biasa (lihat contoh di folder itu). Untuk menautkan secara
eksplisit ke aplikasi, tambahkan satu baris di front matter:

```yaml
tags: [seo, blog]
apps: [seopc, seoandu]      # nama berkas aplikasi tanpa .html
```

**Aturan tautan antar-tulisan:** alamat tulisan sekarang berawalan `/blog/`. Tulis tautan seperti ini:

```markdown
[Judul tulisan lain]({{ site.baseurl }}/blog/2026/10/10/slug-tulisan/)
```
Menulis `{{ site.baseurl }}/2026/10/10/slug-tulisan/` (tanpa `/blog`) menghasilkan tautan patah. Pemeriksaan di tab
Actions akan menandainya sebagai "Tautan patah".

Tanpa baris `apps:` pun, tulisan otomatis menaut ke aplikasi yang **tag-nya sama** (tag umum `tutorial`,
`panduan`, `web` diabaikan; ubah di `_config.yml` > `tag_abaikan`). Tulisan juga otomatis mendapat "Baca juga"
dari tulisan lain yang berbagi tag.

## Pratinjau di komputer

```bash
bundle install
python3 tools/sinkron_app.py pra         # buat deskriptor untuk aplikasi baru
bundle exec jekyll serve                 # buka http://localhost:4000
# tag SEO aplikasi ditanam setelah build; untuk mengujinya:
bundle exec jekyll build && python3 tools/sinkron_app.py pasca && python3 tools/cek_situs.py
```
(Butuh `pip install pyyaml`.)

## Jika build gagal atau ada peringatan

Buka tab **Actions** di GitHub, klik run terbaru. Pesan merah/kuning dari "Periksa konsistensi situs" menyebut
persis berkas dan penyebabnya (tautan patah, `apps:` salah ketik, halaman aplikasi tidak terbentuk, dst.).
Situs lama tetap online selama build baru belum berhasil.
