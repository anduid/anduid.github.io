---
layout: post
title: "CORS Dasar: Mengapa Fetch Diblokir Browser dan Cara Memperbaikinya dengan Benar"
description: "Memahami CORS: same-origin policy, header Access-Control-Allow-Origin, preflight OPTIONS, contoh server Node.js yang sudah diuji, dan kesalahan umum seperti wildcard."
date: 2026-10-26 03:30:00 +0700
tags: [cors, http, javascript, keamanan, tutorial]

# image: /assets/images/cors-dasar.png
# image_alt: Diagram browser meminta data dari server lain dan server membalas dengan header izin
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan contoh server di komputer Anda dan coba panggil dari halaman berasal berbeda, lalu tambahkan pengalaman Anda menghadapi galat CORS di bagian bertanda "TAMBAHKAN". Gunakan alamat contoh, bukan alamat API produksi. -->

Hampir setiap pemula yang membuat aplikasi web pernah melihat pesan merah ini di konsol browser: *"has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present"*. Kodenya terlihat benar, alamat API-nya benar, dan di Postman semuanya berjalan lancar. Lalu kenapa browser menolak?

<!-- TAMBAHKAN (1-2 kalimat): kapan terakhir kali Anda terkena galat CORS dan butuh berapa lama untuk memahaminya. -->

Tulisan ini menjelaskan apa itu CORS, mengapa ia ada, bagaimana cara kerjanya, dan cara memperbaikinya di sisi yang tepat. Contoh server di bawah sudah diuji dengan Node.js dan `curl`.

<!--more-->

## Mulai dari same-origin policy

Browser menerapkan aturan keamanan bernama **same-origin policy**: skrip dari satu *origin* tidak boleh membaca respons dari origin lain begitu saja. Sebuah origin terdiri dari tiga bagian: **skema, host, dan port**.

| Halaman | Alamat yang dipanggil | Origin sama? |
|---|---|---|
| `https://andu.my.id` | `https://andu.my.id/data` | Ya |
| `https://andu.my.id` | `http://andu.my.id/data` | Tidak (skema beda) |
| `https://andu.my.id` | `https://api.andu.my.id/data` | Tidak (host beda) |
| `http://localhost:3000` | `http://localhost:4000/data` | Tidak (port beda) |

Tanpa aturan ini, halaman jahat yang Anda buka di tab sebelah bisa membaca data akun Anda dari situs lain yang sedang login. **CORS** (*Cross-Origin Resource Sharing*) adalah mekanisme resmi agar server **mengizinkan** origin tertentu membaca responsnya.

## Dua fakta yang mengubah cara berpikir

1. **CORS diterapkan oleh browser, bukan oleh server.** Server hanya mengirim header yang menyatakan siapa yang diizinkan. Browserlah yang menolak menyerahkan respons ke skrip Anda. Itu sebabnya `curl`, Postman, dan kode server-ke-server tidak pernah terkena CORS.
2. **Galat CORS tidak berarti permintaan gagal sampai ke server.** Pada banyak kasus permintaan sudah diterima dan diproses server. Yang diblokir adalah akses skrip Anda ke jawabannya.

Karena itu, memperbaiki CORS dilakukan di **server** yang menyediakan data, bukan di kode `fetch` Anda.

## Alur dasar

Saat halaman di `https://andu.my.id` memanggil API di origin lain, browser menambahkan header `Origin` otomatis. Server membalas dengan header izin:

```text
Permintaan:  GET /data
             Origin: https://andu.my.id

Balasan:     200 OK
             Access-Control-Allow-Origin: https://andu.my.id
```

Jika nilai `Access-Control-Allow-Origin` cocok dengan origin halaman (atau berupa `*`), browser menyerahkan respons ke skrip. Jika header itu tidak ada atau tidak cocok, browser memblokirnya dan memunculkan galat di konsol.

## Preflight: permintaan OPTIONS yang muncul sendiri

Tidak semua permintaan langsung dikirim. Untuk permintaan yang dianggap berisiko, browser lebih dulu mengirim **preflight**, yaitu permintaan `OPTIONS` berisi pertanyaan "bolehkah saya mengirim permintaan seperti ini?".

