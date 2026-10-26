---
layout: post
title: "REST API Dasar: Metode HTTP, Status Kode, dan JSON dengan Contoh Server Node.js"
description: "Memahami REST API dari dasar: metode GET, POST, PUT, PATCH, DELETE, status kode HTTP, format JSON, validasi, dan contoh server Node.js tanpa framework yang sudah diuji."
date: 2026-10-26 02:30:00 +0700
tags: [api, rest, http, nodejs, pemrograman]

# image: /assets/images/rest-api-dasar.png
# image_alt: Alur permintaan dan respons antara klien dan server REST API
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan server contoh di komputer Anda dan coba dengan curl, lalu tambahkan pengalaman Anda membuat atau memakai API di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Hampir semua aplikasi modern bicara lewat API: aplikasi Android mengambil data dari server, halaman web mengirim formulir, dan layanan saling bertukar informasi. Gaya yang paling umum adalah **REST API** di atas protokol HTTP dengan data berformat JSON. Memahami dasarnya membuat Anda lebih mudah membangun, memakai, dan men-debug layanan apa pun.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memakai atau membuat API dan hal yang awalnya membingungkan. -->

Tulisan ini menjelaskan konsep intinya, lalu membangun server kecil dengan Node.js murni (tanpa framework) dan mengujinya dengan `curl`.

<!--more-->

## Gambaran: klien meminta, server menjawab

Setiap interaksi terdiri dari **permintaan** (*request*) dan **respons**:

- Permintaan memuat **metode** (apa yang dilakukan), **alamat** (sumber daya yang dituju), **header**, dan kadang **isi** (*body*).
- Respons memuat **status kode** (hasil), **header**, dan isi, biasanya JSON.

REST berpusat pada **sumber daya** (*resource*): benda yang dikelola, seperti catatan, usaha, atau pengguna. Alamatnya memakai kata benda jamak: `/catatan` untuk koleksi dan `/catatan/2` untuk satu item.

## Metode HTTP

| Metode | Fungsi | Contoh |
|--------|--------|--------|
| `GET` | Membaca data | `GET /catatan` |
| `POST` | Membuat data baru | `POST /catatan` |
| `PUT` | Mengganti seluruh data | `PUT /catatan/2` |
| `PATCH` | Mengubah sebagian data | `PATCH /catatan/2` |
| `DELETE` | Menghapus data | `DELETE /catatan/2` |

`GET` tidak boleh mengubah data di server. Itu sebabnya alamat `GET` aman disimpan dan dibuka ulang. Sebaliknya, aksi yang mengubah data memakai `POST`, `PUT`, `PATCH`, atau `DELETE`.

## Status kode HTTP

Angka tiga digit di respons memberi tahu hasilnya. Cukup hafal kelompoknya:

- **2xx**: berhasil. `200 OK`, `201 Created` (data baru dibuat), `204 No Content` (berhasil tanpa isi).
- **4xx**: kesalahan dari klien. `400 Bad Request` (permintaan tidak valid), `401 Unauthorized` (belum login), `403 Forbidden` (tidak berhak), `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity` (isi valid secara format tetapi gagal validasi), `429 Too Many Requests`.
- **5xx**: kesalahan di server. `500 Internal Server Error`.

Memakai status kode yang tepat membuat klien bisa bereaksi dengan benar tanpa membaca pesan teks. Hindari mengirim `200` untuk semua hal lalu menyelipkan `"gagal"` di isi.

## JSON: format pertukaran data

```json
{
  "id": 2,
  "judul": "Belajar API",
  "selesai": false
}
```

Kunci dan nilai teks wajib memakai tanda kutip ganda. Klien yang mengirim JSON harus memberi header `Content-Type: application/json`, dan server membalas dengan header yang sama.

## Server contoh dengan Node.js

Server berikut hanya memakai modul bawaan `http`. Ia menyimpan catatan di memori (hilang saat server dimatikan), cukup untuk belajar:

```js
const http = require('http');

const catatan = [{ id: 1, judul: 'Belanja', selesai: false }];
let idBerikut = 2;

function kirim(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(data === undefined ? '' : JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // GET /catatan : daftar semua catatan
  if (req.method === 'GET' && url.pathname === '/catatan') {
    return kirim(res, 200, catatan);
  }

  // POST /catatan : buat catatan baru
  if (req.method === 'POST' && url.pathname === '/catatan') {
    let isi = '';
    req.on('data', (b) => { isi += b; if (isi.length > 1e6) req.destroy(); });
    req.on('end', () => {
      let data;
      try { data = JSON.parse(isi); }
      catch (e) { return kirim(res, 400, { galat: 'JSON tidak valid' }); }

      if (typeof data.judul !== 'string' || !data.judul.trim()) {
        return kirim(res, 422, { galat: 'judul wajib diisi' });
      }
      const baru = { id: idBerikut++, judul: data.judul.trim(), selesai: false };
      catatan.push(baru);
      res.setHeader('Location', '/catatan/' + baru.id);
      kirim(res, 201, baru);
    });
    return;
  }

  // DELETE /catatan/:id : hapus satu catatan
  const m = url.pathname.match(/^\/catatan\/(\d+)$/);
  if (m && req.method === 'DELETE') {
    const i = catatan.findIndex((c) => c.id === Number(m[1]));
    if (i === -1) return kirim(res, 404, { galat: 'tidak ditemukan' });
    catatan.splice(i, 1);
    return kirim(res, 204);
  }

  kirim(res, 404, { galat: 'rute tidak ada' });
});

server.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
```

