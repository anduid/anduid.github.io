---
layout: post
title: "localStorage di Aplikasi Web: Kapan Aman, Kapan Tidak"
description: "Panduan memakai localStorage di aplikasi web: kapasitas, cara kerja, risiko keamanan dan kehilangan data, serta kapan harus pindah ke penyimpanan server."
date: 2026-10-17 00:30:00 +0700
tags: [javascript, web, keamanan, panduan]
apps: [kerapi]

# image: /assets/images/localstorage-aplikasi-web.png
# image_alt: Perbandingan penyimpanan di localStorage perangkat dan di server
---
<!-- CATATAN PENULIS (tidak tampil di situs): tulisan ini berangkat dari pelajaran nyata saat meninjau aplikasi web yang menyimpan datanya di localStorage. Tambahkan pengalaman Anda sendiri di bagian bertanda "TAMBAHKAN", dan jangan menyebut nama instansi, klien, atau data internal. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

`localStorage` adalah cara paling mudah menyimpan data di peramban: satu baris kode, tanpa server, dan datanya tetap ada setelah halaman ditutup. Karena semudah itu, banyak aplikasi web kecil memakainya untuk segalanya, termasuk data yang sebenarnya butuh penyimpanan terpusat. Hasilnya sering baru terasa setelah aplikasi dipakai orang sungguhan.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memakai atau menemukan aplikasi yang bergantung pada localStorage dan masalah yang muncul. -->

Tulisan ini menjelaskan cara kerja `localStorage`, kapan ia pilihan yang tepat, dan tanda-tanda sudah waktunya pindah ke penyimpanan di server.

<!--more-->

## Cara kerja dasar

`localStorage` menyimpan pasangan kunci dan nilai berupa teks di peramban, terikat pada satu *origin* (kombinasi protokol, domain, dan port):

```js
localStorage.setItem('tema', 'gelap');
const tema = localStorage.getItem('tema');
localStorage.removeItem('tema');
```

Untuk menyimpan objek, ubah menjadi JSON dulu dan jangan lupa menangani kegagalan:

```js
function simpan(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
    return true;
  } catch (e) {
    return false; // penyimpanan penuh atau diblokir
  }
}

function baca(kunci, cadangan) {
  try {
    const mentah = localStorage.getItem(kunci);
    return mentah === null ? cadangan : JSON.parse(mentah);
  } catch (e) {
    return cadangan; // data rusak atau tidak bisa diakses
  }
}
```

Data tetap tersimpan sampai pengguna menghapusnya atau kode Anda yang menghapus. Berbeda dengan `sessionStorage` yang hilang saat tab ditutup.

## Batas yang perlu diketahui

- **Kapasitas terbatas.** Umumnya sekitar 5 MB per origin, dan angkanya bisa berbeda antarperamban. Menyimpan foto dalam bentuk base64 cepat menghabiskannya.
- **Hanya teks.** Semua nilai disimpan sebagai string, jadi objek perlu `JSON.stringify` dan `JSON.parse`.
- **Sinkron.** Operasinya memblokir tampilan, jadi jangan menyimpan data yang sangat besar.
- **Terikat pada satu peramban di satu perangkat.** Data tidak ikut pindah ke perangkat atau peramban lain.
- **Bisa terhapus.** Pengguna bisa membersihkan data situs, dan peramban dapat menghapusnya dalam kondisi tertentu, misalnya mode privat atau penyimpanan perangkat penuh.

## Kapan localStorage tepat dipakai

`localStorage` cocok untuk data **kecil, pribadi bagi satu pengguna, dan tidak kritis**:

- pilihan tema, bahasa, atau tata letak,
- draf formulir yang belum dikirim,
- riwayat pencarian atau item terakhir dibuka,
- cache data publik agar halaman terasa cepat.

Pada semua kasus itu, kehilangan data hanya merepotkan dan tidak merugikan.

## Kapan localStorage tidak tepat

Jangan memakainya sebagai satu-satunya tempat menyimpan:

- **Data yang dipakai banyak orang atau banyak perangkat.** Misalnya daftar usaha, pendaftaran warga, atau data pelanggan. Setiap perangkat akan punya salinan berbeda, dan tidak ada "sumber kebenaran" bersama.
- **Data yang tidak boleh hilang.** Jika pengguna menghapus data situs atau berganti ponsel, semuanya lenyap tanpa cadangan.
- **Data yang butuh hak akses.** Pengaturan "siapa boleh mengubah apa" tidak bisa dijaga di penyimpanan yang bisa diubah pemiliknya sendiri.
- **Rahasia.** Kata sandi, token berumur panjang, dan kunci API tidak boleh disimpan di sini.

