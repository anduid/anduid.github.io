---
layout: post
title: "Git Branching dalam Praktik: Feature Branch, Rebase vs Merge, dan Cara Memulihkan Kesalahan"
description: "Alur kerja Git untuk tim kecil: feature branch, perbedaan rebase dan merge dengan contoh riwayat, merge --no-ff, revert, stash, reflog untuk memulihkan, dan kebiasaan commit yang bersih."
date: 2026-10-28 01:30:00 +0700
tags: [git, github, alur-kerja, pemrograman]

# image: /assets/images/git-branching-alur-kerja.png
# image_alt: Diagram cabang fitur digabung ke main dengan merge dan rebase
---
<!-- CATATAN PENULIS (tidak tampil di situs): coba semua perintah di repositori latihan (bukan repositori proyek penting), lalu tambahkan pengalaman Anda memakai Git di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Setelah menguasai `add`, `commit`, dan `push`, pertanyaan berikutnya muncul: bagaimana bekerja pada beberapa hal sekaligus tanpa saling merusak? Jawabannya adalah **branch**, dan alur kerja yang rapi di sekitarnya. Dengan kebiasaan yang tepat, Anda bisa mengembangkan fitur, memperbaiki bug darurat, dan tetap menjaga versi utama selalu stabil.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda dengan konflik atau kesalahan Git dan pelajaran yang diambil. -->

Tulisan ini melanjutkan [Git dan GitHub untuk Pemula]({{ site.baseurl }}/2026/10/10/git-github-dasar-untuk-pemula/) dengan fokus pada alur kerja: feature branch, memilih antara merge dan rebase, serta cara memulihkan diri dari kesalahan. Semua perintah di bawah sudah saya jalankan di repositori percobaan.

<!--more-->

## Prinsip: `main` harus selalu bisa jalan

Aturan sederhana yang menyelamatkan banyak masalah: cabang `main` hanya berisi kode yang sudah bisa dijalankan. Semua pekerjaan baru dilakukan di cabang terpisah, lalu digabung setelah selesai dan diperiksa. Pada GitHub, Anda bisa mengaktifkan perlindungan cabang agar `main` hanya menerima perubahan lewat *pull request*.

## Alur feature branch

```bash
git switch main
git pull                          # ambil perubahan terbaru
git switch -c fitur/cari          # buat dan pindah ke cabang baru

# ... bekerja, lalu simpan dalam commit kecil
git add .
git commit -m "Tambah pencarian"
git push -u origin fitur/cari     # unggah cabang, lalu buka pull request
```

Beberapa kebiasaan baik:

- **Satu cabang untuk satu tujuan.** Jangan mencampur perbaikan bug dengan fitur baru.
- **Beri nama yang bermakna:** `fitur/cari`, `perbaikan/login`, `dokumentasi/readme`.
- **Cabang berumur pendek.** Semakin lama sebuah cabang hidup, semakin besar peluang konflik.
- **Sering ambil perubahan terbaru** dari `main` ke cabang Anda.

## Merge dan rebase: dua cara menggabungkan

Bayangkan `main` sudah maju satu commit ("Perbaiki bug login") saat Anda mengerjakan `fitur/cari`. Ada dua cara menyatukannya.

### Merge

Merge membuat satu **commit penggabungan** yang menyatukan dua riwayat. Riwayat asli tetap utuh:

```bash
git switch main
git merge --no-ff fitur/cari -m "Gabung fitur/cari"
```

Hasilnya (diuji pada repositori percobaan):

```text
*   978c7ec Gabung fitur/cari
|\
| * d405624 Tambah pencarian
|/
* f849e38 Perbaiki bug login
* cb4d345 awal
```

Opsi `--no-ff` memaksa dibuatnya commit penggabungan walau secara teknis bisa "maju lurus", sehingga jejak adanya cabang fitur tetap terlihat.

### Rebase

Rebase **memindahkan** commit cabang Anda agar seolah-olah dimulai dari ujung `main` yang terbaru, sehingga riwayat menjadi lurus:

```bash
git switch fitur/cari
git rebase main
```

Riwayatnya menjadi:

```text
* d405624 Tambah pencarian
* f849e38 Perbaiki bug login
* cb4d345 awal
```

Perhatikan commit "Tambah pencarian" kini berada di atas "Perbaiki bug login". Rebase membuat commit baru dengan ID baru, tetapi isi perubahannya sama.

### Kapan memakai yang mana

| Situasi | Pilihan |
|---------|---------|
| Menyegarkan cabang fitur pribadi dengan `main` terbaru | Rebase (riwayat bersih) |
| Menggabungkan fitur selesai ke `main` | Merge (jejak jelas) atau opsi "squash" di pull request |
| Cabang sudah dibagikan dan dipakai orang lain | Merge, hindari rebase |

