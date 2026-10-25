---
layout: post
title: "Git dan GitHub untuk Pemula: Dari Commit sampai Pull Request"
description: "Panduan dasar Git dan GitHub untuk pemula: instalasi, commit, branch, merge, push, pull request, mengatasi konflik, dan kebiasaan yang menjaga riwayat tetap rapi."
date: 2026-10-10 02:00:00 +0700
tags: [git, github, tutorial]

# image: /assets/images/git-github-pemula.png
# image_alt: Alur kerja Git dari commit ke branch lalu pull request di GitHub
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji setiap perintah di komputer Anda dan tambahkan pengalaman Anda memakai Git (kesalahan yang pernah terjadi dan cara memulihkannya) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Jika Anda pernah menyimpan file dengan nama `laporan_final`, `laporan_final2`, dan `laporan_final_BENAR`, Anda sudah merasakan masalah yang diselesaikan oleh Git. Git adalah sistem kontrol versi: ia mencatat setiap perubahan pada proyek Anda sehingga Anda bisa kembali ke versi sebelumnya, bekerja paralel, dan melihat siapa mengubah apa.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda mulai memakai Git atau GitHub dan manfaat pertama yang Anda rasakan. -->

GitHub adalah layanan yang menyimpan repositori Git di internet, plus alat untuk berkolaborasi dan menghosting situs. Tulisan ini membahas alur kerja dasar yang cukup untuk memulai.

<!--more-->

## Konsep dasar

- **Repositori (repo)**: folder proyek beserta seluruh riwayat perubahannya.
- **Commit**: satu titik simpan berisi perubahan dan pesan penjelasan.
- **Branch**: cabang kerja terpisah dari jalur utama.
- **Merge**: menggabungkan perubahan dari satu branch ke branch lain.
- **Remote**: salinan repo di server, misalnya GitHub, biasanya bernama `origin`.

## Persiapan awal

