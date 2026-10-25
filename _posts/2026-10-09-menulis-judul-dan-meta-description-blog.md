---
layout: post
title: "Cara Menulis Judul dan Meta Description yang Baik untuk Blog"
description: "Panduan menulis judul halaman dan meta description untuk blog: panjang ideal, kata kunci alami, contoh sebelum dan sesudah, serta cara mengeceknya di Search Console."
date: 2026-10-09 16:00:00 +0700
tags: [seo, blog, panduan]

# image: /assets/images/judul-meta-description.png
# image_alt: Contoh tampilan judul dan deskripsi blog di hasil pencarian Google
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan contoh nyata dari blog Anda sendiri (sebelum dan sesudah memperbaiki judul) di bagian bertanda "TAMBAHKAN". Pastikan klaim tentang Google sesuai dokumentasi resmi terbaru. Hapus published: false saat selesai. -->

Dua hal pertama yang dilihat calon pembaca di hasil pencarian adalah judul dan deskripsi singkat di bawahnya. Keduanya menentukan apakah orang mengklik tulisan Anda atau melewatinya. Isi tulisan boleh bagus, tetapi kalau judul dan deskripsinya buruk, pembaca tidak akan sampai ke sana.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memperbaiki judul atau deskripsi dan perubahan yang Anda lihat. -->

Tulisan ini membahas cara menulis judul halaman (`<title>`) dan *meta description* yang jelas, jujur, dan menarik, lengkap dengan contoh sebelum dan sesudah serta cara memeriksanya.

<!--more-->

## Tiga hal yang sering tertukar

- **Judul halaman (`<title>`).** Teks yang tampil di tab peramban dan menjadi judul biru di hasil pencarian.
- **Judul tulisan (`<h1>`).** Judul yang tampil di halaman. Bisa sama dengan `<title>`, bisa sedikit berbeda.
- **Meta description.** Ringkasan satu atau dua kalimat di bawah judul di hasil pencarian.

Ketiganya perlu konsisten satu sama lain dan menjelaskan isi halaman yang sama.

## Menulis judul yang baik

Pegangan praktis:

- **Panjang sekitar 50-60 karakter.** Google memotong judul berdasarkan lebar piksel, bukan jumlah karakter persis, jadi judul yang terlalu panjang akan terpotong dengan tanda elipsis.
- **Taruh kata kunci utama di awal**, dengan cara yang wajar. Tulis untuk manusia dulu.
- **Jelaskan manfaat atau isi.** Pembaca perlu tahu apa yang mereka dapat.
- **Jujur.** Judul harus sesuai isi. Judul yang menjanjikan lebih dari isi tulisan membuat pembaca cepat keluar.
- **Unik di setiap halaman.** Judul yang sama di banyak halaman membingungkan pembaca dan mesin pencari.
- **Tambahkan nama blog di belakang** dengan pemisah, misalnya `| Blog Andu`, jika masih muat.

Contoh sebelum dan sesudah:

| Kurang baik | Lebih baik |
|-------------|------------|
| Blog Saya - Postingan 1 | Backend Gratis dengan Google Apps Script dan Sheets |
| Cara Mudah Sekali Banget Rahasia Programmer | Mengubah Web App Menjadi Aplikasi Android dengan WebView |
| Tutorial | Panduan Digitalisasi Arsip untuk Kantor Kecil |

## Menulis meta description yang baik

Meta description tidak langsung menentukan peringkat, tetapi sangat memengaruhi apakah orang mengklik. Pegangan praktis:

- **Panjang sekitar 120-160 karakter.** Lebih panjang dari itu cenderung terpotong.
- **Ringkas isi dan manfaatnya** dalam satu atau dua kalimat.
- **Gunakan kata kunci secara alami.** Google menebalkan kata yang cocok dengan pencarian pengguna.
- **Tulis unik untuk setiap halaman.** Jangan menyalin deskripsi yang sama ke banyak tulisan.
- **Hindari memenuhinya dengan kata kunci** atau tanda baca berlebihan.
- **Ajak membaca dengan wajar**, misalnya menyebut apa yang akan dipelajari.

