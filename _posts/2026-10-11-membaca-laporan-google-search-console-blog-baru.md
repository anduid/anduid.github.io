---
layout: post
title: "Membaca Laporan Google Search Console untuk Pemilik Blog Baru"
description: "Panduan membaca Google Search Console untuk blog baru: mendaftarkan situs, sitemap, laporan kinerja, status pengindeksan, inspeksi URL, dan cara memperbaiki masalah umum."
date: 2026-10-11 01:30:00 +0700
tags: [seo, search-console, blog, panduan]

# image: /assets/images/search-console-blog-baru.png
# image_alt: Dasbor laporan kinerja Google Search Console untuk sebuah blog
---
<!-- CATATAN PENULIS (tidak tampil di situs): tampilan dan istilah Search Console bisa berubah, jadi cocokkan dengan antarmuka terbaru dan tambahkan tangkapan layar dari akun Anda sendiri (samarkan data sensitif) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Setelah blog Anda terbit, pertanyaan berikutnya hampir selalu sama: apakah Google sudah menemukan tulisan saya, dan apakah ada yang membacanya? Jawabannya ada di Google Search Console, alat gratis dari Google yang menunjukkan bagaimana situs Anda tampil di hasil pencarian. Sayangnya, laporan di dalamnya sering membingungkan bagi pemula.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman pertama Anda memakai Search Console dan hal yang paling membingungkan atau paling berguna. -->

Tulisan ini menjelaskan cara memasang Search Console dan membaca laporan terpenting dengan bahasa sederhana.

<!--more-->

## Mendaftarkan situs

Buka Search Console dan tambahkan situs Anda sebagai *properti*. Ada dua jenis:

- **Properti domain**: mencakup seluruh domain dan subdomainnya, diverifikasi lewat catatan DNS.
- **Properti awalan URL**: mencakup alamat tertentu, misalnya `https://domain-anda.com/blog/`, diverifikasi lewat berkas HTML, tag meta, atau cara lain.

Pilih yang sesuai dengan kemampuan Anda mengakses DNS. Untuk blog di subfolder, properti domain memberi gambaran paling lengkap, sedangkan awalan URL berguna jika Anda ingin memantau bagian `/blog/` saja. Ikuti petunjuk verifikasi yang tampil di layar, karena caranya dapat berubah.

## Mengirim sitemap

Sitemap adalah daftar alamat halaman yang Anda ingin Google ketahui. Jika blog Anda memakai plugin `jekyll-sitemap`, alamatnya biasanya `/blog/sitemap.xml`. Di Search Console, buka menu **Sitemap**, masukkan alamatnya, lalu kirim. Statusnya akan berubah menjadi berhasil setelah Google membacanya.

Mengirim sitemap tidak menjamin semua halaman diindeks, tetapi membantu Google menemukan halaman Anda lebih cepat. Panduan menyiapkan blog beserta sitemap-nya ada di [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/).

## Laporan kinerja: empat angka yang perlu dipahami

Di laporan **Kinerja** (*Performance*), Anda akan melihat empat metrik:

| Metrik | Artinya |
|--------|---------|
| **Klik** | Berapa kali orang mengklik tautan Anda dari hasil pencarian |
| **Tayangan** | Berapa kali halaman Anda tampil di hasil pencarian |
| **CTR** | Persentase tayangan yang berubah menjadi klik |
| **Posisi rata-rata** | Peringkat rata-rata halaman Anda untuk pencarian tertentu |

Untuk blog baru, jangan kecil hati melihat angka rendah. Wajar jika di awal tayangan sedikit dan posisi jauh di bawah. Fokuslah pada **arah**: apakah tayangan bertambah dari minggu ke minggu.

<!-- TAMBAHKAN: tangkapan layar kinerja blog Anda dan perubahan yang Anda amati dalam beberapa minggu. -->

## Cara memakai data kinerja

Beberapa cara membaca laporan yang berguna:

- **Lihat kueri.** Tab **Kueri** menunjukkan kata yang dipakai orang saat menemukan Anda. Dari sana Anda tahu topik yang cocok untuk tulisan berikutnya.
- **Lihat halaman.** Tab **Halaman** menunjukkan tulisan yang paling sering tampil.
- **Cari peluang CTR.** Halaman dengan tayangan tinggi tetapi klik rendah mungkin punya judul atau deskripsi yang kurang menarik. Panduan memperbaikinya ada di [Cara Menulis Judul dan Meta Description yang Baik untuk Blog]({{ site.baseurl }}/2026/10/09/menulis-judul-dan-meta-description-blog/).
- **Cari kueri di posisi 8-20.** Halaman yang sudah dekat halaman pertama bisa naik dengan perbaikan isi atau tautan internal.
- **Bandingkan periode.** Gunakan filter tanggal untuk membandingkan dua rentang waktu.