<!-- TAMBAHKAN: contoh nyata dampak dari data yang hanya ada di localStorage (tanpa menyebut nama pihak mana pun). -->

## Risiko keamanan yang sering terlewat

Semua yang ada di `localStorage` bisa dibaca oleh JavaScript yang berjalan di halaman. Artinya:

- **XSS membocorkan isinya.** Jika ada celah *cross-site scripting*, penyerang dapat membaca seluruh isi `localStorage`. Karena itu, jangan menyimpan token sensitif di sana, dan ikuti kebiasaan di [8 Kebiasaan Keamanan Aplikasi Web]({{ site.baseurl }}/blog/2026/10/10/delapan-kebiasaan-keamanan-aplikasi-web/).
- **Pemiliknya bisa mengubahnya.** Pengguna bisa membuka konsol dan menyunting nilai apa pun. Jangan pernah menganggap data di `localStorage` sebagai bukti, misalnya bahwa seseorang adalah admin atau sudah membayar.
- **Skrip pihak ketiga ikut membacanya.** Pustaka atau iklan yang Anda muat memiliki akses yang sama dengan kode Anda.

Aturan sederhananya: simpan di `localStorage` hanya hal yang tidak masalah jika dibaca atau diubah orang lain.

## Cadangan jika terpaksa

Kadang Anda memang memakai `localStorage` untuk data penting, misalnya sebagai tahap awal. Setidaknya sediakan jalan keluar:

```js
function unduhCadangan(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cadangan-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}
```

Tambahkan juga fitur pemulihan yang memvalidasi berkas sebelum menimpa data: periksa formatnya, buang entri tidak valid, dan minta konfirmasi. Cadangan ini jalan sementara, bukan pengganti penyimpanan terpusat.

## Tanda-tanda sudah waktunya pindah ke server

- Dua orang melihat data yang berbeda untuk hal yang seharusnya sama.
- Pengguna bertanya cara memindahkan data ke ponsel baru.
- Ada kebutuhan peran dan hak akses yang berbeda.
- Data mulai besar atau mendekati batas kapasitas.
- Anda butuh laporan gabungan dari banyak pengguna.

Jalur yang ringan untuk aplikasi kecil adalah Google Sheets dan Apps Script, seperti di [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/blog/2026/10/09/backend-gratis-google-apps-script-sheets/). Rancang tabelnya dengan baik lewat [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/blog/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/).

## Pola campuran yang sehat

Banyak aplikasi baik memakai keduanya: server sebagai sumber kebenaran, `localStorage` sebagai cache dan penyimpan preferensi. Aplikasi menampilkan data cache lebih dulu agar terasa cepat, lalu menyegarkannya dari server. Data yang belum sempat terkirim bisa disimpan sementara di `localStorage` sebagai antrean dan dikirim ulang saat koneksi pulih.

## Kesalahan yang sering terjadi

- **Tidak memakai `try/catch`.** Penyimpanan penuh atau diblokir membuat aplikasi berhenti.
- **Menyimpan foto base64 berukuran besar**, sehingga kapasitas cepat habis.
- **Menjadikannya sumber kebenaran** untuk data bersama.
- **Memercayai nilai di dalamnya** untuk keputusan keamanan.
- **Tidak ada cadangan** untuk data penting.
- **Tidak ada versi skema**, sehingga perubahan struktur data merusak data lama. Simpan nomor versi bersama data dan migrasikan saat diperlukan.

## Kesimpulan

`localStorage` adalah alat yang bagus untuk preferensi dan cache, tetapi bukan basis data. Pakai untuk data kecil dan tidak kritis, jangan simpan rahasia, jangan percaya isinya, dan sediakan cadangan jika terpaksa. Begitu data perlu dibagi atau tidak boleh hilang, pindahkan ke server.

Untuk aplikasi yang sudah berjalan lewat PWA, baca juga [Membuat PWA Sederhana]({{ site.baseurl }}/blog/2026/10/11/pwa-sederhana-web-app-dipasang-di-ponsel/).
