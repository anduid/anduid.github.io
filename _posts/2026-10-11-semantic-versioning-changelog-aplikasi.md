---
layout: post
title: "Semantic Versioning dan Changelog: Mengatur Versi Aplikasi dengan Rapi"
description: "Panduan semantic versioning dan changelog untuk aplikasi: arti MAJOR.MINOR.PATCH, hubungan dengan versionCode Android, cara menulis catatan rilis, dan kebiasaan yang baik."
date: 2026-10-11 02:15:00 +0700
tags: [versi, android, github, panduan]

# image: /assets/images/semantic-versioning.png
# image_alt: Skema penomoran versi MAJOR.MINOR.PATCH dan contoh changelog
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan pengalaman Anda mengelola versi di aplikasi Anda sendiri di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

"Versi berapa yang Anda pakai?" adalah pertanyaan yang sering muncul saat pengguna melapor masalah. Jika penomoran versi Anda berantakan, misalnya `final`, `final2`, `baru`, pertanyaan sederhana itu jadi sulit dijawab. Penomoran versi yang konsisten memudahkan pelacakan galat, komunikasi dengan pengguna, dan pengelolaan rilis.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda dengan penomoran versi yang berantakan atau yang membantu di proyek nyata. -->

Tulisan ini membahas Semantic Versioning, hubungannya dengan Android, cara menulis changelog, dan kebiasaan yang membuat rilis lebih tertata.

<!--more-->

## Apa itu Semantic Versioning

Semantic Versioning (SemVer) memakai tiga angka dipisah titik: **MAJOR.MINOR.PATCH**, misalnya `2.4.1`. Setiap angka punya arti:

| Angka | Naik jika | Contoh |
|-------|-----------|--------|
| **MAJOR** | Ada perubahan besar yang tidak kompatibel dengan versi lama | `1.9.3` menjadi `2.0.0` |
| **MINOR** | Ada fitur baru yang kompatibel | `2.3.0` menjadi `2.4.0` |
| **PATCH** | Ada perbaikan galat yang kompatibel | `2.4.0` menjadi `2.4.1` |

Saat MAJOR naik, MINOR dan PATCH kembali ke nol. Saat MINOR naik, PATCH kembali ke nol. Spesifikasi lengkapnya tersedia di situs semver.org.

## Menerapkannya pada aplikasi

SemVer awalnya dirancang untuk pustaka, tetapi pola pikirnya berguna untuk aplikasi juga. Anda bisa menafsirkannya begini:

- **PATCH**: perbaikan galat, penyesuaian teks, atau peningkatan kecil.
- **MINOR**: fitur baru atau perbaikan yang terlihat oleh pengguna.
- **MAJOR**: perubahan besar pada alur, desain ulang menyeluruh, atau perubahan yang mengubah cara data disimpan.

Untuk aplikasi yang menyimpan data lokal, ingat bahwa perubahan skema database yang tidak kompatibel membutuhkan migrasi, seperti dibahas di [Room Database di Android: Panduan Pemula dengan Kotlin]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).

## Versi pra-rilis

Anda bisa menambahkan label untuk versi yang belum final:

- `1.0.0-alpha.1`: uji internal awal
- `1.0.0-beta.2`: uji lebih luas
- `1.0.0-rc.1`: calon rilis

Label ini memudahkan membedakan versi uji dari versi stabil.

## versionName dan versionCode di Android

Android memakai dua nilai di `build.gradle`:

```kotlin
android {
    defaultConfig {
        versionCode = 12
        versionName = "1.3.2"
    }
}
```

- **`versionName`** adalah teks yang dilihat pengguna. Gunakan format SemVer, misalnya `1.3.2`.
- **`versionCode`** adalah bilangan bulat yang **harus naik** setiap kali Anda mengunggah versi baru ke Google Play. Pengguna tidak melihatnya, tetapi Play memakainya untuk menentukan versi mana yang lebih baru.

Satu cara mengaitkan keduanya adalah menghitung `versionCode` dari `versionName`:

