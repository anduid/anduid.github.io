---
layout: post
title: "Menambahkan Pencarian Cepat ke Blog Statis dengan JavaScript"
description: "Cara membuat fitur pencarian di blog Jekyll tanpa server: indeks JSON dibuat saat build, pencarian dijalankan di peramban dengan peringkat dan pemuatan malas."
date: 2026-10-09 14:45:00 +0700
tags: [jekyll, javascript, blog, tutorial]

# image: /assets/images/pencarian-blog-statis.png
# image_alt: Alur pencarian di blog statis dari indeks JSON ke hasil di peramban
---
<!-- CATATAN PENULIS (tidak tampil di situs): tulisan ini memakai fitur pencarian yang sudah ada di blog Anda. Uji kode di blog Anda, dan tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Hapus published: false saat selesai. -->

Blog statis seperti Jekyll tidak punya server atau basis data, jadi tidak ada fitur pencarian bawaan. Padahal begitu tulisan mulai banyak, pembaca butuh cara cepat menemukan yang mereka cari. Kabar baiknya, pencarian bisa dibuat sepenuhnya di sisi peramban tanpa layanan tambahan.

<!-- TAMBAHKAN (1-2 kalimat): alasan Anda menambahkan pencarian ke blog Anda. -->

Idenya sederhana: saat blog dibangun, Jekyll membuat sebuah berkas indeks berisi semua tulisan. Saat pengunjung mengetik, JavaScript membaca indeks itu dan menyaringnya. Tulisan ini membahas cara membuatnya, lalu menambahkan peringkat hasil, pemuatan malas, dan perhatian pada aksesibilitas.

<!--more-->

## Cara kerjanya

Ada dua bagian:

1. **Indeks.** Berkas `search.json` yang dibuat Jekyll saat build, berisi judul, alamat, tanggal, ringkasan, dan isi setiap tulisan.
2. **Halaman pencarian.** Halaman dengan kolom input dan JavaScript yang mengunduh indeks, mencocokkan kata kunci, lalu menampilkan hasil.

Karena semuanya berjalan di peramban, tidak ada biaya server dan pencarian terasa instan.

## Langkah 1: membuat indeks dengan Jekyll

Buat berkas `search.json` di akar repo. Jekyll akan mengisinya dengan data tulisan saat build. Kode Liquid berikut menghasilkan larik JSON:

{% raw %}
```liquid
---
layout: null
---
[{% for post in site.posts %}{
  "title": {{ post.title | jsonify }},
  "url": {{ post.url | relative_url | jsonify }},
  "date": "{{ post.date | date: '%Y-%m-%d' }}",
  "excerpt": {{ post.excerpt | strip_html | strip_newlines | truncate: 160 | jsonify }},
  "content": {{ post.content | strip_html | strip_newlines | jsonify }}
}{% unless forloop.last %},{% endunless %}{% endfor %}]
```
{% endraw %}

Filter `jsonify` memastikan teks aman dimasukkan ke JSON, dan `strip_html` membuang tag HTML dari isi. Front matter dengan `layout: null` membuat berkas ini dihasilkan apa adanya, tanpa dibungkus layout.

## Langkah 2: membuat halaman pencarian

Buat halaman dengan kolom input, area status, dan daftar hasil. Beri label pada input dan tandai area status sebagai `aria-live` supaya pembaca layar mengumumkan jumlah hasil:

{% raw %}
```html
---
layout: page
title: Cari Tulisan
permalink: /cari/
noindex: true
---
<label for="kolom-cari">Kata kunci</label>
<input id="kolom-cari" type="search" placeholder="Ketik judul atau kata kunci" autocomplete="off">
<p id="status-cari" aria-live="polite"></p>
<ul id="hasil-cari"></ul>
<script>window.URL_INDEKS = "{{ '/search.json' | relative_url }}";</script>
<script src="{{ '/assets/js/cari.js' | relative_url }}" defer></script>
```
{% endraw %}

Halaman pencarian sebaiknya diberi `noindex` supaya hasil pencarian internal tidak masuk ke indeks mesin pencari.

## Langkah 3: JavaScript pencarian

Berikut inti berkas `assets/js/cari.js`. Fungsi `normalisasi` menurunkan huruf dan membuang tanda aksen, sehingga "Cafe" dan "café" cocok. Fungsi `skor` memberi nilai lebih tinggi untuk kecocokan di judul daripada di isi:

