---
layout: post
title: "Cara Menulis README Proyek yang Baik di GitHub"
description: "Panduan menulis README yang jelas untuk proyek GitHub: struktur, template Markdown, instalasi, contoh pemakaian, tangkapan layar, lisensi, dan kesalahan umum."
date: 2026-10-11 01:15:00 +0700
tags: [github, dokumentasi, panduan]

# image: /assets/images/readme-proyek.png
# image_alt: Contoh halaman README sebuah proyek di GitHub
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan contoh README dari proyek Anda sendiri (sebelum dan sesudah diperbaiki) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

README adalah halaman pertama yang dilihat orang saat membuka repositori Anda di GitHub. Dalam beberapa detik, pengunjung memutuskan apakah proyek ini berguna, bisa dipercaya, dan layak dicoba. Proyek yang bagus dengan README yang buruk sering ditinggalkan, sedangkan README yang jelas membuat proyek sederhana pun terasa matang.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda membaca atau menulis README yang membantu atau justru membingungkan. -->

Tulisan ini membahas apa yang sebaiknya ada di README, memberikan template yang bisa langsung dipakai, dan menunjukkan kesalahan yang paling sering terjadi.

<!--more-->

## Untuk siapa README ditulis

Bayangkan tiga pembaca:

- **Orang yang baru menemukan proyek Anda** dan ingin tahu ini apa.
- **Pengguna** yang ingin memasang dan memakainya.
- **Diri Anda sendiri enam bulan lagi**, yang sudah lupa cara menjalankan semuanya.

README yang baik menjawab pertanyaan ketiganya, dari yang paling umum ke yang paling teknis.

## Struktur yang disarankan

Urutan bagian yang umum dan efektif:

1. **Judul dan deskripsi satu kalimat.** Apa proyek ini dan untuk apa.
2. **Tangkapan layar atau demo.** Gambar sering menjelaskan lebih cepat daripada paragraf.
3. **Fitur utama.** Daftar singkat.
4. **Prasyarat.** Alat dan versi yang dibutuhkan.
5. **Instalasi.** Langkah berurutan yang bisa disalin.
6. **Cara memakai.** Contoh nyata.
7. **Konfigurasi.** Pengaturan yang perlu diubah.
8. **Struktur proyek** (opsional) untuk proyek yang lebih besar.
9. **Kontribusi.** Cara membantu atau melapor masalah.
10. **Lisensi.** Aturan pemakaian kode.
11. **Kontak atau tautan.**

Tidak semua proyek butuh semua bagian. Proyek kecil cukup dengan deskripsi, instalasi, dan cara pakai.

## Template yang bisa disalin

````markdown
# Nama Proyek

Satu kalimat yang menjelaskan apa proyek ini dan untuk siapa.

![Tangkapan layar aplikasi](docs/tangkapan-layar.png)

## Fitur

- Fitur pertama
- Fitur kedua
- Fitur ketiga

## Prasyarat

- Node.js 20 atau lebih baru
- Akun Google (untuk Apps Script)

## Instalasi

```bash
git clone https://github.com/username/nama-repo.git
cd nama-repo
npm install
```

## Cara memakai

```bash
npm start
```

Buka http://localhost:3000 di peramban Anda.

## Konfigurasi

Salin `.env.contoh` menjadi `.env`, lalu isi nilai yang diperlukan.

## Kontribusi

Laporan masalah dan pull request sangat diterima. Baca CONTRIBUTING.md
sebelum mengirim perubahan.

## Lisensi

Dirilis di bawah lisensi MIT. Lihat berkas LICENSE.
````

Ganti isi contoh dengan informasi proyek Anda yang sebenarnya.

<!-- TAMBAHKAN: README dari salah satu proyek Anda yang menurut Anda sudah baik, dan apa yang Anda perbaiki darinya. -->

## Tulis instalasi seperti resep

Langkah instalasi harus bisa diikuti orang yang belum mengenal proyek Anda:

- Tulis perintah dalam blok kode agar mudah disalin.
- Sebutkan versi alat yang dibutuhkan.
- Urutkan langkah secara berurutan dan lengkap.
- Jelaskan apa yang seharusnya terlihat jika berhasil.
- Uji sendiri instruksi Anda di komputer bersih atau minta orang lain mencobanya.

Instruksi yang tidak pernah diuji adalah sumber keluhan terbesar.

## Gunakan gambar dengan bijak

Tangkapan layar, GIF singkat, atau diagram membuat proyek mudah dipahami. Simpan di folder seperti `docs/` dan beri teks alternatif. Pastikan tidak ada data pribadi, kunci, atau informasi sensitif yang terlihat di dalamnya. Tips ukuran dan format ada di [Optimasi Gambar untuk Blog]({{ site.baseurl }}/2026/10/10/optimasi-gambar-blog-format-ukuran-lazy-loading/).

## Jangan lupakan lisensi

Tanpa lisensi, orang lain pada dasarnya tidak punya izin memakai kode Anda. Pilih lisensi yang sesuai, seperti MIT untuk izin yang longgar atau lisensi lain sesuai tujuan Anda, lalu tambahkan berkas `LICENSE`. Situs seperti choosealicense.com membantu membandingkannya. Jika proyek Anda dipakai di lingkungan resmi, pastikan lisensinya sesuai ketentuan yang berlaku.

## Hal yang jangan ada di README

- **Rahasia.** Kunci API, kata sandi, dan token tidak boleh muncul, bahkan sebagai contoh yang mirip asli. Lihat [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).
- **Informasi pribadi atau data internal.**
- **Klaim yang tidak bisa dibuktikan.**
- **Instruksi yang sudah usang.**

## Merawat README

README adalah dokumentasi hidup:

- Perbarui saat langkah instalasi atau fitur berubah.
- Hapus fitur yang sudah tidak ada.
- Beri catatan versi atau tanggal pembaruan untuk proyek yang berubah cepat.
- Gunakan berkas `CHANGELOG.md` untuk riwayat perubahan penting.

Saat membuat repo dari template, siapkan README bawaan yang berisi daftar yang harus diisi. Pendekatan ini dibahas di [Membuat Banyak Aplikasi Android Lebih Cepat dengan Template Proyek]({{ site.baseurl }}/2026/10/10/template-proyek-android-banyak-aplikasi/).

## Kesalahan yang sering terjadi

- **Hanya berisi nama proyek.** Pengunjung tidak tahu apa isinya.
- **Instalasi yang tidak lengkap**, sehingga gagal di langkah ketiga.
- **Tidak ada contoh pemakaian.**
- **Terlalu panjang dan tidak terstruktur.** Gunakan judul dan daftar.
- **Tidak ada lisensi.**
- **Gambar rusak** karena jalur salah atau berkas dihapus.

## Kesimpulan

README yang baik tidak harus panjang, tetapi harus jelas: apa proyeknya, bagaimana memasangnya, bagaimana memakainya, dan bagaimana membantu. Pakai template di atas, uji instruksi Anda sendiri, jaga agar tetap mutakhir, dan jangan pernah mencantumkan rahasia. Beberapa menit untuk README sering menentukan apakah proyek Anda dipakai orang lain.
