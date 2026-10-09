---
layout: post
title: "Contoh format tulisan: gambar, kode, kutipan, tabel"
date: 2026-10-08 09:30:00 +0700
tags: [tutorial, markdown]
---
Tulisan ini memperlihatkan format yang bisa dipakai di blog.

<!--more-->

## Teks dan tautan

Teks **tebal**, *miring*, dan [tautan ke GitHub Pages](https://pages.github.com).

## Daftar

- Poin pertama
- Poin kedua
  - Poin turunan

## Kutipan

> Menulis adalah cara paling sederhana untuk memahami apa yang kita pikirkan.

## Kode

```js
function sapa(nama) {
  return `Halo, ${nama}!`;
}
```

## Tabel

| Fitur | Keterangan |
|-------|------------|
| Cari  | Pencarian di halaman Cari |
| RSS   | Tersedia di /feed.xml |
| Tema  | Terang dan gelap |

## Gambar

Simpan gambar di `assets/images/`, lalu panggil seperti ini:

```markdown
{% raw %}![Deskripsi gambar]({{ '/assets/images/foto.jpg' | relative_url }}){% endraw %}
```
