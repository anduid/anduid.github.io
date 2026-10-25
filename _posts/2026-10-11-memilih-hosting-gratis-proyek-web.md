---
layout: post
title: "Memilih Hosting Gratis untuk Proyek Web: GitHub Pages, Netlify, dan Lainnya"
description: "Perbandingan hosting gratis untuk proyek web statis: GitHub Pages, Netlify, Cloudflare Pages, dan Vercel. Kapan memakainya, batasannya, dan cara memilih sesuai kebutuhan."
date: 2026-10-11 02:00:00 +0700
tags: [hosting, web, github-pages, panduan]

# image: /assets/images/hosting-gratis.png
# image_alt: Perbandingan layanan hosting gratis untuk situs statis
---
<!-- CATATAN PENULIS (tidak tampil di situs): fitur, batas, dan syarat layanan hosting sering berubah. Periksa setiap klaim di situs resmi masing-masing sebelum diterbitkan, dan tambahkan pengalaman Anda memakai salah satunya di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Untuk blog pribadi, portofolio, dokumentasi, atau web app kecil, Anda tidak selalu perlu menyewa hosting berbayar. Beberapa layanan menyediakan hosting gratis untuk situs statis dengan kualitas yang sangat memadai: cepat, aman, dan terhubung langsung dengan repositori Git Anda.

<!-- TAMBAHKAN (1-2 kalimat): layanan hosting yang Anda pakai sekarang dan alasan memilihnya. -->

Tulisan ini membandingkan beberapa pilihan populer dan membantu Anda memutuskan berdasarkan kebutuhan, bukan sekadar nama yang paling terkenal. Karena fitur dan batas layanan berubah dari waktu ke waktu, gunakan tulisan ini sebagai kerangka berpikir, lalu cek halaman resmi masing-masing.

<!--more-->

## Apa itu situs statis

Situs statis terdiri dari berkas HTML, CSS, JavaScript, dan gambar yang disajikan apa adanya, tanpa kode server yang berjalan di belakang. Blog Jekyll, dokumentasi, portofolio, dan halaman pemasaran umumnya statis. Fungsi dinamis, seperti menyimpan data, biasanya ditangani layanan lain, misalnya API atau Google Apps Script seperti di [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).

## Pilihan yang populer

### GitHub Pages

Menyajikan situs langsung dari repositori GitHub. Mendukung Jekyll bawaan, domain sendiri, dan HTTPS.

- **Kelebihan**: sangat sederhana jika Anda sudah memakai GitHub, tanpa layanan tambahan, cocok untuk blog dan dokumentasi.
- **Batasan**: hanya untuk situs statis, ada batas ukuran dan penggunaan yang wajar, dan pilihan fitur build lebih terbatas dibanding layanan lain kecuali Anda memakai alur kerja kustom.

### Netlify

Layanan hosting situs statis dengan proses build otomatis dari repositori.

- **Kelebihan**: dukungan banyak kerangka kerja, pratinjau untuk setiap perubahan, formulir dan fungsi serverless pada paket tertentu.
- **Batasan**: ada kuota penggunaan pada paket gratis yang perlu dipantau.

### Cloudflare Pages

Hosting situs statis yang terintegrasi dengan jaringan Cloudflare.

- **Kelebihan**: jaringan global yang cepat, integrasi dengan layanan Cloudflare lain.
- **Batasan**: antarmuka dan fitur berkembang cepat, jadi cek dokumentasi terbaru untuk batas pada paket gratis.

### Vercel

Platform yang populer untuk aplikasi berbasis kerangka kerja JavaScript.

- **Kelebihan**: pengalaman pengembang yang baik, terutama untuk proyek berbasis kerangka kerja modern, serta pratinjau otomatis.
- **Batasan**: paket gratis biasanya diperuntukkan bagi penggunaan nonkomersial atau proyek pribadi, jadi baca syaratnya jika proyek Anda untuk bisnis.

<!-- TAMBAHKAN: pengalaman Anda memakai satu atau dua layanan di atas, termasuk kendala atau kejutan yang ditemui. -->

## Tabel ringkas

| Kebutuhan | Pilihan yang masuk akal |
|-----------|-------------------------|
| Blog Jekyll sederhana | GitHub Pages |
| Situs statis dengan pratinjau tiap perubahan | Netlify atau Cloudflare Pages |
| Aplikasi dengan kerangka kerja JavaScript modern | Vercel atau Netlify |
| Situs dokumentasi dari repositori | GitHub Pages atau Cloudflare Pages |
| Perlu fungsi server kecil | Netlify atau Vercel (fungsi serverless) |

Ini panduan kasar, bukan aturan mutlak.

## Hal yang perlu dipertimbangkan

Sebelum memilih, jawab pertanyaan berikut:

- **Apakah proyek statis?** Jika butuh basis data atau login sungguhan, Anda perlu layanan tambahan.
- **Apakah komersial?** Beberapa paket gratis membatasi penggunaan komersial. Baca syaratnya.
- **Berapa trafik yang diharapkan?** Paket gratis punya batas bandwidth atau permintaan.
- **Apakah butuh proses build khusus?** Jika ya, pilih layanan dengan build otomatis yang fleksibel.
- **Apakah perlu domain sendiri?** Hampir semua mendukungnya, tetapi cara pengaturannya berbeda.
- **Seberapa penting kontrol dan portabilitas?** Situs statis mudah dipindah, jadi risiko terikat pada satu layanan relatif kecil.

## Domain sendiri dan HTTPS

Semua layanan di atas mendukung domain sendiri dan menyediakan sertifikat HTTPS. Langkah umumnya sama: tambahkan domain di dasbor layanan, atur catatan DNS di penyedia domain sesuai petunjuk, tunggu verifikasi, lalu aktifkan HTTPS. Pemeriksaan DNS bisa memakan waktu. Contoh pengalaman memasang blog di subfolder domain ada di [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/).

## Batas yang perlu diwaspadai

- **Kuota bandwidth dan build.** Lonjakan kunjungan bisa menyentuh batas gratis.
- **Kebijakan penggunaan.** Layanan gratis umumnya melarang penyalahgunaan, termasuk pemakaian sebagai penyimpanan berkas besar.
- **Perubahan syarat.** Paket gratis bisa berubah. Simpan salinan proyek Anda dan jangan mengandalkan satu layanan tanpa cadangan.
- **Keamanan.** Hosting statis aman dari sisi server, tetapi API dan kunci yang Anda hubungkan tetap perlu dijaga, seperti di [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).

## Kapan hosting gratis tidak cukup

Pertimbangkan hosting berbayar atau server sendiri jika Anda membutuhkan:

- basis data dan logika server yang kompleks,
- jaminan ketersediaan dan dukungan resmi,
- trafik besar yang melewati batas paket gratis,
- kepatuhan khusus untuk data sensitif atau instansi.

Untuk kebutuhan resmi atau data pribadi, periksa ketentuan yang berlaku dan pilih layanan yang sesuai.

## Kesimpulan

Untuk situs statis, hosting gratis sudah sangat memadai. Mulailah dari GitHub Pages bila Anda sudah memakai GitHub dan situs Anda sederhana, dan pertimbangkan Netlify, Cloudflare Pages, atau Vercel jika butuh build yang lebih fleksibel atau pratinjau perubahan. Pahami batas dan syarat tiap layanan, simpan cadangan, dan jangan ragu berpindah jika kebutuhan berubah, karena situs statis relatif mudah dipindahkan.
