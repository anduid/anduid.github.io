---
layout: post
title: "Chatbot FAQ Sederhana dengan Google Apps Script dan Sheets"
description: "Cara membuat chatbot FAQ sederhana berbasis kata kunci dengan Google Sheets dan Apps Script: tabel pertanyaan, pencocokan jawaban, halaman obrolan, dan perbaikan berkelanjutan."
date: 2026-10-11 01:00:00 +0700
tags: [google-apps-script, google-sheets, chatbot, tutorial]

# image: /assets/images/chatbot-faq-sheets.png
# image_alt: Halaman obrolan FAQ yang membaca jawaban dari Google Sheets
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di akun Anda dan jangan memakai data layanan atau warga asli di contoh. Tambahkan pengalaman Anda (pertanyaan yang paling sering diajukan, hasil uji ke pengguna) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Banyak kantor, komunitas, dan usaha kecil menjawab pertanyaan yang sama berulang kali: jam layanan, syarat pengajuan, alamat, atau cara mendaftar. Chatbot FAQ bisa menjawab pertanyaan rutin itu sepanjang waktu. Dan Anda tidak butuh kecerdasan buatan yang rumit: pencocokan kata kunci sederhana sudah cukup untuk banyak kasus.

<!-- TAMBAHKAN (1-2 kalimat): kebutuhan nyata yang membuat Anda tertarik membuat FAQ otomatis, misalnya pertanyaan yang berulang di lapangan. -->

Tulisan ini membangun chatbot FAQ dengan Google Sheets sebagai bank jawaban, Apps Script sebagai mesin pencocok, dan satu halaman web sebagai antarmuka. Siapa pun yang bisa mengedit spreadsheet dapat memperbarui jawabannya tanpa menyentuh kode.

<!--more-->

## Cara kerja

1. Pengguna mengetik pertanyaan di halaman web.
2. Halaman mengirimkannya ke Apps Script.
3. Skrip mencocokkan kata dalam pertanyaan dengan **kata kunci** di tabel FAQ.
4. Jawaban dengan kecocokan terbanyak dikirim kembali.
5. Jika tidak ada yang cocok, pertanyaan dicatat agar Anda bisa menambah jawabannya nanti.

## Langkah 1: menyiapkan tabel FAQ

Buat spreadsheet dengan sheet `FAQ` berkolom:

| Kolom | Isi |
|-------|-----|
| `id` | Nomor unik |
| `pertanyaan` | Pertanyaan baku, untuk referensi |
| `kata_kunci` | Kata kunci dipisah koma |
| `jawaban` | Teks jawaban |
| `aktif` | `TRUE` atau `FALSE` |

Contoh baris (data karangan):

| pertanyaan | kata_kunci | jawaban |
|------------|-----------|---------|
| Jam layanan | jam, buka, layanan, tutup | Layanan buka Senin sampai Jumat pukul 08.00-15.00. |
| Syarat pendaftaran | syarat, daftar, pendaftaran | Siapkan fotokopi identitas dan formulir yang sudah diisi. |

Buat juga sheet kedua bernama `BelumTerjawab` dengan kolom `waktu` dan `pertanyaan`. Prinsip penataan tabel yang baik dibahas di [Merancang Tabel Google Sheets untuk Aplikasi Web]({{ site.baseurl }}/2026/10/09/merancang-tabel-google-sheets-untuk-aplikasi/).

<!-- TAMBAHKAN: contoh pertanyaan umum yang Anda temui di lapangan (tanpa data pribadi) beserta kata kuncinya. -->

## Langkah 2: mesin pencocok di Apps Script

Buka **Ekstensi > Apps Script** dan tempel kode berikut:

```js
function doGet(e) {
  const tanya = String((e.parameter && e.parameter.q) || '').slice(0, 200);
  if (!tanya.trim()) return json_({ ok: false, jawaban: 'Silakan ketik pertanyaan Anda.' });
  return json_({ ok: true, jawaban: cariJawaban_(tanya) });
}

function normalisasi_(teks) {
  return String(teks).toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function cariJawaban_(tanya) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('FAQ');
  const nilai = sheet.getDataRange().getValues();
  const header = nilai.shift();
  const iKunci = header.indexOf('kata_kunci');
  const iJawab = header.indexOf('jawaban');
  const iAktif = header.indexOf('aktif');

  const teks = ' ' + normalisasi_(tanya).replace(/\s+/g, ' ') + ' ';
  let terbaik = null;
  let skorTerbaik = 0;

  nilai.forEach(function (baris) {
    if (String(baris[iAktif]).toUpperCase() === 'FALSE') return;
    const kunci = String(baris[iKunci]).split(',');
    let skor = 0;
    kunci.forEach(function (k) {
      const kata = normalisasi_(k).trim();
      if (kata && teks.indexOf(' ' + kata + ' ') !== -1) skor++;
    });
    if (skor > skorTerbaik) {
      skorTerbaik = skor;
      terbaik = baris[iJawab];
    }
  });

  if (terbaik) return terbaik;

  SpreadsheetApp.getActive().getSheetByName('BelumTerjawab')
    .appendRow([new Date(), tanya.slice(0, 200)]);
  return 'Maaf, saya belum menemukan jawabannya. Pertanyaan Anda sudah dicatat, silakan hubungi petugas kami.';
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Cara kerjanya: setiap baris FAQ diberi skor sesuai jumlah kata kunci yang muncul sebagai kata utuh dalam pertanyaan, dan baris dengan skor tertinggi menjadi jawabannya. Pertanyaan yang tidak cocok sama sekali dicatat di `BelumTerjawab`. Deploy sebagai web app (lihat [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/)) dan salin URL berakhiran `/exec`.

Satu catatan keamanan: skrip ini membaca teks dari pengguna dan menuliskannya ke Sheets. Panjangnya dibatasi, dan jika Anda khawatir tentang rumus yang disisipkan, awali teks dengan tanda petik seperti pada contoh [Membuat Aplikasi Catatan Keuangan Sederhana]({{ site.baseurl }}/2026/10/10/aplikasi-catatan-keuangan-google-sheets-html/).

## Langkah 3: halaman obrolan

Buat halaman HTML sederhana. Jawaban dimasukkan dengan `textContent` supaya aman dari penyisipan HTML:

```html
<div id="percakapan" aria-live="polite"></div>
<form id="form">
  <label for="tanya">Pertanyaan Anda</label>
  <input id="tanya" autocomplete="off" required>
  <button type="submit">Kirim</button>
</form>

<script>
  const API = 'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec';
  const kotak = document.getElementById('percakapan');

  function tambah(peran, teks) {
    const p = document.createElement('p');
    p.textContent = peran + ': ' + teks;
    kotak.appendChild(p);
  }

  document.getElementById('form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const input = document.getElementById('tanya');
    const tanya = input.value.trim();
    if (!tanya) return;
    tambah('Anda', tanya);
    input.value = '';
    try {
      const res = await fetch(API + '?q=' + encodeURIComponent(tanya));
      const hasil = await res.json();
      tambah('Asisten', hasil.jawaban);
    } catch (err) {
      tambah('Asisten', 'Maaf, layanan sedang bermasalah. Coba lagi nanti.');
    }
  });
</script>
```

Atribut `aria-live` membuat pembaca layar mengumumkan jawaban baru. Beberapa kebiasaan baik untuk antarmuka seperti ini dibahas di [Aksesibilitas Web: 10 Perbaikan Cepat]({{ site.baseurl }}/2026/10/11/aksesibilitas-web-sepuluh-perbaikan-cepat/).

## Memperbaiki chatbot dari waktu ke waktu

Kekuatan pendekatan ini ada pada perawatannya yang mudah:

- **Tinjau `BelumTerjawab` secara rutin.** Pertanyaan di sana menunjukkan apa yang pengguna cari. Tambahkan jawaban baru atau perluas kata kunci.
- **Tambahkan sinonim.** Orang menulis "buka", "operasional", dan "jam" untuk hal yang sama. Masukkan semuanya sebagai kata kunci.
- **Pecah jawaban yang terlalu panjang** menjadi beberapa baris FAQ.
- **Catat jawaban yang sering salah** dan perbaiki kata kuncinya.
- **Perbarui jawaban** saat aturan atau jadwal berubah, dan nonaktifkan baris yang sudah usang dengan `aktif = FALSE`.

## Batasan yang perlu diakui

Ini pencocokan kata kunci, bukan pemahaman bahasa. Ia tidak mengerti konteks, salah ketik, atau kalimat yang rumit. Untuk pertanyaan yang sangat beragam, Anda bisa menambahkan AI, tetapi itu membawa pertimbangan biaya, akurasi, dan keamanan kunci, seperti dibahas di [Mengamankan API Key AI di Aplikasi Web dan Android]({{ site.baseurl }}/2026/10/09/mengamankan-api-key-ai-di-aplikasi/).

Beberapa batasan lain:

- Jangan menyimpan data pribadi di FAQ atau meminta pengguna mengetik data sensitif.
- Selalu sediakan jalur ke petugas manusia untuk hal penting atau mendesak.
- Jangan memberi jawaban yang bersifat hukum, medis, atau keuangan tanpa verifikasi pihak berwenang.

## Kesimpulan

Chatbot FAQ berbasis kata kunci adalah cara murah dan cepat untuk mengurangi pertanyaan berulang. Tabel FAQ yang rapi, mesin pencocok yang sederhana, dan kebiasaan meninjau pertanyaan yang belum terjawab sudah cukup untuk memberi manfaat nyata. Mulailah dari sepuluh pertanyaan paling sering, ukur hasilnya, lalu perluas sedikit demi sedikit.