**Aturan emas:** jangan merebase cabang yang sudah dibagikan dan dipakai orang lain, karena rebase menulis ulang riwayat dan bisa merusak pekerjaan mereka. Rebase aman untuk cabang yang hanya Anda pakai.

<!-- TAMBAHKAN: preferensi merge atau rebase di tim atau proyek Anda dan alasannya. -->

## Mengatasi konflik

Saat Git tidak bisa menggabungkan otomatis, ia menandai file yang bermasalah. Buka file, tentukan isi akhir yang benar, hapus penanda `<<<<<<<`, `=======`, dan `>>>>>>>`, lalu lanjutkan:

```bash
git add nama-file
git merge --continue         # atau: git rebase --continue
```

Jika bingung dan ingin membatalkan:

```bash
git merge --abort            # atau: git rebase --abort
```

Konflik adalah hal biasa dan bukan tanda Anda berbuat salah.

## Menyimpan pekerjaan sementara dengan stash

Perlu pindah cabang mendadak padahal perubahan belum siap di-commit?

```bash
git stash                    # simpan perubahan, bersihkan folder kerja
git switch main
# ... kerjakan hal mendesak, lalu kembali
git switch fitur/cari
git stash pop                # kembalikan perubahan yang tersimpan
```

## Membatalkan dengan aman: revert

`git revert` membuat **commit baru** yang membatalkan commit lama, tanpa menulis ulang riwayat. Aman untuk cabang yang sudah dibagikan:

```bash
git revert HEAD              # batalkan commit terakhir
```

Hasilnya riwayat bertambah satu commit "Revert ...". Berbeda dengan `git reset --hard`, yang membuang commit dan perubahan secara permanen di cabang lokal. Gunakan `reset` hanya untuk pekerjaan lokal yang belum dibagikan, dan hati-hati.

## Menyelamatkan yang "hilang": reflog

Merasa sudah menghapus commit atau cabang secara tidak sengaja? Git menyimpan catatan pergerakan `HEAD` Anda:

```bash
git reflog                   # daftar posisi HEAD sebelumnya
git switch -c pulih ID_COMMIT   # buat cabang baru dari commit yang hilang
```

Selama belum dibersihkan, commit yang tampak hilang biasanya masih bisa dipulihkan lewat reflog. Fitur ini hanya ada di salinan lokal Anda.

## Menulis commit yang bersih

Riwayat yang rapi memudahkan pencarian masalah di kemudian hari:

- **Satu commit, satu perubahan logis.**
- **Pesan dimulai dengan kata kerja** dan menjelaskan apa serta kenapa: "Perbaiki paginate_path agar beranda menampilkan tulisan".
- **Jangan meng-commit berkas hasil build, rahasia, atau data pribadi.** Pakai `.gitignore`, dan lihat [Mengamankan API Key AI di Aplikasi Web dan Android]({{ site.baseurl }}/2026/10/09/mengamankan-api-key-ai-di-aplikasi/) jika kunci pernah ikut ter-commit.
- **Gunakan `git status` dan `git diff`** sebelum setiap commit untuk memastikan hanya perubahan yang Anda maksud yang masuk.

## Menandai rilis

Beri tag pada commit yang menjadi rilis, seperti dibahas di [Semantic Versioning dan Changelog]({{ site.baseurl }}/2026/10/11/semantic-versioning-changelog-aplikasi/):

```bash
git tag -a v1.3.2 -m "Rilis 1.3.2"
git push origin v1.3.2
```

## Kesalahan yang sering terjadi

- **Mengerjakan semuanya langsung di `main`.**
- **Cabang yang hidup berminggu-minggu** sehingga konfliknya menumpuk.
- **Merebase cabang bersama.**
- **`git push --force` ke cabang bersama.** Jika terpaksa, pakai `--force-with-lease` dan beri tahu tim.
- **Commit besar campur aduk** yang sulit ditinjau.
- **Takut pada konflik** dan menghindari penggabungan.
- **Tidak mencoba perintah baru di repositori latihan** sebelum dipakai di proyek penting.

## Kesimpulan

Alur feature branch menjaga `main` tetap stabil: cabang kecil dan berumur pendek, commit yang bersih, pull request untuk tinjauan, merge atau rebase sesuai situasi, `revert` untuk membatalkan dengan aman, dan `reflog` sebagai jaring pengaman. Latih semuanya di repositori percobaan, dan Git akan berubah dari sumber kecemasan menjadi alat yang membuat Anda lebih berani bereksperimen.