Simpan sebagai `server.js` lalu jalankan dengan `node server.js`. Server ini membatasi ukuran isi permintaan, memvalidasi masukan, dan memakai status kode yang tepat.

## Mengujinya dengan curl

Di terminal lain:

```bash
# Baca daftar
curl -i http://localhost:3000/catatan

# Buat catatan baru
curl -i -X POST http://localhost:3000/catatan \
  -H "Content-Type: application/json" \
  -d '{"judul":"Belajar API"}'

# Kirim data tidak valid
curl -i -X POST http://localhost:3000/catatan \
  -H "Content-Type: application/json" \
  -d '{"judul":""}'

# Hapus
curl -i -X DELETE http://localhost:3000/catatan/2
```

Hasil yang diharapkan, sudah saya uji dengan server di atas (nilai port mengikuti pengaturan Anda):

| Permintaan | Respons |
|------------|---------|
| `GET /catatan` | `200 OK` dan daftar JSON |
| `POST` dengan judul valid | `201 Created`, header `Location: /catatan/2`, dan objek baru |
| `POST` dengan judul kosong | `422 Unprocessable Entity` dan `{"galat":"judul wajib diisi"}` |
| `POST` dengan isi bukan JSON | `400 Bad Request` |
| `DELETE /catatan/2` | `204 No Content` |
| `DELETE /catatan/99` | `404 Not Found` |

<!-- TAMBAHKAN: tangkapan layar hasil curl atau Postman dari percobaan Anda sendiri. -->

## Memanggil API dari halaman web

```js
async function ambilCatatan() {
  const res = await fetch('http://localhost:3000/catatan');
  if (!res.ok) throw new Error('Gagal: ' + res.status);
  return res.json();
}
```

Jika halaman dan server berada di asal berbeda, peramban menerapkan aturan **CORS**, sehingga server harus mengirim header `Access-Control-Allow-Origin` yang sesuai. Pembahasan galat dan cara memeriksanya di panel Network ada di [Chrome DevTools untuk Debugging Aplikasi Web]({{ site.baseurl }}/2026/10/17/chrome-devtools-debugging-aplikasi-web/), dan dasar `fetch` serta `async/await` di [JavaScript Modern untuk Pemula]({{ site.baseurl }}/2026/10/26/javascript-modern-dasar-es6-async-await/).

## Praktik baik merancang API

- **Alamat berupa kata benda**, bukan kata kerja: `/catatan`, bukan `/ambilCatatan`.
- **Gunakan metode dan status kode yang tepat.**
- **Format galat yang konsisten**, misalnya `{ "galat": "pesan" }`, tanpa membocorkan detail internal seperti jejak tumpukan.
- **Paginasi** untuk daftar besar: `GET /catatan?halaman=2&batas=20`.
- **Versi API** di alamat jika kelak berubah: `/v1/catatan`.
- **Validasi semua masukan di server.** Jangan percaya klien.
- **Otentikasi dan otorisasi di server**, dengan token pada header `Authorization`, bukan kata sandi di kode klien. Lihat [Login yang Aman di Aplikasi Web Statis]({{ site.baseurl }}/2026/10/17/login-aman-aplikasi-web-statis/).
- **Batasi laju permintaan** untuk mencegah penyalahgunaan.
- **Dokumentasikan** setiap rute: metode, alamat, parameter, contoh permintaan dan respons.

## Kesalahan yang sering terjadi

- **Mengirim `200` untuk semua hasil**, termasuk galat.
- **Memakai `GET` untuk aksi yang mengubah data.**
- **Tidak memvalidasi masukan**, sehingga data rusak atau celah keamanan masuk.
- **Membocorkan pesan galat internal** ke klien.
- **Lupa header `Content-Type`** sehingga server atau klien gagal membaca JSON.
- **Menyimpan data hanya di memori** pada server nyata. Data hilang saat server restart. Pakai basis data, seperti pada [SQL Dasar untuk Pemula]({{ site.baseurl }}/2026/10/26/sql-dasar-select-join-group-by/).

## Kesimpulan

REST API pada dasarnya adalah kesepakatan sederhana: sumber daya diakses lewat alamat, aksi dinyatakan lewat metode HTTP, hasil diberi tahu lewat status kode, dan data dipertukarkan sebagai JSON. Bangun server kecil seperti contoh di atas, uji dengan `curl`, lalu tambahkan basis data dan otentikasi saat siap. Dasar ini berlaku di bahasa dan kerangka kerja apa pun.