```kotlin
val major = 1
val minor = 3
val patch = 2
val kodeVersi = major * 10000 + minor * 100 + patch // 10302
```

Dengan rumus ini, `1.3.2` menjadi `10302`, dan urutannya selalu naik saat versi naik. Cara ini praktis, tetapi pastikan batasnya cukup (misalnya MINOR dan PATCH di bawah 100) dan Anda konsisten. Persiapan rilis ke toko dibahas di [Daftar Periksa Rilis Aplikasi Android ke Google Play]({{ site.baseurl }}/2026/10/09/daftar-periksa-rilis-aplikasi-android-google-play/).

<!-- TAMBAHKAN: cara Anda menetapkan versionCode dan versionName di aplikasi Anda, dan kesalahan yang pernah terjadi. -->

## Menandai versi di Git

Tandai setiap rilis dengan *tag* di Git agar mudah dilacak:

```bash
git tag -a v1.3.2 -m "Rilis 1.3.2"
git push origin v1.3.2
```

Tag menunjuk ke commit tepat pada saat rilis. Jika ada laporan galat dari versi `1.3.2`, Anda bisa langsung membuka kode yang persis sama. Dasar-dasar Git dibahas di [Git dan GitHub untuk Pemula]({{ site.baseurl }}/2026/10/10/git-github-dasar-untuk-pemula/).

## Menulis changelog

Changelog adalah catatan perubahan per versi, ditulis untuk manusia. Format yang umum dan mudah dibaca mengelompokkan perubahan:

```markdown
# Riwayat Perubahan

## [1.3.2] - 2026-10-11
### Diperbaiki
- Memperbaiki aplikasi berhenti saat membuka daftar kosong.

## [1.3.0] - 2026-10-01
### Ditambahkan
- Pilihan tema terang, gelap, dan ikut sistem.
### Diubah
- Tampilan daftar catatan lebih ringkas.
```

Kelompok yang lazim dipakai: **Ditambahkan**, **Diubah**, **Diperbaiki**, **Dihapus**, dan **Keamanan**. Panduan format yang dikenal luas tersedia di keepachangelog.com.

## Catatan rilis untuk pengguna

Teks yang tampil di Google Play ("Yang baru") berbeda dari changelog teknis. Tulis singkat, jelas, dan dari sudut pandang pengguna:

- Hindari istilah teknis seperti "refactor" atau nama kelas.
- Sebutkan manfaatnya: "Sekarang bisa memilih tema gelap."
- Jujur tentang perbaikan: "Memperbaiki aplikasi yang berhenti saat membuka daftar kosong."

## Kebiasaan yang membuat rilis tertata

- **Satu sumber kebenaran.** Simpan nomor versi di satu tempat dan turunkan nilai lain darinya.
- **Naikkan versi setiap rilis**, sekecil apa pun.
- **Perbarui changelog bersamaan dengan perubahan kode**, bukan di akhir saat sudah lupa.
- **Tag setiap rilis** di Git.
- **Jangan menggunakan ulang nomor versi.** Jika rilis bermasalah, buat versi baru.
- **Tampilkan versi di dalam aplikasi**, misalnya di halaman Tentang, agar pengguna bisa menyebutkannya saat melapor.

## Kesalahan yang sering terjadi

- **Lupa menaikkan `versionCode`**, sehingga Play menolak unggahan.
- **Nomor versi tidak konsisten** antara kode, Git, dan toko.
- **Changelog tidak pernah diperbarui.**
- **Menaikkan MAJOR tanpa alasan**, atau tidak pernah menaikkannya padahal ada perubahan besar.
- **Catatan rilis yang terlalu teknis** untuk pengguna biasa.

## Kesimpulan

Penomoran versi yang rapi sebenarnya sederhana: pakai MAJOR.MINOR.PATCH, hubungkan dengan `versionName` dan `versionCode`, tag setiap rilis di Git, dan tulis changelog serta catatan rilis yang jelas. Kebiasaan kecil ini menghemat banyak waktu saat melacak galat dan berkomunikasi dengan pengguna.