```js
const kolom = document.getElementById('kolom-cari');
const daftar = document.getElementById('hasil-cari');
const status = document.getElementById('status-cari');
let indeks = [];
let siap = false;

function normalisasi(teks) {
  return String(teks).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

async function muatIndeks() {
  if (siap) return;
  const res = await fetch(window.URL_INDEKS);
  const data = await res.json();
  indeks = data.map(function (p) {
    return Object.assign({}, p, {
      judulN: normalisasi(p.title),
      isiN: normalisasi(p.content)
    });
  });
  siap = true;
}

function skor(p, kata) {
  let total = 0;
  for (const k of kata) {
    const diJudul = p.judulN.includes(k);
    const diIsi = p.isiN.includes(k);
    if (!diJudul && !diIsi) return 0;
    total += (diJudul ? 5 : 0) + (diIsi ? 1 : 0);
  }
  return total;
}

function cari(q) {
  const kata = normalisasi(q).trim().split(/\s+/).filter(Boolean);
  if (!kata.length) return [];
  return indeks
    .map(function (p) { return { p: p, s: skor(p, kata) }; })
    .filter(function (x) { return x.s > 0; })
    .sort(function (a, b) { return b.s - a.s; })
    .map(function (x) { return x.p; });
}

function tampilkan(hasil, q) {
  status.textContent = !q.trim() ? '' :
    hasil.length ? hasil.length + ' tulisan ditemukan' : 'Tidak ada tulisan yang cocok.';
  daftar.innerHTML = hasil.map(function (p) {
    return '<li><a href="' + esc(p.url) + '">' + esc(p.title) + '</a>' +
           '<br><small>' + esc(p.date) + ' · ' + esc(p.excerpt) + '</small></li>';
  }).join('');
}

let timer;
kolom.addEventListener('input', function () {
  clearTimeout(timer);
  timer = setTimeout(async function () {
    await muatIndeks();
    tampilkan(cari(kolom.value), kolom.value);
  }, 150);
});
```

Beberapa keputusan penting di kode ini:

- **Semua kata harus ada.** Tulisan hanya muncul jika setiap kata kunci ditemukan di judul atau isi.
- **Peringkat sederhana.** Kecocokan di judul bernilai lima kali lipat, sehingga tulisan yang judulnya relevan naik ke atas.
- **Debounce.** Pencarian baru dijalankan 150 milidetik setelah pengguna berhenti mengetik, supaya tidak berat.
- **Pemuatan malas.** Indeks baru diunduh saat pengguna mulai mengetik, bukan saat halaman dibuka.
- **Keamanan keluaran.** Fungsi `esc` mengubah karakter khusus agar judul atau ringkasan tidak disisipkan sebagai HTML mentah.

<!-- TAMBAHKAN: kendala yang Anda temui saat membuat pencarian di blog Anda, misalnya soal alamat indeks dengan baseurl. -->

## Menjaga ukuran indeks tetap kecil

Indeks berisi seluruh isi tulisan, jadi ukurannya tumbuh seiring jumlah tulisan. Untuk blog dengan puluhan tulisan, ini tidak masalah. Jika mulai terasa berat:

- **Potong isi**, misalnya hanya 1.000 karakter pertama tiap tulisan, dengan filter `truncate` di Liquid.
- **Hanya indeks judul, tag, dan ringkasan**, tanpa isi lengkap.
- **Kompres.** GitHub Pages menyajikan berkas dengan kompresi, jadi ukuran yang dikirim jauh lebih kecil dari ukuran aslinya.
- **Pakai pustaka khusus.** Untuk situs yang sangat besar, pertimbangkan pustaka seperti lunr.js atau Pagefind. Pagefind membuat indeks setelah build, sehingga di GitHub Pages perlu alur kerja build kustom.

## Aksesibilitas dan pengalaman pengguna

Hal-hal kecil ini membuat pencarian nyaman dipakai semua orang:

- Beri `label` yang terhubung ke input.
- Gunakan `aria-live` untuk mengumumkan jumlah hasil.
- Pastikan kolom input bisa difokuskan dengan keyboard dan mudah ditemukan di menu.
- Tampilkan pesan jelas saat tidak ada hasil, jangan biarkan halaman kosong.
- Sediakan tautan ke halaman pencarian di header.

## Kesalahan yang sering terjadi

- **`search.json` kosong atau salah alamat.** Pastikan `relative_url` dipakai, terutama jika blog berada di subfolder seperti `/blog/`.
- **Karakter khusus merusak JSON.** Selalu gunakan `jsonify`.
- **Tulisan draf ikut terindeks.** Draf berstatus `published: false` tidak dimasukkan Jekyll, jadi pastikan statusnya benar.
- **Tidak ada `noindex` di halaman pencarian**, sehingga halaman hasil kosong bisa terindeks mesin pencari.

## Kesimpulan

Pencarian di blog statis tidak butuh server. Jekyll membuat indeks saat build, JavaScript menyaringnya di peramban, dan beberapa penyempurnaan seperti peringkat judul, debounce, dan pemuatan malas membuatnya terasa cepat. Mulailah dari versi sederhana ini, lalu pindah ke pustaka khusus hanya jika blog Anda tumbuh sangat besar.

Untuk membangun blog dari awal, baca [Membuat Blog di GitHub Pages dengan Jekyll dan Domain Sendiri]({{ site.baseurl }}/2026/10/09/blog-github-pages-jekyll-domain-sendiri/).