Sebuah permintaan dianggap *sederhana* (tanpa preflight) jika memenuhi semuanya:

- metodenya `GET`, `HEAD`, atau `POST`,
- tidak memakai header kustom (selain beberapa header standar),
- jika memakai `Content-Type`, nilainya hanya `application/x-www-form-urlencoded`, `multipart/form-data`, atau `text/plain`.

Karena itu, `fetch` yang mengirim JSON dengan `Content-Type: application/json`, atau memakai metode `PUT`, `PATCH`, `DELETE`, atau header `Authorization`, **akan memicu preflight**:

```javascript
fetch('https://api.contoh.id/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },   // memicu preflight
  body: JSON.stringify({ nama: 'Andu' })
});
```

Server harus menjawab preflight dengan header yang menyebut metode dan header apa yang diizinkan. Kalau tidak, permintaan aslinya tidak pernah dikirim.

## Contoh server Node.js

Berikut server kecil tanpa framework yang hanya mengizinkan satu origin tertentu:

```javascript
const http = require('http');

const IZIN = ['https://andu.my.id'];   // daftar origin yang dipercaya

http.createServer((req, res) => {
  const origin = req.headers.origin;

  if (IZIN.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  // Menjawab preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');   // browser boleh menyimpan 10 menit
    res.statusCode = 204;
    return res.end();
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ halo: 'dunia' }));
}).listen(3111);
```

Uji dengan `curl` sambil meniru header `Origin` yang dikirim browser:

```bash
# Origin yang diizinkan
curl -i -H "Origin: https://andu.my.id" localhost:3111
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: https://andu.my.id
# Vary: Origin

# Origin asing: header izin tidak dikirim, browser akan memblokir
curl -i -H "Origin: https://jahat.example" localhost:3111
# HTTP/1.1 200 OK   (tanpa Access-Control-Allow-Origin)

# Preflight
curl -i -X OPTIONS -H "Origin: https://andu.my.id" \
     -H "Access-Control-Request-Method: POST" localhost:3111
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: https://andu.my.id
# Access-Control-Allow-Methods: GET, POST, OPTIONS
# Access-Control-Allow-Headers: Content-Type
# Access-Control-Max-Age: 600
```

Perhatikan bahwa pada contoh origin asing, server tetap menjawab `200 OK`. Server tidak menolak permintaannya; hanya browser yang nanti menahan respons dari skrip. Ini mengonfirmasi poin kedua di atas.

Tiga detail penting pada kode itu:

- **Origin dicocokkan dengan daftar**, lalu dipantulkan kembali. Header ini hanya boleh berisi satu origin, jadi tidak bisa ditulis berupa daftar.
- **`Vary: Origin`** memberi tahu cache bahwa jawaban berbeda untuk origin berbeda. Tanpa ini, cache bersama bisa menyajikan header yang salah ke origin lain.
- **`Access-Control-Max-Age`** mengurangi jumlah preflight berulang.

<!-- TAMBAHKAN: pengalaman Anda memperbaiki CORS pada proyek nyata, misalnya server yang dulu lupa menjawab OPTIONS (tanpa alamat produksi asli). -->

## Cookie dan kredensial

Secara bawaan, `fetch` lintas origin tidak mengirim cookie. Jika Anda memang membutuhkannya:

```javascript
fetch('https://api.contoh.id/profil', { credentials: 'include' });
```

Server lalu wajib menambahkan `Access-Control-Allow-Credentials: true`, dan pada kondisi ini `Access-Control-Allow-Origin` **tidak boleh `*`**. Harus berupa origin spesifik. Mengirim kredensial lintas origin menambah risiko, jadi pakai hanya jika benar-benar perlu dan baca dulu [Login Aman untuk Aplikasi Web Statis]({{ site.baseurl }}/blog/2026/10/17/login-aman-aplikasi-web-statis/).

## Cara memperbaiki galat CORS

Berikut urutan berpikir yang efektif:

