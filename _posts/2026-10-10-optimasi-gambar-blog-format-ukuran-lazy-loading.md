---
layout: post
title: "Optimasi Gambar untuk Blog: Format, Ukuran, dan Lazy Loading"
description: "Cara mengoptimasi gambar untuk blog agar cepat dimuat: memilih format WebP, mengecilkan ukuran, srcset, atribut width dan height, lazy loading, serta alt text."
date: 2026-10-10 02:45:00 +0700
tags: [seo, performa, blog, panduan]

# image: /assets/images/optimasi-gambar-blog.png
# image_alt: Perbandingan ukuran gambar sebelum dan sesudah dioptimasi
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan angka nyata dari blog Anda (ukuran gambar sebelum dan sesudah, skor kecepatan) di bagian bertanda "TAMBAHKAN", dan uji perintah di komputer Anda. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Gambar sering menjadi bagian terberat dari sebuah halaman web. Satu foto dari kamera ponsel bisa berukuran beberapa megabita, dan jika dimasukkan apa adanya ke blog, halaman terasa lambat, terutama di koneksi seluler. Kecepatan memengaruhi kenyamanan pembaca, dan juga memengaruhi seberapa baik halaman dinilai oleh mesin pencari.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memperbaiki kecepatan blog atau situs dan hasil yang Anda lihat. -->

Tulisan ini membahas langkah praktis mengoptimasi gambar: memilih format, mengecilkan ukuran, menyajikan ukuran yang sesuai perangkat, menunda pemuatan, dan menulis teks alternatif.

<!--more-->

## Mulai dari ukuran yang tepat

Kesalahan paling umum adalah mengunggah gambar yang jauh lebih besar dari yang tampil. Jika kolom tulisan Anda hanya selebar 700 piksel, gambar berlebar 4000 piksel hanya membuang data.

- Tentukan lebar maksimum gambar di tata letak Anda.
- Ubah ukuran gambar ke lebar yang sesuai, atau sedikit lebih besar untuk layar beresolusi tinggi (sekitar dua kali).
- Untuk gambar sampul dan pratinjau media sosial, 1200 x 630 piksel sudah memadai.

Contoh mengubah ukuran dengan ImageMagick:

```bash
magick foto.jpg -resize 1200x foto-1200.jpg
```

## Pilih format yang tepat

| Format | Cocok untuk | Catatan |
|--------|-------------|---------|
| JPEG | Foto | Didukung semua tempat |
| PNG | Gambar dengan transparansi, tangkapan layar | Berkas cenderung besar |
| WebP | Foto dan grafik | Ukuran umumnya lebih kecil dan didukung peramban modern |
| AVIF | Foto | Sangat efisien, dukungan makin luas tetapi periksa kebutuhan Anda |
| SVG | Logo, ikon, diagram | Vektor, tajam di ukuran berapa pun |

Untuk blog, WebP biasanya pilihan seimbang. Gunakan SVG untuk ikon dan diagram sederhana.

## Kompres tanpa merusak tampilan

Setelah ukuran dan format sesuai, kompres. Untuk WebP, alat `cwebp` bisa dipakai:

```bash
cwebp -q 80 foto-1200.jpg -o foto-1200.webp
```

Nilai kualitas 75-85 biasanya cukup baik dan jauh lebih kecil dari aslinya. Bandingkan hasilnya dengan mata Anda sendiri, lalu pilih nilai terendah yang masih tampak bersih. Ada pula alat berbasis web seperti Squoosh bagi yang lebih suka antarmuka grafis.

<!-- TAMBAHKAN: alat dan pengaturan yang Anda pakai, serta ukuran sebelum dan sesudah pada satu gambar nyata. -->

## Tuliskan lebar dan tinggi di HTML

Jika peramban tidak tahu ukuran gambar sebelum selesai diunduh, tata letak akan "melompat" saat gambar muncul. Itu mengganggu dan dihitung sebagai masalah stabilitas tampilan. Solusinya, selalu cantumkan `width` dan `height`:

```html
<img src="foto-800.webp" width="800" height="450" alt="Deskripsi gambar">
```

Dengan atribut itu, peramban mencadangkan ruang yang tepat dan tampilan tetap stabil. Atur ukuran tampilannya dengan CSS, misalnya `max-width: 100%; height: auto;`.

