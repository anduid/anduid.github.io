# Blog Saya (Jekyll + GitHub Pages)

Blog statis berbahasa Indonesia: tema terang/gelap, pencarian, arsip, topik (tag), RSS, sitemap, SEO, dan komentar opsional.

## Pasang di GitHub Pages

1. Buat repo publik bernama `USERNAME.github.io`.
2. Unggah **seluruh isi folder ini** ke repo (Add file > Upload files, atau `git push`).
3. Buka **Settings > Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu Save.
4. Tunggu 1-2 menit, buka `https://USERNAME.github.io`.

## Ubah pengaturan

Edit `_config.yml`: `title`, `tagline`, `description`, `author`, `url`, `github_username`, dan menu `nav`.
Jika repo bukan `USERNAME.github.io`, isi `baseurl: "/nama-repo"`.

## Menulis tulisan baru

Buat file di `_posts/` bernama `TAHUN-BULAN-TANGGAL-judul.md`:

```markdown
---
layout: post
title: "Judul Tulisan"
date: 2026-10-10 08:00:00 +0700
tags: [catatan]
---
Paragraf pembuka (ini jadi ringkasan di beranda).

<!--more-->

Isi selanjutnya...
```

Tanggal tidak boleh di masa depan, kalau tidak tulisan tidak tampil.

## Halaman baru

Buat file `.md` di root dengan `layout: page`, `title`, dan `permalink`. Untuk memasukkannya ke menu, tambahkan di `nav` pada `_config.yml`.

## Gambar

Simpan di `assets/images/` lalu panggil `![teks]({{ '/assets/images/foto.jpg' | relative_url }})`.

## Komentar (opsional)

Aktifkan Discussions di repo, pasang aplikasi giscus (https://giscus.app), lalu salin nilai `repo`, `repo_id`, `category`, `category_id` ke `_config.yml`.

## Preview lokal (opsional)

```bash
bundle install
bundle exec jekyll serve
```
Buka http://localhost:4000