1. **Buka tab Network** di DevTools dan lihat permintaan yang gagal, termasuk preflight `OPTIONS`. Panduannya ada di [Chrome DevTools untuk Debugging Aplikasi Web]({{ site.baseurl }}/blog/2026/10/17/chrome-devtools-debugging-aplikasi-web/).
2. **Cek apakah server mengirim `Access-Control-Allow-Origin`** dengan nilai yang cocok persis dengan origin halaman Anda (skema, host, dan port).
3. **Jika ada preflight**, pastikan server menjawab `OPTIONS` dengan status 2xx beserta header metode dan header yang diizinkan.
4. **Jika Anda tidak memegang server**, jangan mencoba menyiasati dari browser. Gunakan perantara di server Anda sendiri (proxy) yang memanggil API itu, lalu halaman Anda memanggil proxy tersebut dari origin yang sama.

### Catatan untuk Google Apps Script

Web app Apps Script tidak bisa menjawab permintaan `OPTIONS` dengan header kustom. Praktik yang umum dipakai adalah mengirim permintaan `POST` sebagai *permintaan sederhana* dengan `Content-Type: text/plain`, lalu membaca isinya sebagai JSON di sisi skrip, sehingga preflight tidak terpicu. Konteks lengkapnya ada di [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/blog/2026/10/09/backend-gratis-google-apps-script-sheets/). Pastikan Anda menguji perilaku ini pada web app yang Anda terapkan sendiri, karena kebijakan Google bisa berubah.

## Yang bukan solusi

- **Mode `no-cors` pada `fetch`.** Ini tidak membuka akses; hasilnya respons "opaque" yang isinya tidak bisa dibaca skrip Anda.
- **Ekstensi browser pengaktif CORS.** Hanya mengubah browser Anda, bukan pengguna Anda. Cocok untuk eksperimen lokal, bukan untuk produksi.
- **Proxy publik pihak ketiga** untuk data sensitif. Data Anda lewat server orang lain.
- **Membuka `file://` langsung dari berkas.** Origin-nya dianggap `null`, sehingga perilakunya membingungkan. Jalankan server lokal, misalnya dengan `npx serve`.

## CORS bukan alat keamanan API

Ini kesalahpahaman paling berbahaya. CORS **hanya** membatasi apa yang boleh dibaca skrip di browser. Siapa pun tetap bisa memanggil API Anda dari `curl`, skrip, atau server lain, karena aturannya tidak berlaku di sana. Maka:

- Lindungi data dengan **autentikasi dan otorisasi di server**, bukan dengan menyembunyikan alamat API atau mengandalkan CORS.
- Jangan menaruh kunci rahasia di kode sisi klien. Alasannya dibahas di [Mengamankan API Key AI di Aplikasi]({{ site.baseurl }}/blog/2026/10/09/mengamankan-api-key-ai-di-aplikasi/).
- Validasi semua masukan di server, sebagaimana di [REST API Dasar]({{ site.baseurl }}/blog/2026/10/26/rest-api-dasar-http-json-status-kode/).

## Kesalahan yang sering terjadi

- **Mencoba memperbaiki CORS di kode `fetch`.** Perbaikannya ada di server.
- **Memakai `Access-Control-Allow-Origin: *` untuk API yang berisi data pribadi.** Wildcard cocok hanya untuk data yang memang publik.
- **Memantulkan header `Origin` apa adanya tanpa memeriksa daftar.** Itu sama saja mengizinkan semua orang, termasuk bersama kredensial.
- **Lupa menjawab `OPTIONS`**, sehingga preflight gagal padahal metode `POST` sudah diizinkan.
- **Salah mencocokkan origin**: lupa port, memakai `http` padahal situs `https`, atau garis miring di akhir alamat.
- **Mengira galat CORS berarti server mati.**
- **Mengandalkan CORS sebagai pengganti autentikasi.**

## Kesimpulan

CORS adalah cara server memberi tahu browser siapa yang boleh membaca responsnya. Ingat tiga hal: ia diterapkan oleh **browser**, perbaikannya dilakukan di **server** dengan daftar origin yang dipercaya, dan ia **bukan** pengganti autentikasi. Jika Anda menemui galat CORS berikutnya, buka tab Network, periksa header `Access-Control-Allow-Origin` dan preflight `OPTIONS`, lalu perbaiki dari sisi yang menyediakan data.