## Sajikan ukuran sesuai perangkat dengan srcset

Layar ponsel tidak perlu gambar selebar 1200 piksel. Dengan `srcset`, Anda menyediakan beberapa ukuran, dan peramban memilih yang sesuai:

```html
<img
  src="foto-800.webp"
  srcset="foto-480.webp 480w, foto-800.webp 800w, foto-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800" height="450"
  alt="Deskripsi gambar"
  loading="lazy" decoding="async">
```

`sizes` memberi tahu peramban perkiraan lebar tampil gambar, sehingga ia bisa memilih berkas yang paling hemat. Untuk blog kecil, menyiapkan dua atau tiga ukuran sudah cukup.

## Tunda pemuatan dengan lazy loading

Gambar yang belum terlihat di layar tidak perlu diunduh dulu. Atribut `loading="lazy"` menunda pemuatan sampai gambar mendekati area yang terlihat:

```html
<img src="foto.webp" width="800" height="450" alt="..." loading="lazy">
```

Ada satu pengecualian penting: **jangan menunda gambar yang langsung terlihat di bagian atas halaman**, seperti gambar sampul. Gambar itu justru sebaiknya dimuat secepatnya. Biarkan tanpa `loading="lazy"`, atau tambahkan `fetchpriority="high"` untuk gambar utama:

```html
<img src="sampul.webp" width="1200" height="630" alt="..." fetchpriority="high">
```

## Tulis alt text yang bermakna

Teks alternatif (`alt`) dibaca oleh pembaca layar, muncul saat gambar gagal dimuat, dan membantu mesin pencari memahami isi gambar.

- Jelaskan isi dan fungsi gambar secara singkat dan spesifik.
- Jangan memulai dengan "gambar dari" atau "foto dari".
- Jangan menjejalkan kata kunci.
- Untuk gambar murni dekoratif, gunakan `alt=""` agar pembaca layar melewatinya.

Contoh kurang baik: `alt="gambar1"`. Contoh lebih baik: `alt="Diagram alur data dari halaman web ke Apps Script dan Google Sheets"`.

## Nama berkas dan lokasi

Beri nama berkas yang deskriptif dan memakai huruf kecil dengan tanda hubung, misalnya `diagram-alur-apps-script.webp`, bukan `IMG_20261010_0042.jpg`. Simpan semua gambar blog di satu folder seperti `assets/images/`, dan di Jekyll panggil dengan `relative_url` supaya alamatnya benar saat blog berada di subfolder, seperti dibahas di [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/).

## Gambar untuk pratinjau media sosial

Gambar sampul yang Anda tentukan dengan `image:` di front matter juga dipakai sebagai pratinjau saat tautan dibagikan. Gunakan ukuran sekitar 1200 x 630 piksel dan pastikan teks pada gambar tetap terbaca saat dikecilkan. Detail tag Open Graph ada di [Cara Menulis Judul dan Meta Description yang Baik untuk Blog]({{ site.baseurl }}/2026/10/09/menulis-judul-dan-meta-description-blog/).

## Memeriksa hasilnya

- Jalankan pengujian kecepatan seperti PageSpeed Insights untuk melihat apakah gambar masih ditandai terlalu besar.
- Buka halaman di ponsel dengan koneksi seluler biasa dan rasakan sendiri kecepatannya.
- Periksa tab Network di alat pengembang peramban untuk melihat berkas terbesar.

## Kesalahan yang sering terjadi

- **Mengunggah foto asli dari kamera** tanpa mengubah ukuran.
- **Tidak mencantumkan `width` dan `height`**, sehingga tata letak melompat.
- **Memberi `loading="lazy"` pada gambar sampul** yang langsung terlihat.
- **Alt text kosong atau asal**, padahal gambar membawa informasi.
- **Memakai PNG untuk foto**, yang ukurannya jauh lebih besar dari JPEG atau WebP.

## Kesimpulan

Optimasi gambar adalah salah satu cara paling efektif membuat blog lebih cepat. Ubah ukuran sesuai tampilan, pilih format modern seperti WebP, kompres, cantumkan `width` dan `height`, gunakan `srcset` dan `lazy loading` pada tempatnya, serta tulis alt text yang bermakna. Beberapa menit per gambar akan memberi pengalaman yang jauh lebih baik bagi pembaca Anda.
