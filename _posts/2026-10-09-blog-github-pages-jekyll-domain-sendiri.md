---
layout: post
title: "Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri"
description: "Panduan membuat blog gratis di GitHub Pages dengan Jekyll, lengkap dengan domain sendiri di subfolder /blog/, SEO dasar, dan jebakan yang sering terjadi."
date: 2026-10-09 11:00:00 +0700
tags: [github-pages, jekyll, blog, tutorial]

# image: /assets/images/blog-github-pages.png
# image_alt: Struktur repo blog Jekyll di GitHub Pages
---
<!-- CATATAN PENULIS (tidak tampil di situs): tulisan ini berdasarkan proses nyata Anda membangun blog ini. Tambahkan kendala spesifik yang Anda alami di bagian bertanda "TAMBAHKAN", pasang tangkapan layar asli, dan hapus published: false saat selesai. -->

Blog tidak harus berbayar. Dengan GitHub Pages dan Jekyll, Anda bisa punya blog yang cepat, aman, dan gratis, bahkan dengan alamat domain sendiri. Tulisan tersusun dari file Markdown biasa, dan situs diperbarui otomatis setiap kali Anda menyimpan perubahan.

<!-- TAMBAHKAN (1-2 kalimat): alasan Anda memilih GitHub Pages dan Jekyll untuk blog ini. -->

Panduan ini membahas cara membuat blog dari nol, menempatkannya di subfolder domain utama (misalnya `domain.com/blog/`), menulis tulisan pertama, dan menghindari jebakan yang paling sering membuat blog tampil kosong.

<!--more-->

## Mengapa GitHub Pages dan Jekyll

GitHub Pages menyajikan situs statis langsung dari repositori Anda. Jekyll adalah pembuat situs statis yang didukung bawaan oleh GitHub Pages, jadi Anda tidak perlu memasang apa pun di komputer.

Kelebihannya: gratis, cepat karena tidak ada basis data, aman karena tidak ada kode server yang bisa diretas, dan semua riwayat perubahan tersimpan di Git. Kekurangannya: tidak ada panel admin bergaya WordPress, dan tulisan harus ditulis dalam Markdown. Untuk blog pribadi atau blog teknis, kompromi ini biasanya sepadan.

## Memilih jenis repositori

Ada dua pola alamat:

- **Situs pengguna.** Repo bernama `username.github.io`, melayani alamat utama.
- **Situs proyek.** Repo dengan nama bebas, misalnya `blog`, melayani alamat `username.github.io/blog/`.

Jika Anda sudah punya domain sendiri yang terhubung ke situs pengguna, repo proyek bernama `blog` otomatis tampil di `domain-anda.com/blog/`. Inilah cara termudah menempatkan blog di subfolder tanpa mengganggu situs utama.

## Struktur dasar blog Jekyll

Struktur minimal yang perlu Anda ketahui:

```text
blog/
  _config.yml     # pengaturan situs
  index.html      # beranda
  _layouts/       # kerangka halaman (default, post, page)
  _includes/      # potongan yang dipakai ulang (header, footer)
  _posts/         # tulisan dalam format Markdown
  assets/         # CSS, JavaScript, gambar
```

Jekyll menggabungkan layout, include, dan tulisan Anda menjadi halaman HTML statis saat build berjalan.

## Mengatur _config.yml

Dua pengaturan paling penting menentukan alamat situs:

```yaml
url: "https://domain-anda.com"
baseurl: "/blog"
```

`url` adalah alamat domain, dan `baseurl` adalah subfolder tempat blog berada. Jika blog berada di akar domain, kosongkan `baseurl`. Kesalahan pada dua baris ini membuat CSS dan tautan menu mengarah ke jalur yang salah, sehingga halaman tampil polos tanpa gaya.

Pastikan tautan di template memakai filter `relative_url`, supaya `baseurl` otomatis ikut ditambahkan.

## Mengaktifkan GitHub Pages

Di repo, buka **Settings > Pages**, pilih **Deploy from a branch**, lalu pilih branch `main` dan folder `/ (root)`. Simpan, tunggu satu sampai dua menit, dan situs aktif.

Untuk memantau, buka tab **Actions**. Setiap commit memicu proses *pages build and deployment*. Centang hijau berarti build berhasil; tanda silang berisi log yang menjelaskan kesalahannya.

## Menulis tulisan pertama

Buat file di folder `_posts/` dengan nama `TAHUN-BULAN-TANGGAL-judul.md`:

{% raw %}
```markdown
---
layout: post
title: "Judul Tulisan"
description: "Ringkasan 120-160 karakter untuk hasil pencarian."
date: 2026-10-09 08:00:00 +0700
tags: [catatan]
---
Paragraf pembuka.

<!--more-->

## Subjudul pertama

Isi tulisan dalam Markdown.
```
{% endraw %}

Bagian di antara dua tanda `---` disebut *front matter* dan wajib ada. Tanggal tidak boleh di masa depan, kalau tidak tulisan tidak ditampilkan. Untuk menyimpan draf, tambahkan `published: false`.

## Jebakan yang sering terjadi

Tiga masalah ini paling sering membuat blog baru terlihat rusak:

1. **Beranda kosong padahal ada tulisan.** Jika Anda memakai plugin `jekyll-paginate`, nilai `paginate_path` harus cocok dengan letak `index.html`. Untuk `index.html` di akar repo, gunakan bentuk `paginate_path: "/halaman:num/"`. Bentuk `"/halaman/:num/"` membuat Jekyll mencari `index.html` di folder `halaman/`, sehingga paginasi tidak berjalan.
2. **Tampilan polos tanpa gaya.** Hampir selalu karena `url` dan `baseurl` tidak sesuai dengan alamat sebenarnya.
3. **Perubahan tidak muncul.** Tunggu build di tab Actions selesai, lalu muat ulang dengan Ctrl+F5 untuk melewati cache peramban.

<!-- TAMBAHKAN: jebakan lain yang Anda alami sendiri saat membangun blog ini dan cara memperbaikinya. -->

## SEO dasar yang wajib ada

Agar blog mudah ditemukan, pastikan setiap halaman memiliki:

- judul halaman (`<title>`) yang unik dan jelas,
- `meta description` yang menarik,
- satu `<h1>` per halaman dan subjudul `<h2>` yang terstruktur,
- tag `canonical` dan tag Open Graph untuk pratinjau di media sosial,
- tampilan yang nyaman di ponsel,
- `sitemap.xml` yang didaftarkan di Google Search Console.

Semua ini bisa Anda tulis sekali di `_includes/head.html`, lalu dipakai oleh seluruh halaman.

## Domain sendiri dan HTTPS

Untuk domain sendiri, atur DNS di penyedia domain sesuai [dokumentasi GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site), lalu isi domain di **Settings > Pages > Custom domain**. Setelah pemeriksaan DNS selesai, aktifkan **Enforce HTTPS**. Pemeriksaan DNS bisa memakan waktu, jadi bersabarlah jika statusnya masih "in progress".

## Kesimpulan

Blog di GitHub Pages cukup dibangun dengan empat hal: repo yang benar, `_config.yml` dengan `url` dan `baseurl` yang tepat, template yang rapi, dan kebiasaan menulis dalam Markdown. Jebakan terbesarnya ada pada pengaturan alamat dan paginasi, jadi periksa dua hal itu lebih dulu saat ada yang tidak beres.

Jika Anda ingin membangun fitur di atasnya, baca juga [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).