Pasang Git dari situs resminya, lalu atur identitas Anda sekali saja:

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@contoh.com"
```

Buat akun GitHub, lalu siapkan cara masuk yang aman, misalnya kunci SSH atau token akses, sesuai [dokumentasi GitHub](https://docs.github.com/authentication). Jangan membagikan token Anda kepada siapa pun.

## Membuat repo dan commit pertama

Di folder proyek Anda:

```bash
git init
git add .
git commit -m "Commit pertama: struktur awal proyek"
```

- `git init` membuat repo baru di folder itu.
- `git add .` menandai semua perubahan untuk disimpan. Anda bisa memilih file tertentu, misalnya `git add index.html`.
- `git commit` menyimpan perubahan yang sudah ditandai dengan sebuah pesan.

Periksa keadaan kapan saja dengan:

```bash
git status
git log --oneline
```

`git status` menunjukkan file yang berubah, dan `git log --oneline` menampilkan riwayat commit secara ringkas.

## Menghubungkan ke GitHub

Buat repo kosong di GitHub, lalu hubungkan dan unggah:

```bash
git remote add origin https://github.com/username/nama-repo.git
git branch -M main
git push -u origin main
```

`git push` mengirim commit ke GitHub. Setelah tersambung, cukup `git push` untuk pengiriman berikutnya. Untuk mengambil perubahan dari GitHub gunakan `git pull`.

Jika repo sudah ada di GitHub dan Anda ingin menyalinnya ke komputer, gunakan `git clone`:

```bash
git clone https://github.com/username/nama-repo.git
```

## Menulis pesan commit yang baik

Pesan commit adalah catatan untuk diri Anda di masa depan dan untuk rekan kerja. Pegangan sederhana:

- Awali dengan kata kerja yang jelas: "Tambah", "Perbaiki", "Ubah".
- Jelaskan **apa** dan **kenapa**, bukan hanya "update".
- Satu commit untuk satu perubahan yang utuh.

Contoh kurang baik: `update`. Contoh lebih baik: `Perbaiki paginate_path agar beranda menampilkan tulisan`.

## Bekerja dengan branch

Branch membuat Anda bisa mencoba fitur tanpa mengganggu versi yang stabil:

```bash
git switch -c fitur-pencarian
# ... ubah file, lalu:
git add .
git commit -m "Tambah halaman pencarian"
git push -u origin fitur-pencarian
```

Setelah fitur selesai, gabungkan ke `main`. Cara yang umum adalah lewat *pull request* di GitHub, tempat perubahan bisa ditinjau sebelum digabung. Setelah digabung, perbarui `main` di komputer Anda:

```bash
git switch main
git pull
```

## Pull request

Pull request (PR) adalah permintaan untuk menggabungkan branch Anda ke branch tujuan. Langkah dasarnya:

1. Dorong branch ke GitHub.
2. Di GitHub, klik **Compare & pull request**.
3. Tulis judul dan deskripsi yang menjelaskan perubahan.
4. Minta tinjauan jika bekerja dengan orang lain.
5. Setelah disetujui, klik **Merge pull request**.

Meski bekerja sendiri, PR berguna sebagai catatan perubahan dan memberi kesempatan memeriksa sebelum menggabung.

<!-- TAMBAHKAN: alur kerja Git yang Anda pakai di proyek sendiri (langsung ke main atau lewat branch). -->

## Mengatasi konflik merge

Konflik terjadi jika dua perubahan menyentuh baris yang sama dan Git tidak tahu mana yang dipakai. File yang bermasalah akan berisi penanda seperti ini:

```text
<<<<<<< HEAD
versi dari branch Anda
=======
versi dari branch lain
>>>>>>> fitur-pencarian
```

Cara mengatasinya:

1. Buka file itu dan putuskan isi akhir yang benar.
2. Hapus semua penanda `<<<<<<<`, `=======`, dan `>>>>>>>`.
3. Jalankan `git add` pada file tersebut, lalu `git commit`.

Jangan panik. Konflik adalah hal biasa, dan Git tidak kehilangan data Anda.

## File yang jangan di-commit

Buat berkas `.gitignore` untuk daftar yang tidak boleh masuk repo:

```text
node_modules/
.env
*.keystore
local.properties
_site/
```

Jangan pernah meng-commit kunci API, kata sandi, atau keystore ke repo, terutama repo publik. Jika terlanjur, anggap rahasia itu bocor dan ganti. Penjelasan lebih lengkap ada di [Mengamankan API Key AI di Aplikasi Web dan Android]({{ site.baseurl }}/2026/10/09/mengamankan-api-key-ai-di-aplikasi/).

## Membatalkan dan memulihkan

Beberapa perintah penyelamat yang aman untuk pemula:

```bash
git restore nama-file        # buang perubahan yang belum di-commit pada satu file
git restore --staged file    # batalkan penandaan git add
git revert ID_COMMIT         # buat commit baru yang membatalkan commit lama
```

Hati-hati dengan perintah yang menulis ulang riwayat, seperti `git reset --hard` dan `git push --force`. Keduanya bisa menghapus pekerjaan, jadi pelajari dulu sebelum memakainya.

## Kebiasaan yang menjaga riwayat tetap rapi

- Commit sering dengan perubahan kecil dan bermakna.
- Tarik perubahan terbaru (`git pull`) sebelum mulai bekerja.
- Gunakan branch untuk fitur atau perbaikan.
- Jangan commit file besar atau hasil build.
- Tulis pesan commit yang bisa dipahami orang lain.

## Kesimpulan

Git terasa rumit di awal, tetapi alur dasarnya sederhana: `add`, `commit`, `push`, ditambah branch dan pull request saat bekerja lebih serius. Kuasai alur itu, biasakan `.gitignore` dan pesan commit yang jelas, dan Anda sudah menghindari sebagian besar masalah umum. Git juga menjadi dasar untuk menghosting situs di GitHub Pages, seperti di [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/).
