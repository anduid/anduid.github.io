---
layout: post
title: "Daftar Periksa Rilis Aplikasi Android ke Google Play"
description: "Daftar periksa rilis aplikasi Android ke Google Play: akun, penandatanganan AAB, halaman toko, kebijakan privasi, formulir keamanan data, dan pengujian."
date: 2026-10-09 12:00:00 +0700
tags: [android, google-play, rilis, panduan]

# image: /assets/images/rilis-google-play.png
# image_alt: Daftar periksa rilis aplikasi Android di Google Play Console
---
<!-- CATATAN PENULIS (tidak tampil di situs): tulisan ini berisi daftar periksa umum. Persyaratan Google Play sering berubah, jadi periksa setiap butir ke dokumentasi resmi terbaru sebelum diterbitkan, lalu tambahkan pengalaman rilis Anda sendiri di bagian bertanda "TAMBAHKAN". Hapus published: false saat selesai. -->

Menulis aplikasi hanyalah separuh pekerjaan. Separuh lainnya adalah membawanya ke Google Play tanpa ditolak, tanpa kejutan di menit terakhir, dan dengan setelan yang benar. Banyak pengembang pemula terhenti bukan karena kode, melainkan karena urusan administrasi rilis.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda merilis aplikasi ke Google Play, termasuk kendala yang pernah ditemui. -->

Tulisan ini merangkum daftar periksa yang bisa Anda ikuti dari persiapan akun sampai peluncuran. Karena aturan Google Play berubah dari waktu ke waktu, anggap ini panduan umum dan selalu cek ke dokumentasi resmi.

<!--more-->

## 1. Akun pengembang