Contoh:

| Kurang baik | Lebih baik |
|-------------|------------|
| Tulisan tentang Google Sheets. | Cara membuat aplikasi web tanpa server sendiri: Google Sheets sebagai database dan Apps Script sebagai API. |
| backend gratis, backend murah, backend apps script, sheets database, apps script api | Panduan membuat backend gratis dengan Google Apps Script dan Sheets, lengkap dengan contoh kode dan batas kuotanya. |

Google kadang menampilkan deskripsi yang ia susun sendiri dari isi halaman, terutama jika deskripsi Anda dianggap kurang sesuai dengan kata pencarian. Karena itu, pastikan isi halaman sendiri juga jelas dan terstruktur.

## Cara menuliskannya di HTML

Di bagian `<head>` halaman:

```html
<title>Backend Gratis dengan Apps Script dan Sheets | Blog Andu</title>
<meta name="description" content="Cara membuat aplikasi web tanpa server sendiri: Google Sheets sebagai database dan Apps Script sebagai API.">
```

Di Jekyll, Anda cukup mengisi `title` dan `description` di *front matter* tiap tulisan, dan template akan memasukkannya ke tag yang benar:

```yaml
title: "Backend Gratis dengan Google Apps Script dan Sheets"
description: "Cara membuat aplikasi web tanpa server sendiri: Google Sheets sebagai database dan Apps Script sebagai API."
```

<!-- TAMBAHKAN: bagaimana template blog Anda mengisi judul dan deskripsi, dan satu perbaikan yang pernah Anda lakukan. -->

## Pelengkap: struktur judul di dalam tulisan

Judul dan deskripsi bekerja bersama dengan struktur isi:

- Satu `<h1>` per halaman yang memuat judul tulisan.
- Subjudul `<h2>` untuk bagian utama dan `<h3>` untuk rincian di bawahnya.
- Jangan melompati tingkat judul hanya demi ukuran huruf. Atur ukuran lewat CSS.

Struktur ini membantu pembaca memindai tulisan dan membantu mesin pencari memahami topik tiap bagian.

## Pratinjau media sosial

Saat tautan dibagikan di WhatsApp atau media sosial, yang tampil adalah tag Open Graph: `og:title`, `og:description`, dan `og:image`. Biasanya isinya sama dengan judul dan deskripsi Anda, ditambah gambar berukuran sekitar 1200 x 630 piksel. Pastikan ketiganya terisi agar tautan terlihat menarik saat dibagikan.

## Memeriksa hasilnya

- **Google Search Console.** Laporan kinerja menunjukkan jumlah tayang, klik, dan rasio klik (CTR) per halaman. Halaman dengan tayangan tinggi tetapi klik rendah adalah kandidat utama untuk memperbaiki judul dan deskripsi.
- **Cari sendiri.** Ketik `site:domain-anda.com/blog` di Google untuk melihat bagaimana halaman Anda tampil.
- **Alat pratinjau.** Gunakan pemeriksa Open Graph untuk melihat tampilan tautan di media sosial.

Setelah mengubah, beri waktu agar Google memperbarui tampilannya. Perubahan tidak langsung terlihat.

## Kesalahan yang sering terjadi

- **Judul sama untuk banyak halaman**, misalnya hanya nama blog.
- **Deskripsi kosong atau disalin dari halaman lain.**
- **Judul terlalu panjang** sehingga bagian pentingnya terpotong.
- **Janji yang tidak sesuai isi**, yang menaikkan klik tetapi menurunkan kepercayaan.
- **Memaksakan kata kunci** sampai kalimat terdengar tidak wajar.

## Kesimpulan

Judul dan meta description adalah "etalase" tulisan Anda. Tulis keduanya khusus untuk setiap halaman, jaga panjangnya, buat jujur dan jelas, lalu periksa kinerjanya di Search Console dan perbaiki yang kurang diklik. Investasi beberapa menit per tulisan ini sering memberi dampak yang besar.

Untuk membangun blog yang sudah menyiapkan tag-tag ini otomatis, baca [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/).