Data baru muncul dengan jeda, dan Search Console hanya menampilkan data untuk pencarian yang cukup berarti, jadi jumlahnya bisa tidak persis sama dengan alat lain.

## Laporan pengindeksan halaman

Laporan **Halaman** (*Pages*, di bagian Pengindeksan) menunjukkan halaman mana yang sudah masuk indeks Google dan mana yang belum, lengkap dengan alasannya. Beberapa status yang umum untuk blog baru:

- **Terindeks**: halaman sudah masuk indeks.
- **Ditemukan, saat ini belum diindeks**: Google tahu halaman itu ada, tetapi belum menjadwalkan untuk dirayapi.
- **Dirayapi, saat ini belum diindeks**: Google sudah membacanya tetapi belum memutuskan memasukkannya.
- **Dikecualikan oleh tag noindex**: halaman sengaja diberi `noindex`, misalnya halaman cari.
- **Halaman alternatif dengan tag kanonis yang tepat**: Google memilih alamat lain sebagai versi utama.

Status "belum diindeks" sangat umum di blog baru dan tidak selalu berarti ada masalah. Seringkali ia berarti Google butuh waktu, atau menilai konten belum cukup kuat. Memperkaya isi tulisan, menambah tautan internal antarhalaman, dan menunggu biasanya lebih efektif daripada meminta ulang berkali-kali. Nama status bisa berbeda di antarmuka terbaru, jadi cocokkan dengan yang Anda lihat.

## Inspeksi URL

Alat **Inspeksi URL** di bagian atas memungkinkan Anda memasukkan alamat satu halaman dan melihat statusnya: apakah terindeks, kapan terakhir dirayapi, dan alamat kanonis yang dipilih. Untuk halaman baru atau yang baru diperbarui, Anda bisa memakai **Minta pengindeksan**. Pakai seperlunya, karena ada batas harian dan permintaan berulang tidak mempercepat apa pun.

## Masalah umum dan cara memeriksanya

| Gejala | Yang perlu diperiksa |
|--------|----------------------|
| Halaman tidak muncul di Google | Apakah ada tag `noindex`, apakah masuk sitemap, apakah sudah diindeks |
| Halaman terindeks tetapi tidak dapat klik | Judul dan deskripsi, kesesuaian dengan maksud pencarian |
| Banyak halaman "belum diindeks" | Mutu isi, tautan internal, usia situs |
| Halaman alternatif | Tag kanonis dan alamat ganda (dengan dan tanpa garis miring akhir) |
| Peringatan kegunaan seluler | Tata letak responsif dan ukuran teks |

Jika `robots.txt` atau tag `noindex` tidak sengaja memblokir halaman, perbaiki dulu sebelum menyimpulkan penyebab lain. Perhatikan pula bahwa `robots.txt` harus berada di akar domain.

## Kebiasaan pemantauan yang ringan

Anda tidak perlu membuka Search Console setiap hari. Cukup:

- **Mingguan**: lihat tren klik dan tayangan serta kueri baru.
- **Setelah menerbitkan tulisan**: periksa dengan Inspeksi URL bahwa halaman terbaca.
- **Bulanan**: tinjau laporan pengindeksan dan perbaiki masalah yang muncul.
- **Setelah mengubah template atau pengaturan**: periksa bahwa tidak ada halaman penting yang terblokir.

## Kesalahan yang sering terjadi

- **Panik melihat angka kecil** di minggu-minggu awal.
- **Meminta pengindeksan berulang kali** untuk halaman yang sama.
- **Mengabaikan status "belum diindeks"** tanpa memperbaiki mutu atau tautan internal.
- **Lupa verifikasi kepemilikan** sehingga data tidak muncul.
- **Memperbandingkan angka dengan alat lain** dan menganggap salah satunya keliru, padahal definisinya berbeda.

## Kesimpulan

Search Console adalah cara paling langsung mengetahui bagaimana Google melihat blog Anda. Daftarkan situs, kirim sitemap, pelajari empat metrik kinerja, periksa laporan pengindeksan, dan jadikan data kueri sebagai sumber ide tulisan berikutnya. Untuk blog baru, kesabaran dan perbaikan mutu konten lebih berharga daripada mengejar angka harian.