Anda perlu akun Google Play Console. Pendaftaran umumnya dikenai biaya satu kali dan membutuhkan verifikasi identitas. Pilih jenis akun (pribadi atau organisasi) dengan cermat, karena persyaratannya berbeda, termasuk soal pengujian sebelum rilis publik. Periksa syarat terbaru di [pusat bantuan Play Console](https://support.google.com/googleplay/android-developer).

## 2. Menyiapkan paket aplikasi

Google Play menerima paket dalam format **Android App Bundle (AAB)**. Di Android Studio, gunakan **Build > Generate Signed Bundle / APK** dan pilih Android App Bundle.

Hal yang perlu dicek:

- **`applicationId`** unik dan tidak akan Anda ganti lagi, karena menjadi identitas permanen aplikasi.
- **`versionCode`** naik setiap kali Anda mengunggah versi baru, dan **`versionName`** adalah nomor yang dilihat pengguna.
- **`targetSdk`** memenuhi persyaratan terbaru Google Play. Persyaratan ini berubah berkala, jadi periksa [dokumentasi Android Developers](https://developer.android.com/distribute/best-practices/launch/target-sdk).
- Mode **rilis** (bukan debug) dengan pengaturan penyusutan kode dan pengaburan (*R8/ProGuard*) yang sudah diuji.

## 3. Penandatanganan dan keystore

Aplikasi harus ditandatangani. Dengan **Play App Signing**, Google menyimpan kunci penandatangan aplikasi, dan Anda memakai *upload key* untuk mengunggah pembaruan.

Simpan file keystore dan kata sandinya di tempat aman, dengan lebih dari satu salinan cadangan. Jangan memasukkannya ke repositori publik. Kehilangan kunci unggah bisa menyulitkan pembaruan aplikasi.

## 4. Halaman toko aplikasi

Siapkan materi yang lengkap dan jujur:

- nama aplikasi, deskripsi singkat, dan deskripsi lengkap,
- ikon aplikasi, gambar fitur (*feature graphic*), dan tangkapan layar,
- kategori yang tepat dan informasi kontak.

Ukuran dan ketentuan gambar bisa berubah, jadi ikuti panduan di Play Console saat mengisi. Pastikan tangkapan layar menunjukkan aplikasi yang sebenarnya, bukan gambar yang menyesatkan.

## 5. Kebijakan privasi dan formulir keamanan data

Hampir semua aplikasi wajib memiliki **kebijakan privasi** di alamat yang bisa dibuka publik. Alamat itu dimasukkan di Play Console dan sebaiknya juga bisa diakses dari dalam aplikasi.

Selain itu ada formulir **Keamanan Data** (*Data safety*) yang meminta Anda menjelaskan data apa yang dikumpulkan, untuk apa, dan apakah dibagikan. Isi dengan jujur dan konsisten dengan perilaku aplikasi dan semua pustaka yang Anda pakai, termasuk iklan dan analitik.

<!-- TAMBAHKAN: cara Anda membuat kebijakan privasi dan pengalaman mengisi formulir keamanan data. -->

## 6. Deklarasi lain di Play Console

Anda juga perlu mengisi:

- **Peringkat konten** lewat kuesioner,
- **target audiens**, termasuk apakah aplikasi ditujukan untuk anak-anak, yang memicu aturan tambahan,
- **deklarasi iklan** jika aplikasi menampilkan iklan,
- **negara distribusi** dan harga jika berbayar.

## 7. Pengujian sebelum rilis publik

Gunakan jalur pengujian yang disediakan:

- **Pengujian internal** untuk uji cepat oleh tim kecil.
- **Pengujian tertutup** untuk sekelompok penguji.
- **Pengujian terbuka** untuk jangkauan lebih luas sebelum rilis penuh.

Untuk akun pribadi baru, Google dapat mewajibkan pengujian tertutup dengan sejumlah penguji dalam jangka waktu tertentu sebelum Anda boleh merilis ke publik. Syaratnya bisa berubah, jadi baca ketentuan terbaru di pusat bantuan Play Console.

Uji aplikasi di beberapa ukuran layar dan versi Android, uji tanpa internet, dan uji alur penting seperti pendaftaran, pembayaran, dan izin.

## 8. Jika aplikasi memakai langganan atau pembelian

Produk langganan dan pembelian dalam aplikasi diatur di Play Console. Beberapa hal yang sering terlewat:

- Produk dan rencana dasar (*base plan*) harus berstatus **aktif**.
- Aplikasi harus sudah diunggah ke Play Console, dan versi yang diuji harus cocok dengan yang terdaftar.
- Gunakan akun **penguji lisensi** agar bisa menguji pembelian tanpa biaya sungguhan.

Jika tombol berlangganan menampilkan pesan bahwa produk belum aktif, periksa kembali tiga hal di atas sebelum mencari kesalahan di kode.

## 9. Setelah rilis

Peluncuran bukan akhir pekerjaan:

- pantau **Android vitals** untuk kegagalan (*crash*) dan aplikasi yang tidak merespons,
- baca dan jawab ulasan pengguna,
- rilis pembaruan secara bertahap (*staged rollout*) agar masalah terdeteksi sebelum menjangkau semua pengguna,
- ikuti perubahan kebijakan Google Play.

## Daftar periksa ringkas

- ☐ Akun Play Console terverifikasi
- ☐ AAB rilis sudah dibuat dan diuji
- ☐ `targetSdk` memenuhi persyaratan terbaru
- ☐ Keystore dan kata sandi dicadangkan dengan aman
- ☐ Halaman toko lengkap dengan ikon dan tangkapan layar
- ☐ Kebijakan privasi bisa diakses publik
- ☐ Formulir keamanan data dan peringkat konten terisi
- ☐ Pengujian internal atau tertutup selesai
- ☐ Produk langganan (jika ada) berstatus aktif dan sudah diuji
- ☐ Rencana pemantauan setelah rilis siap

## Kesimpulan

Rilis ke Google Play berjalan mulus jika Anda memperlakukannya seperti proyek tersendiri: siapkan akun dan paket dengan benar, lengkapi kebijakan dan formulir dengan jujur, uji sebelum merilis, lalu pantau setelah peluncuran. Mulailah dari daftar periksa di atas, dan jangan lupa membaca dokumentasi resmi karena aturannya terus diperbarui.

<!-- TAMBAHKAN: 1-2 kalimat pelajaran pribadi Anda dan tautan ke tulisan lain di blog ini, misalnya "Mengubah Web App Menjadi Aplikasi Android dengan WebView". -->
