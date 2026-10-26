# Panduan migrasi satu kali: dari dua repo menjadi satu situs Jekyll

Lama pengerjaan sekitar 20 menit. Situs lama tetap online sampai build baru berhasil.

## 0. Cadangkan
Unduh ZIP kedua repo lama (Code > Download ZIP). Anda sudah memilikinya.

## 1. Unggah berkas ke repo `anduid/anduid.github.io`

Cara paling aman: pakai **branch** terpisah supaya bisa diuji sebelum tayang.

1. Di repo `anduid.github.io`: klik tombol branch > ketik `integrasi` > *Create branch*.
2. Pada branch `integrasi`: *Add file > Upload files*, seret **seluruh isi** folder `situs/` dari ZIP ini
   (termasuk folder `.github`, `_apps`, `_posts`, `tools`, dst). Jika folder `.github` tidak ikut terunggah,
   buat manual lewat *Add file > Create new file* dengan nama `.github/workflows/situs.yml` lalu tempel isinya.
3. Biarkan GitHub menimpa `index.html` dan `robots.txt`. **Jangan hapus** berkas lama lain:
   18 aplikasi `.html`, `CNAME`, `ads.txt`, `BingSiteAuth.xml`, dan berkas `google-site-verification=...txt`
   tetap dipakai dan tidak perlu diunggah ulang.
4. *Commit changes*, lalu buka **Pull request** dari `integrasi` ke `main`.
5. Tunggu workflow "Bangun dan terbitkan situs" selesai di PR (centang hijau). Pada PR, situs hanya dibangun dan
   diperiksa, **belum diterbitkan**. Buka run-nya untuk membaca anotasi kuning/merah bila ada.

### Penting: bawa SEMUA tulisan terbaru
Folder `_posts/` di ZIP ini berisi 45 tulisan (37 dari salinan awal ditambah 8 tulisan 26 Oktober). Jika sejak itu Anda menambah
tulisan lain di repo `blog`, **salin juga ke `_posts/`** sebelum merge, dan ganti tautan `{{ site.baseurl }}/20...` di dalamnya menjadi
`{{ site.baseurl }}/blog/20...`. Ke depannya, setiap tulisan baru cukup diunggah ke `_posts/` di repo ini; sitemap, beranda,
dan tulisan terkait diperbarui otomatis.

## 2. Ubah sumber GitHub Pages
Repo `anduid.github.io` > **Settings > Pages > Build and deployment > Source: GitHub Actions**.
Kolom *Custom domain* tetap `andu.my.id` dan *Enforce HTTPS* tetap aktif.

## 3. Terbitkan
Merge Pull request. Workflow berjalan lagi di `main` dan kali ini menerbitkan. Setelah hijau, cek:

- https://andu.my.id/ (beranda, ada bagian "Catatan & Tulisan Terbaru", chip aplikasi terisi)
- https://andu.my.id/aplikasi/ dan salah satu halaman aplikasi, misal /aplikasi/progita/
- https://andu.my.id/sitemap.xml dan https://andu.my.id/robots.txt
- https://andu.my.id/progita (aplikasi lama masih terbuka normal)

## 4. Matikan blog lama
Repo `blog` > Settings > Pages > **Unpublish site** (atau arsipkan repo-nya). Selama masih terbit, repo lama bisa
menutupi `/blog/` milik situs baru. Setelah itu buka https://andu.my.id/blog/ dan satu tulisan lama; alamat tulisan
**tidak berubah** (`/blog/2026/10/09/...`), jadi tidak ada tautan yang putus.

## 5. Search Console dan Bing
1. Google Search Console > Sitemaps > kirim `https://andu.my.id/sitemap.xml`.
2. Hapus sitemap lama `https://andu.my.id/blog/sitemap.xml` dari daftar (sudah tidak ada).
3. URL Inspection > beranda, hub `/aplikasi/`, dan 2-3 halaman aplikasi > *Request indexing*.
4. Ulangi pengiriman sitemap di Bing Webmaster Tools.

## Yang saya ubah pada berkas Anda
- `index.html`: ditambah front matter Jekyll; chip aplikasi kini otomatis dari `_apps/`; ditambah bagian blog,
  tautan Aplikasi/Blog di menu desktop dan footer, ikon situs, canonical `https://andu.my.id/`, dan gambar OG milik
  sendiri (`og-studio.png`) menggantikan foto Unsplash. Bilah bawah ponsel kini berisi tautan Aplikasi dan Blog
  (teks "andu.my.id" di bilah itu dihapus karena merek sudah tampil di header). Seluruh teks marketing asli tidak diubah.
- `robots.txt`: sitemap menunjuk `/sitemap.xml`.
- Berkas aplikasi di repo: **tidak diubah sama sekali**. Tag SEO ditanam hanya pada salinan di hasil build.
- `blog/privasi.md`: front matter-nya tidak valid YAML (tanda `:` tanpa kutip di `description`), sehingga halaman
  Kebijakan Privasi kemungkinan tampil rusak. Sudah diperbaiki. Penting untuk persetujuan AdSense.
- **CV baru di `/profil/`** (`profil/index.html`, dari `profile.html` Anda): ditambah tag SEO, data terstruktur Person, tautan ke Blog/Aplikasi,
  dan teks cadangan untuk pengunjung tanpa JavaScript. Beranda memuat bagian "Di balik andu.my.id" dan menu Profil; kotak penulis di tiap tulisan menaut ke sana.
- **Tautan antar-tulisan diperbaiki** di 42 dari 45 tulisan: `{{ site.baseurl }}/2026/...` menjadi `{{ site.baseurl }}/blog/2026/...` (106 tautan). Tiga tautan
  yang menunjuk tanggal salah (`10/09/panduan-digitalisasi...`, seharusnya `10/10`) juga dibetulkan. Satu bug kode pada tulisan Python (`rekap_aman`) dan satu salah ketik diperbaiki.
- Tiga tulisan diberi `apps:` (arsip, peta UMKM, localStorage). Tulisan lain tidak diubah.

## Keputusan yang bisa Anda balik
- `umkm.html` (animasi 3D tanpa judul/teks) saya sembunyikan: `published: false` di `_apps/umkm.md`.
- Lima aplikasi yang sebelumnya tidak ada di beranda (seoandu, seopc, pulsefeed, autorefresh, ldkosmk14) kini tampil
  di hub `/aplikasi/` tetapi **tidak** di chip beranda. Sembunyikan yang tidak ingin dipublikasikan dengan
  `published: false`.
