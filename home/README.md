# Blog Andu (Jekyll + GitHub Pages)

Blog statis berbahasa Indonesia dengan desain gelap/terang, SEO lengkap, dan alamat `https://andu.my.id/blog/`.

## Pasang

1. Buat repo publik bernama `blog` di akun GitHub Anda.
2. Unggah **isi** folder ini ke root repo (bukan folder luarnya).
3. **Settings > Pages**: Deploy from a branch, branch `main`, folder `/ (root)`.
4. Pastikan `_config.yml` berisi `url: "https://andu.my.id"` dan `baseurl: "/blog"`.

## Fitur SEO yang sudah terpasang

- `<title>` unik per halaman (format: Judul | Blog Andu)
- `meta description` (dari `description:` di front matter; jika kosong, otomatis dari ringkasan tulisan)
- Tag `canonical` di setiap halaman
- Open Graph dan Twitter Card (judul, deskripsi, gambar, tipe artikel, tanggal terbit)
- Satu `<h1>` per halaman, judul bagian memakai `<h2>`
- Data terstruktur JSON-LD (Blog, BlogPosting, BreadcrumbList)
- Ikon: favicon SVG/ICO/PNG, apple-touch-icon, web manifest
- `sitemap.xml`, `robots.txt`, RSS (`feed.xml`)
- Mobile friendly (viewport, tata letak responsif, menu geser di HP)

## Menulis tulisan baru

Buat file di `_posts/` bernama `TAHUN-BULAN-TANGGAL-judul.md`:

```markdown
---
layout: post
title: "Judul Tulisan (maks. sekitar 60 karakter)"
description: "Ringkasan 120-160 karakter yang tampil di hasil pencarian Google."
date: 2026-10-10 08:00:00 +0700
tags: [catatan]
image: /assets/images/sampul.jpg   # opsional, 1200x630, dipakai juga untuk pratinjau media sosial
image_alt: Deskripsi singkat gambar
---
Paragraf pembuka (jadi ringkasan di beranda).

<!--more-->

## Subjudul pertama

Isi tulisan. Gunakan ## untuk subjudul (H2) dan ### untuk sub-subjudul (H3).
```

Aturan SEO tulisan: satu H1 saja (otomatis dari `title`), subjudul mulai dari `##`, isi `description`, dan beri `image_alt` jika memakai gambar.

## Robots dan sitemap di domain utama

Google hanya membaca `robots.txt` di akar domain (`https://andu.my.id/robots.txt`). Tambahkan baris ini di sana:

```
Sitemap: https://andu.my.id/blog/sitemap.xml
```

Lalu daftarkan `https://andu.my.id/blog/sitemap.xml` di Google Search Console.

## Komentar (opsional)

Pasang giscus (https://giscus.app) lalu isi `repo`, `repo_id`, `category`, `category_id` di `_config.yml`.

## Google AdSense (opsional)

Sebelum disetujui, biarkan `adsense.client` kosong: tidak ada skrip atau iklan yang dimuat.

Setelah disetujui, isi di `_config.yml`:

```yaml
adsense:
  client: "ca-pub-1234567890123456"
  slot_atas: "1111111111"
  slot_tengah: "2222222222"
  slot_bawah: "3333333333"
```

- Buat tiga unit iklan "Display, responsif" di AdSense dan salin ID slot masing-masing.
- Iklan tengah muncul sebelum subjudul kedua (`##`), jadi tulisan butuh minimal dua subjudul.
- Slot yang dikosongkan tidak ditampilkan. Jika memakai Auto ads, cukup isi `client`.
- Tambahkan `noads: true` di front matter halaman atau tulisan yang tidak boleh menampilkan iklan.
- Halaman Kebijakan Privasi dan Kontak sudah tersedia di `/privasi/` dan `/kontak/`. Periksa dan sesuaikan isinya.
- Letakkan `ads.txt` di repo situs utama (lihat folder `untuk-repo-utama`).
